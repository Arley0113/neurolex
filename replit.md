# Neurolex - Plataforma de Gobernanza y Participación Cívica

## Overview

Neurolex is a digital democracy platform designed for civic participation and community governance. It offers features such as e-voting, citizen proposals, political news, polls, and a transparent token-based incentive system. The platform aims to foster informed deliberation and active citizen involvement in democratic processes, utilizing a full-stack web application with a React frontend and Express backend, user authentication, gamification, a three-tier token economy, and MetaMask-integrated blockchain functionalities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

-   **Framework & Build:** React 18+ with TypeScript, Vite, Wouter for routing, TanStack Query for server state.
-   **UI & Design:** Shadcn/ui (New York style), Radix UI primitives, Tailwind CSS with custom design tokens, CVA for component variants. Design adapted from GOV.UK and e-Estonia, using Inter, Poppins, and JetBrains Mono fonts. Strict spacing, custom CSS variables for theming (light/dark mode), and WCAG 2.1 AA accessibility compliance.
-   **State Management:** React Query for server state, React Hook Form with Zod for form validation, LocalStorage for basic session persistence, Context API for local state.

### Backend

-   **Framework & Runtime:** Express.js on Node.js, TypeScript, ESM.
-   **API Design:** RESTful API (`/api`), JSON-based, all responses in Spanish. Session-based authentication with cookies.
-   **Authentication & Security:** Bcrypt for password hashing, session-based authentication (PostgreSQL-backed with `express-session` and `connect-pg-simple`), user levels ("basico", "verificado"), admin role (`isAdmin=true`) with dedicated middleware.
-   **Data Validation:** Zod schemas for runtime validation, shared across frontend and backend.

### Data Storage

-   **Database:** PostgreSQL (Neon Serverless PostgreSQL for cloud).
-   **ORM & Schema:** Drizzle ORM for type-safe queries, schema-first approach, Drizzle-kit for migrations, relational data modeling.
-   **Data Models:** Users (auth, profile, karma, gamification, admin), Tokens System (TP, TA, TGR balances), Token Transactions, Content (news, proposals, polls, debates), Engagement (comments, votes, karma history), Gamification (badges), Communication (contact forms), Admin Features (CRUD for content, user management), Forum/Debates (threads, categories, views, responses).
-   **Key Enumerations:** PostgreSQL enums for user levels, token types, proposal states, news types, transaction types.

## External Dependencies

-   **Core Infrastructure:** Neon Serverless PostgreSQL.
-   **Blockchain:** MetaMask via Ethers.js v6, Web3 hook for wallet connection.
-   **UI & Components:** Radix UI, Tailwind CSS, Lucide React (icons), date-fns.
-   **Form & Validation:** React Hook Form, Zod, @hookform/resolvers.
-   **Development Tools:** Replit plugins, ESBuild, PostCSS with Autoprefixer.
-   **Fonts:** Google Fonts (Inter, Poppins).
-   **Session Management:** connect-pg-simple.
-   **Utilities:** cmdk (command palette), vaul (drawers), embla-carousel-react (carousels), recharts (data visualization), clsx, tailwind-merge, nanoid.

**Feedback Post-Architect Review (30 Oct 2025):**

Mejoras de Seguridad Aplicadas:
✅ Agregado app.set('trust proxy', 1) para cookies secure tras proxy
✅ Agregada validación obligatoria de SESSION_SECRET en producción  
✅ Configurado sameSite: 'lax' explícitamente

Estado Actual:
- ✅ Backend core migrado a sesiones (15+ endpoints críticos)
- ✅ Frontend páginas principales migradas (Dashboard, Monedero, Sondeos, comentarios)
- ⚠️ Archivos admin pendientes de migración (AdminNoticias, AdminPropuestas, etc.)
- ⚠️ Archivos de donaciones/compras pendientes (DonateModal, ComprarTokens)
- ⚠️ Rutas de backward compatibility causando errores 401 en logs

Próximos Pasos Críticos:
1. Migrar archivos admin restantes
2. Migrar DonateModal, ComprarTokens  
3. Eliminar rutas backward compatibility backend
4. Implementar interceptor centralizado 401 en queryClient
5. Agregar ruta /api/auth/logout
6. Testing E2E completo

