import { ChaseCSVTxSchema, type UnsavedTx } from "@/types/tx";

import { Button } from "../shared/Button";

import { createTxFromChaseCSV } from "lib/domain/tx";
import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import Papa from "papaparse";
import { useRef } from "react";
import z from "zod";

interface Props {
  setCsvTxArray: React.Dispatch<React.SetStateAction<UnsavedTx[]>>;
  setShowCsvUploadPreviewModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const CsvUploadInput = (props: Props) => {
  const { user: appUser } = useAutoLoadUser();
  const csvInputRef = useRef<HTMLInputElement>(null);

  const csvToTxArray = (text: string | ArrayBuffer) => {
    //idk what to do with ArrayBuffer yet
    if (typeof text !== "string" || !appUser) return;

    const { data } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.replace(/[^a-zA-Z]/g, ""),
    });

    const chaseTxArray = z.array(ChaseCSVTxSchema).safeParse(data);
    if (!chaseTxArray.success) {
      console.error(chaseTxArray.error);
      return;
    }

    const txArray = chaseTxArray.data.map((csvTx) =>
      createTxFromChaseCSV(csvTx, appUser.id),
    );
    return txArray;
  };

  return (
    <Button
      onClick={() => {
        if (!csvInputRef.current) return;
        console.log("resetting");
        csvInputRef.current.value = "";
        csvInputRef.current?.click();
      }}
    >
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={csvInputRef}
        onChange={(e) => {
          console.log("file uploaded");
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();

          reader.onload = async () => {
            const result = reader.result;
            if (!result) return;

            const chaseTxArray = csvToTxArray(reader.result);

            if (!chaseTxArray) return;

            props.setCsvTxArray(chaseTxArray);
            props.setShowCsvUploadPreviewModal(true);
            console.log("completed");
          };

          reader.readAsText(file);
        }}
      />
    </Button>
  );
};

export default CsvUploadInput;
