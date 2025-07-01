# Nedon Component Documentation

## Overview

Nedon's React components are built with TypeScript, Tailwind CSS, and Framer Motion for animations. All components follow modern React patterns with proper TypeScript interfaces and responsive design principles.

## Component Categories

### 1. Button Components (`lib/comp/Button.tsx`)

#### `Button`
Base button component with async support and loading states.

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClickAsync?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void>;
}
```

**Features**:
- Automatic loading state with spinner
- Async click handler support
- Active scale animation
- Disabled state styling

**Usage**:
```tsx
import { Button } from '@/comp/Button';

<Button 
  onClickAsync={async () => {
    await saveTransaction();
  }}
  className="bg-blue-500 text-white"
>
  Save Transaction
</Button>
```

#### `ActionBtn`
Primary action button with predefined styling variants.

**Props**:
```typescript
interface ActionBtnProps extends ButtonProps {
  variant?: "primary" | "negative";
  rounded?: boolean;
}
```

**Usage**:
```tsx
<ActionBtn variant="primary" rounded>
  Create Transaction
</ActionBtn>

<ActionBtn variant="negative">
  Delete Transaction
</ActionBtn>
```

#### `NavBtn`
Navigation button for sidebar navigation.

**Props**:
```typescript
interface NavBtnProps extends ButtonProps {
  icon?: string;
  router: NextRouter;
  route: string;
}
```

**Usage**:
```tsx
import { useRouter } from 'next/router';

const router = useRouter();

<NavBtn
  router={router}
  route="/analytics"
  icon="icon-[mdi--google-analytics]"
>
  Analytics
</NavBtn>
```

#### `SecondaryBtn`
Secondary action button with subtle styling.

**Props**:
```typescript
interface SecondaryBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "small";
}
```

**Usage**:
```tsx
<SecondaryBtn variant="small">
  Edit Category
</SecondaryBtn>
```

#### `CloseBtn`
Standardized close button for modals and overlays.

**Props**:
```typescript
interface CloseBtnProps {
  onClose: () => void;
  isForMobile?: boolean;
  isForDesktop?: boolean;
}
```

**Usage**:
```tsx
<CloseBtn 
  onClose={() => setModalOpen(false)}
  isForDesktop
/>
```

#### `SplitBtn` & `SplitBtnOptions`
Split button with dropdown options.

**Usage**:
```tsx
<SplitBtn>
  <span>Main Action</span>
  <SplitBtnOptions>
    <Button>Option 1</Button>
    <Button>Option 2</Button>
  </SplitBtnOptions>
</SplitBtn>
```

### 2. Layout Components

#### `Layout` (`lib/comp/Layout.tsx`)
Main application layout with navigation and responsive design.

**Props**:
```typescript
interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {}
```

**Features**:
- Responsive navigation (mobile/desktop)
- User creation and Plaid integration
- Transaction data synchronization
- Screen type detection
- Font loading (Space Grotesk)

**Usage**:
```tsx
import Layout from '@/comp/Layout';

export default function Page() {
  return (
    <Layout>
      <div>Your page content</div>
    </Layout>
  );
}
```

**Navigation Items**:
- Home (`/`)
- Analytics (`/analytics`)
- Connections (`/connections`)
- Settings (`/settings`)
- Profile (`/profile`)

### 3. Modal Components

#### `Modal` (`lib/comp/Modal.tsx`)
Base modal component with Framer Motion animations.

**Props**:
```typescript
interface Props extends React.HTMLAttributes<HTMLDivElement> {}
```

**Features**:
- Smooth scale animations
- Responsive sizing
- Auto-close on backdrop click
- Scroll support

**Usage**:
```tsx
import Modal from '@/comp/Modal';
import { AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <Modal className="custom-modal-styles">
      <div>Modal content</div>
    </Modal>
  )}
</AnimatePresence>
```

### 4. Form Components

#### `Input` (`lib/comp/Input.tsx`)
Standardized input component.

**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

**Usage**:
```tsx
import { Input } from '@/comp/Input';

<Input
  type="text"
  placeholder="Transaction name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full"
/>
```

#### `DateRangePicker` (`lib/comp/DateRangePicker.tsx`)
Date range selection component for filtering transactions.

**Features**:
- Start and end date selection
- Custom date range support
- Responsive design

**Usage**:
```tsx
import DateRangePicker from '@/comp/DateRangePicker';

