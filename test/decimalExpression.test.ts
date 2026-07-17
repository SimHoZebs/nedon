import { evaluateDecimalExpression } from "../lib/util/decimalExpression";

import { describe, expect, test } from "vitest";

describe("evaluateDecimalExpression", () => {
  test.each([
    ["0.1+0.2", "0.3"],
    ["2+3*4", "14"],
    ["10/4-1", "1.5"],
    ["-2*-3", "6"],
  ])("evaluates %s exactly", (expression, expected) => {
    expect(evaluateDecimalExpression(expression).toString()).toBe(expected);
  });

  test.each([
    "",
    "1+",
    "1a+2",
    "1/0",
  ])("rejects invalid expression %s", (expression) => {
    expect(() => evaluateDecimalExpression(expression)).toThrow();
  });
});
