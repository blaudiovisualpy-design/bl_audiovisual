# BL Audiovisual

Landing page profesional bilingüe (ES/EN) para productora audiovisual con panel administrativo completo.

## 🎬 Descripción

Sitio web moderno y cinematográfico diseñado para BL Audiovisual, una productora especializada en producción de videos y fotografía. La plataforma incluye:

- **Landing pública bilingüe** (Español/Inglés)
- **Portfolio audiovisual** con reproductor integrado y modal
- **Panel administrativo** completo con sistema RBAC
- **Gestión de contenido** en ambos idiomas
- **Sistema de contacto** persistente y consultas
- **WhatsApp flotante** para contacto directo
- **SEO optimizado** con Open Graph y Twitter Cards

## 🚀 Stack Tecnológico

### Frontend
- **Framework**: Next.js 16.2.9 (App Router)
- **UI Library**: React 19.2.4
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4
- **Validación**: Zod 4.4.3

### Backend
- **API**: Next.js API Routes + Server Actions
- **Base de datos**: PostgreSQL 14+
- **ORM**: Prisma 6.10.1
- **Autenticación**: Sistema de sesiones con tokens
- **Encriptación**: bcryptjs 3.0.2

### Herramientas
- **Linter**: ESLint 9
- **Package Manager**: npm
- **Build Tool**: Webpack (Next.js)

## 📁 Estructura del Proyecto

```
bl_audiovisual/
├── design/                  # Documentación de diseño UI/UX
├── public/                  # Assets públicos
│   └── assets/             # Imágenes y videos
├── workspace/              # Código funcional
│   ├── src/               # Código fuente
│   │   ├── app/          # Páginas y rutas
│   │   ├── components/   # Componentes React
│   │   └── lib/          # Utilidades
│   ├── prisma/           # Base de datos
│   │   ├── schema.prisma # Modelos
│   │   └── seed.mjs     # Datos iniciales
│   └── public/           # Assets estáticos
├── ARQUITECTURA.md         # Documentación técnica
└── REQUISITOS.md          # Requisitos del proyecto
```

## � Requisitos del Sistema

### Software Necesario

| Herramienta | Versión Mínima | Recomendada | Propósito |
|-------------|----------------|-------------|-----------|
| **Node.js** | 18.x | 20.x LTS | Runtime de JavaScript |
| **npm** | 9.x | 10.x | Gestor de paquetes |
| **PostgreSQL** | 14.x | 17.x | Base de datos |
| **Git** | 2.x | Última | Control de versiones |

### Sistemas Operativos Soportados
- ✅ Windows 10/11
- ✅ macOS 12+
- ✅ Linux (Ubuntu 20.04+, Debian 11+)

---

## 🛠️ Instalación y Configuración

### 1. Prerequisitos

Asegúrate de tener instalado:

```bash
# Verificar Node.js
node --version  # Debe ser v18.0.0 o superior

# Verificar npm
npm --version   # Debe ser v9.0.0 o superior

# Verificar PostgreSQL
psql --version  # Debe ser 14.0 o superior
```

### 2. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd bl_audiovisual/workspace
```

### 3. Instalar Dependencias

```bash
npm install
---

## 🚀 Deployment (Producción)

### Opción 1: Vercel (Recomendado)

