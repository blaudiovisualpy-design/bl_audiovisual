# UI/UX Style Guide - BL Audiovisual

## Paleta

| Rol | Valor | Uso |
| --- | --- | --- |
| Fondo principal | `#0A0C0A` | Body, hero, bandas principales |
| Negro profundo | `#050505` | Capas de mayor contraste |
| Oliva oscuro | `#10130E`, `#171A12` | Superficies, cards, proceso |
| Acento amarillo | `#F0D200`, `#FFE100` | CTA, badges, play state, iconos |
| Texto principal | `#FFFFFF`, `#F5F5F0` | Titulos y acciones |
| Texto secundario | `rgba(255,255,255,.65)` | Bajadas y metadatos |
| Bordes | `rgba(255,255,255,.08)` | Separadores sutiles |

## Tipografia

- Display: sans editorial de alto impacto, uppercase, peso 700-900.
- UI/body: sans limpia de alta legibilidad.
- Labels: uppercase, tamano pequeno, peso 500-600.
- No usar letter-spacing negativo. Mantener tracking sobrio y consistente.

## Layout

- Header: `--header-height: 5rem`.
- Gutter desktop: 16px a 24px.
- Gap de grilla audiovisual: 8px.
- Container maximo recomendado: 1440px para secciones informativas; hero y portfolio pueden ser full width.
- Cards: radio maximo 8px.

## Motion

- Scroll publico: Lenis.
- Easing principal: `cubic-bezier(0.23, 1, 0.32, 1)`.
- Hover cards: `transform 0.6s`, `opacity 0.6s`.
- Overlays/modales: `opacity 0.3s`.
- Usar `will-change: transform, opacity` solo en cards activas o capas animadas.
- Respetar `prefers-reduced-motion`.

## Imagen y Video

- Look de fotograma de pelicula, contraste marcado, grano sutil.
- Nada de logos reconocibles, marcas reales ni texto legible inventado.
- Hero con video silenciado y poster de fallback.
- Portfolio con posters WebP; video solo bajo demanda o por `IntersectionObserver`.

## Accesibilidad

- Contraste AA para texto sobre imagen mediante overlays.
- Foco visible en navegacion, formulario, CTAs y controles de video.
- Controles de pausa, sonido y pantalla completa disponibles.
- WhatsApp flotante con etiqueta accesible.
