# Poka Yoke · presentación web

Presentación interactiva sobre Poka Yoke para la asignatura **Ing. Métodos y Tiempos** (UFPS).
18 diapositivas, unos 15 minutos de exposición para 3 personas, y material de consulta para quien entre a la página.

Sitio publicado: https://darsssj.github.io/PokaYoke.github.io/

**Integrantes**
- Manuel Felipe Gualdron Fuentes (1193344)
- Diego Andres Ramirez Sanchez (1193368)
- Jhorjan Sebastián Gómez Arias (1193345)

## Estructura

```
index.html        contenido: diapositivas, detalles ampliados, guion, cuestionario, bibliografía
css/styles.css    diseño, animaciones y adaptación a celular
js/main.js        navegación, menú, detalles, cronómetro, vista horizontal, demo y cuestionario
images/           ilustraciones (WebP optimizado)
```

No necesita instalar nada: es HTML, CSS y JavaScript puros.

## Qué incluye

- **Menú ☰:** índice agrupado por expositor, cronómetro opcional, guion, pantalla completa, vista horizontal, compartir enlace e imprimir o guardar en PDF.
- **Botón Detalles (tecla D):** amplía cada diapositiva con definiciones, datos y fuentes citadas.
- **Vista horizontal en celular:** botón ↻ (arriba a la derecha). Usa el bloqueo de orientación del navegador y, si el celular no lo permite (por ejemplo iPhone), gira la vista por software.
- **Cronómetro opcional:** oculto por defecto. Se inicia o pausa desde el menú o con la tecla T.
- **Autoevaluación** de 7 preguntas y **bibliografía en APA 7** al final.
- Accesible por teclado, respeta «reducir movimiento» y se puede imprimir como PDF.

## Controles

| Acción | Tecla / gesto |
|---|---|
| Siguiente / anterior | Flechas, Espacio, Re Pág / Av Pág, deslizar en el celular |
| Inicio / final | Inicio / Fin |
| Detalles | D (o botón «Detalles») |
| Menú | M (o botón ☰) |
| Guion del expositor | N |
| Cronómetro | T iniciar o pausar, R reiniciar |
| Pantalla completa | F |
| Cerrar paneles | Esc |

## Publicar en GitHub Pages

1. Sube todo el contenido de esta carpeta a la raíz del repositorio (reemplaza los archivos anteriores).
2. En **Settings > Pages**, elige la rama `main` y la carpeta `/ (root)`.
3. Espera uno o dos minutos y recarga con Ctrl + F5 para ver los cambios.

## Qué editar

- **Textos y nombres:** `index.html`. Los nombres están en la lista `.team` de la diapositiva 1.
- **Detalles ampliados:** bloques `<template class="detail">` dentro de cada diapositiva.
- **Guion del expositor:** bloques `<aside class="notes">`.
- **Preguntas del cuestionario:** arreglo `QUIZ` en `js/main.js`.
- **Bibliografía:** diapositiva 18 de `index.html`.

## Imágenes

Son ilustraciones generadas con IA (no son fotografías). El sitio busca `nombre.webp`, `.jpg`, `.png` o `.jpeg` en `images/`; si falta una, muestra un marcador con el nombre del archivo.

`origen-fabrica`, `sim`, `microondas`, `surtidor`, `cajero`, `enchufe`, `cinturon`, `industrial-plantilla`, `industrial-kit`, `industrial-vision`, `industrial-torque`.

## Reparto sugerido

| Expositor | Diapositivas | Tema | Tiempo |
|---|---|---|---|
| 1 | 1 a 5 | Concepto, origen, error vs. defecto, tipos de error | ~5 min |
| 2 | 6 a 10 | Control y advertencia, métodos, estrategias, pasos, demo | ~5 min |
| 3 | 11 a 16 | Ejemplos, sectores, herramientas, beneficios y límites, cierre | ~5 min |

Las diapositivas 17 (autoevaluación) y 18 (bibliografía) son material de consulta y no se exponen.