**Requisitos:**
- Cuenta en [Vercel](https://vercel.com)
- Base de datos PostgreSQL (Vercel Postgres, Supabase, Railway, etc.)

**Pasos:**

1. **Instalar Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configurar variables de entorno en Vercel Dashboard**
   - `DATABASE_URL` - URL de PostgreSQL
   - `NEXTAUTH_SECRET` - Secreto de autenticación
   - `JWT_SECRET` - Secreto JWT
   - `AUTH_SECRET` - Secreto de auth
   - `NEXTAUTH_URL` - URL de producción (ej: https://tu-dominio.com)
   - `NEXT_PUBLIC_SITE_URL` - URL pública
   - `AUTH_COOKIE_SECURE` - "true"

5. **Configurar base de datos en producción**
   ```bash
   # Desde local, apuntando a DB de producción
   DATABASE_URL="tu_url_produccion" npx prisma db push
   DATABASE_URL="tu_url_produccion" node prisma/seed.mjs
   ```

### Opción 2: Railway

1. Crear cuenta en [Railway](https://railway.app)
2. Crear nuevo proyecto desde GitHub
3. Agregar servicio PostgreSQL
4. Configurar variables de entorno
5. Deploy automático desde main branch

### Opción 3: VPS/Servidor Propio

**Requisitos del servidor:**
- Ubuntu 22.04 LTS (o similar)
- Node.js 20.x
- PostgreSQL 14+
- Nginx (como reverse proxy)
- PM2 (para gestión de procesos)

**Instalación:**

```bash
# 1. Conectar al servidor
ssh usuario@tu-servidor.com

# 2. Instalar dependencias
sudo apt update
sudo apt install -y nodejs npm postgresql nginx

# 3. Instalar PM2
sudo npm install -g pm2

# 4. Clonar repositorio
git clone <url> /var/www/bl_audiovisual
cd /var/www/bl_audiovisual/workspace

# 5. Instalar dependencias del proyecto
npm install

# 6. Configurar .env.local con datos de producción

# 7. Configurar base de datos
npm run db:generate
npm run db:push
npm run db:seed

# 8. Compilar
npm run build

# 9. Iniciar con PM2
pm2 start npm --name "bl-audiovisual" -- start
pm2 save
pm2 startup

# 10. Configurar Nginx (ver ejemplo abajo)
```

**Configuración Nginx:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Opción 4: Docker

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY workspace/package*.json ./
RUN npm ci --only=production

COPY workspace .

RUN npm run db:generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build y run
docker build -t bl-audiovisual .
docker run -p 3000:3000 --env-file .env.local bl-audiovisual
```

---

## 🔧 Mantenimiento

### Actualizar Dependencias

```bash
# Ver paquetes desactualizados
npm outdated

# Actualizar todos (con precaución)
npm update

# Actualizar uno específico
npm install next@latest
```

### Backups de Base de Datos

```bash
# Backup
pg_dump -U bl_admin -d bl_audiovisual > backup_$(date +%Y%m%d).sql

# Restaurar
psql -U bl_admin -d bl_audiovisual < backup_20260812.sql
```

### Logs y Monitoreo

```bash
# Ver logs de PM2
pm2 logs bl-audiovisual

# Monitorear recursos
pm2 monit

# Reiniciar aplicación
pm2 restart bl-audiovisual
```

---

## 🔐 Seguridad en Producción

**Checklist de seguridad:**

- [ ] Cambiar contraseña de admin por defecto
- [ ] Usar HTTPS (SSL/TLS)
- [ ] Configurar `AUTH_COOKIE_SECURE="true"`
- [ ] Secretos aleatorios y únicos para cada entorno
- [ ] Variables de entorno nunca en el código
- [ ] Configurar CORS correctamente
- [ ] Backups automáticos de base de datos
- [ ] Firewall configurado en el servidor
- [ ] PostgreSQL con contraseña fuerte
- [ ] Rate limiting en APIs (opcional)
- [ ] Implementar CAPTCHA en formularios (opcional
- `bcryptjs@3.0.2` - Encriptación de contraseñas
- `zod@4.4.3` - Validación de esquemas
- `tailwindcss@4` - Framework CSS

### 4. Configurar Base de Datos PostgreSQL

#### Opción A: PostgreSQL Local

```bash
# Crear base de datos
psql -U postgres
---

## 🐛 Solución de Problemas

### Error: "DATABASE_URL not found"
```bash
# Verificar que .env.local existe
ls -la .env.local

# Copiar desde ejemplo si no existe
cp .env.example .env.local
```

### Error: "Port 3000 already in use"
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Error: "Prisma Client not generated"
```bash
npm run db:generate
```

### Error: "Cannot connect to PostgreSQL"
```bash
# Verificar que PostgreSQL está corriendo
# Windows
Get-Service postgresql*

# Linux/Mac
sudo systemctl status postgresql

# Verificar conexión
psql -U postgres -h localhost -p 5432
```

### Build falla con error de memoria
```bash
# Aumentar memoria de Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 📞 Soporte

- **Documentación técnica**: [ARQUITECTURA.md](ARQUITECTURA.md)
- **Requisitos del proyecto**: [REQUISITOS.md](REQUISITOS.md)
- **Checklist de producción**: [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
- **Diseño UI/UX**: [design/UIUX_DESIGN.md](design/UIUX_DESIGN.md)

---

CREATE DATABASE bl_audiovisual;
CREATE USER bl_admin WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE bl_audiovisual TO bl_admin;
\q
```

#### Opción B: PostgreSQL en Docker

```bash
docker run --name bl-postgres \
  -e POSTGRES_USER=bl_admin \
  -e POSTGRES_PASSWORD=tu_password_seguro \
  -e POSTGRES_DB=bl_audiovisual \
  -p 5432:5432 \
  -d postgres:17-alpine
```

### 5. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local
```

Editar `.env.local` con tus configuraciones:

```env
# Base de datos
DATABASE_URL="postgresql://bl_admin:tu_password_seguro@localhost:5432/bl_audiovisual"

# Autenticación (generar claves aleatorias)
JWT_SECRET="tu-secreto-jwt-aleatorio-muy-largo"
NEXTAUTH_SECRET="tu-secreto-nextauth-aleatorio-muy-largo"
AUTH_SECRET="tu-secreto-auth-aleatorio-muy-largo"
JWT_EXPIRES_IN="7d"

# URLs del sitio
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXTAUTH_URL_INTERNAL="http://127.0.0.1:3000"

# Orígenes permitidos (CORS)
ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Seguridad (en desarrollo false, en producción true)
AUTH_COOKIE_SECURE="false"

# Directorios
UPLOAD_STORAGE_DIR="./storage/uploads"
```

**💡 Tip:** Para generar secretos seguros:
```bash
# En Linux/Mac
openssl rand -base64 32

# En Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 6. Inicializar Base de Datos

```bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas en la base de datos
npm run db:push

# Poblar con datos iniciales
npm run db:seed
```

**Tablas creadas automáticamente:**
- `User` - Usuarios del sistema
- `Session` - Sesiones de autenticación
- `Category` - Categorías de proyectos
- `Project` - Proyectos audiovisuales
- `Service` - Servicios ofrecidos
- `ProcessStep` - Pasos del proceso de trabajo
- `Client` - Clientes
- `Testimonial` - Testimonios
- `ContactInquiry` - Consultas de contacto
- `MediaAsset` - Recursos multimedia
- `SiteSetting` - Configuración del sitio
- `AuditLog` - Registro de auditoría

### 7. Iniciar Servidor

#### Modo Desarrollo
```bash
npm run dev
```
- Abre en: http://localhost:3000
- Hot reload activado
- Herramientas de desarrollo habilitadas

#### Modo Producción
```bash
# Compilar
npm run build

# Iniciar
npm start
```
- Optimizado y minificado
- Sin herramientas de desarrollo
- Más rápido y eficiente

### 8. Acceder al Sistema

**Sitio Público:**
- Landing: http://localhost:3000
- Trabajos: http://localhost:3000/trabajos
- Servicios: http://localhost:3000/servicios
- Quiénes somos: http://localhost:3000/quienes-somos
- Proceso: http://localhost:3000/proceso
- Clientes: http://localhost:3000/clientes

**Panel Administrativo:**
- Dashboard: http://localhost:3000/admin
- Login: http://localhost:3000/admin/login

**Credenciales por defecto (⚠️ cambiar en producción):**
- Email: `admin@bl-audiovisual.local`
- Password: `change-me-local-admin`

## 🔐 Credenciales Admin

Después del seed, el sistema crea un usuario administrador:

- **Email**: `admin@bl-audiovisual.local`
- **Password**: Generada automáticamente (ver console output del seed)

## 📋 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Iniciar producción
npm run lint         # Linter
npm run db:generate  # Generar Prisma Client
npm run db:push      # Sincronizar schema
npm run db:seed      # Poblar base de datos
```

## 🌐 Rutas Principales

### Público
- `/` - Landing principal
- `/trabajos` - Portfolio completo
- `/servicios` - Servicios ofrecidos
- `/quienes-somos` - Sobre la productora
- `/proceso` - Proceso de trabajo
- `/clientes` - Clientes y testimonios

### Admin
- `/admin` - Dashboard
- `/admin/login` - Inicio de sesión

## 🎨 Diseño

El diseño sigue una estética cinematográfica premium con:
- Paleta oscura (negro `#0A0C0A` + verde oliva)
- Acentos en amarillo vibrante (`#F0D200`)
- Tipografía moderna
- Animaciones sutiles
- Hero con video destacado

Ver documentación completa en `design/UIUX_DESIGN.md`

## 📖 Documentación

- **[ARQUITECTURA.md](ARQUITECTURA.md)** - Arquitectura técnica completa
- **[REQUISITOS.md](REQUISITOS.md)** - Requisitos del proyecto
- **[design/](design/)** - Documentación de diseño UI/UX

## 🔒 Seguridad

- Autenticación basada en sesiones
- Contraseñas hasheadas con bcrypt
- Control de acceso basado en roles (RBAC)
- Validación server-side con Zod
- Protección CSRF
- Borrado lógico de entidades

## 📦 Deployment

El proyecto está optimizado para deployment en:
- **Vercel** (recomendado)
- **Railway**
- **DigitalOcean App Platform**
- Cualquier plataforma compatible con Next.js

## 📄 Licencia

Proyecto privado - BL Audiovisual © 2026
