# Nedon Setup and Deployment Guide

## Overview

Nedon is a modern finance tracking application built with Next.js, tRPC, Prisma, and integrates with Plaid for banking connections. This guide covers complete setup from development to production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Third-party Integrations](#third-party-integrations)
6. [Development Workflow](#development-workflow)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js**: Version 18+ (recommended: 20+)
- **pnpm**: Version 8+ (package manager)
- **Docker**: For local database
- **Git**: For version control

### Required Accounts
- **Plaid**: For banking integrations
- **Supabase**: For database and authentication
- **Google Cloud**: For Vision API (receipt processing)
- **OpenAI**: For AI features
- **Vercel**: For deployment (recommended)

## Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nedon
```

### 2. Install Dependencies
```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm --version
node --version
```

### 3. Setup Environment Variables
Create environment files:

```bash
# Development environment
cp .env.example .env

# Production environment (if needed)
cp .env.example .env.prod
```

## Environment Configuration

### Development Environment (`.env`)

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/nedon"

# Plaid Configuration (Sandbox)
PLAID_CLIENT_ID="your_plaid_client_id"
PLAID_SECRET="your_plaid_sandbox_secret"
PLAID_ENV="sandbox"
PLAID_PRODUCTS="transactions,auth,identity"
PLAID_COUNTRY_CODES="US,CA"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Google Cloud Vision API
GOOGLE_CLOUD_PROJECT_ID="your_project_id"
GOOGLE_CLOUD_PRIVATE_KEY="your_private_key"
GOOGLE_CLOUD_CLIENT_EMAIL="your_client_email"

# OpenAI Configuration
OPENAI_API_KEY="your_openai_api_key"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Production Environment (`.env.prod`)

```env
# Database Configuration
DATABASE_URL="your_production_database_url"

# Plaid Configuration (Production)
PLAID_CLIENT_ID="your_plaid_client_id"
PLAID_SECRET="your_plaid_production_secret"
PLAID_ENV="production"
PLAID_PRODUCTS="transactions,auth,identity"
PLAID_COUNTRY_CODES="US,CA"

# Production URLs
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Other production configurations...
```

## Database Setup

### Local Development with Docker

1. **Start PostgreSQL container**:
```bash
# Start database
pnpm run db-up

# Verify database is running
docker ps
```

2. **Setup Prisma**:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (if seed file exists)
npx prisma db seed
```

3. **Access database**:
```bash
# Connect to PostgreSQL
pnpm run db-it

# Or use Prisma Studio
npx prisma studio
```

### Production Database Setup

For production, configure your database URL in the environment variables. Recommended providers:
- **Supabase**: Managed PostgreSQL with additional features
- **PlanetScale**: MySQL-compatible with branching
- **Railway**: Simple PostgreSQL hosting
- **Neon**: Serverless PostgreSQL

## Third-party Integrations

### Plaid Setup

1. **Create Plaid Account**:
   - Visit [Plaid Dashboard](https://dashboard.plaid.com)
   - Create a new application
   - Get your `CLIENT_ID` and `SECRET`

2. **Configure Plaid Environment**:
```typescript
// server/util/index.ts
export const PLAID_PRODUCTS = [
  Products.Transactions,
  Products.Auth,
  Products.Identity,
];

export const PLAID_COUNTRY_CODES = [
  CountryCode.Us,
  CountryCode.Ca,
];
```

3. **Test Plaid Integration**:
   - Use sandbox credentials for development
   - Test with provided sandbox accounts
   - Implement Link flow in your application

### Google Cloud Vision Setup

1. **Create Google Cloud Project**:
   - Enable Vision API
   - Create service account
   - Download credentials JSON

2. **Configure Credentials**:
```bash
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/credentials.json"
```

3. **Test Vision API**:
```javascript
// Test receipt processing
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();
```

### OpenAI Setup

1. **Get API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com)
   - Create API key
   - Set usage limits

2. **Configure Client**:
```typescript
// server/openaiClient.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

## Development Workflow

### Available Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm test                   # Run tests

# Database
pnpm db-up                  # Start database container
pnpm db-down                # Stop database container
pnpm db-it                  # Connect to database

# Code Quality
pnpm format                 # Format code with Prettier + Biome
pnpm biome                  # Run Biome linter
pnpm tsc                    # TypeScript type checking

# Production
pnpm vercel-build          # Build for Vercel deployment
pnpm migrate-prod          # Run production migrations
pnpm reset-prod            # Reset production database
```

### Development Server

```bash
# Start with database
pnpm dev

# The application will be available at:
# http://localhost:3000
```

### File Structure
```
nedon/
├── pages/                 # Next.js pages
│   ├── api/              # API routes
│   ├── _app.tsx          # App component
│   └── index.tsx         # Home page
├── lib/                  # Shared libraries
│   ├── comp/             # React components
│   ├── util/             # Utility functions
│   └── types/            # TypeScript types
├── server/               # Server-side code
│   ├── routers/          # tRPC routers
│   └── util/             # Server utilities
├── prisma/               # Database schema
├── public/               # Static assets
├── styles/               # Global styles
└── test/                 # Test files
```

## Testing

### Component Testing with Cypress

1. **Setup Cypress**:
```bash
# Install Cypress
pnpm install --save-dev cypress

# Open Cypress
npx cypress open
```

2. **Run Component Tests**:
```bash
# Run all component tests
npx cypress run --component

# Run specific test
npx cypress run --component --spec "cypress/components/Button.cy.tsx"
```

3. **Example Component Test**:
```typescript
// cypress/components/Button.cy.tsx
import { Button } from '@/comp/Button';

describe('Button Component', () => {
  it('should render correctly', () => {
    cy.mount(<Button>Test Button</Button>);
    cy.contains('Test Button').should('be.visible');
  });

  it('should handle async clicks', () => {
    let clicked = false;
    cy.mount(
      <Button onClickAsync={async () => {
        clicked = true;
      }}>
        Async Button
      </Button>
    );
    
    cy.contains('Async Button').click();
    cy.get('[class*="animate-spin"]').should('be.visible');
  });
});
```

### Unit Testing with Vitest

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

## Production Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   - Import project in Vercel dashboard
   - Connect your Git repository
   - Configure build settings

2. **Environment Variables**:
   Set all production environment variables in Vercel dashboard:
   ```
   DATABASE_URL
   PLAID_CLIENT_ID
   PLAID_SECRET
   PLAID_ENV=production
   # ... other env vars
   ```

3. **Build Configuration**:
   The project includes a custom build command for Vercel:
   ```json
   {
     "scripts": {
       "vercel-build": "prisma generate && prisma migrate deploy && next build"
     }
   }
   ```

4. **Deploy**:
   ```bash
   # Deploy to production
   vercel --prod

   # Deploy preview
   vercel
   ```

### Manual Deployment

1. **Build Application**:
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
pnpm build
```

2. **Start Production Server**:
```bash
pnpm start
```

### Docker Deployment

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

2. **Build and Run**:
```bash
# Build Docker image
docker build -t nedon .

# Run container
docker run -p 3000:3000 --env-file .env.prod nedon
```

## Database Migrations

### Development Migrations
```bash
# Create new migration
npx prisma migrate dev --name add_new_feature

# Reset database
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Production Migrations
```bash
# Deploy migrations to production
pnpm migrate-prod

# Reset production database (DANGEROUS)
pnpm reset-prod
```

## Monitoring and Logging

### Application Monitoring
- Use Vercel Analytics for basic metrics
- Integrate Sentry for error tracking
- Set up custom logging for important events

### Database Monitoring
- Monitor query performance
- Set up alerts for connection issues
- Regular backup verification

## Security Considerations

### Environment Variables
- Never commit `.env` files
- Use Vercel's environment variable encryption
- Rotate API keys regularly

### Database Security
- Use connection pooling
- Implement proper indexes
- Regular security updates

### API Security
- Rate limiting on API routes
- Input validation on all endpoints
- Proper error handling without exposing internals

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
```bash
# Check if database is running
docker ps

# Restart database
pnpm db-down && pnpm db-up

# Check connection string
echo $DATABASE_URL
```

2. **Prisma Issues**:
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database schema
npx prisma db push --force-reset
```

3. **Build Failures**:
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
pnpm install
```

4. **Type Errors**:
```bash
# Run TypeScript check
pnpm tsc

# Check for missing types
pnpm install @types/node @types/react
```

### Performance Issues

1. **Slow Queries**:
   - Check database indexes
   - Optimize tRPC queries
   - Use pagination for large datasets

2. **Large Bundle Size**:
   - Analyze bundle with `@next/bundle-analyzer`
   - Implement code splitting
   - Optimize imports

### Debug Mode

Enable debug logging:
```bash
# Set debug environment
DEBUG=trpc:* pnpm dev

# Or for specific modules
DEBUG=prisma:* pnpm dev
```

## Support and Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Plaid Documentation](https://plaid.com/docs)

### Community
- Create issues for bugs or feature requests
- Check existing issues before creating new ones
- Follow the contribution guidelines

### Getting Help
1. Check this documentation first
2. Search existing issues
3. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Environment information
   - Error logs or screenshots