# Requisitos del Proyecto BL Audiovisual

## 📋 Información General

**Nombre del proyecto:** BL Audiovisual  
**Tipo:** Landing page profesional con panel administrativo  
**Idiomas:** Español e Inglés (bilingüe)  
**Estado:** Completado y listo para producción

---

## 🎯 Objetivo del Proyecto

Crear una landing page profesional para BL Audiovisual, una productora audiovisual dedicada a producción de videos y fotografía, que transmita una imagen moderna, premium, creativa y cinematográfica.

---

## 👤 Requisitos del Usuario
- /nuevo Nombre: BL audiovisual

Quiero una landing page profesional para una productora audiovisual dedicada a producción de videos y fotografía.

La web debe transmitir una imagen moderna, premium, creativa y cinematográfica. El objetivo es que se vea visualmente fuerte, elegante y confiable, ideal para mostrar trabajos audiovisuales, captar clientes y facilitar el contacto comercial con transiciones y efectos modernos, auto reproduccion de videos, overlays llamativos, sin usar amarillos muy opacos, tiene que ser mas vibrantes, y stich tiene que generar nuevas images para la página,  también te paso un link de referencias para los efectos https://partizan.com/

Usar la imagen adjunta de Figma como referencia visual principal para entender:
* estilo general
* paleta de colores
* layout
* tipografía o intención visual
* tipo de composición
* jerarquía visual
* secciones que ya estén planteadas

Importante:
* Tomar la referencia de Figma para interpretar el estilo que quiero.
* Si el diseño está incompleto, completar lo faltante manteniendo la misma línea visual.
* No copiar marcas, textos de ejemplo ni assets protegidos.
* GPT Web debe analizar primero la referencia visual adjunta y entender la intención del diseño.
* Luego UI/UX debe revisar también la misma referencia para confirmar colores, estilo, estructura y detalles visuales.

La landing debe incluir como mínimo:
* Header limpio y moderno
* Hero impactante con propuesta de valor clara
* Sección “Quiénes somos” o presentación de la productora
* Sección de servicios
  - Producción audiovisual
  - Fotografía
  - Edición y postproducción
  - Cobertura de eventos / contenido comercial / contenido para marcas (según corresponda)
* Portfolio o trabajos destacados
* Sección de proceso de trabajo
* Sección de clientes o marcas, si aplica
* Testimonios, si aporta valor
* Llamados a la acción claros
* Formulario de contacto
* Botón de WhatsApp
* Footer completo con redes y datos de contacto

Lineamientos visuales:
* Diseño muy visual, con foco en imagen, video y presencia de marca
* Estética cinematográfica / creativa / premium
* Buen uso de espacios, tipografía moderna y composición atractiva

---

## 🔧 Requisitos Técnicos Implementados

### Stack Tecnológico

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| **Runtime** | Node.js | 18+ | Entorno de ejecución JavaScript |
| **Framework** | Next.js | 16.2.9 | Framework React full-stack |
| **UI Library** | React | 19.2.4 | Librería de componentes |
| **Lenguaje** | TypeScript | 5.x | Lenguaje tipado |
| **Estilos** | Tailwind CSS | 4.x | Framework CSS utility-first |
| **Base de datos** | PostgreSQL | 14+ | Base de datos relacional |
| **ORM** | Prisma | 6.10.1 | Object-Relational Mapping |
| **Validación** | Zod | 4.4.3 | Validación de esquemas |
| **Encriptación** | bcryptjs | 3.0.2 | Hash de contraseñas |
| **Linter** | ESLint | 9.x | Análisis de código |

### Infraestructura Necesaria

**Servidor de Desarrollo:**
- CPU: 2 cores mínimo
- RAM: 4GB mínimo, 8GB recomendado
- Disco: 1GB para node_modules + código

**Servidor de Producción:**
- CPU: 2 cores mínimo
- RAM: 2GB mínimo, 4GB recomendado
- Disco: 500MB + espacio para uploads
- Ancho de banda: 100Mbps+

