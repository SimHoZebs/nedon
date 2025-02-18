import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['Serializable']);

export const GroupScalarFieldEnumSchema = z.enum(['id','ownerId']);

export const UserScalarFieldEnumSchema = z.enum(['id','name','ACCESS_TOKEN','PUBLIC_TOKEN','ITEM_ID','TRANSFER_ID','PAYMENT_ID','cursor']);

export const TxScalarFieldEnumSchema = z.enum(['id','userId','userTotal','originTxId','recurring','MDS','plaidId','name','amount','datetime','authorizedDatetime','accountId','plaidTx']);

export const SplitScalarFieldEnumSchema = z.enum(['id','userId','amount','txId','originTxId']);

export const CatScalarFieldEnumSchema = z.enum(['id','name','amount','txId']);

export const CatNameScalarFieldEnumSchema = z.enum(['id','name','catId']);

export const CatSettingsScalarFieldEnumSchema = z.enum(['id','name','budget','parentId','userId']);

export const ReceiptScalarFieldEnumSchema = z.enum(['id','is_receipt','transaction_id','date','merchant','subtotal','currency','tax','tip','grand_total','payment_method','online_link','location','txId']);

export const ReceiptItemScalarFieldEnumSchema = z.enum(['id','name','description','quantity','unit_price','MDS','receiptId']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const NullsOrderSchema = z.enum(['first','last']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// GROUP SCHEMA
/////////////////////////////////////////

export const GroupSchema = z.object({
  id: z.string().cuid(),
  ownerId: z.string(),
})

export type Group = z.infer<typeof GroupSchema>

// GROUP OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const GroupOptionalDefaultsSchema = GroupSchema.merge(z.object({
  id: z.string().cuid().optional(),
}))

export type GroupOptionalDefaults = z.infer<typeof GroupOptionalDefaultsSchema>

// GROUP RELATION SCHEMA
//------------------------------------------------------

export type GroupRelations = {
  groupOwner: UserWithRelations;
  userArray: UserWithRelations[];
};

export type GroupWithRelations = z.infer<typeof GroupSchema> & GroupRelations

export const GroupWithRelationsSchema: z.ZodType<GroupWithRelations> = GroupSchema.merge(z.object({
  groupOwner: z.lazy(() => UserWithRelationsSchema),
  userArray: z.lazy(() => UserWithRelationsSchema).array(),
}))

// GROUP OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type GroupOptionalDefaultsRelations = {
  groupOwner: UserOptionalDefaultsWithRelations;
  userArray: UserOptionalDefaultsWithRelations[];
};

export type GroupOptionalDefaultsWithRelations = z.infer<typeof GroupOptionalDefaultsSchema> & GroupOptionalDefaultsRelations

export const GroupOptionalDefaultsWithRelationsSchema: z.ZodType<GroupOptionalDefaultsWithRelations> = GroupOptionalDefaultsSchema.merge(z.object({
  groupOwner: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
  userArray: z.lazy(() => UserOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  ACCESS_TOKEN: z.string().nullable(),
  PUBLIC_TOKEN: z.string().nullable(),
  ITEM_ID: z.string().nullable(),
  TRANSFER_ID: z.string().nullable(),
  PAYMENT_ID: z.string().nullable(),
  cursor: z.string().nullable(),
})

export type User = z.infer<typeof UserSchema>

// USER OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserOptionalDefaultsSchema = UserSchema.merge(z.object({
  id: z.string().cuid().optional(),
  name: z.string().optional(),
}))

export type UserOptionalDefaults = z.infer<typeof UserOptionalDefaultsSchema>

// USER RELATION SCHEMA
//------------------------------------------------------

