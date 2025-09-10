import db from "@/util/db";
import { createStructuredResponse } from "@/util/structuredResponse";

import { type UnsavedReceipt, UnsavedReceiptSchema } from "@/types/receipt";

import { procedure, router } from "../trpc";

import { imgAnnotator } from "server/gcloudClient";
import openai from "server/openaiClient";
import supabase from "server/supabaseClient";
import { z } from "zod";

const receiptRouter = router({
  create: procedure
    .input(
      z.object({
        id: z.string(),
        receipt: UnsavedReceiptSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const { items, id, ...receiptWithoutItems } = input.receipt;

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
              items: {
                createMany: {
                  data: items,
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
    }),

  getSignedUploadUrl: procedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.storage
        .from("receipts")
        .createSignedUploadUrl(input.path);
      if (error) {
        throw new Error(`Failed to create signed upload URL: ${error.message}`);
      }
      return data;
    }),

  process: procedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      const sr = createStructuredResponse<UnsavedReceipt>({
        success: false,
        data: undefined,
        clientMsg:
          "We received your image, but failed to process it. It is either not a receipt or we failed to recognize it. Try again with the same or clearer image or contact support.",
        devMsg: "",
      });

      try {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("receipts")
            .createSignedUrl(input.path, 60);

        if (signedUrlError) {
          throw new Error(
            `Failed to create signed download URL: ${signedUrlError.message}`,
          );
        }

        const [result] = await imgAnnotator.textDetection(
          signedUrlData.signedUrl,
        );

        const textAnnotationArray = result.textAnnotations;
        if (!textAnnotationArray || textAnnotationArray.length < 0) {
          console.error(
            "No text annotations found. textAnnotationArray:",
            textAnnotationArray,
          );
          sr.clientMsg =
            "We received your image, but we found no text on it. Try again with a clearer image or contact support.";
          sr.devMsg = JSON.stringify(textAnnotationArray, null, 2);
          console.error(sr);
          return sr;
        }

        const thread = await openai.beta.threads.create();

        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: textAnnotationArray[0].description || "",
        });

        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
          assistant_id: "asst_ThX4O8JDzBsGV7BO43RA3FVE",
        });

        if (run.status !== "completed") {
          console.error("Run failed", run);
          sr.clientMsg =
            "We received your image, but failed to process it. The error seems to be on us. Try again or contact support.";
          sr.devMsg = `openai failed run. ${JSON.stringify(run, null, 2)}`;
          console.error(sr);
          return sr;
        }

        const message = (await openai.beta.threads.messages.list(run.thread_id))
          .data[0];

        if (message.content[0].type !== "text") {
          sr.clientMsg =
            "We received your image, but found no text on it. Try again with a clearer image or contact support.";
          sr.devMsg = JSON.stringify(message, null, 2);

          console.error(sr);
          return sr;
        }

        try {
          const receipt = JSON.parse(message.content[0].text.value);

          const parsedReceipt = UnsavedReceiptSchema.safeParse(receipt);

          if (parsedReceipt.success) {
            sr.success = true;
            sr.data = parsedReceipt.data;
            sr.clientMsg = "Receipt processed successfully.";
            sr.devMsg = "";
            return sr;
          }

          //Rarely, the receipt is in a different shape.
          if ("properties" in receipt) {
            sr.success = true;
            sr.data = receipt.properties as UnsavedReceipt;
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
            receipt,
            null,
            2,
          )}`;
          console.error(sr);
          return sr;
        } catch (e) {
          console.error("JSON.parse failed", e);
          sr.devMsg = JSON.stringify(e, null, 2);
          console.error(sr);
          return sr;
        }
      } catch (e) {
        console.error("Error processing receipt", e);
        if (e instanceof Error) {
          sr.devMsg = e.message;
        } else if (typeof e === "string") {
          sr.devMsg = e;
        }
        console.error(sr);
        return sr;
      }
    }),
});

export default receiptRouter;
