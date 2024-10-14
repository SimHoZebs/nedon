import Image from "next/image";
import React from "react";
import supabase from "server/supabaseClient";

import { ActionBtn } from "@/comp/Button";
import { H3 } from "@/comp/Heading";
import Input from "@/comp/Input";

import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";

import type { PureReceiptWithChildren } from "@/types/receipt";
import { isTxInDB } from "@/types/tx";
import { createStructuredResponse } from "@/types/types";

const Receipt = () => {
  const tx = useTxStore((state) => state.txOnModal);

  const createTx = trpc.tx.create.useMutation();
  const processReceipt = trpc.receipt.process.useMutation();
  const createReceipt = trpc.receipt.create.useMutation();
  const queryClient = trpc.useUtils();

  const [receiptImg, setReceiptImg] = React.useState<File>();
  const [receiptImgURL, setReceiptImgURL] = React.useState<string>();
  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const [progressMsg, setProgressMsg] = React.useState<string>("");

  // returns boolean based on success
  const uploadAndProcess = async () => {
    const sr = createStructuredResponse<PureReceiptWithChildren>({
      success: false,
      data: undefined,
      clientMsg: "Error uploading receipt",
      devMsg: "",
    });

    if (!tx || !receiptImg) {
      sr.devMsg = "No transaction to upload receipt to";
      return sr;
    }

    setProgressMsg("Uploading receipt...");
    const uploadResponse = await supabase.storage
      .from("receipts")
      .upload(tx.name, receiptImg, { upsert: true });
    console.log("receipt uploaded");

    if (uploadResponse.error) {
      console.error("Error uploading image", uploadResponse.error);
      sr.clientMsg = `Error uploading image: ${uploadResponse.error}`;
      sr.devMsg = "Error uploading image";
      return sr;
    }

    setProgressMsg("Getting signed URL...");
    const signedUrlResponse = await supabase.storage
      .from("receipts")
      .createSignedUrl(tx.name, 60);
    console.log("signed URL received");

    if (signedUrlResponse.error || !signedUrlResponse.data.signedUrl) {
      sr.devMsg = "Error getting signed URL";
      return sr;
    }

    setProgressMsg("Processing receipt...");
    const response = await processReceipt.mutateAsync({
      signedUrl: signedUrlResponse.data.signedUrl,
    });

    if (
      (response.data && !response.data.is_receipt) ||
      processReceipt.isError
    ) {
      sr.clientMsg =
        "Hmmm, this doesn't look like a receipt. If it is, try again with a clearer image.";
      sr.devMsg = response.devMsg + processReceipt.error;
      return sr;
    }

    console.log("receipt processed");

    const latestTx = tx.id ? tx : await createTx.mutateAsync(tx);

    if (!response.data) return response;

    setProgressMsg("Adding receipt to transaction...");

    if (!isTxInDB(latestTx)) {
      sr.devMsg = "latestTx is not FullTxInDB";
      return sr;
    }

    await createReceipt.mutateAsync({
      id: latestTx.id,
      receipt: response.data,
    });
    queryClient.tx.getAll.invalidate();
    setProgressMsg("");

    setReceiptImg(undefined);
    setReceiptImgURL(undefined);
    sr.success = true;
    sr.data = response.data;
    return sr;
  };

  const receiptSum =
    tx?.receipt?.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    ) || 0;

  return (
    <div>
      <H3>Receipt</H3>
      {!tx?.receipt && (
        <input
          type="file"
          capture="environment"
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files) {
              console.error("No file uploaded.");
              return;
            }
            setReceiptImg(undefined);
            setReceiptImgURL(undefined);
            setErrorMsg("");
            const img = e.target.files[0];
            setReceiptImg(img);
            setReceiptImgURL(URL.createObjectURL(img));
          }}
        />
      )}
      {(errorMsg || (receiptImg && !tx?.receipt)) && (
        <div className="flex flex-col">
          <ActionBtn
            onClickAsync={async () => {
              const result = await uploadAndProcess();
              if (!result.success) {
                setErrorMsg(result.clientMsg);
                setProgressMsg("");
              }
              setReceiptImg(undefined);
              setReceiptImgURL(undefined);
            }}
          >
            Upload
          </ActionBtn>
          <p className="text-red-400">{errorMsg}</p>
          <p>{progressMsg}</p>

          {receiptImgURL && (
            <Image src={receiptImgURL} alt="" width={300} height={500} />
          )}
        </div>
      )}

      {tx?.receipt?.id && (
        <table className="table-fixed border-separate border-spacing-1 sm:w-auto">
          {tx.receipt.items.map((item) => (
            <tr key={item.id}>
              <td>
                <Input
                  className="w-10 sm:w-10"
                  type="number"
                  value={item.quantity}
                />
              </td>
              <td>
                <Input className="w-full sm:w-48" value={item.name} />
              </td>
              <td className="flex">
                <p>$</p>
                <Input
                  className="w-20 sm:w-20"
                  type="number"
                  value={item.unit_price}
                />
              </td>
            </tr>
          ))}

          <tr>
            <td className="">
              <p>tip</p>
            </td>

            <td className="flex items-end gap-1">
              <Input
                className="w-20 sm:w-20"
                type="number"
                value={tx.receipt.tip}
              />
              <p className="text-xs">({(tx.receipt.tip * 100) / tx.amount}%)</p>
            </td>
          </tr>
          <tr>
            <td>
              <p>tax</p>
            </td>
            <td>
              <Input
                className="w-20 sm:w-20"
                type="number"
                value={tx.receipt.tax}
              />
            </td>
          </tr>
        </table>
      )}

      {tx?.amount && tx.receipt && (
        <p
          className={`h-5 text-pink-500 ${
            receiptSum !== tx.amount ? "" : "hidden"
          }`}
        >
          Receipt total is {receiptSum}, which is {tx.amount - receiptSum} off
          from this transaction. Adjust your receipt to match the amount.
        </p>
      )}
    </div>
  );
};

export default Receipt;
