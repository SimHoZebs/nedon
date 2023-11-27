import { useRouter } from "next/router";
import React from "react";

import { ActionBtn } from "@/comp/Button";

import { useStore } from "@/util/store";

const Page = () => {
  const router = useRouter();
  const verticalCategoryPicker = useStore(
    (state) => state.verticalCategoryPicker,
  );
  const setVerticalCategoryPicker = useStore(
    (state) => state.setVerticalCategoryPicker,
  );

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
    </section>
  );
};

export default Page;
