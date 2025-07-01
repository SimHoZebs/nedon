# Nedon API Documentation

## Overview

Nedon's API is built using tRPC (TypeScript RPC) and provides a complete backend for the finance tracking application. The API is organized into focused routers that handle specific domains: transactions, users, categories, splits, receipts, and general application functionality including Plaid banking integration.

## API Architecture

### Technology Stack
- **tRPC**: Type-safe API with end-to-end TypeScript
- **Prisma ORM**: Database access and query building
- **Zod**: Runtime schema validation
- **Plaid API**: Banking and financial data integration
- **Google Cloud Vision**: Receipt text extraction
- **OpenAI**: AI-powered receipt processing
- **Supabase**: Database hosting and additional services

### Database Models

The API works with the following core models (from Prisma schema):

```typescript
// Core Models
model User {
  id: string
  name: string
  ACCESS_TOKEN: string?
  PUBLIC_TOKEN: string?
  ITEM_ID: string?
  cursor: string? // Transaction sync tracking
  // Relationships: transactions, splits, groups, connections
}

model Tx {
  id: string
  userId: string
  name: string
  amount: Float
  datetime: DateTime?
  authorizedDatetime: DateTime
  plaidId: string? // Plaid transaction ID
  recurring: Boolean
  MDS: Int // -1=undetermined, 0=Mandatory, 1=Discretionary, 2=Saving
  // Relationships: categories, splits, receipts, user
}

model Cat {
  id: string
  name: string
  amount: Float
  nameArray: CatName[] // Hierarchical category path
  txId: string
}

model Split {
  id: string
  userId: string
  amount: Float
  txId: string? // Associated transaction
  originTxId: string // Source transaction for split
}

model Receipt {
  id: string
  is_receipt: Boolean
  transaction_id: string
  merchant: string
  items: ReceiptItem[]
  subtotal: Float
  tax: Float
  tip: Float
  grand_total: Float
  // Full receipt processing data
}

model Group {
  id: string
  ownerId: string
  userArray: User[] // Group members
}
```

## API Routers

### 1. Main App Router (`server/routers/_app.ts`)

The main router aggregates all sub-routers and provides core Plaid integration functionality.

#### **Combined Routers**
```typescript
export const appRouter = router({
  user: userRouter,
  tx: txRouter,
  cat: catRouter,
  split: splitRouter,
  receipt: receiptRouter,
  // Direct endpoints below
});
```

#### **`sandBoxAccess`**
- **Type**: Query
- **Input**: `{ instituteID?: string }`
- **Output**: `string` (Plaid sandbox public token)
- **Purpose**: Creates sandbox public token for testing Plaid integration
- **Implementation**: Uses Plaid's sandbox environment with predefined institution

```typescript
// Usage Example
const publicToken = await trpc.sandBoxAccess.useQuery({ 
  instituteID: "ins_1" // Default test institution
});
```

#### **`createLinkToken`**
- **Type**: Query
- **Input**: `void`
- **Output**: `string` (Plaid Link token)
- **Purpose**: Creates Link token for Plaid Link initialization
- **Configuration**: Supports transactions, auth, identity products

```typescript
// Usage Example
const linkToken = await trpc.createLinkToken.useQuery();
// Use with Plaid Link component for bank account connection
```

#### **`setAccessToken`**
- **Type**: Mutation
- **Input**: `{ publicToken: string, id: string }`
- **Output**: `UserClientSide` (user without sensitive data)
- **Purpose**: Exchanges public token for access token and stores in user record
- **Side Effects**: 
  - Updates user with Plaid tokens
  - Creates transfer authorization if Transfer product enabled
  - Invalidates user queries

```typescript
// Usage Example
const user = await trpc.setAccessToken.mutate({
  publicToken: "public-sandbox-abc123",
  id: "user-123"
});
```

#### **`auth`**
- **Type**: Query
- **Input**: `{ id: string }`
- **Output**: `AuthGetResponse | null`
- **Purpose**: Retrieves account authentication data from Plaid
- **Returns**: Account details, balances, routing numbers

```typescript
// Usage Example
const authData = await trpc.auth.useQuery({ id: "user-123" });
// Returns: { accounts: [...], numbers: {...}, item: {...} }
```

#### **`getCatOptionArray`**
- **Type**: Query
- **Input**: `undefined`
- **Output**: `TreedCat[]`
- **Purpose**: Gets hierarchical Plaid category structure for category picker
- **Processing**: Converts flat Plaid categories to tree structure

