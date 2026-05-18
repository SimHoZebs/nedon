import type { Tx, UnsavedTx } from "@/types/tx";

import { createCatWithoutTxInput } from "./cat";

import { Prisma } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { convertPlaidCatToCat } from "lib/domain/cat";
import { createTxFromGenericTx } from "lib/domain/tx";
import type { BankTransaction, RemovedBankTransaction, BankSyncResult } from "server/services/IBankService";
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

export const createTxInput = (
  txClientSide: UnsavedTx,
): Prisma.TxCreateInput => {
  const {
    catArray,
    receipt,
    splitTxArray,
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
    plaidTx: rest.plaidTx || undefined,
    catArray: catArrayCreate,
    owner: { connect: { id: ownerId } },
    splitTxArray: {
      create: splitTxArray.map((split) => ({
        ...split,
        owner: { connect: { id: split.ownerId } },
        catArray: catArrayCreate,
        receipt: receiptCreate,
      })),
    },
  };
};

/**
 * Merges Bank transaction sync data with existing database transactions.
 * Handles creation of new transactions, updates to modified ones, and deletion of removed ones.
 */
export const mergeBankTxWithTxArray = async (
  txSyncResponse: BankSyncResult,
  userId: string,
  dateString: string,
) => {
  try {
    const { upserted, removed, nextSyncToken } = txSyncResponse;

    console.log(
      `upserted: ${upserted.length}, removed: ${removed.length}`,
    );

    // 1. Process all removed transactions first
    for (const bankTx of removed) {
      await db.tx.deleteMany({
        where: {
          plaidId: bankTx.id, // Using deleteMany as plaidId is not necessarily unique unless @unique is added in schema
        },
      });
    }

    // 2. Process all upserted transactions safely querying the DB
    for (const bankTx of upserted) {
      const existingTx = await db.tx.findFirst({
        where: {
          plaidId: bankTx.id,
        },
      });

      if (!existingTx) {
          // newly added txs gets created
          const newTx = createTxFromGenericTx(userId, bankTx);
          await db.tx.create({ data: createTxInput(newTx), include: txInclude });
      } else {
        // modified txs gets updated
        const cat = bankTx.category
          ? convertPlaidCatToCat(
              { primary: bankTx.category.primary, detailed: bankTx.category.detailed || "" },
              existingTx.id,
              Prisma.Decimal(0),
            )
          : undefined;

        await db.tx.update({
          where: {
            id: existingTx.id,
          },
          data: {
            plaidId: existingTx.plaidId || undefined,
            plaidTx: bankTx.raw,
            catArray: {
              deleteMany: {},
              create: cat,
            },
          },
        });
      }
    }

    // 3. Fetch current month's transactions to return to the client
    const date = new Date(dateString);

    const firstDayThisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayThisMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    );

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

    //at the moment it's impossible to have no cursor and have nothing added.
    if (!nextSyncToken && upserted.length < 1) return null;

    return { txArray, nextSyncToken };
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      console.log("Validation error in creating tx: ", error.message);
      return null;
    }

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

    console.error("Unknown error in creating tx: ", error);
  }
};
