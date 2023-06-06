import React, { useState } from "react";
import Button from "./Button";

import Error from "./Error";
import { DataItem, Categories, ErrorDataItem } from "../util/dataUtil";

interface Props {
  endpoint: string;
  name?: string;
  categories: Array<Categories>;
  schema: string;
  description: string;
  transformData: (arg: any) => Array<DataItem>;
}

const Endpoint = (props: Props) => {
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

    if (data.pdf != null) {
      setPdf(data.pdf);
    }
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
      {error != null && <Error error={error} />}
    </>
  );
};

Endpoint.displayName = "Endpoint";

export default Endpoint;