export type UserRelations = {
  ownedTxArray: TxWithRelations[];
  splitTxArray: SplitWithRelations[];
  myGroup: GroupWithRelations[];
  groupArray: GroupWithRelations[];
  myConnectionArray: UserWithRelations[];
  connectedWithArray: UserWithRelations[];
  CatSettings: CatSettingsWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(z.object({
  ownedTxArray: z.lazy(() => TxWithRelationsSchema).array(),
  splitTxArray: z.lazy(() => SplitWithRelationsSchema).array(),
  myGroup: z.lazy(() => GroupWithRelationsSchema).array(),
  groupArray: z.lazy(() => GroupWithRelationsSchema).array(),
  myConnectionArray: z.lazy(() => UserWithRelationsSchema).array(),
  connectedWithArray: z.lazy(() => UserWithRelationsSchema).array(),
  CatSettings: z.lazy(() => CatSettingsWithRelationsSchema).array(),
}))

// USER OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserOptionalDefaultsRelations = {
  ownedTxArray: TxOptionalDefaultsWithRelations[];
  splitTxArray: SplitOptionalDefaultsWithRelations[];
  myGroup: GroupOptionalDefaultsWithRelations[];
  groupArray: GroupOptionalDefaultsWithRelations[];
  myConnectionArray: UserOptionalDefaultsWithRelations[];
  connectedWithArray: UserOptionalDefaultsWithRelations[];
  CatSettings: CatSettingsOptionalDefaultsWithRelations[];
};

export type UserOptionalDefaultsWithRelations = z.infer<typeof UserOptionalDefaultsSchema> & UserOptionalDefaultsRelations

export const UserOptionalDefaultsWithRelationsSchema: z.ZodType<UserOptionalDefaultsWithRelations> = UserOptionalDefaultsSchema.merge(z.object({
  ownedTxArray: z.lazy(() => TxOptionalDefaultsWithRelationsSchema).array(),
  splitTxArray: z.lazy(() => SplitOptionalDefaultsWithRelationsSchema).array(),
  myGroup: z.lazy(() => GroupOptionalDefaultsWithRelationsSchema).array(),
  groupArray: z.lazy(() => GroupOptionalDefaultsWithRelationsSchema).array(),
  myConnectionArray: z.lazy(() => UserOptionalDefaultsWithRelationsSchema).array(),
  connectedWithArray: z.lazy(() => UserOptionalDefaultsWithRelationsSchema).array(),
  CatSettings: z.lazy(() => CatSettingsOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// TX SCHEMA
/////////////////////////////////////////

export const TxSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  userTotal: z.number(),
  originTxId: z.string().nullable(),
  recurring: z.boolean(),
  MDS: z.number().int(),
  plaidId: z.string().nullable(),
  name: z.string(),
  amount: z.number(),
  datetime: z.coerce.date().nullable(),
  authorizedDatetime: z.coerce.date(),
  accountId: z.string().nullable(),
  /**
   * [PlaidTx]
   */
  plaidTx: JsonValueSchema.nullable(),
})

export type Tx = z.infer<typeof TxSchema>

// TX OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TxOptionalDefaultsSchema = TxSchema.merge(z.object({
  id: z.string().cuid().optional(),
  userTotal: z.number().optional(),
  recurring: z.boolean().optional(),
}))

export type TxOptionalDefaults = z.infer<typeof TxOptionalDefaultsSchema>

// TX RELATION SCHEMA
//------------------------------------------------------

export type TxRelations = {
  user: UserWithRelations;
  catArray: CatWithRelations[];
  splitTxArray: TxWithRelations[];
  refSplit?: SplitWithRelations | null;
  originTx?: TxWithRelations | null;
  splitArray: SplitWithRelations[];
  receipt?: ReceiptWithRelations | null;
};

export type TxWithRelations = Omit<z.infer<typeof TxSchema>, "plaidTx"> & {
  plaidTx?: JsonValueType | null;
} & TxRelations

export const TxWithRelationsSchema: z.ZodType<TxWithRelations> = TxSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
  catArray: z.lazy(() => CatWithRelationsSchema).array(),
  splitTxArray: z.lazy(() => TxWithRelationsSchema).array(),
  refSplit: z.lazy(() => SplitWithRelationsSchema).nullable(),
  originTx: z.lazy(() => TxWithRelationsSchema).nullable(),
  splitArray: z.lazy(() => SplitWithRelationsSchema).array(),
  receipt: z.lazy(() => ReceiptWithRelationsSchema).nullable(),
}))

