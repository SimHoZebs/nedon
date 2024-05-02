import type {
  CatSettings,
  CatSettingsOptionalDefaults,
  CatSettingsOptionalDefaultsWithRelations,
} from "prisma/generated/zod";
import { useEffect, useState } from "react";

import catStyleArray from "@/util/catStyle";
import getAppUser from "@/util/getAppUser";
import parseMoney from "@/util/parseMoney";
import { trpc } from "@/util/trpc";
import type { TreedCatWithTx } from "@/util/types";

import { Button, CloseBtn } from "../Button";
import { H2 } from "../Heading";
import Input from "../Input";
import Modal from "../Modal";

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

  return (
    <Modal>
      <div className="flex flex-col items-start gap-y-2 p-1">
        <div className="flex w-full justify-end">
          <CloseBtn
            onClose={() => {
              props.setShowModal(false);
            }}
          />
        </div>
        <div className="flex gap-x-3">
          <span
            className={`h-8 w-8 ${catStyleArray[data.name].icon} ${
              catStyleArray[data.name].textColor
            }`}
          />
          <H2>{data.name}</H2>
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

              const upsertedSettings =
                await upsertSettings.mutateAsync(updatedSettings);
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
