import { Icon } from "@iconify-icon/react";
import React, { useEffect, useState } from "react";
import { SplitClientSide, isSplitInDB } from "@/util/types";
import ActionBtn from "@/comp/Button/ActionBtn";
import UserSplit from "./UserSplit";
import { trpc } from "@/util/trpc";
import { useStoreState } from "@/util/store";
import SplitUserOptionList from "./SplitUserOptionList";
import H3 from "@/comp/H3";
import Button from "@/comp/Button/Button";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  unsavedSplitArray: SplitClientSide[];
  setUnsavedSplitArray: React.Dispatch<React.SetStateAction<SplitClientSide[]>>;
}

const SplitList = (props: Props) => {
  const { appUser, currentTransaction } = useStoreState((state) => state);
  const { data: transaction } = trpc.transaction.get.useQuery(
    { plaidTransaction: currentTransaction, userId: appUser?.id || "" },
    { enabled: !!currentTransaction && !!appUser?.id }
  );

  const deleteSplit = trpc.split.delete.useMutation();
  const queryClient = trpc.useContext();
  const createTransaction = trpc.transaction.create.useMutation();
  const createSplit = trpc.split.create.useMutation();
  const upsertManyCategory = trpc.category.upsertMany.useMutation();

  const [isManaging, setIsManaging] = useState(false);
  useState<SplitClientSide[]>();

  useEffect(() => {
    console.log("syncing unsavedSplitArray with transaction.splitArray");

    if (transaction) {
      props.setUnsavedSplitArray(structuredClone(transaction.splitArray));
    }
  }, [props, transaction]);

  const amount = transaction ? transaction.amount : 0;

  const calcSplitTotal = (split: SplitClientSide) => {
    return split.categoryArray.reduce(
      (total, category) => total + category.amount,
      0
    );
  };

  let updatedTotalSplit =
    Math.floor(
      props.unsavedSplitArray.reduce(
        (amount, split) => amount + calcSplitTotal(split),
        0
      ) * 100
    ) / 100;

  const saveChanges = async () => {
    if (!appUser || !transaction) {
      console.error(
        "appUser or transaction is undefined. Appuser:",
        appUser,
        "transaction:",
        transaction
      );
      return;
    }

    const splitToDeleteArray = transaction.splitArray.filter(
      (split) =>
        !props.unsavedSplitArray.find(
          (unsavedSplit) => unsavedSplit.id === split.id
        )
    );

    console.log("Deleting following splits", splitToDeleteArray);

    splitToDeleteArray.forEach(async (split) => {
      if (split.id) await deleteSplit.mutateAsync({ splitId: split.id });
    });

    if (!transaction.inDB) {
      await createTransaction.mutateAsync({
        userId: appUser.id,
        transactionId: transaction.id,
        splitArray: props.unsavedSplitArray,
      });
    } else {
      props.unsavedSplitArray.forEach(async (split) => {
        if (!isSplitInDB(split)) {
          console.log("split", split, " is not in DB, creating new split");
          await createSplit.mutateAsync({ split });
        } else {
          await upsertManyCategory.mutateAsync({
            categoryArray: split.categoryArray,
          });
        }
      });
    }

    setIsManaging(false);
    await queryClient.transaction.get.refetch();
  };

  return (
    appUser &&
    transaction && (
      <div className="flex w-full flex-col gap-y-3">
        <div className="flex gap-x-2">
          {props.children}
          {props.unsavedSplitArray.length === 1 && !isManaging && (
            <ActionBtn onClick={() => setIsManaging(true)}>Split</ActionBtn>
          )}
        </div>

        {(props.unsavedSplitArray.length > 1 || isManaging) && (
          <div className="flex flex-col gap-y-2">
            <div className="flex w-full justify-between">
              <H3>Split</H3>
              {isManaging ? (
                <div className="flex gap-x-2">
                  <ActionBtn onClick={saveChanges}>Save changes</ActionBtn>

                  <ActionBtn
                    variant="negative"
                    onClick={() => setIsManaging(false)}
                  >
                    Cancel
                  </ActionBtn>
                </div>
              ) : (
                <Button
                  className="flex gap-x-2 bg-zinc-800 text-indigo-300 hover:bg-zinc-700 hover:text-indigo-200"
                  onClick={() => setIsManaging(true)}
                >
                  <Icon icon={"mdi:edit"} />
                  Manage
                </Button>
              )}
            </div>

            {props.unsavedSplitArray.map((split, i) => (
              <div
                key={i}
                className="flex w-full items-center gap-x-2 sm:gap-x-3"
              >
                <UserSplit
                  isManaging={isManaging}
                  onRemoveUser={() => {
                    const updatedSplitArray = structuredClone(
                      props.unsavedSplitArray
                    );
                    const splicedSplit = updatedSplitArray.splice(i, 1);
                    const amount = splicedSplit[0].categoryArray.reduce(
                      (total, category) => total + category.amount,
                      0
                    );

                    updatedSplitArray.forEach((split) => {
                      split.categoryArray.forEach((category) => {
                        category.amount += amount / updatedSplitArray.length;
                      });
                    });

                    props.setUnsavedSplitArray(updatedSplitArray);
                  }}
                  onAmountChange={(amount: number) => {
                    const updatedSplitArray = structuredClone(
                      props.unsavedSplitArray
                    );
                    updatedSplitArray[i].categoryArray.forEach((category) => {
                      category.amount =
                        amount / updatedSplitArray[i].categoryArray.length;
                    });

                    props.setUnsavedSplitArray(updatedSplitArray);
                  }}
                  amount={amount}
                  split={split}
                  splitTotal={calcSplitTotal(split)}
                  userId={split.userId}
                >
                  <div className="flex items-center gap-x-2">
                    <Icon
                      icon="mdi:account"
                      className="rounded-full border-2 border-zinc-400 bg-zinc-800 p-2 hover:text-zinc-100"
                      width={20}
                      height={20}
                    />
                  </div>
                </UserSplit>
              </div>
            ))}
          </div>
        )}

        <div className="h-5 text-red-800">
          {updatedTotalSplit !== amount &&
            props.unsavedSplitArray.length > 0 &&
            `Split is ${updatedTotalSplit > amount ? "greater " : "less "}
          than the amount (${`updatedTotalSplit $${updatedTotalSplit}`})`}
        </div>

        {isManaging && (
          <SplitUserOptionList
            unsavedSplitArray={props.unsavedSplitArray}
            setUnsavedSplitArray={props.setUnsavedSplitArray}
          />
        )}
      </div>
    )
  );
};

export default SplitList;
