import React, { useState } from "react";
import CategoryPicker from "./CategoryPicker";
import { PlaidTransaction } from "../../../util/types";

interface Props {
  selectedTransaction: PlaidTransaction;
}

const Category = (props: Props) => {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  return (
    <div
      className="relative w-full"
      onClick={() => {
        setShowCategoryPicker((prev) => !prev);
      }}
    >
      <CategoryPicker
        showCategoryPicker={showCategoryPicker}
        selectedTransaction={props.selectedTransaction}
        setShowCategoryPicker={setShowCategoryPicker}
      />
    </div>
  );
};

export default Category;
