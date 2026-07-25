# Informe de verificación

Evidencia real del protocolo de la Sección 7 del encargo, ejecutada contra el sitio generado con
los **5 CSV reales** que Iván exportó de la hoja (`site/data/main.csv` — 15.878 productos,
`agents.csv`, `agents-index.csv`, `validar.csv`, `top-tiendas.csv`). No es una build de prueba con
datos sintéticos — es el `node build.js` real, sobre el repositorio real.

## Salida completa del build real

```
$ node build.js
✓ data/main.csv — 15878 filas leídas
✓ data/agents.csv — 10 filas leídas
✓ data/validar.csv — 9 filas leídas
✓ data/top-tiendas.csv — 24 filas leídas
✓ data/agents-index.csv — 13 filas leídas
✓ generado learn.html
✓ generado privacy.html
✓ generado terms.html
✓ generado agents.html
✓ generado index.html
✓ generado verify.html
✓ generado top-stores.html
✓ generado sitemap.xml (7 URLs)
Build terminado: 7 páginas generadas, 0 pendientes de CSV.
```

Informe de validación de agentes impreso por consola (nunca en el HTML — ver más abajo por qué):

```
--- agents.html (data/agents.csv) ---
OK — Mulebuy, Superbuy, ACBuy, USFans, Litbuy, AllChinaBuy, Oopbuy: coinciden con su código no-negociable
AVISO — Kakobuy: forzado a FINDSES; la hoja real trae "hc9hz" (conflicto confirmado, ver DISCOVERY.md §5bis)
EXCLUIDO — CSSBuy: no está en la Sección 2, no se publica sin instrucción explícita
EXCLUIDO — Joyagoo: exclusión permanente

--- verify.html (data/validar.csv) ---
OK — USFans, Mulebuy, Oopbuy, Litbuy, Hipobuy, Superbuy, ACBuy: coinciden
AVISO — Kakobuy: forzado a FINDSES; la hoja trae "hc9hzs"
EXCLUIDO — Joyagoo: exclusión permanente

--- top-stores.html (data/top-tiendas.csv) ---
23 tiendas reales publicadas (Goat Official, Hotdog Official, TopStoney, 168shops, Umkao,
aaaajersey, 3125tiger, Noghost, Firerep, Singor, 711 Shoes Store, Survival Source, Shoe Hui Trading,
McDodo, Decor Home, Shanggao Golf, Daqian Foreign Trade, A Ben Ready-to-wear, Super Big Player,
Topdreamer, Pony, SEA, Stupid Elephant)
EXCLUIDO — "TIENDA TEST": fila de prueba/placeholder, no es una tienda real
```

**Confirmación directa del bug que reportó Iván:** la fila real de Kakobuy en `AGENTS.csv` trae
`register=https://ikako.vip/r/hc9hz` — el código ajeno está literalmente en la hoja, no solo en el
sitio en vivo. El build lo detecta, lo excluye del cálculo y publica `ikako.vip/r/FINDSES` en su
lugar en las tres páginas donde aparece Kakobuy.

## grep — cero apariciones de códigos/agentes prohibidos (repo real)

```
$ grep -ril "hc9hz" --include="*.html" --include="*.txt" --include="*.xml" site/
count: 0
$ grep -ril "joyagoo" --include="*.html" --include="*.txt" --include="*.xml" site/
count: 0
$ grep -ril "cnfans" --include="*.html" --include="*.txt" --include="*.xml" site/
count: 0
$ grep -l "FINDSES" site/*.html
agents.html learn.html verify.html
$ grep -il "cssbuy" site/*.html
none — excluido correctamente pese a tener ficha completa en la hoja
$ grep -o 'href="#"' site/*.html
none
$ grep -il "supabase|paywall|download on google play|get started" site/*.html
none
```

Nota de proceso (de la iteración anterior con datos sintéticos, ya corregida): la primera versión
del build dejaba el nombre de un agente excluido en un comentario HTML de depuración. Se detectó con
este mismo grep y se corrigió moviendo el informe de validación a la consola exclusivamente — nunca
se vuelve a escribir dentro de un HTML servido.

## curl — HTML real sin ejecutar JS (servidor estático local)

```
index.html      -> HTTP 200 size=17185
agents.html     -> HTTP 200 size=18982
verify.html     -> HTTP 200 size=13722
top-stores.html -> HTTP 200 size=39807
learn.html      -> HTTP 200 size=15085
privacy.html    -> HTTP 200 size=7340
terms.html      -> HTTP 200 size=10403
```

Fragmentos reales confirmados en el HTML devuelto:

