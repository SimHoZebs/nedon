import { useRouter } from "next/router";
import React, { type ChangeEvent, useRef } from "react";
import { z } from "zod";

import { ActionBtn, Button } from "@/comp/Button";
import { H2 } from "@/comp/Heading";
import CreateUserBtn from "@/comp/user/CreateuserBtn";

import getAppUser from "@/util/getAppUser";
import { useLocalStore, useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { createTxFromChaseCSV } from "@/util/tx";

import { type ChaseCSVTx, ChaseCSVTxSchema } from "@/types/tx";

const Settings = () => {
  const router = useRouter();
  const verticalCatPicker = useStore((state) => state.verticalCatPicker);
  const setVerticalCatPicker = useStore((state) => state.setVerticalCatPicker);
  const [csvTxArray, setCsvTxArray] = React.useState<ChaseCSVTx[]>([]);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const { appUser, allUsers } = getAppUser();
  const deleteAll = trpc.user.deleteAll.useMutation();
  const deleteUser = trpc.user.delete.useMutation();
  const addConnection = trpc.user.addConnection.useMutation();
  const removeConnection = trpc.user.removeConnection.useMutation();
  const createManyTx = trpc.tx.createMany.useMutation();
  const queryClient = trpc.useUtils();
  const setUserId = useLocalStore((state) => state.setUserId);

  const csvToTx = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log("csvToTx");
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result;
      if (!text) return;

      if (typeof text === "string") {
        const lines = text.split("\n");

        const headers = lines[0].split(",");

        const txArray = lines.slice(1);
        const txs: Record<string, string>[] = [];
        for (const tx of txArray) {
          const values = tx.replace(/\r$/, "").split(",");

          //means its the last line, which is empty
          if (values.length === 1) continue;

          txs.push(
            headers.reduce(
              (tx, header, i) => {
                //replace non alphabet characters with empty string
                const cleanedHeader = header.replace(/[^a-zA-Z]/g, "");

                //replace multiple spaces with single space
                const value = values[i]
                  .replace(/\s{2,}/g, " ")
                  .replaceAll('"', "");

                tx[cleanedHeader] = value;
                return tx;
              },
              {} as Record<string, string>,
            ),
          );
        }

        const chaseTxArray = z.array(ChaseCSVTxSchema).safeParse(txs);
        if (!chaseTxArray.success) {
          console.error(chaseTxArray.error);
          return;
        }

        setCsvTxArray(chaseTxArray.data);
        console.log(chaseTxArray.data[0]);
      }
    };

    reader.readAsText(file);
  };

  return (
    <section className="flex h-full w-full flex-col items-start gap-y-3">
      <ActionBtn
        variant="negative"
        className="gap-x-2"
        onClick={() => {
          router.push("/");
        }}
      >
        <span className="icon-[mdi--logout] h-4 w-4 text-zinc-600 group-hover:text-zinc-500" />
        logout
      </ActionBtn>

      <div className="flex gap-x-2">
        <input
          type="checkbox"
          id="verticalCatPicker"
          checked={verticalCatPicker}
          onChange={(e) => {
            setVerticalCatPicker(e.target.checked);
          }}
        />
        <label htmlFor="verticalCatPicker">make cat picker vertical</label>
      </div>

      <input type="file" onChange={csvToTx} ref={csvInputRef} />
      <Button
        onClick={() => {
          const el = csvInputRef.current;
          if (!el) return;
          el.value = "";
        }}
      >
        reset csvToTx
      </Button>
      <Button
        onClickAsync={async () => {
          if (!appUser || csvTxArray.length < 1) return;

          const txArray = csvTxArray.map((csvTx) =>
            createTxFromChaseCSV(csvTx, appUser.id),
          );
          console.log("uploading txArray");
          await createManyTx.mutateAsync(txArray);
          await queryClient.tx.getAll.invalidate();
          console.log("done");
        }}
      >
        upload csvTx
      </Button>

      <H2>DEBUG AREA</H2>
      <div className="flex flex-col gap-3">
        {allUsers.data ? "User list" : "Loading available accounts...."}
        {allUsers.data?.map((user) => (
          <div className="flex rounded-md bg-zinc-800 p-1" key={user.id}>
            <div>
              <p>Name: {user.name}</p>
              <p>id: {user.id}</p>
            </div>

            <Button
              className={`after:h-full after:w-px after:bg-zinc-500 ${
                appUser?.myConnectionArray?.find(
                  (connection) => connection.id === user.id,
                )
                  ? "text-pink-400"
                  : "text-indigo-400"
              }`}
              onClickAsync={async (e) => {
                e.stopPropagation();
                if (!appUser) return;

                appUser.myConnectionArray?.find(
                  (connection) => connection.id === user.id,
                )
                  ? await removeConnection.mutateAsync({
                      userId: appUser.id,
                      connectionId: user.id,
                    })
                  : await addConnection.mutateAsync({
                      userId: appUser.id,
                      connectionId: user.id,
                    });

                await queryClient.user.invalidate();
              }}
            >
              {appUser?.myConnectionArray?.find(
                (connection) => connection.id === user.id,
              ) ? (
                <span className="icon-[mdi--user-remove-outline] h-5 w-5" />
              ) : (
                <span className="icon-[mdi--user-add-outline] h-5 w-5" />
              )}
            </Button>

            {user.id !== appUser?.id && (
              <Button
                onClick={async () => {
                  setUserId(user.id);
                  queryClient.user.getAll.invalidate();
                  queryClient.user.get.invalidate(user.id);
                }}
              >
                Log in as this user
              </Button>
            )}

            <Button
              title="Delete user"
              className="text-pink-400 hover:text-pink-500"
              onClickAsync={async (e) => {
                e.stopPropagation();
                await deleteUser.mutateAsync(user.id);
                queryClient.user.getAll.invalidate();
              }}
            >
              <span className="icon-[mdi--delete-outline] h-5 w-5" />
            </Button>
          </div>
        ))}
        <CreateUserBtn />
        <ActionBtn
          variant="negative"
          onClickAsync={async () => {
            await deleteAll.mutateAsync();
            queryClient.user.getAll.invalidate();
            await queryClient.user.invalidate();
          }}
        >
          <span className="icon-[mdi--delete-outline] h-5 w-5" />
          DELETE ALL EXISTING ACCOUNTS
        </ActionBtn>
      </div>
    </section>
  );
};

export default Settings;
