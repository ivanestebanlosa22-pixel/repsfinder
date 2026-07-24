# Informe de verificación

Evidencia real del protocolo de la Sección 7 del encargo. Todo lo de aquí abajo se ejecutó de
verdad en esta sesión — no es autoinformado.

## Estado real de los datos en este momento

`site/data/` **no contiene ningún CSV todavía** — Iván aún no los ha exportado (ver
`DISCOVERY.md` §7bis y `site/data/README.md`). Por tanto, en el repositorio solo están generados
y comprobados con datos 100% reales estos 3 archivos, que no dependen de ningún CSV:

- `site/learn.html`
- `site/privacy.html`
- `site/terms.html`

`site/agents.html`, `site/index.html`, `site/verify.html`, `site/top-stores.html` **no están
generados en el repo** — `build.js` se niega explícitamente a fabricarlos sin los CSV reales (ver
salida del build más abajo). Todo lo demás de este informe (grep, curl, responsive) se verificó de
dos formas:

1. **Contra los 3 archivos reales ya en el repo** (learn/privacy/terms).
2. **Contra una build de prueba completa**, ejecutada fuera del repo
   (`/tmp/.../scratchpad/site-test-build/`), usando `site/build.js` sin modificar pero con CSV de
   prueba sintéticos (nunca copiados al repo) diseñados a propósito para ejercitar cada regla de
   la Sección 2: un agente con código erróneo (USFans), Joyagoo/CNFans, Kakobuy con el código del
   código fuente de la app (conflicto de 3 vías), Hipobuy con código correcto, AllChinaBuy con
   código incorrecto, y una fila "TIENDA TEST" de prueba. Esto prueba que el *pipeline* es correcto;
   en cuanto Iván coloque los CSV reales en `site/data/`, correr `node build.js` genera las 4
   páginas que faltan con las mismas garantías, verificadas aquí con datos sintéticos.

## grep — cero apariciones de códigos/agentes prohibidos

Contra el repo real (`site/`, solo HTML/txt/xml):

```
$ grep -ril "hc9hz\|joyagoo\|cnfans" --include="*.html" --include="*.txt" --include="*.xml" site/
0 matches — clean
```

Contra la build de prueba completa (7 páginas, incluyendo agents.html/verify.html donde Joyagoo y
CNFans SÍ estaban presentes en el CSV de entrada y debían ser filtrados):

```
=== hc9hz ===        count: 0
=== joyagoo ===       count: 0
=== cnfans ===        count: 0
=== FINDSES presente === agents.html, learn.html, verify.html
=== href="#" ===      none
=== supabase/paywall/download google play === none
```

Nota de proceso: la primera pasada de la build de prueba SÍ tenía `joyagoo`/`cnfans` en el HTML —
no en el contenido visible, sino en un comentario HTML de depuración que yo mismo había incrustado
para explicar por qué se excluía cada agente. Se detectó con este mismo grep, se corrigió moviendo
ese informe a la consola del build (nunca al HTML servido — ver `site/build.js` y
`site/lib/pages/agents.js`), y se volvió a verificar hasta dar 0 resultados. Evidencia de que el
protocolo de verificación cumplió su función.

## curl — HTML real sin ejecutar JS

Servidor estático local (`node`, sin framework) sirviendo la build de prueba completa:

```
$ curl -s http://localhost:8899/index.html -o /dev/null -w "HTTP %{http_code} size=%{size_download}\n"
HTTP 200 size=10796
$ curl .../agents.html      → HTTP 200 size=10050
$ curl .../verify.html      → HTTP 200 size=13012
$ curl .../top-stores.html  → HTTP 200 size=7972
$ curl .../learn.html       → HTTP 200 size=15085
$ curl .../privacy.html     → HTTP 200 size=7340
$ curl .../terms.html       → HTTP 200 size=10403
```

Las 7 páginas devuelven `200` con el HTML final ya renderizado (contenido de texto plano, sin
placeholders de carga tipo "0" ni `<div id="root">` vacío).

## Responsive — Chromium/Playwright en los 5 anchos requeridos

Capturado en 360 / 390 / 768 / 1024 / 1440px para las 5 páginas de contenido. Overflow horizontal
medido con `document.documentElement.scrollWidth - clientWidth` en cada combinación
(25 mediciones):

```
360px  index/agents/verify/top-stores/learn  → overflow = 0px (las 5)
390px  index/agents/verify/top-stores/learn  → overflow = 0px (las 5)
768px  index/agents/verify/top-stores/learn  → overflow = 0px (las 5)
1024px index/agents/verify/top-stores/learn  → overflow = 0px (las 5)
1440px index/agents/verify/top-stores/learn  → overflow = 0px (las 5)
```

Cero desbordamiento horizontal en las 25 combinaciones. Revisión visual manual de las capturas en
390px y 1440px (agents.html, top-stores.html, learn.html): sin texto cortado, sin tarjetas
desbordando el viewport, gradientes y paleta consistentes con el tema real de la app.

## Enlaces rotos / referencias prohibidas

- `grep -o 'href="#"' site/*.html` → ninguno.
- `grep -il "supabase\|paywall\|download on google play"` → ninguno.
- Sin planes de precio, sin botones de descarga de app, sin llamadas a Supabase, sin widget de
  chat IA — confirmado por ausencia total en el código fuente generado (no solo "no lo añadí",
  sino verificado con grep tras generar el HTML final).

## `/agents` — continuidad de URL

La página de agentes se sirve en `/agents.html`, mismo slug que el `/agents` indexado hoy
(sin extensión vs. con extensión `.html` es una diferencia real a resolver en el servidor de
Hostinger — ver nota en `DISCOVERY.md` §6, no se ha podido confirmar la configuración de reescritura
de URLs de Hostinger desde este entorno). **Pendiente de que Iván confirme** si Hostinger sirve
`/agents` → `/agents.html` automáticamente o si hace falta una regla de reescritura/301 explícita.

## Pendiente antes de considerar el sitio 100% terminado

1. Iván exporta los 4 CSV a `site/data/` (instrucciones en `site/README.md` y `site/data/README.md`).
2. Correr `node build.js` — genera `index.html`, `agents.html`, `verify.html`, `top-stores.html`
   con datos reales, e imprime por consola cualquier conflicto de código de agente encontrado en la
   hoja real (Sección 2).
3. Repetir este mismo protocolo de verificación (grep + curl + responsive) contra el HTML generado
   con datos reales — no solo contra la build de prueba sintética de este informe.
4. Confirmar con Iván el mecanismo de purga de caché de Hostinger tras subir (no se ha podido
   verificar desde este entorno — sin acceso a la configuración de Hostinger ni al codebase actual
   del sitio, ver `DISCOVERY.md` §6).
5. Confirmar el comportamiento real de `/agents` vs `/agents.html` en Hostinger.