**Base de Datos:**
- PostgreSQL 14+
- Espacio: 100MB inicial, crece según contenido
- Conexiones concurrentes: 10-50

### Software Requerido

**Para Desarrollo:**
```bash
# Obligatorios
- Node.js 18.x o superior
- npm 9.x o superior
- PostgreSQL 14.x o superior
- Git 2.x

# Opcionales
- Docker (para PostgreSQL en contenedor)
- VS Code (editor recomendado)
- PostgreSQL GUI (pgAdmin, DBeaver, etc.)
```

**Para Producción:**
```bash
# Mínimo
- Node.js 20.x LTS
- PostgreSQL 14+
- Nginx (reverse proxy)
- PM2 (gestor de procesos)

# Recomendado
- SSL/TLS (Let's Encrypt)
- Firewall configurado
- Sistema de backups automático
```

---

## 📦 Dependencias del Proyecto

### Dependencias de Producción

```json
{
  "@prisma/client": "^6.10.1",    // Cliente ORM
  "bcryptjs": "^3.0.2",            // Encriptación
  "next": "16.2.9",                // Framework
  "prisma": "^6.10.1",             // CLI de Prisma
  "react": "19.2.4",               // UI Library
  "react-dom": "19.2.4",           // React DOM
  "zod": "^4.4.3"                  // Validación
}
```

### Dependencias de Desarrollo

```json
{
  "@tailwindcss/postcss": "^4",    // PostCSS para Tailwind
  "@types/node": "^20",            // Types de Node.js
  "@types/react": "^19",           // Types de React
  "@types/react-dom": "^19",       // Types de React DOM
  "eslint": "^9",                  // Linter
  "eslint-config-next": "16.2.9",  // Config ESLint Next.js
  "tailwindcss": "^4",             // Framework CSS
  "typescript": "^5"               // TypeScript compiler
}
```

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales

**User** - Usuarios del sistema
```sql
- id: String (CUID)
- name: String
- email: String (UNIQUE)
- passwordHash: String
- role: UserRole (ADMIN, EDITOR)
- status: UserStatus (ACTIVE, INACTIVE)
- lastLoginAt: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime?
- deletedBy: String?
```

**Session** - Sesiones de autenticación
```sql
- id: String (CUID)
- userId: String
- token: String (UNIQUE)
- expiresAt: DateTime
- createdAt: DateTime
- updatedAt: DateTime
```

**Category** - Categorías de proyectos
```sql
- id: String (CUID)
- slug: String (UNIQUE)
- nameEs: String
- nameEn: String
- sortOrder: Int
- status: PublishStatus
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime?
- deletedBy: String?
```

**Project** - Proyectos audiovisuales
```sql
- id: String (CUID)
- slug: String (UNIQUE)
- titleEs: String
- titleEn: String
- descriptionEs: String
- descriptionEn: String
- client: String
- year: Int
- videoProvider: String (default: "youtube")
- videoUrl: String
- posterUrl: String?
- posterAltEs: String?
- posterAltEn: String?
- featured: Boolean
- sortOrder: Int
- status: PublishStatus
- categoryId: String
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime?
- deletedBy: String?
```

**Service** - Servicios ofrecidos
```sql
- id: String (CUID)
- titleEs: String
- titleEn: String
- descriptionEs: String
- descriptionEn: String
- icon: String?
- imageUrl: String?
- sortOrder: Int
- status: PublishStatus
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime?
- deletedBy: String?
```

**ProcessStep** - Pasos del proceso
```sql
- id: String (CUID)
- titleEs: String
- titleEn: String
- descriptionEs: String
- descriptionEn: String
- sortOrder: Int
- status: PublishStatus
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime?
- deletedBy: String?
```

**Client** - Clientes
```sql
- id: String (CUID)
- name: String
- logoUrl: String?
- website: String?
- sortOrder: Int
- status: PublishStatus
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime?
- deletedBy: String?
```

