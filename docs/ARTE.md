# Dirección de arte

> Documento vivo. Última actualización: 2026-10-22.
> **Biblia visual completa:** [`ARTE_BIBLE.md`](ARTE_BIBLE.md).

## 1. Concepto

**Un café de barrio a la hora dorada, convertido en diorama de papel.**
El tablero es 2D y fiel al original; las fichas, sillas, mesas y la barra sobresalen en 3D como si fueran piezas de cartón grueso. La sensación debe ser la de un juego de mesa bonito, táctil y ordenado, no la de un videojuego recargado.

**Referencias de sensación:**
- Limpieza y jerarquía de la interfaz de Apple.
- Calidez, redondez y vida de Animal Crossing.
- Papercraft, cartón, madera, cerámica y tinta.
- Cómic clásico para los personajes.

**Lo que NO queremos:** fotorrealismo, sobrecarga de partículas, sombras duras, interfaces con mil botones, textos gritones.

## 2. El tablero

- **2D**, dibujado o vectorizado, fiel a la disposición del tablero físico: 24 mesas, sillas compartidas, barra central.
- Recreado con arte propio, no una copia del arte oficial.
- Colores suaves y cálidos; cada país tiene un color, una bandera y un patrón de mantel.
- Las **sillas compartidas** deben leerse al instante: dos banderitas, cojín bicolor o marca doble.
- Las sillas ocultas por la cámara se resuelven con contornos o siluetas.

## 3. Las piezas 3D

- **Fichas de invitado:** tokens gruesos tipo cartón, con la cara del personaje en la parte superior y el color del país en el canto.
- **Sillas:** piezas pequeñas y redondeadas, con el color de la mesa.
- **Mesas:** disco o tablero ligeramente elevado, con mantel y bandera.
- **Barra:** mostrador central con 20 posavasos numerados; el siguiente hueco brilla suavemente.
- **Cámara:** picado o ligeramente inclinada, fija, con zoom y paneo. Sin órbita libre por defecto.

## 4. Los personajes

- **28 personajes:** 24 invitados (12 países × 2 sexos) + 4 comodines.
- Estilo **cómico y caricaturesco**, fiel al espíritu del original, pero con arte propio.
- Cada país tiene paleta, ropa y accesorios reconocibles, con humor y sin caer en la ofensa gratuita.
- Los comodines llevan un toque de arlequín, antifaz o sombrero para distinguirse.
- Reutilización de los retratos antiguos: sirven como referencia y como *placeholder*; el set final será coherente y completo.

## 5. Animaciones

- **Fichas:** aparecen con un pequeño rebote, se asientan en la silla y dan un sorbo.
- **Sillas:** se deslizan al sentarse.
- **Puntuación:** fichas de puntos que vuelan hacia el marcador con un “pop”.
- **Mesa pura:** la mesa brilla, los invitados chocan las tazas.
- **Barra:** el posavasos se ilumina al ocuparse.
- **Final:** la luz baja, se encienden las velas, aparece el recuento.
- **Regla:** 150–300 ms, nunca bloquean la interacción. Opción de reducción de movimiento.

## 6. Interfaz

- Limpia, con mucho aire, bordes redondeados y jerarquía clara.
- Paleta: crema, terracota, verde salvia, caramelo, madera oscura y latón.
- Tipografía: serif cálida para títulos, sans legible para la interfaz.
- El código de sala parece una tarjeta de reserva.
- Los puntos se muestran como fichas de cerámica.
- **Nada de colores solos para distinguir países:** bandera + color + patrón.

## 7. Sonido

- Música **lo-fi** suave y ambiente de café.
- Efectos: taza, cucharilla, silla, campanilla de entrada, fichas, aplausos discretos.
- Tres volúmenes independientes: música, ambiente y efectos. Botón de silencio.
- Música libre de derechos o generada y revisada; nada de canciones con copyright.
- Nada suena hasta que el jugador interactúa por primera vez.

## 8. Rendimiento

- <10 MB de carga inicial.
- <150k triángulos y <100 draw calls.
- 60 fps en un móvil de gama media.
- Instancing para sillas, mesas y barra.
- Texturas comprimidas y atlas.
- Modo 2D de respaldo si el rendimiento o WebGL fallan.

## 9. Detalles personales

- Una **placa de latón** discreta con las iniciales de la pareja, sin resultar cursi.
- Algún detalle ocasional: un gato dormido en la barra, una taza con corazón, una fecha en la pared.
- El resto del arte debe funcionar para cualquier grupo de amigos.

## 10. Pipeline de assets

1. **Style guide** de una página: paleta, formas, materiales, proporciones, cámara.
2. **Prueba de estilo:** una mesa, cuatro sillas, cuatro invitados y la barra.
3. Si gusta, producir el set completo de 28 personajes y el tablero.
4. Optimizar: atlas, compresión, instancing, LOD si hace falta.
5. Validar en móvil real antes de seguir produciendo.

## 11. Próximos pasos de arte

- Elegir 3 personajes de prueba (por ejemplo, Francia, Turquía y Estados Unidos).
- Dibujar una esquina del tablero con una silla compartida.
- Montar una escena mínima con cámara y luz para validar el 2.5D.
