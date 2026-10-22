# Fase 6 — Pulido, PWA y funciones sociales

**Objetivo:** completar la experiencia de la v1.0.

```text
TAREA: Completa el pulido de Cafetulia para la v1.0.

Contexto: lee 00-contexto.md, docs/ROADMAP.md y docs/DECISIONES.md.

FUNCIONES
1. Tutorial sencillo de 3 pasos: abrir mesa, usar silla compartida, mandar a la barra.
   - Opción "ya sé jugar" para saltarlo.
   - Pistas contextuales opcionales.
2. Reglamento consultable desde el menú principal.
3. Bots básicos:
   - Niveles fácil, medio y difícil.
   - Usan getLegalMoves + heurística.
   - Configurables en la sala antes de empezar.
4. Espectadores:
   - Entran en modo solo lectura.
   - Ven el tablero y las manos públicas.
   - Pueden usar emotes.
5. Estadísticas locales:
   - Victorias, partidas jugadas, rivales más frecuentes y nación favorita.
   - Guardadas en el dispositivo, sin datos personales.
6. Compartir resultado:
   - Generar una imagen con la fecha, los jugadores, la puntuación y un mensaje.
   - Web Share API en móvil; descarga en escritorio.
7. Historial corto:
   - Últimas 5 partidas.
8. Accesibilidad:
   - Bandera + color + patrón para distinguir países.
   - Reducción de movimiento, alto contraste, tamaño de texto.
   - Navegación con teclado en escritorio.
   - Modo 2D de respaldo.
9. PWA:
   - Instalable en iPhone y Android.
   - Funciona a pantalla completa.
   - Instrucciones de instalación para iOS.
10. Detalles cozy:
   - Placa discreta con las iniciales de la pareja.
   - Gato ocasional en la barra.
   - Sonidos y animaciones suaves.

CRITERIOS DE ACEPTACIÓN
- Se puede jugar una partida completa con 2–4 jugadores y bots.
- El tutorial se completa sin ayuda externa.
- La PWA se instala en iPhone y Android.
- Las estadísticas locales persisten entre sesiones.
- pnpm typecheck, pnpm test y pnpm build en verde.

AL TERMINAR
- Actualiza docs/SESIONES.md.
- Commit: feat: tutorial, bots, espectadores y PWA.
- Push a main.
```