```typescript
// Usage Example
const categories = await trpc.getCatOptionArray.useQuery();
// Returns hierarchical category tree for UI components
```

### 2. Transaction Router (`server/routers/tx.ts`)

Comprehensive transaction management with Plaid synchronization.

#### **`getAll`**
- **Type**: Query
- **Input**: `{ id: string, date: string }`
- **Output**: `TxInDB[] | null`
- **Purpose**: Retrieves and synchronizes transactions for a user
- **Complex Logic**:
  1. Syncs new/modified/removed transactions from Plaid
  2. Creates new transactions in database
  3. Updates cursor for next sync
  4. Returns transactions for specified month

```typescript
// Usage Example
const transactions = await trpc.tx.getAll.useQuery({
  id: "user-123",
  date: "2024-01-15"
});
// Returns all transactions for January 2024
```

#### **`getWithoutPlaid`**
- **Type**: Query
- **Input**: `{ userId: string, txId: string }`
- **Output**: `TxInDB | null`
- **Purpose**: Gets single transaction without triggering Plaid sync

```typescript
// Usage Example
const transaction = await trpc.tx.getWithoutPlaid.useQuery({
  userId: "user-123",
  txId: "tx-456"
});
```

#### **`getAllAssociated`**
- **Type**: Query
- **Input**: `{ id: string }`
- **Output**: `TxInDB[]`
- **Purpose**: Gets all transactions user owns or is split with

#### **`create`**
- **Type**: Mutation
- **Input**: `UnsavedTx`
- **Output**: `TxInDB`
- **Purpose**: Creates new manual transaction with categories and splits
- **Processing**: Handles nested creation of categories, splits, and receipts

```typescript
// Usage Example
const newTx = await trpc.tx.create.mutate({
  name: "Grocery Store",
  amount: 45.67,
  userId: "user-123",
  authorizedDatetime: new Date(),
  MDS: 0, // Mandatory spending
  recurring: false,
  catArray: [{
    name: "Groceries",
    nameArray: ["Food and Drink", "Groceries"],
    amount: 45.67
  }],
  splitArray: [{
    userId: "user-123",
    amount: 45.67
  }]
});
```

#### **`createMany`**
- **Type**: Mutation
- **Input**: `UnsavedTx[]`
- **Output**: `TxInDB[]`
- **Purpose**: Bulk creates transactions (e.g., CSV import)
- **Atomicity**: Uses database transaction for all-or-nothing creation

#### **`update`**
- **Type**: Mutation
- **Input**: `UnsavedTxInDB`
- **Output**: `TxInDB`
- **Purpose**: Updates transaction with new categories and splits
- **Complex Logic**:
  - Separates categories/splits into create vs update operations
  - Handles partial updates of nested data
  - Maintains referential integrity

```typescript
// Usage Example
const updatedTx = await trpc.tx.update.mutate({
  id: "tx-123",
  name: "Updated Grocery Store",
  amount: 50.00,
  catArray: [
    { id: "cat-1", name: "Groceries", amount: 30.00 }, // Update existing
    { name: "Household", amount: 20.00 } // Create new
  ]
});
```

#### **`reset`**
- **Type**: Mutation
- **Input**: `TxInDB`
- **Output**: `TxInDB`
- **Purpose**: Resets transaction to original Plaid data
- **Processing**:
  - Deletes all custom categories and splits
  - Creates default category from Plaid data
  - Preserves original transaction details

#### **`delete`**
- **Type**: Mutation
- **Input**: `{ id: string }`
- **Output**: `void`
- **Purpose**: Deletes transaction and all related data

#### **`deleteAll`**
- **Type**: Mutation
- **Input**: `{ id: string }`
- **Output**: `void`
- **Purpose**: Deletes all transactions for a user

### 3. User Router (`server/routers/user.ts`)

User management and social connections.

#### **`get`**
- **Type**: Query
- **Input**: `string` (user ID)
- **Output**: `UserClientSide | null`
- **Purpose**: Retrieves user with connections and products info
- **Security**: Strips sensitive fields (ACCESS_TOKEN)

```typescript
// Usage Example
const user = await trpc.user.get.useQuery("user-123");
// Returns: { id, name, hasAccessToken, myConnectionArray, ... }
```

#### **`getAll`**
- **Type**: Query
- **Input**: `undefined`
- **Output**: `UserClientSide[]`
- **Purpose**: Gets all users (for development/admin)
- **Security**: Removes access tokens from all users

#### **`create`**
- **Type**: Mutation
- **Input**: `Partial<User>?` (optional user data)
- **Output**: `UserClientSide`
- **Purpose**: Creates new user with default empty values

