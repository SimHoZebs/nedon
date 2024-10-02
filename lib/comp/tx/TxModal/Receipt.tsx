import Image from "next/image";
import React from "react";
import supabase from "server/supabaseClient";

import { H3 } from "@/comp/Heading";
import Input from "@/comp/Input";

import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";

import { type TxClientSide, isTxInDB } from "@/types/tx";
import { ActionBtn } from "@/comp/Button";
import { createStructuredResponse } from "@/types/types";
import type { PureReceiptWithChildren } from "@/types/receipt";

const Receipt = () => {
  const tx: TxClientSide | undefined = useTxStore((state) => state.txOnModal);

  const createTx = trpc.tx.create.useMutation();
  const refreshTxModalData = useTxStore((state) => state.refreshTxModalData);
  const processReceipt = trpc.receipt.process.useMutation();
  const createReceipt = trpc.receipt.create.useMutation();
  const queryClient = trpc.useUtils();

  const [receiptImg, setReceiptImg] = React.useState<File>();
  const [receiptImgURL, setReceiptImgURL] = React.useState<string>();
  const [errorMsg, setErrorMsg] = React.useState<string>("");

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

    console.log("uploading receipt...");
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

    console.log("getting signed URL...");
    const signedUrlResponse = await supabase.storage
      .from("receipts")
      .createSignedUrl(tx.name, 60);
    console.log("signed URL received");

    if (signedUrlResponse.error || !signedUrlResponse.data.signedUrl) {
      sr.devMsg = "Error getting signed URL";
      return sr;
    }

    console.log("processing receipt...");
    const response = await processReceipt.mutateAsync({
      signedUrl: signedUrlResponse.data.signedUrl,
    });

    console.log("receipt processed");

    const latestTx = tx.id ? tx : await createTx.mutateAsync(tx);

    if (!response.data) return response;

    console.log("creating receipt...");

    if (!isTxInDB(latestTx)) {
      sr.devMsg = "latestTx is not FullTxInDB";
      return sr;
    }

    const createdReceipt = await createReceipt.mutateAsync({
      id: latestTx.id,
      receipt: response.data,
    });
    console.log("receipt created", createdReceipt);

    refreshTxModalData({ ...latestTx, receipt: createdReceipt });
    queryClient.tx.getAll.invalidate();

    setReceiptImg(undefined);
    setReceiptImgURL(undefined);
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
              }
              setReceiptImg(undefined);
              setReceiptImgURL(undefined);
            }}
          >
            Upload
          </ActionBtn>
          <p className="text-red-400">{errorMsg}</p>

          {receiptImgURL && (
            <Image src={receiptImgURL} alt="" width={300} height={500} />
          )}
        </div>
      )}

      {tx?.receipt?.id && (
        <div className="flex flex-col">
          {tx.receipt.items.map((item) => (
            <div key={item.id} className="flex">
              <Input type="number" value={item.quantity} />
              <Input value={item.name} />
              <Input type="number" value={item.unit_price} />
            </div>
          ))}
          <div className="flex">
            <p>tips</p>
            <Input value={tx.receipt.tip} />
            <p>({(tx.receipt.tip * 100) / tx.amount}%)</p>
          </div>
          <div className="flex">
            <p>tax</p>
            <Input value={tx.receipt.tax} />
          </div>
          <p
            className={`h-5 text-red-800 ${
              receiptSum !== tx.amount ? "" : "hidden"
            }`}
          >
            Receipt total is {receiptSum}; {tx.amount - receiptSum} off
          </p>
        </div>
      )}
    </div>
  );
};

export default Receipt;
