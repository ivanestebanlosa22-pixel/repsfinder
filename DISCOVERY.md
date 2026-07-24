# DISCOVERY.md — RepsFinder: de app a web estática

Fase 0 del proyecto "qualityrepsfinder.com HTML estático". Este documento es la fuente de verdad
para construir las 5 páginas de contenido + legal. Generado antes de escribir una sola línea de HTML,
según lo exigido por el encargo.

Estado: **completo en lo que es accesible desde este entorno, con dos bloqueos documentados en la
sección 7 que requieren una decisión de Iván antes de pasar a Fase 1.**

---

## 1. Código de la app (proyecto Expo/React Native)

Repo: `ivanestebanlosa22-pixel/repsfinder` (el único repo disponible en esta sesión — ver sección 4).
Es el proyecto Expo/RN real de RepsFinder v3.3.0 (`app.json`), owner EAS `ivanukyy`.

Tabs leídas completas: `app/(tabs)/descubrir.tsx`, `agentes.tsx`, `validar.tsx`, `top-tiendas.tsx`,
`aprender.tsx`, `app/(tabs)/_layout.tsx`, `app/_layout.tsx`, `app/legal.tsx`,
`src/i18n/translations.ts`, `src/i18n/legalTranslations.ts`, `src/components/AnimatedBackground.tsx`,
`src/utils/agentLinks.ts`.

**Nota i18n:** `src/i18n/locales/en.json` NO es la fuente real de copys (archivo genérico sin usar).
La fuente real es `src/i18n/translations.ts` (`translations.en`), con los textos legales
inyectados desde `src/i18n/legalTranslations.ts` (`legalTranslationsEN`).

### 1.1 Paleta de colores real (citas literales del código)

- **Fondo global:** negro puro `#000` (`AnimatedBackground.tsx`, todas las tabs).
- **Acento primario de marca (dominante en UI de tabs):** `#00d4aa` (turquesa). Const `COLORS.PRIMARY`
  en `descubrir.tsx`, `validar.tsx`, `agentes.tsx`, `top-tiendas.tsx`, `aprender.tsx`.
- **Acento de navegación / legal.tsx:** `#00e5b0` (verde-teal, casi idéntico a `#00d4aa`, mismo rol
  de marca pero usado en un archivo distinto — tab bar activa y toda la pantalla `legal.tsx`).
  **Decisión para el sitio nuevo: usar `#00d4aa` como único acento**, por ser el dominante en superficie
  de producto real (las 5 tabs), y reservar `#00e5b0` solo si se quiere replicar el estilo exacto de
  `legal.tsx`. Documentado, no inventado — ambos son reales.
- **Secundario:** `#0066FF` (azul). **Acento rojo:** `#FF3366`. **Acento azul claro:** `#00a3ff`.
  Gradiente de marca recurrente en barras/botones: `#0066FF → #FF3366`.
- **Cards:** `rgba(20,20,20,0.4)` (CARD_BG), `rgba(10,10,10,0.4)` (CARD_BG_DARK).
- **Bordes:** `rgba(40,40,40,0.3)` / `rgba(30,30,30,0.3)`.
- **Texto:** primario `#fff`, secundario `#888`, terciario `#666`, oscuro `#555`.
- **Glassmorphism (agentes.tsx / top-tiendas.tsx):** `rgba(255,255,255,0.03–0.08)`.
- **Oro/plata/bronce (rankings):** `#FFD700` / `#C0C0C0` / `#CD7F32`.
- **Estados (canónico, de `aprender.tsx`):** éxito `#00d4aa`, advertencia `#FFD700`, peligro `#FF4444`.
  Variante en `legal.tsx`: advertencia `#ffa500`, peligro `#ff0000` (cajas legales `warningBox`/`dangerBox`).
- **Badges de producto (`validar.tsx`):** TOP `#8B5CF6`, RECOMMENDED `#4FACFE`, DEAL `#AB47BC`.
- **Rating pill:** dorado `#FFD700` sobre `rgba(255,215,0,0.12)`.

### 1.2 Tipografía

- **Sin fuente custom** (no hay `expo-font`/`useFonts` en ninguna tab). Fuente de sistema
  (San Francisco / Roboto). Para la web: usar una pila `-apple-system, "Segoe UI", Roboto, sans-serif`
  equivalente, no inventar una tipografía nueva.
