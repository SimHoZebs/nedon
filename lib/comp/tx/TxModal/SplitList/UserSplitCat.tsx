import React from "react";

import Input from "@/comp/Input";

import { getCatStyle } from "@/util/cat";
import { useTxStore } from "@/util/txStore";

interface Props {
  splitIndex: number;
  catIndex: number;
  setIsManaging: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserSplitCat = (props: Props) => {
  const unsavedSplitArray = useTxStore((store) => store.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore(
    (store) => store.setUnsavedSplitArray,
  );

  const cat = unsavedSplitArray[props.splitIndex].catArray[props.catIndex];

  return (
    <div className="my-1 flex items-center gap-x-2 text-sm">
      <span
        className={`rounded-full p-1 text-zinc-900 ${
          getCatStyle(cat.nameArray).bgColor
        } ${getCatStyle(cat.nameArray).icon}`}
      />
      <div className="flex flex-col items-start gap-y-2">
        <p className="font-light text-zinc-300">{cat.nameArray.at(-1)}</p>

        <div className="flex items-center font-light ">
          <label className="text-zinc-300 " htmlFor="amount">
            $
          </label>
          <Input
            id="amount"
            type="number"
            value={cat.amount}
            step={0.01}
            onChange={(e) => {
              props.setIsManaging(true);
              const unsavedSplitArrayClone = structuredClone(unsavedSplitArray);

              unsavedSplitArrayClone[props.splitIndex].catArray[
                props.catIndex
              ].amount = parseFloat(e.currentTarget.value);

              setUnsavedSplitArray(unsavedSplitArrayClone);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};

export default UserSplitCat;
