import type { Money } from "@/types/money";

import Decimal from "decimal.js";

export const toMoney = (value: Decimal.Value): Money => {
  const decimal = new Decimal(value);

  if (!decimal.isFinite()) {
    throw new RangeError("Money values must be finite");
  }

  const normalized = decimal.toDecimalPlaces(2);
  return normalized.isZero() ? "0" : normalized.toFixed();
};

export const toDecimal = (value: Decimal.Value): Decimal => new Decimal(value);
