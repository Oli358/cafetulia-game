# Guía de trabajo con Git

> Pensada para que no tengas que saber gestión de proyectos: aquí está lo esencial.
> Última actualización: 2026-10-22.

## 1. Estado actual

- Repositorio **local** inicializado en `C:\Users\olive\Desktop\cafe-international`.
- Repositorio remoto: <https://github.com/Oli358/cafetulia-game.git>
- Rama principal: `main`.
- Nombre del proyecto: **Cafetulia**.

## 2. Crear el repositorio en GitHub (cuando tengamos nombre)

1. Entra en GitHub y crea un repositorio **privado**.
2. No marques “Add a README”, “Add .gitignore” ni “Choose a license”: ya los tenemos.
3. Copia la URL del repositorio (por ejemplo, `https://github.com/Oli358/nombre-del-juego.git`).
4. En la carpeta del proyecto, ejecuta:

```bash
git remote add origin https://github.com/Oli358/nombre-del-juego.git
git branch -M main
git push -u origin main
```

A partir de ahí, cada sesión termina con:

```bash
git add .
git commit -m "docs: resumen corto de la sesión"
git push
```

## 3. Comandos básicos

| Comando | Para qué sirve |
|---|---|
| `git status` | Ver qué archivos han cambiado |
| `git add .` | Preparar todos los cambios |
| `git commit -m "mensaje"` | Guardar una “foto” del proyecto |
| `git push` | Subir los commits a GitHub |
| `git pull` | Bajar cambios (si se trabaja desde otro sitio) |
| `git log --oneline` | Ver el historial resumido |

## 4. Convención de mensajes

Formato: `tipo: descripción corta`

| Tipo | Cuándo usarlo |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de un error |
| `docs:` | Documentación |
| `test:` | Tests |
| `refactor:` | Reorganización sin cambiar comportamiento |
| `chore:` | Tareas de mantenimiento, dependencias, configuración |
| `art:` | Assets y arte |

Ejemplos:
- `docs: plan inicial y estructura del proyecto`
- `feat: motor de reglas y puntuación de mesas`
- `fix: corregir sillas compartidas en el tablero`

## 5. Ramas

- `main`: siempre estable.
- `feat/nombre-corto`: para una funcionalidad nueva.
- `fix/nombre-corto`: para una corrección.

Para una persona sola, se puede trabajar directamente en `main` al principio, pero
cuando haya código conviene usar ramas y un Pull Request para revisar los cambios.

## 6. Flujo de cada sesión

1. Actualizar `docs/SESIONES.md` con lo hecho y lo siguiente.
2. Actualizar `docs/DECISIONES.md` si se ha tomado alguna decisión.
3. `git add .`
4. `git commit -m "docs: sesión NNN"`
5. `git push`

## 7. Qué no se sube

- `node_modules/` ni dependencias.
- Archivos `.env` con secretos.
- Assets pesados sin optimizar (modelos 3D brutos, PSD, Blender).
- `dist/`, `build/`, `coverage/` ni reportes de tests.

El `.gitignore` ya cubre lo principal.

## 8. Privacidad

- El repositorio debe ser **privado** hasta decidir licencia y monetización.
- No subir datos personales, correos, tokens ni capturas con información sensible.
- Las fotos del tablero son de referencia; se pueden subir, pero no son el arte final.

## 9. Próximos pasos de Git

1. Elegir el nombre del proyecto.
2. Crear el repositorio privado en GitHub.
3. Añadir el remoto y hacer `git push -u origin main`.
4. Activar GitHub Actions cuando haya código y tests.
