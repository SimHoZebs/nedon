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

export const TxScalarFieldEnumSchema = z.enum(['id','ownerId']);

export const CatScalarFieldEnumSchema = z.enum(['id','nameArray','amount','splitId']);

export const SplitScalarFieldEnumSchema = z.enum(['id','txId','userId']);

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
  txArray: TxWithRelations[];
  splitArray: SplitWithRelations[];
  myGroup: GroupWithRelations[];
  groupArray: GroupWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(z.object({
  txArray: z.lazy(() => TxWithRelationsSchema).array(),
  splitArray: z.lazy(() => SplitWithRelationsSchema).array(),
  myGroup: z.lazy(() => GroupWithRelationsSchema).array(),
  groupArray: z.lazy(() => GroupWithRelationsSchema).array(),
}))

// USER OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type UserOptionalDefaultsRelations = {
  txArray: TxOptionalDefaultsWithRelations[];
  splitArray: SplitOptionalDefaultsWithRelations[];
  myGroup: GroupOptionalDefaultsWithRelations[];
  groupArray: GroupOptionalDefaultsWithRelations[];
};

export type UserOptionalDefaultsWithRelations = z.infer<typeof UserOptionalDefaultsSchema> & UserOptionalDefaultsRelations

export const UserOptionalDefaultsWithRelationsSchema: z.ZodType<UserOptionalDefaultsWithRelations> = UserOptionalDefaultsSchema.merge(z.object({
  txArray: z.lazy(() => TxOptionalDefaultsWithRelationsSchema).array(),
  splitArray: z.lazy(() => SplitOptionalDefaultsWithRelationsSchema).array(),
  myGroup: z.lazy(() => GroupOptionalDefaultsWithRelationsSchema).array(),
  groupArray: z.lazy(() => GroupOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// TX SCHEMA
/////////////////////////////////////////

export const TxSchema = z.object({
  id: z.string().cuid(),
  ownerId: z.string(),
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
  owner: UserWithRelations;
  splitArray: SplitWithRelations[];
};

export type TxWithRelations = z.infer<typeof TxSchema> & TxRelations

export const TxWithRelationsSchema: z.ZodType<TxWithRelations> = TxSchema.merge(z.object({
  owner: z.lazy(() => UserWithRelationsSchema),
  splitArray: z.lazy(() => SplitWithRelationsSchema).array(),
}))

// TX OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type TxOptionalDefaultsRelations = {
  owner: UserOptionalDefaultsWithRelations;
  splitArray: SplitOptionalDefaultsWithRelations[];
};

export type TxOptionalDefaultsWithRelations = z.infer<typeof TxOptionalDefaultsSchema> & TxOptionalDefaultsRelations

export const TxOptionalDefaultsWithRelationsSchema: z.ZodType<TxOptionalDefaultsWithRelations> = TxOptionalDefaultsSchema.merge(z.object({
  owner: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
  splitArray: z.lazy(() => SplitOptionalDefaultsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// CAT SCHEMA
/////////////////////////////////////////

export const CatSchema = z.object({
  id: z.string().uuid(),
  nameArray: z.string().array(),
  amount: z.number(),
  splitId: z.string(),
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
  Split: SplitWithRelations;
};

export type CatWithRelations = z.infer<typeof CatSchema> & CatRelations

export const CatWithRelationsSchema: z.ZodType<CatWithRelations> = CatSchema.merge(z.object({
  Split: z.lazy(() => SplitWithRelationsSchema),
}))

// CAT OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type CatOptionalDefaultsRelations = {
  Split: SplitOptionalDefaultsWithRelations;
};

export type CatOptionalDefaultsWithRelations = z.infer<typeof CatOptionalDefaultsSchema> & CatOptionalDefaultsRelations

export const CatOptionalDefaultsWithRelationsSchema: z.ZodType<CatOptionalDefaultsWithRelations> = CatOptionalDefaultsSchema.merge(z.object({
  Split: z.lazy(() => SplitOptionalDefaultsWithRelationsSchema),
}))

/////////////////////////////////////////
// SPLIT SCHEMA
/////////////////////////////////////////

export const SplitSchema = z.object({
  id: z.string().uuid(),
  txId: z.string(),
  userId: z.string(),
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
  tx: TxWithRelations;
  catArray: CatWithRelations[];
  user: UserWithRelations;
};

export type SplitWithRelations = z.infer<typeof SplitSchema> & SplitRelations

export const SplitWithRelationsSchema: z.ZodType<SplitWithRelations> = SplitSchema.merge(z.object({
  tx: z.lazy(() => TxWithRelationsSchema),
  catArray: z.lazy(() => CatWithRelationsSchema).array(),
  user: z.lazy(() => UserWithRelationsSchema),
}))

// SPLIT OPTIONAL DEFAULTS RELATION SCHEMA
//------------------------------------------------------

export type SplitOptionalDefaultsRelations = {
  tx: TxOptionalDefaultsWithRelations;
  catArray: CatOptionalDefaultsWithRelations[];
  user: UserOptionalDefaultsWithRelations;
};

export type SplitOptionalDefaultsWithRelations = z.infer<typeof SplitOptionalDefaultsSchema> & SplitOptionalDefaultsRelations

export const SplitOptionalDefaultsWithRelationsSchema: z.ZodType<SplitOptionalDefaultsWithRelations> = SplitOptionalDefaultsSchema.merge(z.object({
  tx: z.lazy(() => TxOptionalDefaultsWithRelationsSchema),
  catArray: z.lazy(() => CatOptionalDefaultsWithRelationsSchema).array(),
  user: z.lazy(() => UserOptionalDefaultsWithRelationsSchema),
}))
