# Neurolex - Plataforma de Gobernanza y Participación Cívica

## Overview

Neurolex is a digital democracy platform designed for civic participation and community governance. It provides a comprehensive ecosystem for e-voting, citizen proposals, political news aggregation, polls, and transparent token-based incentive systems. The platform aims to create an informed deliberation environment where citizens can actively participate in democratic processes.

The application is built as a full-stack web platform with a React frontend and Express backend, featuring user authentication, gamification through karma and badges, a three-tier token economy (Participation, Support, and Governance tokens), and blockchain integration capabilities through MetaMask.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 29, 2025)

### Panel de Administración (Admin Dashboard)
- **Campo isAdmin agregado**: Campo booleano `isAdmin` en tabla `users` para permisos de administrador
- **Dashboard Principal** (`/admin`): Estadísticas generales del sistema (usuarios totales, noticias, propuestas, sondeos, usuarios verificados y admins)
- **Gestión de Noticias** (`/admin/noticias`): CRUD completo con modal de formulario, tabla de noticias, acciones de editar/eliminar
- **Middleware de Admin**: Verificación de permisos en todas las rutas de administrador usando `isAdmin` middleware
- **Rutas API de Admin**:
  - `POST/PUT/DELETE /api/admin/news/:id` - CRUD de noticias (requiere adminId)
  - `PUT /api/admin/proposals/:id/status` - Cambiar estado de propuestas
  - `DELETE /api/admin/proposals/:id` - Eliminar propuestas
  - `POST /api/admin/polls` - Crear sondeos con opciones
  - `GET /api/admin/users` - Listar todos los usuarios
  - `PUT /api/admin/users/:id` - Cambiar nivel o rol de admin
  - `GET /api/admin/stats?adminId={userId}` - Estadísticas generales
- **Protección de rutas**: Solo usuarios con `isAdmin=true` pueden acceder al panel
- **UI de Admin**: Cards de navegación a secciones, mensaje de acceso denegado para no-admins

### Monedero Integrado (Integrated Wallet)
- **Página de Monedero completa** (`/monedero`): Visualización de saldos TP, TA, TGR con tarjetas grandes
- **Historial de transacciones**: Tabla completa con fecha, tipo de token, cantidad (+/-), tipo de transacción, descripción
- **Integración MetaMask**: Hook `useWeb3` para conectar billetera Web3, detección automática de MetaMask, manejo de conexión/desconexión, persistencia de estado, gestión de errores
- **Backend de transacciones**: Tabla `token_transactions`, rutas API `GET /api/transactions/:userId`
- **Tipos globales**: Definiciones TypeScript para `Window.ethereum` (Ethers.js)

### Sistema de Donaciones Descentralizado con Blockchain (Octubre 29, 2025)

**Implementación Completa:**
- **Configuración blockchain** (`shared/blockchain-config.ts`): Sepolia testnet, conversión 1 TA = 0.001 ETH, wallet plataforma
- **Verificación blockchain** (`server/blockchain-verifier.ts`): Verificación on-chain completa usando ethers.js v6
- **Página ComprarTokens** (`/comprar-tokens`): Interfaz para comprar TA con MetaMask, calculadora de conversión, firma criptográfica
- **Sistema de donaciones**: DonateModal para donar a propuestas, botón en cada propuesta, backend procesa donaciones
- **Wallet vinculada**: Campo `walletAddress` en users con unique constraint, vinculación automática al conectar MetaMask

**Seguridad Multicapa Implementada:**

1. **Firma Criptográfica (Capa 1):**
   - Usuario firma mensaje con MetaMask al conectar wallet: "Vincular wallet a Neurolex\nUsuario: {userId}\nWallet: {address}\nFecha: {timestamp}"
   - Backend verifica firma con ethers.verifyMessage
   - Backend valida que mensaje incluya userId correcto
   - Solo el dueño de la wallet puede vincularla (requiere clave privada)

2. **Wallet Vinculada Única (Capa 2):**
   - Constraint UNIQUE en users.walletAddress
   - Una wallet solo puede pertenecer a un usuario
   - Previene múltiples cuentas con misma wallet

3. **Verificación On-Chain Sender (Capa 3):**
   - tx.from debe coincidir con user.walletAddress vinculada
   - Validación en blockchain real usando ethers.JsonRpcProvider
   - Previene uso de txHash de otros usuarios

4. **Unicidad de txHash (Capa 4):**
   - txHash se guarda en tokenTransactions.relacionadoId
   - Previene procesamiento duplicado de misma transacción
   - Verifica que txHash no fue procesado antes

5. **Validación de Monto y Receptor (Capa 5):**
   - tx.to debe ser platformWallet (0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb)
   - tx.value debe coincidir con ethAmount (±0.0001 ETH tolerancia por fees)
   - tx.status debe ser success con al menos 2 confirmaciones

**⚠️⚠️⚠️ ADVERTENCIAS DE SEGURIDAD CRÍTICAS ⚠️⚠️⚠️**

**🔴 LIMITACIÓN CRÍTICA: AUTENTICACIÓN INSEGURA - NO USAR EN PRODUCCIÓN 🔴**

