# Mapeo borrador de las 24 mesas

> **Borrador pendiente de revisión por el usuario.**
> Basado en las fotos reales del tablero y en la disposición del tablero oficial.
> Las etiquetas y banderas impresas no son fiables; se ignoran.

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

## 3. Rejilla 13×13 (propuesta)

Filas y columnas de 0 a 12. Los puntos son casillas vacías o sillas.

| | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **0** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **1** | · | AF | · | IT | · | IT | · | CH | · | CH | · | ES | · |
| **2** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **3** | · | AF | · | EN | · | · | · | · | · | EN | · | ES | · |
| **4** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **5** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **6** | · | CU | · | · | · | · | · | · | · | · | · | RU | · |
| **7** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **8** | · | CU | · | · | · | · | · | · | · | · | · | RU | · |
| **9** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **10** | · | TU | · | FR | · | · | · | · | · | FR | · | IN | · |
| **11** | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **12** | · | TU | · | AL | · | AL | · | AM | · | AM | · | IN | · |

## 4. Detalle de las 24 mesas

| ID | Fila | Col | Etiqueta impresa (no fiable) | País propuesto | Notas |
|---|---|---|---|---|---|
| M01 | 1 | 1 | ESPAÑA | África | Primera mesa del ciclo |
| M02 | 1 | 3 | ITALIA | Italia | |
| M03 | 1 | 5 | BÉLGICA | Italia | Bandera italiana impresa |
| M04 | 1 | 7 | CHINA | China | |
| M05 | 1 | 9 | JAPÓN | China | Bandera china impresa |
| M06 | 1 | 11 | URUGUAY | España | Bandera española impresa |
| M07 | 3 | 1 | SUECIA | África | Segunda mesa de África |
| M08 | 3 | 3 | INGLATERRA | Inglaterra | Centro-izquierda |
| M09 | 3 | 9 | CANADÁ | Inglaterra | Derecha-arriba |
| M10 | 3 | 11 | ESPAÑA | España | |
| M11 | 6 | 1 | VENEZUELA | Cuba | Bandera cubana impresa |
| M12 | 6 | 11 | PORTUGAL | Rusia | Bandera china impresa; posición de Rusia en el tablero oficial |
| M13 | 8 | 1 | AUSTRIA | Cuba | Bandera cubana impresa |
| M14 | 8 | 11 | RUSIA | Rusia | Bandera china impresa |
| M15 | 10 | 1 | TURQUÍA | Turquía | |
| M16 | 10 | 3 | FRANCIA | Francia | Centro-izquierda, abajo |
| M17 | 10 | 9 | FRANCIA | Francia | Derecha-abajo |
| M18 | 10 | 11 | TURQUÍA / IRÁN | India | Bandera india impresa |
| M19 | 12 | 1 | TURQUÍA | Turquía | |
| M20 | 12 | 3 | VENEZUELA | Alemania | Bandera alemana impresa |
| M21 | 12 | 5 | VENEZUELA | Alemania | Bandera alemana impresa |
| M22 | 12 | 7 | AMÉRICA | América | |
| M23 | 12 | 9 | AMÉRICA | América | |
| M24 | 12 | 11 | IRÁN | India | Bandera india impresa |

## 5. Puntos a revisar

1. ¿M01 y M07 son las dos mesas de África?
2. ¿M12 y M14 son las dos mesas de Rusia, aunque tengan bandera china impresa?
3. ¿M18 y M24 son las dos mesas de India?
4. ¿Inglaterra es M08 (centro-izquierda) y M09 (derecha-arriba)?
5. ¿Francia es M16 (centro-izquierda, abajo) y M17 (derecha-abajo)?
6. ¿Las dos mesas de Alemania son M20 y M21?
7. ¿Las dos mesas de América son M22 y M23?

Cuando el usuario confirme o corrija, este mapeo pasa a `board.json`.
