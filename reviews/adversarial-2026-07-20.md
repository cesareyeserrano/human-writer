# Revisión adversarial — falsos negativos del scorer · 2026-07-20

Ataque dirigido a `aidetect.mjs`: textos construidos deliberadamente con
patrones de IA reales que se sospechaba fuera del catálogo de regex, más
probes aislados por patrón. Resultado global: **dos textos de slop de IA
"de manual" puntúan 3/100 (EN) y 0/100 (ES) — verdict "reads human"** —
sin que el scorer flaguee un solo patrón léxico. La suite de regresión
(`run-tests.sh`) pasa 20/20 al mismo tiempo: los gaps son de cobertura,
no regresiones.

Cada hallazgo es reproducible pasando la frase de ejemplo por
`node aidetect.mjs -` y verificando `findings: NONE`.

## HIGH — patrones de IA frecuentes con 0 detección

### 1. Paralelismo negativo separado por PUNTO (EN y ES)

> "It's not magic. It's math." · "No es magia. Es matemáticas."

La regex de `en-negative-parallel` / `es-negative-parallel` acepta
`[,;:—–]` como separador pero **no el punto**, que es la forma más
natural en prosa pulida (y la del propio ejemplo estrella de NOTES.md:
"AI doesn't fail loudly. It fails politely."). Tres paralelismos con
punto seguidos = 0 hits. El fix del Test 4 cubrió coma, punto y coma y
raya; el punto quedó fuera. Riesgo FP: bajo si se exige que la segunda
frase empiece con `It's / Es / Se trata de` inmediatamente después.

### 2. Guion simple espaciado como raya (`palabra - palabra`)

> "ven resultados reales - equipos más rápidos - y abren…" → 0 hits

El fix de 2026-07-15 añadió en-dash (`–`) y doble guion (`--`) pero no
el **guion simple con espacios**, que es el sustituto más común en
teclados hispanos y en copy-paste que normaliza el em-dash a `-`. La
omisión probable es el FP con bullets markdown (`\n- item`): se
resuelve exigiendo espacio-no-salto a ambos lados
(p. ej. `[^\S\n]-[^\S\n]`).

### 3. Coletillas "-ing" operativas en EN (asimetría con ES)

> ", ensuring fast load times", ", enabling instant dashboards",
> ", allowing…", ", empowering…", ", transforming…", ", streamlining…",
> ", boosting…" → **0 hits** (7 coletillas en un párrafo)

Exactamente el bug que los Tests 5-6 arreglaron en ES (se añadieron ~18
gerundios operativos: optimizando, garantizando, permitiendo…) sigue
vivo en EN: `en-trailing-ing` solo lista calcos de "highlighting". La
lista EN necesita el tier operativo: *ensuring, enabling, allowing,
empowering, transforming, streamlining, boosting, offering, providing,
helping, driving, fostering, resulting in, leading to, making it*.

### 4. Fórmulas verbales de inflación EN

> "plays a crucial role in", "serves as a roadmap", "stands as a
> reference", "continues to evolve" → 0 hits

ES caza "juega un rol/papel" como calco, pero el original inglés
("plays a … role") no está en ninguna regla EN. "serves as / stands as"
(cópula inflada) y "continues to evolve/grow" (cierre de párrafo
clásico de LLM, documentado en el set de Wikipedia) tampoco.

### 5. Slop asimétrico ES (existe la regla EN, falta el espejo)

- "**tu futuro yo te lo agradecerá**" → 0 (EN tiene
  `your future self will thank you`).
- "**Ya sea que** dirijas… **o**…" → 0 (calco de "Whether you're X or
  Y", que tampoco está en EN — ver #6).
- "**A continuación**, veremos…", "**En definitiva**," "**hoy en
  día**," "**un abanico de** posibilidades" → 0. ("en definitiva" ya
  estaba anotado como gap abierto en NOTES; confirmado.)
- "**¿El resultado?** Mejores productos." → 0: `es-label-colon` solo
  acepta 5 sustantivos literales (La clave/La conclusión/El secreto/La
  verdad). La forma pregunta-etiqueta es productiva: ¿El resultado? ¿La
  diferencia? ¿Lo mejor? — conviene generalizar `¿(?:El|La|Lo)
  [palabra]{1,3}\?` a inicio de frase.

