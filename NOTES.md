# Refinement log — field testing aidetect.mjs

Bitácora de pruebas reales contra textos del usuario. Cada entrada: qué se
probó, qué falló o faltó, y qué se corrigió. Esto alimenta el catálogo y el
scorer antes de publicar a git.

## Test 1 — Spec técnica de un módulo de monitoreo (ES) · 36 → 12

- **Aprendizaje**: en documentos estructurados (specs, requirements) el piso
  del score es ~10-15, no 0-3: viñetas, tríadas de listas reales y
  Given/When/Then son formato legítimo, no tells. Humanizar ≠ hacer casual.
- **Tell dominante**: la muletilla "El sistema debe…" ×11 (uniformidad de
  arranque de frase). GAP: el scorer no mide repetición de arranques de
  frase — lo detecté a ojo. **Pendiente**: regla "same sentence opener ≥4×".
- CV subió 0.33 → 0.83 solo variando arranques y largos. La penalización de
  burstiness funcionó como palanca correcta.

## Test 2 — Copy de producto de una CLI (EN) · 18 → 0

- **BUG encontrado**: el paralelismo negativo `"X," not "Y"` /
  `it's not X, it's Y` NO se detectaba — la regex solo cazaba
  `not just/only`. El tell más citado de la investigación se escapaba en su
  forma más común.
- Em-dashes (4) fue el tell dominante y el arreglo principal.

## Test 3 — Texto de asesoría de management (ES) · 9 → 0

- Texto ya humano; único tell: 8 em-dashes. El skill hizo lo correcto:
  **toque mínimo**, no reescribir de más. Confirmado como principio: si el
  score ya es <12, solo tocar el tell puntual.
- Aprendizaje de reescritura: cada em-dash se reemplaza según su función
  (encabezado→paréntesis, explicación→dos puntos, contraste→conjunción),
  no con un reemplazo único mecánico.

## Test 4 — Ensayo "fast intern" (EN) · 11 → 29 → 4

