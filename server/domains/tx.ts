import type { TxFormState } from "@/types/tx";

import { createCatWithoutTxInput } from "./cat";

import { Prisma, TxKind } from "@prisma/client";

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
  txClientSide: TxFormState,
): Prisma.TxCreateInput => {
  const {
    catArray,
    receipt,
    splitTxArray,
    amount,
    userTotal,
    originalBankTxId: _originalBankTxId,
    originTxId: _originTxId,
    id: _id,
    ownerId,
    ...rest
  } = txClientSide;
  const receiptCreate = receipt
    ? {
        create: {
          ...receipt,
          id: undefined,
          txId: undefined,
          subtotal: new Prisma.Decimal(receipt.subtotal),
          tax: new Prisma.Decimal(receipt.tax),
          tip: new Prisma.Decimal(receipt.tip),
          grand_total: new Prisma.Decimal(receipt.grand_total),
          items: {
            createMany: {
              data: receipt.items.map((item) => ({
                ...item,
                id: undefined,
                receiptId: undefined,
                unit_price: new Prisma.Decimal(item.unit_price),
              })),
            },
          },
        },
      }
    : undefined;

  const catArrayCreate: Prisma.CatCreateNestedManyWithoutTxInput = {
    create: catArray.map((cat) => createCatWithoutTxInput(cat)),
  };

  return {
    ...rest,
    amount: new Prisma.Decimal(amount),
    userTotal: new Prisma.Decimal(userTotal),
    receipt: receiptCreate,
    catArray: catArrayCreate,
    owner: { connect: { id: ownerId } },
    splitTxArray: {
      create: splitTxArray.map((split) => {
        const {
          ownerId: splitOwnerId,
          id: _splitId,
          amount: splitAmount,
          userTotal: splitUserTotal,
          ...splitRest
        } = split;
        return {
          ...splitRest,
          amount: new Prisma.Decimal(splitAmount),
          userTotal: new Prisma.Decimal(splitUserTotal),
          kind: TxKind.SPLIT,
          owner: { connect: { id: splitOwnerId } },
          catArray: catArrayCreate,
          receipt: receiptCreate,
        };
      }),
    },
  };
};
