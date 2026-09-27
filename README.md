# Dolce Burger

Web de una sola página para **Dolce Burger**, hamburguesería en El Prat de Llobregat.
HTML, CSS y un poco de JavaScript, sin dependencias ni paso de compilación.

## Estructura

- `index.html`: la página (inicio, carta, horario, mapa y contacto).
- `css/styles.css`: estilos.
- `js/main.js`: carta, horario con aviso de "abierto ahora" y menú móvil.
- `menu.json`: la carta. Para cambiar un plato o un precio, edita este archivo.
  Si `precio` es `null`, la web muestra "Consultar".
- `img/`: carpeta para fotos propias.

El horario se edita al principio de `js/main.js` (objeto `HOURS`).

## Verla en local

`menu.json` se carga con `fetch`, así que hay que servir la carpeta:

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Publicar en GitHub Pages

Settings → Pages → Source: "Deploy from a branch" → rama `main`, carpeta `/ (root)`.
