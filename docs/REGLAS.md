# Reglamento operativo

> Versión de trabajo para implementar el motor. Basado en el reglamento clásico de AMIGO (2009) y en el tablero físico de la edición española. Última actualización: 2026-10-22.
> **Pendiente de confirmar con la foto del reglamento:** condición exacta de fin por bolsa y detalles de la edición.

---

## 1. Componentes

| Componente | Cantidad |
|---|---|
| Invitados | 96 fichas: 4 hombres + 4 mujeres por cada uno de los 12 países |
| Comodines | 4 fichas: 2 hombres + 2 mujeres |
| Mesas | 24 (2 por país) |
| Sillas únicas | 68 (96 plazas de silla, 28 compartidas entre dos mesas) |
| Plazas de barra | 20 |
| Fichas de puntos | 60 negras (1), 30 rojas (5), 10 azules (10) |

**Los 12 países:** África, Alemania, China, Cuba, España, Estados Unidos, Francia, India, Inglaterra, Italia, Rusia y Turquía.

> **Orden confirmado por el usuario (sentido horario desde arriba a la izquierda):** África, Italia, China, España, URS (Rusia), India, América, Alemania, Turquía, Cuba… **faltan 2 por confirmar** (probablemente Francia e Inglaterra).

> **Nota sobre el tablero físico:** las etiquetas y banderas impresas en el tablero pueden no coincidir con el país real (por ejemplo, aparece “CANADÁ” donde debe ser Inglaterra). Se ignoran las etiquetas impresas y se mapean los 12 países oficiales por la posición de cada mesa. Pendiente de confirmar el mapeo definitivo.

---

## 2. El tablero

- Cuadrícula de **13×13**.
- **24 mesas**, cada una con 4 plazas de silla.
- **28 sillas son compartidas** entre dos mesas. Una ficha sentada en una silla compartida cuenta para **las dos mesas** y puede puntuar en ambas.
- La **barra** ocupa el centro, con 20 plazas que se llenan en orden del 1 al 20.
- Valores de la barra, en orden de llenado:

| Plaza | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Puntos | +1 | +2 | +3 | +4 | +5 | −2 | −4 | −6 | −8 | −10 | −4 | −6 | −8 | −10 | −12 | −6 | −8 | −10 | −12 | −14 |

Las cinco primeras plazas dan puntos; el resto los quitan.

---

## 3. Preparación

1. Se barajan las 100 fichas en la bolsa.
2. Cada jugador roba **5 fichas** y las coloca **boca arriba** delante de él. **Las manos son públicas.**
3. Se determina el jugador inicial (por defecto, aleatorio; configurable).
4. El turno pasa en sentido horario.

---

## 4. Turno

El jugador debe elegir **una** de estas acciones:

1. **Sentar 1 o 2 invitados** en las mesas.
2. **Sentar 1 invitado en la barra.**
3. **Cambiar un comodín** sentado por la ficha natural correspondiente.

Al final del turno (excepto en el cambio de comodín) el jugador **rellena su mano** hasta su tamaño actual.

---

## 5. Reglas de colocación en mesas

### Nacionalidad
- Cada mesa está reservada a un país.
- En una silla **normal** solo puede sentarse un invitado de la nacionalidad de esa mesa.
- En una silla **compartida** se acepta una de las dos nacionalidades de las mesas vecinas.
- Un **comodín** puede representar cualquier nacionalidad permitida por la silla. Su sexo es fijo.

### Equilibrio de sexos
En cada mesa, al final del turno, solo son válidas estas combinaciones:

- 0 invitados.
- 1 hombre + 1 mujer.
- 1 hombre + 2 mujeres.
- 2 hombres + 1 mujer.
- 2 hombres + 2 mujeres.

Nunca puede haber más de dos personas del mismo sexo en una mesa.

### Invitado solo
- No puede quedar un invitado solo en una mesa.
- **Excepción:** se permite si su silla es compartida y la mesa vecina tiene al menos otro invitado.
- **Excepción de apertura:** solo el jugador inicial, con todas las sillas vacías, puede colocar una única ficha sin puntuar.

### Puntuación obligatoria
- Cada ficha colocada debe puntuar, salvo la apertura especial del jugador inicial.
- Si se colocan dos fichas en mesas distintas, **las dos deben puntuar**.
- Si se abre una mesa vacía y la primera ficha no puntúa, hay que colocar en el mismo turno la pareja que la acompañe.

---

## 6. Puntuación

Al colocar una ficha, se evalúa cada mesa a la que pertenece la silla, **después** de colocar:

| Invitados en la mesa tras colocar | Nacionalidades distintas | Todos de la misma nacionalidad |
|---|---|---|
| 1 | 0 puntos | 0 puntos |
| 2 | 2 puntos | 4 puntos |
| 3 | 3 puntos | 6 puntos |
| 4 | 4 puntos | 8 puntos |

- Si la silla es **compartida**, la ficha puntúa en **las dos mesas** por separado y se suman ambos resultados.
- Si se colocan dos fichas en el mismo turno, se evalúan **en orden**: la segunda ve el efecto de la primera.
- Una mesa con **cuatro comodines** que representan la misma nacionalidad puntúa 8.
- La nacionalidad de la mesa no manda: cuenta la nacionalidad de los invitados sentados en ella.

