import React, { useState } from "react";
import Button from "./Button";

import Table from "./Table";
import Error from "./Error";
import { DataItem, Categories, ErrorDataItem, Data } from "../util/dataUtil";
import Link from "next/link";

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

    const response = await fetch(`/api/trpc/${props.endpoint}`, {
      method: "GET",
    });

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
      <div className="grid w-full">
        <div>POST</div>

        <div className="">
          <div className="">
            {props.name != null && <span className="">{props.name}</span>}
            <span className="">{props.schema}</span>
          </div>

          <div className="">{props.description}</div>
        </div>

        <div className="flex flex-col">
          <Button onClick={getData}>
            {isLoading ? "Loading..." : `Send request`}
          </Button>

          {pdf != null && (
            <button>pdf download not available at the moment</button>
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
