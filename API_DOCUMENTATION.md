# Nedon API Documentation

## Overview

Nedon is a comprehensive finance tracking application that provides APIs for transaction management, category organization, user management, receipt processing, and expense splitting. The API is built using tRPC (TypeScript RPC) and provides type-safe endpoints.

## Base URL

The API is accessible through the tRPC client at `/api/trpc/[trpc]` endpoint.

## Authentication

Most endpoints require user authentication through the `id` parameter. Users must have valid access tokens for bank account operations.

## API Routers

### 1. Main App Router (`/api/trpc`)

The main router combines all sub-routers and provides core Plaid integration functionality.

#### `sandBoxAccess`
- **Type**: Query
- **Input**: `{ instituteID?: string }`
- **Output**: `string` (public token)
- **Description**: Creates a sandbox public token for testing Plaid integration
- **Example**:
  ```typescript
  const publicToken = await trpc.sandBoxAccess.useQuery({ 
    instituteID: "ins_1" 
  });
  ```

#### `createLinkToken`
- **Type**: Query
- **Input**: `void`
- **Output**: `string` (link token)
- **Description**: Creates a Plaid Link token for account connection
- **Example**:
  ```typescript
  const linkToken = await trpc.createLinkToken.useQuery();
  ```

#### `setAccessToken`
- **Type**: Mutation
- **Input**: `{ publicToken: string, id: string }`
- **Output**: `User` (without secrets)
- **Description**: Exchanges public token for access token and updates user
- **Example**:
  ```typescript
  const user = await trpc.setAccessToken.mutate({
    publicToken: "public-sandbox-xxx",
    id: "user-123"
  });
  ```

#### `auth`
- **Type**: Query
- **Input**: `{ id: string }`
- **Output**: `AuthGetResponse | null`
- **Description**: Retrieves bank account authentication data
- **Example**:
  ```typescript
  const authData = await trpc.auth.useQuery({ id: "user-123" });
  ```

#### `getCatOptionArray`
- **Type**: Query
- **Input**: `undefined`
- **Output**: `HierarchicalCategory[]`
- **Description**: Gets hierarchical array of Plaid categories
- **Example**:
  ```typescript
  const categories = await trpc.getCatOptionArray.useQuery();
  ```

### 2. Transaction Router (`tx`)

Manages all transaction-related operations.

#### `getAll`
- **Type**: Query
- **Input**: `{ id: string, date: string }`
- **Output**: `TxInDB[]`
- **Description**: Retrieves all transactions for a user on a specific date
- **Example**:
  ```typescript
  const transactions = await trpc.tx.getAll.useQuery({
    id: "user-123",
    date: "2024-01-15"
  });
  ```

#### `create`
- **Type**: Mutation
- **Input**: `UnsavedTx`
- **Output**: `TxInDB`
- **Description**: Creates a new transaction
- **Example**:
  ```typescript
  const newTx = await trpc.tx.create.mutate({
    name: "Grocery Store",
    amount: 45.67,
    userId: "user-123",
    catArray: [{ nameArray: ["Food", "Groceries"], amount: 45.67 }],
    splitArray: [{ userId: "user-123", amount: 45.67 }]
  });
  ```

#### `update`
- **Type**: Mutation
- **Input**: `UnsavedTxInDB`
- **Output**: `TxInDB`
- **Description**: Updates an existing transaction
- **Example**:
  ```typescript
  const updatedTx = await trpc.tx.update.mutate({
    id: "tx-123",
    name: "Updated Grocery Store",
    amount: 50.00
  });
  ```

#### `delete`
- **Type**: Mutation
- **Input**: `{ id: string }`
- **Output**: `TxInDB`
- **Description**: Deletes a transaction
- **Example**:
  ```typescript
  const deletedTx = await trpc.tx.delete.mutate({ id: "tx-123" });
  ```

#### `sync`
- **Type**: Mutation
- **Input**: `{ id: string }`
- **Output**: `TxInDB[]`
- **Description**: Syncs transactions from Plaid API
- **Example**:
  ```typescript
  const syncedTxs = await trpc.tx.sync.mutate({ id: "user-123" });
  ```

### 3. User Router (`user`)

Handles user management and profile operations.

#### `get`
- **Type**: Query
- **Input**: `{ id: string }`
- **Output**: `User`
- **Description**: Retrieves user information
- **Example**:
  ```typescript
  const user = await trpc.user.get.useQuery({ id: "user-123" });
  ```

