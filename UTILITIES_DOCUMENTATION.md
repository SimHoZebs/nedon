# Nedon Utilities Documentation

## Overview

Nedon's utility system provides a comprehensive set of functions for state management, data processing, API integration, and common operations. The utilities are organized into focused modules that handle specific domains: state management with Zustand, transaction processing, category management, user operations, and external service integrations. All utilities are written in TypeScript with strict type safety and follow functional programming principles.

## Architecture and Organization

### File Structure
```
lib/util/
├── store.ts           # Global and local state management
├── txStore.ts         # Transaction-specific state
├── tx.ts              # Transaction processing utilities
├── cat.ts             # Category management and calculations
├── catStyle.ts        # Category visual styling configuration
├── user.ts            # User data processing and security
├── split.ts           # Expense splitting utilities
├── parseMoney.ts      # Currency formatting and parsing
├── getAppUser.ts      # User context and authentication
├── useDateRange.ts    # Date range selection hook
├── trpc.ts            # tRPC client configuration
└── db.ts              # Database client initialization
```

### Design Principles
- **Pure Functions**: Most utilities are pure functions with predictable outputs
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Composability**: Functions designed to work together seamlessly
- **Performance**: Optimized for frequent operations and large datasets
- **Testability**: Functions designed for easy unit testing

## State Management

### Global Store (`lib/util/store.ts`)

The application uses Zustand for state management with separate stores for different concerns.

#### **Main Store Interface**
```typescript
interface Store {
  // Plaid Integration
  linkToken: string | null;
  setLinkToken: (linkToken: string | null) => void;

  // User State
  appUser?: UserClientSide;
  setAppUser: (user: UserClientSide | undefined) => void;

  // Group State
  appGroup?: GroupClientSide;
  setAppGroup: (group: GroupClientSide | undefined) => void;

  // UI State
  screenType: "mobile" | "tablet" | "desktop";
  setScreenType: (screenType: "mobile" | "tablet" | "desktop") => void;

  // Date Selection
  datetime: string;
  setDatetime: (datetime: string) => void;

  // Category UI
  verticalCatPicker: boolean;
  setVerticalCatPicker: (verticalCatPicker: boolean) => void;

  // Transaction Organization
  txOragnizedByTimeArray: TxInDB[][][][]; // [year][month][day][transactions]
  setTxOragnizedByTimeArray: (txOragnizedByTimeArray: TxInDB[][][][]) => void;
}
```

#### **Store Configuration**
```typescript
export const useStore = create<Store>()(
  devtools(
    (set) => ({
      linkToken: "", // Empty string prevents error flash on load
      setLinkToken: (linkToken) => set({ linkToken }),

      appUser: undefined,
      setAppUser: (appUser) => set({ appUser }),

      datetime: new Date(Date.now()).toString(),
      setDatetime: (datetime) => set({ datetime }),

      screenType: "desktop",
      setScreenType: (screenType) => set({ screenType }),

      verticalCatPicker: false,
      setVerticalCatPicker: (verticalCatPicker) => set({ verticalCatPicker }),

      txOragnizedByTimeArray: [],
      setTxOragnizedByTimeArray: (txOragnizedByTimeArray) => 
        set({ txOragnizedByTimeArray }),
    }),
    { name: "global-store" },
  ),
);
```

#### **Usage Patterns**
```typescript
// Reading state
const MyComponent = () => {
  const appUser = useStore((state) => state.appUser);
  const screenType = useStore((state) => state.screenType);
  
  // Multiple state selections
  const { datetime, txOragnizedByTimeArray } = useStore((state) => ({
    datetime: state.datetime,
    txOragnizedByTimeArray: state.txOragnizedByTimeArray
  }));

  return <div>Current user: {appUser?.name}</div>;
};

// Writing state
const UserActions = () => {
  const setAppUser = useStore((state) => state.setAppUser);
  const setScreenType = useStore((state) => state.setScreenType);

  const handleUserUpdate = (user: UserClientSide) => {
    setAppUser(user);
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenType("mobile");
      else if (width < 768) setScreenType("tablet");
      else setScreenType("desktop");
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setScreenType]);
};
```

### Local Persistent Store

#### **Local Store Interface**
```typescript
interface LocalStore {
  userId: string | null;
  setUserId: (userId: string) => void;
}

export const useLocalStore = create<LocalStore>()(
  devtools(
    persist(
      (set) => ({
        userId: null,
        setUserId: (userId: string) => set({ userId }),
      }),
      { name: "local-storage" }
    ),
  ),
);
```

