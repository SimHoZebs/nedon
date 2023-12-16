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

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// GROUP
//------------------------------------------------------

export const GroupIncludeSchema: z.ZodType<Prisma.GroupInclude> = z.object({
  groupOwner: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  userArray: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => GroupCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const GroupArgsSchema: z.ZodType<Prisma.GroupDefaultArgs> = z.object({
  select: z.lazy(() => GroupSelectSchema).optional(),
  include: z.lazy(() => GroupIncludeSchema).optional(),
}).strict();

export const GroupCountOutputTypeArgsSchema: z.ZodType<Prisma.GroupCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => GroupCountOutputTypeSelectSchema).nullish(),
}).strict();

export const GroupCountOutputTypeSelectSchema: z.ZodType<Prisma.GroupCountOutputTypeSelect> = z.object({
  userArray: z.boolean().optional(),
}).strict();

export const GroupSelectSchema: z.ZodType<Prisma.GroupSelect> = z.object({
  id: z.boolean().optional(),
  ownerId: z.boolean().optional(),
  groupOwner: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  userArray: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => GroupCountOutputTypeArgsSchema)]).optional(),
}).strict()

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  txArray: z.union([z.boolean(),z.lazy(() => TxFindManyArgsSchema)]).optional(),
  splitArray: z.union([z.boolean(),z.lazy(() => SplitFindManyArgsSchema)]).optional(),
  myGroup: z.union([z.boolean(),z.lazy(() => GroupFindManyArgsSchema)]).optional(),
  groupArray: z.union([z.boolean(),z.lazy(() => GroupFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  txArray: z.boolean().optional(),
  splitArray: z.boolean().optional(),
  myGroup: z.boolean().optional(),
  groupArray: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  ACCESS_TOKEN: z.boolean().optional(),
  PUBLIC_TOKEN: z.boolean().optional(),
  ITEM_ID: z.boolean().optional(),
  TRANSFER_ID: z.boolean().optional(),
  PAYMENT_ID: z.boolean().optional(),
  txArray: z.union([z.boolean(),z.lazy(() => TxFindManyArgsSchema)]).optional(),
  splitArray: z.union([z.boolean(),z.lazy(() => SplitFindManyArgsSchema)]).optional(),
  myGroup: z.union([z.boolean(),z.lazy(() => GroupFindManyArgsSchema)]).optional(),
  groupArray: z.union([z.boolean(),z.lazy(() => GroupFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// TX
//------------------------------------------------------

export const TxIncludeSchema: z.ZodType<Prisma.TxInclude> = z.object({
  owner: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  splitArray: z.union([z.boolean(),z.lazy(() => SplitFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TxCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const TxArgsSchema: z.ZodType<Prisma.TxDefaultArgs> = z.object({
  select: z.lazy(() => TxSelectSchema).optional(),
  include: z.lazy(() => TxIncludeSchema).optional(),
}).strict();

export const TxCountOutputTypeArgsSchema: z.ZodType<Prisma.TxCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => TxCountOutputTypeSelectSchema).nullish(),
}).strict();

export const TxCountOutputTypeSelectSchema: z.ZodType<Prisma.TxCountOutputTypeSelect> = z.object({
  splitArray: z.boolean().optional(),
}).strict();

export const TxSelectSchema: z.ZodType<Prisma.TxSelect> = z.object({
  id: z.boolean().optional(),
  ownerId: z.boolean().optional(),
  owner: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  splitArray: z.union([z.boolean(),z.lazy(() => SplitFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TxCountOutputTypeArgsSchema)]).optional(),
}).strict()

// CAT
//------------------------------------------------------

export const CatIncludeSchema: z.ZodType<Prisma.CatInclude> = z.object({
  Split: z.union([z.boolean(),z.lazy(() => SplitArgsSchema)]).optional(),
}).strict()

export const CatArgsSchema: z.ZodType<Prisma.CatDefaultArgs> = z.object({
  select: z.lazy(() => CatSelectSchema).optional(),
  include: z.lazy(() => CatIncludeSchema).optional(),
}).strict();

export const CatSelectSchema: z.ZodType<Prisma.CatSelect> = z.object({
  id: z.boolean().optional(),
  nameArray: z.boolean().optional(),
  amount: z.boolean().optional(),
  splitId: z.boolean().optional(),
  Split: z.union([z.boolean(),z.lazy(() => SplitArgsSchema)]).optional(),
}).strict()

// SPLIT
//------------------------------------------------------

export const SplitIncludeSchema: z.ZodType<Prisma.SplitInclude> = z.object({
  tx: z.union([z.boolean(),z.lazy(() => TxArgsSchema)]).optional(),
  catArray: z.union([z.boolean(),z.lazy(() => CatFindManyArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => SplitCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const SplitArgsSchema: z.ZodType<Prisma.SplitDefaultArgs> = z.object({
  select: z.lazy(() => SplitSelectSchema).optional(),
  include: z.lazy(() => SplitIncludeSchema).optional(),
}).strict();

export const SplitCountOutputTypeArgsSchema: z.ZodType<Prisma.SplitCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => SplitCountOutputTypeSelectSchema).nullish(),
}).strict();

export const SplitCountOutputTypeSelectSchema: z.ZodType<Prisma.SplitCountOutputTypeSelect> = z.object({
  catArray: z.boolean().optional(),
}).strict();

export const SplitSelectSchema: z.ZodType<Prisma.SplitSelect> = z.object({
  id: z.boolean().optional(),
  txId: z.boolean().optional(),
  userId: z.boolean().optional(),
  tx: z.union([z.boolean(),z.lazy(() => TxArgsSchema)]).optional(),
  catArray: z.union([z.boolean(),z.lazy(() => CatFindManyArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => SplitCountOutputTypeArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const GroupWhereInputSchema: z.ZodType<Prisma.GroupWhereInput> = z.object({
  AND: z.union([ z.lazy(() => GroupWhereInputSchema),z.lazy(() => GroupWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => GroupWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => GroupWhereInputSchema),z.lazy(() => GroupWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  groupOwner: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  userArray: z.lazy(() => UserListRelationFilterSchema).optional()
}).strict() as z.ZodType<Prisma.GroupWhereInput>;

export const GroupOrderByWithRelationInputSchema: z.ZodType<Prisma.GroupOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  groupOwner: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  userArray: z.lazy(() => UserOrderByRelationAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupOrderByWithRelationInput>;

export const GroupWhereUniqueInputSchema: z.ZodType<Prisma.GroupWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => GroupWhereInputSchema),z.lazy(() => GroupWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => GroupWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => GroupWhereInputSchema),z.lazy(() => GroupWhereInputSchema).array() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  groupOwner: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  userArray: z.lazy(() => UserListRelationFilterSchema).optional()
}).strict()) as z.ZodType<Prisma.GroupWhereUniqueInput>;

export const GroupOrderByWithAggregationInputSchema: z.ZodType<Prisma.GroupOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => GroupCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => GroupMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => GroupMinOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupOrderByWithAggregationInput>;

export const GroupScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.GroupScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => GroupScalarWhereWithAggregatesInputSchema),z.lazy(() => GroupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => GroupScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => GroupScalarWhereWithAggregatesInputSchema),z.lazy(() => GroupScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupScalarWhereWithAggregatesInput>;

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  ACCESS_TOKEN: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ITEM_ID: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  txArray: z.lazy(() => TxListRelationFilterSchema).optional(),
  splitArray: z.lazy(() => SplitListRelationFilterSchema).optional(),
  myGroup: z.lazy(() => GroupListRelationFilterSchema).optional(),
  groupArray: z.lazy(() => GroupListRelationFilterSchema).optional()
}).strict() as z.ZodType<Prisma.UserWhereInput>;

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  ACCESS_TOKEN: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  PUBLIC_TOKEN: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  ITEM_ID: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  TRANSFER_ID: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  PAYMENT_ID: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  txArray: z.lazy(() => TxOrderByRelationAggregateInputSchema).optional(),
  splitArray: z.lazy(() => SplitOrderByRelationAggregateInputSchema).optional(),
  myGroup: z.lazy(() => GroupOrderByRelationAggregateInputSchema).optional(),
  groupArray: z.lazy(() => GroupOrderByRelationAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserOrderByWithRelationInput>;

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  ACCESS_TOKEN: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ITEM_ID: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  txArray: z.lazy(() => TxListRelationFilterSchema).optional(),
  splitArray: z.lazy(() => SplitListRelationFilterSchema).optional(),
  myGroup: z.lazy(() => GroupListRelationFilterSchema).optional(),
  groupArray: z.lazy(() => GroupListRelationFilterSchema).optional()
}).strict()) as z.ZodType<Prisma.UserWhereUniqueInput>;

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  ACCESS_TOKEN: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  PUBLIC_TOKEN: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  ITEM_ID: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  TRANSFER_ID: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  PAYMENT_ID: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserOrderByWithAggregationInput>;

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  ACCESS_TOKEN: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  ITEM_ID: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.UserScalarWhereWithAggregatesInput>;

export const TxWhereInputSchema: z.ZodType<Prisma.TxWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TxWhereInputSchema),z.lazy(() => TxWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TxWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TxWhereInputSchema),z.lazy(() => TxWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  owner: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  splitArray: z.lazy(() => SplitListRelationFilterSchema).optional()
}).strict() as z.ZodType<Prisma.TxWhereInput>;

export const TxOrderByWithRelationInputSchema: z.ZodType<Prisma.TxOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  owner: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  splitArray: z.lazy(() => SplitOrderByRelationAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxOrderByWithRelationInput>;

export const TxWhereUniqueInputSchema: z.ZodType<Prisma.TxWhereUniqueInput> = z.object({
  id: z.string().cuid()
})
.and(z.object({
  id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => TxWhereInputSchema),z.lazy(() => TxWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TxWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TxWhereInputSchema),z.lazy(() => TxWhereInputSchema).array() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  owner: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  splitArray: z.lazy(() => SplitListRelationFilterSchema).optional()
}).strict()) as z.ZodType<Prisma.TxWhereUniqueInput>;

export const TxOrderByWithAggregationInputSchema: z.ZodType<Prisma.TxOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TxCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TxMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TxMinOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxOrderByWithAggregationInput>;

export const TxScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TxScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TxScalarWhereWithAggregatesInputSchema),z.lazy(() => TxScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TxScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TxScalarWhereWithAggregatesInputSchema),z.lazy(() => TxScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict() as z.ZodType<Prisma.TxScalarWhereWithAggregatesInput>;

export const CatWhereInputSchema: z.ZodType<Prisma.CatWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CatWhereInputSchema),z.lazy(() => CatWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CatWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CatWhereInputSchema),z.lazy(() => CatWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  nameArray: z.lazy(() => StringNullableListFilterSchema).optional(),
  amount: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  splitId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  Split: z.union([ z.lazy(() => SplitRelationFilterSchema),z.lazy(() => SplitWhereInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.CatWhereInput>;

export const CatOrderByWithRelationInputSchema: z.ZodType<Prisma.CatOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  nameArray: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  splitId: z.lazy(() => SortOrderSchema).optional(),
  Split: z.lazy(() => SplitOrderByWithRelationInputSchema).optional()
}).strict() as z.ZodType<Prisma.CatOrderByWithRelationInput>;

export const CatWhereUniqueInputSchema: z.ZodType<Prisma.CatWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => CatWhereInputSchema),z.lazy(() => CatWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CatWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CatWhereInputSchema),z.lazy(() => CatWhereInputSchema).array() ]).optional(),
  nameArray: z.lazy(() => StringNullableListFilterSchema).optional(),
  amount: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  splitId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  Split: z.union([ z.lazy(() => SplitRelationFilterSchema),z.lazy(() => SplitWhereInputSchema) ]).optional(),
}).strict()) as z.ZodType<Prisma.CatWhereUniqueInput>;

export const CatOrderByWithAggregationInputSchema: z.ZodType<Prisma.CatOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  nameArray: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  splitId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CatCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => CatAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CatMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CatMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => CatSumOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.CatOrderByWithAggregationInput>;

export const CatScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CatScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => CatScalarWhereWithAggregatesInputSchema),z.lazy(() => CatScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CatScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CatScalarWhereWithAggregatesInputSchema),z.lazy(() => CatScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  nameArray: z.lazy(() => StringNullableListFilterSchema).optional(),
  amount: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema),z.number() ]).optional(),
  splitId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict() as z.ZodType<Prisma.CatScalarWhereWithAggregatesInput>;

export const SplitWhereInputSchema: z.ZodType<Prisma.SplitWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SplitWhereInputSchema),z.lazy(() => SplitWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SplitWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SplitWhereInputSchema),z.lazy(() => SplitWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  txId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  tx: z.union([ z.lazy(() => TxRelationFilterSchema),z.lazy(() => TxWhereInputSchema) ]).optional(),
  catArray: z.lazy(() => CatListRelationFilterSchema).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.SplitWhereInput>;

export const SplitOrderByWithRelationInputSchema: z.ZodType<Prisma.SplitOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  txId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  tx: z.lazy(() => TxOrderByWithRelationInputSchema).optional(),
  catArray: z.lazy(() => CatOrderByRelationAggregateInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitOrderByWithRelationInput>;

export const SplitWhereUniqueInputSchema: z.ZodType<Prisma.SplitWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => SplitWhereInputSchema),z.lazy(() => SplitWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SplitWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SplitWhereInputSchema),z.lazy(() => SplitWhereInputSchema).array() ]).optional(),
  txId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  tx: z.union([ z.lazy(() => TxRelationFilterSchema),z.lazy(() => TxWhereInputSchema) ]).optional(),
  catArray: z.lazy(() => CatListRelationFilterSchema).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict()) as z.ZodType<Prisma.SplitWhereUniqueInput>;

export const SplitOrderByWithAggregationInputSchema: z.ZodType<Prisma.SplitOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  txId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SplitCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SplitMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SplitMinOrderByAggregateInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitOrderByWithAggregationInput>;

