import { CatSchema } from "@/types/cat";
import { ReceiptSchema } from "@/types/receipt";
import { TxSchema } from "@/types/tx";
import { UserSettingsSchema } from "@/types/userSettings";

import {
  mapReceipt,
  mapTx,
  mapUserSettings,
  prismaDecimalToMoney,
} from "./prismaToDto";

import type {
  Cat,
  CatSettings,
  Receipt,
  ReceiptItem,
  Tx,
  UserSettings,
} from "@prisma/client";
import { MdsType, Prisma, TxKind } from "@prisma/client";
import { describe, expect, test } from "vitest";

const txRecord: Tx = {
  id: "tx-1",
  kind: TxKind.USER,
  ownerId: "user-1",
  originalBankTxId: null,
  originTxId: null,
  userTotal: new Prisma.Decimal("12.30"),
  recurring: false,
  mds: MdsType.MANDATORY,
  bankId: null,
  name: "Groceries",
  amount: new Prisma.Decimal("12.30"),
  datetime: null,
  authorizedDatetime: new Date("2026-07-16T12:00:00.000Z"),
  accountId: null,
  logoUrl: null,
  isoCurrencyCode: "USD",
  locationAddress: null,
  locationCity: null,
  locationRegion: null,
  locationPostalCode: null,
  locationCountry: null,
};

const catRecord: Cat = {
  id: "cat-1",
  amount: new Prisma.Decimal("12.30"),
  primary: "FOOD_AND_DRINK",
  detailed: "GROCERIES",
  description: "Groceries",
  txId: txRecord.id,
};

const receiptItemRecord: ReceiptItem = {
  id: "item-1",
  name: "Milk",
  description: "",
  quantity: 1,
  unit_price: new Prisma.Decimal("1e-7"),
  mds: MdsType.MANDATORY,
  receiptId: "receipt-1",
};

const receiptRecord: Receipt & { items: ReceiptItem[] } = {
  id: "receipt-1",
  is_receipt: true,
  transaction_id: "merchant-tx-1",
  date: new Date("2026-07-16T12:00:00.000Z"),
  merchant: "Market",
  subtotal: new Prisma.Decimal("10.00"),
  currency: "USD",
  tax: new Prisma.Decimal("1.00"),
  tip: new Prisma.Decimal("1.30"),
  grand_total: new Prisma.Decimal("12.30"),
  payment_method: "card",
  online_link: "",
  location: "",
  txId: txRecord.id,
  items: [receiptItemRecord],
};

describe("Prisma DTO mappers", () => {
  test("normalizes exponential decimals without losing precision", () => {
    expect(prismaDecimalToMoney(new Prisma.Decimal("1e-7"))).toBe("0.0000001");
  });

  test("maps nested transaction money and omits loaded originTx records", () => {
    const record = {
      ...txRecord,
      catArray: [catRecord],
      receipt: receiptRecord,
      splitTxArray: [{ ...txRecord, id: "split-1", kind: TxKind.SPLIT }],
      originTx: txRecord,
    };

    const dto = mapTx(record);

    expect(TxSchema.parse(dto)).toEqual(dto);
    expect(dto.amount).toBe("12.3");
    expect(dto.receipt?.items[0].unit_price).toBe("0.0000001");
    expect(dto.authorizedDatetime).toBe(txRecord.authorizedDatetime);
    expect(dto.datetime).toBeNull();
    expect(dto).not.toHaveProperty("originTx");
  });

  test("maps receipt and settings money to DTO strings", () => {
    const catSettings: CatSettings = {
      id: "settings-cat-1",
      name: "Food",
      budget: new Prisma.Decimal("250.00"),
      userSettingsId: "settings-1",
      parentId: null,
    };
    const userSettings: UserSettings & { catSettings: CatSettings[] } = {
      id: "settings-1",
      userId: "user-1",
      catSettings: [catSettings],
    };

    expect(ReceiptSchema.parse(mapReceipt(receiptRecord))).toBeTruthy();
    expect(
      UserSettingsSchema.parse(mapUserSettings(userSettings)).catSettings[0]
        .budget,
    ).toBe("250");
    expect(
      CatSchema.parse(
        mapTx({
          ...txRecord,
          catArray: [catRecord],
          receipt: null,
          splitTxArray: [],
        }).catArray[0],
      ).amount,
    ).toBe("12.3");
  });
});