```
$ curl -s .../agents.html | grep -o "Mulebuy\|Superbuy\|ACBuy\|USFans\|Litbuy\|AllChinaBuy\|Oopbuy\|Kakobuy" | sort -u
ACBuy, AllChinaBuy, Kakobuy, Litbuy, Mulebuy, Oopbuy, Superbuy, USFans   (8 de 8 agentes esperados)

$ curl -s .../top-stores.html | grep -o "Goat Official\|TopStoney\|Survival Source" | sort -u
Goat Official, Survival Source, TopStoney
```

## URLs de imagen `geilicdn` — intactas con query string

```
$ grep -o 'src="https://si.geilicdn.com[^"]*"' site/index.html | head -3
src="https://si.geilicdn.com/pcitem1888214674-2a5800000191ce2ce7ea0a23041a_3276_3276.jpg?w=600&h=600"
src="https://si.geilicdn.com/open1733523732-1234478995-6e7c0000019379901cfd0aa0834c_1180_1572.jpg"
src="https://si.geilicdn.com/pcitem1888214674-503a0000019ad9c74bcf0a2301b4_4590_4590.jpg"
```
Query string (`?w=600&h=600`) conservada tal cual, sin recortar — cumple la regla de la Sección 2.

## Responsive — Chromium/Playwright en los 5 anchos requeridos, con datos reales

```
360 / 390 / 768 / 1024 / 1440px × (index, agents, verify, top-stores, learn) → overflow = 0px (las 25 combinaciones)
```

Cero desbordamiento horizontal. Revisión visual manual de capturas en 390px y 1440px: 8 tarjetas de
agente reales en `agents.html` (Mulebuy destacado como "MOST RECOMMENDED", ratings, comisiones,
pros/cons reales, botón "Register free with Kakobuy" apuntando al enlace forzado FINDSES), grid de
productos reales en `index.html` (Air Jordan, New Balance, Ralph Lauren, The North Face, etc.), sin
texto cortado ni tarjetas desbordando el viewport en ningún ancho.

**Limitación del entorno de captura, no del sitio:** las imágenes de producto (`geilicdn.com`) y de
logo de agente (`play-lh.googleusercontent.com`, `s3-eu-west-1.amazonaws.com`, etc.) aparecen en
blanco en las capturas porque este sandbox de desarrollo bloquea la salida de red a esos dominios —
confirmado arriba que las URLs `src` en el HTML son correctas y completas. En un navegador con
acceso a Internet normal (o en producción) cargarán con normalidad.

## Hallazgos nuevos en los datos reales — flags para Iván (no resueltos por mi cuenta)

1. **Kakobuy sigue mal en el origen.** No solo el sitio en vivo — `AGENTS.csv` (la hoja) también
   tiene `hc9hz` en el campo `register`. El sitio nuevo lo corrige (`FINDSES` forzado), pero
   convendría arreglarlo también en la hoja para que no vuelva a colarse en otro sitio o integración
   futura.
2. **CSSBuy** tiene una ficha completa y real en `AGENTS.csv` (rating 4.3, código
   `inviteCode=CHINESE2024`) pero no está en la tabla no-negociable del encargo original. No se ha
   publicado — necesita que Iván decida si se añade a la Sección 2 y con qué código correcto.
3. **Hipobuy** no tiene ficha en `AGENTS.csv` (solo aparece en la tabla de formato de enlace), así
   que se publica como opción de compra en `verify.html` pero no tiene tarjeta propia en
   `agents.html`. Si se quiere su ficha completa, falta añadir su fila en la pestaña `AGENTS`.
4. **AllChinaBuy** pasa de "condicional/sin confirmar" a **confirmado y publicado** — su código real
   en la hoja (`ELEwZR`) coincide exactamente con el valor que ya se había visto en el sitio.

## `/agents` — continuidad de URL (sin resolver, pendiente de Hostinger)

Igual que en la versión anterior de este informe: pendiente de que Iván confirme si Hostinger sirve
`/agents` → `/agents.html` automáticamente o hace falta una regla de reescritura/301 explícita — no
verificable desde este entorno sin acceso al panel de Hostinger.

## Pendiente antes de considerar el sitio 100% terminado

1. Iván decide sobre Kakobuy (origen), CSSBuy (nuevo agente) e Hipobuy (ficha incompleta) — ver
   arriba.
2. Confirmar el mecanismo de purga de caché de Hostinger tras subir (no verificable desde este
   entorno).
3. Confirmar el comportamiento de `/agents` vs `/agents.html` en Hostinger.
4. Subir el contenido de `site/` (excepto `data/*.csv` y los `README.md`) a Hostinger.
