import db from "@/util/db";
import { createTxFromPlaidTx } from "@/util/tx";

import type { BaseTx, TxInDB } from "@/types/tx";

import type { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { RemovedTransaction, Transaction } from "plaid";

export const txInclude = {
  catArray: true,
  splitArray: {
    include: {
      user: true,
    },
  },
  receipt: {
    include: {
      items: true,
    },
  },
  user: true,
  originTx: true,
  refSplit: true,
  splitTxArray: true,
};

export const createTxInDBInput = (txClientSide: BaseTx) => {
  return {
    data: {
      ...txClientSide,
      originTxId: txClientSide.originTxId || undefined,
      plaidTx: txClientSide.plaidTx || undefined,
      receipt: txClientSide.receipt
        ? {
            create: {
              ...txClientSide.receipt,
              items: {
                createMany: { data: txClientSide.receipt.items },
              },
            },
          }
        : undefined,
      splitArray: {
        create: txClientSide.splitArray.map(({ originTxId, ...split }) => ({
          ...split,
        })),
      },
      catArray: {
        create: txClientSide.catArray.map(({ txId, ...cat }) => ({
          ...cat,
        })),
      },
    },
    include: txInclude,
  };
};

/**
 * Merges Plaid transaction sync data with existing database transactions.
 * Handles creation of new transactions, updates to modified ones, and deletion of removed ones.
 */
export const mergePlaidTxWithTxArray = async (
  txSyncResponse: {
    added: Transaction[];
    modified: Transaction[];
    removed: RemovedTransaction[];
    cursor?: string;
  },
  user: User,
  dateString: string,
) => {
  const { added, modified, removed, cursor } = txSyncResponse;

  console.log(
    `added: ${added.length}, modified: ${modified.length}, removed: ${removed.length}`,
  );

  // newly added txs gets created
  //FUTURE: make this somehow asynchoronous so users don't have to wait for all txs to be added to see their existing tx
  const txCreateQueryArray = added.map((plaidTx) => {
    const newTx = createTxFromPlaidTx(user.id, plaidTx);
    return db.tx.create(createTxInDBInput(newTx));
  });
  try {
    await db.$transaction(txCreateQueryArray);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          console.log(error.message);
          break;
        default:
          console.log("Error in creating tx: ", error);
          return null;
      }
    }
  }

  const date = new Date(dateString);

  const firstDayThisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayThisMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const txArray: TxInDB[] = await db.tx.findMany({
    where: {
      OR: [
        { userId: user.id },
        { splitArray: { some: { userId: user.id } } },
        {
          recurring: true,
          userId: user.id,
          authorizedDatetime: {
            gte: firstDayThisMonth.toISOString(),
            lte: lastDayThisMonth.toISOString(),
          },
        },
      ],
    },
    include: txInclude,
  });

  // modified txs gets updated and removed txs gets deleted
  for (const plaidTx of modified) {
    const matchingTxIndex = txArray.findIndex(
      (tx) => tx.plaidId === plaidTx.transaction_id,
    );
    if (matchingTxIndex === -1) {
      throw new Error(
        `Somehow there is no matching tx for ${plaidTx.transaction_id}`,
      );
    }
    const matchingTx = txArray[matchingTxIndex];

    await db.tx.update({
      where: {
        id: matchingTx.id,
      },
      data: {
        plaidId: matchingTx.plaidId || undefined,
        catArray: {
          create: matchingTx.catArray.map((cat) => ({
            name: cat.name,
            nameArray: cat.nameArray,
            amount: cat.amount,
          })),
        },
        splitArray: {
          create: matchingTx.splitArray.map((split) => ({
            userId: split.userId,
            amount: split.amount,
          })),
        },
      },
    });
  }

  for (const plaidTx of removed) {
    const matchingTxIndex = txArray.findIndex(
      (tx) => tx.plaidId === plaidTx.transaction_id,
    );
    if (matchingTxIndex !== -1) {
      txArray.splice(matchingTxIndex, 1);
      db.tx.delete({
        where: {
          id: txArray[matchingTxIndex].id,
        },
      });
    }
  }

  //at the moment it's impossible to have no cursor and have nothing added.
  // In the future, this would be a valid condition if the user just created an account without linking their bank account.
  if (!cursor && added.length < 1) return null;

  return { txArray, cursor };
};
