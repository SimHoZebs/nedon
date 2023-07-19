import React from "react";
import { useStoreState } from "../../../util/store";
import { Icon } from "@iconify-icon/react";
import Button from "../../Button/Button";
import { SplitClientSide } from "../../../util/types";

type Props = {
  unsavedSplitArray: SplitClientSide[];
  setUnsavedSplitArray: React.Dispatch<React.SetStateAction<SplitClientSide[]>>;
};

const SplitUserList = (props: Props) => {
  const {
    appUser,
    appGroup,
    currentTransaction: transaction,
  } = useStoreState((state) => state);

  return (
    transaction &&
    appUser &&
    appGroup?.userArray &&
    appGroup.userArray.map((user, i) =>
      props.unsavedSplitArray.find((split) => split.userId === user.id) ||
      user.id === appUser.id ? null : (
        <div key={i} className="flex items-center gap-x-2">
          <Icon
            className="rounded-full border-2 border-zinc-400 bg-zinc-800 p-2"
            icon="mdi:account"
            width={20}
          />
          <div>{user.id.slice(0, 8)}</div>
          <Button
            className="bg-zinc-800 text-indigo-300"
            onClick={() => {
              const updatedSplitArray = structuredClone(
                props.unsavedSplitArray
              );

              const appUserCategoryArray = transaction.splitArray.find(
                (split) => split.userId === appUser.id
              )?.categoryArray;

              if (!appUserCategoryArray) {
                console.error("appUser has no category array");
                return;
              }

              updatedSplitArray.push({
                id: user.id,
                transactionId: transaction.transaction_id,
                userId: user.id,
                categoryArray: appUserCategoryArray,
              });

              props.setUnsavedSplitArray(updatedSplitArray);
            }}
          >
            Split
          </Button>
        </div>
      )
    )
  );
};

export default SplitUserList;
