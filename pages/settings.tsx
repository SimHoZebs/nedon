import { ActionBtn } from "@/comp/shared/Button";
import { H2 } from "@/comp/shared/Heading";

import { useStore } from "lib/store/store";
import { useRouter } from "next/router";
import { useId } from "react";

const Settings = () => {
  const router = useRouter();
  const verticalCatPicker = useStore((state) => state.verticalCatPicker);
  const setVerticalCatPicker = useStore((state) => state.setVerticalCatPicker);

  const verticalCatPickerId = useId();

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
          id={verticalCatPickerId}
          checked={verticalCatPicker}
          onChange={(e) => {
            setVerticalCatPicker(e.target.checked);
          }}
        />
        <label htmlFor={verticalCatPickerId}>make cat picker vertical</label>
      </div>

      <H2>DEBUG AREA</H2>
    </section>
  );
};

export default Settings;