```typescript
// Usage Example
const newUser = await trpc.user.create.mutate();
// Creates user with generated ID and default values
```

#### **`update`**
- **Type**: Mutation
- **Input**: `UserClientSide`
- **Output**: `UserClientSide`
- **Purpose**: Updates user profile information

```typescript
// Usage Example
const updatedUser = await trpc.user.update.mutate({
  id: "user-123",
  name: "John Doe"
});
```

#### **`delete`**
- **Type**: Mutation
- **Input**: `string` (user ID)
- **Output**: `User`
- **Purpose**: Deletes user and all associated data

#### **`deleteAll`**
- **Type**: Mutation
- **Input**: `undefined`
- **Output**: `number` (count deleted)
- **Purpose**: Deletes all users (development only)

#### **`addConnection`**
- **Type**: Mutation
- **Input**: `{ userId: string, connectionId: string }`
- **Output**: `User`
- **Purpose**: Creates bidirectional user connection for expense splitting
- **Logic**: Updates both users' connection arrays

```typescript
// Usage Example
await trpc.user.addConnection.mutate({
  userId: "user-123",
  connectionId: "user-456"
});
// Both users can now split expenses with each other
```

#### **`removeConnection`**
- **Type**: Mutation
- **Input**: `{ userId: string, connectionId: string }`
- **Output**: `User`
- **Purpose**: Removes bidirectional user connection

### 4. Category Router (`server/routers/cat.ts`)

Category and budget management.

#### **`create`**
- **Type**: Mutation
- **Input**: `CatOptionalDefaults`
- **Output**: `Cat`
- **Purpose**: Creates new category for transaction

#### **`upsertMany`**
- **Type**: Mutation
- **Input**: `{ txId: string, catArray: CatClientSide[] }`
- **Output**: `Cat[]`
- **Purpose**: Creates and updates multiple categories for transaction
- **Logic**:
  - Separates categories by existence of ID
  - Updates existing categories
  - Creates new categories
  - Returns all transaction categories

```typescript
// Usage Example
const categories = await trpc.cat.upsertMany.mutate({
  txId: "tx-123",
  catArray: [
    { id: "cat-1", name: "Groceries", amount: 30 }, // Update
    { name: "Household", amount: 20 } // Create
  ]
});
```

#### **`delete`**
- **Type**: Mutation
- **Input**: `{ id: string }`
- **Output**: `Cat`
- **Purpose**: Deletes single category

#### **`deleteMany`**
- **Type**: Mutation
- **Input**: `{ catArray: Cat[] }`
- **Output**: `BatchPayload`
- **Purpose**: Bulk deletes categories

#### **`getAllSettings`**
- **Type**: Query
- **Input**: `string` (user ID)
- **Output**: `CatSettings[]`
- **Purpose**: Gets user's category budget settings

```typescript
// Usage Example
const budgets = await trpc.cat.getAllSettings.useQuery("user-123");
// Returns budget configurations for user's categories
```

#### **`upsertSettings`**
- **Type**: Mutation
- **Input**: `CatSettingsOptionalDefaults`
- **Output**: `CatSettings`
- **Purpose**: Creates or updates category budget settings

```typescript
// Usage Example
const budgetSettings = await trpc.cat.upsertSettings.mutate({
  name: "Groceries",
  budget: 500.00,
  userId: "user-123"
});
```

### 5. Split Router (`server/routers/split.ts`)

Expense splitting functionality.

#### **`create`**
- **Type**: Mutation
- **Input**: `{ txId: string, split: SplitOptionalDefaults }`
- **Output**: `Split`
- **Purpose**: Creates new split for transaction

```typescript
// Usage Example
const split = await trpc.split.create.mutate({
  txId: "tx-123",
  split: {
    userId: "user-456",
    amount: 22.50
  }
});
```

#### **`update`**
- **Type**: Mutation
- **Input**: `{ txId: string, split: SplitOptionalDefaults }`
- **Output**: `Split`
- **Purpose**: Updates existing split or creates if no ID provided

#### **`upsertMany`**
- **Type**: Mutation
- **Input**: `SplitOptionalDefaults[]`
- **Output**: `TxWithSplits`
- **Purpose**: Bulk upsert splits for transaction
- **Logic**: Separates by ID existence for update vs create operations

#### **`delete`**
- **Type**: Mutation
- **Input**: `{ splitId: string }`
- **Output**: `void`
- **Purpose**: Deletes individual split