#### **Hydration-Safe Hook**
```typescript
export const useLocalStoreDelay = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};

// Usage
const userId = useLocalStoreDelay(
  useLocalStore,
  (state) => state.userId
);
```

### Transaction Store (`lib/util/txStore.ts`)

Specialized store for complex transaction modal state management.

#### **Transaction Store Interface**
```typescript
interface Store {
  // Modal State
  txOnModalIndex: number[] | null; // [year, month, day, transaction]
  setTxOnModalIndex: (index: number[] | null) => void;

  txOnModal: UnsavedTx | UnsavedTxInDB | TxInDB | null;
  setTxOnModal: (tx: UnsavedTx | TxInDB) => void;

  // Data Modification
  setSplitArray: (splitArray: SplitClientSide[]) => void;
  setCatArray: (catArray: CatClientSide[]) => void;
  revertToTxInDB: () => void; // Sync with database state

  // Category State
  hasEditedCatArray: boolean;
  setHasEditedCatArray: (hasEditedCatArray: boolean) => void;

  // Split State
  isEditingSplit: boolean;
  setIsEditingSplit: (isEditingSplit: boolean) => void;
  focusedSplitIndex: number | undefined;
  setFocusedSplitIndex: (index: number | undefined) => void;
  editedSplitIndexArray: number[];
  setEditedSplitIndexArray: (input: number[] | ((prev: number[]) => number[])) => void;

  // UI State
  splitAmountDisplayArray: string[]; // String for arithmetic display
  setSplitAmountDisplayArray: (splitAmountDisplayArray: string[]) => void;
}
```

#### **Complex State Operations**
```typescript
// Transaction data synchronization
revertToTxInDB: () =>
  set((store) => {
    if (!store.txOnModalIndex) return store;
    const [y, m, d, i] = store.txOnModalIndex;

    const txOrganizedByTimeArray = useStore.getState().txOragnizedByTimeArray;
    return {
      txOnModal: store.txOnModal
        ? txOrganizedByTimeArray[y][m][d][i]
        : null,
    };
  }),

// Dynamic array updates
setSplitArray: (splitArray) => {
  set((store) => {
    if (!store.txOnModal) return store;

    const clone = structuredClone(store.txOnModal);
    return {
      txOnModal: {
        ...clone,
        splitArray: splitArray,
      },
    };
  });
},
```

## Transaction Processing (`lib/util/tx.ts`)

Comprehensive transaction management utilities for data transformation and organization.

### **Data Transformation Functions**

#### **`resetTx`** - Reset to Original State
```typescript
export const resetTx = (tx: TxInDB): UnsavedTxInDB => ({
  ...tx,
  plaidTx: tx.plaidTx,
  splitArray: [createNewSplit(tx.userId, tx.amount, tx.id)],
  catArray: [
    createNewCat({
      nameArray: tx.plaidTx?.category || [],
      amount: tx.amount,
    }),
  ],
  receipt: null,
});

// Usage
const handleReset = async () => {
  const originalTx = resetTx(currentTransaction);
  await updateTransaction(originalTx);
};
```

#### **`mergePlaidTxWithTx`** - Merge Plaid Data
```typescript
export const mergePlaidTxWithTx = (
  tx: TxInDB,
  plaidTx: Transaction,
): TxInDB => {
  return {
    ...tx,
    plaidTx: plaidTx,
  };
};
```

#### **`createTxFromChaseCSV`** - CSV Import Processing
```typescript
export const createTxFromChaseCSV = (
  chaseCSVTx: ChaseCSVTx,
  userId: string,
): UnsavedTx => {
  return {
    id: undefined,
    plaidTx: null,
    name: chaseCSVTx.Description,
    amount: Number.parseFloat(chaseCSVTx.Amount),
    recurring: false,
    MDS: -1, // Undetermined classification
    datetime: new Date(chaseCSVTx.PostingDate),
    authorizedDatetime: new Date(chaseCSVTx.PostingDate),
    userTotal: 0,
    originTxId: null,
    plaidId: null,
    userId,
    accountId: null,
    catArray: [
      createNewCat({
        nameArray: [],
        amount: Number.parseFloat(chaseCSVTx.Amount),
      }),
    ],
    splitArray: [createNewSplit(userId, Number.parseFloat(chaseCSVTx.Amount))],
    receipt: null,
  };
};

// Bulk CSV processing
const processCsvFile = (csvData: ChaseCSVTx[], userId: string) => {
  return csvData.map(row => createTxFromChaseCSV(row, userId));
};
```