export const SplitScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SplitScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SplitScalarWhereWithAggregatesInputSchema),z.lazy(() => SplitScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SplitScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SplitScalarWhereWithAggregatesInputSchema),z.lazy(() => SplitScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  txId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitScalarWhereWithAggregatesInput>;

export const GroupCreateInputSchema: z.ZodType<Prisma.GroupCreateInput> = z.object({
  id: z.string().uuid().optional(),
  groupOwner: z.lazy(() => UserCreateNestedOneWithoutMyGroupInputSchema),
  userArray: z.lazy(() => UserCreateNestedManyWithoutGroupArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupCreateInput>;

export const GroupUncheckedCreateInputSchema: z.ZodType<Prisma.GroupUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  ownerId: z.string(),
  userArray: z.lazy(() => UserUncheckedCreateNestedManyWithoutGroupArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupUncheckedCreateInput>;

export const GroupUpdateInputSchema: z.ZodType<Prisma.GroupUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  groupOwner: z.lazy(() => UserUpdateOneRequiredWithoutMyGroupNestedInputSchema).optional(),
  userArray: z.lazy(() => UserUpdateManyWithoutGroupArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupUpdateInput>;

export const GroupUncheckedUpdateInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userArray: z.lazy(() => UserUncheckedUpdateManyWithoutGroupArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupUncheckedUpdateInput>;

export const GroupCreateManyInputSchema: z.ZodType<Prisma.GroupCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  ownerId: z.string()
}).strict() as z.ZodType<Prisma.GroupCreateManyInput>;

export const GroupUpdateManyMutationInputSchema: z.ZodType<Prisma.GroupUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.GroupUpdateManyMutationInput>;

export const GroupUncheckedUpdateManyInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.GroupUncheckedUpdateManyInput>;

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  ACCESS_TOKEN: z.string().optional().nullable(),
  PUBLIC_TOKEN: z.string().optional().nullable(),
  ITEM_ID: z.string().optional().nullable(),
  TRANSFER_ID: z.string().optional().nullable(),
  PAYMENT_ID: z.string().optional().nullable(),
  txArray: z.lazy(() => TxCreateNestedManyWithoutOwnerInputSchema).optional(),
  splitArray: z.lazy(() => SplitCreateNestedManyWithoutUserInputSchema).optional(),
  myGroup: z.lazy(() => GroupCreateNestedManyWithoutGroupOwnerInputSchema).optional(),
  groupArray: z.lazy(() => GroupCreateNestedManyWithoutUserArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateInput>;

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  ACCESS_TOKEN: z.string().optional().nullable(),
  PUBLIC_TOKEN: z.string().optional().nullable(),
  ITEM_ID: z.string().optional().nullable(),
  TRANSFER_ID: z.string().optional().nullable(),
  PAYMENT_ID: z.string().optional().nullable(),
  txArray: z.lazy(() => TxUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  splitArray: z.lazy(() => SplitUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  myGroup: z.lazy(() => GroupUncheckedCreateNestedManyWithoutGroupOwnerInputSchema).optional(),
  groupArray: z.lazy(() => GroupUncheckedCreateNestedManyWithoutUserArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUncheckedCreateInput>;

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  txArray: z.lazy(() => TxUpdateManyWithoutOwnerNestedInputSchema).optional(),
  splitArray: z.lazy(() => SplitUpdateManyWithoutUserNestedInputSchema).optional(),
  myGroup: z.lazy(() => GroupUpdateManyWithoutGroupOwnerNestedInputSchema).optional(),
  groupArray: z.lazy(() => GroupUpdateManyWithoutUserArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpdateInput>;

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  txArray: z.lazy(() => TxUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  splitArray: z.lazy(() => SplitUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  myGroup: z.lazy(() => GroupUncheckedUpdateManyWithoutGroupOwnerNestedInputSchema).optional(),
  groupArray: z.lazy(() => GroupUncheckedUpdateManyWithoutUserArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUncheckedUpdateInput>;

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  ACCESS_TOKEN: z.string().optional().nullable(),
  PUBLIC_TOKEN: z.string().optional().nullable(),
  ITEM_ID: z.string().optional().nullable(),
  TRANSFER_ID: z.string().optional().nullable(),
  PAYMENT_ID: z.string().optional().nullable()
}).strict() as z.ZodType<Prisma.UserCreateManyInput>;

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.UserUpdateManyMutationInput>;

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.UserUncheckedUpdateManyInput>;

export const TxCreateInputSchema: z.ZodType<Prisma.TxCreateInput> = z.object({
  id: z.string().cuid().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutTxArrayInputSchema),
  splitArray: z.lazy(() => SplitCreateNestedManyWithoutTxInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxCreateInput>;

export const TxUncheckedCreateInputSchema: z.ZodType<Prisma.TxUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  ownerId: z.string(),
  splitArray: z.lazy(() => SplitUncheckedCreateNestedManyWithoutTxInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxUncheckedCreateInput>;

export const TxUpdateInputSchema: z.ZodType<Prisma.TxUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutTxArrayNestedInputSchema).optional(),
  splitArray: z.lazy(() => SplitUpdateManyWithoutTxNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxUpdateInput>;

export const TxUncheckedUpdateInputSchema: z.ZodType<Prisma.TxUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  splitArray: z.lazy(() => SplitUncheckedUpdateManyWithoutTxNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxUncheckedUpdateInput>;

export const TxCreateManyInputSchema: z.ZodType<Prisma.TxCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  ownerId: z.string()
}).strict() as z.ZodType<Prisma.TxCreateManyInput>;

export const TxUpdateManyMutationInputSchema: z.ZodType<Prisma.TxUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.TxUpdateManyMutationInput>;

export const TxUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TxUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.TxUncheckedUpdateManyInput>;

export const CatCreateInputSchema: z.ZodType<Prisma.CatCreateInput> = z.object({
  id: z.string().uuid().optional(),
  nameArray: z.union([ z.lazy(() => CatCreatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.number(),
  Split: z.lazy(() => SplitCreateNestedOneWithoutCatArrayInputSchema)
}).strict() as z.ZodType<Prisma.CatCreateInput>;

export const CatUncheckedCreateInputSchema: z.ZodType<Prisma.CatUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  nameArray: z.union([ z.lazy(() => CatCreatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.number(),
  splitId: z.string()
}).strict() as z.ZodType<Prisma.CatUncheckedCreateInput>;

export const CatUpdateInputSchema: z.ZodType<Prisma.CatUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  nameArray: z.union([ z.lazy(() => CatUpdatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  Split: z.lazy(() => SplitUpdateOneRequiredWithoutCatArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.CatUpdateInput>;

export const CatUncheckedUpdateInputSchema: z.ZodType<Prisma.CatUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  nameArray: z.union([ z.lazy(() => CatUpdatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  splitId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.CatUncheckedUpdateInput>;

export const CatCreateManyInputSchema: z.ZodType<Prisma.CatCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  nameArray: z.union([ z.lazy(() => CatCreatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.number(),
  splitId: z.string()
}).strict() as z.ZodType<Prisma.CatCreateManyInput>;

export const CatUpdateManyMutationInputSchema: z.ZodType<Prisma.CatUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  nameArray: z.union([ z.lazy(() => CatUpdatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.CatUpdateManyMutationInput>;

export const CatUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CatUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  nameArray: z.union([ z.lazy(() => CatUpdatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  splitId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.CatUncheckedUpdateManyInput>;

export const SplitCreateInputSchema: z.ZodType<Prisma.SplitCreateInput> = z.object({
  id: z.string().uuid().optional(),
  tx: z.lazy(() => TxCreateNestedOneWithoutSplitArrayInputSchema),
  catArray: z.lazy(() => CatCreateNestedManyWithoutSplitInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutSplitArrayInputSchema)
}).strict() as z.ZodType<Prisma.SplitCreateInput>;

export const SplitUncheckedCreateInputSchema: z.ZodType<Prisma.SplitUncheckedCreateInput> = z.object({
  id: z.string().uuid().optional(),
  txId: z.string(),
  userId: z.string(),
  catArray: z.lazy(() => CatUncheckedCreateNestedManyWithoutSplitInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitUncheckedCreateInput>;

export const SplitUpdateInputSchema: z.ZodType<Prisma.SplitUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tx: z.lazy(() => TxUpdateOneRequiredWithoutSplitArrayNestedInputSchema).optional(),
  catArray: z.lazy(() => CatUpdateManyWithoutSplitNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutSplitArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitUpdateInput>;

export const SplitUncheckedUpdateInputSchema: z.ZodType<Prisma.SplitUncheckedUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  txId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  catArray: z.lazy(() => CatUncheckedUpdateManyWithoutSplitNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitUncheckedUpdateInput>;

export const SplitCreateManyInputSchema: z.ZodType<Prisma.SplitCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  txId: z.string(),
  userId: z.string()
}).strict() as z.ZodType<Prisma.SplitCreateManyInput>;

export const SplitUpdateManyMutationInputSchema: z.ZodType<Prisma.SplitUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUpdateManyMutationInput>;

export const SplitUncheckedUpdateManyInputSchema: z.ZodType<Prisma.SplitUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  txId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUncheckedUpdateManyInput>;

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.StringFilter>;

export const UserRelationFilterSchema: z.ZodType<Prisma.UserRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserRelationFilter>;

export const UserListRelationFilterSchema: z.ZodType<Prisma.UserListRelationFilter> = z.object({
  every: z.lazy(() => UserWhereInputSchema).optional(),
  some: z.lazy(() => UserWhereInputSchema).optional(),
  none: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserListRelationFilter>;

export const UserOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserOrderByRelationAggregateInput>;

export const GroupCountOrderByAggregateInputSchema: z.ZodType<Prisma.GroupCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.GroupCountOrderByAggregateInput>;

export const GroupMaxOrderByAggregateInputSchema: z.ZodType<Prisma.GroupMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.GroupMaxOrderByAggregateInput>;

export const GroupMinOrderByAggregateInputSchema: z.ZodType<Prisma.GroupMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.GroupMinOrderByAggregateInput>;

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict() as z.ZodType<Prisma.StringWithAggregatesFilter>;

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.StringNullableFilter>;

export const TxListRelationFilterSchema: z.ZodType<Prisma.TxListRelationFilter> = z.object({
  every: z.lazy(() => TxWhereInputSchema).optional(),
  some: z.lazy(() => TxWhereInputSchema).optional(),
  none: z.lazy(() => TxWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxListRelationFilter>;

export const SplitListRelationFilterSchema: z.ZodType<Prisma.SplitListRelationFilter> = z.object({
  every: z.lazy(() => SplitWhereInputSchema).optional(),
  some: z.lazy(() => SplitWhereInputSchema).optional(),
  none: z.lazy(() => SplitWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitListRelationFilter>;

export const GroupListRelationFilterSchema: z.ZodType<Prisma.GroupListRelationFilter> = z.object({
  every: z.lazy(() => GroupWhereInputSchema).optional(),
  some: z.lazy(() => GroupWhereInputSchema).optional(),
  none: z.lazy(() => GroupWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupListRelationFilter>;

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict() as z.ZodType<Prisma.SortOrderInput>;

export const TxOrderByRelationAggregateInputSchema: z.ZodType<Prisma.TxOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.TxOrderByRelationAggregateInput>;

export const SplitOrderByRelationAggregateInputSchema: z.ZodType<Prisma.SplitOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.SplitOrderByRelationAggregateInput>;

export const GroupOrderByRelationAggregateInputSchema: z.ZodType<Prisma.GroupOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.GroupOrderByRelationAggregateInput>;

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  ACCESS_TOKEN: z.lazy(() => SortOrderSchema).optional(),
  PUBLIC_TOKEN: z.lazy(() => SortOrderSchema).optional(),
  ITEM_ID: z.lazy(() => SortOrderSchema).optional(),
  TRANSFER_ID: z.lazy(() => SortOrderSchema).optional(),
  PAYMENT_ID: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserCountOrderByAggregateInput>;

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  ACCESS_TOKEN: z.lazy(() => SortOrderSchema).optional(),
  PUBLIC_TOKEN: z.lazy(() => SortOrderSchema).optional(),
  ITEM_ID: z.lazy(() => SortOrderSchema).optional(),
  TRANSFER_ID: z.lazy(() => SortOrderSchema).optional(),
  PAYMENT_ID: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserMaxOrderByAggregateInput>;

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  ACCESS_TOKEN: z.lazy(() => SortOrderSchema).optional(),
  PUBLIC_TOKEN: z.lazy(() => SortOrderSchema).optional(),
  ITEM_ID: z.lazy(() => SortOrderSchema).optional(),
  TRANSFER_ID: z.lazy(() => SortOrderSchema).optional(),
  PAYMENT_ID: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.UserMinOrderByAggregateInput>;

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict() as z.ZodType<Prisma.StringNullableWithAggregatesFilter>;

export const TxCountOrderByAggregateInputSchema: z.ZodType<Prisma.TxCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.TxCountOrderByAggregateInput>;

export const TxMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TxMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.TxMaxOrderByAggregateInput>;

export const TxMinOrderByAggregateInputSchema: z.ZodType<Prisma.TxMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.TxMinOrderByAggregateInput>;

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.object({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional()
}).strict() as z.ZodType<Prisma.StringNullableListFilter>;

export const FloatFilterSchema: z.ZodType<Prisma.FloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.FloatFilter>;

export const SplitRelationFilterSchema: z.ZodType<Prisma.SplitRelationFilter> = z.object({
  is: z.lazy(() => SplitWhereInputSchema).optional(),
  isNot: z.lazy(() => SplitWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitRelationFilter>;

export const CatCountOrderByAggregateInputSchema: z.ZodType<Prisma.CatCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  nameArray: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  splitId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.CatCountOrderByAggregateInput>;

export const CatAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CatAvgOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.CatAvgOrderByAggregateInput>;

export const CatMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CatMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  splitId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.CatMaxOrderByAggregateInput>;

export const CatMinOrderByAggregateInputSchema: z.ZodType<Prisma.CatMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  splitId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.CatMinOrderByAggregateInput>;

export const CatSumOrderByAggregateInputSchema: z.ZodType<Prisma.CatSumOrderByAggregateInput> = z.object({
  amount: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.CatSumOrderByAggregateInput>;

export const FloatWithAggregatesFilterSchema: z.ZodType<Prisma.FloatWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional()
}).strict() as z.ZodType<Prisma.FloatWithAggregatesFilter>;

export const TxRelationFilterSchema: z.ZodType<Prisma.TxRelationFilter> = z.object({
  is: z.lazy(() => TxWhereInputSchema).optional(),
  isNot: z.lazy(() => TxWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxRelationFilter>;

export const CatListRelationFilterSchema: z.ZodType<Prisma.CatListRelationFilter> = z.object({
  every: z.lazy(() => CatWhereInputSchema).optional(),
  some: z.lazy(() => CatWhereInputSchema).optional(),
  none: z.lazy(() => CatWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.CatListRelationFilter>;

export const CatOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CatOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.CatOrderByRelationAggregateInput>;

export const SplitCountOrderByAggregateInputSchema: z.ZodType<Prisma.SplitCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  txId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.SplitCountOrderByAggregateInput>;

export const SplitMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SplitMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  txId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.SplitMaxOrderByAggregateInput>;

export const SplitMinOrderByAggregateInputSchema: z.ZodType<Prisma.SplitMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  txId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict() as z.ZodType<Prisma.SplitMinOrderByAggregateInput>;

export const UserCreateNestedOneWithoutMyGroupInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutMyGroupInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutMyGroupInputSchema),z.lazy(() => UserUncheckedCreateWithoutMyGroupInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMyGroupInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateNestedOneWithoutMyGroupInput>;

export const UserCreateNestedManyWithoutGroupArrayInputSchema: z.ZodType<Prisma.UserCreateNestedManyWithoutGroupArrayInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutGroupArrayInputSchema),z.lazy(() => UserCreateWithoutGroupArrayInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutGroupArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutGroupArrayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutGroupArrayInputSchema),z.lazy(() => UserCreateOrConnectWithoutGroupArrayInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserCreateNestedManyWithoutGroupArrayInput>;

export const UserUncheckedCreateNestedManyWithoutGroupArrayInputSchema: z.ZodType<Prisma.UserUncheckedCreateNestedManyWithoutGroupArrayInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutGroupArrayInputSchema),z.lazy(() => UserCreateWithoutGroupArrayInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutGroupArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutGroupArrayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutGroupArrayInputSchema),z.lazy(() => UserCreateOrConnectWithoutGroupArrayInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserUncheckedCreateNestedManyWithoutGroupArrayInput>;

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict() as z.ZodType<Prisma.StringFieldUpdateOperationsInput>;

export const UserUpdateOneRequiredWithoutMyGroupNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutMyGroupNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutMyGroupInputSchema),z.lazy(() => UserUncheckedCreateWithoutMyGroupInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMyGroupInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutMyGroupInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutMyGroupInputSchema),z.lazy(() => UserUpdateWithoutMyGroupInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMyGroupInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserUpdateOneRequiredWithoutMyGroupNestedInput>;

export const UserUpdateManyWithoutGroupArrayNestedInputSchema: z.ZodType<Prisma.UserUpdateManyWithoutGroupArrayNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutGroupArrayInputSchema),z.lazy(() => UserCreateWithoutGroupArrayInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutGroupArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutGroupArrayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutGroupArrayInputSchema),z.lazy(() => UserCreateOrConnectWithoutGroupArrayInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutGroupArrayInputSchema),z.lazy(() => UserUpsertWithWhereUniqueWithoutGroupArrayInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutGroupArrayInputSchema),z.lazy(() => UserUpdateWithWhereUniqueWithoutGroupArrayInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutGroupArrayInputSchema),z.lazy(() => UserUpdateManyWithWhereWithoutGroupArrayInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserUpdateManyWithoutGroupArrayNestedInput>;

export const UserUncheckedUpdateManyWithoutGroupArrayNestedInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutGroupArrayNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutGroupArrayInputSchema),z.lazy(() => UserCreateWithoutGroupArrayInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutGroupArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutGroupArrayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutGroupArrayInputSchema),z.lazy(() => UserCreateOrConnectWithoutGroupArrayInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutGroupArrayInputSchema),z.lazy(() => UserUpsertWithWhereUniqueWithoutGroupArrayInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutGroupArrayInputSchema),z.lazy(() => UserUpdateWithWhereUniqueWithoutGroupArrayInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutGroupArrayInputSchema),z.lazy(() => UserUpdateManyWithWhereWithoutGroupArrayInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserUncheckedUpdateManyWithoutGroupArrayNestedInput>;

export const TxCreateNestedManyWithoutOwnerInputSchema: z.ZodType<Prisma.TxCreateNestedManyWithoutOwnerInput> = z.object({
  create: z.union([ z.lazy(() => TxCreateWithoutOwnerInputSchema),z.lazy(() => TxCreateWithoutOwnerInputSchema).array(),z.lazy(() => TxUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => TxUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TxCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => TxCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TxCreateManyOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TxWhereUniqueInputSchema),z.lazy(() => TxWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.TxCreateNestedManyWithoutOwnerInput>;

export const SplitCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SplitCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SplitCreateWithoutUserInputSchema),z.lazy(() => SplitCreateWithoutUserInputSchema).array(),z.lazy(() => SplitUncheckedCreateWithoutUserInputSchema),z.lazy(() => SplitUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SplitCreateOrConnectWithoutUserInputSchema),z.lazy(() => SplitCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SplitCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitCreateNestedManyWithoutUserInput>;

export const GroupCreateNestedManyWithoutGroupOwnerInputSchema: z.ZodType<Prisma.GroupCreateNestedManyWithoutGroupOwnerInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutGroupOwnerInputSchema),z.lazy(() => GroupCreateWithoutGroupOwnerInputSchema).array(),z.lazy(() => GroupUncheckedCreateWithoutGroupOwnerInputSchema),z.lazy(() => GroupUncheckedCreateWithoutGroupOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => GroupCreateOrConnectWithoutGroupOwnerInputSchema),z.lazy(() => GroupCreateOrConnectWithoutGroupOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => GroupCreateManyGroupOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupCreateNestedManyWithoutGroupOwnerInput>;

export const GroupCreateNestedManyWithoutUserArrayInputSchema: z.ZodType<Prisma.GroupCreateNestedManyWithoutUserArrayInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutUserArrayInputSchema),z.lazy(() => GroupCreateWithoutUserArrayInputSchema).array(),z.lazy(() => GroupUncheckedCreateWithoutUserArrayInputSchema),z.lazy(() => GroupUncheckedCreateWithoutUserArrayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => GroupCreateOrConnectWithoutUserArrayInputSchema),z.lazy(() => GroupCreateOrConnectWithoutUserArrayInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupCreateNestedManyWithoutUserArrayInput>;

export const TxUncheckedCreateNestedManyWithoutOwnerInputSchema: z.ZodType<Prisma.TxUncheckedCreateNestedManyWithoutOwnerInput> = z.object({
  create: z.union([ z.lazy(() => TxCreateWithoutOwnerInputSchema),z.lazy(() => TxCreateWithoutOwnerInputSchema).array(),z.lazy(() => TxUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => TxUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TxCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => TxCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TxCreateManyOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TxWhereUniqueInputSchema),z.lazy(() => TxWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.TxUncheckedCreateNestedManyWithoutOwnerInput>;

export const SplitUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.SplitUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => SplitCreateWithoutUserInputSchema),z.lazy(() => SplitCreateWithoutUserInputSchema).array(),z.lazy(() => SplitUncheckedCreateWithoutUserInputSchema),z.lazy(() => SplitUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SplitCreateOrConnectWithoutUserInputSchema),z.lazy(() => SplitCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SplitCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUncheckedCreateNestedManyWithoutUserInput>;

export const GroupUncheckedCreateNestedManyWithoutGroupOwnerInputSchema: z.ZodType<Prisma.GroupUncheckedCreateNestedManyWithoutGroupOwnerInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutGroupOwnerInputSchema),z.lazy(() => GroupCreateWithoutGroupOwnerInputSchema).array(),z.lazy(() => GroupUncheckedCreateWithoutGroupOwnerInputSchema),z.lazy(() => GroupUncheckedCreateWithoutGroupOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => GroupCreateOrConnectWithoutGroupOwnerInputSchema),z.lazy(() => GroupCreateOrConnectWithoutGroupOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => GroupCreateManyGroupOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupUncheckedCreateNestedManyWithoutGroupOwnerInput>;

export const GroupUncheckedCreateNestedManyWithoutUserArrayInputSchema: z.ZodType<Prisma.GroupUncheckedCreateNestedManyWithoutUserArrayInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutUserArrayInputSchema),z.lazy(() => GroupCreateWithoutUserArrayInputSchema).array(),z.lazy(() => GroupUncheckedCreateWithoutUserArrayInputSchema),z.lazy(() => GroupUncheckedCreateWithoutUserArrayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => GroupCreateOrConnectWithoutUserArrayInputSchema),z.lazy(() => GroupCreateOrConnectWithoutUserArrayInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupUncheckedCreateNestedManyWithoutUserArrayInput>;

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict() as z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput>;

export const TxUpdateManyWithoutOwnerNestedInputSchema: z.ZodType<Prisma.TxUpdateManyWithoutOwnerNestedInput> = z.object({
  create: z.union([ z.lazy(() => TxCreateWithoutOwnerInputSchema),z.lazy(() => TxCreateWithoutOwnerInputSchema).array(),z.lazy(() => TxUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => TxUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TxCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => TxCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TxUpsertWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => TxUpsertWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TxCreateManyOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TxWhereUniqueInputSchema),z.lazy(() => TxWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TxWhereUniqueInputSchema),z.lazy(() => TxWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TxWhereUniqueInputSchema),z.lazy(() => TxWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TxWhereUniqueInputSchema),z.lazy(() => TxWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TxUpdateWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => TxUpdateWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TxUpdateManyWithWhereWithoutOwnerInputSchema),z.lazy(() => TxUpdateManyWithWhereWithoutOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TxScalarWhereInputSchema),z.lazy(() => TxScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.TxUpdateManyWithoutOwnerNestedInput>;

export const SplitUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SplitUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SplitCreateWithoutUserInputSchema),z.lazy(() => SplitCreateWithoutUserInputSchema).array(),z.lazy(() => SplitUncheckedCreateWithoutUserInputSchema),z.lazy(() => SplitUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SplitCreateOrConnectWithoutUserInputSchema),z.lazy(() => SplitCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SplitUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SplitUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SplitCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SplitUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SplitUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SplitUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SplitUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SplitScalarWhereInputSchema),z.lazy(() => SplitScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUpdateManyWithoutUserNestedInput>;

export const GroupUpdateManyWithoutGroupOwnerNestedInputSchema: z.ZodType<Prisma.GroupUpdateManyWithoutGroupOwnerNestedInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutGroupOwnerInputSchema),z.lazy(() => GroupCreateWithoutGroupOwnerInputSchema).array(),z.lazy(() => GroupUncheckedCreateWithoutGroupOwnerInputSchema),z.lazy(() => GroupUncheckedCreateWithoutGroupOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => GroupCreateOrConnectWithoutGroupOwnerInputSchema),z.lazy(() => GroupCreateOrConnectWithoutGroupOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => GroupUpsertWithWhereUniqueWithoutGroupOwnerInputSchema),z.lazy(() => GroupUpsertWithWhereUniqueWithoutGroupOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => GroupCreateManyGroupOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => GroupUpdateWithWhereUniqueWithoutGroupOwnerInputSchema),z.lazy(() => GroupUpdateWithWhereUniqueWithoutGroupOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => GroupUpdateManyWithWhereWithoutGroupOwnerInputSchema),z.lazy(() => GroupUpdateManyWithWhereWithoutGroupOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => GroupScalarWhereInputSchema),z.lazy(() => GroupScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupUpdateManyWithoutGroupOwnerNestedInput>;

export const GroupUpdateManyWithoutUserArrayNestedInputSchema: z.ZodType<Prisma.GroupUpdateManyWithoutUserArrayNestedInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutUserArrayInputSchema),z.lazy(() => GroupCreateWithoutUserArrayInputSchema).array(),z.lazy(() => GroupUncheckedCreateWithoutUserArrayInputSchema),z.lazy(() => GroupUncheckedCreateWithoutUserArrayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => GroupCreateOrConnectWithoutUserArrayInputSchema),z.lazy(() => GroupCreateOrConnectWithoutUserArrayInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => GroupUpsertWithWhereUniqueWithoutUserArrayInputSchema),z.lazy(() => GroupUpsertWithWhereUniqueWithoutUserArrayInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => GroupUpdateWithWhereUniqueWithoutUserArrayInputSchema),z.lazy(() => GroupUpdateWithWhereUniqueWithoutUserArrayInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => GroupUpdateManyWithWhereWithoutUserArrayInputSchema),z.lazy(() => GroupUpdateManyWithWhereWithoutUserArrayInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => GroupScalarWhereInputSchema),z.lazy(() => GroupScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupUpdateManyWithoutUserArrayNestedInput>;

export const TxUncheckedUpdateManyWithoutOwnerNestedInputSchema: z.ZodType<Prisma.TxUncheckedUpdateManyWithoutOwnerNestedInput> = z.object({
  create: z.union([ z.lazy(() => TxCreateWithoutOwnerInputSchema),z.lazy(() => TxCreateWithoutOwnerInputSchema).array(),z.lazy(() => TxUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => TxUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TxCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => TxCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TxUpsertWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => TxUpsertWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TxCreateManyOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TxWhereUniqueInputSchema),z.lazy(() => TxWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TxWhereUniqueInputSchema),z.lazy(() => TxWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TxWhereUniqueInputSchema),z.lazy(() => TxWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TxWhereUniqueInputSchema),z.lazy(() => TxWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TxUpdateWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => TxUpdateWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TxUpdateManyWithWhereWithoutOwnerInputSchema),z.lazy(() => TxUpdateManyWithWhereWithoutOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TxScalarWhereInputSchema),z.lazy(() => TxScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.TxUncheckedUpdateManyWithoutOwnerNestedInput>;

export const SplitUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.SplitUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => SplitCreateWithoutUserInputSchema),z.lazy(() => SplitCreateWithoutUserInputSchema).array(),z.lazy(() => SplitUncheckedCreateWithoutUserInputSchema),z.lazy(() => SplitUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SplitCreateOrConnectWithoutUserInputSchema),z.lazy(() => SplitCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SplitUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SplitUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SplitCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SplitUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => SplitUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SplitUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => SplitUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SplitScalarWhereInputSchema),z.lazy(() => SplitScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUncheckedUpdateManyWithoutUserNestedInput>;

export const GroupUncheckedUpdateManyWithoutGroupOwnerNestedInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateManyWithoutGroupOwnerNestedInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutGroupOwnerInputSchema),z.lazy(() => GroupCreateWithoutGroupOwnerInputSchema).array(),z.lazy(() => GroupUncheckedCreateWithoutGroupOwnerInputSchema),z.lazy(() => GroupUncheckedCreateWithoutGroupOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => GroupCreateOrConnectWithoutGroupOwnerInputSchema),z.lazy(() => GroupCreateOrConnectWithoutGroupOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => GroupUpsertWithWhereUniqueWithoutGroupOwnerInputSchema),z.lazy(() => GroupUpsertWithWhereUniqueWithoutGroupOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => GroupCreateManyGroupOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => GroupUpdateWithWhereUniqueWithoutGroupOwnerInputSchema),z.lazy(() => GroupUpdateWithWhereUniqueWithoutGroupOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => GroupUpdateManyWithWhereWithoutGroupOwnerInputSchema),z.lazy(() => GroupUpdateManyWithWhereWithoutGroupOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => GroupScalarWhereInputSchema),z.lazy(() => GroupScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupUncheckedUpdateManyWithoutGroupOwnerNestedInput>;

export const GroupUncheckedUpdateManyWithoutUserArrayNestedInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateManyWithoutUserArrayNestedInput> = z.object({
  create: z.union([ z.lazy(() => GroupCreateWithoutUserArrayInputSchema),z.lazy(() => GroupCreateWithoutUserArrayInputSchema).array(),z.lazy(() => GroupUncheckedCreateWithoutUserArrayInputSchema),z.lazy(() => GroupUncheckedCreateWithoutUserArrayInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => GroupCreateOrConnectWithoutUserArrayInputSchema),z.lazy(() => GroupCreateOrConnectWithoutUserArrayInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => GroupUpsertWithWhereUniqueWithoutUserArrayInputSchema),z.lazy(() => GroupUpsertWithWhereUniqueWithoutUserArrayInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => GroupWhereUniqueInputSchema),z.lazy(() => GroupWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => GroupUpdateWithWhereUniqueWithoutUserArrayInputSchema),z.lazy(() => GroupUpdateWithWhereUniqueWithoutUserArrayInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => GroupUpdateManyWithWhereWithoutUserArrayInputSchema),z.lazy(() => GroupUpdateManyWithWhereWithoutUserArrayInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => GroupScalarWhereInputSchema),z.lazy(() => GroupScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupUncheckedUpdateManyWithoutUserArrayNestedInput>;

export const UserCreateNestedOneWithoutTxArrayInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutTxArrayInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutTxArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutTxArrayInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutTxArrayInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateNestedOneWithoutTxArrayInput>;

export const SplitCreateNestedManyWithoutTxInputSchema: z.ZodType<Prisma.SplitCreateNestedManyWithoutTxInput> = z.object({
  create: z.union([ z.lazy(() => SplitCreateWithoutTxInputSchema),z.lazy(() => SplitCreateWithoutTxInputSchema).array(),z.lazy(() => SplitUncheckedCreateWithoutTxInputSchema),z.lazy(() => SplitUncheckedCreateWithoutTxInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SplitCreateOrConnectWithoutTxInputSchema),z.lazy(() => SplitCreateOrConnectWithoutTxInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SplitCreateManyTxInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitCreateNestedManyWithoutTxInput>;

export const SplitUncheckedCreateNestedManyWithoutTxInputSchema: z.ZodType<Prisma.SplitUncheckedCreateNestedManyWithoutTxInput> = z.object({
  create: z.union([ z.lazy(() => SplitCreateWithoutTxInputSchema),z.lazy(() => SplitCreateWithoutTxInputSchema).array(),z.lazy(() => SplitUncheckedCreateWithoutTxInputSchema),z.lazy(() => SplitUncheckedCreateWithoutTxInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SplitCreateOrConnectWithoutTxInputSchema),z.lazy(() => SplitCreateOrConnectWithoutTxInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SplitCreateManyTxInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUncheckedCreateNestedManyWithoutTxInput>;

export const UserUpdateOneRequiredWithoutTxArrayNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutTxArrayNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutTxArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutTxArrayInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutTxArrayInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutTxArrayInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutTxArrayInputSchema),z.lazy(() => UserUpdateWithoutTxArrayInputSchema),z.lazy(() => UserUncheckedUpdateWithoutTxArrayInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserUpdateOneRequiredWithoutTxArrayNestedInput>;

export const SplitUpdateManyWithoutTxNestedInputSchema: z.ZodType<Prisma.SplitUpdateManyWithoutTxNestedInput> = z.object({
  create: z.union([ z.lazy(() => SplitCreateWithoutTxInputSchema),z.lazy(() => SplitCreateWithoutTxInputSchema).array(),z.lazy(() => SplitUncheckedCreateWithoutTxInputSchema),z.lazy(() => SplitUncheckedCreateWithoutTxInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SplitCreateOrConnectWithoutTxInputSchema),z.lazy(() => SplitCreateOrConnectWithoutTxInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SplitUpsertWithWhereUniqueWithoutTxInputSchema),z.lazy(() => SplitUpsertWithWhereUniqueWithoutTxInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SplitCreateManyTxInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SplitUpdateWithWhereUniqueWithoutTxInputSchema),z.lazy(() => SplitUpdateWithWhereUniqueWithoutTxInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SplitUpdateManyWithWhereWithoutTxInputSchema),z.lazy(() => SplitUpdateManyWithWhereWithoutTxInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SplitScalarWhereInputSchema),z.lazy(() => SplitScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUpdateManyWithoutTxNestedInput>;

export const SplitUncheckedUpdateManyWithoutTxNestedInputSchema: z.ZodType<Prisma.SplitUncheckedUpdateManyWithoutTxNestedInput> = z.object({
  create: z.union([ z.lazy(() => SplitCreateWithoutTxInputSchema),z.lazy(() => SplitCreateWithoutTxInputSchema).array(),z.lazy(() => SplitUncheckedCreateWithoutTxInputSchema),z.lazy(() => SplitUncheckedCreateWithoutTxInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SplitCreateOrConnectWithoutTxInputSchema),z.lazy(() => SplitCreateOrConnectWithoutTxInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SplitUpsertWithWhereUniqueWithoutTxInputSchema),z.lazy(() => SplitUpsertWithWhereUniqueWithoutTxInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SplitCreateManyTxInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SplitWhereUniqueInputSchema),z.lazy(() => SplitWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SplitUpdateWithWhereUniqueWithoutTxInputSchema),z.lazy(() => SplitUpdateWithWhereUniqueWithoutTxInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SplitUpdateManyWithWhereWithoutTxInputSchema),z.lazy(() => SplitUpdateManyWithWhereWithoutTxInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SplitScalarWhereInputSchema),z.lazy(() => SplitScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUncheckedUpdateManyWithoutTxNestedInput>;

export const CatCreatenameArrayInputSchema: z.ZodType<Prisma.CatCreatenameArrayInput> = z.object({
  set: z.string().array()
}).strict() as z.ZodType<Prisma.CatCreatenameArrayInput>;

export const SplitCreateNestedOneWithoutCatArrayInputSchema: z.ZodType<Prisma.SplitCreateNestedOneWithoutCatArrayInput> = z.object({
  create: z.union([ z.lazy(() => SplitCreateWithoutCatArrayInputSchema),z.lazy(() => SplitUncheckedCreateWithoutCatArrayInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => SplitCreateOrConnectWithoutCatArrayInputSchema).optional(),
  connect: z.lazy(() => SplitWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitCreateNestedOneWithoutCatArrayInput>;

export const CatUpdatenameArrayInputSchema: z.ZodType<Prisma.CatUpdatenameArrayInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict() as z.ZodType<Prisma.CatUpdatenameArrayInput>;

export const FloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict() as z.ZodType<Prisma.FloatFieldUpdateOperationsInput>;

export const SplitUpdateOneRequiredWithoutCatArrayNestedInputSchema: z.ZodType<Prisma.SplitUpdateOneRequiredWithoutCatArrayNestedInput> = z.object({
  create: z.union([ z.lazy(() => SplitCreateWithoutCatArrayInputSchema),z.lazy(() => SplitUncheckedCreateWithoutCatArrayInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => SplitCreateOrConnectWithoutCatArrayInputSchema).optional(),
  upsert: z.lazy(() => SplitUpsertWithoutCatArrayInputSchema).optional(),
  connect: z.lazy(() => SplitWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => SplitUpdateToOneWithWhereWithoutCatArrayInputSchema),z.lazy(() => SplitUpdateWithoutCatArrayInputSchema),z.lazy(() => SplitUncheckedUpdateWithoutCatArrayInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUpdateOneRequiredWithoutCatArrayNestedInput>;

export const TxCreateNestedOneWithoutSplitArrayInputSchema: z.ZodType<Prisma.TxCreateNestedOneWithoutSplitArrayInput> = z.object({
  create: z.union([ z.lazy(() => TxCreateWithoutSplitArrayInputSchema),z.lazy(() => TxUncheckedCreateWithoutSplitArrayInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TxCreateOrConnectWithoutSplitArrayInputSchema).optional(),
  connect: z.lazy(() => TxWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxCreateNestedOneWithoutSplitArrayInput>;

export const CatCreateNestedManyWithoutSplitInputSchema: z.ZodType<Prisma.CatCreateNestedManyWithoutSplitInput> = z.object({
  create: z.union([ z.lazy(() => CatCreateWithoutSplitInputSchema),z.lazy(() => CatCreateWithoutSplitInputSchema).array(),z.lazy(() => CatUncheckedCreateWithoutSplitInputSchema),z.lazy(() => CatUncheckedCreateWithoutSplitInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CatCreateOrConnectWithoutSplitInputSchema),z.lazy(() => CatCreateOrConnectWithoutSplitInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CatCreateManySplitInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CatWhereUniqueInputSchema),z.lazy(() => CatWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.CatCreateNestedManyWithoutSplitInput>;

export const UserCreateNestedOneWithoutSplitArrayInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutSplitArrayInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSplitArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutSplitArrayInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSplitArrayInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateNestedOneWithoutSplitArrayInput>;

export const CatUncheckedCreateNestedManyWithoutSplitInputSchema: z.ZodType<Prisma.CatUncheckedCreateNestedManyWithoutSplitInput> = z.object({
  create: z.union([ z.lazy(() => CatCreateWithoutSplitInputSchema),z.lazy(() => CatCreateWithoutSplitInputSchema).array(),z.lazy(() => CatUncheckedCreateWithoutSplitInputSchema),z.lazy(() => CatUncheckedCreateWithoutSplitInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CatCreateOrConnectWithoutSplitInputSchema),z.lazy(() => CatCreateOrConnectWithoutSplitInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CatCreateManySplitInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CatWhereUniqueInputSchema),z.lazy(() => CatWhereUniqueInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.CatUncheckedCreateNestedManyWithoutSplitInput>;

export const TxUpdateOneRequiredWithoutSplitArrayNestedInputSchema: z.ZodType<Prisma.TxUpdateOneRequiredWithoutSplitArrayNestedInput> = z.object({
  create: z.union([ z.lazy(() => TxCreateWithoutSplitArrayInputSchema),z.lazy(() => TxUncheckedCreateWithoutSplitArrayInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TxCreateOrConnectWithoutSplitArrayInputSchema).optional(),
  upsert: z.lazy(() => TxUpsertWithoutSplitArrayInputSchema).optional(),
  connect: z.lazy(() => TxWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TxUpdateToOneWithWhereWithoutSplitArrayInputSchema),z.lazy(() => TxUpdateWithoutSplitArrayInputSchema),z.lazy(() => TxUncheckedUpdateWithoutSplitArrayInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.TxUpdateOneRequiredWithoutSplitArrayNestedInput>;

export const CatUpdateManyWithoutSplitNestedInputSchema: z.ZodType<Prisma.CatUpdateManyWithoutSplitNestedInput> = z.object({
  create: z.union([ z.lazy(() => CatCreateWithoutSplitInputSchema),z.lazy(() => CatCreateWithoutSplitInputSchema).array(),z.lazy(() => CatUncheckedCreateWithoutSplitInputSchema),z.lazy(() => CatUncheckedCreateWithoutSplitInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CatCreateOrConnectWithoutSplitInputSchema),z.lazy(() => CatCreateOrConnectWithoutSplitInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CatUpsertWithWhereUniqueWithoutSplitInputSchema),z.lazy(() => CatUpsertWithWhereUniqueWithoutSplitInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CatCreateManySplitInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CatWhereUniqueInputSchema),z.lazy(() => CatWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CatWhereUniqueInputSchema),z.lazy(() => CatWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CatWhereUniqueInputSchema),z.lazy(() => CatWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CatWhereUniqueInputSchema),z.lazy(() => CatWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CatUpdateWithWhereUniqueWithoutSplitInputSchema),z.lazy(() => CatUpdateWithWhereUniqueWithoutSplitInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CatUpdateManyWithWhereWithoutSplitInputSchema),z.lazy(() => CatUpdateManyWithWhereWithoutSplitInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CatScalarWhereInputSchema),z.lazy(() => CatScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.CatUpdateManyWithoutSplitNestedInput>;

export const UserUpdateOneRequiredWithoutSplitArrayNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutSplitArrayNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutSplitArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutSplitArrayInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutSplitArrayInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutSplitArrayInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutSplitArrayInputSchema),z.lazy(() => UserUpdateWithoutSplitArrayInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSplitArrayInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.UserUpdateOneRequiredWithoutSplitArrayNestedInput>;

export const CatUncheckedUpdateManyWithoutSplitNestedInputSchema: z.ZodType<Prisma.CatUncheckedUpdateManyWithoutSplitNestedInput> = z.object({
  create: z.union([ z.lazy(() => CatCreateWithoutSplitInputSchema),z.lazy(() => CatCreateWithoutSplitInputSchema).array(),z.lazy(() => CatUncheckedCreateWithoutSplitInputSchema),z.lazy(() => CatUncheckedCreateWithoutSplitInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CatCreateOrConnectWithoutSplitInputSchema),z.lazy(() => CatCreateOrConnectWithoutSplitInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CatUpsertWithWhereUniqueWithoutSplitInputSchema),z.lazy(() => CatUpsertWithWhereUniqueWithoutSplitInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CatCreateManySplitInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CatWhereUniqueInputSchema),z.lazy(() => CatWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CatWhereUniqueInputSchema),z.lazy(() => CatWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CatWhereUniqueInputSchema),z.lazy(() => CatWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CatWhereUniqueInputSchema),z.lazy(() => CatWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CatUpdateWithWhereUniqueWithoutSplitInputSchema),z.lazy(() => CatUpdateWithWhereUniqueWithoutSplitInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CatUpdateManyWithWhereWithoutSplitInputSchema),z.lazy(() => CatUpdateManyWithWhereWithoutSplitInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CatScalarWhereInputSchema),z.lazy(() => CatScalarWhereInputSchema).array() ]).optional(),
}).strict() as z.ZodType<Prisma.CatUncheckedUpdateManyWithoutSplitNestedInput>;

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.NestedStringFilter>;

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedStringWithAggregatesFilter>;

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.NestedIntFilter>;

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.NestedStringNullableFilter>;

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter>;

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.NestedIntNullableFilter>;

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.NestedFloatFilter>;

export const NestedFloatWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional()
}).strict() as z.ZodType<Prisma.NestedFloatWithAggregatesFilter>;

export const UserCreateWithoutMyGroupInputSchema: z.ZodType<Prisma.UserCreateWithoutMyGroupInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  ACCESS_TOKEN: z.string().optional().nullable(),
  PUBLIC_TOKEN: z.string().optional().nullable(),
  ITEM_ID: z.string().optional().nullable(),
  TRANSFER_ID: z.string().optional().nullable(),
  PAYMENT_ID: z.string().optional().nullable(),
  txArray: z.lazy(() => TxCreateNestedManyWithoutOwnerInputSchema).optional(),
  splitArray: z.lazy(() => SplitCreateNestedManyWithoutUserInputSchema).optional(),
  groupArray: z.lazy(() => GroupCreateNestedManyWithoutUserArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateWithoutMyGroupInput>;

export const UserUncheckedCreateWithoutMyGroupInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutMyGroupInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  ACCESS_TOKEN: z.string().optional().nullable(),
  PUBLIC_TOKEN: z.string().optional().nullable(),
  ITEM_ID: z.string().optional().nullable(),
  TRANSFER_ID: z.string().optional().nullable(),
  PAYMENT_ID: z.string().optional().nullable(),
  txArray: z.lazy(() => TxUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  splitArray: z.lazy(() => SplitUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  groupArray: z.lazy(() => GroupUncheckedCreateNestedManyWithoutUserArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUncheckedCreateWithoutMyGroupInput>;

export const UserCreateOrConnectWithoutMyGroupInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutMyGroupInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutMyGroupInputSchema),z.lazy(() => UserUncheckedCreateWithoutMyGroupInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserCreateOrConnectWithoutMyGroupInput>;

export const UserCreateWithoutGroupArrayInputSchema: z.ZodType<Prisma.UserCreateWithoutGroupArrayInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  ACCESS_TOKEN: z.string().optional().nullable(),
  PUBLIC_TOKEN: z.string().optional().nullable(),
  ITEM_ID: z.string().optional().nullable(),
  TRANSFER_ID: z.string().optional().nullable(),
  PAYMENT_ID: z.string().optional().nullable(),
  txArray: z.lazy(() => TxCreateNestedManyWithoutOwnerInputSchema).optional(),
  splitArray: z.lazy(() => SplitCreateNestedManyWithoutUserInputSchema).optional(),
  myGroup: z.lazy(() => GroupCreateNestedManyWithoutGroupOwnerInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateWithoutGroupArrayInput>;

export const UserUncheckedCreateWithoutGroupArrayInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutGroupArrayInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  ACCESS_TOKEN: z.string().optional().nullable(),
  PUBLIC_TOKEN: z.string().optional().nullable(),
  ITEM_ID: z.string().optional().nullable(),
  TRANSFER_ID: z.string().optional().nullable(),
  PAYMENT_ID: z.string().optional().nullable(),
  txArray: z.lazy(() => TxUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  splitArray: z.lazy(() => SplitUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  myGroup: z.lazy(() => GroupUncheckedCreateNestedManyWithoutGroupOwnerInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUncheckedCreateWithoutGroupArrayInput>;

export const UserCreateOrConnectWithoutGroupArrayInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutGroupArrayInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutGroupArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutGroupArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserCreateOrConnectWithoutGroupArrayInput>;

export const UserUpsertWithoutMyGroupInputSchema: z.ZodType<Prisma.UserUpsertWithoutMyGroupInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutMyGroupInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMyGroupInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutMyGroupInputSchema),z.lazy(() => UserUncheckedCreateWithoutMyGroupInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpsertWithoutMyGroupInput>;

export const UserUpdateToOneWithWhereWithoutMyGroupInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutMyGroupInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutMyGroupInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMyGroupInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutMyGroupInput>;

export const UserUpdateWithoutMyGroupInputSchema: z.ZodType<Prisma.UserUpdateWithoutMyGroupInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  txArray: z.lazy(() => TxUpdateManyWithoutOwnerNestedInputSchema).optional(),
  splitArray: z.lazy(() => SplitUpdateManyWithoutUserNestedInputSchema).optional(),
  groupArray: z.lazy(() => GroupUpdateManyWithoutUserArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpdateWithoutMyGroupInput>;

export const UserUncheckedUpdateWithoutMyGroupInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutMyGroupInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  txArray: z.lazy(() => TxUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  splitArray: z.lazy(() => SplitUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  groupArray: z.lazy(() => GroupUncheckedUpdateManyWithoutUserArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUncheckedUpdateWithoutMyGroupInput>;

export const UserUpsertWithWhereUniqueWithoutGroupArrayInputSchema: z.ZodType<Prisma.UserUpsertWithWhereUniqueWithoutGroupArrayInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserUpdateWithoutGroupArrayInputSchema),z.lazy(() => UserUncheckedUpdateWithoutGroupArrayInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutGroupArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutGroupArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpsertWithWhereUniqueWithoutGroupArrayInput>;

export const UserUpdateWithWhereUniqueWithoutGroupArrayInputSchema: z.ZodType<Prisma.UserUpdateWithWhereUniqueWithoutGroupArrayInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserUpdateWithoutGroupArrayInputSchema),z.lazy(() => UserUncheckedUpdateWithoutGroupArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateWithWhereUniqueWithoutGroupArrayInput>;

export const UserUpdateManyWithWhereWithoutGroupArrayInputSchema: z.ZodType<Prisma.UserUpdateManyWithWhereWithoutGroupArrayInput> = z.object({
  where: z.lazy(() => UserScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserUpdateManyMutationInputSchema),z.lazy(() => UserUncheckedUpdateManyWithoutGroupArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateManyWithWhereWithoutGroupArrayInput>;

export const UserScalarWhereInputSchema: z.ZodType<Prisma.UserScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  ACCESS_TOKEN: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ITEM_ID: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.UserScalarWhereInput>;

export const TxCreateWithoutOwnerInputSchema: z.ZodType<Prisma.TxCreateWithoutOwnerInput> = z.object({
  id: z.string().cuid().optional(),
  splitArray: z.lazy(() => SplitCreateNestedManyWithoutTxInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxCreateWithoutOwnerInput>;

export const TxUncheckedCreateWithoutOwnerInputSchema: z.ZodType<Prisma.TxUncheckedCreateWithoutOwnerInput> = z.object({
  id: z.string().cuid().optional(),
  splitArray: z.lazy(() => SplitUncheckedCreateNestedManyWithoutTxInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxUncheckedCreateWithoutOwnerInput>;

export const TxCreateOrConnectWithoutOwnerInputSchema: z.ZodType<Prisma.TxCreateOrConnectWithoutOwnerInput> = z.object({
  where: z.lazy(() => TxWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TxCreateWithoutOwnerInputSchema),z.lazy(() => TxUncheckedCreateWithoutOwnerInputSchema) ]),
}).strict() as z.ZodType<Prisma.TxCreateOrConnectWithoutOwnerInput>;

export const TxCreateManyOwnerInputEnvelopeSchema: z.ZodType<Prisma.TxCreateManyOwnerInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TxCreateManyOwnerInputSchema),z.lazy(() => TxCreateManyOwnerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.TxCreateManyOwnerInputEnvelope>;

export const SplitCreateWithoutUserInputSchema: z.ZodType<Prisma.SplitCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  tx: z.lazy(() => TxCreateNestedOneWithoutSplitArrayInputSchema),
  catArray: z.lazy(() => CatCreateNestedManyWithoutSplitInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitCreateWithoutUserInput>;

export const SplitUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.SplitUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().uuid().optional(),
  txId: z.string(),
  catArray: z.lazy(() => CatUncheckedCreateNestedManyWithoutSplitInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitUncheckedCreateWithoutUserInput>;

export const SplitCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.SplitCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => SplitWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SplitCreateWithoutUserInputSchema),z.lazy(() => SplitUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.SplitCreateOrConnectWithoutUserInput>;

export const SplitCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.SplitCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SplitCreateManyUserInputSchema),z.lazy(() => SplitCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.SplitCreateManyUserInputEnvelope>;

export const GroupCreateWithoutGroupOwnerInputSchema: z.ZodType<Prisma.GroupCreateWithoutGroupOwnerInput> = z.object({
  id: z.string().uuid().optional(),
  userArray: z.lazy(() => UserCreateNestedManyWithoutGroupArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupCreateWithoutGroupOwnerInput>;

export const GroupUncheckedCreateWithoutGroupOwnerInputSchema: z.ZodType<Prisma.GroupUncheckedCreateWithoutGroupOwnerInput> = z.object({
  id: z.string().uuid().optional(),
  userArray: z.lazy(() => UserUncheckedCreateNestedManyWithoutGroupArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupUncheckedCreateWithoutGroupOwnerInput>;

export const GroupCreateOrConnectWithoutGroupOwnerInputSchema: z.ZodType<Prisma.GroupCreateOrConnectWithoutGroupOwnerInput> = z.object({
  where: z.lazy(() => GroupWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => GroupCreateWithoutGroupOwnerInputSchema),z.lazy(() => GroupUncheckedCreateWithoutGroupOwnerInputSchema) ]),
}).strict() as z.ZodType<Prisma.GroupCreateOrConnectWithoutGroupOwnerInput>;

export const GroupCreateManyGroupOwnerInputEnvelopeSchema: z.ZodType<Prisma.GroupCreateManyGroupOwnerInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => GroupCreateManyGroupOwnerInputSchema),z.lazy(() => GroupCreateManyGroupOwnerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.GroupCreateManyGroupOwnerInputEnvelope>;

export const GroupCreateWithoutUserArrayInputSchema: z.ZodType<Prisma.GroupCreateWithoutUserArrayInput> = z.object({
  id: z.string().uuid().optional(),
  groupOwner: z.lazy(() => UserCreateNestedOneWithoutMyGroupInputSchema)
}).strict() as z.ZodType<Prisma.GroupCreateWithoutUserArrayInput>;

export const GroupUncheckedCreateWithoutUserArrayInputSchema: z.ZodType<Prisma.GroupUncheckedCreateWithoutUserArrayInput> = z.object({
  id: z.string().uuid().optional(),
  ownerId: z.string()
}).strict() as z.ZodType<Prisma.GroupUncheckedCreateWithoutUserArrayInput>;

export const GroupCreateOrConnectWithoutUserArrayInputSchema: z.ZodType<Prisma.GroupCreateOrConnectWithoutUserArrayInput> = z.object({
  where: z.lazy(() => GroupWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => GroupCreateWithoutUserArrayInputSchema),z.lazy(() => GroupUncheckedCreateWithoutUserArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.GroupCreateOrConnectWithoutUserArrayInput>;

export const TxUpsertWithWhereUniqueWithoutOwnerInputSchema: z.ZodType<Prisma.TxUpsertWithWhereUniqueWithoutOwnerInput> = z.object({
  where: z.lazy(() => TxWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TxUpdateWithoutOwnerInputSchema),z.lazy(() => TxUncheckedUpdateWithoutOwnerInputSchema) ]),
  create: z.union([ z.lazy(() => TxCreateWithoutOwnerInputSchema),z.lazy(() => TxUncheckedCreateWithoutOwnerInputSchema) ]),
}).strict() as z.ZodType<Prisma.TxUpsertWithWhereUniqueWithoutOwnerInput>;

export const TxUpdateWithWhereUniqueWithoutOwnerInputSchema: z.ZodType<Prisma.TxUpdateWithWhereUniqueWithoutOwnerInput> = z.object({
  where: z.lazy(() => TxWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TxUpdateWithoutOwnerInputSchema),z.lazy(() => TxUncheckedUpdateWithoutOwnerInputSchema) ]),
}).strict() as z.ZodType<Prisma.TxUpdateWithWhereUniqueWithoutOwnerInput>;

export const TxUpdateManyWithWhereWithoutOwnerInputSchema: z.ZodType<Prisma.TxUpdateManyWithWhereWithoutOwnerInput> = z.object({
  where: z.lazy(() => TxScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TxUpdateManyMutationInputSchema),z.lazy(() => TxUncheckedUpdateManyWithoutOwnerInputSchema) ]),
}).strict() as z.ZodType<Prisma.TxUpdateManyWithWhereWithoutOwnerInput>;

export const TxScalarWhereInputSchema: z.ZodType<Prisma.TxScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TxScalarWhereInputSchema),z.lazy(() => TxScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TxScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TxScalarWhereInputSchema),z.lazy(() => TxScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict() as z.ZodType<Prisma.TxScalarWhereInput>;

export const SplitUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SplitUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SplitWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SplitUpdateWithoutUserInputSchema),z.lazy(() => SplitUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => SplitCreateWithoutUserInputSchema),z.lazy(() => SplitUncheckedCreateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.SplitUpsertWithWhereUniqueWithoutUserInput>;

export const SplitUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.SplitUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => SplitWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SplitUpdateWithoutUserInputSchema),z.lazy(() => SplitUncheckedUpdateWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.SplitUpdateWithWhereUniqueWithoutUserInput>;

export const SplitUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.SplitUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => SplitScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SplitUpdateManyMutationInputSchema),z.lazy(() => SplitUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict() as z.ZodType<Prisma.SplitUpdateManyWithWhereWithoutUserInput>;

export const SplitScalarWhereInputSchema: z.ZodType<Prisma.SplitScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SplitScalarWhereInputSchema),z.lazy(() => SplitScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SplitScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SplitScalarWhereInputSchema),z.lazy(() => SplitScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  txId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitScalarWhereInput>;

export const GroupUpsertWithWhereUniqueWithoutGroupOwnerInputSchema: z.ZodType<Prisma.GroupUpsertWithWhereUniqueWithoutGroupOwnerInput> = z.object({
  where: z.lazy(() => GroupWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => GroupUpdateWithoutGroupOwnerInputSchema),z.lazy(() => GroupUncheckedUpdateWithoutGroupOwnerInputSchema) ]),
  create: z.union([ z.lazy(() => GroupCreateWithoutGroupOwnerInputSchema),z.lazy(() => GroupUncheckedCreateWithoutGroupOwnerInputSchema) ]),
}).strict() as z.ZodType<Prisma.GroupUpsertWithWhereUniqueWithoutGroupOwnerInput>;

export const GroupUpdateWithWhereUniqueWithoutGroupOwnerInputSchema: z.ZodType<Prisma.GroupUpdateWithWhereUniqueWithoutGroupOwnerInput> = z.object({
  where: z.lazy(() => GroupWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => GroupUpdateWithoutGroupOwnerInputSchema),z.lazy(() => GroupUncheckedUpdateWithoutGroupOwnerInputSchema) ]),
}).strict() as z.ZodType<Prisma.GroupUpdateWithWhereUniqueWithoutGroupOwnerInput>;

export const GroupUpdateManyWithWhereWithoutGroupOwnerInputSchema: z.ZodType<Prisma.GroupUpdateManyWithWhereWithoutGroupOwnerInput> = z.object({
  where: z.lazy(() => GroupScalarWhereInputSchema),
  data: z.union([ z.lazy(() => GroupUpdateManyMutationInputSchema),z.lazy(() => GroupUncheckedUpdateManyWithoutGroupOwnerInputSchema) ]),
}).strict() as z.ZodType<Prisma.GroupUpdateManyWithWhereWithoutGroupOwnerInput>;

export const GroupScalarWhereInputSchema: z.ZodType<Prisma.GroupScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => GroupScalarWhereInputSchema),z.lazy(() => GroupScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => GroupScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => GroupScalarWhereInputSchema),z.lazy(() => GroupScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupScalarWhereInput>;

export const GroupUpsertWithWhereUniqueWithoutUserArrayInputSchema: z.ZodType<Prisma.GroupUpsertWithWhereUniqueWithoutUserArrayInput> = z.object({
  where: z.lazy(() => GroupWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => GroupUpdateWithoutUserArrayInputSchema),z.lazy(() => GroupUncheckedUpdateWithoutUserArrayInputSchema) ]),
  create: z.union([ z.lazy(() => GroupCreateWithoutUserArrayInputSchema),z.lazy(() => GroupUncheckedCreateWithoutUserArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.GroupUpsertWithWhereUniqueWithoutUserArrayInput>;

export const GroupUpdateWithWhereUniqueWithoutUserArrayInputSchema: z.ZodType<Prisma.GroupUpdateWithWhereUniqueWithoutUserArrayInput> = z.object({
  where: z.lazy(() => GroupWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => GroupUpdateWithoutUserArrayInputSchema),z.lazy(() => GroupUncheckedUpdateWithoutUserArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.GroupUpdateWithWhereUniqueWithoutUserArrayInput>;

export const GroupUpdateManyWithWhereWithoutUserArrayInputSchema: z.ZodType<Prisma.GroupUpdateManyWithWhereWithoutUserArrayInput> = z.object({
  where: z.lazy(() => GroupScalarWhereInputSchema),
  data: z.union([ z.lazy(() => GroupUpdateManyMutationInputSchema),z.lazy(() => GroupUncheckedUpdateManyWithoutUserArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.GroupUpdateManyWithWhereWithoutUserArrayInput>;

export const UserCreateWithoutTxArrayInputSchema: z.ZodType<Prisma.UserCreateWithoutTxArrayInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  ACCESS_TOKEN: z.string().optional().nullable(),
  PUBLIC_TOKEN: z.string().optional().nullable(),
  ITEM_ID: z.string().optional().nullable(),
  TRANSFER_ID: z.string().optional().nullable(),
  PAYMENT_ID: z.string().optional().nullable(),
  splitArray: z.lazy(() => SplitCreateNestedManyWithoutUserInputSchema).optional(),
  myGroup: z.lazy(() => GroupCreateNestedManyWithoutGroupOwnerInputSchema).optional(),
  groupArray: z.lazy(() => GroupCreateNestedManyWithoutUserArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateWithoutTxArrayInput>;

export const UserUncheckedCreateWithoutTxArrayInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutTxArrayInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  ACCESS_TOKEN: z.string().optional().nullable(),
  PUBLIC_TOKEN: z.string().optional().nullable(),
  ITEM_ID: z.string().optional().nullable(),
  TRANSFER_ID: z.string().optional().nullable(),
  PAYMENT_ID: z.string().optional().nullable(),
  splitArray: z.lazy(() => SplitUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  myGroup: z.lazy(() => GroupUncheckedCreateNestedManyWithoutGroupOwnerInputSchema).optional(),
  groupArray: z.lazy(() => GroupUncheckedCreateNestedManyWithoutUserArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUncheckedCreateWithoutTxArrayInput>;

export const UserCreateOrConnectWithoutTxArrayInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutTxArrayInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutTxArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutTxArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserCreateOrConnectWithoutTxArrayInput>;

export const SplitCreateWithoutTxInputSchema: z.ZodType<Prisma.SplitCreateWithoutTxInput> = z.object({
  id: z.string().uuid().optional(),
  catArray: z.lazy(() => CatCreateNestedManyWithoutSplitInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutSplitArrayInputSchema)
}).strict() as z.ZodType<Prisma.SplitCreateWithoutTxInput>;

export const SplitUncheckedCreateWithoutTxInputSchema: z.ZodType<Prisma.SplitUncheckedCreateWithoutTxInput> = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  catArray: z.lazy(() => CatUncheckedCreateNestedManyWithoutSplitInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitUncheckedCreateWithoutTxInput>;

export const SplitCreateOrConnectWithoutTxInputSchema: z.ZodType<Prisma.SplitCreateOrConnectWithoutTxInput> = z.object({
  where: z.lazy(() => SplitWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SplitCreateWithoutTxInputSchema),z.lazy(() => SplitUncheckedCreateWithoutTxInputSchema) ]),
}).strict() as z.ZodType<Prisma.SplitCreateOrConnectWithoutTxInput>;

export const SplitCreateManyTxInputEnvelopeSchema: z.ZodType<Prisma.SplitCreateManyTxInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SplitCreateManyTxInputSchema),z.lazy(() => SplitCreateManyTxInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.SplitCreateManyTxInputEnvelope>;

export const UserUpsertWithoutTxArrayInputSchema: z.ZodType<Prisma.UserUpsertWithoutTxArrayInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutTxArrayInputSchema),z.lazy(() => UserUncheckedUpdateWithoutTxArrayInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutTxArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutTxArrayInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpsertWithoutTxArrayInput>;

export const UserUpdateToOneWithWhereWithoutTxArrayInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutTxArrayInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutTxArrayInputSchema),z.lazy(() => UserUncheckedUpdateWithoutTxArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutTxArrayInput>;

export const UserUpdateWithoutTxArrayInputSchema: z.ZodType<Prisma.UserUpdateWithoutTxArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  splitArray: z.lazy(() => SplitUpdateManyWithoutUserNestedInputSchema).optional(),
  myGroup: z.lazy(() => GroupUpdateManyWithoutGroupOwnerNestedInputSchema).optional(),
  groupArray: z.lazy(() => GroupUpdateManyWithoutUserArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpdateWithoutTxArrayInput>;

export const UserUncheckedUpdateWithoutTxArrayInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutTxArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  splitArray: z.lazy(() => SplitUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  myGroup: z.lazy(() => GroupUncheckedUpdateManyWithoutGroupOwnerNestedInputSchema).optional(),
  groupArray: z.lazy(() => GroupUncheckedUpdateManyWithoutUserArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUncheckedUpdateWithoutTxArrayInput>;

export const SplitUpsertWithWhereUniqueWithoutTxInputSchema: z.ZodType<Prisma.SplitUpsertWithWhereUniqueWithoutTxInput> = z.object({
  where: z.lazy(() => SplitWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SplitUpdateWithoutTxInputSchema),z.lazy(() => SplitUncheckedUpdateWithoutTxInputSchema) ]),
  create: z.union([ z.lazy(() => SplitCreateWithoutTxInputSchema),z.lazy(() => SplitUncheckedCreateWithoutTxInputSchema) ]),
}).strict() as z.ZodType<Prisma.SplitUpsertWithWhereUniqueWithoutTxInput>;

export const SplitUpdateWithWhereUniqueWithoutTxInputSchema: z.ZodType<Prisma.SplitUpdateWithWhereUniqueWithoutTxInput> = z.object({
  where: z.lazy(() => SplitWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SplitUpdateWithoutTxInputSchema),z.lazy(() => SplitUncheckedUpdateWithoutTxInputSchema) ]),
}).strict() as z.ZodType<Prisma.SplitUpdateWithWhereUniqueWithoutTxInput>;

export const SplitUpdateManyWithWhereWithoutTxInputSchema: z.ZodType<Prisma.SplitUpdateManyWithWhereWithoutTxInput> = z.object({
  where: z.lazy(() => SplitScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SplitUpdateManyMutationInputSchema),z.lazy(() => SplitUncheckedUpdateManyWithoutTxInputSchema) ]),
}).strict() as z.ZodType<Prisma.SplitUpdateManyWithWhereWithoutTxInput>;

export const SplitCreateWithoutCatArrayInputSchema: z.ZodType<Prisma.SplitCreateWithoutCatArrayInput> = z.object({
  id: z.string().uuid().optional(),
  tx: z.lazy(() => TxCreateNestedOneWithoutSplitArrayInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutSplitArrayInputSchema)
}).strict() as z.ZodType<Prisma.SplitCreateWithoutCatArrayInput>;

export const SplitUncheckedCreateWithoutCatArrayInputSchema: z.ZodType<Prisma.SplitUncheckedCreateWithoutCatArrayInput> = z.object({
  id: z.string().uuid().optional(),
  txId: z.string(),
  userId: z.string()
}).strict() as z.ZodType<Prisma.SplitUncheckedCreateWithoutCatArrayInput>;

export const SplitCreateOrConnectWithoutCatArrayInputSchema: z.ZodType<Prisma.SplitCreateOrConnectWithoutCatArrayInput> = z.object({
  where: z.lazy(() => SplitWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SplitCreateWithoutCatArrayInputSchema),z.lazy(() => SplitUncheckedCreateWithoutCatArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.SplitCreateOrConnectWithoutCatArrayInput>;

export const SplitUpsertWithoutCatArrayInputSchema: z.ZodType<Prisma.SplitUpsertWithoutCatArrayInput> = z.object({
  update: z.union([ z.lazy(() => SplitUpdateWithoutCatArrayInputSchema),z.lazy(() => SplitUncheckedUpdateWithoutCatArrayInputSchema) ]),
  create: z.union([ z.lazy(() => SplitCreateWithoutCatArrayInputSchema),z.lazy(() => SplitUncheckedCreateWithoutCatArrayInputSchema) ]),
  where: z.lazy(() => SplitWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitUpsertWithoutCatArrayInput>;

export const SplitUpdateToOneWithWhereWithoutCatArrayInputSchema: z.ZodType<Prisma.SplitUpdateToOneWithWhereWithoutCatArrayInput> = z.object({
  where: z.lazy(() => SplitWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => SplitUpdateWithoutCatArrayInputSchema),z.lazy(() => SplitUncheckedUpdateWithoutCatArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.SplitUpdateToOneWithWhereWithoutCatArrayInput>;

export const SplitUpdateWithoutCatArrayInputSchema: z.ZodType<Prisma.SplitUpdateWithoutCatArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tx: z.lazy(() => TxUpdateOneRequiredWithoutSplitArrayNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutSplitArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitUpdateWithoutCatArrayInput>;

export const SplitUncheckedUpdateWithoutCatArrayInputSchema: z.ZodType<Prisma.SplitUncheckedUpdateWithoutCatArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  txId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUncheckedUpdateWithoutCatArrayInput>;

export const TxCreateWithoutSplitArrayInputSchema: z.ZodType<Prisma.TxCreateWithoutSplitArrayInput> = z.object({
  id: z.string().cuid().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutTxArrayInputSchema)
}).strict() as z.ZodType<Prisma.TxCreateWithoutSplitArrayInput>;

export const TxUncheckedCreateWithoutSplitArrayInputSchema: z.ZodType<Prisma.TxUncheckedCreateWithoutSplitArrayInput> = z.object({
  id: z.string().cuid().optional(),
  ownerId: z.string()
}).strict() as z.ZodType<Prisma.TxUncheckedCreateWithoutSplitArrayInput>;

export const TxCreateOrConnectWithoutSplitArrayInputSchema: z.ZodType<Prisma.TxCreateOrConnectWithoutSplitArrayInput> = z.object({
  where: z.lazy(() => TxWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TxCreateWithoutSplitArrayInputSchema),z.lazy(() => TxUncheckedCreateWithoutSplitArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.TxCreateOrConnectWithoutSplitArrayInput>;

export const CatCreateWithoutSplitInputSchema: z.ZodType<Prisma.CatCreateWithoutSplitInput> = z.object({
  id: z.string().uuid().optional(),
  nameArray: z.union([ z.lazy(() => CatCreatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.number()
}).strict() as z.ZodType<Prisma.CatCreateWithoutSplitInput>;

export const CatUncheckedCreateWithoutSplitInputSchema: z.ZodType<Prisma.CatUncheckedCreateWithoutSplitInput> = z.object({
  id: z.string().uuid().optional(),
  nameArray: z.union([ z.lazy(() => CatCreatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.number()
}).strict() as z.ZodType<Prisma.CatUncheckedCreateWithoutSplitInput>;

export const CatCreateOrConnectWithoutSplitInputSchema: z.ZodType<Prisma.CatCreateOrConnectWithoutSplitInput> = z.object({
  where: z.lazy(() => CatWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CatCreateWithoutSplitInputSchema),z.lazy(() => CatUncheckedCreateWithoutSplitInputSchema) ]),
}).strict() as z.ZodType<Prisma.CatCreateOrConnectWithoutSplitInput>;

export const CatCreateManySplitInputEnvelopeSchema: z.ZodType<Prisma.CatCreateManySplitInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CatCreateManySplitInputSchema),z.lazy(() => CatCreateManySplitInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict() as z.ZodType<Prisma.CatCreateManySplitInputEnvelope>;

export const UserCreateWithoutSplitArrayInputSchema: z.ZodType<Prisma.UserCreateWithoutSplitArrayInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  ACCESS_TOKEN: z.string().optional().nullable(),
  PUBLIC_TOKEN: z.string().optional().nullable(),
  ITEM_ID: z.string().optional().nullable(),
  TRANSFER_ID: z.string().optional().nullable(),
  PAYMENT_ID: z.string().optional().nullable(),
  txArray: z.lazy(() => TxCreateNestedManyWithoutOwnerInputSchema).optional(),
  myGroup: z.lazy(() => GroupCreateNestedManyWithoutGroupOwnerInputSchema).optional(),
  groupArray: z.lazy(() => GroupCreateNestedManyWithoutUserArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserCreateWithoutSplitArrayInput>;

export const UserUncheckedCreateWithoutSplitArrayInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutSplitArrayInput> = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  ACCESS_TOKEN: z.string().optional().nullable(),
  PUBLIC_TOKEN: z.string().optional().nullable(),
  ITEM_ID: z.string().optional().nullable(),
  TRANSFER_ID: z.string().optional().nullable(),
  PAYMENT_ID: z.string().optional().nullable(),
  txArray: z.lazy(() => TxUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  myGroup: z.lazy(() => GroupUncheckedCreateNestedManyWithoutGroupOwnerInputSchema).optional(),
  groupArray: z.lazy(() => GroupUncheckedCreateNestedManyWithoutUserArrayInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUncheckedCreateWithoutSplitArrayInput>;

export const UserCreateOrConnectWithoutSplitArrayInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutSplitArrayInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutSplitArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutSplitArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserCreateOrConnectWithoutSplitArrayInput>;

export const TxUpsertWithoutSplitArrayInputSchema: z.ZodType<Prisma.TxUpsertWithoutSplitArrayInput> = z.object({
  update: z.union([ z.lazy(() => TxUpdateWithoutSplitArrayInputSchema),z.lazy(() => TxUncheckedUpdateWithoutSplitArrayInputSchema) ]),
  create: z.union([ z.lazy(() => TxCreateWithoutSplitArrayInputSchema),z.lazy(() => TxUncheckedCreateWithoutSplitArrayInputSchema) ]),
  where: z.lazy(() => TxWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxUpsertWithoutSplitArrayInput>;

export const TxUpdateToOneWithWhereWithoutSplitArrayInputSchema: z.ZodType<Prisma.TxUpdateToOneWithWhereWithoutSplitArrayInput> = z.object({
  where: z.lazy(() => TxWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TxUpdateWithoutSplitArrayInputSchema),z.lazy(() => TxUncheckedUpdateWithoutSplitArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.TxUpdateToOneWithWhereWithoutSplitArrayInput>;

export const TxUpdateWithoutSplitArrayInputSchema: z.ZodType<Prisma.TxUpdateWithoutSplitArrayInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutTxArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxUpdateWithoutSplitArrayInput>;

export const TxUncheckedUpdateWithoutSplitArrayInputSchema: z.ZodType<Prisma.TxUncheckedUpdateWithoutSplitArrayInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.TxUncheckedUpdateWithoutSplitArrayInput>;

export const CatUpsertWithWhereUniqueWithoutSplitInputSchema: z.ZodType<Prisma.CatUpsertWithWhereUniqueWithoutSplitInput> = z.object({
  where: z.lazy(() => CatWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CatUpdateWithoutSplitInputSchema),z.lazy(() => CatUncheckedUpdateWithoutSplitInputSchema) ]),
  create: z.union([ z.lazy(() => CatCreateWithoutSplitInputSchema),z.lazy(() => CatUncheckedCreateWithoutSplitInputSchema) ]),
}).strict() as z.ZodType<Prisma.CatUpsertWithWhereUniqueWithoutSplitInput>;

export const CatUpdateWithWhereUniqueWithoutSplitInputSchema: z.ZodType<Prisma.CatUpdateWithWhereUniqueWithoutSplitInput> = z.object({
  where: z.lazy(() => CatWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CatUpdateWithoutSplitInputSchema),z.lazy(() => CatUncheckedUpdateWithoutSplitInputSchema) ]),
}).strict() as z.ZodType<Prisma.CatUpdateWithWhereUniqueWithoutSplitInput>;

export const CatUpdateManyWithWhereWithoutSplitInputSchema: z.ZodType<Prisma.CatUpdateManyWithWhereWithoutSplitInput> = z.object({
  where: z.lazy(() => CatScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CatUpdateManyMutationInputSchema),z.lazy(() => CatUncheckedUpdateManyWithoutSplitInputSchema) ]),
}).strict() as z.ZodType<Prisma.CatUpdateManyWithWhereWithoutSplitInput>;

export const CatScalarWhereInputSchema: z.ZodType<Prisma.CatScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CatScalarWhereInputSchema),z.lazy(() => CatScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CatScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CatScalarWhereInputSchema),z.lazy(() => CatScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  nameArray: z.lazy(() => StringNullableListFilterSchema).optional(),
  amount: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  splitId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict() as z.ZodType<Prisma.CatScalarWhereInput>;

export const UserUpsertWithoutSplitArrayInputSchema: z.ZodType<Prisma.UserUpsertWithoutSplitArrayInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutSplitArrayInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSplitArrayInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutSplitArrayInputSchema),z.lazy(() => UserUncheckedCreateWithoutSplitArrayInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpsertWithoutSplitArrayInput>;

export const UserUpdateToOneWithWhereWithoutSplitArrayInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutSplitArrayInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutSplitArrayInputSchema),z.lazy(() => UserUncheckedUpdateWithoutSplitArrayInputSchema) ]),
}).strict() as z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutSplitArrayInput>;

export const UserUpdateWithoutSplitArrayInputSchema: z.ZodType<Prisma.UserUpdateWithoutSplitArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  txArray: z.lazy(() => TxUpdateManyWithoutOwnerNestedInputSchema).optional(),
  myGroup: z.lazy(() => GroupUpdateManyWithoutGroupOwnerNestedInputSchema).optional(),
  groupArray: z.lazy(() => GroupUpdateManyWithoutUserArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpdateWithoutSplitArrayInput>;

export const UserUncheckedUpdateWithoutSplitArrayInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutSplitArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  txArray: z.lazy(() => TxUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  myGroup: z.lazy(() => GroupUncheckedUpdateManyWithoutGroupOwnerNestedInputSchema).optional(),
  groupArray: z.lazy(() => GroupUncheckedUpdateManyWithoutUserArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUncheckedUpdateWithoutSplitArrayInput>;

export const UserUpdateWithoutGroupArrayInputSchema: z.ZodType<Prisma.UserUpdateWithoutGroupArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  txArray: z.lazy(() => TxUpdateManyWithoutOwnerNestedInputSchema).optional(),
  splitArray: z.lazy(() => SplitUpdateManyWithoutUserNestedInputSchema).optional(),
  myGroup: z.lazy(() => GroupUpdateManyWithoutGroupOwnerNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUpdateWithoutGroupArrayInput>;

export const UserUncheckedUpdateWithoutGroupArrayInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutGroupArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  txArray: z.lazy(() => TxUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  splitArray: z.lazy(() => SplitUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  myGroup: z.lazy(() => GroupUncheckedUpdateManyWithoutGroupOwnerNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.UserUncheckedUpdateWithoutGroupArrayInput>;

export const UserUncheckedUpdateManyWithoutGroupArrayInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutGroupArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ACCESS_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PUBLIC_TOKEN: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ITEM_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  TRANSFER_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  PAYMENT_ID: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict() as z.ZodType<Prisma.UserUncheckedUpdateManyWithoutGroupArrayInput>;

export const TxCreateManyOwnerInputSchema: z.ZodType<Prisma.TxCreateManyOwnerInput> = z.object({
  id: z.string().cuid().optional()
}).strict() as z.ZodType<Prisma.TxCreateManyOwnerInput>;

export const SplitCreateManyUserInputSchema: z.ZodType<Prisma.SplitCreateManyUserInput> = z.object({
  id: z.string().uuid().optional(),
  txId: z.string()
}).strict() as z.ZodType<Prisma.SplitCreateManyUserInput>;

export const GroupCreateManyGroupOwnerInputSchema: z.ZodType<Prisma.GroupCreateManyGroupOwnerInput> = z.object({
  id: z.string().uuid().optional()
}).strict() as z.ZodType<Prisma.GroupCreateManyGroupOwnerInput>;

export const TxUpdateWithoutOwnerInputSchema: z.ZodType<Prisma.TxUpdateWithoutOwnerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  splitArray: z.lazy(() => SplitUpdateManyWithoutTxNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxUpdateWithoutOwnerInput>;

export const TxUncheckedUpdateWithoutOwnerInputSchema: z.ZodType<Prisma.TxUncheckedUpdateWithoutOwnerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  splitArray: z.lazy(() => SplitUncheckedUpdateManyWithoutTxNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.TxUncheckedUpdateWithoutOwnerInput>;

export const TxUncheckedUpdateManyWithoutOwnerInputSchema: z.ZodType<Prisma.TxUncheckedUpdateManyWithoutOwnerInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.TxUncheckedUpdateManyWithoutOwnerInput>;

export const SplitUpdateWithoutUserInputSchema: z.ZodType<Prisma.SplitUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tx: z.lazy(() => TxUpdateOneRequiredWithoutSplitArrayNestedInputSchema).optional(),
  catArray: z.lazy(() => CatUpdateManyWithoutSplitNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitUpdateWithoutUserInput>;

export const SplitUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.SplitUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  txId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  catArray: z.lazy(() => CatUncheckedUpdateManyWithoutSplitNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitUncheckedUpdateWithoutUserInput>;

export const SplitUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.SplitUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  txId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUncheckedUpdateManyWithoutUserInput>;

export const GroupUpdateWithoutGroupOwnerInputSchema: z.ZodType<Prisma.GroupUpdateWithoutGroupOwnerInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userArray: z.lazy(() => UserUpdateManyWithoutGroupArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupUpdateWithoutGroupOwnerInput>;

export const GroupUncheckedUpdateWithoutGroupOwnerInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateWithoutGroupOwnerInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userArray: z.lazy(() => UserUncheckedUpdateManyWithoutGroupArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupUncheckedUpdateWithoutGroupOwnerInput>;

export const GroupUncheckedUpdateManyWithoutGroupOwnerInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateManyWithoutGroupOwnerInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.GroupUncheckedUpdateManyWithoutGroupOwnerInput>;

export const GroupUpdateWithoutUserArrayInputSchema: z.ZodType<Prisma.GroupUpdateWithoutUserArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  groupOwner: z.lazy(() => UserUpdateOneRequiredWithoutMyGroupNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.GroupUpdateWithoutUserArrayInput>;

export const GroupUncheckedUpdateWithoutUserArrayInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateWithoutUserArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.GroupUncheckedUpdateWithoutUserArrayInput>;

export const GroupUncheckedUpdateManyWithoutUserArrayInputSchema: z.ZodType<Prisma.GroupUncheckedUpdateManyWithoutUserArrayInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.GroupUncheckedUpdateManyWithoutUserArrayInput>;

export const SplitCreateManyTxInputSchema: z.ZodType<Prisma.SplitCreateManyTxInput> = z.object({
  id: z.string().uuid().optional(),
  userId: z.string()
}).strict() as z.ZodType<Prisma.SplitCreateManyTxInput>;

export const SplitUpdateWithoutTxInputSchema: z.ZodType<Prisma.SplitUpdateWithoutTxInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  catArray: z.lazy(() => CatUpdateManyWithoutSplitNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutSplitArrayNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitUpdateWithoutTxInput>;

export const SplitUncheckedUpdateWithoutTxInputSchema: z.ZodType<Prisma.SplitUncheckedUpdateWithoutTxInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  catArray: z.lazy(() => CatUncheckedUpdateManyWithoutSplitNestedInputSchema).optional()
}).strict() as z.ZodType<Prisma.SplitUncheckedUpdateWithoutTxInput>;

export const SplitUncheckedUpdateManyWithoutTxInputSchema: z.ZodType<Prisma.SplitUncheckedUpdateManyWithoutTxInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.SplitUncheckedUpdateManyWithoutTxInput>;

export const CatCreateManySplitInputSchema: z.ZodType<Prisma.CatCreateManySplitInput> = z.object({
  id: z.string().uuid().optional(),
  nameArray: z.union([ z.lazy(() => CatCreatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.number()
}).strict() as z.ZodType<Prisma.CatCreateManySplitInput>;

export const CatUpdateWithoutSplitInputSchema: z.ZodType<Prisma.CatUpdateWithoutSplitInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  nameArray: z.union([ z.lazy(() => CatUpdatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.CatUpdateWithoutSplitInput>;

export const CatUncheckedUpdateWithoutSplitInputSchema: z.ZodType<Prisma.CatUncheckedUpdateWithoutSplitInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  nameArray: z.union([ z.lazy(() => CatUpdatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.CatUncheckedUpdateWithoutSplitInput>;

export const CatUncheckedUpdateManyWithoutSplitInputSchema: z.ZodType<Prisma.CatUncheckedUpdateManyWithoutSplitInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  nameArray: z.union([ z.lazy(() => CatUpdatenameArrayInputSchema),z.string().array() ]).optional(),
  amount: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
}).strict() as z.ZodType<Prisma.CatUncheckedUpdateManyWithoutSplitInput>;

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const GroupFindFirstArgsSchema: z.ZodType<Prisma.GroupFindFirstArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereInputSchema.optional(),
  orderBy: z.union([ GroupOrderByWithRelationInputSchema.array(),GroupOrderByWithRelationInputSchema ]).optional(),
  cursor: GroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ GroupScalarFieldEnumSchema,GroupScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupFindFirstArgs>;

export const GroupFindFirstOrThrowArgsSchema: z.ZodType<Prisma.GroupFindFirstOrThrowArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereInputSchema.optional(),
  orderBy: z.union([ GroupOrderByWithRelationInputSchema.array(),GroupOrderByWithRelationInputSchema ]).optional(),
  cursor: GroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ GroupScalarFieldEnumSchema,GroupScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupFindFirstOrThrowArgs>;

export const GroupFindManyArgsSchema: z.ZodType<Prisma.GroupFindManyArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereInputSchema.optional(),
  orderBy: z.union([ GroupOrderByWithRelationInputSchema.array(),GroupOrderByWithRelationInputSchema ]).optional(),
  cursor: GroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ GroupScalarFieldEnumSchema,GroupScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.GroupFindManyArgs>;

export const GroupAggregateArgsSchema: z.ZodType<Prisma.GroupAggregateArgs> = z.object({
  where: GroupWhereInputSchema.optional(),
  orderBy: z.union([ GroupOrderByWithRelationInputSchema.array(),GroupOrderByWithRelationInputSchema ]).optional(),
  cursor: GroupWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.GroupAggregateArgs>;

export const GroupGroupByArgsSchema: z.ZodType<Prisma.GroupGroupByArgs> = z.object({
  where: GroupWhereInputSchema.optional(),
  orderBy: z.union([ GroupOrderByWithAggregationInputSchema.array(),GroupOrderByWithAggregationInputSchema ]).optional(),
  by: GroupScalarFieldEnumSchema.array(),
  having: GroupScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.GroupGroupByArgs>;

export const GroupFindUniqueArgsSchema: z.ZodType<Prisma.GroupFindUniqueArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.GroupFindUniqueArgs>;

export const GroupFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.GroupFindUniqueOrThrowArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.GroupFindUniqueOrThrowArgs>;

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserFindFirstArgs>;

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserFindFirstOrThrowArgs>;

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.UserFindManyArgs>;

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserAggregateArgs>;

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.UserGroupByArgs>;

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserFindUniqueArgs>;

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserFindUniqueOrThrowArgs>;

export const TxFindFirstArgsSchema: z.ZodType<Prisma.TxFindFirstArgs> = z.object({
  select: TxSelectSchema.optional(),
  include: TxIncludeSchema.optional(),
  where: TxWhereInputSchema.optional(),
  orderBy: z.union([ TxOrderByWithRelationInputSchema.array(),TxOrderByWithRelationInputSchema ]).optional(),
  cursor: TxWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TxScalarFieldEnumSchema,TxScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.TxFindFirstArgs>;

export const TxFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TxFindFirstOrThrowArgs> = z.object({
  select: TxSelectSchema.optional(),
  include: TxIncludeSchema.optional(),
  where: TxWhereInputSchema.optional(),
  orderBy: z.union([ TxOrderByWithRelationInputSchema.array(),TxOrderByWithRelationInputSchema ]).optional(),
  cursor: TxWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TxScalarFieldEnumSchema,TxScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.TxFindFirstOrThrowArgs>;

export const TxFindManyArgsSchema: z.ZodType<Prisma.TxFindManyArgs> = z.object({
  select: TxSelectSchema.optional(),
  include: TxIncludeSchema.optional(),
  where: TxWhereInputSchema.optional(),
  orderBy: z.union([ TxOrderByWithRelationInputSchema.array(),TxOrderByWithRelationInputSchema ]).optional(),
  cursor: TxWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TxScalarFieldEnumSchema,TxScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.TxFindManyArgs>;

export const TxAggregateArgsSchema: z.ZodType<Prisma.TxAggregateArgs> = z.object({
  where: TxWhereInputSchema.optional(),
  orderBy: z.union([ TxOrderByWithRelationInputSchema.array(),TxOrderByWithRelationInputSchema ]).optional(),
  cursor: TxWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.TxAggregateArgs>;

export const TxGroupByArgsSchema: z.ZodType<Prisma.TxGroupByArgs> = z.object({
  where: TxWhereInputSchema.optional(),
  orderBy: z.union([ TxOrderByWithAggregationInputSchema.array(),TxOrderByWithAggregationInputSchema ]).optional(),
  by: TxScalarFieldEnumSchema.array(),
  having: TxScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.TxGroupByArgs>;

export const TxFindUniqueArgsSchema: z.ZodType<Prisma.TxFindUniqueArgs> = z.object({
  select: TxSelectSchema.optional(),
  include: TxIncludeSchema.optional(),
  where: TxWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.TxFindUniqueArgs>;

export const TxFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TxFindUniqueOrThrowArgs> = z.object({
  select: TxSelectSchema.optional(),
  include: TxIncludeSchema.optional(),
  where: TxWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.TxFindUniqueOrThrowArgs>;

export const CatFindFirstArgsSchema: z.ZodType<Prisma.CatFindFirstArgs> = z.object({
  select: CatSelectSchema.optional(),
  include: CatIncludeSchema.optional(),
  where: CatWhereInputSchema.optional(),
  orderBy: z.union([ CatOrderByWithRelationInputSchema.array(),CatOrderByWithRelationInputSchema ]).optional(),
  cursor: CatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CatScalarFieldEnumSchema,CatScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.CatFindFirstArgs>;

export const CatFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CatFindFirstOrThrowArgs> = z.object({
  select: CatSelectSchema.optional(),
  include: CatIncludeSchema.optional(),
  where: CatWhereInputSchema.optional(),
  orderBy: z.union([ CatOrderByWithRelationInputSchema.array(),CatOrderByWithRelationInputSchema ]).optional(),
  cursor: CatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CatScalarFieldEnumSchema,CatScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.CatFindFirstOrThrowArgs>;

export const CatFindManyArgsSchema: z.ZodType<Prisma.CatFindManyArgs> = z.object({
  select: CatSelectSchema.optional(),
  include: CatIncludeSchema.optional(),
  where: CatWhereInputSchema.optional(),
  orderBy: z.union([ CatOrderByWithRelationInputSchema.array(),CatOrderByWithRelationInputSchema ]).optional(),
  cursor: CatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CatScalarFieldEnumSchema,CatScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.CatFindManyArgs>;

export const CatAggregateArgsSchema: z.ZodType<Prisma.CatAggregateArgs> = z.object({
  where: CatWhereInputSchema.optional(),
  orderBy: z.union([ CatOrderByWithRelationInputSchema.array(),CatOrderByWithRelationInputSchema ]).optional(),
  cursor: CatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.CatAggregateArgs>;

export const CatGroupByArgsSchema: z.ZodType<Prisma.CatGroupByArgs> = z.object({
  where: CatWhereInputSchema.optional(),
  orderBy: z.union([ CatOrderByWithAggregationInputSchema.array(),CatOrderByWithAggregationInputSchema ]).optional(),
  by: CatScalarFieldEnumSchema.array(),
  having: CatScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.CatGroupByArgs>;

export const CatFindUniqueArgsSchema: z.ZodType<Prisma.CatFindUniqueArgs> = z.object({
  select: CatSelectSchema.optional(),
  include: CatIncludeSchema.optional(),
  where: CatWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.CatFindUniqueArgs>;

export const CatFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CatFindUniqueOrThrowArgs> = z.object({
  select: CatSelectSchema.optional(),
  include: CatIncludeSchema.optional(),
  where: CatWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.CatFindUniqueOrThrowArgs>;

export const SplitFindFirstArgsSchema: z.ZodType<Prisma.SplitFindFirstArgs> = z.object({
  select: SplitSelectSchema.optional(),
  include: SplitIncludeSchema.optional(),
  where: SplitWhereInputSchema.optional(),
  orderBy: z.union([ SplitOrderByWithRelationInputSchema.array(),SplitOrderByWithRelationInputSchema ]).optional(),
  cursor: SplitWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SplitScalarFieldEnumSchema,SplitScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitFindFirstArgs>;

export const SplitFindFirstOrThrowArgsSchema: z.ZodType<Prisma.SplitFindFirstOrThrowArgs> = z.object({
  select: SplitSelectSchema.optional(),
  include: SplitIncludeSchema.optional(),
  where: SplitWhereInputSchema.optional(),
  orderBy: z.union([ SplitOrderByWithRelationInputSchema.array(),SplitOrderByWithRelationInputSchema ]).optional(),
  cursor: SplitWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SplitScalarFieldEnumSchema,SplitScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitFindFirstOrThrowArgs>;

export const SplitFindManyArgsSchema: z.ZodType<Prisma.SplitFindManyArgs> = z.object({
  select: SplitSelectSchema.optional(),
  include: SplitIncludeSchema.optional(),
  where: SplitWhereInputSchema.optional(),
  orderBy: z.union([ SplitOrderByWithRelationInputSchema.array(),SplitOrderByWithRelationInputSchema ]).optional(),
  cursor: SplitWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SplitScalarFieldEnumSchema,SplitScalarFieldEnumSchema.array() ]).optional(),
}).strict() as z.ZodType<Prisma.SplitFindManyArgs>;

export const SplitAggregateArgsSchema: z.ZodType<Prisma.SplitAggregateArgs> = z.object({
  where: SplitWhereInputSchema.optional(),
  orderBy: z.union([ SplitOrderByWithRelationInputSchema.array(),SplitOrderByWithRelationInputSchema ]).optional(),
  cursor: SplitWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.SplitAggregateArgs>;

export const SplitGroupByArgsSchema: z.ZodType<Prisma.SplitGroupByArgs> = z.object({
  where: SplitWhereInputSchema.optional(),
  orderBy: z.union([ SplitOrderByWithAggregationInputSchema.array(),SplitOrderByWithAggregationInputSchema ]).optional(),
  by: SplitScalarFieldEnumSchema.array(),
  having: SplitScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() as z.ZodType<Prisma.SplitGroupByArgs>;

export const SplitFindUniqueArgsSchema: z.ZodType<Prisma.SplitFindUniqueArgs> = z.object({
  select: SplitSelectSchema.optional(),
  include: SplitIncludeSchema.optional(),
  where: SplitWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.SplitFindUniqueArgs>;

export const SplitFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.SplitFindUniqueOrThrowArgs> = z.object({
  select: SplitSelectSchema.optional(),
  include: SplitIncludeSchema.optional(),
  where: SplitWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.SplitFindUniqueOrThrowArgs>;

export const GroupCreateArgsSchema: z.ZodType<Prisma.GroupCreateArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  data: z.union([ GroupCreateInputSchema,GroupUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Prisma.GroupCreateArgs>;

export const GroupUpsertArgsSchema: z.ZodType<Prisma.GroupUpsertArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereUniqueInputSchema,
  create: z.union([ GroupCreateInputSchema,GroupUncheckedCreateInputSchema ]),
  update: z.union([ GroupUpdateInputSchema,GroupUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Prisma.GroupUpsertArgs>;

export const GroupCreateManyArgsSchema: z.ZodType<Prisma.GroupCreateManyArgs> = z.object({
  data: z.union([ GroupCreateManyInputSchema,GroupCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Prisma.GroupCreateManyArgs>;

export const GroupDeleteArgsSchema: z.ZodType<Prisma.GroupDeleteArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  where: GroupWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.GroupDeleteArgs>;

export const GroupUpdateArgsSchema: z.ZodType<Prisma.GroupUpdateArgs> = z.object({
  select: GroupSelectSchema.optional(),
  include: GroupIncludeSchema.optional(),
  data: z.union([ GroupUpdateInputSchema,GroupUncheckedUpdateInputSchema ]),
  where: GroupWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.GroupUpdateArgs>;

export const GroupUpdateManyArgsSchema: z.ZodType<Prisma.GroupUpdateManyArgs> = z.object({
  data: z.union([ GroupUpdateManyMutationInputSchema,GroupUncheckedUpdateManyInputSchema ]),
  where: GroupWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.GroupUpdateManyArgs>;

export const GroupDeleteManyArgsSchema: z.ZodType<Prisma.GroupDeleteManyArgs> = z.object({
  where: GroupWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.GroupDeleteManyArgs>;

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]).optional(),
}).strict() as z.ZodType<Prisma.UserCreateArgs>;

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Prisma.UserUpsertArgs>;

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Prisma.UserCreateManyArgs>;

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserDeleteArgs>;

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.UserUpdateArgs>;

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserUpdateManyArgs>;

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.UserDeleteManyArgs>;

export const TxCreateArgsSchema: z.ZodType<Prisma.TxCreateArgs> = z.object({
  select: TxSelectSchema.optional(),
  include: TxIncludeSchema.optional(),
  data: z.union([ TxCreateInputSchema,TxUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Prisma.TxCreateArgs>;

export const TxUpsertArgsSchema: z.ZodType<Prisma.TxUpsertArgs> = z.object({
  select: TxSelectSchema.optional(),
  include: TxIncludeSchema.optional(),
  where: TxWhereUniqueInputSchema,
  create: z.union([ TxCreateInputSchema,TxUncheckedCreateInputSchema ]),
  update: z.union([ TxUpdateInputSchema,TxUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Prisma.TxUpsertArgs>;

export const TxCreateManyArgsSchema: z.ZodType<Prisma.TxCreateManyArgs> = z.object({
  data: z.union([ TxCreateManyInputSchema,TxCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Prisma.TxCreateManyArgs>;

export const TxDeleteArgsSchema: z.ZodType<Prisma.TxDeleteArgs> = z.object({
  select: TxSelectSchema.optional(),
  include: TxIncludeSchema.optional(),
  where: TxWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.TxDeleteArgs>;

export const TxUpdateArgsSchema: z.ZodType<Prisma.TxUpdateArgs> = z.object({
  select: TxSelectSchema.optional(),
  include: TxIncludeSchema.optional(),
  data: z.union([ TxUpdateInputSchema,TxUncheckedUpdateInputSchema ]),
  where: TxWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.TxUpdateArgs>;

export const TxUpdateManyArgsSchema: z.ZodType<Prisma.TxUpdateManyArgs> = z.object({
  data: z.union([ TxUpdateManyMutationInputSchema,TxUncheckedUpdateManyInputSchema ]),
  where: TxWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.TxUpdateManyArgs>;

export const TxDeleteManyArgsSchema: z.ZodType<Prisma.TxDeleteManyArgs> = z.object({
  where: TxWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.TxDeleteManyArgs>;

export const CatCreateArgsSchema: z.ZodType<Prisma.CatCreateArgs> = z.object({
  select: CatSelectSchema.optional(),
  include: CatIncludeSchema.optional(),
  data: z.union([ CatCreateInputSchema,CatUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Prisma.CatCreateArgs>;

export const CatUpsertArgsSchema: z.ZodType<Prisma.CatUpsertArgs> = z.object({
  select: CatSelectSchema.optional(),
  include: CatIncludeSchema.optional(),
  where: CatWhereUniqueInputSchema,
  create: z.union([ CatCreateInputSchema,CatUncheckedCreateInputSchema ]),
  update: z.union([ CatUpdateInputSchema,CatUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Prisma.CatUpsertArgs>;

export const CatCreateManyArgsSchema: z.ZodType<Prisma.CatCreateManyArgs> = z.object({
  data: z.union([ CatCreateManyInputSchema,CatCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Prisma.CatCreateManyArgs>;

export const CatDeleteArgsSchema: z.ZodType<Prisma.CatDeleteArgs> = z.object({
  select: CatSelectSchema.optional(),
  include: CatIncludeSchema.optional(),
  where: CatWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.CatDeleteArgs>;

export const CatUpdateArgsSchema: z.ZodType<Prisma.CatUpdateArgs> = z.object({
  select: CatSelectSchema.optional(),
  include: CatIncludeSchema.optional(),
  data: z.union([ CatUpdateInputSchema,CatUncheckedUpdateInputSchema ]),
  where: CatWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.CatUpdateArgs>;

export const CatUpdateManyArgsSchema: z.ZodType<Prisma.CatUpdateManyArgs> = z.object({
  data: z.union([ CatUpdateManyMutationInputSchema,CatUncheckedUpdateManyInputSchema ]),
  where: CatWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.CatUpdateManyArgs>;

export const CatDeleteManyArgsSchema: z.ZodType<Prisma.CatDeleteManyArgs> = z.object({
  where: CatWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.CatDeleteManyArgs>;

export const SplitCreateArgsSchema: z.ZodType<Prisma.SplitCreateArgs> = z.object({
  select: SplitSelectSchema.optional(),
  include: SplitIncludeSchema.optional(),
  data: z.union([ SplitCreateInputSchema,SplitUncheckedCreateInputSchema ]),
}).strict() as z.ZodType<Prisma.SplitCreateArgs>;

export const SplitUpsertArgsSchema: z.ZodType<Prisma.SplitUpsertArgs> = z.object({
  select: SplitSelectSchema.optional(),
  include: SplitIncludeSchema.optional(),
  where: SplitWhereUniqueInputSchema,
  create: z.union([ SplitCreateInputSchema,SplitUncheckedCreateInputSchema ]),
  update: z.union([ SplitUpdateInputSchema,SplitUncheckedUpdateInputSchema ]),
}).strict() as z.ZodType<Prisma.SplitUpsertArgs>;

export const SplitCreateManyArgsSchema: z.ZodType<Prisma.SplitCreateManyArgs> = z.object({
  data: z.union([ SplitCreateManyInputSchema,SplitCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() as z.ZodType<Prisma.SplitCreateManyArgs>;

export const SplitDeleteArgsSchema: z.ZodType<Prisma.SplitDeleteArgs> = z.object({
  select: SplitSelectSchema.optional(),
  include: SplitIncludeSchema.optional(),
  where: SplitWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.SplitDeleteArgs>;

export const SplitUpdateArgsSchema: z.ZodType<Prisma.SplitUpdateArgs> = z.object({
  select: SplitSelectSchema.optional(),
  include: SplitIncludeSchema.optional(),
  data: z.union([ SplitUpdateInputSchema,SplitUncheckedUpdateInputSchema ]),
  where: SplitWhereUniqueInputSchema,
}).strict() as z.ZodType<Prisma.SplitUpdateArgs>;

export const SplitUpdateManyArgsSchema: z.ZodType<Prisma.SplitUpdateManyArgs> = z.object({
  data: z.union([ SplitUpdateManyMutationInputSchema,SplitUncheckedUpdateManyInputSchema ]),
  where: SplitWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.SplitUpdateManyArgs>;

export const SplitDeleteManyArgsSchema: z.ZodType<Prisma.SplitDeleteManyArgs> = z.object({
  where: SplitWhereInputSchema.optional(),
}).strict() as z.ZodType<Prisma.SplitDeleteManyArgs>;