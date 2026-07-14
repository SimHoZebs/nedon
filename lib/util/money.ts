import { Prisma } from "@prisma/client";

export const toMoney = (value: number): number => {
  if (!Number.isFinite(value)) {
    throw new RangeError("Money values must be finite");
  }

  const normalized = new Prisma.Decimal(value).toDecimalPlaces(2).toNumber();
  return normalized === 0 ? 0 : normalized;
};
