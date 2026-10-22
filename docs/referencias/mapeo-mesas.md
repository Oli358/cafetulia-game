# Mapeo de las 24 mesas (confirmado)

> **Mapa confirmado por el usuario.** La disposición visual es la del tablero real.
> Las etiquetas y banderas impresas no son fiables; se ignoran.
> Los números de fila se han ajustado para que cuadre con el dato oficial: **24 mesas, 68 sillas únicas, 28 sillas compartidas y 20 plazas de barra**.

## 1. Orden confirmado de países

Sentido horario desde arriba a la izquierda:

**África → Italia → China → España → URS (Rusia) → India → América → Alemania → Turquía → Cuba → Inglaterra → Francia**

Cada país tiene **2 mesas**.

## 2. Códigos

| Código | País |
|---|---|
| AF | África |
| IT | Italia |
| CH | China |
| ES | España |
| RU | URS (Rusia) |
| IN | India |
| AM | América |
| AL | Alemania |
| TU | Turquía |
| CU | Cuba |
| EN | Inglaterra |
| FR | Francia |

## 3. Rejilla 13×13 (definitiva)

Filas y columnas de 0 a 12. Los puntos son casillas vacías o sillas.

| | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **0** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **1** | · | AF | · | IT | · | IT | · | CH | · | CH | · | ES | · |
| **2** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **3** | · | AF | · | EN | · | · | · | · | · | EN | · | ES | · |
| **4** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **5** | · | CU | · | · | · | · | · | · | · | · | · | RU | · |
| **6** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **7** | · | CU | · | · | · | · | · | · | · | · | · | RU | · |
| **8** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **9** | · | TU | · | FR | · | · | · | · | · | FR | · | IN | · |
| **10** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **11** | · | TU | · | AL | · | AL | · | AM | · | AM | · | IN | · |
| **12** | · | · | · | · | · | · | · | · | · | · | · | · | · |

## 4. Detalle de las 24 mesas

| ID | Fila | Col | Etiqueta impresa (no fiable) | País | Notas |
|---|---|---|---|---|---|
| M01 | 1 | 1 | ESPAÑA | África | |
| M02 | 1 | 3 | ITALIA | Italia | |
| M03 | 1 | 5 | BÉLGICA | Italia | Bandera italiana impresa |
| M04 | 1 | 7 | CHINA | China | |
| M05 | 1 | 9 | JAPÓN | China | Bandera china impresa |
| M06 | 1 | 11 | URUGUAY | España | Bandera española impresa |
| M07 | 3 | 1 | SUECIA | África | |
| M08 | 3 | 3 | INGLATERRA | Inglaterra | Centro-izquierda |
| M09 | 3 | 9 | CANADÁ | Inglaterra | Derecha-arriba |
| M10 | 3 | 11 | ESPAÑA | España | |
| M11 | 5 | 1 | VENEZUELA | Cuba | Bandera cubana impresa |
| M12 | 5 | 11 | PORTUGAL | Rusia | Bandera china impresa |
| M13 | 7 | 1 | AUSTRIA | Cuba | Bandera cubana impresa |
| M14 | 7 | 11 | RUSIA | Rusia | Bandera china impresa |
| M15 | 9 | 1 | TURQUÍA | Turquía | |
| M16 | 9 | 3 | FRANCIA | Francia | Centro-izquierda, abajo |
| M17 | 9 | 9 | FRANCIA | Francia | Derecha-abajo |
| M18 | 9 | 11 | TURQUÍA / IRÁN | India | Bandera india impresa |
| M19 | 11 | 1 | TURQUÍA | Turquía | |
| M20 | 11 | 3 | VENEZUELA | Alemania | Bandera alemana impresa |
| M21 | 11 | 5 | VENEZUELA | Alemania | Bandera alemana impresa |
| M22 | 11 | 7 | AMÉRICA | América | |
| M23 | 11 | 9 | AMÉRICA | América | |
| M24 | 11 | 11 | IRÁN | India | Bandera india impresa |

## 5. Validación

El archivo `packages/content/board.json` se genera a partir de este mapeo y cumple:

- **24 mesas**
- **68 sillas únicas**
- **28 sillas compartidas**
- **20 plazas de barra**
- Cada mesa tiene exactamente **4 sillas**
- Cada silla compartida pertenece exactamente a **2 mesas**

## 6. Barra

La barra es independiente de las mesas. Tiene 20 plazas con estos valores, en orden de llenado:

`+1, +2, +3, +4, +5, -2, -4, -6, -8, -10, -4, -6, -8, -10, -12, -6, -8, -10, -12, -14`
