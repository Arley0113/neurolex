# Neurolex - Plataforma de Gobernanza y Participación Cívica

## Overview

Neurolex is a digital democracy platform designed for civic participation and community governance. It provides a comprehensive ecosystem for e-voting, citizen proposals, political news aggregation, polls, and transparent token-based incentive systems. The platform aims to create an informed deliberation environment where citizens can actively participate in democratic processes.

The application is built as a full-stack web platform with a React frontend and Express backend, featuring user authentication, gamification through karma and badges, a three-tier token economy (Participation, Support, and Governance tokens), and blockchain integration capabilities through MetaMask.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 29, 2025)

### Monedero Integrado (Integrated Wallet)
- **Página de Monedero completa** (`/monedero`): Visualización de saldos TP, TA, TGR con tarjetas grandes
- **Historial de transacciones**: Tabla completa con fecha, tipo de token, cantidad (+/-), tipo de transacción, descripción
- **Integración MetaMask**: Hook `useWeb3` para conectar billetera Web3, detección automática de MetaMask, manejo de conexión/desconexión, persistencia de estado, gestión de errores
- **Backend de transacciones**: Tabla `token_transactions`, rutas API `GET /api/transactions/:userId`
- **Tipos globales**: Definiciones TypeScript para `Window.ethereum` (Ethers.js)

### Rutas API Actualizadas
- Todas las rutas de usuario ahora usan parámetros de URL consistentes:
  - `GET /api/users/me/:userId` (antes era query parameter)
  - `GET /api/tokens/:userId`
  - `GET /api/transactions/:userId`

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Component System:**
- Shadcn/ui component library (New York style variant)
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management

**Design System:**
- Material Design adaptation with influences from GOV.UK and e-Estonia for institutional credibility
- Typography: Inter (primary), Poppins (headings), JetBrains Mono (data/numbers)
- Strict spacing system using Tailwind's 2, 4, 6, 8, 12, 16, 20, 24 units
- Custom CSS variables for theming with light/dark mode support
- WCAG 2.1 AA accessibility compliance as minimum standard

**State Management:**
- React Query for server state (user data, tokens, proposals, news, polls)
- React Hook Form with Zod for form state and validation
- LocalStorage for basic session persistence (userId)
- Context API where needed for component-level state

### Backend Architecture

**Framework & Runtime:**
- Express.js server running on Node.js
- TypeScript for type-safe backend code
- ESM (ES Modules) throughout the codebase

**API Design:**
- RESTful API endpoints under `/api` namespace
- All responses and error messages in Spanish for consistency
- JSON-based request/response format
- Session-based authentication with cookies
- Request logging middleware for API calls

**Authentication & Security:**
- Bcrypt for password hashing (6 rounds)
- Session-based authentication (no explicit session store visible in current implementation)
- User levels: "basico" (basic) and "verificado" (verified)

**Data Validation:**
- Zod schemas for runtime validation
- Shared schema definitions between frontend and backend
- Custom validation helper using zod-validation-error for user-friendly error messages

### Data Storage Architecture

**Database:**
- PostgreSQL as the primary database
- Neon Serverless PostgreSQL for cloud-hosted database
- WebSocket-based connection using `@neondatabase/serverless`

**ORM & Schema Management:**
- Drizzle ORM for type-safe database queries
- Schema-first approach with TypeScript type inference
- Migration management through drizzle-kit
- Relational data modeling with foreign keys and relations

**Data Models:**
- **Users:** Authentication, profile data, political affinity, karma system, gamification level
- **Tokens System:** Three token types (TP - Participation, TA - Support, TGR - Governance) with balance tracking
- **Token Transactions:** Complete transaction history tracking (token type, amount, transaction type, description, related entity ID, timestamp)
- **Content Models:** News articles (with political party relationships), citizen proposals, polls with options and votes
- **Engagement:** Comments, votes, karma history
- **Gamification:** Badges and user badge assignments
- **Communication:** Contact form submissions

**Key Enumerations:**
- User levels, token types, proposal states, news types defined as PostgreSQL enums
- Transaction types: ganado_participacion, ganado_recompensa, comprado, gastado_apoyo, gastado_gobernanza, transferido

### External Dependencies

**Core Infrastructure:**
- Neon Serverless PostgreSQL for database hosting
- WebSocket support for real-time database connections

**Blockchain Integration:**
- MetaMask browser extension integration via Ethers.js v6
- Web3 hook (`useWeb3`) for wallet connection and account management
- Ethereum provider detection through `window.ethereum`

**UI & Component Libraries:**
- Radix UI component primitives (40+ imported components)
- Tailwind CSS for styling
- Lucide React for icons
- date-fns for date formatting and manipulation (Spanish locale support)

**Form & Validation:**
- React Hook Form for form state management
- Zod for schema validation
- @hookform/resolvers for Zod integration

**Development Tools:**
- Replit-specific plugins (cartographer, dev banner, runtime error overlay)
- ESBuild for server-side bundling in production
- PostCSS with Autoprefixer

**Font Resources:**
- Google Fonts: Inter, Poppins, Architects Daughter, DM Sans, Fira Code, Geist Mono (loaded via CDN)

**Session Management:**
- connect-pg-simple for PostgreSQL-backed session storage (imported but not explicitly configured in visible code)

**Additional Libraries:**
- cmdk for command palette functionality
- vaul for drawer components
- embla-carousel-react for carousels
- recharts for data visualization
- clsx and tailwind-merge for className utilities
- nanoid for unique ID generation