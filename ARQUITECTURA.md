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

Sección institucional:
Textos de presentación, estadísticas y contenido bilingüe.

Etapa del proceso:
Nombre, descripción, icono, orden y traducciones.

Cliente:
Nombre, logo, URL opcional, orden y visibilidad.

Testimonio:
Autor, cargo, empresa, contenido bilingüe, fotografía opcional y estado.

Consulta:
Nombre, email, teléfono, empresa, tipo de servicio, mensaje, idioma, estado de seguimiento y fecha.

Recurso multimedia:
Tipo, origen, archivo o URL, MIME, tamaño, dimensiones, texto alternativo, poster y estado.

Configuración:
Datos de contacto, WhatsApp, redes, SEO, logo, idioma predeterminado y ajustes audiovisuales.

Registro de auditoría:
Usuario, acción, entidad afectada, fecha y resumen seguro del cambio.

🔄 Estados y flujos

Contenido:
Borrador, publicado e inactivo.

Consultas:
Nueva, en revisión, contactada y cerrada.

Usuarios:
Activo e inactivo.

Publicación:
El contenido solo será visible públicamente cuando esté publicado, completo y no eliminado.

Borrado:
Todas las entidades de negocio utilizarán borrado lógico mediante estado, fecha y usuario responsable.

🔐 Roles y permisos

Visitante:
Puede navegar, cambiar idioma, reproducir proyectos, enviar consultas y contactar por WhatsApp.

EDITOR:
Puede gestionar proyectos, servicios, medios, clientes, testimonios y traducciones. No puede administrar usuarios ni configuraciones sensibles.

ADMIN:
Control completo del contenido, usuarios, permisos, configuración, consultas y auditoría.

Administrador inicial:
Se creará mediante seed idempotente con credenciales locales generadas durante la preparación del proyecto.

Credenciales de validación:
Se guardarán fuera del repositorio en workspace/runtime/ADMIN_LOCAL_CREDENTIALS.txt y se mostrarán únicamente en la entrega final.

⚙️ Stack técnico recomendado

Frontend:
Next.js con App Router, React, TypeScript y Tailwind CSS para integrar sitio público, experiencia responsive y panel administrativo en una única aplicación mantenible.

Componentes:
Biblioteca accesible de componentes reutilizables, adaptada completamente a la identidad visual del proyecto para evitar una apariencia genérica.

Animaciones:
Motion para transiciones, entradas, overlays y microinteracciones. Las animaciones respetarán prefers-reduced-motion.

Backend:
API interna y acciones de servidor de Next.js, con separación por dominios, validación server-side y autorización centralizada.

Autenticación:
Sesiones seguras mediante Auth.js o solución equivalente compatible con Next.js, contraseñas hasheadas y control RBAC.

Validación:
Esquemas compartidos con Zod para formularios, parámetros, URLs multimedia y operaciones administrativas.

Base de datos:
PostgreSQL obligatorio con Prisma ORM.

Infraestructura PostgreSQL:
Preparación mediante el script oficial del entorno OpenClaw, usando el rol global de agentes y validación real de conexión antes de continuar.

Internacionalización:
Enrutamiento y diccionarios para español e inglés, con persistencia de preferencia y metadatos SEO por idioma.

Imágenes y archivos:
Adaptador de almacenamiento desacoplado. En desarrollo local podrá usar almacenamiento controlado del proyecto; producción deberá admitir almacenamiento de objetos compatible con S3 sin modificar la lógica funcional.

Videos:
Se guardarán URLs y metadatos, no copias de videos externos. Cada proyecto tendrá poster optimizado y proveedor identificado.

Imágenes generadas:
Stitch generará recursos originales coherentes con la referencia visual para el contenido inicial. Todos quedarán reemplazables desde el panel.

Documentación:
Generación obligatoria de documentación técnica en Markdown y PDF.

🖼️ Reglas para archivos y medios

Formatos de imagen permitidos:
JPEG, PNG y WebP; SVG únicamente para recursos confiables y sanitizados.

Validación:
Tipo MIME real, extensión, tamaño, dimensiones y nombre único.

Tamaño recomendado:
Hasta 5 MB por imagen administrativa, con optimización automática para uso web.

Accesibilidad:
Texto alternativo obligatorio para imágenes publicadas.

Eliminación:
Desasociación controlada y borrado lógico del registro multimedia.

Videos externos:
Lista permitida de proveedores, normalización de URL y bloqueo de contenido embebido no autorizado.

Rendimiento:
Posters responsivos, carga diferida, precarga selectiva y limitación de reproducción simultánea.

🎨 Dirección UI/UX obligatoria

Conservar:
Hero de gran impacto, fondo oscuro, composición editorial, tipografía amplia, tarjetas audiovisuales, estadísticas y proceso por etapas.

Paleta:
Negro y verde oliva oscuro como base, blanco para texto y amarillo vibrante como acento. Evitar amarillos apagados.

Interacción:
Overlays expresivos, transiciones cinematográficas, navegación fluida y controles audiovisuales claros.

Responsive:
La experiencia móvil deberá conservar la intención visual sin depender de hover ni reproducir varios videos simultáneamente.

Contenido inicial:
Crear textos, proyectos, clientes, testimonios y recursos demostrativos originales, claramente reemplazables desde administración.

