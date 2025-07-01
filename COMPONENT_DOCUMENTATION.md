# Nedon Component Documentation

## Overview

Nedon's component library is built with React 19, TypeScript, Tailwind CSS, and Framer Motion. The components follow a modular architecture with clear separation of concerns, consistent styling patterns, and comprehensive accessibility features. All components are organized by functionality and support the application's core features: transaction management, expense splitting, receipt processing, and analytics.

## Architecture and Design Principles

### Technology Stack
- **React 19**: Latest React with improved hooks and concurrent features
- **TypeScript**: Full type safety with strict configurations
- **Tailwind CSS**: Utility-first styling with custom design system
- **Framer Motion**: Smooth animations and transitions
- **Iconify**: Comprehensive icon system with Tailwind integration
- **Space Grotesk**: Custom variable font for modern typography

### Design System

#### Color Palette
```css
/* Primary Colors */
--zinc-900: #18181b    /* Primary background */
--zinc-800: #27272a    /* Secondary background */
--zinc-700: #3f3f46    /* Tertiary background */
--zinc-400: #a1a1aa    /* Border color */
--zinc-300: #d4d4d8    /* Primary text */

/* Accent Colors */
--indigo-500: #6366f1   /* Primary actions */
--indigo-600: #4f46e5   /* Primary hover */
--indigo-200: #c7d2fe   /* Primary light */

/* Status Colors */
--red-300: #fca5a5      /* Negative/Error */
--green-300: #86efac    /* Positive/Success */
--yellow-300: #fde047   /* Warning/Neutral */
--pink-400: #f472b6     /* Destructive actions */
```

#### Typography Scale
```css
/* Heading Hierarchy */
H1: text-2xl (24px) font-semibold
H2: text-xl (20px) font-semibold  
H3: text-lg (18px) font-medium
H4: text-base (16px) font-medium
H5: text-sm (14px) font-medium
H6: text-xs (12px) font-medium

/* Body Text */
Base: text-sm (14px) sm:text-base (16px)
Small: text-xs (12px)
Large: text-lg (18px)
```

### Component Architecture

#### Base Component Pattern
```typescript
interface BaseProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
}

const Component = ({ children, className, ...props }: BaseProps) => {
  return (
    <element 
      className={twMerge("base-styles", className)}
      {...props}
    >
      {children}
    </element>
  );
};
```

## Component Categories

### 1. Button Components (`lib/comp/Button.tsx`)

Comprehensive button system with multiple variants and interaction states.

#### **`Button`** - Base Button Component
**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClickAsync?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}
```

**Features**:
- Automatic loading state with spinner animation
- Async click handler with proper error handling
- Active scale animation (scale-95)
- Disabled state with visual feedback
- Automatic color extraction for loading spinner

**Implementation Details**:
```typescript
const Button = ({ children, className, onClickAsync, ...rest }: ButtonProps) => {
  const [loading, setLoading] = useState(false);
  
  // Extracts text color for spinner
  const originalTextColor = className
    ?.split(" ")
    .find((style) => style.startsWith("text-") && style.endsWith("0"));

  const handleClick = async (e) => {
    if (props.onClick) props.onClick(e);
    
    if (onClickAsync) {
      setLoading(true);
      try {
        await onClickAsync(e);
      } finally {
        setLoading(false);
      }
    }
  };
};
```

**Usage Examples**:
```tsx
// Basic button
<Button onClick={() => console.log('clicked')}>
  Save Changes
</Button>

// Async button with loading state
<Button 
  onClickAsync={async () => {
    await saveTransaction();
    showSuccess("Transaction saved!");
  }}
  className="bg-indigo-500 text-white"
>
  Save Transaction
</Button>

// Disabled state
<Button disabled className="bg-gray-400">
  Cannot Save
</Button>
```

#### **`ActionBtn`** - Primary Action Button
**Props**:
```typescript
interface ActionBtnProps extends ButtonProps {
  variant?: "primary" | "negative";
  rounded?: boolean;
}
```

**Styling System**:
- **Primary**: `bg-indigo-500 hover:bg-indigo-600` (Main actions)
- **Negative**: `bg-pink-400 hover:bg-pink-500` (Destructive actions)
- **Rounded**: Optional `rounded-full` vs `rounded-lg`

**Usage Examples**:
```tsx
// Primary action
<ActionBtn variant="primary" rounded>
  Create Transaction
</ActionBtn>

// Destructive action
<ActionBtn variant="negative">
  Delete Transaction
</ActionBtn>

