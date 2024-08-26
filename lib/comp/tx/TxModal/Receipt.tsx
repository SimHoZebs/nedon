import React from "react";
import { useTxStore } from "@/util/txStore";
import { trpc } from "@/util/trpc";
import type { Receipt as TReceipt } from "@/types/receipt";
import supabase from "server/supabaseClient";
import Image from "next/image";

const Receipt = () => {
  const tx = useTxStore((state) => state.txOnModal);

  const createTx = trpc.tx.create.useMutation();
  const processReceipt = trpc.receipt.process.useMutation();
  const createReceipt = trpc.receipt.create.useMutation();

  const [uploadedImg, setUploadedImg] = React.useState<File>();
  const [uploadedImgUrl, setUploadedImgUrl] = React.useState<string>();
  const [receipt, setReceipt] = React.useState<TReceipt>();

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (!e.target.files) {
            console.error("No file uploaded.");
            return;
          }
          const img = e.target.files[0];
          setUploadedImg(img);
          setUploadedImgUrl(URL.createObjectURL(img));
        }}
      />
      {uploadedImg && uploadedImgUrl && !receipt ? (
        <div className="flex">
          <button
            type="button"
            onClick={async () => {
              if (!tx) {
                console.error("No transaction to upload receipt to");
                return;
              }
              const uploadResponse = await supabase.storage
                .from("receipts")
                .upload(tx.name, uploadedImg, { upsert: true });
              if (uploadResponse.error) {
                console.error("Error uploading image", uploadResponse.error);
                return;
              }
              const signedUrlResponse = await supabase.storage
                .from("receipts")
                .createSignedUrl(tx.name, 60);

              if (
                signedUrlResponse.error ||
                !signedUrlResponse.data.signedUrl
              ) {
                console.error(
                  "Error getting signed URL",
                  signedUrlResponse.error,
                );
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
              setReceipt(response);
              await createReceipt.mutateAsync({
                id: txId,
                receipt: response,
              });
            }}
          >
            Upload
          </button>

          <Image src={uploadedImgUrl} alt="" width={300} height={500} />
        </div>
      ) : (
        tx && <pre>{JSON.stringify(tx.receipt, null, 2)}</pre>
      )}
    </div>
  );
};

export default Receipt;