---

## 7. Mesa de una sola nacionalidad

- Se forma cuando los 4 invitados de una mesa son de la misma nacionalidad (dos parejas).
- El jugador que la completa **reduce permanentemente su mano en 1**.
- Si completa dos mesas puras en un turno, reduce 2.
- La reducción es acumulativa y no se recupera.
- La mano puede llegar a 0; en ese caso, cuando el jugador se quede sin fichas y no necesite robar, la partida termina.

---

## 8. La barra

- Se llena **en orden**, de la plaza 1 a la 20.
- Solo se puede sentar **una ficha por turno** en la barra.
- En la edición clásica, **los comodines no pueden ir a la barra**.
- Al sentar en la barra, se suman o restan los puntos indicados.
- Después de sentar en la barra, el jugador **también roba** para rellenar su mano.
- Si un jugador no puede o no quiere sentar en las mesas, **debe** usar la barra.

### Deuda
- **v1.0:** se permite saldo negativo; la partida nunca se corta por no poder pagar.
- **v1.1:** opción de sala “modo estricto”: quien no puede pagar queda eliminado.

---

## 9. Los comodines

- Hay 4: 2 hombres y 2 mujeres.
- Tienen sexo fijo, pero pueden representar cualquier nacionalidad permitida por la silla.
- Al sentarse, se elige la nacionalidad que representan.
- Pueden completar una mesa de una sola nacionalidad.
- Se pueden sentar varios comodines en la misma mesa.

### Cambio de comodín
- Es una acción completa del turno.
- Se sustituye un comodín sentado por una ficha natural de la mano que pueda ocupar esa misma silla.
- La ficha natural pasa a ocupar la silla; el comodín vuelve a la mano del jugador.
- **No se puntúa** y **no se roba**.
- Si el comodín estaba en una silla compartida, puede sustituirse por cualquiera de las dos nacionalidades admitidas.
- Pendiente de confirmar: si el cambio que completa una mesa pura reduce también la mano. Propuesta: **no**, porque el cambio no es una colocación con puntuación; se documentará como decisión de implementación.

---

## 10. Robar y tamaño de mano

- Al final del turno, el jugador roba hasta alcanzar su **tamaño de mano actual**.
- El tamaño inicial es **5**.
- Cada mesa pura completada reduce el tamaño en 1 de forma permanente.
- Tras cambiar un comodín **no se roba**.
- Si la bolsa no tiene suficientes fichas, se roba lo que haya y se aplican las condiciones de fin.

---

## 11. Fin de la partida

La partida termina inmediatamente cuando ocurre **cualquiera** de estas cuatro situaciones:

1. Se ocupa la **última silla libre** de las mesas.
2. Se ocupa la **plaza 20 de la barra**.
3. Un jugador se queda **sin fichas** y no necesita robar.
4. Un jugador roba la **cuarta ficha por el final** de la bolsa (edición clásica).

> La edición de Rio Grande 2015 termina al robar la última ficha. Se implementará como preset configurable; por defecto, la edición clásica.

---

## 12. Puntuación final

- Cada jugador suma sus puntos de fichas.
- Se restan **5 puntos por cada ficha de nacionalidad** que le quede en la mano.
- Se restan **10 puntos por cada comodín** que le quede en la mano.
- Gana quien tenga más puntos.
- **Empate: victoria compartida.**

---

## 13. Variantes y reglas de la casa

| Variante | Estado |
|---|---|
| Mesa de 4 mujeres o 4 hombres en un solo turno (20 puntos; 40 si es de una sola nacionalidad) | **No** en v1.0. Se podrá añadir como opción en una versión futura |
| Eliminación por deuda | Opción de sala en v1.1 |
| Temporizador por turno | Opción de sala en v1.0 (máx. 180 s) |
| Bots | Configurable en la sala |
| Espectadores | Sí en v1.0 |

---

## 14. Casos límite que el motor debe cubrir

1. Apertura especial del jugador inicial con 0 puntos.
2. Abrir una mesa con una pareja en el mismo turno.
3. Invitado solo en silla compartida con mesa vecina ocupada.
4. Una ficha en silla compartida que puntúa en las dos mesas.
5. Dos fichas en el mismo turno evaluadas en orden.
6. Mesa pura completada con comodín.
7. Completar dos mesas puras en un turno (reducción de 2).
8. Cambio de comodín sin puntos y sin robar.
9. Comodín que no puede ir a la barra.
10. Barra: orden, valores y saldo negativo.
11. Fin por última silla, plaza 20, jugador sin fichas y cuarta por el final.
12. Penalización de mano al terminar.
13. Expulsión por desconexión: mano a la bolsa, sentados se quedan.
14. Reparto de puntos y victoria compartida en caso de empate.

---

## 15. Diferencias entre ediciones (a confirmar)

| Tema | AMIGO 2009 (clásica) | Rio Grande 2015 |
|---|---|---|
| Fin por bolsa | Robar la cuarta por el final | Robar la última |
| Comodines en la barra | No pueden | Permitido con matices |
| Deuda | Eliminación si no se puede pagar | No se especifica igual |
| Variante de un solo sexo | Sí, opcional | No |

**Plan:** implementar un preset de reglas con estas diferencias y dejar por defecto el de la edición física del usuario.
