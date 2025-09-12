import type { Tx, UnsavedTx } from "@/types/tx";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createTxFromPlaidTx } from "lib/domain/tx";
import type { RemovedTransaction, Transaction } from "plaid";
import db from "server/util/db";

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

export const createTxInput = (txClientSide: UnsavedTx) => {
  const { catArray, receipt, splitTxArray, ...rest } = txClientSide;
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

  const catArrayCreate = {
    create: catArray.map((cat) => ({
      name: cat.name,
      amount: cat.amount,
      primary: cat.primary,
      detailed: cat.detailed,
    })),
  };

  return {
    data: {
      ...rest,
      receipt: receiptCreate,
      plaidTx: rest.plaidTx || undefined,
      catArray: catArrayCreate,
      splitTxArray: {
        create: splitTxArray.map((split) => ({
          ...split,
          owner: { connect: { id: split.ownerId } },
          plaidTx: split.plaidTx || undefined,
          catArray: catArrayCreate,
          receipt: receiptCreate,
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
  userId: string,
  dateString: string,
) => {
  const { added, modified, removed, cursor } = txSyncResponse;

  console.log(
    `added: ${added.length}, modified: ${modified.length}, removed: ${removed.length}`,
  );

  // newly added txs gets created
  //FUTURE: make this somehow asynchoronous so users don't have to wait for all txs to be added to see their existing tx
  const txCreateQueryArray = added.map((plaidTx) => {
    const newTx = createTxFromPlaidTx(userId, plaidTx);
    return db.tx.create(createTxInput(newTx));
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

  const txArray: Tx[] = await db.tx.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          recurring: true,
          ownerId: userId,
          authorizedDatetime: {
            gte: firstDayThisMonth.toISOString(),
            lte: lastDayThisMonth.toISOString(),
          },
        },
      ],
    },
    include: {
      catArray: true,
      receipt: {
        include: {
          items: true,
        },
      },
      originTx: true,
      splitTxArray: true,
    },
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

    const primary =
      plaidTx.personal_finance_category?.primary || "Uncategorized";
    const detailed =
      plaidTx.personal_finance_category?.detailed || "Uncategorized";

    await db.tx.update({
      where: {
        id: matchingTx.id,
      },
      data: {
        plaidId: matchingTx.plaidId || undefined,
        catArray: {
          deleteMany: {},
          create: {
            name: detailed,
            primary: primary,
            detailed: detailed,
            amount: matchingTx.amount,
          },
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