⚠️ **PROBLEMA FUNDAMENTAL:**
- La aplicación usa localStorage.getItem("userId") SIN autenticación real (JWT/sesiones)
- TODOS los endpoints confían ciegamente en el userId recibido del cliente
- NO hay manera de verificar que el usuario autenticado sea realmente quien dice ser

⚠️ **VECTOR DE ATAQUE PRINCIPAL:**
Un atacante puede:
1. Manipular localStorage.setItem("userId", "ID_DE_VICTIMA")
2. Firmar un mensaje con SU PROPIA wallet que incluya "Usuario: ID_DE_VICTIMA"
3. Enviar firma válida al backend vinculando SU wallet a la cuenta de la víctima
4. Realizar compras en nombre de la víctima
5. Gastar tokens de la víctima
6. Desviar fondos

⚠️ **POR QUÉ LAS "MITIGACIONES" NO SON SUFICIENTES:**
1. ✅ Firma criptográfica: Sí previene vincular wallets **ajenas** (sin clave privada de la wallet)
2. ❌ Validación de userId en mensaje: NO previene nada porque el atacante PUEDE crear un mensaje nuevo con userId de víctima y firmarlo con su wallet
3. ✅ Verificación blockchain: Sí previene usar txHash de otros (valida tx.from)
4. ❌ Constraint UNIQUE: NO previene nada porque el atacante puede sobrescribir la wallet vinculada

⚠️ **ESCENARIOS DE ATAQUE EXITOSOS:**
1. **XSS Attack:** Script malicioso lee userId de localStorage, crea firma falsa, secuestra cuenta
2. **Browser Extension:** Extensión maliciosa puede leer/escribir localStorage de cualquier sitio
3. **Shared Computer:** Otro usuario puede abrir DevTools y cambiar localStorage
4. **Man-in-the-Middle:** Intercepta requests y cambia userId en parámetros (sin HTTPS estricto)
5. **Client Tampering:** Cualquiera puede modificar el código JS del cliente y enviar requests directos

⚠️ **LO QUE SÍ ESTÁ PROTEGIDO:**
✅ Usar txHash de transacción de otro usuario (verificación blockchain real)
✅ Falsificar transacciones blockchain (validación on-chain)
✅ Double spending de misma transacción (unicidad de txHash)
✅ Manipular montos enviados (validación estricta de tx.value)

⚠️ **LO QUE NO ESTÁ PROTEGIDO:**
❌ Secuestro de cuenta (cambiar userId en localStorage)
❌ Vinculación maliciosa de wallet a cuenta ajena
❌ Compras no autorizadas en nombre de otro usuario
❌ Gasto de tokens de otro usuario
❌ Session hijacking
❌ CSRF attacks
❌ Privilege escalation

⚠️ **SOLUCIÓN RECOMENDADA PARA PRODUCCIÓN:**
1. Implementar autenticación JWT o sesiones robustas con cookies httpOnly
2. Middleware de autenticación que derive userId del token/sesión autenticado
3. Rechazar cualquier userId en parámetros/body, usar solo el userId autenticado
4. Implementar rate limiting y monitoreo de actividad sospechosa
5. Agregar 2FA para operaciones sensibles (vincular wallet, comprar tokens grandes)
6. Auditoría de seguridad profesional antes de producción

⚠️ **VECTORES DE ATAQUE BLOQUEADOS:**
✅ Replay attack directo (txHash de otro usuario)
✅ Vincular wallet ajena sin clave privada
✅ Double spending (txHash único)
✅ Amount manipulation (validación estricta)
✅ Wrong recipient (valida platformWallet)

⚠️ **VECTORES DE ATAQUE RESIDUALES:**
❌ Secuestro de cuenta si atacante tiene acceso a localStorage
❌ Session hijacking (sin cookies httpOnly/seguras)
❌ CSRF (sin tokens CSRF)

**IMPORTANTE:** Este sistema es adecuado para desarrollo y demostración, pero **NO está listo para producción** sin implementar autenticación robusta.

### Rutas API Actualizadas
- Todas las rutas de usuario ahora usan parámetros de URL consistentes:
  - `GET /api/users/me/:userId` (antes era query parameter)
  - `GET /api/tokens/:userId`
  - `GET /api/transactions/:userId`
  - `POST /api/users/:userId/link-wallet` (vincula wallet con firma criptográfica)
  - `POST /api/tokens/purchase` (compra tokens con verificación blockchain multicapa)

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
- Admin role: Users with `isAdmin=true` have access to admin panel
- Admin middleware: Validates adminId parameter in all admin routes

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
- **Users:** Authentication, profile data, political affinity, karma system, gamification level, admin flag (`isAdmin`)
- **Tokens System:** Three token types (TP - Participation, TA - Support, TGR - Governance) with balance tracking
- **Token Transactions:** Complete transaction history tracking (token type, amount, transaction type, description, related entity ID, timestamp)
- **Content Models:** News articles (with political party relationships), citizen proposals, polls with options and votes
- **Engagement:** Comments, votes, karma history
- **Gamification:** Badges and user badge assignments
- **Communication:** Contact form submissions
- **Admin Features:** Full CRUD on news, proposal moderation, poll creation, user management

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