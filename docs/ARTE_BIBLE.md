# Biblia visual de Cafetulia

> Documento de referencia para arte, UI, 3D y programación.
> Complementa a [`ARTE.md`](ARTE.md). Última actualización: 2026-10-23.

## 1. Concepto

**Un café de barrio a la hora dorada, convertido en un diorama de papel.**
El tablero es 2D y fiel al original; las fichas, sillas, mesas y la barra sobresalen en 3D como piezas de cartón grueso. La interfaz es limpia como una app de Apple, pero cálida como Animal Crossing. El humor viene de los personajes, no de la interfaz.

**Tres palabras guía:** cálido, táctil, ordenado.

**Lo que NO es:** fotorrealista, oscuro, sobrecargado, con partículas por todas partes, con sombras duras o con una UI de videojuego agresiva.

## 2. Referencias

- **Interiores:** Ghibli, cafés europeos de los años 50, madera clara, manteles de cuadros, plantas, luz de tarde.
- **Juegos:** Animal Crossing (calidez y redondez), Monument Valley (geometría limpia), Unpacking (objetos táctiles), A Little to the Left (orden y mimo), Coffee Talk (ambiente de café).
- **Papel:** dioramas de papercraft, cartón troquelado, sellos, postales, menús impresos.
- **Cómic:** caricatura clásica, tinta, colores planos, expresiones exageradas pero amables.
- **UI:** Apple Human Interface Guidelines: jerarquía, espacio, tipografía clara, pocos bordes, sombras suaves.

## 3. Paleta

### Base

| Uso | Color | Hex |
|---|---|---|
| Fondo principal | Crema | `#F7EEDF` |
| Superficie / papel | Blanco roto | `#FFF9F0` |
| Texto principal | Café oscuro | `#3E2F2A` |
| Texto secundario | Marrón medio | `#6F5A4E` |
| Terracota (primario) | Terracota | `#C96F4A` |
| Caramelo | Caramelo | `#B9855A` |
| Madera | Madera | `#8B5E3C` |
| Salvia | Salvia | `#8A9A7B` |
| Verde botella | Verde botella | `#3F5E4A` |
| Latón | Latón | `#C9A227` |
| Azul tinta | Azul tinta | `#2F4A6D` |
| Rojo ladrillo | Rojo ladrillo | `#A94438` |
| Amarillo mantequilla | Mantequilla | `#F2C14E` |
| Turquesa | Turquesa | `#4F9D9D` |
| Rosa suave | Rosa | `#E8B4B8` |

### Acentos por país

| País | Color | Hex |
|---|---|---|
| África | Ocre | `#D98E3A` |
| Italia | Tomate | `#C84B31` |
| China | Jade | `#3F8F6B` |
| España | Azafrán | `#E0A526` |
| URS (Rusia) | Teal | `#4F7C8A` |
| India | Marigold | `#D9822B` |
| América | Azul marino | `#2F4A6D` |
| Alemania | Burdeos | `#7A3B3B` |
| Turquía | Turquesa | `#2F8F8A` |
| Cuba | Coral | `#D96C5F` |
| Inglaterra | Azul + rojo | `#334E68` / `#B23A48` |
| Francia | Azul + rojo | `#3B5BA5` / `#C94C4C` |

**Regla:** el color nunca es la única información. Siempre va acompañado de bandera, patrón o código de país.

## 4. Tipografía

| Uso | Fuente | Peso | Tamaño |
|---|---|---|---|
| Títulos | Fraunces | 600/700 | 48/32/24 px |
| Interfaz | Nunito Sans | 400/600/700 | 16/14/12 px |
| Números de puntos | Fraunces tabular | 600 | 20/16 px |
| Botones | Nunito Sans | 700 | 16 px |

- Interlineado: 1.1 en títulos, 1.4 en cuerpo.
- Tracking: `-0.02em` en títulos, `0` en UI.
- Todo autoalojado con `@fontsource`.
- Nada de mayúsculas sostenidas en párrafos.

## 5. Espaciado, radios y sombras

- Rejilla base: **8 px**.
- Escala: 4, 8, 12, 16, 24, 32, 48, 64.
- Radios: 12 px (controles), 16 px (tarjetas), 24 px (paneles), 999 px (píldoras).
- Sombra suave: `0 8px 24px rgba(62, 47, 42, 0.12)`.
- Sombra de contacto: `0 2px 6px rgba(62, 47, 42, 0.18)`.
- Sin sombras duras ni negras.

