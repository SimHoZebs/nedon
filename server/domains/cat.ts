import type { Prisma } from "@prisma/client";
import { Prisma as PrismaClient } from "@prisma/client";
import type { CatFormState } from "lib/types/cat";

export const createCatWithoutTxInput = (
  input: CatFormState,
): Prisma.CatCreateWithoutTxInput => {
  const { txId: _txId, amount, ...rest } = input;
  return {
    ...rest,
    amount: new PrismaClient.Decimal(amount),
    id: undefined,
  };
};
