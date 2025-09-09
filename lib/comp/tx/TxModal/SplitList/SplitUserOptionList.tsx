import { Button } from "@/comp/Button";

import parseMoney from "@/util/parseMoney";
import { useTxStore } from "@/util/txStore";
import useAppUser from "@/util/useAppUser";

const SplitUserOptionList = () => {
  const appUser = useAppUser();

  const setSplitTxArray = useTxStore((state) => state.setSplitTxArray);
  const setUnsavedCatArray = useTxStore((state) => state.setCatArray);
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
          splitTxArray.find((split) => split.userId === user.id) ||
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

                  //evenly reduce amount from all splits to assign to new
                  //split
                  const updatedSplitTxArray: any[] = structuredClone(
                    splitTxArray,
                  ).map((split) => ({
                    ...split,
                    //1 for new split
                    amount: parseMoney(
                      txOnModal.amount / (splitTxArray.length + 1),
                    ),
                  }));

                  //reduce for tx.user as well
                  const updatedCatArray = structuredClone(catArray).map(
                    (cat) => ({
                      ...cat,
                      amount: parseMoney(
                        txOnModal.amount / (splitTxArray.length + 1),
                      ),
                    }),
                  );

                  //add new split
                  updatedSplitTxArray.push({
                    id: undefined,
                    originTxId: "",
                    amount: parseMoney(
                      txOnModal.amount / (splitTxArray.length + 1),
                    ),
                    userId: user.id,
                  });

                  setSplitTxArray(updatedSplitTxArray);
                  setUnsavedCatArray(updatedCatArray);
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
