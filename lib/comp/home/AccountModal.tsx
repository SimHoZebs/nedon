import type { AccountBase } from "plaid";
import type React from "react";
import { useMemo } from "react";

import Modal from "@/comp/Modal";

import getAppUser from "@/util/getAppUser";
import { trpc } from "@/util/trpc";
import { organizeTxByTime } from "@/util/tx";

import { CloseBtn } from "../Button";
import DateSortedTxList from "../DateSortedTxList";
import { H1, H2, H3 } from "../Heading";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  clickedAccount: AccountBase;
}

const AccountModal = (props: Props) => {
  const { appUser } = getAppUser();

  const txArray = trpc.tx.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );

  const sortedTxArray = useMemo(() => {
    if (!txArray.data) return [[[[]]]];
    const filteredTxArray = txArray.data.filter(
      (tx) => tx.account_id === props.clickedAccount?.account_id,
    );
    return organizeTxByTime(filteredTxArray);
  }, [props.clickedAccount?.account_id, txArray.data]);

  return (
    <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <Modal>
        <div className="flex h-full w-full flex-col items-end justify-between p-3">
          <CloseBtn onClose={() => props.setShowModal(false)} />

          <div className="flex h-full w-full flex-col items-end justify-between overflow-hidden lg:flex-row lg:items-start">
            <div className="flex w-full flex-row justify-between lg:flex-col lg:justify-normal">
              <div className="">
                <H1>{props.clickedAccount.name}</H1>
                <p className="text-zinc-400 ">
                  {props.clickedAccount.official_name}
                </p>
              </div>
              <div className="flex flex-col items-end lg:items-start">
                <H3>Current: ${props.clickedAccount.balances.available}</H3>
                <H3>Available: ${props.clickedAccount.balances.current}</H3>
              </div>
            </div>
            <section className="flex h-full w-full flex-col gap-y-3 p-1 lg:max-w-lg">
              <H2>Tx History</H2>
              <DateSortedTxList
                sortedTxArray={sortedTxArray}
                setShowModal={props.setShowModal}
              />
            </section>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountModal;
