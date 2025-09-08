export const exact =
  <U>() =>
  <T extends U>(value: T & Record<Exclude<keyof T, keyof U>, never>): U =>
    value;
