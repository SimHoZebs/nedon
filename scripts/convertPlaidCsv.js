function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

import fs from "node:fs";
import https from "node:https";

async function main() {
  const content = await new Promise((resolve, reject) => {
    https.get(
      "https://plaid.com/documents/transactions-personal-finance-category-taxonomy.csv",
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
        res.on("error", reject);
      },
    );
  });

  const lines = content
    .split("\n")
    .slice(1)
    .filter((l) => l.trim());
  const categories = lines
    .map((line) => {
      const [primary, detailed, description] = parseCSVLine(line);
      return {
        primary,
        detailed,
        description: description.replace(/^"/, "").replace(/"$/, ""),
      };
    })
    .filter(Boolean)
    .reduce((acc, cat) => {
      if (!acc[cat.primary]) acc[cat.primary] = {};
      acc[cat.primary][cat.detailed] = { description: cat.description };
      return acc;
    }, {});
  fs.writeFileSync(
    "./server/util/plaidCategories.ts",
    `export const plaidCategories = ${JSON.stringify(categories, null, 2)} as const;`,
  );
}

main();
