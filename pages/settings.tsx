import { useRouter } from "next/router";
import React from "react";

import { ActionBtn } from "@/comp/Button";

import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";

const Settings = () => {
  const router = useRouter();
  const verticalCategoryPicker = useStore(
    (state) => state.verticalCategoryPicker,
  );
  const setVerticalCategoryPicker = useStore(
    (state) => state.setVerticalCategoryPicker,
  );
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
          id="verticalCategoryPicker"
          checked={verticalCategoryPicker}
          onChange={(e) => {
            setVerticalCategoryPicker(e.target.checked);
          }}
        />
        <label htmlFor="verticalCategoryPicker">
          make category picker vertical
        </label>
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
