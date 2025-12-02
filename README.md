# Portafolio de Ezequiel Isaac Rodríguez Tenorio

Portafolio personal de proyectos de backend e inteligencia artificial, con demos interactivos en TensorFlow.js y una vista general de experiencia profesional.

## Ejecutar localmente

1. Instala dependencias de Jekyll:
   ```bash
   bundle install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   bundle exec jekyll serve
   ```
3. Abre `http://localhost:4000` en el navegador.

> Si trabajas desde un fork o bajo otro subdominio, ajusta `baseurl` y `url` en `_config.yml`.

## Probar los demos de TensorFlow.js

- **Flores (`/flowers/`)**: permite seleccionar cámara frontal/trasera o subir una imagen. Usa `requestAnimationFrame` para evitar bloqueos y cancela el stream al cerrar la página.
- **Números (`/numbers/`)**: lienzo optimizado para MNIST; habilita el botón solo cuando el modelo está listo.
- **Perros o Gatos (`/perros/`)**: soporta captura en vivo o carga manual, con normalización y redimensionado previos.
- **Bitcoin (`/bitcoin/`)**: ejecuta consultas controladas a la API de Binance cada 12 segundos; incluye botones para iniciar/detener.
- **YOLO (`/yolo/`)**: detección en vivo con WebGL y supresión no máxima; inicia y detiene el stream desde la interfaz.

## Estructura principal

- `index.html`: página principal renderizada con el layout `portfolio`.
- `_layouts/portfolio.html`: layout personalizado con secciones de hero, experiencia, proyectos y habilidades.
- `_layouts/default.html`: layout para demos de TensorFlow.js con navegación unificada.
- `styles/portfolio.css`: estilos modernos con gradientes, tarjetas y rejillas responsivas.
- `styles/demos.css`: tema oscuro coherente para los demos (botones, tarjetas, lienzos y formularios).
- `_pages/`: demos y experimentos con modelos de IA (flores, números, Bitcoin, YOLO, etc.).

## Personalización

- Actualiza los enlaces de contacto (LinkedIn/GitHub) en `_layouts/portfolio.html` si cambia la información.
- Agrega o edita proyectos en la sección "Proyectos destacados" del layout para reflejar nuevas demos.
- Mantén los estilos en `styles/portfolio.css` para asegurar consistencia visual en nuevas secciones.

## Contacto

Cualquier pregunta o ajuste pendiente: `IsaacRodriguezCH@outlook.com`.
