import type { UnsavedTx } from "@/types/tx";

import { createCatWithoutTxInput } from "./cat";

import { type Prisma, TxKind } from "@prisma/client";

export const txInclude = {
  catArray: true,
  receipt: {
    include: {
      items: true,
    },
  },
  originTx: true,
  splitTxArray: true,
};

export const createTxInput = (
  txClientSide: UnsavedTx,
): Prisma.TxCreateInput => {
  const {
    catArray,
    receipt,
    splitTxArray,
    originalBankTxId: _originalBankTxId,
    originTxId: _originTxId,
    ownerId,
    ...rest
  } = txClientSide;
  const receiptCreate = receipt
    ? {
        create: {
          ...receipt,
          items: {
            createMany: { data: receipt.items },
          },
        },
      }
    : undefined;

  const catArrayCreate: Prisma.CatCreateNestedManyWithoutTxInput = {
    create: catArray.map((cat) => createCatWithoutTxInput(cat)),
  };

  return {
    ...rest,
    receipt: receiptCreate,
    catArray: catArrayCreate,
    owner: { connect: { id: ownerId } },
    splitTxArray: {
      create: splitTxArray.map((split) => ({
        ...split,
        kind: TxKind.SPLIT,
        owner: { connect: { id: split.ownerId } },
        catArray: catArrayCreate,
        receipt: receiptCreate,
      })),
    },
  };
};
