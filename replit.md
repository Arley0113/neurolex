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
- **Content Models:** News articles, citizen proposals, polls, debates (forum system).
- **Engagement:** Comments (supports proposals, news, and debates), votes, karma history.
- **Gamification:** Badges and user assignments.
- **Communication:** Contact form submissions.
- **Admin Features:** CRUD for news, proposal moderation, poll creation, debate management, user management.
- **Forum/Debates:** Community discussion threads with categorization, view tracking, and response counting.

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

## Recent Changes

### October 30, 2025 - Página de Detalle de Propuestas Implementada

**Problema Resuelto:**
- ❌ Al hacer clic en "Ver Detalles" de una propuesta, se redirigía a página 404
- ❌ No existía ruta `/propuestas/:id` registrada en App.tsx
- ❌ No existía componente PropuestaDetalle.tsx

**Implementación:**
- Creada página `client/src/pages/PropuestaDetalle.tsx`:
  - Sigue el patrón de ForoDetalle.tsx para consistencia
  - Usa `useParams` para obtener el ID de la propuesta
  - Carga datos de propuesta con query `["/api/proposals", id]`
  - Carga comentarios con query `["/api/comments/proposal", id]`
  - Muestra título, descripción, categoría, estado, apoyos (TP/TA)
  - Sección de comentarios con formulario para agregar nuevos
  - Botón "Apoyar con 1 TP" con validación de tokens
  - Botón "Donar Tokens de Apoyo" abre modal de donación
  - Botón "Volver a Propuestas" para navegación
- Registrada ruta `/propuestas/:id` en `client/src/App.tsx`
  - Ruta específica colocada antes de `/propuestas` para correcta captura

**Features Implementadas:**
- Navegación completa desde listado de propuestas a página de detalle
- Visualización completa de información de propuesta
- Sistema de comentarios integrado
- Apoyo con tokens desde página de detalle
- Sistema de donación desde página de detalle
- Estados de carga y error manejados correctamente

**Testing:**
- Test e2e completo ejecutado exitosamente
- Verificado: navegación a /propuestas, clic en "Ver Detalles", carga de página de detalle, visualización de título/descripción/badges, sección de comentarios, navegación de regreso

### October 30, 2025 - Sistema de Votación en Sondeos Implementado

**Backend Implementation:**
- Agregado endpoint `GET /api/polls/user/:userId/voted`:
  - Devuelve array de IDs de sondeos en los que el usuario ha votado
  - Usado para marcar hasVoted en el frontend
- Endpoint de votación existente: `POST /api/polls/:pollId/vote`
  - Valida que el usuario no haya votado previamente
  - Otorga 10 TP y 5 puntos de karma por votar
  - Actualiza contador de votos de la opción seleccionada

**Frontend Implementation:**
- `client/src/pages/Sondeos.tsx`: Sistema completo de votación
  - Query para obtener sondeos en los que el usuario ha votado
  - Mutation para registrar votos con invalidación automática de cache
  - Función handleVote que maneja el proceso de votación
  - PollCard recibe props onVote y hasVoted correctamente
  - Lógica de filtrado mejorada: sondeos sin fechaFin se consideran siempre activos
- Corrección de orden de parámetros en apiRequest: `(method, url, data)`

**Features Implementadas:**
- Usuarios pueden votar en sondeos activos
- Sistema de recompensas: 10 TP + 5 karma por voto
- Prevención de votos duplicados
- Badge "Ya has votado" aparece después de votar
- Opciones se deshabilitan automáticamente después de votar
- Contador de votos se actualiza en tiempo real
- Toast de confirmación al votar exitosamente

**Bug Fixes:**
- Corregido: endpoints GET /api/polls devolvían `options` en lugar de `opciones`
- Corregido: PollCard crasheaba si opciones era undefined
- Corregido: orden incorrecto de parámetros en llamada a apiRequest
- Corregido: lógica de filtrado para sondeos sin fechaFin

**Testing:**
- Test e2e completo ejecutado exitosamente
- Verificado: creación de sondeo, votación, actualización de TP/karma, deshabilitación de opciones

