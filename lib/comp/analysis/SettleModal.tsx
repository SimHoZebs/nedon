import React, { useState } from "react";
import Modal from "../Modal";
import { useStoreState } from "@/util/store";
import { Icon } from "@iconify-icon/react";
import Button from "../Button/ActionBtn";
import { trpc } from "@/util/trpc";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  oweUser: { id: string; amount: number } | undefined;
}
const SettleModal = (props: Props) => {
  const { appUser } = useStoreState((state) => state);
  const [settleAmount, setSettleAmount] = useState(0);
  const [appUserGiving, setAppuserGiving] = useState(true);

  const createTransactionManually =
    trpc.transaction.createManually.useMutation();
  const associatedTransactionArray =
    trpc.transaction.getAllAssociated.useQuery(
      { id: appUser ? appUser.id : "" },
      { staleTime: 3600000, enabled: !!appUser }
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
            <Icon
              className="rounded-full hover:bg-zinc-800"
              icon="mingcute:arrow-up-line"
              rotate={appUserGiving ? "90deg" : "-90deg"}
              width={36}
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

      <Button
        disabled={!settleAmount}
        onClick={async () => {
          //Why do I even need this check?
          if (!props.oweUser) return;

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
      </Button>
      <Button>Cancel</Button>
    </Modal>
  ) : null;
};
export default SettleModal;