// With async loading
<ActionBtn 
  variant="primary"
  onClickAsync={async () => {
    await createTransaction(formData);
  }}
>
  Create & Save
</ActionBtn>
```

#### **`NavBtn`** - Navigation Button
**Props**:
```typescript
interface NavBtnProps extends ButtonProps {
  icon?: string;
  router: NextRouter;
  route: string;
}
```

**Features**:
- Active state detection using router pathname
- Icon integration with Iconify
- Responsive design (mobile/desktop layouts)
- Hover and active state animations

**Usage Examples**:
```tsx
import { useRouter } from 'next/router';

const Navigation = () => {
  const router = useRouter();
  
  return (
    <nav>
      <NavBtn
        router={router}
        route="/analytics"
        icon="icon-[mdi--google-analytics]"
      >
        Analytics
      </NavBtn>
      
      <NavBtn
        router={router}
        route="/settings"
        icon="icon-[mdi--cog-outline]"
      >
        Settings
      </NavBtn>
    </nav>
  );
};
```

#### **`SecondaryBtn`** - Secondary Actions
**Props**:
```typescript
interface SecondaryBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "small";
}
```

**Styling**: `bg-indigo-600 bg-opacity-20 text-indigo-300 hover:bg-opacity-40`

#### **`CloseBtn`** - Modal/Overlay Close Button
**Props**:
```typescript
interface CloseBtnProps {
  onClose: () => void;
  isForMobile?: boolean;
  isForDesktop?: boolean;
}
```

**Features**:
- Responsive visibility controls
- Consistent close icon (`icon-[iconamoon--close-fill]`)
- Hover state with color transition
- Standard sizing (h-6 w-6)

#### **`SplitBtn` & `SplitBtnOptions`** - Dropdown Button
**Complex Component**: Button with dropdown options
```tsx
<SplitBtn>
  <span>Main Action</span>
  <SplitBtnOptions>
    <Button onClick={handleOption1}>Option 1</Button>
    <Button onClick={handleOption2}>Option 2</Button>
  </SplitBtnOptions>
</SplitBtn>
```

### 2. Layout Components

#### **`Layout`** (`lib/comp/Layout.tsx`)
**Main application shell with navigation and responsive design.**

**Props**:
```typescript
interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {}
```

**Complex Features**:
1. **User Management**: Automatic user creation with Plaid integration
2. **Transaction Synchronization**: Background data fetching and organization
3. **Responsive Navigation**: Mobile/desktop adaptive navigation
4. **Screen Type Detection**: Dynamic breakpoint detection
5. **Font Loading**: Space Grotesk variable font integration

**Key Functionality**:
```typescript
const Layout = (props) => {
  const { appUser, allUsers } = getAppUser();
  const txArray = useTxGetAll();
  
  // Automatic user creation with Plaid sandbox
  useEffect(() => {
    const createUserWithPlaid = async () => {
      const user = await createUser.mutateAsync();
      const publicToken = await sandboxPublicToken.refetch();
      await setAccessToken.mutateAsync({
        publicToken: publicToken.data,
        id: user.id,
      });
    };

    if (!appUser && !allUsers.isFetching && createUser.isIdle) {
      createUserWithPlaid();
    }
  }, [/* dependencies */]);

  // Transaction organization
  useEffect(() => {
    if (txArray.data) {
      const organized = organizeTxByTime(txArray.data);
      setTxOrganizedByTimeArray(organized);
    }
  }, [txArray.data]);

  // Responsive screen detection
  useEffect(() => {
    const trackScreenType = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenType("mobile");
      else if (width < 768) setScreenType("tablet");
      else setScreenType("desktop");
    };

    window.addEventListener("resize", trackScreenType);
    return () => window.removeEventListener("resize", trackScreenType);
  }, []);
};
```

**Navigation Structure**:
- **Home** (`/`): Transaction overview and account management
- **Analytics** (`/analytics`): Spending analysis and budgeting  
- **Connections** (`/connections`): User connections for expense splitting
- **Settings** (`/settings`): Application preferences
- **Profile** (`/profile`): User profile management

**Responsive Behavior**:
- **Mobile**: Bottom navigation bar, single column layout
- **Tablet**: Adaptive sidebar, mixed layout
- **Desktop**: Fixed sidebar navigation, multi-column layout

### 3. Modal Components

#### **`Modal`** (`lib/comp/Modal.tsx`)
**Base modal component with Framer Motion animations.**

**Props**:
```typescript
interface Props extends React.HTMLAttributes<HTMLDivElement> {}
```

**Animation Configuration**:
```typescript
<motion.div
  initial={{ opacity: 1, scale: 0.5 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.5 }}
  transition={{
    duration: 0.1,
    ease: "linear",
    scale: {
      type: "spring",
      damping: 25,
      stiffness: 250,
      restDelta: 0.01,
    },
  }}
