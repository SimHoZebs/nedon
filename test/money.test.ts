import { toMoney } from "../lib/util/money";

import { describe, expect, test } from "vitest";

describe("toMoney", () => {
  test.each([
    [1.005, "1.01"],
    [10.999, "11"],
    [-1.005, "-1.01"],
    [12.34, "12.34"],
    [-0, "0"],
    ["9007199254740993.129", "9007199254740993.13"],
  ])("normalizes %s to %s", (value, expected) => {
    expect(toMoney(value)).toBe(expected);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])("rejects non-finite value %s", (value) => {
    expect(() => toMoney(value)).toThrow(RangeError);
  });
});