- Peso dominante: **`900`** en logo, títulos H1/H2, precios y CTAs.
- Logo: `fontSize 32, weight 900`. H1 hero: `28–34px, weight 900`. H2 sección: `20–26px, weight 900`.
- Subtítulos de sección: `13px`, color secundario `#888`.
- Cuerpo: `14px`, `lineHeight ~21-22`.
- Labels pequeños: `10px`.

### 1.3 Componentes / patrones reutilizables

- **Cards** con `borderRadius 12–20`, fondo `CARD_BG`/`CARD_BG_DARK`, borde `BORDER_LIGHT`.
- **Glass cards** (agentes/top-tiendas): borde `rgba(255,255,255,0.08)`, sombra difusa.
- **Botón primario:** degradado `#0066FF → #FF3366` (o `→ #00a3ff`), `borderRadius 10-14`,
  texto blanco `weight 900`.
- **Botón secundario:** transparente, borde del color temático.
- **Badges:** "✅ Verified" (`rgba(0,212,170,0.15)`), ranking oro/plata/bronce con emoji 🥇🥈🥉,
  banner "⭐ MOST RECOMMENDED AGENT BY THE COMMUNITY" para el #1, badges rotativos
  "🔥 Most Popular" / "⚡ Fastest" / "💎 Best Value" / "🌟 Top Rated" / "🏆 Premium".
- **Header de tab** (agentes/validar/top-tiendas/aprender): imagen de fondo de contenedor de carga
  (`shutterstock`, opacidad 0.25) + logo + barra degradada azul→rojo de 6px.
- **Iconografía: 100% emoji nativo, cero iconos vectoriales.** Ejemplos: 🏠👥✅🛍️📚 (tabs),
  👟👕👜🧴💎🧥👔📱🧢💍👦👖⌚🩱👩📦🧦 (categorías de producto), 🔒📸💬⭐🎁🔥⚠️🍪📧💰🛡️🚀 (estados/flujo).
  `AnimatedBackground.tsx` anima 24 emojis de moda flotando sobre fondo negro.

### 1.4 Copys reales por tab (citas literales en inglés — fuente `translations.en` salvo que se indique)

**descubrir.tsx (Home):** `tagline`: "Smart shopping. No surprises. Guaranteed." · `heroTitle`: "Find
the best replicas of sneakers, clothing and accessories, buying directly from factories in China." ·
`agentsTitle`: "Verified Purchase Agents" · `whyTitle`: "Why use RepsFinder?" con 3 `whyItems`
(catálogo actualizado / agentes verificados / alertas de precio) · `storesVerificationTitle`:
"Verified Weidian Stores" · `verificationTitle`: "Agent Verification Process" con 3 pasos
(análisis de historial / verificación de servicio / monitoreo continuo) · `productsTitle`: "Best
Selling Products" · `footerCopy`: "RepsFinder © 2026".

**agentes.tsx (Agents):** `heroTitleAgents`: "Buy from China\nwithout risks" · `heroSubtitleAgents`:
"Our verified agents manage your order from start to finish. You just choose and wait at home." ·
`howItWorks`: "How it works?" con 3 pasos (elegir agente / registro gratis / comprar seguro) ·
`whyUseAgent`: "Why use an agent?" con 3 razones (pago seguro / fotos QC gratis / soporte 24/7).

**validar.tsx (Validate):** `choosePurchaseAgent`: "Choose your Purchase Agent" ·
`productDescription`: "Product Description" · `productComparison`: "Product Comparison" ·
badges `topRated`: "TOP" / `recommended`: "RECOMMENDED" / `offer`: "DEAL".

**top-tiendas.tsx (Top Sellers):** `topSellers`: "Top Sellers" · `topStoresSubtitle`: "The best
verified stores by category" · `topStoresIntro`: "These are the stores with the highest rating,
best quality and most reliable by category. All have been verified by our team and have an
impeccable history." · campos por tienda: `trustScore`, `priceRange`, `specialties`,
`whatPeopleBuy`, `pros`/`cons`, `visitStore`: "Visit Store".

**aprender.tsx (Learn) — 100% contenido estático, NO depende de la hoja:** `learnHeroMainTitle`:
"Learn to Buy Quality Replicas" · `learnHeroMainSubtitle`: "The proven method to save 70-85% buying
directly from factory without errors or scams" · guía paso a paso de 6 pasos (`learnGuideTitle`:
"Step-by-Step Guide") con textos completos por paso · sección de bonos por agente (`AGENT_BONUSES`,
ver §1.6) · FAQ (`learnFaqTitle`: "Frequently Asked Questions", 4 preguntas/respuestas) ·
CTA final `learnFinalTitle`: "Ready to start!".

