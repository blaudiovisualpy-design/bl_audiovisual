<!-- OPENCLAW_URL_REFERENCE_PRIORITY_BEGIN -->
# OpenClaw — Prioridad UI/UX obligatoria

Este proyecto posee una URL Reference validada.

Jerarquía obligatoria:

1. Requisitos y correcciones explícitas del usuario.
2. `runtime/URL_REFERENCE_UIUX_BRIEF.md` validado.
3. Arquitectura técnica del proyecto.
4. UIUX Pro Max únicamente como apoyo estructural, de accesibilidad y componentes.

Reglas:

- La URL Reference validada manda sobre estilos genéricos sugeridos por UIUX Pro Max.
- Ignorar cualquier color, estética, tipografía, patrón o motion de UIUX Pro Max que contradiga el brief.
- No mezclar estilos incompatibles.
- No copiar marcas, textos, imágenes, videos ni assets protegidos.
- Replicar intención visual, composición, comportamiento, tokens y motion confirmado.
- Si existe una contradicción no resoluble, detener el flujo y usar Codex como fallback.

Easing confirmado:
- ease
- cubic-bezier(0.23, 1, 0.32, 1)
- cubic-bezier(0.4, 0, 0.2, 1)

Duraciones confirmadas:
- 0.6s
- 0.3s

Efectos confirmados:
- Transición Cinematográfica de Tarjetas de Video
- Suavizado de Scroll Nativo Integrado
- Menú Desplegable Regional de Red
<!-- OPENCLAW_URL_REFERENCE_PRIORITY_END -->
## Design System: bl_audiovisual

### Pattern
- **Name:** Video-First Hero
- **Conversion Focus:** 86% higher engagement with video. Add captions for accessibility. Compress video for performance.
- **CTA Placement:** Overlay on video (center/bottom) + Bottom section
- **Color Strategy:** Dark overlay 60% on video. Brand accent for CTA. White text on dark.
- **Sections:** 1. Hero with video background, 2. Key features overlay, 3. Benefits section, 4. CTA

### Style
- **Name:** Hero-Centric Design
- **Mode Support:** Light ✓ Full | Dark ✓ Full
- **Keywords:** Large hero section, compelling headline, high-contrast CTA, product showcase, value proposition, hero image/video, dramatic visual
- **Best For:** SaaS landing pages, product launches, service landing pages, B2B platforms, tech companies
- **Performance:** ⚡ Good | **Accessibility:** ✓ WCAG AA

### Colors
| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#18181B` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#3F3F46` | `--color-secondary` |
| Accent/CTA | `#2563EB` | `--color-accent` |
| Background | `#FAFAFA` | `--color-background` |
| Foreground | `#09090B` | `--color-foreground` |
| Muted | `#E8ECF0` | `--color-muted` |
| Border | `#E4E4E7` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#18181B` | `--color-ring` |

*Notes: Monochrome + blue accent*

### Typography
- **Heading:** Archivo
- **Body:** Space Grotesk
- **Mood:** minimal, portfolio, designer, creative, clean, artistic
- **Best For:** Design portfolios, creative professionals, minimalist brands
- **Google Fonts:** https://fonts.google.com/share?selection.family=Archivo:wght@300;400;500;600;700|Space+Grotesk:wght@300;400;500;600;700
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
```

### Key Effects
Smooth scroll reveal, fade-in animations on hero, subtle background parallax, CTA glow/pulse effect

### Avoid (Anti-patterns)
- Flat design without depth
- Text-heavy pages

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