#### **`createTxFromPlaidTx`** - Plaid Integration
```typescript
export const createTxFromPlaidTx = (
  userId: string,
  plaidTx: Transaction,
): UnsavedTx => {
  return {
    id: undefined,
    plaidTx: plaidTx,
    name: plaidTx.name,
    amount: plaidTx.amount,
    recurring: false,
    MDS: -1,
    userTotal: 0,
    originTxId: null,
    datetime: plaidTx.datetime ? new Date(plaidTx.datetime) : null,
    authorizedDatetime: new Date(plaidTx.authorized_date || 0),
    plaidId: plaidTx.transaction_id,
    userId: userId,
    accountId: plaidTx.account_id,
    catArray: [
      createNewCat({
        nameArray: plaidTx.category,
        amount: plaidTx.amount,
      }),
    ],
    splitArray: [createNewSplit(userId, plaidTx.amount, "")],
    receipt: null,
  };
};
```

### **Data Organization Functions**

#### **`organizeTxByCat`** - Category Organization
```typescript
export const organizeTxByCat = (txArray: TxInDB[]) => {
  const catArray: TreedCatWithTx[] = [];

  for (const tx of txArray) {
    const txCopy = structuredClone(tx);

    for (const cat of txCopy.catArray) {
      fillArrayByCat(catArray, txCopy, cat);
    }
  }

  return catArray;
};

// Usage with filtering
const organizeTransactionsByCategory = (transactions: TxInDB[], dateRange: DateRange) => {
  const filteredTxs = transactions.filter(tx => 
    isWithinDateRange(tx.authorizedDatetime, dateRange)
  );
  
  return organizeTxByCat(filteredTxs);
};
```

#### **`organizeTxByTime`** - Temporal Organization
```typescript
export const organizeTxByTime = (txArray: TxInDB[]) => {
  const txSortedByTimeArray = txArray.sort(
    (a, b) => b.authorizedDatetime.getTime() - a.authorizedDatetime.getTime(),
  );
  
  const txOrganizedByTimeArray: TxInDB[][][][] = [[[[]]]];

  let lastDate: Date | undefined = undefined;
  let yearIndex = -1;
  let monthIndex = -1;
  let dateIndex = -1;

  for (const tx of txSortedByTimeArray) {
    const date = new Date(tx.authorizedDatetime);
    date.setDate(date.getDate() + 1); // Adjust for timezone

    if (!lastDate) {
      yearIndex++;
      monthIndex++;
      dateIndex++;
      lastDate = date;
    }

    // Year boundary
    if (lastDate.getFullYear() !== date.getFullYear()) {
      yearIndex++;
      monthIndex = -1;
      txOrganizedByTimeArray[yearIndex] = [];
    }
    
    // Month boundary
    if (lastDate.getMonth() !== date.getMonth()) {
      monthIndex++;
      dateIndex = -1;
      txOrganizedByTimeArray[yearIndex][monthIndex] = [];
    }
    
    // Day boundary
    if (lastDate.getDate() !== date.getDate()) {
      dateIndex++;
      txOrganizedByTimeArray[yearIndex][monthIndex][dateIndex] = [];
    }

    // Fallback handling
    if (monthIndex === -1) {
      monthIndex++;
      txOrganizedByTimeArray[yearIndex][monthIndex] = [];
    }
    if (dateIndex === -1) {
      dateIndex++;
      txOrganizedByTimeArray[yearIndex][monthIndex][dateIndex] = [];
    }

    txOrganizedByTimeArray[yearIndex][monthIndex][dateIndex].push(tx);
    lastDate = date;
  }

  return txOrganizedByTimeArray;
};
```

