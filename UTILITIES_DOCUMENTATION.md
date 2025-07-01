# Nedon Utilities Documentation

## Overview

Nedon includes a comprehensive set of utility functions for state management, data processing, API integration, and common operations. All utilities are written in TypeScript with proper type safety.

## State Management (`lib/util/store.ts`)

### Global Store (Zustand)

The application uses Zustand for global state management with TypeScript support and Redux DevTools integration.

#### Store Interface
```typescript
interface Store {
  linkToken: string | null;
  appUser?: UserClientSide;
  appGroup?: GroupClientSide;
  screenType: "mobile" | "tablet" | "desktop";
  datetime: string;
  verticalCatPicker: boolean;
  txOragnizedByTimeArray: TxInDB[][][][];
}
```

#### Usage
```typescript
import { useStore } from '@/util/store';

const MyComponent = () => {
  // Reading state
  const appUser = useStore((state) => state.appUser);
  const datetime = useStore((state) => state.datetime);
  
  // Writing state
  const setAppUser = useStore((state) => state.setAppUser);
  const setDatetime = useStore((state) => state.setDatetime);
  
  // Update state
  const handleUserUpdate = (user: UserClientSide) => {
    setAppUser(user);
  };
  
  return (
    <div>
      Current user: {appUser?.name}
      Date: {new Date(datetime).toLocaleDateString()}
    </div>
  );
};
```

#### State Properties

##### `linkToken: string | null`
- **Purpose**: Stores Plaid Link token for bank connections
- **Setters**: `setLinkToken(token: string | null)`

##### `appUser?: UserClientSide`
- **Purpose**: Current authenticated user data
- **Setters**: `setAppUser(user: UserClientSide | undefined)`

##### `appGroup?: GroupClientSide`
- **Purpose**: Current user's group/family data
- **Setters**: `setAppGroup(group: GroupClientSide | undefined)`

##### `screenType: "mobile" | "tablet" | "desktop"`
- **Purpose**: Current screen size for responsive behavior
- **Setters**: `setScreenType(type: "mobile" | "tablet" | "desktop")`
- **Default**: `"desktop"`

##### `datetime: string`
- **Purpose**: Currently selected date for filtering transactions
- **Setters**: `setDatetime(datetime: string)`
- **Default**: Current date

##### `verticalCatPicker: boolean`
- **Purpose**: Toggle for category picker orientation
- **Setters**: `setVerticalCatPicker(vertical: boolean)`

##### `txOragnizedByTimeArray: TxInDB[][][][]`
- **Purpose**: Transactions organized by [year][month][day][transactions]
- **Setters**: `setTxOragnizedByTimeArray(array: TxInDB[][][][])`

### Local Store (Persistent)

Persistent storage using Zustand with localStorage persistence.

#### Local Store Interface
```typescript
interface LocalStore {
  userId: string | null;
  setUserId: (userId: string) => void;
}
```

#### Usage
```typescript
import { useLocalStore } from '@/util/store';

const useCurrentUser = () => {
  const userId = useLocalStore((state) => state.userId);
  const setUserId = useLocalStore((state) => state.setUserId);
  
  return { userId, setUserId };
};
```

### Store Utilities

#### `useLocalStoreDelay<T, F>`
Delayed state updates to prevent hydration mismatches.

```typescript
const useLocalStoreDelay = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
) => F | undefined
```

**Usage**:
```typescript
const userId = useLocalStoreDelay(
  useLocalStore,
  (state) => state.userId
);
```

## Category Management (`lib/util/cat.ts`)

### Core Functions

#### `createNewCat`
Creates a new category object with proper defaults.

```typescript
const createNewCat = ({
  txId,
  nameArray,
  amount = 0,
}: {
  txId?: string;
  nameArray: string[] | null;
  amount: number;
}): CatClientSide
```

**Usage**:
```typescript
const category = createNewCat({
  nameArray: ["Food and Drink", "Groceries"],
  amount: 45.67,
  txId: "tx-123"
});
```

#### `getCatStyle`
Retrieves styling configuration for a category.