>
  {children}
</motion.div>
```

**Responsive Design**:
- **Mobile**: Full screen modal (`h-full w-full`)
- **Desktop**: Centered modal (`lg:h-4/5 lg:w-4/5 lg:rounded-3xl`)

**Usage Pattern**:
```tsx
import { AnimatePresence } from 'framer-motion';

const ModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      
      <AnimatePresence>
        {isOpen && (
          <Modal className="fixed inset-0 flex items-center justify-center">
            <ModalContent />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};
```

### 4. Form Components

#### **`Input`** (`lib/comp/Input.tsx`)
**Standardized input component with consistent styling.**

**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

**Base Styling**: Inherits all standard input attributes with Tailwind integration.

**Usage Examples**:
```tsx
// Text input
<Input
  type="text"
  placeholder="Transaction name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full"
/>

// Number input with validation
<Input
  type="number"
  step="0.01"
  min="0"
  value={amount}
  onChange={(e) => setAmount(parseFloat(e.target.value))}
/>

// Controlled input with error state
<Input
  value={description}
  onChange={handleDescriptionChange}
  className={`border ${hasError ? 'border-red-400' : 'border-zinc-400'}`}
  aria-invalid={hasError}
/>
```

#### **`DateRangePicker`** (`lib/comp/DateRangePicker.tsx`)
**Date range selection component for transaction filtering.**

**Props**:
```typescript
interface DateRangePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  rangeFormat: "year" | "month" | "date" | "all";
  setRangeFormat: (format: "year" | "month" | "date" | "all") => void;
}
```

**Features**:
- Multiple time range formats (year, month, date, all)
- Date navigation with intuitive controls
- Integration with transaction organization system
- Responsive design for different screen sizes

**Usage Example**:
```tsx
const TransactionFilter = () => {
  const { date, setDate, rangeFormat, setRangeFormat } = useDateRange();

  return (
    <DateRangePicker
      date={date}
      setDate={setDate}
      rangeFormat={rangeFormat}
      setRangeFormat={setRangeFormat}
    />
  );
};
```

### 5. Typography Components

#### **`Heading`** (`lib/comp/Heading.tsx`)
**Standardized heading system with consistent hierarchy.**

**Props**:
```typescript
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}
```

**Heading Styles**:
- **H1**: `text-2xl font-semibold text-zinc-300`
- **H2**: `text-xl font-semibold text-zinc-300`
- **H3**: `text-lg font-medium text-zinc-300`
- **H4**: `text-base font-medium text-zinc-300`
- **H5**: `text-sm font-medium text-zinc-400`
- **H6**: `text-xs font-medium text-zinc-400`

**Export Pattern**:
```typescript
export const H1 = (props) => <Heading level={1} {...props} />;
export const H2 = (props) => <Heading level={2} {...props} />;
export const H3 = (props) => <Heading level={3} {...props} />;
// ... etc
```

**Usage Examples**:
```tsx
import { H1, H2, H3 } from '@/comp/Heading';

<H1 className="mb-4">Transaction History</H1>
<H2>Monthly Summary</H2>
<H3>Recent Transactions</H3>

// Or use base component
<Heading level={1} className="custom-styles">
  Custom Heading
</Heading>
```

### 6. Navigation Components

#### **`LinkBtn`** (`lib/comp/LinkBtn.tsx`)
**Button-styled navigation component with Next.js Link integration.**

**Features**:
- Next.js Link wrapper with button appearance
- External link support
- Loading states for navigation
- Accessibility improvements

**Usage Examples**:
```tsx
// Internal navigation
<LinkBtn href="/transactions" className="bg-blue-500">
  View All Transactions
</LinkBtn>

// External link
<LinkBtn href="https://external-site.com" external>
  External Resource
</LinkBtn>

// With custom styling
<LinkBtn 
  href="/analytics"
  className="w-full bg-indigo-500 hover:bg-indigo-600"
>
  Open Analytics Dashboard
