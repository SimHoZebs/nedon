import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const GroupScalarFieldEnumSchema = z.enum(['id','ownerId']);

export const UserScalarFieldEnumSchema = z.enum(['id','name','ACCESS_TOKEN','PUBLIC_TOKEN','ITEM_ID','TRANSFER_ID','PAYMENT_ID']);

export const TxScalarFieldEnumSchema = z.enum(['id','plaidId','userId']);

export const SplitScalarFieldEnumSchema = z.enum(['id','userId','amount','txId']);

export const CatScalarFieldEnumSchema = z.enum(['id','name','nameArray','amount','txId']);

export const CatSettingsScalarFieldEnumSchema = z.enum(['id','name','budget','parentId','userId']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// GROUP SCHEMA
/////////////////////////////////////////

export const GroupSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string(),
})

export type Group = z.infer<typeof GroupSchema>

// GROUP OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const GroupOptionalDefaultsSchema = GroupSchema.merge(z.object({
  id: z.string().uuid().optional(),
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
  id: z.string().uuid(),
  name: z.string(),
  ACCESS_TOKEN: z.string().nullable(),
  PUBLIC_TOKEN: z.string().nullable(),
  ITEM_ID: z.string().nullable(),
  TRANSFER_ID: z.string().nullable(),
  PAYMENT_ID: z.string().nullable(),
})

export type User = z.infer<typeof UserSchema>

// USER OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const UserOptionalDefaultsSchema = UserSchema.merge(z.object({
  id: z.string().uuid().optional(),
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
  CatSettings: CatSettingsWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(z.object({
  ownedTxArray: z.lazy(() => TxWithRelationsSchema).array(),
  splitTxArray: z.lazy(() => SplitWithRelationsSchema).array(),
  myGroup: z.lazy(() => GroupWithRelationsSchema).array(),
  groupArray: z.lazy(() => GroupWithRelationsSchema).array(),
  CatSettings: z.lazy(() => CatSettingsWithRelationsSchema).array(),
}))

// USER OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserOptionalDefaultsRelations = {
  ownedTxArray: TxOptionalDefaultsWithRelations[];
  splitTxArray: SplitOptionalDefaultsWithRelations[];
  myGroup: GroupOptionalDefaultsWithRelations[];
  groupArray: GroupOptionalDefaultsWithRelations[];
  CatSettings: CatSettingsOptionalDefaultsWithRelations[];
};

export type UserOptionalDefaultsWithRelations = z.infer<typeof UserOptionalDefaultsSchema> & UserOptionalDefaultsRelations

export const UserOptionalDefaultsWithRelationsSchema: z.ZodType<UserOptionalDefaultsWithRelations> = UserOptionalDefaultsSchema.merge(z.object({
  ownedTxArray: z.lazy(() => TxOptionalDefaultsWithRelationsSchema).array(),
  splitTxArray: z.lazy(() => SplitOptionalDefaultsWithRelationsSchema).array(),
  myGroup: z.lazy(() => GroupOptionalDefaultsWithRelationsSchema).array(),
  groupArray: z.lazy(() => GroupOptionalDefaultsWithRelationsSchema).array(),
  CatSettings: z.lazy(() => CatSettingsOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// TX SCHEMA
/////////////////////////////////////////

export const TxSchema = z.object({
  id: z.string().cuid(),
  plaidId: z.string(),
  userId: z.string(),
})

export type Tx = z.infer<typeof TxSchema>

// TX OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TxOptionalDefaultsSchema = TxSchema.merge(z.object({
  id: z.string().cuid().optional(),
}))

export type TxOptionalDefaults = z.infer<typeof TxOptionalDefaultsSchema>

// TX RELATION SCHEMA
//------------------------------------------------------

export type TxRelations = {
  user: UserWithRelations;
  catArray: CatWithRelations[];
  splitArray: SplitWithRelations[];
};

export type TxWithRelations = z.infer<typeof TxSchema> & TxRelations

export const TxWithRelationsSchema: z.ZodType<TxWithRelations> = TxSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
  catArray: z.lazy(() => CatWithRelationsSchema).array(),
  splitArray: z.lazy(() => SplitWithRelationsSchema).array(),
}))

// TX OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type TxOptionalDefaultsRelations = {
  user: UserOptionalDefaultsWithRelations;
  catArray: CatOptionalDefaultsWithRelations[];
  splitArray: SplitOptionalDefaultsWithRelations[];
};

export type TxOptionalDefaultsWithRelations = z.infer<typeof TxOptionalDefaultsSchema> & TxOptionalDefaultsRelations

export const TxOptionalDefaultsWithRelationsSchema: z.ZodType<TxOptionalDefaultsWithRelations> = TxOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
  catArray: z.lazy(() => CatOptionalDefaultsWithRelationsSchema).array(),
  splitArray: z.lazy(() => SplitOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// SPLIT SCHEMA
/////////////////////////////////////////

export const SplitSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  amount: z.number(),
  txId: z.string(),
})

