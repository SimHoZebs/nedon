import { useRouter } from "next/router";
import React from "react";

import { ActionBtn } from "@/comp/Button";

import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";

const Settings = () => {
  const router = useRouter();
  const verticalCatPicker = useStore((state) => state.verticalCatPicker);
  const setVerticalCatPicker = useStore((state) => state.setVerticalCatPicker);
  const deleteAll = trpc.user.deleteAll.useMutation();

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

      <ActionBtn
        variant="negative"
        onClickAsync={async () => {
          deleteAll.mutateAsync();
        }}
      >
        DELETE ALL EXISTING ACCOUNTS
      </ActionBtn>
    </section>
  );
};

export default Settings;
