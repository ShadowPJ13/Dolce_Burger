# Dolce Burger

Web de una sola página para **Dolce Burger**, hamburguesería en El Prat de Llobregat.
HTML, CSS y un poco de JavaScript, sin dependencias ni paso de compilación.

## Antes de publicar

1. **Precios pendientes.** En `menu.json`, tres productos que salen en Glovo pero no en la carta impresa tienen
   `"precio": null` y la web muestra "Consultar": **Milkshake Chips Ahoy**, **Sprite** y **Free Damm 0,0**.
   Pon el precio del local (por ejemplo `"precio": 3.60`) o borra la línea si no se vende en el local.
2. **Permiso de las fotos.** Las fotos de `img/carta/` y `img/hero.jpg` salen de la tienda de Dolce Burger en Glovo.
   Confirma con el dueño que son suyas y puede usarlas en su web. Si alguna no, borra el archivo y su campo
   `"foto"` en `menu.json` (el plato mostrará el logo).
3. **Datos legales.** En `legal.html` hay tres textos en rojo marcados como `PENDIENTE`: titular, NIF y datos
   registrales. Si el titular es autónomo, borra la línea "Registro" entera (`<dt>Registro</dt>` y su `<dd>`).

Para comprobar que no queda nada pendiente (no debe salir ninguna línea):

```bash
grep -n 'PENDIENTE' legal.html; grep -n '"precio": null' menu.json
```

Después, publicar: crear la rama `main` y subirla (`git checkout -b main && git push -u origin main`)
y activar GitHub Pages como se explica más abajo.

## Estructura

- `index.html`: la página (inicio, carta, horario, mapa y contacto).
- `legal.html`: aviso legal, privacidad y cookies. **Antes de publicar, rellena los datos marcados en rojo como PENDIENTE.**
- `404.html`: página de error de GitHub Pages.
- `css/styles.css`: estilos.
- `js/main.js`: carta, horario con aviso de "abierto ahora", mapa bajo demanda y menú móvil.
- `menu.json`: la carta. Para cambiar un plato o un precio, edita este archivo.
  - `precio`: número en euros. Si es `null`, la web muestra "Consultar".
  - `variantes`: opcional, para los tamaños extra (`[{ "nombre": "Doble", "precio": 8.90 }]`).
  - `destacado`: opcional, pinta la etiqueta "Favorita".
  - `foto`: opcional, nombre del archivo en `img/carta/` (JPEG 800×600). Si una categoría tiene alguna foto, los platos sin foto muestran el logo.
  - `compacta` (en la categoría): tarjetas más pequeñas, para listas largas y cortas como bebidas.
  - `suplemento` (en la categoría): muestra los precios como `+1,00 €`.
  - `aviso` (raíz): la nota que sale debajo de la carta.
- `img/`: iconos, foto de portada (`hero.jpg`), imagen para redes (`og.jpg`, 1200×630), carta en imagen (`carta.png`) y fotos de los platos (`carta/`).
- `fonts/`: Anton e Inter autoalojadas (licencia OFL), para no cargar Google Fonts.
- `robots.txt` y `sitemap.xml`: para buscadores.

## Horario y festivos

El horario semanal está al principio de `js/main.js` (objeto `HOURS`). Si lo cambias, cambia también
`openingHoursSpecification` en `index.html`: es lo que lee Google para su ficha.

Los festivos y vacaciones van en `EXCEPCIONES`, justo debajo, con la fecha en formato `AAAA-MM-DD`:

```js
const EXCEPCIONES = {
  "2026-12-25": [],                     // cerrado
  "2026-12-31": [["12:30", "16:30"]],   // solo comidas
};
```

El aviso "Abierto ahora / Cerrado" y la fila de hoy de la tabla las tienen en cuenta. Las fechas pasadas se pueden borrar.

## Cookies y privacidad

La web no instala cookies: las fuentes van en `fonts/` y el mapa de Google solo se carga cuando el visitante
pulsa "Cargar mapa". Si algún día se añade analítica, un formulario o un píxel de redes, hay que añadir un aviso
de cookies y actualizar `legal.html`.

## Verla en local

`menu.json` se carga con `fetch`, así que hay que servir la carpeta:

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Publicar en GitHub Pages

Settings → Pages → Source: "Deploy from a branch" → rama `main`, carpeta `/ (root)`.

La web queda en `https://shadowpj13.github.io/Dolce_Burger/`, que es la dirección que usan ahora el canonical,
Open Graph, los datos estructurados, `404.html`, `robots.txt` y `sitemap.xml`.

### Dominio propio

1. Settings → Pages → Custom domain, y configura el DNS como indica GitHub. Activa "Enforce HTTPS".
2. Busca y reemplaza `https://shadowpj13.github.io/Dolce_Burger/` por el dominio nuevo (con `/` final) en todo el proyecto.
3. `robots.txt` solo lo leen los buscadores en la raíz del dominio, así que empieza a funcionar con el dominio propio.
4. Da de alta el dominio en Google Search Console y envía `sitemap.xml`.
