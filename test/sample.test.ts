import { expect, test, vi } from "vitest";

vi.mock("../lib/util/db");

test("1 === 1", () => {
  expect(1).toBe(1);
});
