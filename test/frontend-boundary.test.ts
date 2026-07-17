import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

const sourceExtensions = new Set([".ts", ".tsx"]);

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? collectSourceFiles(entryPath)
      : sourceExtensions.has(path.extname(entry.name))
        ? [entryPath]
        : [];
  });
}

test("frontend and shared code do not import Prisma", () => {
  const files = ["lib", "pages"]
    .flatMap((directory) => collectSourceFiles(directory))
    .filter(
      (file) => !file.includes(`${path.sep}pages${path.sep}api${path.sep}`),
    );
  const prismaImports = files.filter((file) =>
    readFileSync(file, "utf8").includes("@prisma/client"),
  );

  expect(prismaImports).toEqual([]);
});

test("frontend and shared code do not import financial provider internals", () => {
  const files = ["lib", "pages"]
    .flatMap((directory) => collectSourceFiles(directory))
    .filter(
      (file) => !file.includes(`${path.sep}pages${path.sep}api${path.sep}`),
    );
  const forbiddenImports = files.filter((file) => {
    const contents = readFileSync(file, "utf8");
    return (
      contents.includes('from "plaid"') ||
      contents.includes("server/financial/providers")
    );
  });

  expect(forbiddenImports).toEqual([]);
});