</LinkBtn>
```

### 7. Transaction Components

#### **`DateSortedTxList`** (`lib/comp/DateSortedTxList.tsx`)
**Complex component for displaying transactions organized by date.**

**Props**:
```typescript
interface DateSortedTxListProps {
  YMD: [number, number, number];
  rangeFormat: "year" | "month" | "date" | "all";
  setShowModal: (show: boolean) => void;
  sortedTxArray: TxInDB[][][][]; // [year][month][day][transactions]
}
```

**Features**:
- Hierarchical date organization (year → month → day)
- Virtual scrolling for performance
- Empty state handling
- Modal integration for transaction editing
- Responsive transaction cards

**Complex Rendering Logic**:
```typescript
const DateSortedTxList = ({ sortedTxArray, YMD, rangeFormat, setShowModal }) => {
  const renderTransactionsByTimeframe = () => {
    return sortedTxArray.map((year, yearIndex) =>
      year.map((month, monthIndex) =>
        month.map((day, dayIndex) => (
          <div key={`${yearIndex}-${monthIndex}-${dayIndex}`}>
            <DateHeader date={day[0]?.authorizedDatetime} />
            {day.map((tx, txIndex) => (
              <TxCard
                key={tx.id}
                transaction={tx}
                onClick={() => handleTxClick(tx, [yearIndex, monthIndex, dayIndex, txIndex])}
              />
            ))}
          </div>
        ))
      )
    );
  };

  if (sortedTxArray.flat(3).length === 0) {
    return <EmptyState message="No transactions this month!" />;
  }

  return (
    <div className="transaction-list">
      {renderTransactionsByTimeframe()}
    </div>
  );
};
```

#### **`TxCard`** (`lib/comp/tx/TxCard.tsx`)
**Individual transaction card component.**

**Props**:
```typescript
interface TxCardProps {
  transaction: TxInDB;
  onClick: (transaction: TxInDB) => void;
  showSplitIndicator?: boolean;
}
```

**Features**:
- Merchant logo display (from Plaid data)
- Category color coding
- Split transaction indicators
- Amount formatting with proper negation
- Date formatting with relative time

### 8. Transaction Modal System

#### **`TxModalAndCalculator`** (`lib/comp/tx/TxModalAndCalculator.tsx`)
**Complex modal system for transaction editing with calculator integration.**

**Features**:
- Split transaction calculator
- Real-time amount validation
- Category management
- Receipt attachment
- Expense splitting interface

#### **`TxModal`** (`lib/comp/tx/TxModal/TxModal.tsx`)
**Main transaction editing modal.**

**Key Features**:
```typescript
const TxModal = ({ onClose, onSplitAmountChange }) => {
  const tx = useTxStore((state) => state.txOnModal);
  const resetTx = trpc.tx.reset.useMutation();
  
  // Complex state management
  const focusedIndex = useTxStore((state) => state.focusedSplitIndex);
  const YMD = useTxStore((state) => state.txOnModalIndex);
  
  // Automatic data synchronization
  useEffect(() => {
    if (txOrganizedByTimeArray.length === 0) return;
    if (!YMD) return;
    resetTxOnModal(); // Sync with global state
  }, [txOrganizedByTimeArray, YMD]);

  const onClose = () => {
    resetTxOnModal();
    setSplitAmountDisplayArray([]);
    setFocusedSplitIndex(undefined);
    setIsEditingSplit(false);
  };
};
```

**Sub-Components**:
- **`Cat`**: Category management system
- **`Receipt`**: Receipt attachment and processing
- **`SplitList`**: Expense splitting interface

#### **`Cat` Components** (`lib/comp/tx/TxModal/Cat/`)

**`CatPicker`** - Category Selection Interface:
```typescript
interface CatPickerProps {
  catOptionArray: TreedCat[];
  isVertical: boolean;
  onCatSelect: (category: string[]) => void;
}
```

**`CatChip`** - Individual Category Display:
- Visual category representation
- Color coding by category type
- Amount display and editing
- Remove functionality

**`Cat`** - Main Category Management:
- Multiple category assignment
- Category amount distribution
- Plaid category integration
- Custom category creation

#### **`SplitList` Components** (`lib/comp/tx/TxModal/SplitList/`)

**`SplitList`** - Main Splitting Interface:
```typescript
interface SplitListProps {
  onAmountChange: (index: number, amount: string) => void;
}
```

**`SplitUser`** - Individual Split Entry:
- User selection from connections
- Amount input with validation
- Percentage calculations
- Split removal

**`Calculator`** - Split Amount Calculator:
- Real-time calculations
- Amount distribution
- Validation and error handling

#### **`Receipt`** (`lib/comp/tx/TxModal/Receipt.tsx`)
**AI-powered receipt processing interface.**

**Features**:
- Image upload and processing
- Google Cloud Vision integration
- OpenAI structured parsing
- Receipt item management
- MDS classification (Mandatory/Discretionary/Saving)

### 9. Analytics Components (`lib/comp/analysis/`)

#### **`CatCard`** - Category Analysis Card
**Props**:
```typescript
interface CatCardProps {
  cat: TreedCatWithTx;
  txType: TxType;
  catSettings?: CatSettings;
  showModal: () => void;
}
```

**Features**:
- Category spending visualization
- Budget progress indicators
- Subcategory aggregation
- Modal trigger for detailed view

#### **`CatModal`** - Category Detail Modal
**Complex modal for category management and budget setting.**

**Key Features**:
- Budget setting and updating
- Transaction list for category
- Spending percentage calculations
- Subcategory breakdown

#### **`LineGraph`** - Spending Trends Visualization
**Props**:
```typescript
interface LineGraphProps {
  txType: TxType;
  date: Date;
  rangeFormat: "year" | "month" | "date" | "all";
  YMD: [number, number, number];
}
```

**Implementation**: Uses Recharts for data visualization with responsive design.

#### **`AnalysisBar`** - Category Spending Distribution
**Visual breakdown of spending by categories with proportional bars.**

#### **`SettleModal`** - Group Settlement Interface
**Modal for settling shared expenses between users.**

### 10. Home Page Components (`lib/comp/home/`)

#### **`AccountCard`** - Bank Account Display
**Props**:
```typescript
interface AccountCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}
```

**Features**:
- Account balance display
- Account type indication (checking, savings, etc.)
- Connection status
- Loading state animation

#### **`AccountModal`** - Account Management Modal
**Features**:
- Plaid Link integration
- Account connection flow
- Error handling and retry logic
- Account information display

#### **`CsvUploadPreviewModal`** - CSV Import Interface
**Features**:
- CSV file parsing with Papa Parse
- Transaction preview before import
- Data validation and error display
- Bulk transaction creation

### 11. User Components (`lib/comp/user/`)

#### **`CreateUserBtn`** - User Creation Interface
**Button component for creating new users with automatic Plaid setup.**

## State Management Integration

### Zustand Store Integration

Components integrate with multiple Zustand stores:

#### Global Store (`useStore`)
```typescript
const appUser = useStore((state) => state.appUser);
const setAppUser = useStore((state) => state.setAppUser);
const screenType = useStore((state) => state.screenType);
const datetime = useStore((state) => state.datetime);
```

#### Transaction Store (`useTxStore`)
```typescript
const txOnModal = useTxStore((state) => state.txOnModal);
const setTxOnModal = useTxStore((state) => state.setTxOnModal);
const focusedSplitIndex = useTxStore((state) => state.focusedSplitIndex);
```

#### Local Persistent Store (`useLocalStore`)
```typescript
const userId = useLocalStore((state) => state.userId);
const setUserId = useLocalStore((state) => state.setUserId);
```

### tRPC Integration Patterns

#### Query Pattern
```typescript
const { data, isLoading, error } = trpc.tx.getAll.useQuery(
  { id: userId, date: selectedDate },
  { 
    enabled: !!userId,
    staleTime: 3600000,
    onSuccess: (data) => {
      // Handle successful data fetch
    }
  }
);
```

#### Mutation Pattern
```typescript
const createTx = trpc.tx.create.useMutation({
  onSuccess: async (data) => {
    await queryClient.tx.getAll.invalidate();
    showSuccess("Transaction created!");
  },
  onError: (error) => {
    showError(error.message);
  }
});
```

## Styling Guidelines

### Utility Classes

#### Layout
```css
/* Flexbox patterns */
.flex-col gap-y-3
.flex items-center justify-between
.flex w-full flex-col items-center

