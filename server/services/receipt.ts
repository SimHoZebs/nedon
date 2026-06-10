import { createStructuredResponse } from "@/util/structuredResponse";

import { type ReceiptFormState, ReceiptFormStateSchema } from "@/types/receipt";

import { extractReceiptData } from "./ai";
import * as blobStorage from "./blobStorage";
import * as ocr from "./OCR";

import { Prisma } from "@prisma/client";
import db from "server/util/db";
import { z } from "zod";

export const createReceipt = async (input: {
  id: string;
  receipt: ReceiptFormState;
}) => {
  const { items, id: _id, txId: _txId, ...receiptWithoutItems } = input.receipt;

  if (!items) {
    throw new Error("No items in receipt");
  }

  const updatedTx = await db.tx.update({
    where: {
      id: input.id,
    },
    data: {
      receipt: {
        create: {
          ...receiptWithoutItems,
          subtotal: new Prisma.Decimal(receiptWithoutItems.subtotal),
          tax: new Prisma.Decimal(receiptWithoutItems.tax),
          tip: new Prisma.Decimal(receiptWithoutItems.tip),
          grand_total: new Prisma.Decimal(receiptWithoutItems.grand_total),
          items: {
            createMany: {
              data: items.map(({ id, receiptId, unit_price, ...item }) => ({
                ...item,
                id: undefined,
                receiptId: undefined,
                unit_price: new Prisma.Decimal(unit_price),
              })),
            },
          },
        },
      },
    },
    include: {
      receipt: {
        include: {
          items: true,
        },
      },
    },
  });

  return updatedTx.receipt;
};

export const processReceipt = async (path: string) => {
  const sr = createStructuredResponse<ReceiptFormState>({
    success: false,
    data: undefined,
    clientMsg:
      "We received your image, but failed to process it. It is either not a receipt or we failed to recognize it. Try again with the same or clearer image or contact support.",
    devMsg: "",
  });

  try {
    const signedUrlData = await blobStorage.getSignedUrl(path, 60);

    const annotationResult = await ocr.getTextFromImage(
      signedUrlData.signedUrl,
    );

    if (annotationResult.error || !annotationResult.text) {
      sr.clientMsg =
        "We received your image, but we found no text on it. Try again with a clearer image or contact support.";
      sr.devMsg =
        annotationResult.raw ?? annotationResult.error ?? "No text found";
      console.error(sr);
      return sr;
    }

    const receiptJson = await extractReceiptData(annotationResult.text);

    try {
      const parsedReceipt = ReceiptFormStateSchema.safeParse(receiptJson);

      if (parsedReceipt.success) {
        sr.success = true;
        sr.data = parsedReceipt.data;
        sr.clientMsg = "Receipt processed successfully.";
        sr.devMsg = "";
        return sr;
      }

      //Rarely, the receipt is in a different shape.
      const FallbackReceiptSchema = z.object({
        properties: ReceiptFormStateSchema,
      });

      const parsedFallbackReceipt =
        FallbackReceiptSchema.safeParse(receiptJson);

      if (parsedFallbackReceipt.success) {
        sr.success = true;
        sr.data = parsedFallbackReceipt.data.properties;
        sr.clientMsg = "Receipt processed successfully.";
        sr.devMsg = "";
        return sr;
      }

      if (parsedReceipt.error) {
        sr.devMsg = `Receipt parsing failed ${JSON.stringify(
          parsedReceipt.error,
          null,
          2,
        )}`;
        console.error(sr);
        return sr;
      }

      //Hopefully this never happens
      sr.devMsg = `Unrecognized JSON shape: ${JSON.stringify(
        receiptJson,
        null,
        2,
      )}`;
      console.error(sr);
      return sr;
    } catch (e) {
      console.error("JSON.parse failed on AI response", e);
      sr.devMsg = `Failed to parse AI response: ${JSON.stringify(
        e,
        null,
        2,
      )}. Response was: ${JSON.stringify(receiptJson, null, 2)}`;
      console.error(sr);
      return sr;
    }
  } catch (e) {
    console.error("Error processing receipt", e);
    if (e instanceof Error) {
      sr.devMsg = e.message;
      if (e.message.includes("AI") || e.message.includes("OpenAI")) {
        sr.clientMsg =
          "We received your image, but failed to process it. The error seems to be on us. Try again or contact support.";
      }
    } else if (typeof e === "string") {
      sr.devMsg = e;
    }
    console.error(sr);
    return sr;
  }
};
