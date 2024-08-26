import React from "react";
import { useTxStore } from "@/util/txStore";
import { trpc } from "@/util/trpc";
import supabase from "server/supabaseClient";
import Image from "next/image";
import { H3 } from "@/comp/Heading";
import Input from "@/comp/Input";

const Receipt = () => {
  const tx = useTxStore((state) => state.txOnModal);

  const createTx = trpc.tx.create.useMutation();
  const processReceipt = trpc.receipt.process.useMutation();
  const createReceipt = trpc.receipt.create.useMutation();

  const [receiptImg, setReceiptImg] = React.useState<File>();
  const [receiptImgURL, setReceiptImgURL] = React.useState<string>();

  const uploadAndProcess = async () => {
    if (!tx || !receiptImg) {
      console.error("No transaction to upload receipt to");
      return;
    }
    const uploadResponse = await supabase.storage
      .from("receipts")
      .upload(tx.name, receiptImg, { upsert: true });
    if (uploadResponse.error) {
      console.error("Error uploading image", uploadResponse.error);
      return;
    }
    const signedUrlResponse = await supabase.storage
      .from("receipts")
      .createSignedUrl(tx.name, 60);

    if (signedUrlResponse.error || !signedUrlResponse.data.signedUrl) {
      console.error("Error getting signed URL", signedUrlResponse.error);
      return;
    }

    const response = await processReceipt.mutateAsync({
      signedUrl: signedUrlResponse.data.signedUrl,
    });

    let txId = tx.id;
    if (!txId) {
      const createdTx = await createTx.mutateAsync(tx);
      txId = createdTx.id;
    }

    if (!response) return;
    await createReceipt.mutateAsync({
      id: txId,
      receipt: response,
    });
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
            const img = e.target.files[0];
            setReceiptImg(img);
            setReceiptImgURL(URL.createObjectURL(img));
          }}
        />
      )}
      {receiptImg && !tx?.receipt && (
        <div className="flex">
          <button type="button" onClick={uploadAndProcess}>
            Upload
          </button>

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
