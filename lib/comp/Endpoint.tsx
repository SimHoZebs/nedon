import React, { useState } from "react";
import Button from "plaid-threads/Button";
import Note from "plaid-threads/Note";

import Table from "./Table";
import Error from "./Error";
import { DataItem, Categories, ErrorDataItem, Data } from "../util/dataUtil";

interface Props {
  endpoint: string;
  name?: string;
  categories: Array<Categories>;
  schema: string;
  description: string;
  transformData: (arg: any) => Array<DataItem>;
}

const Endpoint = (props: Props) => {
  const [showTable, setShowTable] = useState(false);
  const [transformedData, setTransformedData] = useState<Data>([]);
  const [pdf, setPdf] = useState<string | null>(null);
  const [error, setError] = useState<ErrorDataItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getData = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/${props.endpoint}`, { method: "GET" });
    const data = await response.json();
    if (data.error != null) {
      setError(data.error);
      setIsLoading(false);
      return;
    }
    setTransformedData(props.transformData(data)); // transform data into proper format for each individual product
    if (data.pdf != null) {
      setPdf(data.pdf);
    }
    setShowTable(true);
    setIsLoading(false);
  };

  return (
    <>
      <div className="">
        <Note info className="">
          POST
        </Note>
        <div className="">
          <div className="">
            {props.name != null && <span className=""></span>}
            <span className=""></span>
          </div>
          <div className=""></div>
        </div>
        <div className="">
          <Button small centered wide secondary className="" onClick={getData}>
            {isLoading ? "Loading..." : `Send request`}
          </Button>
          {pdf != null && (
            <Button
              small
              centered
              wide
              className=""
              href={`data:application/pdf;base64,${pdf}`}
              componentProps={{ download: "Asset Report.pdf" }}
            >
              Download PDF
            </Button>
          )}
        </div>
      </div>
      {showTable && (
        <Table
          categories={props.categories}
          data={transformedData}
          isIdentity={props.endpoint === "identity"}
        />
      )}
      {error != null && <Error error={error} />}
    </>
  );
};

Endpoint.displayName = "Endpoint";

export default Endpoint;
