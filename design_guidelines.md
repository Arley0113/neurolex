# Guía de Diseño: Plataforma Neurolex

## Enfoque de Diseño

**Sistema Base:** Material Design adaptado para aplicaciones cívicas complejas, con influencias de plataformas gubernamentales modernas como GOV.UK y Estonia's e-Estonia para credibilidad institucional.

**Principios Fundamentales:**
- Transparencia visual que refleja transparencia democrática
- Jerarquía clara para navegación en ecosistema complejo
- Accesibilidad como prioridad (WCAG 2.1 AA mínimo)
- Profesionalismo que inspire confianza ciudadana

---

## Tipografía

**Familias de Fuentes:**
- **Principal:** Inter (Google Fonts) - Todas las interfaces, botones, formularios
- **Encabezados:** Poppins SemiBold/Bold (Google Fonts) - Títulos de sección, heroes
- **Datos/Números:** JetBrains Mono (Google Fonts) - Contadores de tokens, estadísticas

**Jerarquía Tipográfica:**
- H1: Poppins Bold, text-4xl md:text-5xl lg:text-6xl
- H2: Poppins SemiBold, text-3xl md:text-4xl
- H3: Poppins SemiBold, text-2xl md:text-3xl
- H4: Inter SemiBold, text-xl md:text-2xl
- Body: Inter Regular, text-base (16px)
- Small: Inter Regular, text-sm
- Tokens/Stats: JetBrains Mono Medium, text-lg

---

## Sistema de Espaciado

**Unidades Tailwind:** Consistencia estricta usando 2, 4, 6, 8, 12, 16, 20, 24
- Padding interno componentes: p-4, p-6, p-8
- Márgenes entre secciones: my-12, my-16, my-20
- Gaps en grids: gap-4, gap-6, gap-8
- Contenedores principales: max-w-7xl mx-auto px-4 md:px-6 lg:px-8

---

## Biblioteca de Componentes

### Navegación Principal
- **Header Superior:** Sticky navbar con logo Neurolex (izquierda), navegación central, iconos de usuario/tokens/notificaciones (derecha)
- Altura: h-16 md:h-20
- Navegación: Enlaces horizontales con hover underline animation
- Mobile: Hamburger menu con slide-in drawer
- **Breadcrumbs:** Siempre visibles en vistas internas para orientación

### Tarjetas (Cards)
**Estilo Base:** Bordes rounded-lg, shadow-md, hover:shadow-lg transition
- **Card Propuesta:** Título, descripción corta, badges (categoría, partido), contador TP/TA, botón "Ver Detalles"
- **Card Noticia:** Imagen thumbnail, titular, fuente, fecha, etiquetas partido
- **Card Token:** Icono token, nombre (TP/TA/TGR), cantidad grande, descripción uso
- **Card Estadística:** Número grande (JetBrains Mono), label descriptivo, icono contextual

### Panel de Usuario (Dashboard)
**Layout:** Grid responsivo con widgets reorganizables
```
Desktop: grid-cols-3 gap-6
Tablet: grid-cols-2 gap-4
Mobile: grid-cols-1 gap-4
```
**Widgets Principales:**
- "Mi Cartera": Tres tarjetas horizontales mostrando TP, TA, TGR con iconos
- "Votaciones Activas": Lista vertical con progress bars de tiempo restante
- "Feed Personalizado": Cards de noticias/propuestas con scroll infinito
- "Mi Karma": Círculo de progreso con nivel actual y puntos al próximo nivel

### Formularios
**Estructura Consistente:**
- Labels: font-medium text-sm, siempre visibles arriba del input
- Inputs: rounded-md, p-3, border-2, focus:ring-2 focus:border-current
- Textarea: min-h-32 para comentarios, min-h-48 para propuestas
- Botones: rounded-md px-6 py-3, font-semibold
- Validación: Mensajes en text-sm debajo del campo con icono

**Formulario Propuesta Ciudadana:**
- Input título: text-xl font-semibold
- Editor WYSIWYG para cuerpo (Quill o TinyMCE)
- Selector categorías (multi-select con chips)
- Preview en tiempo real (columna derecha en desktop)

### Sistema de Votación
**Interfaz de Voto:**
- Opciones como botones grandes (min-h-20) con radio button integrado
- Indicador visual de selección actual
- Botón "Confirmar Voto" destacado, separado
- Modal de confirmación con resumen antes de submitir

**Resultados:**
- Progress bars horizontales para cada opción
- Porcentajes en JetBrains Mono
- Total votos en la parte superior
- Animación de llenado al cargar resultados

