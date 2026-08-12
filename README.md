# ReneBook — Biblioteca bíblica interactiva

Plataforma bíblica premium con Palabra del Día, Proverbios y los 150 Salmos.

## Idioma principal

La app abre primero en **español** y permite cambiar a **English**.

## Versiones sugeridas de dominio público

- Español: Reina-Valera 1909 (RVR1909)
- Inglés: World English Bible (WEB)

## Funciones

- Inicio / Lectura / Devocional / Datos
- Selector de idioma Español / English
- Modo claro / oscuro
- Tarjetas reveladoras de métricas
- Versículo del día
- Lectura por capítulo de Proverbios y Salmos
- Filtro por tema
- Progreso local privado
- Búsqueda por referencia o palabra
- Rutas pastorales de oración en Salmos
- Notas privadas por Salmo
- Devocional editable
- Firma: By ReneBook

## Ejecutar localmente

```bash
npm install
npm run dev
```

## Construir para producción

```bash
npm run build
```

El proceso genera `dist/` con las siete páginas públicas, lectores, datos,
iconos, manifiesto y service worker. La construcción termina con una
verificación automática de los archivos esenciales.

Netlify usa la configuración versionada en `netlify.toml` y publica únicamente
`dist/`; así no expone `src/`, dependencias ni archivos internos del repositorio.

## Subir a GitHub

```bash
git init
git add .
git commit -m "Actualizar biblioteca ReneBook"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/renebook-app.git
git push -u origin main
```

Reemplaza `TU-USUARIO` con tu usuario de GitHub.
