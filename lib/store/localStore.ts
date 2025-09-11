import { useEffect, useState } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * A helper function to get data from a zustand store with a delay to avoid
 * hydration issues in Next.js.
 *
 * ref: https://zustand.docs.pmnd.rs/integrations/persisting-store-data#usage-in-next.js
 */
export const useLocalStoreDelay = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};

interface LocalStore {
  userId: string | null;
  setUserId: (userId: string | null) => void;
}

export const useLocalStore = create<LocalStore>()(
  devtools(
    persist(
      (set) => ({
        userId: null,
        setUserId: (userId) => set({ userId }),
      }),

      { name: "local-storage" },
    ),
  ),
);
