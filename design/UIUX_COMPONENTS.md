# UI/UX Components - BL Audiovisual

## Header

Header fijo de 5rem con fondo transparente al inicio y `backdrop-blur` oscuro al hacer scroll. En desktop muestra navegacion horizontal; en mobile reduce a boton de menu y panel full-screen.

Estados:
- Default: texto blanco roto.
- Hover: opacidad 1 y subrayado/linea sutil amarilla.
- Active: amarillo vibrante limitado a indicador.

## Hero Media

Contenedor full viewport con video/poster, overlays superior e inferior, badge, H1, bajada y dos CTAs.

Controles esperados:
- Play/pause.
- Mute/unmute.
- Fullscreen.
- Fallback poster si falla video.

## CTA Buttons

Primario: fondo amarillo vibrante, texto negro, radio 8px.

Secundario: fondo transparente, borde blanco tenue, icono play cuando corresponda.

## Portfolio Card

Card audiovisual con poster, overlay gradiente, etiqueta de categoria, titulo, cliente/ano y boton play.

Estados:
- Default: imagen estable, overlay legible.
- Hover desktop: escala `1.02`, overlay mas claro, play amarillo visible.
- Touch/mobile: metadatos siempre visibles sin depender de hover.

## Project Viewer

Modal full-screen dentro de la landing. Carga YouTube/Vimeo/enlace compatible, controles propios, anterior/siguiente y cierre claro.

## Service Item

Bloque compacto con icono lineal amarillo, titulo uppercase y descripcion breve. Debe poder reordenarse desde admin.

## Process Step

Card oliva oscura con icono, numero/etapa, titulo y descripcion. Usar apilado vertical en mobile.

## Contact Form

Campos: nombre, email, tipo de proyecto, mensaje. Validacion visual clara, estados `idle`, `loading`, `success`, `error`.

## Admin Components

- Sidebar persistente.
- DataTable con busqueda, filtros y estados.
- Badges: `Publicado`, `Borrador`, `Inactivo`.
- Formularios bilingues con tabs `ES` y `EN`.
- Upload de medios con preview, alt text obligatorio y estado de reemplazo.
