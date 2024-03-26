import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import type { AccountBase, AuthGetResponse } from "plaid";
import React, { useRef, useState } from "react";

import { H1 } from "@/comp/Heading";
import AccountCard from "@/comp/home/AccountCard";
import AccountModal from "@/comp/home/AccountModal";

import getAppUser from "@/util/getAppUser";
import { trpc } from "@/util/trpc";

const User: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [clickedAccount, setClickedAccount] = useState<AccountBase>();

  const { appUser } = getAppUser();

  const auth = trpc.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );

  const loading = useRef(
    <div className="h-7 w-1/4 animate-pulse rounded-lg bg-zinc-700" />,
  );

  return (
    <section className="flex h-full w-full flex-col items-center gap-y-3">
      <H1>All Accounts</H1>

      {showModal && (
        <motion.div
          className="absolute left-0 top-0 z-10 h-full w-full overflow-hidden bg-zinc-950 bg-opacity-70 backdrop-blur-sm sm:justify-center"
          onMouseDown={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <AnimatePresence>
        {showModal && clickedAccount && (
          <AccountModal
            setShowModal={setShowModal}
            clickedAccount={clickedAccount}
          />
        )}
      </AnimatePresence>

      <div className="flex w-full max-w-md flex-col gap-y-3">
        {auth.fetchStatus === "idle" && auth.status !== "pending" ? (
          auth.data ? (
            (auth.data as unknown as AuthGetResponse).accounts.map(
              (account) =>
                account.balances.available && (
                  <AccountCard
                    key={account.account_id}
                    onClick={() => {
                      setClickedAccount(account);
                      setShowModal(true);
                    }}
                  >
                    <p>{account.name}</p>
                    <p>${account.balances.available}</p>
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

export default User;