Revisión UI/UX:
Comparación visual obligatoria contra la referencia adjunta antes de aprobar diseño y entrega.

🔎 SEO, rendimiento y accesibilidad

Metadatos bilingües configurables.

Datos estructurados de organización y servicios.

Sitemap y reglas de indexación.

Imágenes optimizadas y carga diferida.

Video principal con poster y estrategia adaptativa.

Navegación por teclado y contraste accesible.

Controles visibles para pausa, sonido y movimiento.

Respeto por ahorro de datos y reducción de movimiento.

Objetivo de evitar desplazamientos visuales y bloqueos por medios pesados.

🛡️ Seguridad

Contraseñas hasheadas con algoritmo seguro.

Cookies de sesión seguras y protegidas.

Autorización server-side en cada operación administrativa.

Rate limiting para login y formulario de contacto.

Validación y sanitización de entradas.

Protección CSRF cuando corresponda.

Auditoría de cambios administrativos.

Secretos únicamente mediante variables de entorno.

Ninguna contraseña, token o URL sensible será versionada ni escrita en logs.

🌱 Seed inicial

Administrador local.

Usuario editor de prueba opcional.

Contenido bilingüe completo de demostración.

Servicios y proceso de trabajo.

Proyectos audiovisuales ficticios.

Clientes y testimonios ficticios identificables como demostración.

Configuración inicial, redes de ejemplo y SEO.

Imágenes originales generadas para la identidad visual definida.

Seed idempotente para evitar duplicados.

🧪 Criterios de QA

Sitio público funcional en español e inglés.

Cambio de idioma consistente.

Hero y reproducción audiovisual funcionando con fallback.

Portfolio, filtros, visor y navegación entre proyectos.

Formulario almacenando consultas correctamente.

WhatsApp y redes configurables.

Login y cierre de sesión.

Permisos diferenciados entre ADMIN y EDITOR.

CRUD completo de contenidos y usuarios.

Carga, reemplazo y desasociación de imágenes.

Borrado lógico validado.

Auditoría administrativa.

Estados vacíos diseñados.

Responsive real en móvil, tablet y escritorio.

Validación visual contra la referencia.

Servicios escuchando correctamente y rutas pública y administrativa sin errores críticos.

PostgreSQL conectado, esquema aplicado y seed ejecutado.

Credenciales y documentación final generadas.

⚠️ Riesgos y recomendaciones

Exceso de videos:
Limitar videos simultáneos, usar posters y activar reproducción según visibilidad.

Autoplay bloqueado:
Iniciar silenciado y mostrar controles claros para activar sonido.

Proveedores externos:
Encapsular cada integración para permitir añadir o reemplazar proveedores sin modificar el portfolio.

Efectos pesados:
Priorizar fluidez, accesibilidad y rendimiento por encima de animaciones decorativas.

Contenido bilingüe incompleto:
Bloquear publicación o aplicar una política explícita de fallback por campo.

Recursos ficticios:
Identificarlos como demostrativos dentro del panel y facilitar su reemplazo.

Dependencia visual:
La referencia debe orientar fielmente el diseño, pero no se copiarán marcas, textos, código ni recursos protegidos.

📌 Decisiones asumidas

Aplicación integrada:
Sitio, administración y API vivirán dentro del mismo proyecto Next.js.

Portfolio sin páginas independientes:
Los trabajos se visualizarán dentro de la landing mediante visor audiovisual.

Dos roles administrativos:
ADMIN para control total y EDITOR para gestión editorial con privilegios limitados.

Videos enlazados:
Se almacenarán URL, proveedor, poster y metadatos, evitando hospedar videos externos innecesariamente.

Consultas persistentes:
Los formularios se guardarán en PostgreSQL aunque el correo no esté configurado.

Contenido editable:
Los textos, traducciones, medios, orden y visibilidad serán administrables sin modificar código.

Producción preparada para almacenamiento externo:
El proveedor final podrá definirse más adelante mediante configuración.

🌐 Variables de entorno necesarias

Conexión PostgreSQL.

Secreto de autenticación y sesiones.

URL pública del sitio.

Credenciales y región del almacenamiento externo, solo en producción si se adopta.

Configuración SMTP, únicamente cuando esté disponible.

Datos iniciales del administrador, usados de forma segura durante el seed.

Configuración opcional de protección contra abuso.

❓ Datos que faltan para implementación

Logo e identidad definitiva:
Se utilizará una versión provisional coherente con la referencia hasta recibir el material real.

Datos de contacto:
WhatsApp, email comercial, ubicación y horarios serán inicialmente demostrativos.

Redes sociales:
Se cargarán enlaces provisionales reemplazables desde administración.

Material audiovisual:
Los proyectos, videos y fotografías iniciales serán ejemplos originales hasta recibir el portfolio real.

Dominio y alojamiento:
Se definirán durante Infra sin bloquear diseño ni desarrollo.

SMTP y almacenamiento de producción:
Permanecerán configurables y no impedirán la implementación local.

✅ Siguiente paso

Avanzar automáticamente a UI/UX para transformar esta arquitectura y la referencia visual en un diseño detallado, responsive y validable antes del desarrollo.