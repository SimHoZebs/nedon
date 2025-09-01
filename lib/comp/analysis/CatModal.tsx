import type { TreedCatWithTx } from "@/types/cat";
import { subCatTotal } from "@/util/cat";
import catStyleArray from "@/util/catStyle";
import useAppUser from "@/util/getAppUser";
import parseMoney from "@/util/parseMoney";
import { trpc } from "@/util/trpc";
import { organizeTxByTime } from "@/util/tx";
import type { CatSettings, Prisma } from "@prisma/client";
import { useEffect, useState } from "react";
import { Button, CloseBtn } from "../Button";
import DateSortedTxList from "../DateSortedTxList";
import { H1, H2 } from "../Heading";
import Input from "../Input";
import Modal from "../Modal";

interface Props {
  setShowModal: (show: boolean) => void;
  modalData: {
    settings?: CatSettings;
    data: TreedCatWithTx;
  };
}

type test = Prisma.CatSettingsUncheckedCreateInput;

const CatModal = (props: Props) => {
  const { settings, data } = props.modalData;
  const { appUser } = useAppUser();

  const [budget, setBudget] = useState(0);

  useEffect(() => {
    if (settings) {
      setBudget(settings.budget);
    }
  }, [settings]);

  const upsertSettings = trpc.cat.upsertSettings.useMutation();
  const queryClient = trpc.useUtils();

  const subCatTotalAmount = Math.abs(
    subCatTotal(props.modalData.data, "spending") +
      props.modalData.data.spending,
  );

  //combine data.txArray and data.subCatArray.txArray
  const txUnderThisCat = data.txArray.concat(
    data.subCatArray.flatMap((subCat) => subCat.txArray),
  );

  return (
    <Modal className="px-4 py-2">
      <div className="flex w-full justify-end">
        <CloseBtn
          onClose={() => {
            props.setShowModal(false);
          }}
        />
      </div>
      <main className="flex justify-between gap-y-2">
        <section className="flex flex-col">
          <header className="flex gap-x-3">
            <span
              className={`h-9 w-9 ${catStyleArray[data.name].icon} ${
                catStyleArray[data.name].textColor
              }`}
            />
            <H1>{data.name}</H1>
          </header>

          <div className="flex w-full flex-col items-start">
            <H2>$ {data.spending + subCatTotal(data, "spending")} Spent</H2>
            <p>
              {props.modalData.settings?.budget && (
                <p className="text-sm text-zinc-400">
                  {parseMoney(
                    (subCatTotalAmount / props.modalData.settings.budget) * 100,
                  )}
                  % of ${props.modalData.settings.budget}
                </p>
              )}
            </p>
          </div>

          <div>
            <p>Budget</p>
            <Input
              value={budget}
              onChange={(e) =>
                setBudget(parseMoney(Number.parseFloat(e.target.value)))
              }
              className="rounded-md border border-zinc-700"
              type="number"
            />
            <Button
              onClick={async () => {
                if (!appUser) {
                  console.error("no appUser");
                  return;
                }

                const updatedSettings = settings
                  ? { ...settings, budget: budget }
                  : {
                      name: data.name,
                      budget: budget,
                      parentId: null,
                      userId: appUser.id,
                    };

                await upsertSettings.mutateAsync(updatedSettings);
                await queryClient.cat.invalidate();
              }}
            >
              change budget
            </Button>
          </div>
          {
            //this only shows subCategories that have split transactions. Later should show all subCategories
            data.subCatArray.length > 0 && (
              <details className="flex flex-col gap-y-2">
                <summary>Sub categories</summary>
                <pre className="text-sm">
                  {JSON.stringify(data.subCatArray, null, 2)}
                </pre>
              </details>
            )
          }
        </section>

        <DateSortedTxList sortedTxArray={organizeTxByTime(txUnderThisCat)} />
      </main>
    </Modal>
  );
};
export default CatModal;
