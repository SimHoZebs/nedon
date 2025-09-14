import AccountCard from "@/comp/home/AccountCard";
import { H2, H3 } from "@/comp/shared/Heading";

import { trpc } from "@/util/trpc";

import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import type { AccountBase } from "plaid";
import { useRef } from "react";

interface Props {
  setShowAccountModal: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedAccount: React.Dispatch<
    React.SetStateAction<AccountBase | undefined>
  >;
}

const AccountsView = (props: Props) => {
  const { user: appUser, isLoading } = useAutoLoadUser();
  const getAllAccounts = trpc.user.getAllAccounts.useQuery(
    { userId: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser && !isLoading },
  );
  const allAccounts = getAllAccounts.data?.ok ? getAllAccounts.data.value : [];

  const loading = useRef(
    <div className="h-7 w-1/4 animate-pulse rounded-lg bg-zinc-700" />,
  );

  const total =
    allAccounts && allAccounts.length > 0
      ? allAccounts.reduce(
          (sum, account) => sum + (account.balances.available || 0),
          0,
        )
      : 0;

  return (
    <section className="flex h-full w-full flex-col items-center gap-y-3 lg:w-2/5">
      <div className="flex w-full max-w-md flex-col items-center">
        <H2>All Accounts</H2>

        <div className="flex w-full">
          <H3>Total: ${total}</H3>
        </div>

        {getAllAccounts.isSuccess ? (
          allAccounts && allAccounts.length > 0 ? (
            allAccounts.map(
              (account) =>
                account.balances.available && (
                  <AccountCard
                    key={account.account_id}
                    onClick={() => {
                      props.setClickedAccount(account);
                      props.setShowAccountModal(true);
                    }}
                  >
                    <p>{account.name}</p>
                    <p className="font-light">${account.balances.available}</p>
                  </AccountCard>
                ),
            )
          ) : (
            <div>
              Your connection is fine, but we could not find any accounts in our
              database.
            </div>
          )
        ) : (
          Array.from({ length: 3 }).map((_, index) => (
            //biome-ignore lint: it's just a loading spinner
            <AccountCard key={index} disabled={true}>
              {loading.current}
              {loading.current}
            </AccountCard>
          ))
        )}
      </div>
    </section>
  );
};

export default AccountsView;
