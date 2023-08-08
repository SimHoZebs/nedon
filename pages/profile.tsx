import React from "react";
import { useStore } from "../lib/util/store";
import Button from "../lib/comp/Button/ActionBtn";
import { useRouter } from "next/router";
import { Icon } from "@iconify-icon/react";

const Page = () => {
  const router = useRouter();
  const verticalCategoryPicker = useStore(
    (state) => state.verticalCategoryPicker
  );
  const setAppUser = useStore((state) => state.setAppUser);
  const setAppGroup = useStore((state) => state.setAppGroup);
  const setVerticalCategoryPicker = useStore(
    (state) => state.setVerticalCategoryPicker
  );

  return (
    <section className="flex h-full w-full flex-col items-start gap-y-3">
      <Button
        variant="negative"
        className="gap-x-2"
        onClick={() => {
          router.push("/");
          setAppUser(undefined);
          setAppGroup(undefined);
        }}
      >
        <Icon
          className="text-zinc-600 group-hover:text-zinc-500"
          icon="mdi:logout"
          width={16}
        />
        logout
      </Button>
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