#### `create`
- **Type**: Mutation
- **Input**: `{ email: string, name: string }`
- **Output**: `User`
- **Description**: Creates a new user
- **Example**:
  ```typescript
  const newUser = await trpc.user.create.mutate({
    email: "user@example.com",
    name: "John Doe"
  });
  ```

#### `update`
- **Type**: Mutation
- **Input**: `{ id: string, data: Partial<User> }`
- **Output**: `User`
- **Description**: Updates user information
- **Example**:
  ```typescript
  const updatedUser = await trpc.user.update.mutate({
    id: "user-123",
    data: { name: "Jane Doe" }
  });
  ```

### 4. Category Router (`cat`)

Manages transaction categories and budgeting.

#### `getAll`
- **Type**: Query
- **Input**: `{ userId: string }`
- **Output**: `TreedCatWithTx[]`
- **Description**: Gets all categories with associated transactions
- **Example**:
  ```typescript
  const categories = await trpc.cat.getAll.useQuery({ 
    userId: "user-123" 
  });
  ```

#### `create`
- **Type**: Mutation
- **Input**: `{ nameArray: string[], amount: number }`
- **Output**: `Category`
- **Description**: Creates a new category
- **Example**:
  ```typescript
  const category = await trpc.cat.create.mutate({
    nameArray: ["Transportation", "Gas"],
    amount: 100.00
  });
  ```

### 5. Split Router (`split`)

Handles expense splitting between users.

#### `getByTx`
- **Type**: Query
- **Input**: `{ txId: string }`
- **Output**: `Split[]`
- **Description**: Gets all splits for a transaction
- **Example**:
  ```typescript
  const splits = await trpc.split.getByTx.useQuery({ 
    txId: "tx-123" 
  });
  ```

#### `create`
- **Type**: Mutation
- **Input**: `{ txId: string, userId: string, amount: number }`
- **Output**: `Split`
- **Description**: Creates a new expense split
- **Example**:
  ```typescript
  const split = await trpc.split.create.mutate({
    txId: "tx-123",
    userId: "user-456",
    amount: 22.50
  });
  ```

### 6. Receipt Router (`receipt`)

Manages receipt processing and AI recognition.

#### `upload`
- **Type**: Mutation
- **Input**: `{ image: File, txId: string }`
- **Output**: `Receipt`
- **Description**: Uploads and processes receipt image using AI
- **Example**:
  ```typescript
  const receipt = await trpc.receipt.upload.mutate({
    image: fileInput.files[0],
    txId: "tx-123"
  });
  ```

#### `analyze`
- **Type**: Mutation
- **Input**: `{ receiptId: string }`
- **Output**: `ReceiptAnalysis`
- **Description**: Analyzes receipt content using Google Cloud Vision
- **Example**:
  ```typescript
  const analysis = await trpc.receipt.analyze.mutate({
    receiptId: "receipt-123"
  });
  ```

## Error Handling

All endpoints use tRPC's built-in error handling. Common error types:

- `BAD_REQUEST`: Invalid input parameters
- `UNAUTHORIZED`: Missing or invalid authentication
- `NOT_FOUND`: Resource not found
- `INTERNAL_SERVER_ERROR`: Server-side errors

## Rate Limiting

API calls are subject to Plaid's rate limiting when interacting with bank data. Non-Plaid operations have no specific rate limits.

## Data Types

### Transaction Types
```typescript
interface TxInDB {
  id: string;
  name: string;
  amount: number;
  datetime: Date;
  authorizedDatetime: Date;
  userId: string;
  plaidTx?: Transaction;
  catArray: Category[];
  splitArray: Split[];
  receipt?: Receipt;
}
```

### Category Types
```typescript
interface Category {
  id: string;
  nameArray: string[];
  amount: number;
  txId: string;
}
```

### Split Types
```typescript
interface Split {
  id: string;
  userId: string;
  amount: number;
  txId: string;
}
```

## SDK Usage

### Installation
```bash
npm install @trpc/client @trpc/react-query
```

### Setup
```typescript
import { createTRPCNext } from '@trpc/next';
import { AppRouter } from './server/routers/_app';

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      url: '/api/trpc',
    };
  },
});
```

### Usage in Components
```typescript
import { trpc } from '../utils/trpc';

function TransactionList() {
  const { data: transactions, isLoading } = trpc.tx.getAll.useQuery({
    id: 'user-123',
    date: new Date().toISOString()
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {transactions?.map(tx => (
        <div key={tx.id}>{tx.name}: ${tx.amount}</div>
      ))}
    </div>
  );
}
```