import { subCatTotal } from "@/util/cat";
import catStyleArray from "@/util/catStyle";
import { trpc } from "@/util/trpc";
import { organizeTxByTime } from "@/util/tx";

import type { TreedCatWithTx } from "@/types/cat";

import { Button, CloseBtn } from "../../shared/Button";
import DateSortedTxList from "../../shared/DateSortedTxList";
import { H1, H2 } from "../../shared/Heading";
import Input from "../../shared/Input";
import Modal from "../../shared/Modal";

import { type CatSettings, Prisma } from "@prisma/client";
import useAppUser from "lib/hooks/useAppUser";
import { useEffect, useState } from "react";

interface Props {
  setShowModal: (show: boolean) => void;
  modalData: {
    settings?: CatSettings;
    data: TreedCatWithTx;
  };
}

const CatModal = (props: Props) => {
  const { settings, data } = props.modalData;
  const appUser = useAppUser();
  const { data: userSettings } = trpc.settings.get.useQuery(
    { userId: appUser?.id || "" },
    { enabled: !!appUser },
  );

  const [budget, setBudget] = useState<Prisma.Decimal>(new Prisma.Decimal(0));

  useEffect(() => {
    if (settings) {
      setBudget(settings.budget);
    }
  }, [settings]);

  const upsertCatSetting = trpc.settings.upsertCatSetting.useMutation();
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
                  {Prisma.Decimal.div(
                    subCatTotalAmount,
                    props.modalData.settings.budget,
                  )
                    .mul(100)
                    .toNumber()}
                  % of ${props.modalData.settings.budget.toNumber()}
                </p>
              )}
            </p>
          </div>

          <div>
            <p>Budget</p>
            <Input
              value={budget.toNumber()}
              onChange={(e) => setBudget(new Prisma.Decimal(e.target.value))}
              className="rounded-md border border-zinc-700"
              type="number"
            />
            <Button
              onClick={async () => {
                if (!appUser || !userSettings) {
                  console.error("no appUser or userSettings");
                  return;
                }

                const upsertData = {
                  id: settings?.id,
                  name: data.name,
                  budget: budget,
                  parentId: null,
                  userSettingsId: userSettings.id,
                };

                await upsertCatSetting.mutateAsync(upsertData);
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