```typescript
const getCatStyle = (nameArray: string[]) => CategoryStyle
```

**Usage**:
```typescript
const style = getCatStyle(["Transportation", "Gas"]);
// Returns: { color: "blue", icon: "gas-pump" }
```

### Data Processing Functions

#### `convertPlaidCatsToHierarchicalArray`
Converts flat Plaid categories to hierarchical structure.

```typescript
const convertPlaidCatsToHierarchicalArray = (
  plaidCatArray: PlaidCat[],
) => TreedCat[]
```

**Usage**:
```typescript
const hierarchicalCats = convertPlaidCatsToHierarchicalArray(plaidCategories);
```

#### `fillArrayByCat`
Organizes transactions by category in a hierarchical structure.

```typescript
const fillArrayByCat = (
  resultArray: TreedCatWithTx[],
  tx: TxInDB,
  cat: CatClientSide,
): TreedCatWithTx[]
```

**Usage**:
```typescript
const organizedTxs = fillArrayByCat([], transaction, category);
```

### Calculation Functions

#### `subCatTotal`
Calculates total spending/income for subcategories.

```typescript
const subCatTotal = (
  parentCat: TreedCatWithTx,
  txType: TxType,
): number
```

**Usage**:
```typescript
const totalSpending = subCatTotal(parentCategory, "spending");
const totalReceived = subCatTotal(parentCategory, "received");
```

#### `calcCatTypeTotal`
Calculates total for all categories of a specific type.

```typescript
const calcCatTypeTotal = (
  catArray: TreedCatWithTx[],
  txType: TxType,
): number
```

**Usage**:
```typescript
const totalCategorySpending = calcCatTypeTotal(categories, "spending");
```

## Transaction Utilities (`lib/util/tx.ts`)

### Data Transformation

#### `resetTx`
Resets a transaction to its original state.

```typescript
const resetTx = (tx: TxInDB): UnsavedTxInDB
```

#### `mergePlaidTxWithTx`
Merges Plaid transaction data with existing transaction.

```typescript
const mergePlaidTxWithTx = (
  tx: TxInDB,
  plaidTx: Transaction,
): TxInDB
```

#### `createTxFromChaseCSV`
Creates transaction from Chase CSV import.

```typescript
const createTxFromChaseCSV = (
  chaseCSVTx: ChaseCSVTx,
  userId: string,
): UnsavedTx
```

#### `createTxFromPlaidTx`
Creates transaction from Plaid API data.

```typescript
const createTxFromPlaidTx = (
  userId: string,
  plaidTx: Transaction,
): UnsavedTx
```

### Organization Functions

#### `organizeTxByCat`
Organizes transactions by category structure.

```typescript
const organizeTxByCat = (txArray: TxInDB[]) => TreedCatWithTx[]
```

#### `organizeTxByTime`
Organizes transactions in 4D array: [year][month][day][transactions].

```typescript
const organizeTxByTime = (txArray: TxInDB[]) => TxInDB[][][][]
```

**Usage**:
```typescript
const organizedTxs = organizeTxByTime(allTransactions);
// Access: organizedTxs[yearIndex][monthIndex][dayIndex][txIndex]
```

#### `getScopeIndex`
Gets indices for specific date within organized transaction array.

```typescript
const getScopeIndex = (
  txOragnizedByTimeArray: TxInDB[][][][],
  date: Date,
  rangeFormat: "year" | "month" | "date",
): [number, number, number]
```

### Hooks

#### `useTxGetAll`
Custom hook for fetching all transactions with automatic user and date handling.

```typescript
const useTxGetAll = () => {
  const { appUser } = getAppUser();
  const datetime = useStore((store) => store.datetime);
  
  return trpc.tx.getAll.useQuery(
    {
      id: appUser ? appUser.id : "",
      date: datetime || new Date(Date.now()).toString(),
    },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken && !!datetime },
  );
};
```

**Usage**:
```typescript
const MyComponent = () => {
  const { data: transactions, isLoading, error } = useTxGetAll();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {transactions?.map(tx => (
        <div key={tx.id}>{tx.name}: ${tx.amount}</div>
      ))}
    </div>
  );
};
```

