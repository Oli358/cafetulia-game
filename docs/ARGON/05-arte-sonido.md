# Fase 5 — Arte y sonido

**Objetivo:** sustituir los placeholders por el arte y el sonido definitivos.

```text
TAREA: Integra el arte 2.5D y el sonido de Cafetulia.

Contexto: lee 00-contexto.md y docs/ARTE.md.

ARTE
- Tablero 2D fiel a board.json, con arte original estilo papercraft.
- 24 mesas con color, bandera y patrón de país.
- 68 sillas, 28 de ellas compartidas con marca doble.
- 20 plazas de barra con valores y posavasos.
- 28 personajes: 24 invitados (12 países × 2 sexos) + 4 comodines.
- Estilo cómico y caricaturesco, con arte propio, sin copiar assets oficiales.
- Piezas 3D tipo cartón grueso, con volumen suave y sombras.

ANIMACIONES
- Fichas: rebote al sentarse, sorbo de café.
- Sillas: deslizamiento al sentarse.
- Puntuación: fichas que vuelan al marcador.
- Mesa pura: brillo y choque de tazas.
- Barra: posavasos que se ilumina.
- Final: luz baja, velas, recuento.
- 150–300 ms, sin bloquear la interacción, con opción de reducción de movimiento.

SONIDO
- Música lo-fi suave y ambiente de café.
- Efectos: taza, cucharilla, silla, campanilla, fichas, aplausos discretos.
- Tres volúmenes: música, ambiente y efectos. Botón de silencio.
- Música libre de derechos o generada y revisada. Nada con copyright.

RENDIMIENTO
- < 10 MB de carga inicial.
- < 150k triángulos y < 100 draw calls.
- Instancing para sillas, mesas y barra.
- Texturas comprimidas y atlas.
- 60 fps en móvil de gama media.

CRITERIOS DE ACEPTACIÓN
- El estilo coincide con docs/ARTE.md.
- No se usa ningún asset oficial de Café International.
- Rendimiento dentro del presupuesto.
- pnpm build en verde.

AL TERMINAR
- Actualiza docs/SESIONES.md.
- Commit: art: arte 2.5D y sonido.
- Push a main.
```