### Monedero de Tokens
**Vista Principal:**
- Tres secciones en row (desktop) o stack (mobile)
- Cada token: Icono grande arriba, cantidad central (text-4xl JetBrains Mono), nombre debajo
- Botón "Ver Historial" expandible como accordion
- Transacciones: Tabla con fecha, tipo, cantidad (+/-), descripción

### Sistema de Comentarios
**Estructura Anidada:**
- Nivel 1: sin indent
- Nivel 2-3: ml-8 con border-l-2
- Cada comentario: Avatar (izquierda), contenido (derecha), acciones (abajo)
- Upvote/Downvote: Iconos con contador entre ellos
- Responder: Abre textarea colapsable debajo

### Feed de Noticias
**Dos Vistas:**
1. **Grid View (default):** grid-cols-1 md:grid-cols-2 lg:grid-cols-3
2. **List View:** Tarjetas anchas con imagen izquierda, contenido derecha

**Filtros Laterales (Desktop):**
- Sidebar izquierdo sticky con checkboxes
- Categorías, Partidos, Fechas
- Mobile: Sheet modal desde bottom

---

## Iconografía

**Librería:** Heroicons (via CDN)
- Navegación: outline icons
- Acciones: solid icons para estados activos
- Tokens: Custom SVGs proporcionados en assets

**Tamaños Consistentes:**
- Navegación: w-6 h-6
- Botones: w-5 h-5
- Iconos decorativos: w-8 h-8 o w-12 h-12

---

## Páginas Clave

### Landing Page (Pública)
**Estructura:**
1. **Hero:** h-screen con video de fondo (Neurolex.mp4), título impactante, CTA "Comenzar Ahora", subtítulo explicativo
2. **Tres Pilares:** Grid 3 columnas - Participación, Transparencia, Gobernanza (iconos grandes, títulos, descripciones)
3. **Sistema de Tokens:** Sección explicativa con 3 cards interactivas para TP, TA, TGR
4. **Cómo Funciona:** Timeline vertical (mobile) u horizontal (desktop) con 5 pasos
5. **Testimonios:** Carousel de quotes ciudadanos con avatars
6. **CTA Final:** Fondo destacado, título fuerte, botón grande registro
7. **Footer:** 4 columnas - Enlaces, Redes, Newsletter, Legal

### Dashboard Principal
**Layout:** Sidebar izquierdo (desktop), top tabs (mobile)
**Contenido Central:** Grid de widgets como descrito arriba
**Sidebar Derecho (opcional desktop):** Notificaciones recientes, "Tendencias"

### Página Propuesta Individual
**Layout de Dos Columnas (Desktop):**
- **Columna Izquierda (2/3):** Título, metadata (autor, fecha, categoría), contenido completo, comentarios anidados
- **Columna Derecha (1/3):** Card sticky con estadísticas (apoyos TP/TA), botón "Apoyar", compartir, usuarios destacados que apoyan

### Página de Noticias
**Header:** Título sección, filtros en chip format
**Grid Noticias:** Masonry layout en desktop (grid-cols-3 gap-6)
**Sidebar Filtros:** Sticky en desktop, drawer en mobile

### Página Votación Activa
**Centrada:** max-w-4xl mx-auto
**Secciones Verticales:** Título votación, descripción, opciones (botones grandes), temporizador countdown destacado, botón confirmar

---

## Imágenes

**Hero Landing:** Video de fondo (Neurolex.mp4 o similar de assets) con overlay oscuro semitransparente, botones con backdrop-blur-md
**Noticias:** Thumbnails rectangulares 16:9 ratio, object-cover
**Logos Partidos:** Circular avatars pequeños como badges
**Iconos Tokens:** SVGs personalizados (ia PNG assets) integrados en tarjetas
**Banner E-voting:** Usar en sección explicativa "Cómo Funciona"

---

## Responsive Breakpoints
- Mobile: < 768px (base Tailwind)
- Tablet: 768px - 1024px (md:)
- Desktop: > 1024px (lg:)

**Comportamientos:**
- Sidebar → Top navigation/Drawer
- Grid 3 cols → 2 cols → 1 col
- Sticky sidebars → Full width stacks
- Horizontal tabs → Vertical stacks

---

## Animaciones
**Mínimas y Funcionales:**
- Transiciones de hover: transition-all duration-200
- Carga de resultados votación: Progress bar fill animation
- Aparición cards: fade-in stagger en scroll (usar Intersection Observer)
- Confirmación acciones: Checkmark animation suave
- **NO** parallax, **NO** animaciones complejas que distraigan