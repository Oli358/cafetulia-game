# Registro de sesiones

> Documento vivo. Se añade una entrada por cada sesión de trabajo, **la más reciente arriba**.
> Formato: fecha, objetivo, hecho, decisiones, problemas y siguiente paso.

---

## Sesión 004 — 2026-10-22 — Nombre Cafetulia, repositorio remoto y países

**Objetivo:** cerrar el nombre, conectar el repositorio remoto, registrar el orden de países y anotar el modelo de IA a probar.

**Hecho:**
- Nombre decidido: **Cafetulia**.
- Repositorio remoto configurado: <https://github.com/Oli358/cafetulia-game.git>.
- Rama `main` subida a GitHub.
- Documentación actualizada con el nombre y el repositorio (`README.md`, `PLAN.md`, `NOMBRES.md`, `GIT.md`, `DECISIONES.md`, `REGLAS.md`).
- Registrado el orden cíclico de países indicado por el usuario: África, Italia, China, España, URS (Rusia), India, América, Alemania, Turquía y Cuba (sentido horario desde arriba a la izquierda).
- Anotado **Gemini 4 Argon** como modelo de IA a probar.

**Decisiones:**
- Nombre comercial: **Cafetulia** (D-041).
- Repositorio remoto: `cafetulia-game` (D-048).
- Modelo de IA a probar: Gemini 4 Argon (D-049).
- Orden de países: 10 confirmados; faltan 2 (D-050).

**Problemas:**
- La lista de países tiene 10; el juego original tiene 12. Probablemente faltan Francia e Inglaterra.
- Falta confirmar el mapeo definitivo de las 24 mesas.

**Siguiente:**
1. Confirmar los 2 países que faltan y el orden completo.
2. Probar Gemini 4 Argon en la prueba de estilo.
3. Preparar el scaffolding del monorepo (cuando el usuario dé el visto bueno).

---

## Sesión 003 — 2026-10-22 — Corrección, Git y ronda 3 de nombres

**Objetivo:** corregir la interpretación de las fotos, preparar el repositorio local y generar nombres más originales.

**Hecho:**
- Confirmado que las fotos son reales; el tablero tiene 24 mesas y 12 países, 2 por país.
- Corregidos `REGLAS.md`, `DECISIONES.md` y `SESIONES.md`: se ignoran las etiquetas impresas erróneas (por ejemplo, “CANADÁ” donde debe ser Inglaterra).
- Movidas las fotos a `docs/referencias/` con nombres claros: `tablero-real-sin-fichas.png` y `tablero-real-con-fichas.jpg`.
- Creados `.gitattributes`, `.editorconfig`, `LICENSE.md` y `docs/GIT.md`.
- Inicializado el repositorio Git local, rama `main`, con el primer commit: `docs: plan inicial, reglas y estructura del proyecto`.
- Generada la ronda 3 de nombres, con comprobación de dominios; actualizado `docs/NOMBRES.md`.

**Decisiones:**
- Las fotos son la referencia real del tablero.
- Los nombres y banderas impresas no son fiables; se mapean los 12 países oficiales por posición.
- Repositorio local listo; el remoto de GitHub se crea cuando haya nombre.
- La ronda 3 de nombres queda pendiente de elección.

**Problemas:**
- Falta confirmar el mapeo definitivo de los 12 países en las 24 mesas.
- El nombre sigue sin decidirse.

**Siguiente:**
1. Elegir nombre de la ronda 3.
2. Confirmar el mapeo de países por posición.
3. Crear el repositorio remoto y subir.
4. Preparar el scaffolding del monorepo.

---

## Sesión 002 — 2026-10-22 — Revisión de las imágenes del tablero

**Objetivo:** revisar las imágenes añadidas al directorio para usarlas como referencia del tablero real.

**Hecho:**
- Analizadas `Tablero Café International sin fichas.png` e `Imagen de ChatGPT 22 oct 2026, 13_02_20.jpg`.
- Confirmado: **son fotos reales del tablero físico**, no imágenes generadas.
- El tablero tiene **24 mesas y 12 países, 2 mesas por país**.
- Las etiquetas y banderas impresas en el tablero no son fiables (por ejemplo, pone “CANADÁ” donde debe ser Inglaterra). Se ignorarán los nombres impresos.
- Las fotos sirven como **referencia real de topología y de estilo 2.5D**: tablero plano, sillas y mesas con volumen suave, barra central en rombo.

**Decisiones:**
- Usar estas fotos como referencia real del tablero.
- Ignorar los nombres y banderas impresas cuando no coincidan.
- Mantener los 12 países oficiales: África, Alemania, China, Cuba, España, Estados Unidos, Francia, India, Inglaterra, Italia, Rusia y Turquía, mapeados por posición.
- Pendiente: confirmar el mapeo definitivo de cada mesa con el tablero delante.

**Problemas:**
- Hay que fijar qué país corresponde a cada una de las 24 mesas ignorando las etiquetas erróneas.

**Siguiente:**
1. Confirmar el mapeo de los 12 países por posición.
2. Elegir nombre entre las nuevas opciones.
3. Crear el `board.json` definitivo y validarlo.

---

## Sesión 001 — 2026-10-22 — Definición y estructura

**Objetivo:** cerrar las decisiones de producto y dejar preparada la documentación y la estructura del proyecto, sin programar todavía.

**Hecho:**
- Investigación del juego: reglamento AMIGO 2009, Rio Grande 2015, Spiel des Jahres, BoardGameGeek y fotos del tablero.
- Resumen operativo de reglas y del tablero (13×13, 24 mesas, 68 sillas, 28 sillas compartidas, 20 plazas de barra).
- Definición de la visión: 2.5D papercraft, tablero 2D fiel + fichas y mobiliario 3D.
- Cierre de decisiones de producto (ver `DECISIONES.md`).
- Creación de la estructura de carpetas y de la documentación inicial.

**Decisiones destacadas:**
- 2–4 jugadores desde la v1.0.
- Sin variante de 4 del mismo sexo por ahora.
- Comodines no van a la barra.
- Empate: victoria compartida.
- Fin de partida: las 4 condiciones clásicas.
- v1.0 permite saldo negativo; la eliminación por deuda será opción en v1.1.
- Chat y registro de eventos separados.
- Temporizador opcional con jugada automática.
- Reconexión de 15 s; mano a la bolsa; invitados sentados se quedan.
- Espectadores sí; replay no; compartir resultado sí; revancha con voto unánime.
- v1.0 con bots y espectadores; cuentas, admin y asíncrono en v1.1.
- Fecha objetivo: 20–22 de noviembre de 2026.
- Presupuesto 0 €; Render; PWA; español primero.
- Arte original, cómico y papercraft.

**Problemas:**
- Falta la foto del tablero vacío para transcribir con seguridad las 68 sillas.
- Nombre comercial aún pendiente.
- El modo asíncrono depende de que el servidor gratuito esté siempre levantado.

**Siguiente:**
1. Recibir la foto del tablero y crear el primer `board.json`.
2. Elegir nombre y crear el repositorio definitivo.
3. Montar el scaffolding del monorepo.
4. Empezar por el motor de reglas y sus tests.

---

## Plantilla para nuevas sesiones

```md
## Sesión NNN — AAAA-MM-DD — Título corto

**Objetivo:**

**Hecho:**

**Decisiones:**

**Problemas:**

**Siguiente:**
```
