import Input from "@/comp/Input";
import { getCategoryStyle } from "@/util/category";
import { useTransactionStore } from "@/util/transactionStore";
import { Icon } from "@iconify-icon/react";
import React from "react";

interface Props {
  splitIndex: number;
  categoryIndex: number;
  setIsManaging: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserSplitCategory = (props: Props) => {
  const unsavedSplitArray = useTransactionStore(
    (store) => store.unsavedSplitArray,
  );
  const setUnsavedSplitArray = useTransactionStore(
    (store) => store.setUnsavedSplitArray,
  );

  const category =
    unsavedSplitArray[props.splitIndex].categoryArray[props.categoryIndex];

  return (
    <div className="text-sm my- 1 flex items-center gap-x-2">
      <Icon
        className={
          getCategoryStyle(category.nameArray).bgColor +
          " rounded-full p-1 text-zinc-900"
        }
        icon={getCategoryStyle(category.nameArray).icon}
      />
      <div className="flex flex-col items-start">
        <p className="font-light text-zinc-300">{category.nameArray.at(-1)}</p>

        <div className="flex items-center font-light ">
          <label className="text-zinc-300 " htmlFor="amount">
            $
          </label>
          <Input
            id="amount"
            type="number"
            value={category.amount}
            onChange={(e) => {
              props.setIsManaging(true);
              const unsavedSplitArrayClone = structuredClone(unsavedSplitArray);

              unsavedSplitArrayClone[props.splitIndex].categoryArray[
                props.categoryIndex
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

export default UserSplitCategory;
