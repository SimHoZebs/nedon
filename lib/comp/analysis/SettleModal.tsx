import React, { useState } from "react";

import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";

import { ActionBtn } from "../Button";
import Modal from "../Modal";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  oweUser: { id: string; amount: number } | undefined;
}
const SettleModal = (props: Props) => {
  const appUser = useStore((state) => state.appUser);
  const [settleAmount, setSettleAmount] = useState(0);
  const [appUserGiving, setAppuserGiving] = useState(true);

  const createTransactionManually =
    trpc.transaction.createManually.useMutation();
  const associatedTransactionArray = trpc.transaction.getAllAssociated.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );

  return appUser && props.oweUser ? (
    <Modal setShowModal={props.setShowModal}>
      <p>{props.oweUser.id}</p>
      <p>{props.oweUser.amount}</p>
      <div className="flex flex-col justify-center">
        <div className="flex justify-center gap-x-3">
          {appUser?.id.slice(0, 8)}
          <button
            className="flex flex-col"
            onClick={() => setAppuserGiving((prev) => !prev)}
          >
            <span
              className={
                "icon-[mingcute--arrow-up-line] h-9 w-9 rounded-full hover:bg-zinc-800 " +
                appUserGiving
                  ? "rotate-90"
                  : "-rotate-90"
              }
            />
            <p className="text-sm">gives</p>
          </button>
          {props.oweUser.id.slice(0, 8)}
        </div>
        <input
          className="bg-zinc-800"
          id="settleAmount"
          type="number"
          step={0.01}
          value={settleAmount}
          onChange={(e) => setSettleAmount(parseFloat(e.target.value))}
        />
      </div>

      <ActionBtn
        disabled={!settleAmount}
        onClick={async () => {
          //Why do I even need this check?
          if (!props.oweUser) {
            console.error("oweUser is undefined");
            return;
          }
          // //TODO: probs should not be 1
          // await createManualTransaction.mutateAsync({
          //   userId: appUser.id,
          //   splitArray: [
          //     { userId: appUser.id },
          //     {
          //       userId: props.oweUser.id,
          //     },
          //   ],
          // });

          associatedTransactionArray.refetch();
          props.setShowModal(false);
        }}
      >
        Settle
      </ActionBtn>
      <ActionBtn>Cancel</ActionBtn>
    </Modal>
  ) : null;
};
export default SettleModal;