### 1.5 Disclaimer legal exacto (usar literal, es protección legal real)

> **"⚠️ REPSFINDER DOES NOT SELL PRODUCTS. We are an informational platform that compares external
> shopping agents. All transactions are performed directly with the agents."**
> — `legalTranslationsEN.terms7WarningBox`, mostrado en `app/legal.tsx`.

Otros disclaimers reales a reutilizar en el footer/legal del sitio nuevo:
- `disclaimer1DangerBox`: "⚠️ LEGAL ALERT: Many products shown in this app are replicas or
  imitations of registered brands. Their purchase and possession may have legal implications
  depending on your jurisdiction."
- `disclaimer3WarningBox`: "👤 These products are intended for PERSONAL USE. Commercial resale of
  replicas is illegal in most countries and may carry criminal penalties."
- `affiliate4WarningBox`: "📢 We do NOT show invasive third-party ads. Our only source of income is
  affiliate commissions when you use our registration links."
- `terms2Text`: "RepsFinder is an informational platform that provides:"

Contacto legal real: `legal@repsfinder.com` / `info@repsfinder.com` / `privacy@repsfinder.com` /
`report@repsfinder.com` — Madrid, Spain. `legalFooterRights`: "© 2026 RepsFinder. All rights reserved."

### 1.6 Contenido de app que NO debe pasar al sitio (confirmado, con cita)

| Elemento | Archivo | Cita |
|---|---|---|
| Planes de precio | `src/utils/payments.ts:76-104` | `'4.99€'`, `'29.99€'`, `'0.99€'`, `discoverPremiumPrice` |
| Chat IA Groq | `src/services/ai/aiService.ts:1-2` | `GROQ_API_URL`, `GROQ_API_KEY` |
| Supabase auth/paywall | `descubrir.tsx:42,557,830` | `supabase.auth.signUp/resetPasswordForEmail`, login modal completo |
| CTA a chat IA | `agentes.tsx:576` | `router.push('/chat')` |
| Contadores de marketing hardcoded (no reales) | `agentes.tsx:54-59` | `TRUST_STATS`: `+12.400`, `97%`, `+3.200`, `0€` |
| Historias de éxito con cifras inventadas | `aprender.tsx:724-729` | `$450`/`Mulebuy`, `$380`/`USFans`, etc. — marketing, no verificable |
| PaywallModal / PremiumHomeModal | varias tabs | bloqueos "Premium" |
| "Download on Google Play" | — | no se encontró ninguna mención literal (grep sin resultados) |

Los `AGENT_BONUSES` de `aprender.tsx` (códigos de bono por agente, hardcoded en el componente, no
en la hoja) sí son reutilizables como contenido — ver conflicto de código Kakobuy en §5.

---

## 2. Cómo lee la app la hoja de cálculo (mecanismo, reutilizado tal cual para el build script)

Endpoint público de Google Visualization API (sin service account, sin autenticación):

```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&sheet={NOMBRE}
https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&gid={GID}
```

`SHEET_ID = 1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8` (hoja titulada "repsfinder", propiedad de
`ivanestebanlosa22@gmail.com`, confirmado vía metadata de Drive).

Parseo idéntico en las 4 tabs que consumen la hoja:
```js
const response = await fetch(SHEET_URL);
const text = await response.text();
const cleanText = text.split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
const jsonString = cleanText.replace(/^.*?\(/, '').replace(/\);?\s*$/, '');
const json = JSON.parse(jsonString.match(/\{[\s\S]*\}/)[0]);
const rows = json.table.rows; // cada row.c[i]?.v es el valor de la celda i
```

El build script (`build.js`) reutilizará este mismo mecanismo y parseo — no se inventa uno nuevo.

---

## 3. Estructura real de la hoja (columnas por índice, confirmadas en el código fuente de cada tab)

### 3.1 Sheet `MAIN` (productos) — usada por `descubrir.tsx` y `validar.tsx`
Cabecera real confirmada **con datos reales leídos directamente de la hoja** (ver §4):
```
id, nombre, marca, Categoria, precio, ranking, activo, weidian_id, link weidian,
foto portada, foto 1, foto 2, foto 3, foto 4, foto 5, foto6, descripcion, descripcion ingles
```
18 columnas, ~1091 filas de producto reales confirmadas (zapatillas, ropa, accesorios). Filtro de
publicación: `activo === 'SI' && foto && nombre`.