// TX OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type TxOptionalDefaultsRelations = {
  user: UserOptionalDefaultsWithRelations;
  catArray: CatOptionalDefaultsWithRelations[];
  splitTxArray: TxOptionalDefaultsWithRelations[];
  refSplit?: SplitOptionalDefaultsWithRelations | null;
  originTx?: TxOptionalDefaultsWithRelations | null;
  splitArray: SplitOptionalDefaultsWithRelations[];
  receipt?: ReceiptOptionalDefaultsWithRelations | null;
};

export type TxOptionalDefaultsWithRelations = Omit<z.infer<typeof TxOptionalDefaultsSchema>, "plaidTx"> & {
  plaidTx?: JsonValueType | null;
} & TxOptionalDefaultsRelations

export const TxOptionalDefaultsWithRelationsSchema: z.ZodType<TxOptionalDefaultsWithRelations> = TxOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
  catArray: z.lazy(() => CatOptionalDefaultsWithRelationsSchema).array(),
  splitTxArray: z.lazy(() => TxOptionalDefaultsWithRelationsSchema).array(),
  refSplit: z.lazy(() => SplitOptionalDefaultsWithRelationsSchema).nullable(),
  originTx: z.lazy(() => TxOptionalDefaultsWithRelationsSchema).nullable(),
  splitArray: z.lazy(() => SplitOptionalDefaultsWithRelationsSchema).array(),
  receipt: z.lazy(() => ReceiptOptionalDefaultsWithRelationsSchema).nullable(),
}))

/////////////////////////////////////////
// SPLIT SCHEMA
/////////////////////////////////////////

export const SplitSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  amount: z.number(),
  txId: z.string().nullable(),
  originTxId: z.string(),
})

export type Split = z.infer<typeof SplitSchema>

// SPLIT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const SplitOptionalDefaultsSchema = SplitSchema.merge(z.object({
  id: z.string().cuid().optional(),
}))

export type SplitOptionalDefaults = z.infer<typeof SplitOptionalDefaultsSchema>

// SPLIT RELATION SCHEMA
//------------------------------------------------------

export type SplitRelations = {
  user: UserWithRelations;
  tx?: TxWithRelations | null;
  originTx: TxWithRelations;
};

export type SplitWithRelations = z.infer<typeof SplitSchema> & SplitRelations

export const SplitWithRelationsSchema: z.ZodType<SplitWithRelations> = SplitSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
  tx: z.lazy(() => TxWithRelationsSchema).nullable(),
  originTx: z.lazy(() => TxWithRelationsSchema),
}))

// SPLIT OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type SplitOptionalDefaultsRelations = {
  user: UserOptionalDefaultsWithRelations;
  tx?: TxOptionalDefaultsWithRelations | null;
  originTx: TxOptionalDefaultsWithRelations;
};

export type SplitOptionalDefaultsWithRelations = z.infer<typeof SplitOptionalDefaultsSchema> & SplitOptionalDefaultsRelations

export const SplitOptionalDefaultsWithRelationsSchema: z.ZodType<SplitOptionalDefaultsWithRelations> = SplitOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
  tx: z.lazy(() => TxOptionalDefaultsWithRelationsSchema).nullable(),
  originTx: z.lazy(() => TxOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// CAT SCHEMA
/////////////////////////////////////////

export const CatSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  amount: z.number(),
  txId: z.string(),
})

export type Cat = z.infer<typeof CatSchema>

// CAT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CatOptionalDefaultsSchema = CatSchema.merge(z.object({
  id: z.string().cuid().optional(),
}))

export type CatOptionalDefaults = z.infer<typeof CatOptionalDefaultsSchema>

// CAT RELATION SCHEMA
//------------------------------------------------------

export type CatRelations = {
  nameArray: CatNameWithRelations[];
  tx: TxWithRelations;
};

export type CatWithRelations = z.infer<typeof CatSchema> & CatRelations

export const CatWithRelationsSchema: z.ZodType<CatWithRelations> = CatSchema.merge(z.object({
  nameArray: z.lazy(() => CatNameWithRelationsSchema).array(),
  tx: z.lazy(() => TxWithRelationsSchema),
}))

