# replit.md

## Overview

This is a full-stack TypeScript web application built with React frontend and Express backend. The project follows a modern monorepo structure with shared code between client and server. It provides a simple item management system with CRUD operations, featuring a clean minimalist UI design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite with HMR support

The frontend follows a component-based architecture with:
- Page components in `client/src/pages/`
- Reusable UI components in `client/src/components/ui/`
- Custom hooks in `client/src/hooks/`
- Shared utilities in `client/src/lib/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful endpoints defined in `shared/routes.ts`
- **Schema Validation**: Zod for runtime type checking

The backend uses a storage pattern abstraction (`server/storage.ts`) that wraps database operations, making it easy to swap implementations if needed.

### Shared Code Structure
- `shared/schema.ts`: Database schema definitions using Drizzle
- `shared/routes.ts`: API route definitions with Zod validation schemas

This approach ensures type safety across the full stack - the same types are used for database operations, API validation, and frontend data fetching.

### Build System
- Development: Vite dev server with Express middleware integration
- Production: esbuild bundles server code, Vite builds client assets
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe SQL query builder and schema management
- **connect-pg-simple**: PostgreSQL session store for Express

### UI Component Library
- **shadcn/ui**: Pre-built accessible components based on Radix UI primitives
- **Radix UI**: Headless UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework

### Key NPM Packages
- `@tanstack/react-query`: Data fetching and caching
- `react-hook-form` + `@hookform/resolvers`: Form handling with Zod validation
- `drizzle-zod`: Generates Zod schemas from Drizzle table definitions
- `framer-motion`: Animation library for React
- `lucide-react`: Icon library

### Development Tools
- `tsx`: TypeScript execution for Node.js
- `drizzle-kit`: Database migration and schema management CLI
- Vite plugins for Replit integration (error overlay, cartographer)