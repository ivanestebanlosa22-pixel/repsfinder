# RepsFinder — sitio estático

Este directorio **es** el sitio web (`qualityrepsfinder.com`). No hay servidor, no hay build de
producción con dependencias, no hay JavaScript de cliente para mostrar contenido: `node build.js`
genera archivos `.html` planos que se suben tal cual a Hostinger.

## Regenerar el sitio (cuando cambien los datos en la hoja)

**1. Exporta la hoja de Google Sheets** `repsfinder`
(`https://docs.google.com/spreadsheets/d/1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8`) — CSV o TSV,
el build detecta el separador automáticamente.

Para cada pestaña: ábrela → **Archivo → Descargar → CSV o TSV** → guarda el archivo en `site/data/`
con el nombre exacto:

| Pestaña en Sheets | Archivo | ¿Obligatorio? |
|---|---|---|
| `MAIN` | `data/main.csv` | Sí |
| `AGENTS` | `data/agents.csv` | Sí |
| gid `2045150387` ("POPUP AGENTES", formato de enlace por agente) | `data/validar.csv` | Sí |
| gid `229144007` (tiendas top) | `data/top-tiendas.csv` | Sí |
| `AGENTS INDEX` | `data/agents-index.csv` | No — sin ella, la home usa un fallback razonable |

Detalle completo en `data/README.md`.

**2. Corre el build:**

```bash
cd site
node build.js
```

No hace falta `npm install` — el build no usa dependencias externas (parser CSV propio en `lib/csv.js`).

**3. Lee la salida por consola.** El build:
- genera cada página `.html` directamente en esta carpeta (`index.html`, `agents.html`,
  `verify.html`, `top-stores.html`, `learn.html`, `privacy.html`, `terms.html`),
- regenera `sitemap.xml` con la fecha real del build,
- imprime un **informe de validación de agentes/tiendas** por consola (nunca lo escribe dentro del
  HTML) — ahí ves exactamente qué agente se excluyó y por qué, y si el código de la hoja no coincide
  con la Sección 2 del encargo original.
- si falta algún CSV, esa página concreta no se genera (nunca se rellena con datos inventados) y el
  comando termina con código de salida distinto de cero para que no pase desapercibido.

**4. Sube el contenido de `site/` a Hostinger** (todo lo que hay en esta carpeta, tal cual — no
subas `data/*.csv` ni `README.md`, no son parte del sitio público).

**5. Purga la caché de servidor en Hostinger** después de subir. Confirmar con Iván el método
exacto (panel de Hostinger o plugin de caché) — ha sido un problema recurrente en otras propiedades
suyas y no se ha podido verificar el mecanismo concreto de este hosting desde este entorno de
desarrollo (ver `DISCOVERY.md`).

## Reglas de datos de agentes (no tocar sin instrucción explícita)

Toda la lógica de validación/exclusión de agentes vive en `lib/agents.js` y está documentada ahí
mismo con comentarios. Resumen:

- **Exclusión permanente:** Joyagoo, CNFans — nunca se publican, pase lo que pase en la hoja.
- **Kakobuy:** el código publicado se fuerza siempre a `FINDSES` (`ikako.vip/r/FINDSES`),
  independientemente de lo que traiga la hoja.
- **USFans, Litbuy, Superbuy, Mulebuy, Oopbuy:** se publican solo si el código de la hoja coincide
  exactamente con el código no-negociable. Si no coincide, ese agente se excluye y queda reportado
  en la consola del build como conflicto crítico.
- **AllChinaBuy, Hipobuy, ACBuy:** se publican solo si el código de la hoja coincide con el valor
  "visto hoy" documentado en el encargo original. Si no coincide, se excluyen.

## Estructura

```
site/
  build.js              — orquestador del build
  data/                  — CSV exportados a mano (no se suben a Hostinger)
  lib/
    csv.js               — parser CSV sin dependencias
    agents.js             — reglas no-negociables de la Sección 2
    agent-data.js          — carga y valida data/agents.csv
    layout.js              — header/footer/nav/JSON-LD compartidos
    pages/                  — un generador por página
  assets/css/style.css    — CSS único, mobile-first
  *.html, robots.txt, llms.txt, sitemap.xml  — el sitio publicado
```
