import { getCategoryStyle, subCategoryTotal } from "@/util/category";
import parseMoney from "@/util/parseMoney";
import { TreedCategoryWithTransaction } from "@/util/types";

import { H3, H4 } from "../Heading";

interface Props {
  hierarchicalCategoryArray: TreedCategoryWithTransaction[];
}

const SpendingByCategoryList = (props: Props) => {
  return (
    <>
      {props.hierarchicalCategoryArray.map((category, i) => (
        <div key={i} className="flex flex-col p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-x-2">
              <span
                className={`h-8 w-8 rounded-lg text-zinc-950 ${
                  getCategoryStyle([category.name]).icon
                } ${getCategoryStyle([category.name]).bgColor}`}
              />
              <div>
                <H3>{category.name}</H3>

                <p className="text-sm text-zinc-400">
                  {parseMoney(
                    ((category.spending +
                      subCategoryTotal(category, "spending")) /
                      1000) *
                      100,
                  ).toString() + "%"}
                </p>
              </div>
            </div>

            <div>
              <H4>Spent</H4>
              <p>
                ${category.spending + subCategoryTotal(category, "spending")}
              </p>
            </div>

            <div>
              <H4>Received</H4>
              <p>
                $
                {-1 *
                  (category.received + subCategoryTotal(category, "received"))}
              </p>
            </div>
          </div>

          {category.subCategoryArray.length > 0 && (
            <details className="flex flex-col gap-y-2">
              <summary>Sub categories</summary>
              <SpendingByCategoryList
                hierarchicalCategoryArray={category.subCategoryArray}
              />
            </details>
          )}
        </div>
      ))}
    </>
  );
};

export default SpendingByCategoryList;
