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

**Migración Completa Realizada:**
✅ Backend: 15+ endpoints usando req.session.userId
✅ Frontend: 26 archivos migrados eliminando localStorage.userId

**Archivos Frontend Migrados:**
- Autenticación: Login.tsx, Register.tsx
- Dashboard: Dashboard.tsx, Monedero.tsx
- Sondeos: Sondeos.tsx
- Comentarios: ForoDetalle.tsx, NoticiaDetalle.tsx, PropuestaDetalle.tsx
- Admin: AdminNoticias.tsx, AdminPropuestas.tsx, AdminDebates.tsx, AdminSondeos.tsx, AdminUsuarios.tsx
- Donaciones/Compras: DonateModal.tsx, ProposalCard.tsx, ComprarTokens.tsx
- Páginas Públicas: Home.tsx, Noticias.tsx, Informacion.tsx, Contacto.tsx, Propuestas.tsx, Admin.tsx, Foro.tsx, ForoNuevo.tsx

**Verificación en Logs:**
✅ Rutas ahora correctas: GET /api/users/me (sin userId en URL)
✅ Rutas ahora correctas: GET /api/tokens (sin userId en URL)
✅ Errores 401 esperados cuando no hay sesión activa

**Últimas Mejoras Aplicadas (30 Oct 2025):**
✅ Implementado manejo de errores 401 en todas las páginas admin usando isError de React Query
✅ AdminNoticias, AdminPropuestas, AdminDebates, AdminSondeos, AdminUsuarios ahora redirigen correctamente al login si la sesión expira
✅ 0 errores LSP en todo el proyecto
✅ Sistema completamente funcional con autenticación basada en sesiones

**Estado Final:**
- ✅ Migración completa a autenticación basada en sesiones (26 archivos frontend)
- ✅ Backend robusto con req.session.userId en todos los endpoints
- ✅ Manejo correcto de sesiones expiradas (401) en toda la aplicación
- ✅ Configuración de seguridad endurecida (trust proxy, SESSION_SECRET, sameSite)
- ✅ Sistema de tokens TP/TA/TGR integrado con sesiones
- ✅ Panel admin completo funcionando con sesiones

**Posibles Mejoras Futuras (Opcionales):**
- Implementar interceptor centralizado 401 en queryClient
- Agregar ruta /api/auth/logout explícita
- Testing E2E completo con playwright
- Eliminar rutas backward compatibility del backend si no se necesitan