#### **`deleteMany`**
- **Type**: Mutation
- **Input**: `string[] | Split[]`
- **Output**: `void`
- **Purpose**: Bulk deletes splits by IDs or split objects

### 6. Receipt Router (`server/routers/receipt.ts`)

AI-powered receipt processing.

#### **`create`**
- **Type**: Mutation
- **Input**: `{ id: string, receipt: ReceiptOptionalDefaultsWithChildren }`
- **Output**: `Receipt`
- **Purpose**: Creates receipt with items for transaction
- **Nested Creation**: Handles receipt items creation

```typescript
// Usage Example
const receipt = await trpc.receipt.create.mutate({
  id: "tx-123",
  receipt: {
    merchant: "Walmart",
    subtotal: 45.67,
    tax: 3.65,
    grand_total: 49.32,
    items: [
      { name: "Milk", quantity: 1, unit_price: 3.99, MDS: 0 },
      { name: "Bread", quantity: 2, unit_price: 2.50, MDS: 0 }
    ]
  }
});
```

#### **`process`**
- **Type**: Mutation
- **Input**: `{ signedUrl: string }`
- **Output**: `StructuredResponse<PureReceiptWithChildren>`
- **Purpose**: Processes receipt image using Google Cloud Vision + OpenAI
- **Complex Workflow**:
  1. Extracts text using Google Cloud Vision
  2. Sends text to OpenAI Assistant for structured parsing
  3. Validates parsed JSON against schema
  4. Returns structured receipt data or error details

```typescript
// Usage Example
const result = await trpc.receipt.process.mutate({
  signedUrl: "https://storage.googleapis.com/bucket/receipt.jpg"
});

if (result.success) {
  // Use result.data as PureReceiptWithChildren
  console.log("Merchant:", result.data.merchant);
  console.log("Items:", result.data.items);
} else {
  console.error("Processing failed:", result.clientMsg);
}
```

**Error Handling**: Returns structured responses with user-friendly messages and detailed dev information.

### 7. Group Router (`server/routers/group.ts`)

Group/family management for shared expense tracking.

*Note: Based on schema analysis, this router exists but implementation details were not fully explored in the provided code analysis.*

### 8. Supabase Router (`server/routers/supabase.ts`)

Integration with Supabase services.

*Note: This is a minimal router likely for Supabase-specific operations.*

## Data Types and Schemas

### Core Type Definitions

```typescript
// User Types
interface UserClientSide {
  id: string;
  name: string;
  hasAccessToken: boolean; // Derived from ACCESS_TOKEN existence
  PUBLIC_TOKEN: string | null;
  ITEM_ID: string | null;
  cursor: string | null; // Transaction sync cursor
  TRANSFER_ID: string | null;
  PAYMENT_ID: string | null;
  myConnectionArray?: User[]; // Connected users for splitting
}

// Transaction Types
interface UnsavedTx {
  name: string;
  amount: number;
  userId: string;
  datetime?: Date;
  authorizedDatetime: Date;
  recurring: boolean;
  MDS: number; // Mandatory/Discretionary/Saving classification
  catArray: CatClientSide[];
  splitArray: SplitClientSide[];
  receipt?: ReceiptOptionalDefaultsWithChildren;
  plaidTx?: Transaction; // Plaid transaction data
}

interface TxInDB extends UnsavedTx {
  id: string;
  plaidId?: string;
  accountId?: string;
  originTxId?: string; // Parent transaction if this is a split
  userTotal: number; // User's portion of transaction
}

// Category Types
interface CatClientSide {
  id?: string;
  name: string;
  nameArray: string[]; // Hierarchical path: ["Food and Drink", "Groceries"]
  amount: number;
  txId?: string;
}

interface TreedCatWithTx {
  name: string;
  budget: number;
  spending: number;
  received: number;
  txArray: TxInDB[];
  subCatArray: TreedCatWithTx[];
}

// Split Types
interface SplitClientSide {
  id?: string;
  userId: string;
  amount: number;
  txId?: string;
  originTxId?: string; // Source transaction
}

// Receipt Types
interface PureReceiptWithChildren {
  is_receipt: boolean;
  transaction_id: string;
  date: string;
  merchant: string;
  subtotal: number;
  currency: string;
  tax: number;
  tip: number;
  grand_total: number;
  payment_method: string;
  online_link: string;
  location: string;
  items: PureReceiptItem[];
}

interface PureReceiptItem {
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  MDS: number; // Spending classification
}

// Utility Types
type StructuredResponse<T> = 
  | { success: true; data: T; clientMsg: string; devMsg: string }
  | { success: false; data: undefined; clientMsg: string; devMsg: string };
```

