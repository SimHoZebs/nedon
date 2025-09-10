export const exact =
  <U>() =>
  <T extends U>(value: T & Record<Exclude<keyof T, keyof U>, never>): U =>
    value;

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
