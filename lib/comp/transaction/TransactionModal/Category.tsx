import React, { useState } from "react";
import { CategoryClientSide, FullTransaction } from "../../../util/types";
import { Icon } from "@iconify-icon/react";
import Button from "../../Button";
import CategoryPicker from "./CategoryPicker";
import categoryStyle from "../../../util/categoryStyle";

interface Props {
  transaction: FullTransaction;
  setTransaction: React.Dispatch<
    React.SetStateAction<FullTransaction | undefined>
  >;
}

const Category = (props: Props) => {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [unsavedCategoryArray, setUnsavedCategoryArray] = useState<
    CategoryClientSide[]
  >(props.transaction.categoryArray);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryClientSide>();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>();
  const [unsavedCategory, setUnsavedCategory] = useState<CategoryClientSide>();

  const { amount } = props.transaction;
  const lastCategory =
    props.transaction.categoryArray[0]?.categoryTree.slice(-1)[0];
  const thisCategoryStyle = lastCategory && categoryStyle[lastCategory];

  return (
    <div className="flex flex-col">
      <div className="flex justify-between font-semibold text-xl sm:text-2xl">
        <h3>{props.transaction.name}</h3>
        <h3>${amount * -1}</h3>
      </div>

      <div className="relative flex items-center gap-x-2">
        {unsavedCategoryArray.map((category, index) => (
          <button
            key={index}
            className="group p-2 rounded-lg flex w-fit items-center gap-x-2 text-xs sm:text-sm text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
            onClick={() => {
              setShowCategoryPicker(true);
              setSelectedCategory(category);
              setSelectedCategoryIndex(index);
            }}
          >
            <Icon
              className={`flex rounded-full p-1 text-zinc-700 ${
                (thisCategoryStyle && thisCategoryStyle.bgColor) ||
                "bg-zinc-900 "
              }`}
              icon={
                (thisCategoryStyle && thisCategoryStyle.icon) ||
                "mdi:shape-plus-outline"
              }
              height={24}
            />

            <p className={unsavedCategory ? "animate-pulse" : ""}>
              {unsavedCategory
                ? unsavedCategory.categoryTree.join(" > ")
                : category.categoryTree.join(" > ")}
            </p>
          </button>
        ))}

        <Button
          onClick={() => {
            //add empty category
            setUnsavedCategoryArray((prev) => [...prev]);
          }}
        >
          Add category
        </Button>
      </div>

      {selectedCategory &&
      selectedCategoryIndex !== undefined &&
      showCategoryPicker ? (
        <div className="sm:relative">
          <CategoryPicker
            unsavedCategory={unsavedCategory}
            setUnsavedCategory={setUnsavedCategory}
            category={selectedCategory}
            categoryIndex={selectedCategoryIndex}
            setTransaction={props.setTransaction}
            transaction={props.transaction}
            setShowCategoryPicker={setShowCategoryPicker}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Category;