#### **`getScopeIndex`** - Date Navigation
```typescript
export const getScopeIndex = (
  txOragnizedByTimeArray: TxInDB[][][][],
  date: Date,
  rangeFormat: "year" | "month" | "date",
): [number, number, number] => {
  let [y, m, d]: [number, number, number] = [-1, -1, -1];

  if (txOragnizedByTimeArray.length === 0) return [y, m, d];

  // Find year index
  for (const [yIndex, year] of txOragnizedByTimeArray.entries()) {
    const txDate = new Date(year?.[0]?.[0]?.[0]?.authorizedDatetime);
    if (Number.isNaN(txDate.getDate())) return [y, m, d];

    txDate.setDate(txDate.getDate() + 1);
    if (txDate.getFullYear() === date.getFullYear()) {
      y = yIndex;
      break;
    }
  }

  if (rangeFormat === "year") return [y, m, d];
  if (y === -1) return [y, m, d];

  // Find month index
  for (const [mIndex, month] of txOragnizedByTimeArray[y].entries()) {
    const txDate = new Date(month[0][0].authorizedDatetime);
    txDate.setDate(txDate.getDate() + 1);
    if (txDate.getMonth() === date.getMonth()) {
      m = mIndex;
      break;
    }
  }

  if (rangeFormat === "month") return [y, m, d];
  if (m === -1) return [y, m, d];

  // Find day index
  for (const [dIndex, dateArray] of txOragnizedByTimeArray[y][m].entries()) {
    const txDate = new Date(dateArray[0].authorizedDatetime);
    txDate.setDate(txDate.getDate() + 1);
    if (txDate.getDate() === date.getDate()) {
      d = dIndex;
      break;
    }
  }

  return [y, m, d];
};
```

### **Transaction Hooks**

#### **`useTxGetAll`** - Primary Transaction Hook
```typescript
export const useTxGetAll = () => {
  const { appUser } = getAppUser();
  const datetime = useStore((store) => store.datetime);

  const txArray = trpc.tx.getAll.useQuery(
    {
      id: appUser ? appUser.id : "",
      date: datetime || new Date(Date.now()).toString(),
    },
    { 
      staleTime: 3600000, // 1 hour cache
      enabled: appUser?.hasAccessToken && !!datetime,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  );
  
  return txArray;
};

// Advanced usage with error handling
const TransactionManager = () => {
  const { data: transactions, isLoading, error, refetch } = useTxGetAll();

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) {
    return <ErrorDisplay message={error.message} onRetry={handleRetry} />;
  }

  return (
    <TransactionList 
      transactions={transactions || []}
      loading={isLoading}
    />
  );
};
```

## Category Management (`lib/util/cat.ts`)

Comprehensive category processing with hierarchical organization and calculations.

### **Core Category Functions**

#### **`createNewCat`** - Category Creation
```typescript
export const createNewCat = ({
  txId,
  nameArray,
  amount = 0,
}: {
  txId?: string;
  nameArray: string[] | null;
  amount: number;
}): CatClientSide => {
  return {
    id: undefined,
    txId: txId,
    name: nameArray?.slice(-1)[0] || "Unknown",
    nameArray: nameArray || [],
    amount: amount,
  };
};

// Usage patterns
const createCategoriesFromTransaction = (tx: Transaction) => {
  const primaryCat = createNewCat({
    nameArray: tx.category,
    amount: tx.amount * 0.8, // 80% of transaction
    txId: tx.id
  });

  const secondaryCat = createNewCat({
    nameArray: ["Miscellaneous", "Other"],
    amount: tx.amount * 0.2, // 20% of transaction
    txId: tx.id
  });

  return [primaryCat, secondaryCat];
};
```

#### **`getCatStyle`** - Visual Styling
```typescript
export const getCatStyle = (nameArray: string[]) => {
  const categoryName = nameArray.slice(-1)[0];
  const style = catStyleArray[categoryName];
  return style ? style : catStyleArray.Unknown;
};

// Usage with React components
const CategoryChip = ({ category }: { category: CatClientSide }) => {
  const style = getCatStyle(category.nameArray);
  
  return (
    <div className={`${style.bgColor} ${style.textColor} ${style.border}`}>
      <span className={style.icon} />
      <span>{category.name}</span>
    </div>
  );
};
```

### **Hierarchical Processing**