// CAT OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type CatOptionalDefaultsRelations = {
  nameArray: CatNameOptionalDefaultsWithRelations[];
  tx: TxOptionalDefaultsWithRelations;
};

export type CatOptionalDefaultsWithRelations = z.infer<typeof CatOptionalDefaultsSchema> & CatOptionalDefaultsRelations

export const CatOptionalDefaultsWithRelationsSchema: z.ZodType<CatOptionalDefaultsWithRelations> = CatOptionalDefaultsSchema.merge(z.object({
  nameArray: z.lazy(() => CatNameOptionalDefaultsWithRelationsSchema).array(),
  tx: z.lazy(() => TxOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// CAT NAME SCHEMA
/////////////////////////////////////////

export const CatNameSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  catId: z.string(),
})

export type CatName = z.infer<typeof CatNameSchema>

// CAT NAME OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CatNameOptionalDefaultsSchema = CatNameSchema.merge(z.object({
  id: z.string().cuid().optional(),
}))

export type CatNameOptionalDefaults = z.infer<typeof CatNameOptionalDefaultsSchema>

// CAT NAME RELATION SCHEMA
//------------------------------------------------------

export type CatNameRelations = {
  cat: CatWithRelations;
};

export type CatNameWithRelations = z.infer<typeof CatNameSchema> & CatNameRelations

export const CatNameWithRelationsSchema: z.ZodType<CatNameWithRelations> = CatNameSchema.merge(z.object({
  cat: z.lazy(() => CatWithRelationsSchema),
}))

// CAT NAME OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type CatNameOptionalDefaultsRelations = {
  cat: CatOptionalDefaultsWithRelations;
};

export type CatNameOptionalDefaultsWithRelations = z.infer<typeof CatNameOptionalDefaultsSchema> & CatNameOptionalDefaultsRelations

export const CatNameOptionalDefaultsWithRelationsSchema: z.ZodType<CatNameOptionalDefaultsWithRelations> = CatNameOptionalDefaultsSchema.merge(z.object({
  cat: z.lazy(() => CatOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// CAT SETTINGS SCHEMA
/////////////////////////////////////////

export const CatSettingsSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  budget: z.number(),
  parentId: z.string().nullable(),
  userId: z.string(),
})

export type CatSettings = z.infer<typeof CatSettingsSchema>

// CAT SETTINGS OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CatSettingsOptionalDefaultsSchema = CatSettingsSchema.merge(z.object({
  id: z.string().cuid().optional(),
}))

export type CatSettingsOptionalDefaults = z.infer<typeof CatSettingsOptionalDefaultsSchema>

// CAT SETTINGS RELATION SCHEMA
//------------------------------------------------------

export type CatSettingsRelations = {
  parent?: CatSettingsWithRelations | null;
  children: CatSettingsWithRelations[];
  User: UserWithRelations;
};

export type CatSettingsWithRelations = z.infer<typeof CatSettingsSchema> & CatSettingsRelations

export const CatSettingsWithRelationsSchema: z.ZodType<CatSettingsWithRelations> = CatSettingsSchema.merge(z.object({
  parent: z.lazy(() => CatSettingsWithRelationsSchema).nullable(),
  children: z.lazy(() => CatSettingsWithRelationsSchema).array(),
  User: z.lazy(() => UserWithRelationsSchema),
}))

// CAT SETTINGS OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type CatSettingsOptionalDefaultsRelations = {
  parent?: CatSettingsOptionalDefaultsWithRelations | null;
  children: CatSettingsOptionalDefaultsWithRelations[];
  User: UserOptionalDefaultsWithRelations;
};

export type CatSettingsOptionalDefaultsWithRelations = z.infer<typeof CatSettingsOptionalDefaultsSchema> & CatSettingsOptionalDefaultsRelations