## User Management (`lib/util/user.ts`)

### User Data Processing

#### `stripUserSecrets`
Removes sensitive data from user objects for client-side use.

```typescript
function stripUserSecrets({
  ACCESS_TOKEN,
  ...rest
}: User & {
  myConnectionArray?: User[];
}): UserClientSide
```

**Usage**:
```typescript
const safeUser = stripUserSecrets(userFromDatabase);
// ACCESS_TOKEN is removed, hasAccessToken boolean is added
```

#### `stripUserSecretsFromGroup`
Safely processes group data with user arrays.

```typescript
const stripUserSecretsFromGroup = (
  group: Group & { userArray: User[] },
): GroupClientSide
```

### Constants

#### `emptyUser`
Default empty user object for initialization.

```typescript
const emptyUser: UserClientSide = {
  id: "",
  name: "",
  hasAccessToken: false,
  PUBLIC_TOKEN: null,
  ITEM_ID: null,
  cursor: null,
  TRANSFER_ID: null,
  PAYMENT_ID: null,
};
```

## API Integration (`lib/util/trpc.ts`)

### tRPC Client Setup

```typescript
import { createTRPCNext } from '@trpc/next';
import { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      url: '/api/trpc',
      transformer: superjson,
    };
  },
});
```

### Usage Patterns

#### Queries
```typescript
const { data, isLoading, error } = trpc.tx.getAll.useQuery({
  id: userId,
  date: selectedDate
});
```

#### Mutations
```typescript
const createTx = trpc.tx.create.useMutation({
  onSuccess: (data) => {
    console.log('Transaction created:', data);
  },
  onError: (error) => {
    console.error('Error creating transaction:', error);
  }
});

const handleSubmit = async (txData) => {
  await createTx.mutateAsync(txData);
};
```

## Utility Helpers

### `parseMoney` (`lib/util/parseMoney.ts`)
Formats monetary values with proper precision.

```typescript
const parseMoney = (amount: number): number
```

**Usage**:
```typescript
const formatted = parseMoney(123.456789); // Returns: 123.46
```

### `split` (`lib/util/split.ts`)
Creates expense split objects.

```typescript
const createNewSplit = (
  userId: string,
  amount: number,
  txId?: string
): Split
```

### `useDateRange` (`lib/util/useDateRange.ts`)
Hook for date range selection and management.

```typescript
const useDateRange = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    isValidRange: startDate && endDate && startDate <= endDate
  };
};
```

## Type Definitions

### Common Types
```typescript
// Transaction types
interface TxInDB {
  id: string;
  name: string;
  amount: number;
  datetime: Date;
  authorizedDatetime: Date;
  userId: string;
  plaidTx?: Transaction;
  catArray: CatClientSide[];
  splitArray: Split[];
  receipt?: Receipt;
}

// Category types
interface CatClientSide {
  id?: string;
  txId?: string;
  name: string;
  nameArray: string[];
  amount: number;
}

// User types
interface UserClientSide {
  id: string;
  name: string;
  hasAccessToken: boolean;
  PUBLIC_TOKEN: string | null;
  ITEM_ID: string | null;
  cursor: string | null;
  TRANSFER_ID: string | null;
  PAYMENT_ID: string | null;
}
```

## Best Practices

### State Management
1. Use the global store for application-wide state
2. Use local store for user preferences and persistence
3. Avoid direct state mutations - use provided setters
4. Use `useLocalStoreDelay` for hydration-sensitive data

### Data Processing
1. Always validate data before processing
2. Use TypeScript interfaces for type safety
3. Handle null/undefined cases gracefully
4. Use utility functions for common transformations

### Performance
1. Use React Query's caching with appropriate `staleTime`
2. Memoize expensive calculations
3. Avoid unnecessary re-renders with proper dependencies
4. Use pagination for large datasets

### Error Handling
1. Always handle API errors in components
2. Provide fallback UI for error states
3. Log errors for debugging
4. Use proper TypeScript error types