**Testimonial** - Testimonios
```sql
- id: String (CUID)
- author: String
- role: String
- company: String
- quoteEs: String
- quoteEn: String
- photoUrl: String?
- sortOrder: Int
- status: PublishStatus
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime?
- deletedBy: String?
```

**ContactInquiry** - Consultas de contacto
```sql
- id: String (CUID)
- name: String
- email: String
- phone: String?
- company: String?
- service: String
- message: String
- locale: String (default: "es")
- status: InquiryStatus (NEW, REVIEWING, CONTACTED, CLOSED)
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime?
- deletedBy: String?
```

**MediaAsset** - Recursos multimedia
```sql
- id: String (CUID)
- type: MediaType (IMAGE, VIDEO, DOCUMENT)
- origin: MediaOrigin (LOCAL, EXTERNAL)
- url: String
- mimeType: String?
- sizeBytes: Int?
- altEs: String?
- altEn: String?
- active: Boolean
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime?
- deletedBy: String?
```

**SiteSetting** - Configuración general
```sql
- id: String (CUID)
- key: String (UNIQUE)
- valueText: String?
- valueJson: Json?
- category: String
- description: String?
- updatedAt: DateTime
- updatedBy: String?
```

**AuditLog** - Registro de auditoría
```sql
- id: String (CUID)
- userId: String?
- action: String
- resource: String
- resourceId: String?
- changes: Json?
- ipAddress: String?
- userAgent: String?
- createdAt: DateTime
```

### Índices y Optimizaciones

```sql
-- Índices automáticos por @unique
- User.email
- Session.token
- Category.slug
- Project.slug
- SiteSetting.key

-- Relaciones con Foreign Keys
- Session.userId -> User.id
- Project.categoryId -> Category.id
```

---

## 🔐 Requisitos de Seguridad

### Implementados

✅ **Autenticación:**
- Sistema de sesiones con tokens
- Contraseñas hasheadas con bcryptjs (salt rounds: 10)
- Expiración de sesiones configurable (default: 7 días)

✅ **Autorización:**
- Control de acceso basado en roles (RBAC)
- Dos roles: ADMIN (control total) y EDITOR (contenido)
- Protección de rutas administrativas

✅ **Headers de Seguridad:**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy configurado

✅ **Validación:**
- Validación server-side con Zod
- Sanitización de inputs
- Protección contra SQL injection (Prisma ORM)

✅ **Datos:**
- Borrado lógico (soft delete) en todas las entidades
- Auditoría completa de cambios
- No exposición de IDs numéricos (CUIDs)

### Recomendados para Producción

⚠️ **Adicionales:**
- Rate limiting en APIs
- CAPTCHA en formulario de contacto
- Monitoreo de intentos de login fallidos
- 2FA para administradores (opcional)
- WAF (Web Application Firewall)

---

## 📊 Requisitos de Contenido

### Datos Obligatorios para Producción

**Configuración General:**
- Logo de BL Audiovisual (SVG/PNG)
- Datos de contacto reales
- Redes sociales (Instagram, YouTube)
- Número de WhatsApp
- Email de contacto

**Portfolio:**
- Mínimo 3-6 proyectos con videos reales
- Posters/thumbnails de alta calidad
- Descripciones en ES e EN

**Servicios:**
- Descripción de cada servicio
- Iconos o imágenes representativas

**Contenido Institucional:**
- Texto "Quiénes somos"
- Proceso de trabajo
- Clientes (logos)
- Testimonios (opcional)

---

## 🌐 Requisitos de Deployment

### Variables de Entorno Obligatorias

```env
# Base de datos (OBLIGATORIO)
DATABASE_URL="postgresql://..."

# Autenticación (OBLIGATORIO)
JWT_SECRET="secreto-aleatorio-seguro"
NEXTAUTH_SECRET="secreto-aleatorio-seguro"
AUTH_SECRET="secreto-aleatorio-seguro"

# URLs (OBLIGATORIO)
NEXTAUTH_URL="https://tu-dominio.com"
NEXT_PUBLIC_SITE_URL="https://tu-dominio.com"

# Seguridad en producción (OBLIGATORIO)
AUTH_COOKIE_SECURE="true"
```