## 6. Cámara y composición

- Cámara en perspectiva, 35 mm, FOV 28–35.
- Vista 3/4 en picado, 15–25° de inclinación.
- El tablero ocupa el **70 %** de la pantalla en escritorio; en móvil, el 60 % superior.
- Zoom entre 0.8× y 1.6×; paneo limitado a los bordes del tablero.
- Sin órbita libre por defecto: cuatro ángulos predefinidos y botón de reset.
- “Enfocar mesa”: zoom a 1.4× y panel lateral con país, ocupantes, sexo y puntos.
- Móvil: cámara más cenital para evitar sillas ocultas.
- Modo 2D: cámara ortográfica y tablero plano.

## 7. El tablero 2D

- Fiel a `packages/content/board.json`: 13×13, 24 mesas, 68 sillas, 28 compartidas.
- Ilustración vectorial con textura de papel muy sutil.
- Suelo de madera clara, juntas finas, sin ruido excesivo.
- Mesas: círculos de 80 px (a escala base) con mantel, bandera y color del país.
- Sillas: 56 px, redondeadas, con el color de la mesa.
- Sillas compartidas: **cojín bicolor** y dos banderitas; nunca solo un color.
- Barra central: rombo con 20 posavasos, valores en tipografía clara; el siguiente hueco brilla suavemente.
- Sin texto decorativo que compita con las fichas.

## 8. Piezas 3D

- Estilo **juguete de papel y madera**, no plástico brillante.
- Grosor visual: 12–18 px a escala de tablero.
- Bisel suave de 2–3 px; esquinas redondeadas.
- Materiales: mate (roughness 0.7–0.9), sin reflejos especulares fuertes.
- Madera, cartón, cerámica y latón. El latón solo en detalles pequeños.
- Sombras de contacto suaves; sin sombras duras.
- Fichas de invitado: token cuadrado redondeado o medallón, con retrato en la cara superior y canto del color del país.
- Cartas de la mano: 2:3, con retrato, bandera, nombre y código de país.

## 9. Personajes

- **28 personajes:** 24 invitados (12 países × 2 sexos) + 4 comodines.
- Proporción chibi suave: cabeza 1:2.5 del cuerpo; ni realista ni cabezón extremo.
- Dos cuerpos base (masculino/femenino), ropa y accesorios por país.
- Seis tonos de piel; rasgos y peinados variados.
- Estilo cómic: líneas de 3 px, colores planos, sombreado suave, expresiones amables.
- Ropa inspirada en el país, con humor y sin caricaturas ofensivas.
- Comodines: antifaz, sombrero o traje de arlequín; se reconocen al instante.
- Pose sentada y pose de pie; idle con sorbo de café.
- Los retratos antiguos sirven de referencia; el set final será coherente.

## 10. Interfaz

### Principios
- Limpieza tipo Apple: mucho aire, jerarquía clara, pocos bordes.
- Calidez cozy: papel, latón, sellos, tipografía con carácter.
- Una acción principal por pantalla.
- Nada de menús profundos.

### Componentes
- **Botón primario:** terracota, texto crema, 44 px de alto, radio 12.
- **Botón secundario:** crema, borde cálido, texto café.
- **Botón fantasma:** solo texto, para acciones terciarias.
- **Tarjeta de invitado:** 2:3, retrato, bandera, nombre del país y código.
- **Ficha de puntos:** círculo de cerámica con número.
- **Panel:** fondo `#FFF9F0`, radio 24, sombra suave.
- **Campo de texto:** fondo crema, borde 1 px, foco terracota.
- **Chat:** burbujas pequeñas, sin ocupar el tablero; se desvanece con la inactividad.
- **Temporizador:** discreto, arriba; nunca en el centro.
- **Avisos:** tipo sello o nota de papel, no alerts del navegador.

### Pantallas
1. **Portada:** logo, “Crear mesa”, “Unirse”, ajustes.
2. **Lobby:** jugadores, bots, espectadores, opciones, listo.
3. **Partida:** tablero, mano, rivales, marcador, barra, turno.
4. **Detalle de mesa:** país, ocupantes, equilibrio, puntos.
5. **Final:** recuento, penalizaciones, ganador, revancha, postal.
6. **Reglas:** tutorial y reglamento.
7. **Ajustes:** sonido, movimiento reducido, modo 2D, idioma.

## 11. Movimiento

