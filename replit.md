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

---

## **Configuración Local Completada (1 Nov 2025):**

✅ **Aplicación funcionando en PC local** con PostgreSQL nativo
✅ **Cambio de Neon Serverless a PostgreSQL local** en `server/db.ts`:
  - Cambiado de `@neondatabase/serverless` a `pg` (node-postgres)
  - Cambiado de `drizzle-orm/neon-serverless` a `drizzle-orm/node-postgres`
  - Eliminada dependencia de WebSocket (ws)
✅ **Blockchain configurado con fallback**: `server/blockchain-verifier.ts` maneja ausencia de INFURA_API_KEY gracefully
✅ **Variables de entorno locales**:
  - DATABASE_URL para PostgreSQL local
  - SESSION_SECRET generado aleatoriamente
  - INFURA_API_KEY opcional para funciones blockchain

**Archivos modificados para compatibilidad local:**
- `server/db.ts`: Configuración PostgreSQL nativa sin WebSocket
- `server/index.ts`: Importa `pool` en lugar de `db` para sesiones
- `server/blockchain-verifier.ts`: Provider opcional con manejo de errores
- `package.json`: Agregados `cross-env`, `dotenv`, `pg`, `@types/pg`

**Requisitos para desarrollo local:**
- Node.js 18+
- PostgreSQL 14+
- Archivo `.env` con DATABASE_URL, SESSION_SECRET
- (Opcional) INFURA_API_KEY para funciones blockchain

**Archivos de configuración para PC (4 Nov 2025):**
- `.env.example`: Plantilla con variables de entorno necesarias
- `INSTALACION_PC.md`: Guía completa de instalación paso a paso para PC local
- Configuración lista para descargar ZIP completo y desplegar en PC

---

## **Sistema de Scraping de Noticias (4 Nov 2025):**

✅ **Módulo completo de scraping e importación automática de noticias políticas**
✅ **Gestión de fuentes de noticias** con panel administrativo
✅ **Importación manual con moderación** - noticias scraped van a estado "borrador"

### Arquitectura del Sistema de Scraping

**Tabla NewsSource (`news_sources`):**
- `id` (serial): ID único de fuente
- `nombre` (varchar): Nombre descriptivo de la fuente (ej. "El País - Política")
- `url` (varchar): URL del feed RSS o página HTML a scrapear
- `categoriaDefecto` (newsType enum): Categoría por defecto para noticias importadas
- `activo` (boolean): Si la fuente está activa para scraping
- `fechaCreacion` (timestamp): Cuándo se agregó la fuente

**Servicio de Scraping (`server/scraper.ts`):**
- **Motor:** Cheerio para parsing HTML
- **Estrategia:** Intenta detectar automáticamente estructura de noticias
- **Selectores usados:**
  - Títulos: `article h1, article h2, .article-title, h1, h2`
  - Contenido: `article p, .article-content p, .entry-content p, main p`
- **Procesamiento:**
  1. Descarga HTML de la URL configurada
  2. Extrae títulos y contenidos usando selectores CSS
  3. Limpia y formatea texto (elimina scripts, espacios extra)
  4. Genera metadata: `fuente`, `url original`, `categoría`
- **Manejo de errores:** Devuelve errores descriptivos si falla descarga/parsing

**Endpoints API:**
- `GET /api/news-sources` - Listar todas las fuentes (admin)
- `POST /api/news-sources` - Crear nueva fuente (admin)
- `PATCH /api/news-sources/:id` - Actualizar fuente (admin)
- `DELETE /api/news-sources/:id` - Eliminar fuente (admin)
- `POST /api/scrape/test` - Probar scraping de una URL sin guardar (admin)
- `POST /api/scrape/import` - Importar noticias desde fuente activa (admin)

**Panel Admin de Fuentes (`/admin/fuentes`):**
- Listado de fuentes con nombre, URL, categoría, estado activo/inactivo
- Formulario para agregar/editar fuentes
- Botón "Probar Scraping" para validar antes de importar
- Botón "Importar Ahora" para ejecutar scraping e importar a borradores
- Feedback visual de éxito/errores con toast notifications
- **Tutorial interactivo collapsible** con guía paso a paso para usar el sistema

**Integración con Sistema de Noticias:**
- Noticias scraped se crean con `estado: "borrador"`
- Metadata incluye URL original y nombre de fuente
- Admin debe revisar y publicar manualmente desde AdminNoticias
- Botón en AdminNoticias enlaza a gestión de fuentes

**Flujo de Trabajo:**
1. Admin agrega fuente en `/admin/fuentes` (nombre, URL, categoría)
2. Admin prueba scraping con "Probar Scraping" para validar
3. Admin ejecuta "Importar Ahora" para traer noticias
4. Noticias importadas aparecen como borradores en AdminNoticias
5. Admin revisa, edita si necesario, y publica noticias

**Tecnologías Utilizadas:**
- `cheerio` (v1.x): Parsing HTML y extracción de contenido
- Zod: Validación de schemas de fuentes
- Drizzle ORM: Persistencia de configuración de fuentes

**Limitaciones Actuales:**
- No hay scraping automático programado (cron jobs)
- Importación es manual desde panel admin
- Detección de estructura es básica (no usa IA/ML)
- Sin deduplicación automática de noticias

**Mejoras Futuras Posibles:**
- Cron job para scraping automático cada X horas
- IA/NLP para categorización automática de noticias
- Deduplicación inteligente basada en similitud de títulos
- Soporte para autenticación en feeds protegidos
- Webhooks para notificar nuevas noticias importadas

---

## **Actualizaciones Recientes (4 Nov 2025):**

✅ **Sistema de Logout Implementado:**
- Endpoint `POST /api/logout` creado en backend
- Destruye sesión del servidor con `req.session.destroy()`
- Limpia cookie de sesión `connect.sid`
- Frontend (`Navbar.tsx`) llama endpoint y redirige a `/login`
- Verificación E2E exitosa: rutas protegidas inaccesibles después de logout

✅ **Tutorial Interactivo de Scraping:**
- Card collapsible en `/admin/fuentes` con guía paso a paso
- 4 pasos detallados: Agregar fuente, Probar scraping, Importar, Revisar y publicar
- Secciones de limitaciones y consejos prácticos
- Diseño visual con colores de advertencia y consejos

✅ **Edición de Noticias Scrapeadas:**
- Todos los botones de edición habilitados sin restricciones
- Noticias scrapeadas se pueden editar libremente desde AdminNoticias
- Mantienen referencia a fuente original después de edición

✅ **Panel de Usuarios - Habilitar Administradores:**
- Switch de admin conectado a endpoint `PUT /api/admin/users/:id`
- Backend actualiza campo `isAdmin` correctamente
- Frontend invalida cache y muestra feedback con toast
- **Bug crítico corregido (4 Nov):** Parámetros invertidos en `apiRequest` de AdminUsuarios.tsx y AdminNoticias.tsx
  - Antes: `apiRequest("PUT", url, data)` ❌
  - Ahora: `apiRequest(url, "PUT", data)` ✅
- Verificado con E2E: toggle activa/desactiva `is_admin` en DB y muestra toasts correctamente