#### **`convertPlaidCatsToHierarchicalArray`** - Plaid Integration
```typescript
export const convertPlaidCatsToHierarchicalArray = (
  plaidCatArray: PlaidCat[],
) => {
  const resultArray: TreedCat[] = [];

  for (const cat of plaidCatArray) {
    fillCatInHierarchy(resultArray, { ...cat });
  }
  return resultArray;
};

export const fillCatInHierarchy = (
  resultArray: TreedCat[],
  plaidCat: PlaidCat,
): TreedCat[] => {
  const hierarchy = plaidCat.hierarchy;
  const firstCat = hierarchy[0];

  let index = resultArray.findIndex((cat) => cat.name === firstCat);

  if (index === -1) {
    resultArray.push({
      name: firstCat,
      subCatArray: [],
    });
    index = resultArray.length - 1;
  }

  const nextHierarchicalArray = hierarchy.slice(1);
  if (nextHierarchicalArray.length === 0) {
    return resultArray;
  }
  
  plaidCat.hierarchy = nextHierarchicalArray;
  resultArray[index].subCatArray = fillCatInHierarchy(
    resultArray[index].subCatArray,
    plaidCat,
  );

  return resultArray;
};
```

#### **`fillArrayByCat`** - Transaction Organization
```typescript
export const fillArrayByCat = (
  resultArray: TreedCatWithTx[],
  tx: TxInDB,
  cat: CatClientSide,
): TreedCatWithTx[] => {
  const nameArray = cat.nameArray;

  if (!nameArray || !nameArray.length) return resultArray;

  const firstCatName = nameArray[0];
  let index = resultArray.findIndex((cat) => cat.name === firstCatName);

  const hierarchicalCat = {
    name: firstCatName,
    received: 0,
    spending: 0,
    budget: cat.amount || 0,
    txArray: [],
    subCatArray: [],
  };

  // Determine spending vs income
  if (tx.amount > 0) {
    hierarchicalCat.spending += cat.amount;
  } else {
    hierarchicalCat.received += cat.amount;
  }

  if (index === -1) {
    resultArray.push(hierarchicalCat);
    index = resultArray.length - 1;
  }

  const slicedNameArray = nameArray.slice(1);

  if (slicedNameArray.length === 0) {
    // Leaf category - add transaction
    resultArray[index].txArray.push(tx);
    resultArray[index].spending += hierarchicalCat.spending;
    resultArray[index].spending = parseMoney(resultArray[index].spending);
    resultArray[index].received += hierarchicalCat.received;
    resultArray[index].received = parseMoney(resultArray[index].received);
  } else {
    // Continue hierarchical processing
    const txCopy = structuredClone(tx);
    const newCat = structuredClone(cat);
    newCat.nameArray = slicedNameArray;

    resultArray[index].subCatArray = fillArrayByCat(
      resultArray[index].subCatArray,
      txCopy,
      newCat,
    );
  }

  return resultArray;
};
```

### **Calculation Functions**

#### **`subCatTotal`** - Recursive Calculations
```typescript
export const subCatTotal = (
  parentCat: TreedCatWithTx,
  txType: TxType,
): number => {
  const spending = parentCat.subCatArray.reduce((total, subCat) => {
    const amount = txType === "received" ? subCat.received : subCat.spending;
    return total + amount + subCatTotal(subCat, txType);
  }, 0);

  return spending;
};

// Usage for budget analysis
const calculateBudgetUsage = (category: TreedCatWithTx) => {
  const totalSpending = category.spending + subCatTotal(category, "spending");
  const budgetUsagePercentage = category.budget > 0 
    ? (totalSpending / category.budget) * 100 
    : 0;
    
  return {
    totalSpending,
    budgetUsagePercentage,
    isOverBudget: budgetUsagePercentage > 100,
    remainingBudget: Math.max(0, category.budget - totalSpending)
  };
};
```

#### **`calcCatTypeTotal`** - Aggregate Calculations
```typescript
export const calcCatTypeTotal = (
  catArray: TreedCatWithTx[],
  txType: TxType,
): number => {
  const spending = catArray.reduce((total, cat) => {
    const amount = txType === "received" ? cat.received : cat.spending;
    return total + amount + subCatTotal(cat, txType);
  }, 0);

  return spending;
};

// Usage for analytics
const generateCategoryInsights = (categories: TreedCatWithTx[]) => {
  const totalSpending = calcCatTypeTotal(categories, "spending");
  const totalIncome = calcCatTypeTotal(categories, "received");
  
  const categoryPercentages = categories.map(cat => ({
    name: cat.name,
    spending: cat.spending + subCatTotal(cat, "spending"),
    percentage: ((cat.spending + subCatTotal(cat, "spending")) / totalSpending) * 100
  }));

  return {
    totalSpending,
    totalIncome,
    netAmount: totalIncome - totalSpending,
    categoryBreakdown: categoryPercentages.sort((a, b) => b.spending - a.spending)
  };
};
```