- **El bug del Test 2, confirmado grave**: el texto tenía 6 paralelismos
  negativos (incluido el subtítulo "It's not a librarian, it's a convincing
  generator") y el scorer daba 11/100 "reads human". Score engañosamente
  bajo.
- **FIX aplicado** en `aidetect.mjs` (EN y ES):
  - `it's not X, it's Y` (be-verbs con coma o punto y coma)
  - `isn't/aren't/wasn't A ; it's B`
  - `not X, but Y`
  - `doesn't X; it Y` (action-verbs SOLO con punto y coma)
  - ES: `no es X, sino Y`, `no se trata de X, sino Y`
- **FALSO POSITIVO cazado y corregido**: `if you don't work heavily with
  technology, it's normal…` — condicional, no paralelismo. Regla: los
  action-verbs (`don't/doesn't/did`) requieren `;` para contar; con coma
  hay demasiados condicionales legítimos.
- Cap del patrón subido 12 → 18 (6 hits reales lo saturaban).
- **Aprendizaje de reescritura**: dejar UNA antítesis intencional si es el
  gancho del texto ("AI doesn't fail loudly. It fails politely."). El tell
  es la densidad, no la existencia. No sobre-corregir.
- Regresiones verificadas tras el fix: human-en 10, ai-en 74, ai-es 72 ✓.

## Incidente de proceso — corpus perdido (2026-07-15)

El scratchpad temporal se limpió entre turnos y se perdieron los fixtures de
los Tests 1-3. **Corrección**: el corpus de regresión ahora vive en el
proyecto (`samples/` + `run-tests.sh`, con rangos esperados por fixture,
probes por regla y guards de falso positivo). Los textos reales del usuario
NO se guardan como fixtures (contenido sensible/laboral); se crean
sintéticos que reproducen el mismo tell (ej. `samples/ai-spec-es.txt` para
openers repetidos).

## Gaps cerrados

- [x] **Repetición de arranque de frase** — nueva regla estructural
      `openerRepetition()`: ≥4 frases con el mismo arranque de 3 palabras
      penaliza 4-12 pts. Validada con fixture sintético (7× "el sistema
      debe" → +10).
- [x] **Coletilla -ing/gerundio FINAL** ("…, highlighting the importance
      of") — nuevas reglas `en-trailing-ing` / `es-trailing-ger`. La forma
      documentada por Wikipedia era la final, no la inicial; ambas cubiertas.
- [x] Paralelismo negativo formas reales (Test 4).

## Tests 5-6 — Artículos "IA de manual": agro (ES) y sales (EN) · 2026-07-15

Los dos textos más IA hasta ahora, y el scorer los subestimó gravemente
(agro 21, sales 48). Siete gaps encontrados y corregidos:

- **BUG enclíticos ES**: `potenciarlo` no matcheaba `potenciar?\b` — el
  pronombre pegado (lo/la/se) rompe el word boundary. Por eso el agro dio
  **0 hits de vocabulario inflado** teniendo seis. Arreglado con colas
  opcionales `(?:l[oa]s?|se)?`. Regla general: en ES, todo infinitivo del
  diccionario necesita tolerar enclíticos.
- **Gerundios operativos de coletilla** (", optimizando las rutas",
  ", aliviando los costos") — la lista solo tenía calcos de highlighting.
  Añadidos ~18 gerundios operativos. Guard: ", cuando" no dispara.
- **NUEVA regla `es-title-case-heading`** (estructural): encabezados con
  Mayúscula Por Palabra son calco del inglés — español solo capitaliza la
  primera. Excluye acrónimos y la palabra tras ":". FP guard con encabezados
  bien escritos pasa. Riesgo FP conocido: títulos cargados de nombres
  propios; vigilar.
- **NUEVA regla label-colon EN/ES**: "The Challenge:", "The Pivot:",
  "El dato:" — plantilla de tarjeta-resumen de IA. Solo a inicio de línea
  (aprendizaje: el probe a mitad de línea falló, y ese es el comportamiento
  correcto).
- **NUEVA regla `es-calques`**: "está siendo + participio", "en términos
  de", "jugar un rol", "tomar acción" — estaban en el catálogo pero no en
  el scorer.
- Vocabulario añadido — ES: indispensable, redefine, profundamente, marca
  la diferencia, impulsada por, de vanguardia. EN: cutting-edge, bespoke,
  undoubtedly, flawless, game-changer. Transiciones EN: Consequently,
  Ultimately. Cliché EN: "in the Age of", "in an era of/where".
  Atribución ES: "se estima que". Transición ES: "No obstante".
- Resultado tras fixes: agro 21→79, sales 48→70 (medición correcta);
  reescrituras 79→0 y 70→4. Corpus completo sin regresiones (20/20).
- **Aprendizaje de calibración**: cuando el score "se siente" bajo frente a
  la lectura humana, casi siempre es cobertura de léxico/reglas, no el
  modelo de pesos. Diagnosticar mirando qué reglas dieron 0 hits contra lo
  que el ojo ve.

## Ronda adversarial (3 revisores independientes) · 2026-07-15

Tres revisiones en paralelo: ataque al código, auditoría de docs, y dry-run
de agente fresco siguiendo SKILL.md literal. 29 hallazgos (10 HIGH); todos
los HIGH y MED corregidos y cubiertos con fixtures/checks nuevos:

**Falsos positivos (el pecado capital) — corregidos:**
- Académico humano EN puntuaba 47 y ES 38. Causas: `rather than` suelto
  disparaba "paralelismo" (+6 sin paralelismo alguno); crucial/vital/robust/
  fundamental puntuaban desde el primer hit siendo registro formal normal;
  "notably" a mitad de frase; "En la actualidad" como cliché. Fixes:
  `rather than` eliminado; **tier débil con umbral de racimo** (`min: 3` —
  1-2 palabras de énfasis = prosa formal, 3+ = tell); conectores de una
  palabra anclados a inicio de frase; "En la actualidad" removido del
  cliché. Resultado: EN 47→14, ES 38→14.
- Líneas de nombres propios ("Gabriel García Márquez y…") disparaban
  Title Case ES. Fix: la línea debe EMPEZAR como encabezado (artículo/
  determinante/gerundio). Costo asumido: pierde encabezados que empiezan
  por sustantivo ("Agricultura de Precisión…") — FP peor que FN aquí.

**Falsos negativos — corregidos:**
- Slop de engagement puntuaba 0 en ambos idiomas. Nueva regla
  `en-slop-phrases` (here's the thing / the bottom line? / let's break it
  down / in a world where / your future self will thank you / it's less
  about…more about / what does this mean for you) y ES: "en un mundo
  donde", "¿La clave?", "no se trata de X: se trata de Y" (separador `:`),
  ", lo que demuestra/refleja". Slop EN 0→20, ES 0→31.
- `isn't X **—** it's Y` (¡la forma más común!) escapaba: separadores del
  paralelismo ampliados a `[,;:—–]`. + `it's important to note` contraído,
  `research indicates/suggests`, inflexiones (leveraged/unlocked/boasted),
  "in today's rapidly evolving digital landscape" (multi-adjetivo).
- Bullets sin punto final colapsaban a 1 "frase" (burstiness y openers
  ciegos): el split de frases ahora también corta por salto de línea.
- Texto bilingüe 50/50: winner-take-all apagaba medio ruleset. Nuevo modo
  **`mixed`** (≥30% del idioma minoritario → corren ambos rulesets).

**CLI/robustez:** parser de args reescrito (`--lang auto <archivo>`
crasheaba; archivo llamado "en"/"es" ilegible; `--lang` inválido ahora
avisa); ENOENT da error limpio, no stack trace; line numbers de reglas
ancladas corregidos (off-by-one por el `\n` capturado).

**Docs:** contradicción "no añadas claims" vs "añade un dato" resuelta
(regla única: especificidad solo con lo ya presente o ilustrativo obvio;
jamás cifras/fuentes inventadas); "el scorer sub-reporta: barre contra el
catálogo antes de re-medir" ahora es instrucción explícita del loop;
gotchas falsas corregidas; em-dash y slop documentados en ambos catálogos;
conteos y scores de ejemplo actualizados; `.gitignore` añadido.

**Deuda aceptada a sabiendas** (LOW, documentada): saturación del tope de
escala (texto pesado ×3 solo sube 74→90); JSON también trunca ejemplos a 5
(el render lo declara: "first 5 of N"); el catálogo sigue siendo una
allowlist de regex — un parafraseo a un sinónimo de distancia puntúa bajo.
Esa es la naturaleza del enfoque: el scorer es linter parcial, el agente
barre con el catálogo (ahora lo dice el SKILL).

## Gaps abiertos (pendientes de confirmar con más pruebas)

- [ ] Vocabulario ES: faltan quizá "clave" (adjetivo pospuesto), "abordar",
      "en definitiva". Confirmar con textos reales antes de añadir.
- [ ] "poder + infinitivo" (perífrasis de hedging ES, confirmada por la
      fuente nativa) — sin codificar: demasiado FP-propensa en crudo.
- [ ] Uniformidad a nivel PÁRRAFO (cada sección con la misma forma
      claim→elaboración→ejemplo) no se mide; solo la de frase. Detectarla
      barato no es obvio.
- [x] Detector de idioma en textos 50/50 ES/EN → resuelto con modo mixed.
- [x] Documentados en los catálogos: paralelismo (formas nuevas +
      excepción del gancho), label-colon EN/ES, Title Case ES, gerundios
      operativos, nota de enclíticos, vocabulario nuevo, em-dash por
      función, slop de engagement, tier débil con racimo (2026-07-15).

## Evidencia de campo: detectores comerciales · 2026-07-15

El usuario pasó UN MISMO texto humanizado (ensayo literario ES, 6/100 en
nuestro scorer) por tres detectores comerciales de IA: resultados **0%,
64% y 100%**. Dispersión total en el mismo input. Confirma empíricamente
el "Honest scope" del skill: el score de un detector no es una meta — ni
para perseguir ni para celebrar. Lo único optimizable de forma estable es
que el texto lea humano.

Segundo aprendizaje de la misma prueba: intenté añadir una regla de
"densidad de enumeraciones triples" (el ensayo tiene 9) y la probé contra
el corpus ANTES de agregarla — nuestra mejor reescritura humana (4/100)
tiene 7. **Refutada: las tríadas de frase son prosa humana normal, no
tell.** La regla rule-of-three se queda solo con tríadas de palabra
sueltas. Método confirmado: toda regla candidata se prueba contra los
textos-oro antes de entrar al scorer.

La vara del proyecto, dicha por el usuario: no se busca "escribir como
humano" (imposible por definición), se busca **que no se note, o casi**.
Quitar el barniz de máquina es un problema acotado; imitar humanidad no.
Pasado el punto dulce, cada punto extra de score aplana buena prosa.

**Nota de naming (discutida y cerrada, sin cambios):** el usuario notó
tensión entre el nombre "Human-Writer" (suena a "esto ES un humano
escribiendo") y la vara real del proyecto (quita el barniz, no imita
humanidad). Se decidió mantener el nombre: es un término de categoría
estándar en la industria (como "Humanizer", "Undetectable.ai") que se
entiende como "hace que LEA humano", no como promesa literal. El README
ya declara el límite honesto en "Honest scope". No se toca nada.

## Bug reportado por el usuario: em-dash incompleto · 2026-07-15

El usuario humanizó un texto con el skill y **el resultado salió con
em-dashes** — es decir, el agente reescritor los introdujo y el re-score
no los cazó. Verificado: el **em-dash real (—)** sí se detectaba bien
(con o sin espacios). El bug era que sus **sustitutos** no se detectaban
en absoluto:

- **En-dash (–)** usado como raya de estilo (`palabra – palabra`) — 0 hits.
- **Doble guion (--)** usado como raya de estilo (`palabra -- palabra`) — 0 hits.

Ambos son intercambiables con el em-dash real en output de IA (y en
copy-paste desde distintas fuentes que normalizan el carácter distinto).

**Fix**: la regla `em-dash` ahora captura las tres formas, pero con
guardas para no romper usos legítimos:
- En-dash y doble guion solo cuentan **con espacio a ambos lados**
  (`\s–\s`, `\s--\s`). Esto evita falsos positivos en:
  - Rangos numéricos sin espacio: `2015–2023` (en-dash pegado a dígitos).
  - Flags de CLI: `--json`, `--lang` (el guion doble no tiene espacio
    inmediatamente después, a diferencia de la raya de estilo).
- Verificado contra nuestros propios docs (README.md, SKILL.md) para
  confirmar que no se auto-flaguean los flags que documentamos.
- Corpus histórico sin cambios (los fixtures no usaban estas formas, así
  que sus scores no se movieron — el fix solo amplía cobertura, no
  reescribe el modelo de pesos).

**Lección más profunda**: el agente que reescribe ES un LLM, y su estilo
por defecto ES el tell. Puede reintroducir em-dashes (u otras firmas)
en su propia reescritura sin darse cuenta. El SKILL.md ahora lo advierte
explícitamente: la reescritura también se barre — el re-score aplica al
output del agente igual que al texto original.

## Backlog de ideas (sin comprometer)

- **Perfiles por tipo de texto** (`--profile academico|corporativo|tecnico|
  cientifico|marketing`): overrides de pesos/mins/reglas por registro sobre
  el catálogo actual. El tier débil con `min: 3` fue el primer paso
  accidental en esta dirección. Candidata a primera feature formal
  (pipeline Aitri) si el proyecto se adopta ahí.
- **Adopción en Aitri**: no retroactiva; entrar al pipeline con la primera
  feature real (probablemente perfiles). Mantenimiento menor de diccionarios
  sigue siendo cambio directo.
- **"Tirada de deliberación"**: panel de jueces (workflow guardado) para
  evaluar lotes de ideas — valor/esfuerzo/riesgo por lentes independientes,
  como el adversarial de 2026-07-15 pero apuntado a decisiones de roadmap.

## Principios de reescritura confirmados en campo

1. Score <12: toque quirúrgico del tell puntual, nada más.
2. Docs estructurados: conservar formato (viñetas, G/W/T, IDs); el piso es
   ~10-15 y está bien.
3. Nunca inventar datos ni perder requisitos/umbrales/citas al reescribir.
4. Dejar una figura retórica intencional si es el gancho; matar la densidad.
5. Tras cada cambio de regex: `sh run-tests.sh` (la suite imprime PASS/FAIL por check). Nunca confiar
   en archivos temporales como corpus — solo lo que está en `samples/`.