### 3.2 Sheet `AGENTS` (agentes.tsx) — comparativa completa de agentes
28 columnas confirmadas en el código **y contra la hoja real** (ver §4):
```
name, logo, rating, reviews, bonus_es, bonus_en, register, productLink, badge_es, badge_en,
description_es, description_en, shippingTime_es, shippingTime_en, qcSuccess, shippingCost,
commission, founded, trustpilot, storage_es, storage_en, recommendation_es, recommendation_en,
pros_es, pros_en, cons_es, cons_en, mostrar
```

### 3.3 Sheet `AGENTS INDEX` (descubrir.tsx) — agentes destacados en home
8 columnas confirmadas en código y contra la hoja real:
```
agente, logo, mostrar, Rating, Costo Envío (ES), Media Días Total (ES), Costo Envío EN, Media Días Total EN
```

### 3.4 Sheet de formato de enlace (validar.tsx, `gid=2045150387`)
5 columnas confirmadas en código y contra la hoja real:
```
nombre, formato de link, mostrar, linkColumn (sin usar), logo
```

### 3.5 Sheet de tiendas (top-tiendas.tsx, `gid=229144007`)
25 columnas confirmadas en código y contra la hoja real:
```
id, mostrar, tipo, nombre, categoria_es, categoria_en, badge_es, badge_en, nota_es, nota_en,
url, password, valoracion, resenas, rango_precio, puntuacion_confianza, especialidades_es,
especialidades_en, lo_mas_comprado_es, lo_mas_comprado_en, pros_es, pros_en, contras_es,
contras_en, imagen
```

### 3.6 Sheet de productos de validar.tsx (`gid=985196103`, catálogo re-categorizado)
Mismas 18 columnas que MAIN, re-categorización por keywords en cliente — no aporta estructura nueva.

---

## 4. Auditoría real de la hoja de cálculo (acceso parcial confirmado — ver bloqueo en §7)

Acceso conseguido vía el conector de Google Drive del usuario (metadata + lectura de contenido),
**no** vía el endpoint gviz directo (bloqueado por política de red del entorno, ver §7).

**Confirmado con datos reales:**
- Tab `MAIN`: cabecera exacta + decenas de filas de producto reales (Nike Air Force 1 XP Batch,
  Crocs H12, Air Jordan 4 GX, Asics Gel-NYC PK, Air Jordan 11 Budget...) con URLs `geilicdn` intactas
  incluyendo query string (`?w=600&h=600`), tal como exige la regla de no recortar.
- Tab `AGENTS`: cabecera exacta de 28 columnas. **1 fila completa confirmada: OOPBUY**, con
  `register = https://oopbuy.com/register?inviteCode=GH40R4J0O` y
  `productLink = .../weidian/6867978837?inviteCode=GH40R4J0O` → **código `GH40R4J0O` coincide
  exactamente con la tabla no-negociable de la sección 2 del encargo.** ✅ Sin conflicto.
- Tab de formato de enlace (`gid=2045150387`): cabecera exacta de 5 columnas. **1 fila confirmada:
  Acbuy**, `formato de link = https://www.acbuy.com/product?id=6867978837&u=UD3WIU&source=WD` →
  código `UD3WIU`, coincide con el valor "visto hoy" citado en la sección 2 del encargo para ACBuy.
- Tab `AGENTS INDEX`: cabecera exacta de 8 columnas. 1 fila confirmada: **SUGARGOO**, con
  `mostrar = FALSE` (oculto). SUGARGOO no aparece en la tabla de agentes no-negociable del encargo —
  al estar oculto en origen, no se publica de todas formas. No es un conflicto.
- Tab de tiendas (`gid=229144007`): cabecera exacta de 25 columnas. La única fila visible en el
  fragmento capturado es **"TIENDA TEST"** — literalmente una fila de prueba/placeholder
  (`nombre = "TIENDA TEST"`, `especialidades = "Ropa Mujer|Vestidos|Moda Femenina"` genérico).
  **No se debe usar esta fila como contenido real** — queda flagueada para que Iván confirme si debe
  eliminarse de la hoja o si hay filas de tiendas reales más abajo no capturadas en este extracto.

**Contenido detectado en el mismo archivo de Google Sheets que NO pertenece a RepsFinder y que
NO se ha usado ni se usará para nada:** fragmentos en polaco bajo celdas combinadas tituladas
"MAJKELREPS SPREADSHEET", "LEGO", "JORDANY 1", "JORDANY 4", "KOSZULKI", "BLUZY" (aparente lista de
compras personal de Iván, con nombres de producto tipo "SZORTY HELLSTAR", "CANADA GOOSE VEST",
"KURTKA NIKE"). Esto vive en una pestaña distinta del mismo archivo de Drive. **Aviso para Iván:**
si algún día compartes este archivo de Drive con terceros o con otro script, esa pestaña queda
expuesta — no es información de RepsFinder.