## Category Styling (`lib/util/catStyle.ts`)

Visual styling configuration for category representation.

### **Style Configuration**
```typescript
const catStyleArray: {
  [key: string]: {
    icon: string;
    bgColor: string;
    textColor: string;
    border: string;
  };
} = {
  "Food and Drink": {
    icon: "icon-[fluent--food-24-regular]",
    bgColor: "bg-yellow-300",
    textColor: "text-yellow-300",
    border: "border border-1 border-yellow-300",
  },
  "Transportation": {
    icon: "icon-[mdi--car-outline]",
    bgColor: "bg-purple-300",
    textColor: "text-purple-300",
    border: "border border-1 border-purple-300",
  },
  // ... extensive category mappings
  Unknown: {
    icon: "icon-[mdi--shape-outline]",
    bgColor: "bg-zinc-400",
    textColor: "text-zinc-400",
    border: "border border-1 border-zinc-400",
  },
};

export default catStyleArray;
```

### **Dynamic Styling Usage**
```typescript
const CategoryDisplay = ({ categoryName }: { categoryName: string }) => {
  const style = getCatStyle([categoryName]);
  
  return (
    <div className={`flex items-center p-2 rounded-lg ${style.bgColor} ${style.border}`}>
      <span className={`${style.icon} ${style.textColor} h-6 w-6`} />
      <span className={`ml-2 font-medium ${style.textColor}`}>
        {categoryName}
      </span>
    </div>
  );
};
```

## User Management (`lib/util/user.ts`)

User data processing with security and privacy considerations.

### **Security Functions**

#### **`stripUserSecrets`** - Data Sanitization
```typescript
export function stripUserSecrets({
  ACCESS_TOKEN,
  ...rest
}: User & {
  myConnectionArray?: User[];
}): UserClientSide {
  return { 
    ...rest, 
    hasAccessToken: !!ACCESS_TOKEN 
  };
}

// Usage in API responses
const getUserData = async (userId: string) => {
  const user = await db.user.findFirst({
    where: { id: userId },
    include: { myConnectionArray: true }
  });
  
  if (!user) return null;
  
  return stripUserSecrets(user); // Safe for client consumption
};
```

#### **`stripUserSecretsFromGroup`** - Group Data Security
```typescript
export const stripUserSecretsFromGroup = (
  group: Group & { userArray: User[] },
): GroupClientSide => {
  const userClientSideArray: UserClientSide[] = group.userArray.map((user) =>
    stripUserSecrets(user),
  );

  const groupClientSide: GroupClientSide = {
    ...group,
    userArray: userClientSideArray,
  };

  return groupClientSide;
};
```

### **User Constants**
```typescript
export const emptyUser: UserClientSide = {
  id: "",
  name: "",
  hasAccessToken: false,
  PUBLIC_TOKEN: null,
  ITEM_ID: null,
  cursor: null,
  TRANSFER_ID: null,
  PAYMENT_ID: null,
};

// Usage for initialization
const initializeUserState = () => {
  const [user, setUser] = useState<UserClientSide>(emptyUser);
  
  useEffect(() => {
    // Load user data when available
    if (userId) {
      loadUserData(userId).then(setUser);
    }
  }, [userId]);
};
```

## Expense Splitting (`lib/util/split.ts`)

Utilities for managing expense splitting between users.

### **Split Creation**
```typescript
export const createNewSplit = (
  userId: string,
  amount: number,
  txId?: string
): SplitClientSide => {
  return {
    id: undefined,
    userId,
    amount,
    txId,
    originTxId: txId
  };
};

// Usage for equal splitting
const createEqualSplits = (totalAmount: number, userIds: string[], txId: string) => {
  const splitAmount = totalAmount / userIds.length;
  
  return userIds.map(userId => createNewSplit(userId, splitAmount, txId));
};

// Usage for custom splitting
const createCustomSplits = (splitData: Array<{userId: string, amount: number}>, txId: string) => {
  return splitData.map(({ userId, amount }) => 
    createNewSplit(userId, amount, txId)
  );
};
```

## Utility Helpers

### **Money Formatting** (`lib/util/parseMoney.ts`)
```typescript
const parseMoney = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

export default parseMoney;

// Advanced money utilities
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseMoney(amount));
};

export const calculatePercentage = (amount: number, total: number): number => {
  if (total === 0) return 0;
  return parseMoney((amount / total) * 100);
};
```