/* Grid patterns */
.grid grid-cols-2 gap-4
.grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3

/* Responsive spacing */
.p-2 md:p-4 lg:p-6
.gap-y-2 md:gap-y-4
```

#### Colors
```css
/* Background hierarchy */
bg-zinc-900    /* Primary background */
bg-zinc-800    /* Secondary background */
bg-zinc-700    /* Tertiary background */

/* Text hierarchy */
text-zinc-300  /* Primary text */
text-zinc-400  /* Secondary text */
text-zinc-500  /* Tertiary text */

/* Interactive states */
hover:bg-zinc-800
active:scale-95
disabled:opacity-50
```

#### Animation Classes
```css
/* Transitions */
transition-all duration-150
transition-colors duration-150

/* Loading states */
animate-pulse
animate-spin

/* Interactive animations */
active:scale-95
hover:scale-105
```

### Responsive Design Patterns

#### Breakpoint Usage
```css
/* Mobile-first approach */
.base-mobile-styles
sm:tablet-styles    /* 640px+ */
md:small-desktop    /* 768px+ */
lg:desktop          /* 1024px+ */
xl:large-desktop    /* 1280px+ */
```

#### Common Responsive Patterns
```css
/* Navigation */
.fixed bottom-0 lg:relative lg:inset-auto

