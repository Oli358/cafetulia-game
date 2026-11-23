# Sistema de interfaz — Cafetulia v10

Contrato visual para no volver al aspecto de “plantilla generada”. Se aplica primero a la portada y sirve de guía para lobby, partida y final.

## Principios

1. **La escena es la interfaz.** La barra, la mesa y los objetos físicos tienen prioridad sobre paneles y tarjetas.
2. **Un objeto, una idea.** El menú de la portada es una carta física; no una rejilla de tarjetas.
3. **Una sola firma por pantalla.** En la portada: el barista secando una copa. El resto queda quieto.
4. **Lenguaje de persona.** Etiquetas en sentence case; nada de mayúsculas decorativas ni microcopy de relleno.
5. **Materiales coherentes.** Madera, latón, papel y tinta. Los bordes/sombras dependen del material, no de un `rounded-2xl` universal.

## Paleta

| Token | Hex | Uso |
| --- | --- | --- |
| Verde barra | `#1E3C31` | Pared principal y fondo de escena |
| Verde profundo | `#10251F` | Sombras, barra, contornos |
| Espresso | `#43291D` / `#5A3A26` | Madera de la barra |
| Latón | `#C8A12A` / `#F0D278` | Herrajes, filo de la carta, foco |
| Crema papel | `#F1E3CC` | Carta, placa de nombre |
| Tinta | `#1E3027` | Texto principal |
| Terracota | `#C86B46` | Sello puntual; nunca el acento dominante |

## Tipografía

- **Fraunces**: título, carta, nombres de mesa y cifras editoriales.
- **Nunito Sans**: navegación, formularios, ayudas y cuerpo.
- Sin etiquetas en mayúsculas decorativas. El código de sala es la única excepción funcional.

## Geometría

- Cartas y paneles: esquinas rectas o 2 px, borde de tinta y sombra desplazada.
- Botones: rectangulares, altura mínima 44 px, estado de foco visible.
- Objetos circulares: avatares, copas, platos y timbres.
- Nada de tarjetas dentro de tarjetas ni radios grandes por defecto.

## Movimiento

- El barista seca la copa con un balanceo lento; el café humea.
- La carta entra desde el plano de la barra al pulsar “Menú”.
- `prefers-reduced-motion`: sin bucles ni desplazamientos; la carta aparece sin animación.

## Portada v10

- Escena completa de barra, sin scroll.
- Barista detrás de la barra con delantal, copa y paño; el avatar elegido va como pin en el delantal.
- Carta física apoyada en la barra; abre el panel “La carta”.
- El panel contiene: nombre, avatar, subtítulos, mesa rápida, crear sala, entrar con código, tutorial, reglas y ajustes.
- La pizarra del día y el saludo por hora son información secundaria.

## Pendiente

- Aplicar el mismo contrato a lobby, partida y final sin perder legibilidad.
- Revisar contraste y foco en los modales existentes.