### Servicios Externos Opcionales

**SMTP (para notificaciones de contacto):**
- SendGrid
- Resend
- AWS SES
- Mailgun

**Storage (para imágenes/videos):**
- AWS S3
- Cloudinary
- Vercel Blob
- DigitalOcean Spaces

**CDN (recomendado):**
- Cloudflare
- Vercel Edge
- AWS CloudFront

---

## ✅ Estado de Implementación

### Completado

✅ Frontend bilingüe (ES/EN)  
✅ Panel administrativo completo  
✅ Sistema de autenticación  
✅ CRUD de todas las entidades  
✅ Portfolio con modal  
✅ Formulario de contacto  
✅ WhatsApp flotante  
✅ SEO optimizado  
✅ Favicon personalizado  
✅ Open Graph y Twitter Cards  
✅ Responsive design  
✅ Headers de seguridad  
✅ Validación server-side  
✅ Auditoría de cambios  
✅ Build de producción funcional  

### Pendiente para Deploy Real

⚠️ Contenido real (videos, imágenes)  
⚠️ Configuración SMTP  
⚠️ Dominio personalizado  
⚠️ SSL/HTTPS  
⚠️ Base de datos en producción  
⚠️ Variables de entorno de producción  

---

## 📖 Documentación Adicional

- **Arquitectura técnica:** [ARQUITECTURA.md](ARQUITECTURA.md)
- **Guía de instalación:** [README.md](README.md)
- **Checklist de producción:** [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
- **Diseño UI/UX:** [design/UIUX_DESIGN.md](design/UIUX_DESIGN.md)
* Responsive real para mobile, tablet y desktop
* Microinteracciones y transiciones suaves, elegantes y modernas
* Si hace falta inspiración para transiciones o efectos, mantener coherencia con el estilo visual visto en la referencia

Objetivo del sitio:
* presentar la productora
* mostrar calidad visual
* generar confianza
* facilitar consultas y contratación

Quiero que primero se entiendan bien los requisitos y la referencia visual, y después que eso se baje correctamente al flujo de UI/UX, desarrollo y validación visual.
- - Si, tiene que tener un admin panel para poder administrar los diferentes tipos de contenido que se pueden subir,  asi también la creación y modificación de usuarios
- pueden estan en YouTube o cualquier otro lugar
- solo dentro de la landing
- para los 2 idiomas
- aun no pero necesito que crees los ejemplos necesarios para todo lo que necesite la página web y sea fiel a la imagen de referencia que te pase
- __auto_continue__
- implementar

## Último resumen del asistente
🎬 Requisitos confirmados

Landing bilingüe en español e inglés.

Diseño cinematográfico, premium, moderno y fiel a la referencia visual enviada.

Videos con reproducción automática silenciosa, overlays, transiciones y efectos inspirados en Partizan, sin copiar su identidad.

Portfolio integrado dentro de la landing, mediante modal o visor, sin páginas individuales.

Videos enlazables desde YouTube, Vimeo u otras fuentes compatibles.

Panel administrativo para gestionar:

Proyectos, videos y fotografías.

Servicios, textos y traducciones.

Clientes, testimonios y estadísticas.

Información de contacto, redes y WhatsApp.

Creación, edición, activación y administración de usuarios.

Contenido inicial completo de demostración, incluyendo textos, proyectos, clientes, testimonios e imágenes nuevas generadas por Stitch.

Responsive real para móvil, tablet y escritorio.

Formularios y llamados a la acción orientados a captar clientes.

🎨 Dirección visual obligatoria

Hero audiovisual de alto impacto.

Fondos oscuros con amarillo vibrante como acento.

Tipografía grande, limpia y editorial.

Portfolio visual, tarjetas cinematográficas y composición con buen uso del espacio.

Imágenes generadas coherentes entre sí, sin marcas ni materiales protegidos.

UI/UX deberá validar fidelidad visual, contraste, animaciones, rendimiento y comportamiento móvil.

✅ Siguiente paso

Ya tengo requisitos suficientes. Voy a pasar esto a revisión técnica automáticamente.

---

La revisión técnica respondió, pero no pude confirmar el resultado.

ARCHITECTURE_READY

Arquitectura técnica

📌 Resumen

Landing bilingüe para BL Audiovisual con experiencia cinematográfica, portfolio audiovisual integrado y panel administrativo completo.

La solución será una aplicación web unificada: sitio público, administración y API dentro del mismo proyecto. La referencia visual adjunta será obligatoria para composición, jerarquía, paleta, fondos, tipografía y atmósfera. Partizan se utilizará únicamente como referencia de interacción audiovisual, incluyendo controles de reproducción, sonido, pantalla completa y navegación entre trabajos.
Partizan

🧩 Módulos principales

Sitio público:
Landing responsive en español e inglés con navegación fluida, hero audiovisual, presentación, servicios, portfolio, proceso de trabajo, clientes, testimonios, contacto, WhatsApp y footer.

Hero cinematográfico:
Video destacado con reproducción automática silenciada, imagen de respaldo, overlay de contraste, propuesta de valor y llamados a la acción.

Portfolio:
Proyectos filtrables por categoría y destacados configurables. Cada trabajo se abrirá dentro de la landing mediante visor o modal, sin páginas individuales.

Reproductor audiovisual:
Compatibilidad controlada con YouTube, Vimeo y enlaces externos admitidos. Incluirá reproducción, pausa, sonido, pantalla completa, proyecto anterior/siguiente y poster de respaldo.

Presentación institucional:
Historia, propuesta de valor, estadísticas y contenido “Quiénes somos”, administrable en ambos idiomas.

Servicios:
Producción audiovisual, fotografía, edición, postproducción, eventos y contenido comercial para marcas.

Proceso de trabajo:
Etapas ordenables como preproducción, rodaje, postproducción y entrega.

Clientes y testimonios:
Logos, nombres, testimonios y orden visual administrables. Las secciones podrán ocultarse mientras no exista contenido real.

Contacto comercial:
Formulario con registro de consultas, validación server-side, protección contra abuso, enlace directo a WhatsApp y notificación por correo cuando SMTP esté configurado.

Panel administrativo:
Disponible en /admin, con login, dashboard y gestión integral del contenido.

Gestión de usuarios:
Creación, edición, activación, desactivación, cambio de rol y restablecimiento controlado de contraseña.

Gestión bilingüe:
Cada contenido administrable tendrá versión en español e inglés, con validación para evitar publicaciones incompletas.

Configuración general:
Logo, identidad visual, datos comerciales, redes sociales, WhatsApp, SEO, textos del footer y medios destacados.

🗂️ Entidades principales

Usuario:
Nombre, email, contraseña hasheada, rol, estado, último acceso y datos de auditoría.

Sesión:
Sesiones seguras del panel administrativo y mecanismos de expiración.

Proyecto audiovisual:
Título bilingüe, slug interno, cliente, categoría, descripción, proveedor de video, URL, poster, galería, año, orden, destacado y estado editorial.

Categoría:
Nombre bilingüe, identificador, orden y estado.

Servicio:
Título, descripción, icono o imagen, orden y traducciones.

📄 Resumen
* Se ocultaron detalles técnicos para no saturar la salida.
* El detalle quedó registrado internamente.

---

🎨 UI/UX completó Gemini Web + agente principal + Pro Max + Stitch.

📄 Archivos:
* design/UIUX_DESIGN.md
* design/UIUX_STYLE_GUIDE.md
* design/UIUX_COMPONENTS.md
* design/UIUX_FLOW.md
* design/UIUX_WIREFRAME.md
* design/STITCH_NOTES.md

✅ Siguiente paso automático:
* Desarrollador implementa respetando el diseño UI/UX.