### **User Context** (`lib/util/getAppUser.ts`)
```typescript
const getAppUser = () => {
  const userId = useLocalStore((state) => state.userId);
  
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: 300000, // 5 minutes
  });

  const appUser = allUsers.data?.find((user) => user.id === userId);

  return { appUser, allUsers };
};

export default getAppUser;

// Usage patterns
const UserProfile = () => {
  const { appUser, allUsers } = getAppUser();

  if (allUsers.isLoading) return <LoadingSpinner />;
  if (!appUser) return <NoUserMessage />;

  return (
    <div>
      <h1>Welcome, {appUser.name}!</h1>
      <p>Connected: {appUser.hasAccessToken ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

### **Date Range Hook** (`lib/util/useDateRange.ts`)
```typescript
const useDateRange = () => {
  const datetime = useStore((state) => state.datetime);
  const setDatetime = useStore((state) => state.setDatetime);
  
  const [rangeFormat, setRangeFormat] = useState<"year" | "month" | "date" | "all">("month");

  const date = datetime ? new Date(datetime) : new Date();

  const setDate = useCallback((newDate: Date) => {
    setDatetime(newDate.toString());
  }, [setDatetime]);

  return {
    date,
    setDate,
    rangeFormat,
    setRangeFormat,
  };
};

export default useDateRange;

// Advanced date utilities
export const getDateRangeBounds = (date: Date, format: "year" | "month" | "date") => {
  const start = new Date(date);
  const end = new Date(date);

  switch (format) {
    case "year":
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      break;
    case "month":
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
      break;
    case "date":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
};
```

## API Integration (`lib/util/trpc.ts`)

tRPC client configuration and integration utilities.

### **Client Setup**
```typescript
import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      transformer: superjson,
      links: [
        httpBatchLink({
          url: '/api/trpc',
          // Batch requests for performance
          maxBatchSize: 10,
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 60000, // 1 minute default
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error.data?.httpStatus >= 400 && error.data?.httpStatus < 500) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      },
    };
  },
});

// Utility hooks
export const useTrpcUtils = () => {
  const utils = trpc.useUtils();
  
  const invalidateAll = useCallback(() => {
    utils.tx.invalidate();
    utils.user.invalidate();
    utils.cat.invalidate();
  }, [utils]);

  return { utils, invalidateAll };
};
```

### **Advanced Query Patterns**
```typescript
// Conditional queries
const useConditionalTransactions = (userId?: string, enabled = true) => {
  return trpc.tx.getAll.useQuery(
    { id: userId!, date: new Date().toString() },
    { 
      enabled: enabled && !!userId,
      staleTime: 300000 
    }
  );
};

// Optimistic updates
const useOptimisticTransaction = () => {
  const utils = trpc.useUtils();
  
  return trpc.tx.update.useMutation({
    onMutate: async (newTx) => {
      await utils.tx.getAll.cancel();
      
      const previousTxs = utils.tx.getAll.getData();
      
      utils.tx.getAll.setData(
        { id: newTx.userId, date: new Date().toString() },
        (old) => old ? old.map(tx => tx.id === newTx.id ? newTx : tx) : []
      );
      
      return { previousTxs };
    },
    onError: (err, newTx, context) => {
      utils.tx.getAll.setData(
        { id: newTx.userId, date: new Date().toString() },
        context?.previousTxs
      );
    },
    onSettled: () => {
      utils.tx.getAll.invalidate();
    },
  });
};
```

## Database Integration (`lib/util/db.ts`)

Database client configuration and connection management.

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;

// Advanced database utilities
export const withTransaction = async <T>(
  operation: (tx: PrismaClient) => Promise<T>
): Promise<T> => {
  return db.$transaction(operation);
};

export const healthCheck = async () => {
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
```

## Performance Optimization

### **Memoization Patterns**
```typescript
// Expensive calculations
const useTransactionAnalytics = (transactions: TxInDB[]) => {
  return useMemo(() => {
    const organized = organizeTxByCat(transactions);
    const totalSpending = calcCatTypeTotal(organized, "spending");
    const totalIncome = calcCatTypeTotal(organized, "received");
    
    return {
      organized,
      totalSpending,
      totalIncome,
      netAmount: totalIncome - totalSpending
    };
  }, [transactions]);
};

// Callback optimization
const useStableCallbacks = () => {
  const setAppUser = useStore(state => state.setAppUser);
  
  const updateUser = useCallback((user: UserClientSide) => {
    setAppUser(user);
  }, [setAppUser]);
  
  const clearUser = useCallback(() => {
    setAppUser(undefined);
  }, [setAppUser]);
  
  return { updateUser, clearUser };
};
```

