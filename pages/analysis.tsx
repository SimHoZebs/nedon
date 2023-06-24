import React, { useMemo } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import {
  Category,
  organizeTransactionByCategory,
} from "../lib/util/transaction";
import { Transaction as PlaidTransaction } from "plaid";

const categoryTotalSpending = (category: Category): number => {
  let amount = category.transactionArray.reduce((total, transaction) => {
    return total + transaction.amount;
  }, 0);

  category.subCategory.forEach((subCategory) => {
    amount += categoryTotalSpending(subCategory);
  }, 0);

  return amount;
};

const render = (categoryArray: Category[]) =>
  categoryArray.map((category, i) => (
    <div key={i} className="border">
      <div>{category.name}</div>
      <div>{categoryTotalSpending(category)}</div>
      <div className="flex flex-col gap-y-3 p-3">
        {category.subCategory.length > 0 && render(category.subCategory)}
      </div>
    </div>
  ));

const Page = () => {
  const { appUser } = useStoreState((state) => state);
  const transactionArray = trpc.transaction.getAll.useQuery(
    { id: appUser.id },
    { staleTime: 3600000, enabled: appUser.hasAccessToken }
  );
  const transactionMetaArray = trpc.transaction.getMeta.useQuery(
    { id: appUser.id },
    { staleTime: 3600000, enabled: appUser.hasAccessToken }
  );

  const categorizedTransactionArray = useMemo(() => {
    if (!transactionArray.data) return [];
    return organizeTransactionByCategory(
      transactionArray.data as PlaidTransaction[]
    );
  }, [transactionArray.data]);

  //transactionMeta has info about owed money
  //all transactionMeta that the user is associated with should be called
  const test = transactionMetaArray.data;
  return (
    <div>
      <div>
        {transactionMetaArray.data &&
          transactionMetaArray.data.map((transaction, i) => (
            <pre key={i}>{JSON.stringify(transaction, null, 2)}</pre>
          ))}
      </div>
      <div>
        {categorizedTransactionArray.map((category, i) => (
          <div key={i} style={{ width: `%` }}></div>
        ))}
      </div>
      {render(categorizedTransactionArray)}
    </div>
  );
};

export default Page;