**No confirmado / no accesible desde este extracto:** el resto de filas de `AGENTS`, `AGENTS INDEX`
y de la tabla de tiendas (USFans, Litbuy, Superbuy, Mulebuy, Kakobuy, Joyagoo, CNFans, AllChinaBuy,
Hipobuy, y las tiendas reales top-tiendas por categoría). Ver bloqueo y pregunta en §7.

---

## 5. Verificación de códigos de agente (Sección 2 del encargo) — estado

| Agente | Código no-negociable | App (`agentLinks.ts`, código fuente) | Hoja (confirmado) | Veredicto |
|---|---|---|---|---|
| Kakobuy | `FINDSES` | `ikako.vip/fue5c` (código `fue5c`, **tercer valor**, ni `hc9hz` ni `FINDSES`) | no confirmado en este extracto | **Conflicto de 3 vías documentado. Se usará `FINDSES` por ser instrucción explícita y no condicionada del encargo, pero el código fuente de la app (`fue5c`) también está desactualizado — Iván debería revisarlo ahí también.** |
| USFans | `RCGD5Y` | `RCGD5Y` ✓ | no confirmado en este extracto | Coincide en código app. Se publica. |
| Litbuy | `YBMHFG55L` | `YBMHFG55L` ✓ | no confirmado en este extracto | Coincide en código app. Se publica. |
| Superbuy | `Ey3NrI` | `Ey3NrI` ✓ | no confirmado en este extracto | Coincide en código app. Se publica. |
| Mulebuy | `200642502` | `200642502` ✓ | no confirmado en este extracto | Coincide en código app. Se publica. |
| Oopbuy | `GH40R4J0O` | `GH40R4J0O` ✓ | `GH40R4J0O` ✓ **confirmado en fila real de la hoja** | Sin conflicto. Se publica. |
| Joyagoo | — | presente en `agentLinks.ts` (`ref=300768147`) y en `AGENT_BONUSES` de `aprender.tsx` | — | **Exclusión permanente. No se publica pase lo que pase.** |
| CNFans | — | no aparece en el código de la app leído | — | **Exclusión permanente. No se publica.** |
| AllChinaBuy | visto hoy `ELEwZR` | no aparece en `agentLinks.ts` ni en las tabs leídas | no confirmado | **No se publica** — sin confirmación de hoja ni de código fuente, según la regla de conflicto del encargo. |
| Hipobuy | visto hoy `YZKOGE9NE` | `YZKOGE9NE` ✓ (en `agentLinks.ts`) | no confirmado en este extracto | Coincide con el código app. Aun así, al no estar entre los "5 confirmados" y no tener fila de hoja verificada en este extracto, **se deja en espera de confirmación de Iván antes de publicar** (ver §7). |
| ACBuy | visto hoy `UD3WIU` | `UD3WIU` ✓ (en `agentLinks.ts`) | `UD3WIU` ✓ **confirmado en fila real de la hoja** | Sin conflicto. Se publica. |

---

## 6. Auditoría del sitio publicado hoy (qualityrepsfinder.com)

**No se ha podido verificar de forma independiente.** No existe un repositorio del codebase de
qualityrepsfinder.com en esta cuenta (`list_repos` solo devuelve `ivanestebanlosa22-pixel/repsfinder`,
el proyecto Expo). El acceso HTTP saliente a `qualityrepsfinder.com` desde este entorno está bloqueado
por la política de red del sandbox (mismo bloqueo que con Google Sheets, ver §7).

Por tanto, los 3 hallazgos que el encargo da como confirmados (Kakobuy con `hc9hz`, Joyagoo en las 10
posiciones de "verificado", contadores de home servidos como "0") **se toman como ciertos por
venir de Iván, pero no se han podido re-confirmar de forma independiente desde este entorno.**
El sitio nuevo se construye para no reproducir ninguno de los tres, en cualquier caso.

---

## 7bis. Resolución (decisión de Iván, recibida tras la primera versión de este documento)

Iván confirmó y resolvió el bloqueo de la sección 7: el build **no dependerá de red en ningún
momento**. Iván exportará manualmente cada pestaña relevante desde Google Sheets (Archivo →
Descargar → Valores separados por comas) y colocará los CSV en `data/`:

