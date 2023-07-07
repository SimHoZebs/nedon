import React from "react";
import { useStoreActions } from "../lib/util/store";
import Button from "../lib/comp/Button/ActionBtn";
import { useRouter } from "next/router";
import { Icon } from "@iconify-icon/react";

const Page = () => {
  const router = useRouter();
  const { setAppUser, setAppGroup } = useStoreActions((actions) => actions);

  return (
    <section className="flex h-full w-fit flex-col gap-y-3">
      <Button
        variant="negative"
        className="gap-x-2"
        onClick={() => {
          router.push("/");
          setAppUser(() => undefined);
          setAppGroup(() => undefined);
        }}
      >
        <Icon
          className="text-zinc-600 group-hover:text-zinc-500"
          icon="mdi:logout"
          width={16}
        />
        logout
      </Button>
    </section>
  );
};

export default Page;