## Authentication and Security

### User Authentication
- Users are identified by unique string IDs (CUID format)
- Access tokens are stored securely server-side
- Client-side receives `hasAccessToken` boolean instead of actual token
- `stripUserSecrets()` function removes sensitive data before client transmission

### API Security
- tRPC provides automatic request/response validation
- Zod schemas ensure type safety at runtime
- Database queries use Prisma for SQL injection protection
- Plaid integration uses official SDK with proper credentials

### Rate Limiting
- Inherits Plaid's rate limiting for banking operations
- No explicit rate limiting on non-Plaid endpoints
- Recommend implementing rate limiting for production

## Error Handling

### Standard Error Types
```typescript
// tRPC automatically handles these error types:
- BAD_REQUEST: Invalid input parameters
- UNAUTHORIZED: Missing or invalid authentication  
- NOT_FOUND: Resource not found
- INTERNAL_SERVER_ERROR: Server-side errors
- TIMEOUT: Request timeout
```

### Custom Error Patterns
```typescript
// Structured responses for complex operations
const response = createStructuredResponse<ReceiptData>({
  success: false,
  data: undefined,
  clientMsg: "User-friendly error message",
  devMsg: "Technical details for debugging"
});
```

### Database Error Handling
```typescript
// Prisma error handling example from tx router
try {
  await db.$transaction(txCreateQueryArray);
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": // Unique constraint violation
        console.log("Duplicate transaction:", error.message);
        break;
      default:
        console.log("Database error:", error);
        return null;
    }
  }
}
```

## Integration Guidelines

### Client Setup
```typescript
// 1. Install dependencies
npm install @trpc/client @trpc/react-query @trpc/next

// 2. Create tRPC client
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '../server/routers/_app';

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      url: '/api/trpc',
      transformer: superjson, // Handles Date serialization
    };
  },
});

// 3. Wrap app with tRPC provider
export default trpc.withTRPC(MyApp);
```

### Query Usage Patterns
```typescript
// Simple query
const { data, isLoading, error } = trpc.user.get.useQuery("user-123");

// Query with dependencies
const { data: transactions } = trpc.tx.getAll.useQuery(
  { id: userId, date: selectedDate },
  { enabled: !!userId } // Only run when userId exists
);

// Mutation with optimistic updates
const updateTx = trpc.tx.update.useMutation({
  onSuccess: () => {
    queryClient.tx.getAll.invalidate(); // Refresh transaction list
  },
  onError: (error) => {
    console.error("Update failed:", error.message);
  }
});
```

### Best Practices

#### Performance Optimization
```typescript
// 1. Use appropriate staleTime for caching
const { data } = trpc.auth.useQuery(
  { id: userId },
  { staleTime: 3600000 } // 1 hour cache
);

// 2. Batch related queries
const queries = await Promise.all([
  trpc.user.get.fetch("user-123"),
  trpc.tx.getAll.fetch({ id: "user-123", date: today })
]);

// 3. Use pagination for large datasets
const { data, hasNextPage, fetchNextPage } = trpc.tx.getInfinite.useInfiniteQuery({
  limit: 20
});
```

#### Error Handling
```typescript
// Component-level error handling
const TransactionList = () => {
  const { data, error, isLoading } = trpc.tx.getAll.useQuery(queryParams);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data) return <NoDataMessage />;
  
  return <TransactionGrid transactions={data} />;
};

// Global error handling
const MyApp = ({ Component, pageProps }) => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Component {...pageProps} />
        </ErrorBoundary>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
```

## Development and Testing

### Development Environment
```typescript
// Enable debug logging
DEBUG=trpc:* npm run dev

// Use React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Mock endpoints for testing
const mockTrpc = createTRPCMsw(appRouter);
```

### Testing Strategies
```typescript
// Unit test API endpoints
import { createCaller } from '../server/routers/_app';

const caller = createCaller({ 
  prisma: mockPrisma,
  user: mockUser 
});

test('creates transaction', async () => {
  const result = await caller.tx.create({
    name: "Test Transaction",
    amount: 100,
    userId: "test-user"
  });
  
  expect(result.id).toBeDefined();
  expect(result.amount).toBe(100);
});
```

This comprehensive API documentation covers all endpoints, data types, security considerations, and integration patterns for the Nedon finance tracking application. The API provides a complete backend for transaction management, banking integration, receipt processing, expense splitting, and user management.