import type { Prisma } from "@prisma/client";
import type { UnsavedCat } from "lib/types/cat";

export const createCatWithoutTxInput = (
  input: UnsavedCat,
): Prisma.CatCreateWithoutTxInput => {
  const { txId: _txId, ...rest } = input;
  return {
    ...rest,
    id: undefined,
  };
};
