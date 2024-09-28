export type TreedCat = {
  name: string;
  subCatArray: TreedCat[];
};

export type TreedCatWithTx = {
  name: string;
  budget: number;
  spending: number;
  received: number;
  txArray: TxClientSide[];
  subCatArray: TreedCatWithTx[];
};

export const CatClientSideSchema = CatOptionalDefaultsSchema.extend({
  txId: z.string().optional(),
});
export type CatClientSide = z.infer<typeof CatClientSideSchema>;

export const isCatInDB = (cat: CatClientSide): cat is Cat => {
  return cat.id !== undefined;
};

export const isCatArrayInDB = (obj: unknown): obj is Cat[] => {
  if (!Array.isArray(obj)) return false;
  return obj.every(isCatInDB);
};
