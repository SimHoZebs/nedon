/**
 * To avoid repetition and redundancy, only use this on the front end.
 */
export const parseMoney = (value: number): number => {
  return Number.parseFloat(value.toFixed(2));
};

export default parseMoney;
