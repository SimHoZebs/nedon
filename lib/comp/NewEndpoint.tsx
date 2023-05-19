import React, { useState } from "react";
import Button from "./Button";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  desc: string;
  getData: () => Promise<unknown>;
}

const NewEndpoint = (props: Props) => {
  const [data, setData] = useState<unknown>(undefined);

  return (
    <div className="flex w-full bg-zinc-900 p-2 divide-x-2 gap-x-1">
      <div className="w-1/3">
        <p>{props.desc}</p>
        <Button
          onClick={async () => {
            const data = await props.getData();
            setData(data);
          }}
        >
          {props.children}
        </Button>
      </div>

      <div className="w-2/3">
        <details className="">
          <summary className="">Response:</summary>
          <div className="overflow-y-scroll max-h-[60vh] flex flex-col gap-y-1 divide-y-2">
            {Array.isArray(data) ? (
              data.map((datum, index) => (
                <p className="break-words whitespace-pre-wrap" key={index}>
                  {JSON.stringify(datum, null, 2)}
                </p>
              ))
            ) : (
              <p className="break-words whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </p>
            )}
          </div>
        </details>
      </div>
    </div>
  );
};

export default NewEndpoint;