### 6. Fórmulas de engagement EN sin cubrir

> "Whether you're a founder or a freelancer…", "From onboarding to
> offboarding, …", "The result? Fewer mistakes.", "The takeaway? Start
> today." → 0 hits

"The result?/The takeaway?" es el espejo EN de la pregunta-etiqueta:
`en-slop-phrases` solo tiene "the bottom line?". "Whether you're" y
"From X to Y," (apertura de rango falso) son plantillas de listicle
puro.

### 7. Estructura markdown de ChatGPT: emoji y bold-label

> `🚀 **Speed:** instant results.` ×4 → 0 hits

Dos gaps combinados: (a) **emoji de sección/bullet** (🚀✅💡🔑) — el
catálogo EN lo menciona (línea ~170) pero el scorer no lo mide en
absoluto; es de los tells más baratos de detectar por regex y de los
más inequívocos. (b) **`**Etiqueta:**`** — el bold rompe el anchor de
`en-label-colon` (exige `The [A-Z]…` literal a inicio) y en ES exige
artículo El/La/Lo, así que ni "**Velocidad:**" ni "Velocidad:" cuentan.

## MED — umbrales gameables y asimetrías menores

### 8. El tier débil (min: 3) se esquiva con sinónimos fuera de lista

> "a crucial step and a vital safeguard … an essential practice and a
> key milestone in any holistic strategy built on synergy" → 0

Dos hits de lista + *essential, key, holistic, synergy* (ninguno
listado) = bajo el umbral. Candidatos EN ausentes en todos los tiers:
*essential, key (adjetivo), holistic, synergy, paradigm, transformative,
empower, streamline, revolutionize* (ES tiene revoluciona/redefine; EN
no).

### 9. Umbral de burstiness en escalón, trivial de gamear

Texto 8× la misma frase (CV=0, penalti 24) + **una** frase corta y una
media → CV 0.4, penalti 18; una más y cruza CV≥0.5 → penalti 0, con el
95% del texto aún perfectamente uniforme. La CV global es manipulable
con outliers; una métrica por ventana (CV mínima en ventanas de 5-8
frases) resistiría mejor. Relacionado con el gap abierto ya anotado de
uniformidad a nivel párrafo.

### 10. Doble conteo potencial en modo mixed

`es-vocab-weak` matchea palabras inglesas idénticas (*crucial, vital,
fundamental*): en un doc `mixed` real esas palabras puntúan en ambos
rulesets. Menor (pesos bajos), pero sesga el score de docs bilingües.
Además `detectLang` clasificó "en" un texto 50/50 real de los probes:
la lista de stopwords ES es más corta y contiene "inteligencia" (¿un
resto de fixture?), lo que sesga el ratio.

## Contexto que atenúa (y no)

SKILL.md ya declara que el scorer sub-reporta y que el agente debe
barrer contra el catálogo. Pero los catálogos también fallan aquí: de
los hallazgos 1-8, solo el emoji (EN, de pasada) y "en definitiva"
(NOTES, gap abierto) aparecen mencionados. **El agente que barra con el
catálogo al pie de la letra tampoco cazaría estos patrones** — el gap
es del proyecto, no solo del regex. Y el verdict "reads human" en 0-11
invita a declarar victoria justo en los textos donde el allowlist quedó
ciego.

## Recomendación de orden de ataque

1. #3 y #1 (asimetría EN de coletillas + punto en paralelismo): máximo
   retorno, regexes ya existentes que solo amplían listas/separadores.
2. #7 emoji (regla nueva de 1 línea, FP casi nulo en prosa) y
   bold-label (aflojar anchors existentes).
3. #5/#6 espejos EN↔ES de slop (patrón ya establecido en el proyecto).
4. #2 guion simple espaciado con guard de no-salto.
5. #8 vocabulario y #9 burstiness por ventana, validando cada regla
   contra los textos-oro antes de entrar (método ya confirmado en
   NOTES).

Todo cambio de regex: correr `sh run-tests.sh` y añadir probe + FP
guard por regla nueva, como hasta ahora.