- Duraciones: 150–300 ms; nunca más de 400 ms.
- Curvas: ease-out para entradas, spring suave para asentamientos.
- Fichas: aparecen con `scale 0.8 → 1.05 → 1` en 180 ms.
- Silla: se desliza 120 ms.
- Puntos: ficha vuela al marcador en 240 ms.
- Mesa completa: brillo y choque de tazas en 400 ms.
- Barra: posavasos se ilumina en 200 ms.
- Cambio de turno: fundido y desplazamiento suave de 300 ms.
- Reducción de movimiento: solo fundidos, sin rebotes.

## 12. Sonido

- Música lo-fi a 70–90 BPM, cálida, discreta.
- Ambiente: murmullo lejano, tazas, cucharillas, sillas.
- SFX: campanilla, ficha, carta, sorbo, aplauso suave.
- Volúmenes por defecto: música 0.4, ambiente 0.5, SFX 0.7.
- Nada suena hasta la primera interacción.
- Música libre de derechos o generada y revisada.

## 13. Iluminación

- Luz cálida principal desde arriba a la izquierda.
- Relleno ambiental suave; sin negros puros.
- Temperatura 3200–4000 K.
- Sombras de contacto; sin sombras duras.
- Postprocessing solo en escritorio; en móvil, tone mapping y viñeta CSS.
- Modo noche opcional: luces de mesa, ventanas azules, mismo contraste.

## 14. Accesibilidad visual

- Contraste mínimo 4.5:1 en texto.
- Color + bandera + patrón + código de país.
- Tamaño de toque mínimo 44×44 px.
- Foco visible en todos los controles.
- Texto escalable; nada de texto en imágenes.
- Reducción de movimiento.
- Modo 2D de respaldo.

## 15. Assets

| Asset | Cantidad | Formato |
|---|---|---|
| Tablero 2D | 1 | WebP/PNG 2048×2048 |
| Mesas | 12 variantes | GLB o geometría procedural |
| Sillas | 68 instancias, 12 colores | GLB instanciado |
| Barra | 1 | GLB |
| Retratos de invitados | 24 | WebP 512×512 |
| Comodines | 4 | WebP 512×512 |
| Cartas | 28 | WebP 512×768 |
| Banderas | 12 | SVG |
| Iconos UI | ~30 | SVG |
| Sonidos | 3 loops + 20 SFX | OGG/MP3 |
| Modelos 3D | 1 kit modular | GLB < 5 MB |

## 16. Pipeline de arte

1. **Style test:** una mesa, cuatro sillas, cuatro invitados y la barra.
2. Revisión del style test contra esta biblia.
3. Producción del tablero y del kit modular.
4. Producción de los 28 retratos y cartas.
5. Integración en la escena 3D.
6. Optimización y prueba en móvil.
7. QA visual y de rendimiento.

## 17. Criterios de aceptación

- El style test se reconoce como Cafetulia sin ver el logo.
- La paleta y los materiales son coherentes.
- El tablero se lee en un móvil de 6".
- Las sillas compartidas se distinguen al instante.
- No se usa ningún asset oficial de *Café International*.
- 60 fps en móvil de gama media, < 10 MB de carga inicial.
- La UI no tapa el tablero.
- La reducción de movimiento funciona.

## 18. Prompt de style test para Argon

```text
Crea una escena mínima en React Three Fiber para validar el estilo visual de Cafetulia:
- Fondo crema #F7EEDF.
- Tablero 2D de papel con textura sutil y una mesa de Francia.
- Una mesa redonda con mantel azul/blanco, cuatro sillas de madera clara.
- Cuatro fichas 3D tipo cartón, con retratos planos y canto del color del país.
- Una esquina de la barra central con tres posavasos y valores +1, +2, +3.
- Cámara 3/4 en picado, 20° de inclinación, zoom suave.
- Luz cálida desde arriba a la izquierda, sombras de contacto suaves.
- Estilo papercraft, materiales mates, esquinas redondeadas.
- Sin postprocessing en móvil.
- Añade un botón para alternar entre cámara 3D y vista 2D.
- La escena debe verse bien en un viewport de 390×844.
```

## 19. Decisiones abiertas

- Proporción final de los personajes (1:2.5 o 1:2).
- Si las caras serán retratos planos o texturas 3D.
- Paleta definitiva de cada país.
- Logo y wordmark de Cafetulia.
- Modo noche en la v1.0 o en v1.1.
