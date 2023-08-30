export const parseMoney = (value: number): number => {
  return parseFloat(value.toFixed(2));
};

export default parseMoney;
