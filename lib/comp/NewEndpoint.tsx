import React, { useState } from "react";
import Button from "./Button";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  desc: string;
  data: unknown;
}

const NewEndpoint = (props: Props) => {
  const [data, setData] = useState<unknown>(undefined);

  return (
    <div className="flex w-full justify-between">
      <div className="">
        <p>{props.desc}</p>
        <Button
          onClick={async () => {
            const data = await props.data;
            setData(data);
          }}
        >
          {props.children}
        </Button>
      </div>

      <div className="">
        <p>Response:</p>
        <div className="flex flex-col gap-y-1 divide-y-2 overflow-scroll max-h-[60vh] overflow-x-hidden">
          {Array.isArray(data) ? (
            data.map((datum, index) => (
              <pre key={index}>{JSON.stringify(datum, null, 2)}</pre>
            ))
          ) : (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewEndpoint;