/* Modal sizing */
.h-full w-full lg:h-4/5 lg:w-4/5

/* Text sizing */
.text-sm sm:text-base lg:text-lg

/* Layout switching */
.flex-col lg:flex-row
.hidden lg:block
.lg:hidden
```

## Accessibility Standards

### ARIA Implementation
```tsx
// Semantic HTML
<button 
  aria-label="Close modal"
  aria-expanded={isOpen}
  onClick={onClose}
>

// Form accessibility
<input
  aria-invalid={hasError}
  aria-describedby={hasError ? "error-message" : undefined}
/>

// Navigation
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/" aria-current={isActive ? "page" : undefined}>Home</a></li>
  </ul>
</nav>
```

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows logical flow
- Enter and Space key support for custom buttons
- Escape key support for modals

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Live regions for dynamic content

## Testing Strategies

### Component Testing with Cypress
```typescript
// cypress/components/Button.cy.tsx
import { Button } from '@/comp/Button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    cy.mount(<Button>Click me</Button>);
    cy.contains('Click me').should('be.visible');
  });

  it('should show loading state for async operations', () => {
    cy.mount(
      <Button onClickAsync={async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }}>
        Save
      </Button>
    );
    
    cy.contains('Save').click();
    cy.get('[class*="animate-spin"]').should('be.visible');
  });

  it('should handle disabled state', () => {
    cy.mount(<Button disabled>Disabled Button</Button>);
    cy.get('button').should('be.disabled');
  });
});
```

### Integration Testing
```typescript
// cypress/e2e/transaction-flow.cy.ts
describe('Transaction Management Flow', () => {
  it('should create and edit transactions', () => {
    cy.visit('/');
    cy.contains('Add transaction').click();
    
    // Fill transaction form
    cy.get('[data-testid="tx-name"]').type('Test Transaction');
    cy.get('[data-testid="tx-amount"]').type('25.00');
    
    // Select category
    cy.get('[data-testid="category-picker"]').click();
    cy.contains('Food and Drink').click();
    
    // Save transaction
    cy.contains('Save').click();
    
    // Verify creation
    cy.contains('Test Transaction').should('be.visible');
  });
});
```

## Performance Optimization

### Component Optimization
```typescript
// Memoization for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);

  return <div>{processedData}</div>;
});

// Callback optimization
const OptimizedParent = () => {
  const handleClick = useCallback((id) => {
    // Handle click
  }, []);

  return (
    <div>
      {items.map(item => (
        <ExpensiveChild key={item.id} onClick={handleClick} />
      ))}
    </div>
  );
};
```

### Bundle Optimization
- Tree shaking for unused exports
- Dynamic imports for code splitting
- Icon optimization with Iconify
- Image optimization with Next.js

## Development Guidelines

### Component Creation Checklist
1. **TypeScript Interface**: Define comprehensive props interface
2. **Base Props**: Extend appropriate HTML element props
3. **Default Styles**: Include consistent base styling
4. **Responsive Design**: Mobile-first responsive implementation
5. **Accessibility**: ARIA attributes and keyboard support
6. **Error Handling**: Graceful error states and fallbacks
7. **Testing**: Component and integration tests
8. **Documentation**: Usage examples and prop descriptions

### File Organization
```
lib/comp/
├── Button.tsx           # Base components
├── Modal.tsx
├── Layout.tsx
├── home/               # Page-specific components
│   ├── AccountCard.tsx
│   └── AccountModal.tsx
├── tx/                 # Feature-specific components
│   ├── TxCard.tsx
│   └── TxModal/
│       ├── TxModal.tsx
│       ├── Cat/
│       └── SplitList/
└── analysis/           # Analytics components
    ├── CatCard.tsx
    └── LineGraph.tsx
```

This comprehensive component documentation covers all aspects of the Nedon component library, from basic button components to complex transaction management interfaces. Each component is designed with accessibility, performance, and maintainability in mind, following modern React patterns and best practices.