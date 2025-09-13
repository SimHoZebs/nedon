import type { UIData } from "@/types/ui";

import { H3 } from "../shared/Heading";

import { type CatSettings, Prisma } from "@prisma/client";
import { getCatStyle } from "lib/domain/cat";
import type { TxType } from "lib/domain/tx";

interface Props {
  txType: TxType;
  catSettings?: CatSettings;
  showModal: () => void;
  cat: UIData[0];
}

const CatCard = (props: Props) => {
  const totalAmount = Number(Math.abs(props.cat.total).toFixed(2));

  return (
    <div
      key={props.cat.name}
      className="flex cursor-pointer flex-col p-3 outline-1 outline-white hover:bg-zinc-700"
    >
      <button
        type="button"
        onKeyDown={() => props.showModal()}
        onClick={() => props.showModal()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-x-2">
            <span
              className={`h-8 w-8 rounded-lg text-zinc-950 ${
                getCatStyle(props.cat.name).icon
              } ${getCatStyle(props.cat.name).bgColor}`}
            />
            <div>
              <H3>{props.cat.name}</H3>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex">
              <H3>${totalAmount}</H3>
              <p className="text-sm text-zinc-400">
                {props.catSettings && ` /${props.catSettings?.budget}`}
              </p>
            </div>
            {props.catSettings && (
              <p className="text-sm text-zinc-400">
                {Prisma.Decimal.div(totalAmount, props.catSettings.budget)
                  .mul(100)
                  .toNumber()}
                % of {props.catSettings.budget.toNumber()}
              </p>
            )}
          </div>
        </div>
      </button>
      <div className="flex flex-col gap-y-2 pl-10">
        {props.cat.detailed.map((detailedCat) => (
          <div
            key={detailedCat.name}
            className="flex items-center justify-between"
          >
            <div className="flex items-center justify-center gap-x-2">
              <span
                className={`h-6 w-6 rounded-lg text-zinc-950 ${
                  getCatStyle(detailedCat.name).icon
                } ${getCatStyle(detailedCat.name).bgColor}`}
              />
              <div>
                <p>{detailedCat.name}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p>${Number(Math.abs(detailedCat.total).toFixed(2))}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatCard;