| Archivo | Pestaña / gid de origen | Usada por |
|---|---|---|
| `data/main.csv` | Sheet `MAIN` | Home (productos destacados) y ejemplos en Verify |
| `data/agents.csv` | Sheet `AGENTS` | Página de Agentes (comparativa completa) **y** widget de agentes de la Home |
| `data/validar.csv` | gid `2045150387` (tabla de formato de enlace, 5 columnas) | Página de Validar (construcción de enlaces por agente) |
| `data/top-tiendas.csv` | gid `229144007` | Página de Top Tiendas |

**Decisión de implementación (no una pestaña adicional):** en vez de exportar también
`AGENTS INDEX`, `index.html` reutiliza la misma lista de `data/agents.csv` ya validada contra la
Sección 2 para su widget de agentes — un paso de exportación menos para Iván, sin pestaña sin usar.
Si Iván prefiere que la home respete la curaduría independiente de `AGENTS INDEX` (por ejemplo,
agentes ocultos solo en home como se vio con `SUGARGOO`), avisar para añadir ese CSV.

**Nota de interpretación, documentada por transparencia:** `validar.tsx` en la app usa en realidad
*dos* sheets distintos — su propio feed de productos re-categorizado (`gid=985196103`, columnas
idénticas a `MAIN`) y la tabla de formato de enlace (`gid=2045150387`). El plan de Iván solo lista 5
CSV, sin `gid=985196103`. Interpretación aplicada: la página estática de "Validar" no necesita un
segundo feed de productos duplicado — no hay buscador ni filtrado en cliente en un sitio 100%
estático — así que reutiliza `data/main.csv` para cualquier ejemplo de producto, y `data/validar.csv`
(el sheet de formato de enlace) solo para construir los enlaces de compra por agente. Si esto no es
lo que Iván quiere, avisar antes de depender de ello en producción.

Esto también resuelve el problema de la §4: exportar pestaña por pestaña trae solo esa pestaña, sin
la lista personal en polaco mezclada.

`aprender.tsx` queda confirmado sin pestaña propia — es 100% contenido estático embebido en el
componente (`GUIDE_STEPS`, `AGENT_BONUSES`, checklist, FAQ), ya extraído íntegro en la §1.4 y
reutilizable directamente sin esperar ningún CSV.

**Estado de los CSV en este momento:** `data/` todavía no contiene los 5 archivos — Iván aún no los
ha exportado. `build.js` está escrito para fallar con un error explícito y accionable si falta
cualquiera de los 5, nunca para generar una página con contenido inventado o vacío en su lugar.

---

## 7. Bloqueos que requieren decisión de Iván antes de Fase 1 (histórico — resuelto en §7bis)

**Confirmado técnicamente:** el entorno de ejecución de esta sesión tiene una lista blanca de salida
de red (egress allowlist) que **no incluye** `docs.google.com` ni `qualityrepsfinder.com`. Se
comprobó con `curl`, con la herramienta de fetch web, y ejecutando `node -e "fetch(...)"` directamente
— los tres devuelven `403` / `Host not in allowlist`. Esto es una restricción del entorno de esta
sesión, no del script que se va a construir: el mismo `build.js`, ejecutado por Iván en su propio
ordenador (con salida a Internet normal), leerá la hoja sin problema mediante el mecanismo de la §2.

Sí se consiguió un acceso parcial a la hoja a través del conector de Google Drive de la cuenta de
Iván (ver §4), pero por el tamaño real del archivo (364 MB, con imágenes incrustadas) la exportación
completa (CSV/XLSX) falla por límite de tamaño, y la lectura en "texto natural" sólo devuelve un
fragmento truncado del documento — suficiente para confirmar cabeceras de columna y una fila de
ejemplo por pestaña relevante, pero **no** para enumerar todas las filas de agentes ni de tiendas.

**Esto deja dos huecos reales, no rellenados con contenido inventado:**
1. No puedo confirmar los códigos de Kakobuy, USFans, Litbuy, Superbuy, Mulebuy, Joyagoo, CNFans,
   AllChinaBuy e Hipobuy **directamente contra una fila real de la pestaña `AGENTS`** (solo Oopbuy).
2. No tengo ninguna fila real de tienda de la pestaña de `top-tiendas` (solo la fila de prueba
   "TIENDA TEST").

**Pregunta para Iván** (ver mensaje de chat adjunto a este documento): cómo prefiere cerrar este
hueco antes de que se generen las páginas de Agentes y de Top Tiendas con datos 100% reales.
