# Poka Yoke · presentación web

Presentación interactiva (17 diapositivas, unos 15 minutos, 3 expositores) hecha con HTML, CSS y JavaScript puros. No necesita instalar nada.

## Estructura

```
index.html        contenido de las diapositivas
css/styles.css    diseño y animaciones
js/main.js        navegación, guion, temporizador y demo
images/           aquí van las imágenes generadas con IA
```

## Cómo verla

- En local: abre `index.html` en el navegador.
- En GitHub Pages: sube la carpeta al repositorio, ve a **Settings > Pages**, elige la rama `main` y la carpeta `/ (root)`. La página queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Controles

| Acción | Tecla / gesto |
|---|---|
| Siguiente / anterior | Flechas, Espacio, Re Pág / Av Pág, deslizar en móvil |
| Ir al inicio / final | Inicio / Fin |
| Guion del expositor | N (o botón «Guion») |
| Temporizador | T iniciar o pausar, R reiniciar |
| Pantalla completa | F |

El temporizador arranca solo al pasar de la portada. Se pone rojo al superar los 15 minutos.

## Qué editar

1. **Nombres:** en `index.html`, diapositiva 1, lista `.team`. El orden define Expositor 1, 2 y 3 (círculo, cuadrado, triángulo).
2. **Asignatura o institución:** línea `Asignatura o institución, 2026` en la portada.
3. **Fuentes:** diapositiva 17.
4. **Guion:** cada diapositiva tiene un bloque `<aside class="notes">` con apuntes para el expositor.

## Reparto sugerido

| Expositor | Diapositivas | Tema | Tiempo |
|---|---|---|---|
| 1 | 1 a 5 | Concepto, origen, error vs. defecto, tipos de error | ~5 min |
| 2 | 6 a 10 | Control y advertencia, métodos, estrategias, pasos, demo | ~5 min |
| 3 | 11 a 17 | Ejemplos, sectores, herramientas, beneficios y límites, cierre | ~5 min |

## Imágenes

Guárdalas en `images/` con estos nombres (acepta `.jpg`, `.png`, `.webp` o `.jpeg`). Si falta una, se muestra un marcador con el nombre del archivo.

| Archivo | Formato sugerido |
|---|---|
| `origen-fabrica` | 4:5 vertical (1000 x 1250) |
| `sim`, `microondas`, `surtidor`, `cajero`, `enchufe`, `cinturon` | 16:7 horizontal (1600 x 700) |
| `industrial-plantilla`, `industrial-kit`, `industrial-vision`, `industrial-torque` | 16:10 (1200 x 750) |