<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onDateChange={(start, end) => {
    setStartDate(start);
    setEndDate(end);
  }}
/>
```

### 5. Typography Components

#### `Heading` (`lib/comp/Heading.tsx`)
Standardized heading component with consistent styling.

**Props**:
```typescript
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}
```

**Usage**:
```tsx
import Heading from '@/comp/Heading';

<Heading level={1} className="mb-4">
  Transaction History
</Heading>

<Heading level={2}>
  Monthly Summary
</Heading>
```

### 6. Link Components

#### `LinkBtn` (`lib/comp/LinkBtn.tsx`)
Button-styled link component for navigation.

**Features**:
- Next.js Link integration
- Button styling with link behavior
- Support for external links

**Usage**:
```tsx
import LinkBtn from '@/comp/LinkBtn';

<LinkBtn href="/transactions" className="bg-blue-500">
  View All Transactions
</LinkBtn>

<LinkBtn href="https://external-site.com" external>
  External Link
</LinkBtn>
```

### 7. Transaction Components

#### `DateSortedTxList` (`lib/comp/DateSortedTxList.tsx`)
Component for displaying transactions organized by date.

**Features**:
- Automatic date grouping
- Responsive transaction cards
- Loading states
- Empty state handling

**Usage**:
```tsx
import DateSortedTxList from '@/comp/DateSortedTxList';

<DateSortedTxList
  transactions={transactions}
  onTransactionClick={(tx) => setSelectedTx(tx)}
  loading={isLoading}
/>
```

### 8. Home Page Components (`lib/comp/home/`)

#### `AccountCard`
Displays bank account information.

**Features**:
- Account balance display
- Account type indication
- Connection status

#### `AccountModal`
Modal for managing bank account connections.

**Features**:
- Plaid Link integration
- Account connection flow
- Error handling

#### `CsvUploadPreviewModal`
Modal for previewing CSV transaction uploads.

**Features**:
- CSV file parsing
- Transaction preview
- Validation and error display

## Component Architecture

### State Management
Components use Zustand for global state management:

```typescript
import { useStore } from '@/util/store';

const MyComponent = () => {
  const datetime = useStore((state) => state.datetime);
  const setDatetime = useStore((state) => state.setDatetime);
  
  return (
    <div>
      Current date: {datetime?.toLocaleDateString()}
    </div>
  );
};
```

### API Integration
Components integrate with tRPC for type-safe API calls:

```typescript
import { trpc } from '@/util/trpc';

const TransactionList = () => {
  const { data: transactions, isLoading } = trpc.tx.getAll.useQuery({
    id: userId,
    date: selectedDate
  });

  const createTx = trpc.tx.create.useMutation();

  const handleCreate = async (txData) => {
    await createTx.mutateAsync(txData);
  };

  // Component render logic
};
```

### Styling Guidelines

#### Tailwind CSS Classes
- Use consistent spacing: `p-2`, `p-4`, `p-6`
- Standard colors: `bg-zinc-900`, `text-zinc-300`, `border-zinc-400`
- Interactive states: `hover:bg-zinc-800`, `active:scale-95`
- Responsive prefixes: `sm:`, `md:`, `lg:`

#### Component Patterns
```tsx
// Standard component structure
const MyComponent = (props: MyComponentProps) => {
  const [loading, setLoading] = useState(false);
  const { className, children, ...rest } = props;

  return (
    <div 
      className={twMerge(
        "base-classes default-styling",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
```

#### Animation Guidelines
Use Framer Motion for smooth animations:

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>
```

### Accessibility
- All interactive elements have proper ARIA labels
- Focus management for modals and forms
- Keyboard navigation support
- Screen reader friendly content

### Testing
Components can be tested using Cypress:

```typescript
// cypress/components/Button.cy.tsx
import { Button } from '@/comp/Button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    cy.mount(<Button>Click me</Button>);
    cy.contains('Click me').should('be.visible');
  });

  it('should show loading state', () => {
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
});
```

## Best Practices

1. **Type Safety**: Always use TypeScript interfaces for props
2. **Composition**: Prefer composition over inheritance
3. **Responsiveness**: Design mobile-first with responsive breakpoints
4. **Performance**: Use React.memo for expensive components
5. **Accessibility**: Include proper ARIA attributes and semantic HTML
6. **Consistency**: Follow established patterns for styling and structure