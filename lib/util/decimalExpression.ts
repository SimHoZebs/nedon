import Decimal from "decimal.js";

const tokenPattern = /(?:\d+(?:\.\d*)?|\.\d+)|[+\-*/]/g;

export function evaluateDecimalExpression(expression: string): Decimal {
  const compactExpression = expression.replaceAll(/\s/g, "");
  const tokens = compactExpression.match(tokenPattern) ?? [];

  if (!compactExpression || tokens.join("") !== compactExpression) {
    throw new Error("Invalid expression");
  }

  let index = 0;

  const parseNumber = (): Decimal => {
    let sign = 1;
    while (tokens[index] === "+" || tokens[index] === "-") {
      if (tokens[index] === "-") sign *= -1;
      index++;
    }

    const token = tokens[index++];
    if (!token || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
      throw new Error("Expected a number");
    }

    return new Decimal(token).mul(sign);
  };

  const parseProduct = (): Decimal => {
    let value = parseNumber();

    while (tokens[index] === "*" || tokens[index] === "/") {
      const operator = tokens[index++];
      const right = parseNumber();
      value = operator === "*" ? value.mul(right) : value.div(right);
    }

    return value;
  };

  let value = parseProduct();
  while (tokens[index] === "+" || tokens[index] === "-") {
    const operator = tokens[index++];
    const right = parseProduct();
    value = operator === "+" ? value.plus(right) : value.minus(right);
  }

  if (index !== tokens.length || !value.isFinite()) {
    throw new Error("Invalid expression");
  }

  return value;
}