### October 30, 2025 - Sistema CRUD Completo para Sondeos

**Backend Implementation:**
- Agregados métodos de edición y eliminación en `server/storage.ts`:
  - `updatePoll(id, data)`: Actualiza un sondeo existente
  - `deletePoll(id)`: Elimina un sondeo
- Endpoints administrativos completos:
  - `POST /api/admin/polls`: Crea sondeo con opciones
  - `PUT /api/admin/polls/:id`: Edita sondeo existente
  - `DELETE /api/admin/polls/:id`: Elimina sondeo
- Conversión automática de fechas: `fechaFin` string → Date o null en backend

**Frontend Implementation:**
- `client/src/pages/AdminSondeos.tsx`: UI completa de administración
  - Botones de editar y eliminar en cada card de sondeo
  - Modal de edición con formulario completo
  - Confirmación antes de eliminar
  - Invalidación correcta del cache de TanStack Query
- Corrección de nombres de campos para alinear con schema DB:
  - `titulo` → `pregunta`
  - `fechaCierre` → `fechaFin`

**Features Implementadas:**
- Edición completa de sondeos desde panel admin
- Eliminación de sondeos con confirmación
- Toasts de éxito/error apropiados
- Actualización automática de la lista tras operaciones CRUD
- Manejo correcto de tipos fecha (string → Date)

**Testing:**
- Test e2e completo ejecutado exitosamente
- Verificado: creación, edición y eliminación de sondeos
- Confirmada correcta invalidación de cache y actualización de UI

### October 29, 2025 - Sistema de Debates/Foro Completado

**Backend Implementation:**
- Agregados métodos CRUD completos en `server/storage.ts`:
  - `getAllDebates()`: Obtiene todos los debates con información del autor
  - `getDebateById(id)`: Obtiene un debate específico
  - `createDebate(data)`: Crea un nuevo debate
  - `updateDebate(id, data)`: Actualiza un debate existente
  - `deleteDebate(id)`: Elimina un debate
  - `incrementDebateViews(id)`: Incrementa el contador de vistas
  - `getCommentsByDebate(debateId)`: Obtiene comentarios de un debate

**API Endpoints:**
- Rutas públicas:
  - `GET /api/debates`: Lista todos los debates
  - `GET /api/debates/:id`: Obtiene detalle y auto-incrementa vistas
  - `GET /api/debates/:id/comments`: Obtiene comentarios del debate
  - `POST /api/debates/:id/comments`: Crea un comentario (con validación Zod)
- Rutas administrativas:
  - `POST /api/admin/debates`: Crea debate
  - `PUT /api/admin/debates/:id`: Edita debate
  - `DELETE /api/admin/debates/:id`: Elimina debate

**Frontend Integration:**
- `client/src/pages/Foro.tsx`: Actualizado para consumir datos del backend usando TanStack Query
- `client/src/pages/ForoDetalle.tsx`: Ya configurado correctamente para consumir API
- `client/src/components/DebateCard.tsx`: Actualizado con tipos correctos (DebateConAutor)

**Features Implementadas:**
- Sistema de karma: +2 puntos por comentar en debates
- Contador automático de respuestas al agregar comentarios
- Contador de vistas que se incrementa al ver un debate
- Soporte para debates destacados
- Categorización de debates (política, economía, social, tecnología, medioambiente, general)
- Integración completa con sistema de comentarios existente

**Testing:**
- Test e2e completo ejecutado exitosamente
- Verificado: creación de debates, visualización en listado, navegación a detalle, creación de comentarios, incremento de contadores, otorgamiento de karma

**Bug Fixes Post-Implementación:**
- Agregado endpoint GET `/api/admin/debates` que faltaba para listar debates en panel admin
- Corregido problema de invalidación de cache en AdminDebates.tsx (queryKey y invalidaciones ahora coinciden)
- Creada página `/foro/nuevo` (ForoNuevo.tsx) para crear debates desde vista pública
- Solo administradores pueden crear debates (validación en backend y frontend con mensajes informativos)