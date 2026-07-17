import { Button } from "@/comp/shared/Button";

import { toMoney } from "@/util/money";

import { TxKind } from "@/types/enums";
import type { SplitTxFormState } from "@/types/tx";

import { createId } from "@paralleldrive/cuid2";
import Decimal from "decimal.js";
import useAppUser from "lib/hooks/useAutoLoadUser";
import { useTxStore } from "lib/store/txStore";

const SplitUserOptionList = () => {
  const { user: appUser } = useAppUser();

  const setSplitTxArray = useTxStore((state) => state.setSplitTxArray);
  const setCatArray = useTxStore((state) => state.setCatArray);
  const setIsEditingSplitTx = useTxStore((state) => state.setIsEditingSplitTx);
  const txOnModal = useTxStore((state) => state.txOnModal);
  const catArray = txOnModal?.catArray || [];
  const splitTxArray = txOnModal?.splitTxArray || [];

  return (
    <div className="no-scrollbar flex h-fit w-full flex-col gap-y-2 overflow-y-scroll">
      {!appUser ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div
            // biome-ignore lint: just a loading bar
            key={i}
            className="flex w-2/3 animate-pulse rounded-lg bg-zinc-700 p-2 px-1"
          >
            <div className="flex items-center gap-x-2 rounded-full border-2 border-zinc-400">
              <span className="2 icon-[mdi--account] h-8 w-8 bg-zinc-400 hover:bg-zinc-100" />
            </div>
          </div>
        ))
      ) : appUser.myConnectionArray ? (
        appUser.myConnectionArray.map((user) =>
          splitTxArray.find((split) => split.ownerId === user.id) ||
          user.id === appUser?.id ? null : (
            <div key={user.id} className="flex items-center gap-x-2 p-2 px-1">
              <div className="flex items-center gap-x-2 rounded-full border-2 border-zinc-400">
                <span className="2 icon-[mdi--account] h-8 w-8 bg-zinc-400 hover:bg-zinc-100" />
              </div>
              <div>{user.name}</div>
              <Button
                className="bg-zinc-800 text-indigo-300"
                onClick={() => {
                  if (!appUser) {
                    console.error("no appUser");
                    return;
                  }

                  if (!txOnModal) {
                    console.error("no txOnModal");
                    return;
                  }

                  const newAmount = toMoney(
                    new Decimal(txOnModal.amount).div(splitTxArray.length + 1),
                  );

                  const updatedSplitTxArray: SplitTxFormState[] =
                    structuredClone(splitTxArray).map((split) => ({
                      ...split,
                      amount: newAmount,
                    }));

                  const updatedCatArray = structuredClone(catArray).map(
                    (cat) => ({
                      ...cat,
                      amount: newAmount,
                    }),
                  );

                  const txId = txOnModal.id || createId();

                  const newSplit: SplitTxFormState = {
                    kind: TxKind.SPLIT,
                    ownerId: user.id,
                    originalBankTxId: txOnModal.originalBankTxId,
                    originTxId: txId,
                    name: txOnModal.name,
                    amount: newAmount,
                    userTotal: toMoney(0),
                    recurring: txOnModal.recurring,
                    mds: txOnModal.mds,
                    bankId: null,
                    datetime: txOnModal.datetime,
                    authorizedDatetime: txOnModal.authorizedDatetime,
                    accountId: txOnModal.accountId,
                    logoUrl: txOnModal.logoUrl,
                    isoCurrencyCode: txOnModal.isoCurrencyCode,
                    locationAddress: txOnModal.locationAddress,
                    locationCity: txOnModal.locationCity,
                    locationRegion: txOnModal.locationRegion,
                    locationPostalCode: txOnModal.locationPostalCode,
                    locationCountry: txOnModal.locationCountry,
                  };

                  updatedSplitTxArray.push(newSplit);

                  setSplitTxArray(updatedSplitTxArray);
                  setCatArray(updatedCatArray);
                  setIsEditingSplitTx(true);
                }}
              >
                Split
              </Button>
            </div>
          ),
        )
      ) : (
        <div>nope</div>
      )}
    </div>
  );
};

export default SplitUserOptionList;
