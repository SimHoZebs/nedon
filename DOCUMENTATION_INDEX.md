# Nedon - Complete Documentation Index

## 📋 Overview

Nedon is a comprehensive finance tracking application that enables users to manage transactions, categorize expenses, split costs with others, and gain insights into their spending patterns. Built with modern technologies including Next.js, tRPC, Prisma, and integrated with Plaid for banking connections.

**Live Demo**: [https://nedon.vercel.app](https://nedon.vercel.app)

## 🎯 Key Features

- **Transaction Management**: Import and categorize financial transactions
- **AI Receipt Processing**: Automatically extract data from receipt images
- **Expense Splitting**: Share costs with family and roommates
- **Category Budgeting**: Set budgets and track spending by category
- **Banking Integration**: Connect bank accounts via Plaid
- **Analytics Dashboard**: Visualize spending patterns and trends
- **Multi-Category Transactions**: Assign transactions to multiple categories
- **Group Management**: Collaborate with family/roommates on expenses

## 📚 Documentation Structure

### 1. [API Documentation](./API_DOCUMENTATION.md)
**Complete tRPC API Reference**
- All available endpoints and routers
- Request/response schemas
- Authentication requirements
- Usage examples for each endpoint
- Error handling guidelines
- SDK setup and integration

**Key Sections**:
- Main App Router (Plaid integration)
- Transaction Router (tx)
- User Router (user management)
- Category Router (cat)
- Split Router (expense splitting)
- Receipt Router (AI processing)

### 2. [Component Documentation](./COMPONENT_DOCUMENTATION.md)
**React Components Guide**
- Complete component library reference
- Props interfaces and usage examples
- Styling guidelines and patterns
- State management integration
- Animation implementation
- Accessibility features

**Component Categories**:
- Button Components (Button, ActionBtn, NavBtn, etc.)
- Layout Components (Layout, Modal)
- Form Components (Input, DateRangePicker)
- Typography Components (Heading)
- Transaction Components (DateSortedTxList)
- Utility Components

### 3. [Utilities Documentation](./UTILITIES_DOCUMENTATION.md)
**Helper Functions and State Management**
- Zustand store configuration
- Data transformation utilities
- Category management functions
- Transaction processing helpers
- User management utilities
- API integration patterns

**Key Utilities**:
- State Management (Global & Local stores)
- Category Management (hierarchy, calculations)
- Transaction Processing (organization, filtering)
- User Data Processing (security, sanitization)
- tRPC Integration (queries, mutations)

### 4. [Setup and Deployment Guide](./SETUP_AND_DEPLOYMENT.md)
**Complete Environment Setup**
- Development environment configuration
- Database setup and migrations
- Third-party service integration
- Testing framework setup
- Production deployment strategies
- Troubleshooting common issues

**Covered Topics**:
- Prerequisites and dependencies
- Environment configuration
- Plaid, Google Cloud, OpenAI setup
- Docker and database configuration
- Vercel deployment
- Security considerations

## 🚀 Quick Start

### For Developers
```bash
# Clone and setup
git clone <repository-url>
cd nedon
pnpm install

# Setup environment
cp .env.example .env
# Configure your API keys in .env

# Start development
pnpm dev
```

### For API Integration
```typescript
import { trpc } from '@/util/trpc';

// Get user transactions
const { data: transactions } = trpc.tx.getAll.useQuery({
  id: 'user-123',
  date: '2024-01-15'
});

// Create new transaction
const createTx = trpc.tx.create.useMutation();
await createTx.mutateAsync({
  name: 'Grocery Store',
  amount: 45.67,
  userId: 'user-123',
  catArray: [{ nameArray: ['Food', 'Groceries'], amount: 45.67 }]
});
```

### For Component Usage
```tsx
import { ActionBtn } from '@/comp/Button';
import Layout from '@/comp/Layout';

export default function MyPage() {
  return (
    <Layout>
      <ActionBtn
        variant="primary"
        onClickAsync={async () => {
          await handleSaveTransaction();
        }}
      >
        Save Transaction
      </ActionBtn>
    </Layout>
  );
}
```

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: tRPC, Prisma ORM
- **Database**: PostgreSQL (via Supabase)
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Testing**: Cypress, Vitest
- **Deployment**: Vercel
- **Package Manager**: pnpm

### Integration Services
- **Plaid**: Banking and transaction data
- **Google Cloud Vision**: Receipt processing
- **OpenAI**: AI-powered features
- **Supabase**: Database and authentication

### Project Structure
```
nedon/
├── pages/              # Next.js pages and API routes
├── lib/                # Shared components and utilities
├── server/             # tRPC routers and server logic
├── prisma/             # Database schema and migrations
├── cypress/            # Testing files
└── docs/               # Documentation (this folder)
```

## 📖 Documentation Usage Guide

### For New Contributors
1. Start with [Setup and Deployment Guide](./SETUP_AND_DEPLOYMENT.md)
2. Review [Component Documentation](./COMPONENT_DOCUMENTATION.md) for UI patterns
3. Check [Utilities Documentation](./UTILITIES_DOCUMENTATION.md) for helper functions
4. Reference [API Documentation](./API_DOCUMENTATION.md) for backend integration

### For API Consumers
1. Begin with [API Documentation](./API_DOCUMENTATION.md)
2. Review authentication and rate limiting sections
3. Check example implementations
4. Refer to error handling guidelines

### For Frontend Developers
1. Start with [Component Documentation](./COMPONENT_DOCUMENTATION.md)
2. Review styling guidelines and patterns
3. Check [Utilities Documentation](./UTILITIES_DOCUMENTATION.md) for state management
4. Reference accessibility and testing sections

### For DevOps/Deployment
1. Focus on [Setup and Deployment Guide](./SETUP_AND_DEPLOYMENT.md)
2. Review environment configuration sections
3. Check monitoring and security considerations
4. Reference troubleshooting guides

## 🔧 Common Use Cases

### Adding a New Feature
1. **API Changes**: Update tRPC routers (see [API Documentation](./API_DOCUMENTATION.md))
2. **UI Components**: Create/modify components (see [Component Documentation](./COMPONENT_DOCUMENTATION.md))
3. **Data Processing**: Add utilities (see [Utilities Documentation](./UTILITIES_DOCUMENTATION.md))
4. **Database**: Create migrations (see [Setup Guide](./SETUP_AND_DEPLOYMENT.md))

### Debugging Issues
1. Check [Troubleshooting](./SETUP_AND_DEPLOYMENT.md#troubleshooting) section
2. Review error handling in [API Documentation](./API_DOCUMENTATION.md)
3. Check component testing in [Component Documentation](./COMPONENT_DOCUMENTATION.md)
4. Verify environment setup in [Setup Guide](./SETUP_AND_DEPLOYMENT.md)

### Performance Optimization
1. Review API query optimization in [API Documentation](./API_DOCUMENTATION.md)
2. Check component performance patterns in [Component Documentation](./COMPONENT_DOCUMENTATION.md)
3. Review state management best practices in [Utilities Documentation](./UTILITIES_DOCUMENTATION.md)
4. Check deployment optimization in [Setup Guide](./SETUP_AND_DEPLOYMENT.md)

## 🤝 Contributing

### Code Contributions
1. Follow the patterns documented in component and utility guides
2. Add tests for new features (see testing sections)
3. Update documentation for any API or component changes
4. Follow TypeScript best practices outlined in the guides

### Documentation Contributions
1. Keep documentation in sync with code changes
2. Add examples for new features
3. Update troubleshooting sections with common issues
4. Improve clarity and completeness of existing sections

## 📞 Support

### Getting Help
1. **Documentation**: Check this comprehensive documentation first
2. **Issues**: Search existing GitHub issues
3. **Discussions**: Use GitHub Discussions for questions
4. **Bug Reports**: Create detailed issue reports with reproduction steps

### Reporting Issues
When reporting issues, include:
- Clear description of the problem
- Steps to reproduce
- Environment information (OS, Node version, etc.)
- Error logs or screenshots
- Relevant code snippets

## 📋 Changelog and Updates

### Documentation Versioning
- All documentation is kept in sync with the codebase
- Major updates include version notes
- Breaking changes are clearly documented
- Migration guides provided for major updates

### Staying Updated
- Watch the repository for updates
- Check documentation before updating dependencies
- Review changelog for breaking changes
- Test updates in development environment first

---

## 📚 Quick Reference Links

| Topic | Link | Description |
|-------|------|-------------|
| **API Reference** | [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete tRPC API documentation |
| **Components** | [COMPONENT_DOCUMENTATION.md](./COMPONENT_DOCUMENTATION.md) | React component library |
| **Utilities** | [UTILITIES_DOCUMENTATION.md](./UTILITIES_DOCUMENTATION.md) | Helper functions and state management |
| **Setup & Deploy** | [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) | Environment setup and deployment |
| **Live Demo** | [nedon.vercel.app](https://nedon.vercel.app) | Preview build with sandbox data |
| **GitHub** | [Repository](./README.md) | Source code and issues |

---

*This documentation is maintained by the Nedon development team and is updated with each release. For the most current information, always refer to the latest version in the repository.*