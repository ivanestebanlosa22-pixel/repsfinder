# Cómo rellenar esta carpeta

`build.js` lee estos 5 archivos CSV y **no arranca sin ellos**. Expórtalos desde la hoja de Google
Sheets `repsfinder` (ID `1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8`) uno por uno:

Para cada pestaña: ábrela en Google Sheets → **Archivo → Descargar → Valores separados por comas
(.csv)** → guarda el archivo descargado en esta carpeta con el nombre exacto de la tabla:

| Pestaña a abrir en Sheets | Nombre de archivo exacto |
|---|---|
| `MAIN` | `main.csv` |
| `AGENTS` | `agents.csv` |
| La pestaña con gid `2045150387` (tabla de formato de enlace por agente, "POPUP AGENTES") | `validar.csv` |
| La pestaña con gid `229144007` (tiendas top) | `top-tiendas.csv` |
| `AGENTS INDEX` (opcional) | `agents-index.csv` |

`agents-index.csv` es opcional: si lo incluyes, la home respeta la curaduría real de esa pestaña
(por ejemplo, un agente puede estar validado y aparecer en la página de Agentes pero seguir oculto
del widget de la home si esa pestaña trae `mostrar=FALSE` para él — así es como se comporta la app
real). Si no lo incluyes, la home simplemente muestra los primeros agentes validados por rating.

Importante: descarga **una pestaña activa a la vez** (haz clic en la pestaña abajo en Sheets antes
de descargar) — si descargas con otra pestaña activa, Google exporta esa otra, no la que quieres.

No hace falta tocar nada más. Cuando actualices datos en la hoja, repite esta exportación y vuelve
a correr `node build.js` desde la carpeta `site/`.