export const CatSettingsOptionalDefaultsWithRelationsSchema: z.ZodType<CatSettingsOptionalDefaultsWithRelations> = CatSettingsOptionalDefaultsSchema.merge(z.object({
  parent: z.lazy(() => CatSettingsOptionalDefaultsWithRelationsSchema).nullable(),
  children: z.lazy(() => CatSettingsOptionalDefaultsWithRelationsSchema).array(),
  User: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// RECEIPT SCHEMA
/////////////////////////////////////////

export const ReceiptSchema = z.object({
  id: z.string().cuid(),
  is_receipt: z.boolean(),
  transaction_id: z.string(),
  date: z.string(),
  merchant: z.string(),
  subtotal: z.number(),
  currency: z.string(),
  tax: z.number(),
  tip: z.number(),
  grand_total: z.number(),
  payment_method: z.string(),
  online_link: z.string(),
  location: z.string(),
  txId: z.string(),
})

export type Receipt = z.infer<typeof ReceiptSchema>

// RECEIPT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ReceiptOptionalDefaultsSchema = ReceiptSchema.merge(z.object({
  id: z.string().cuid().optional(),
}))

export type ReceiptOptionalDefaults = z.infer<typeof ReceiptOptionalDefaultsSchema>

// RECEIPT RELATION SCHEMA
//------------------------------------------------------

export type ReceiptRelations = {
  items: ReceiptItemWithRelations[];
  tx: TxWithRelations;
};

export type ReceiptWithRelations = z.infer<typeof ReceiptSchema> & ReceiptRelations

export const ReceiptWithRelationsSchema: z.ZodType<ReceiptWithRelations> = ReceiptSchema.merge(z.object({
  items: z.lazy(() => ReceiptItemWithRelationsSchema).array(),
  tx: z.lazy(() => TxWithRelationsSchema),
}))

// RECEIPT OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type ReceiptOptionalDefaultsRelations = {
  items: ReceiptItemOptionalDefaultsWithRelations[];
  tx: TxOptionalDefaultsWithRelations;
};

export type ReceiptOptionalDefaultsWithRelations = z.infer<typeof ReceiptOptionalDefaultsSchema> & ReceiptOptionalDefaultsRelations

export const ReceiptOptionalDefaultsWithRelationsSchema: z.ZodType<ReceiptOptionalDefaultsWithRelations> = ReceiptOptionalDefaultsSchema.merge(z.object({
  items: z.lazy(() => ReceiptItemOptionalDefaultsWithRelationsSchema).array(),
  tx: z.lazy(() => TxOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// RECEIPT ITEM SCHEMA
/////////////////////////////////////////

export const ReceiptItemSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  description: z.string(),
  quantity: z.number().int(),
  unit_price: z.number(),
  MDS: z.number().int(),
  receiptId: z.string(),
})

export type ReceiptItem = z.infer<typeof ReceiptItemSchema>

// RECEIPT ITEM OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ReceiptItemOptionalDefaultsSchema = ReceiptItemSchema.merge(z.object({
  id: z.string().cuid().optional(),
}))

export type ReceiptItemOptionalDefaults = z.infer<typeof ReceiptItemOptionalDefaultsSchema>

// RECEIPT ITEM RELATION SCHEMA
//------------------------------------------------------

export type ReceiptItemRelations = {
  receipt: ReceiptWithRelations;
};

export type ReceiptItemWithRelations = z.infer<typeof ReceiptItemSchema> & ReceiptItemRelations

export const ReceiptItemWithRelationsSchema: z.ZodType<ReceiptItemWithRelations> = ReceiptItemSchema.merge(z.object({
  receipt: z.lazy(() => ReceiptWithRelationsSchema),
}))

// RECEIPT ITEM OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type ReceiptItemOptionalDefaultsRelations = {
  receipt: ReceiptOptionalDefaultsWithRelations;
};

export type ReceiptItemOptionalDefaultsWithRelations = z.infer<typeof ReceiptItemOptionalDefaultsSchema> & ReceiptItemOptionalDefaultsRelations

export const ReceiptItemOptionalDefaultsWithRelationsSchema: z.ZodType<ReceiptItemOptionalDefaultsWithRelations> = ReceiptItemOptionalDefaultsSchema.merge(z.object({
  receipt: z.lazy(() => ReceiptOptionalDefaultsWithRelationsSchema),
}))
