# Neurolex - Plataforma de Gobernanza y Participación Cívica

## Overview

Neurolex is a digital democracy platform for civic participation and community governance. It offers e-voting, citizen proposals, political news, polls, and a transparent token-based incentive system. The platform aims to foster informed deliberation and active citizen participation in democratic processes.

The full-stack web platform features a React frontend and Express backend, user authentication, gamification (karma and badges), a three-tier token economy (Participation, Support, and Governance tokens), and blockchain integration via MetaMask.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript
- Vite for building and development
- Wouter for client-side routing
- TanStack Query for server state management

**UI Component System:**
- Shadcn/ui (New York style)
- Radix UI primitives
- Tailwind CSS with custom design tokens
- Class Variance Authority (CVA) for component variants

**Design System:**
- Material Design adapted from GOV.UK and e-Estonia
- Typography: Inter (primary), Poppins (headings), JetBrains Mono (data/numbers)
- Strict spacing system
- Custom CSS variables for theming with light/dark mode
- WCAG 2.1 AA accessibility compliance

**State Management:**
- React Query for server state
- React Hook Form with Zod for form state and validation
- LocalStorage for basic session persistence (userId)
- Context API for component-level state

### Backend Architecture

**Framework & Runtime:**
- Express.js server on Node.js
- TypeScript for type safety
- ESM (ES Modules)

**API Design:**
- RESTful API endpoints under `/api`
- JSON-based request/response, all in Spanish
- Session-based authentication with cookies
- Request logging middleware

**Authentication & Security:**
- Bcrypt for password hashing
- Session-based authentication
- User levels: "basico" and "verificado"
- Admin role with `isAdmin=true` for admin panel access
- Admin middleware for route protection

**Data Validation:**
- Zod schemas for runtime validation, shared between frontend and backend
- Custom validation helper for user-friendly error messages

### Data Storage Architecture

**Database:**
- PostgreSQL as the primary database
- Neon Serverless PostgreSQL for cloud hosting
- WebSocket-based connection

**ORM & Schema Management:**
- Drizzle ORM for type-safe queries
- Schema-first approach with TypeScript type inference
- Drizzle-kit for migration management
- Relational data modeling

**Data Models:**
- **Users:** Authentication, profile, political affinity, karma, gamification level, admin flag.
- **Tokens System:** Three token types (TP, TA, TGR) with balance tracking.
- **Token Transactions:** Full transaction history with details.
- **Content Models:** News articles, citizen proposals, polls.
- **Engagement:** Comments, votes, karma history.
- **Gamification:** Badges and user assignments.
- **Communication:** Contact form submissions.
- **Admin Features:** CRUD for news, proposal moderation, poll creation, user management.

**Key Enumerations:**
- User levels, token types, proposal states, news types, and transaction types defined as PostgreSQL enums.

## External Dependencies

**Core Infrastructure:**
- Neon Serverless PostgreSQL

**Blockchain Integration:**
- MetaMask browser extension via Ethers.js v6
- Web3 hook for wallet connection and account management
- Ethereum provider detection

**UI & Component Libraries:**
- Radix UI component primitives
- Tailwind CSS
- Lucide React for icons
- date-fns for date formatting

**Form & Validation:**
- React Hook Form
- Zod
- @hookform/resolvers for Zod integration

**Development Tools:**
- Replit-specific plugins
- ESBuild for server-side bundling
- PostCSS with Autoprefixer

**Font Resources:**
- Google Fonts (Inter, Poppins, etc.) via CDN

**Session Management:**
- connect-pg-simple for PostgreSQL-backed session storage

**Additional Libraries:**
- cmdk for command palette
- vaul for drawer components
- embla-carousel-react for carousels
- recharts for data visualization
- clsx and tailwind-merge for className utilities
- nanoid for unique ID generation