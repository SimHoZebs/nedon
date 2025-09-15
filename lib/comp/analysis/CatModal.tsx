import { trpc } from "@/util/trpc";

import { Button, CloseBtn } from "../shared/Button";
import DateSortedTxList from "../shared/DateSortedTxList";
import { H1, H2 } from "../shared/Heading";
import Input from "../shared/Input";
import Modal from "../shared/Modal";

import { type CatSettings, Prisma } from "@prisma/client";
import { getCatStyle } from "lib/domain/cat";
import { type NestedCatWithTx, organizeTxByTime } from "lib/domain/tx";
import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { useEffect, useState } from "react";

interface Props {
  setShowModal: (show: boolean) => void;
  modalData: {
    settings?: CatSettings;
    cat: NestedCatWithTx;
  };
}

const CatModal = (props: Props) => {
  const { settings, cat } = props.modalData;
  const { user: appUser, isLoading: appUserLoading } = useAutoLoadUser();
  const { data: userSettings } = trpc.settings.get.useQuery(
    { userId: appUser?.id || "" },
    { enabled: !!appUser && !appUserLoading },
  );

  const [budget, setBudget] = useState<Prisma.Decimal>(new Prisma.Decimal(0));

  useEffect(() => {
    if (settings) {
      setBudget(settings.budget);
    }
  }, [settings]);

  const upsertCatSetting = trpc.settings.upsertCatSetting.useMutation();
  const queryClient = trpc.useUtils();

  const totalAmount = cat.primary.total.absoluteValue();

  const txUnderThisCat = cat.primary.detailed.flatMap((d) => d.txs);

  const catStyle = getCatStyle(cat.primary.name, cat.primary.detailed[0]?.name);
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
              className={`h-9 w-9 ${catStyle.icon} ${catStyle.textColor}`}
            />
            <H1>{cat.primary.name}</H1>
          </header>

          <div className="flex w-full flex-col items-start">
            <H2>$ {totalAmount.toNumber()} Spent</H2>
            <p>
              {props.modalData.settings?.budget && (
                <p className="text-sm text-zinc-400">
                  {Prisma.Decimal.div(
                    totalAmount,
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
                  name: cat.primary.name,
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
          {cat.primary.detailed.length > 0 && (
            <details className="flex flex-col gap-y-2">
              <summary>Detailed categories</summary>
              {cat.primary.detailed.map((detailedCat) => (
                <div key={detailedCat.name} className="flex justify-between">
                  <span>{detailedCat.name}</span>
                  <span>
                    ${Number(detailedCat.total.absoluteValue().toFixed(2))}
                  </span>
                </div>
              ))}
            </details>
          )}
        </section>

        <DateSortedTxList sortedTxArray={organizeTxByTime(txUnderThisCat)} />
      </main>
    </Modal>
  );
};
export default CatModal;
