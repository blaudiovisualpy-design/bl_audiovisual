# BL Audiovisual - Workspace

Este es el directorio de trabajo principal con todo el código funcional del proyecto.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar base de datos
npm run db:generate
npm run db:push
npm run db:seed

# Iniciar desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver el sitio público.  
Panel admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📋 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Iniciar producción
- `npm run lint` - ESLint
- `npm run db:generate` - Generar Prisma Client
- `npm run db:push` - Sincronizar schema con BD
- `npm run db:seed` - Poblar base de datos

## 🗂️ Estructura

```
workspace/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── admin/        # Panel administrativo
│   │   ├── api/          # API Routes
│   │   └── ...           # Páginas públicas
│   ├── components/       # Componentes React
│   └── lib/              # Utilidades y helpers
├── prisma/
│   ├── schema.prisma     # Modelos de datos
│   └── seed.mjs          # Seed inicial
├── public/               # Assets estáticos
└── storage/              # Uploads (generado en runtime)
```

## ⚙️ Configuración

1. Copiar `.env.example` a `.env.local`
2. Configurar `DATABASE_URL` con tu PostgreSQL
3. Ejecutar migraciones y seed

## 🔐 Credenciales Admin

Después del seed, verás las credenciales en la consola:
- Email: `admin@bl-audiovisual.local`
- Password: Ver output del comando `npm run db:seed`

## 📖 Más Información

Ver [README principal](../README.md) para documentación completa.
