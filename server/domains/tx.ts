import type { Tx, UnsavedTx } from "@/types/tx";

import { createCatWithoutTxInput } from "./cat";

import { Prisma } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { convertPlaidCatToCat } from "lib/domain/cat";
import { createTxFromGenericTx } from "lib/domain/tx";
import type { GenericBankTransaction, GenericRemovedBankTransaction } from "server/services/IBankService";
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
  txSyncResponse: {
    added: GenericBankTransaction[];
    modified: GenericBankTransaction[];
    removed: GenericRemovedBankTransaction[];
    cursor?: string;
  },
  userId: string,
  dateString: string,
) => {
  try {
    const { added, modified, removed, cursor } = txSyncResponse;

    console.log(
      `added: ${added.length}, modified: ${modified.length}, removed: ${removed.length}`,
    );

    // newly added txs gets created
    //FUTURE: make this somehow asynchoronous so users don't have to wait for all txs to be added to see their existing tx
    const txCreateQueryArray = added.map((genericTx) => {
      const newTx = createTxFromGenericTx(userId, genericTx);
      return db.tx.create({ data: createTxInput(newTx), include: txInclude });
    });

    await db.$transaction(txCreateQueryArray);

    // --- END CREATING NEW TXS ---

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

    // modified txs gets updated and removed txs gets deleted
    for (const genericTx of modified) {
      const matchingTxIndex = txArray.findIndex(
        (tx) => tx.plaidId === genericTx.id,
      );
      if (matchingTxIndex === -1) {
        console.error(
          `Somehow there is no matching tx for ${genericTx.id}. Skipping`,
        );
        continue;
      }
      const matchingTx = txArray[matchingTxIndex];

      const cat = genericTx.category
        ? convertPlaidCatToCat(
            { primary: genericTx.category.primary, detailed: genericTx.category.detailed || "" },
            matchingTx.id,
            Prisma.Decimal(0),
          )
        : undefined;

      await db.tx.update({
        where: {
          id: matchingTx.id,
        },
        data: {
          plaidId: matchingTx.plaidId || undefined,
          plaidTx: genericTx.raw,
          catArray: {
            deleteMany: {},
            create: cat,
          },
        },
      });
    }

    for (const genericTx of removed) {
      const matchingTxIndex = txArray.findIndex(
        (tx) => tx.plaidId === genericTx.id,
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
