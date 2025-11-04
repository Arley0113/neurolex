# 🚀 Instalación de Neurolex en PC Local

## ✅ Requisitos Previos

- **Node.js 18+** instalado
- **PostgreSQL 14+** instalado y corriendo
- **Git** (opcional)

---

## 📦 Pasos de Instalación

### 1️⃣ Descargar y Descomprimir

Descomprime el archivo ZIP en tu carpeta de proyectos:
```
C:\Users\tuUsuario\Desktop\Neurolex\
```

### 2️⃣ Instalar Dependencias

Abre la terminal en la carpeta del proyecto:
```bash
cd C:\Users\tuUsuario\Desktop\Neurolex
npm install
```

### 3️⃣ Configurar Base de Datos PostgreSQL

#### Opción A: Usar tu base de datos existente
Si ya tienes la base de datos `neurolex_db`:
- Usuario: `neurolex_user`
- Contraseña: `Neurolex2024!`
- Base de datos: `neurolex_db`

**Salta al paso 4**.

#### Opción B: Crear nueva base de datos
Abre PostgreSQL (pgAdmin o psql):

```sql
-- Crear usuario
CREATE USER neurolex_user WITH PASSWORD 'Neurolex2024!';

-- Crear base de datos
CREATE DATABASE neurolex_db OWNER neurolex_user;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE neurolex_db TO neurolex_user;
```

### 4️⃣ Configurar Variables de Entorno

Copia el archivo de ejemplo:
```bash
copy .env.example .env
```

Edita `.env` con tus datos:
```env
DATABASE_URL=postgresql://neurolex_user:Neurolex2024!@localhost:5432/neurolex_db
SESSION_SECRET=cambia-esto-por-algo-aleatorio-y-seguro
```

### 5️⃣ Sincronizar Esquema de Base de Datos

**IMPORTANTE:** Si la base de datos ya tiene datos, responde **"No, abort"** cuando pregunte sobre borrar la tabla `session`.

```bash
npm run db:push
```

Si da error, usa:
```bash
npm run db:push -- --force
```

### 6️⃣ Iniciar Aplicación

```bash
npm run dev
```

La aplicación estará disponible en:
```
http://localhost:5000
```

---

## 👤 Usuario Administrador de Prueba

**Email:** scrapadmin@neurolex.com  
**Contraseña:** ScrapAdmin123!

---

## ✅ Verificación Rápida

1. Abre http://localhost:5000
2. Click en "Iniciar Sesión"
3. Usa las credenciales de admin
4. Ve a Panel Admin → Usuarios
5. Prueba activar/desactivar el toggle de administrador
6. Ve a Panel Admin → Fuentes de Noticias
7. Prueba el sistema de scraping

---

## 🐛 Solución de Problemas

### Error: "DATABASE_URL must be set"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que DATABASE_URL está correctamente escrita

### Error: "password authentication failed"
- Verifica usuario/contraseña de PostgreSQL
- Verifica que PostgreSQL está corriendo

### Error: "relation does not exist"
- Ejecuta `npm run db:push -- --force`
- Verifica conexión a base de datos correcta

### Error: "la columna «id» está en la llave primaria"
- **Ignora este error** si tu base de datos ya tiene datos
- Simplemente inicia la app con `npm run dev`

### Puerto 5000 ocupado
Edita `server/index.ts` línea final:
```javascript
server.listen(5000, "0.0.0.0", () => {
  // Cambia 5000 por otro puerto como 3000
});
```

---

## 📝 Funcionalidades Implementadas

✅ Sistema de autenticación con sesiones  
✅ Panel de administración completo  
✅ Gestión de usuarios y roles  
✅ Sistema de tokens (TP, TA, TGR)  
✅ Noticias políticas con scraping automático  
✅ Propuestas ciudadanas  
✅ Sondeos y votaciones  
✅ Foro de debates  
✅ Gamificación con Karma  
✅ Integración MetaMask (opcional)  
✅ Logout funcional  

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Sincronizar base de datos
npm run db:push

# Verificar TypeScript
npm run check

# Producción
npm run build
npm start
```

---

## 📞 Soporte

Si tienes problemas, revisa:
1. PostgreSQL está corriendo
2. Variables en `.env` son correctas
3. Node.js versión 18 o superior
4. Dependencias instaladas con `npm install`

---

**¡Listo! Tu plataforma Neurolex está configurada. 🎉**
