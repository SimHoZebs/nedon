import React, { useState } from "react";
import Button from "../../Button";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  desc: string;
  getData: () => Promise<unknown>;
}

const NewEndpoint = (props: Props) => {
  const [data, setData] = useState<unknown>(undefined);

  return (
    <div className="flex w-full gap-x-1 divide-x-2 bg-zinc-900 p-2">
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
          <div className="flex max-h-[60vh] flex-col gap-y-1 divide-y-2 overflow-y-scroll">
            {Array.isArray(data) ? (
              data.map((datum, index) => (
                <p className="whitespace-pre-wrap break-words" key={index}>
                  {JSON.stringify(datum, null, 2)}
                </p>
              ))
            ) : (
              <p className="whitespace-pre-wrap break-words">
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
