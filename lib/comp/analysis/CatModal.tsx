import type {
  CatSettings,
  CatSettingsOptionalDefaults,
} from "prisma/generated/zod";
import { useEffect, useState } from "react";

import catStyleArray from "@/util/catStyle";
import getAppUser from "@/util/getAppUser";
import parseMoney from "@/util/parseMoney";
import { trpc } from "@/util/trpc";
import type { TreedCatWithTx } from "@/util/types";

import { Button, CloseBtn } from "../Button";
import { H1, H2 } from "../Heading";
import Input from "../Input";
import Modal from "../Modal";
import { subCatTotal } from "@/util/cat";

interface Props {
  setShowModal: (show: boolean) => void;
  modalData: {
    settings?: CatSettings;
    data: TreedCatWithTx;
  };
}

const CatModal = (props: Props) => {
  const { settings, data } = props.modalData;
  const { appUser } = getAppUser();

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

  return (
    <Modal>
      <div className="flex flex-col items-start gap-y-2 py-2 px-4">
        <div className="flex w-full justify-end">
          <CloseBtn
            onClose={() => {
              props.setShowModal(false);
            }}
          />
        </div>

        <header className="flex gap-x-3">
          <span
            className={`h-9 w-9 ${catStyleArray[data.name].icon} ${
              catStyleArray[data.name].textColor
            }`}
          />
          <H1>{data.name}</H1>
        </header>
        <div className="flex flex-col w-full items-end">
          <H2>$ {data.spending + subCatTotal(data, "spending")} Spent</H2>
          <p>
            {props.modalData.settings && (
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

              const updatedSettings: CatSettingsOptionalDefaults = settings
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
      </div>
    </Modal>
  );
};
export default CatModal;
