import type { Cat } from "@/types/cat";
import type { CatSettings } from "@/types/catSettings";
import type { Money } from "@/types/money";
import type { Receipt } from "@/types/receipt";
import type { BaseReceiptItem } from "@/types/receiptItem";
import type { SplitTx, Tx } from "@/types/tx";
import type { UserSettings } from "@/types/userSettings";

import type {
  Cat as PrismaCat,
  CatSettings as PrismaCatSettings,
  Receipt as PrismaReceipt,
  ReceiptItem as PrismaReceiptItem,
  Tx as PrismaTx,
  UserSettings as PrismaUserSettings,
} from "@prisma/client";
import { Prisma } from "@prisma/client";

export type PrismaReceiptWithItems = PrismaReceipt & {
  items: PrismaReceiptItem[];
};

export type PrismaUserSettingsWithCats = PrismaUserSettings & {
  catSettings: PrismaCatSettings[];
};

export type PrismaTxWithRelations = PrismaTx & {
  catArray: PrismaCat[];
  receipt: PrismaReceiptWithItems | null;
  splitTxArray: PrismaTx[];
};

export function prismaDecimalToMoney(value: Prisma.Decimal): Money {
  const stringValue = value.toString();
  return /e/i.test(stringValue)
    ? value.toFixed(value.decimalPlaces())
    : stringValue;
}

export function normalizeMoneyValue(value: string | number): Money {
  return prismaDecimalToMoney(new Prisma.Decimal(value));
}

export function mapCat(record: PrismaCat): Cat {
  return {
    id: record.id,
    amount: prismaDecimalToMoney(record.amount),
    primary: record.primary,
    detailed: record.detailed,
    description: record.description,
    txId: record.txId,
  };
}

export function mapReceiptItem(record: PrismaReceiptItem): BaseReceiptItem {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    quantity: record.quantity,
    unit_price: prismaDecimalToMoney(record.unit_price),
    mds: record.mds,
    receiptId: record.receiptId,
  };
}

export function mapReceipt(record: PrismaReceiptWithItems): Receipt {
  return {
    id: record.id,
    is_receipt: record.is_receipt,
    transaction_id: record.transaction_id,
    date: record.date,
    merchant: record.merchant,
    subtotal: prismaDecimalToMoney(record.subtotal),
    currency: record.currency,
    tax: prismaDecimalToMoney(record.tax),
    tip: prismaDecimalToMoney(record.tip),
    grand_total: prismaDecimalToMoney(record.grand_total),
    payment_method: record.payment_method,
    online_link: record.online_link,
    location: record.location,
    txId: record.txId,
    items: record.items.map(mapReceiptItem),
  };
}

export function mapCatSettings(record: PrismaCatSettings): CatSettings {
  return {
    id: record.id,
    name: record.name,
    budget: prismaDecimalToMoney(record.budget),
    userSettingsId: record.userSettingsId,
    parentId: record.parentId,
  };
}

export function mapUserSettings(
  record: PrismaUserSettingsWithCats,
): UserSettings {
  return {
    id: record.id,
    userId: record.userId,
    catSettings: record.catSettings.map(mapCatSettings),
  };
}

export function mapSplitTx(record: PrismaTx): SplitTx {
  return {
    id: record.id,
    kind: record.kind,
    ownerId: record.ownerId,
    originalBankTxId: record.originalBankTxId,
    originTxId: record.originTxId,
    userTotal: prismaDecimalToMoney(record.userTotal),
    recurring: record.recurring,
    mds: record.mds,
    name: record.name,
    amount: prismaDecimalToMoney(record.amount),
    datetime: record.datetime,
    authorizedDatetime: record.authorizedDatetime,
    accountId: record.financialAccountId,
    logoUrl: record.logoUrl,
    isoCurrencyCode: record.isoCurrencyCode,
    locationAddress: record.locationAddress,
    locationCity: record.locationCity,
    locationRegion: record.locationRegion,
    locationPostalCode: record.locationPostalCode,
    locationCountry: record.locationCountry,
  };
}

export function mapTx(record: PrismaTxWithRelations): Tx {
  return {
    ...mapSplitTx(record),
    splitTxArray: record.splitTxArray.map(mapSplitTx),
    receipt: record.receipt ? mapReceipt(record.receipt) : null,
    catArray: record.catArray.map(mapCat),
  };
}
