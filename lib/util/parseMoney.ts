export const parseMoney = (value: number): number => {
  return Number.parseFloat(value.toFixed(2));
};

export default parseMoney;
