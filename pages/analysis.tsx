import React, { useMemo } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import { organizeTransactionByCategory } from "../lib/util/transaction";
import { Transaction as PlaidTransaction } from "plaid";

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

  const organizedTransactionArray = useMemo(() => {
    if (!transactionArray.data) return [];
    return organizeTransactionByCategory(
      transactionArray.data as PlaidTransaction[]
    );
  }, [transactionArray.data]);

  return <pre>{JSON.stringify(organizedTransactionArray, null, 2)}</pre>;
};

export default Page;