export type Split = z.infer<typeof SplitSchema>

// SPLIT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const SplitOptionalDefaultsSchema = SplitSchema.merge(z.object({
  id: z.string().uuid().optional(),
}))

export type SplitOptionalDefaults = z.infer<typeof SplitOptionalDefaultsSchema>

// SPLIT RELATION SCHEMA
//------------------------------------------------------

export type SplitRelations = {
  user: UserWithRelations;
  tx: TxWithRelations;
};

export type SplitWithRelations = z.infer<typeof SplitSchema> & SplitRelations

export const SplitWithRelationsSchema: z.ZodType<SplitWithRelations> = SplitSchema.merge(z.object({
  user: z.lazy(() => UserWithRelationsSchema),
  tx: z.lazy(() => TxWithRelationsSchema),
}))

// SPLIT OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type SplitOptionalDefaultsRelations = {
  user: UserOptionalDefaultsWithRelations;
  tx: TxOptionalDefaultsWithRelations;
};

export type SplitOptionalDefaultsWithRelations = z.infer<typeof SplitOptionalDefaultsSchema> & SplitOptionalDefaultsRelations

export const SplitOptionalDefaultsWithRelationsSchema: z.ZodType<SplitOptionalDefaultsWithRelations> = SplitOptionalDefaultsSchema.merge(z.object({
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
  tx: z.lazy(() => TxOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// CAT SCHEMA
/////////////////////////////////////////

export const CatSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  nameArray: z.string().array(),
  amount: z.number(),
  txId: z.string(),
})

export type Cat = z.infer<typeof CatSchema>

// CAT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CatOptionalDefaultsSchema = CatSchema.merge(z.object({
  id: z.string().uuid().optional(),
}))

export type CatOptionalDefaults = z.infer<typeof CatOptionalDefaultsSchema>

// CAT RELATION SCHEMA
//------------------------------------------------------

export type CatRelations = {
  tx: TxWithRelations;
};

export type CatWithRelations = z.infer<typeof CatSchema> & CatRelations

export const CatWithRelationsSchema: z.ZodType<CatWithRelations> = CatSchema.merge(z.object({
  tx: z.lazy(() => TxWithRelationsSchema),
}))

// CAT OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type CatOptionalDefaultsRelations = {
  tx: TxOptionalDefaultsWithRelations;
};

export type CatOptionalDefaultsWithRelations = z.infer<typeof CatOptionalDefaultsSchema> & CatOptionalDefaultsRelations

export const CatOptionalDefaultsWithRelationsSchema: z.ZodType<CatOptionalDefaultsWithRelations> = CatOptionalDefaultsSchema.merge(z.object({
  tx: z.lazy(() => TxOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// CAT SETTINGS SCHEMA
/////////////////////////////////////////

export const CatSettingsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  budget: z.number(),
  parentId: z.string().nullable(),
  userId: z.string().nullable(),
})

export type CatSettings = z.infer<typeof CatSettingsSchema>

// CAT SETTINGS OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const CatSettingsOptionalDefaultsSchema = CatSettingsSchema.merge(z.object({
  id: z.string().uuid().optional(),
}))

export type CatSettingsOptionalDefaults = z.infer<typeof CatSettingsOptionalDefaultsSchema>

// CAT SETTINGS RELATION SCHEMA
//------------------------------------------------------

export type CatSettingsRelations = {
  parent?: CatSettingsWithRelations | null;
  children: CatSettingsWithRelations[];
  User?: UserWithRelations | null;
};

export type CatSettingsWithRelations = z.infer<typeof CatSettingsSchema> & CatSettingsRelations

export const CatSettingsWithRelationsSchema: z.ZodType<CatSettingsWithRelations> = CatSettingsSchema.merge(z.object({
  parent: z.lazy(() => CatSettingsWithRelationsSchema).nullable(),
  children: z.lazy(() => CatSettingsWithRelationsSchema).array(),
  User: z.lazy(() => UserWithRelationsSchema).nullable(),
}))

// CAT SETTINGS OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type CatSettingsOptionalDefaultsRelations = {
  parent?: CatSettingsOptionalDefaultsWithRelations | null;
  children: CatSettingsOptionalDefaultsWithRelations[];
  User?: UserOptionalDefaultsWithRelations | null;
};

export type CatSettingsOptionalDefaultsWithRelations = z.infer<typeof CatSettingsOptionalDefaultsSchema> & CatSettingsOptionalDefaultsRelations

export const CatSettingsOptionalDefaultsWithRelationsSchema: z.ZodType<CatSettingsOptionalDefaultsWithRelations> = CatSettingsOptionalDefaultsSchema.merge(z.object({
  parent: z.lazy(() => CatSettingsOptionalDefaultsWithRelationsSchema).nullable(),
  children: z.lazy(() => CatSettingsOptionalDefaultsWithRelationsSchema).array(),
  User: z.lazy(() => UserOptionalDefaultsWithRelationsSchema).nullable(),
}))
