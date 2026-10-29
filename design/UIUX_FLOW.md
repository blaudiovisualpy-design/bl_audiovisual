# UI/UX Flow - BL Audiovisual

## Flujo Publico Principal

1. El usuario entra a la landing y ve inmediatamente un hero audiovisual con propuesta de valor.
2. Puede reproducir el reel, abrir un proyecto destacado o continuar por scroll.
3. Las estadisticas refuerzan confianza antes del portfolio.
4. El portfolio permite abrir un visor modal sin abandonar la landing.
5. Servicios y proceso explican alcance y metodologia.
6. Clientes/testimonios aportan prueba social demostrativa.
7. Contacto final permite enviar consulta o iniciar WhatsApp.

## Flujo Portfolio

1. Usuario selecciona una tarjeta.
2. Se abre modal full-screen con reproductor.
3. El reproductor inicia silenciado si aplica autoplay.
4. Usuario puede navegar anterior/siguiente.
5. Al cerrar, vuelve al mismo punto de scroll.

## Flujo Mobile

1. Header compacto con menu.
2. Hero mantiene impacto pero apila CTAs.
3. Stats pasan a 2x2 o columna.
4. Portfolio pasa a una columna con overlays permanentes.
5. Videos se activan uno a la vez o solo bajo tap.

## Flujo Admin

1. Admin inicia sesion en `/admin`.
2. Dashboard muestra estado editorial, consultas recientes y contenido pendiente.
3. Editor crea/edita contenido en ES y EN.
4. Al publicar, se validan traducciones obligatorias.
5. Las entidades se desactivan con borrado logico, no eliminacion destructiva.

## Estados Criticos

- Sin portfolio real: mostrar ejemplos demostrativos generados, reemplazables.
- Video externo invalido: mostrar poster y error controlado.
- Consulta enviada: confirmacion visible y registro persistido.
- Reduce motion: desactivar escalas y suavizado no esencial.