### **Data Processing Optimization**
```typescript
// Batch processing
const processBatchTransactions = (transactions: UnsavedTx[], batchSize = 100) => {
  const batches = [];
  for (let i = 0; i < transactions.length; i += batchSize) {
    batches.push(transactions.slice(i, i + batchSize));
  }
  
  return Promise.all(
    batches.map(batch => trpc.tx.createMany.mutate(batch))
  );
};

// Efficient filtering
const filterTransactionsByDateRange = (
  transactions: TxInDB[], 
  startDate: Date, 
  endDate: Date
) => {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  
  return transactions.filter(tx => {
    const txTime = new Date(tx.authorizedDatetime).getTime();
    return txTime >= startTime && txTime <= endTime;
  });
};
```

## Error Handling

### **Error Boundaries**
```typescript
export const createErrorHandler = (context: string) => {
  return (error: Error, errorInfo: any) => {
    console.error(`Error in ${context}:`, error, errorInfo);
    
    // Report to error tracking service
    if (typeof window !== 'undefined') {
      // Send to error tracking
    }
  };
};

// Usage
const TransactionErrorBoundary = ({ children }) => {
  const handleError = createErrorHandler('TransactionProcessing');
  
  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};
```

### **Validation Utilities**
```typescript
export const validateTransaction = (tx: UnsavedTx): string[] => {
  const errors: string[] = [];
  
  if (!tx.name.trim()) {
    errors.push('Transaction name is required');
  }
  
  if (tx.amount === 0) {
    errors.push('Transaction amount cannot be zero');
  }
  
  if (tx.catArray.length === 0) {
    errors.push('At least one category is required');
  }
  
  const totalCatAmount = tx.catArray.reduce((sum, cat) => sum + cat.amount, 0);
  if (Math.abs(totalCatAmount - tx.amount) > 0.01) {
    errors.push('Category amounts must equal transaction amount');
  }
  
  return errors;
};
```

## Testing Utilities

### **Test Helpers**
```typescript
export const createMockTransaction = (overrides: Partial<TxInDB> = {}): TxInDB => {
  return {
    id: "test-tx-1",
    name: "Test Transaction",
    amount: 100.00,
    userId: "test-user-1",
    authorizedDatetime: new Date(),
    datetime: new Date(),
    recurring: false,
    MDS: 0,
    userTotal: 100.00,
    originTxId: null,
    plaidId: null,
    accountId: null,
    catArray: [],
    splitArray: [],
    receipt: null,
    plaidTx: null,
    ...overrides
  };
};

export const createMockUser = (overrides: Partial<UserClientSide> = {}): UserClientSide => {
  return {
    id: "test-user-1",
    name: "Test User",
    hasAccessToken: true,
    PUBLIC_TOKEN: null,
    ITEM_ID: null,
    cursor: null,
    TRANSFER_ID: null,
    PAYMENT_ID: null,
    ...overrides
  };
};
```

## Best Practices

### **State Management Guidelines**
1. **Separation of Concerns**: Use different stores for different domains
2. **Immutability**: Always create new objects when updating state
3. **Performance**: Use selectors to prevent unnecessary re-renders
4. **Persistence**: Only persist essential user preferences
5. **Hydration**: Handle SSR hydration mismatches with delay hooks

### **Data Processing Guidelines**
1. **Pure Functions**: Keep utilities pure for predictability and testing
2. **Type Safety**: Leverage TypeScript for compile-time safety
3. **Error Handling**: Always handle edge cases and invalid data
4. **Performance**: Use memoization for expensive calculations
5. **Composability**: Design functions to work together seamlessly

### **Integration Guidelines**
1. **Error Boundaries**: Wrap components with appropriate error handling
2. **Loading States**: Always handle loading and error states
3. **Optimistic Updates**: Use for better user experience
4. **Batch Operations**: Group related API calls for efficiency
5. **Caching**: Use appropriate cache strategies for different data types

This comprehensive utilities documentation covers all aspects of Nedon's utility system, from basic helper functions to complex state management and data processing. Each utility is designed to work seamlessly with the application's architecture while maintaining type safety, performance, and reliability.