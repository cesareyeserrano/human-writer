#!/bin/sh
# Regression corpus for aidetect.mjs — run after ANY change to the pattern
# rules. Each fixture has an expected score range; a score outside the range
# means a rule regressed (stopped catching a tell, or started over-flagging).
#
# Usage:  sh run-tests.sh          (from the skill/project root)

cd "$(dirname "$0")" || exit 1
fail=0

check() {
  file="$1"; lang="$2"; min="$3"; max="$4"; label="$5"
  score=$(node aidetect.mjs --json --lang "$lang" "$file" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).score))")
  if [ "$score" -ge "$min" ] && [ "$score" -le "$max" ]; then
    echo "PASS  $label  score=$score (expected $min-$max)"
  else
    echo "FAIL  $label  score=$score (expected $min-$max)"
    fail=1
  fi
}

node --check aidetect.mjs || exit 1

# heavy AI text must score high
check samples/ai-sample-en.txt   en 55 95 "ai-sample-en    (heavy AI, EN)"
check samples/ai-sample-es.txt   es 55 95 "ai-sample-es    (heavy AI, ES)"
# structured spec with repeated openers must be flagged, but is not "heavy"
check samples/ai-spec-es.txt     es 18 45 "ai-spec-es      (repeated openers)"
# genuine human text must stay low — false-positive guard
check samples/human-sample-en.txt en 0 15 "human-sample-en (human, FP guard)"
# adversarial fixtures (from the code-attack review):
# engagement-bait slop must NOT score as human anymore
check samples/ai-slop-en.txt     en 16 60 "ai-slop-en      (engagement slop, was 0)"
check samples/ai-slop-es.txt     es 16 60 "ai-slop-es      (slop ES, was 0)"
# formal academic register is HUMAN — must stay under 'moderately' (30)
check samples/human-academic-en.txt en 0 25 "human-acad-en   (FP guard, was 47)"
check samples/human-academic-es.txt es 0 25 "human-acad-es   (FP guard, was 38)"
# adversarial round 2 (2026-07-20): card-layout slop with emoji/bold-labels,
# period-form antithesis, operative -ing tails — scored 3 and 0 before the fix
check samples/ai-cards-en.txt    en 50 90 "ai-cards-en     (card slop, was 3)"
check samples/ai-cards-es.txt    es 40 85 "ai-cards-es     (card slop ES, was 0)"
# bilingual doc: mixed mode must see the Spanish-half tells (was 10)
mixed_lang=$(node aidetect.mjs --json samples/ai-mixed-en-es.txt | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).lang))")
if [ "$mixed_lang" = "mixed" ]; then echo "PASS  mixed-detection  lang=$mixed_lang"; else echo "FAIL  mixed-detection  lang=$mixed_lang (expected mixed)"; fail=1; fi
check samples/ai-mixed-en-es.txt auto 25 70 "ai-mixed-en-es  (mixed mode, was 10)"
# CLI: '--lang auto <file>' must work, not crash (was ENOENT crash)
if node aidetect.mjs --lang auto samples/human-sample-en.txt >/dev/null 2>&1; then
  echo "PASS  cli --lang auto <file>"
else
  echo "FAIL  cli --lang auto <file> (crashed)"; fail=1
fi
# CLI: missing file must give a clean error, not a stack trace
err=$(node aidetect.mjs no-such-file.txt 2>&1); rc=$?
if [ "$rc" -eq 1 ] && ! printf '%s' "$err" | grep -q "at readFileSync"; then
  echo "PASS  cli missing-file clean error"
else
  echo "FAIL  cli missing-file (rc=$rc, raw stack trace?)"; fail=1
fi

# inline probes: each new rule must keep firing
probe() {
  text="$1"; lang="$2"; rule="$3"; label="$4"
  hits=$(printf '%s' "$text" | node aidetect.mjs --json --lang "$lang" - | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d).findings.find(f=>f.id==='$rule');console.log(r?r.hits:0)})")
  if [ "$hits" -gt 0 ]; then
    echo "PASS  $label  ($rule: $hits hits)"
  else
    echo "FAIL  $label  ($rule: 0 hits)"
    fail=1
  fi
}

probe "It's not a librarian, it's a convincing generator. Their job isn't to invent facts, but to point you elsewhere." en en-negative-parallel "negative parallelism EN (comma + but forms)"
probe "Its core function isn't search; it's prediction. That doesn't reduce your duty; it increases it." en en-negative-parallel "negative parallelism EN (semicolon forms)"
probe "La IA no es una herramienta cualquiera, sino un cambio de fondo. No se trata de velocidad, sino de criterio." es es-negative-parallel "paralelismo negativo ES"
probe "Revenue grew 40%, highlighting the importance of diversification, reflecting broader trends." en en-trailing-ing "trailing -ing EN"
probe "Los ingresos crecieron, destacando la importancia de diversificar, evidenciando su compromiso." es es-trailing-ger "gerundio final ES"
probe "The meticulous team showcased a captivating result that aligns with our goals." en en-inflated-vocab "inflated vocab EN (Wikipedia set)"
probe "Our goal is to empower farmers. La IA busca potenciarlo todo y desbloquearla por completo, una herramienta indispensable que redefine el agro." es es-inflated-vocab "inflated ES (enclíticos potenciarlo/desbloquearla)"
probe "El sector está siendo transformado. En términos de costos, la IA juega un rol central." es es-calques "calcos del inglés ES"
probe "La agricultura moderna avanza rápido.
El dato: el mercado crecerá un 20% este año según el informe." es es-label-colon "etiqueta-dos-puntos ES (El dato:)"
probe "Here is our assessment of the situation.
The Challenge: reps cannot rely on scripts.
The Pivot: teams must learn data." en en-label-colon "label-colon EN (The Challenge:)"
probe "Sembrando Algoritmos Para El Campo
Un Futuro Sostenible y Desafiante
El campo cambia rápido y nadie lo duda." es es-title-case-heading "Title Case headings ES"
probe "Los drones escanean el campo, optimizando las rutas de riego, aliviando los costos del productor." es es-trailing-ger "gerundio operativo final ES (optimizando/aliviando)"

# adversarial round 2 (2026-07-20) — false negatives closed
probe "It's not magic. It's math. Success isn't luck. It's consistency." en en-negative-parallel "negative parallelism EN (PERIOD form)"
probe "No es magia. Es matemáticas. No es suerte. Es constancia aplicada cada semana." es es-negative-parallel "paralelismo negativo ES (forma con PUNTO, inicio de frase)"
probe "El plan era simple - lanzar rápido - y funcionó bien." es em-dash "guion simple espaciado como raya ( - )"
probe "It caches queries, enabling instant dashboards, ensuring fast loads, empowering every team." en en-trailing-ing "trailing -ing EN operativo (enabling/ensuring/empowering)"
probe "Data plays a crucial role here. The report serves as a roadmap. The field continues to evolve." en en-inflated-vocab "formulas verbales EN (plays a role / serves as / continues to evolve)"
probe "Whether you're a founder or a freelancer, read this. The result? Fewer mistakes. Let's explore why." en en-slop-phrases "slop EN (whether you're a / The result? / let's explore)"
probe "🚀 Speed matters a lot here.
✅ Trust is everything for the team." en emoji-decor "emoji decoration (2+)"
probe "**Speed:** instant results for everyone.
**Trust:** shared definitions across teams." en bold-label "bold-label cards (**X:** x2)"
probe "Ya sea que trabajes solo o en equipo, esto te sirve para todo el año." es es-calques "calco ES 'ya sea que'"
probe "A continuación, veremos los pasos del proceso. En definitiva, es la mejor inversión posible." es es-transitions "transiciones ES (A continuación presentacional / En definitiva)"
probe "El taller fue útil y tu futuro yo te lo agradecerá cuando llegue el cierre." es es-slop-phrases "slop ES (tu futuro yo te lo agradecerá)"
probe "Probamos el proceso durante un mes. ¿El resultado? Menos errores en cada entrega." es es-label-colon "pregunta-etiqueta ES (¿El resultado?)"
probe "Es un factor clave y una herramienta poderosa que genera sinergias en el equipo." es es-inflated-vocab "inflado ES (sinergias; clave/poderosa ahora son tier débil)"

# adversarial round 3 (2026-07-20): precision + fresh slop angles
probe "Más que una herramienta, es un aliado estratégico para el negocio." es es-negative-parallel "paralelismo ES 'más que X, es Y'"
probe "No es magia. Es matemáticas aplicadas con paciencia." es es-negative-parallel "paralelismo ES punto (inicio de frase)"
probe "La migración salió bien. Así de simple. Y eso lo cambia todo para el equipo." es es-slop-phrases "slop ES (así de simple / y eso lo cambia todo)"
probe "No es casualidad que las mejores empresas la adopten primero." es es-slop-phrases "slop ES (no es casualidad que)"
probe "La analítica se ha convertido en un pilar del negocio moderno." es es-inflated-vocab "inflado ES (convertido en un pilar)"
probe "Probamos dos meses. ¿La buena noticia? Funciona sin cambiar el proceso." es es-label-colon "pregunta-etiqueta ES (¿La buena noticia?)"
probe "Stop chasing metrics. Start chasing outcomes that customers notice." en en-slop-phrases "slop EN (Stop X-ing. Start Y-ing.)"
probe "Here's why: metrics lie when nobody owns them. Think about it." en en-slop-phrases "slop EN (Here's why / Think about it)"
probe "Most teams drown in tickets. That's where automation comes in." en en-slop-phrases "slop EN (that's where X comes in)"
probe "Not hype. Not magic. Just compound learning applied daily." en en-slop-phrases "slop EN (Not A. Not B. Just C.)"
probe "Data has become a cornerstone of modern business strategy." en en-inflated-vocab "inflado EN (become a cornerstone)"

# false-positive guards: these must NOT fire the rule
noprobe() {
  text="$1"; lang="$2"; rule="$3"; label="$4"
  hits=$(printf '%s' "$text" | node aidetect.mjs --json --lang "$lang" - | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d).findings.find(f=>f.id==='$rule');console.log(r?r.hits:0)})")
  if [ "$hits" -eq 0 ]; then
    echo "PASS  $label  ($rule: correctly silent)"
  else
    echo "FAIL  $label  ($rule: $hits false hits)"
    fail=1
  fi
}

probe "This is a test – with an en dash used as a dash substitute." en em-dash "em-dash rule catches spaced en-dash (–)"
probe "This is a test -- with a double hyphen used as a dash substitute." en em-dash "em-dash rule catches spaced double-hyphen (--)"
noprobe "The study covers 2015–2023 across all regions in the panel data set." en em-dash "FP guard: digit range with unspaced en-dash (2015–2023)"
noprobe "Run the tool with --json to get machine output, or --lang es to force Spanish." en em-dash "FP guard: CLI flags --json / --lang"
probe "The plan failed. But here's the thing. In a world where everyone automates, the bottom line? Nobody reads the output." en en-slop-phrases "slop phrases EN"
probe "It isn't just a buzzword — it's a transformative force for the whole team." en en-negative-parallel "negative parallelism EN (em-dash separator)"
probe "Moreover, it's important to note that adoption keeps growing every year." en en-transitions "transitions EN (contracted it's important)"
probe "In today's rapidly evolving digital landscape, everything changed for the sales team." en en-cliche-opener "cliche opener EN (multi-adjective)"

noprobe "If you don't work heavily with technology, it's normal for this to feel like magic." en en-negative-parallel "FP guard: conditional 'don't…, it's' EN"
noprobe "We used tape rather than glue to fix the sensor mount in the field." en en-negative-parallel "FP guard: bare 'rather than' EN"
noprobe "There was a notably strong effect in the third cohort of the trial." en en-transitions "FP guard: mid-sentence 'notably' EN"
noprobe "We have offices in this part of the world and plan to expand next year." en en-cliche-opener "FP guard: 'in this part of the world'"
noprobe "Si no revisas el resultado, es normal que algo falle en producción." es es-negative-parallel "FP guard: condicional ES"
noprobe "Requisitos del módulo de monitoreo para la Raspberry Pi
Guía de instalación del servicio en producción
El servicio arranca sin privilegios nuevos." es es-title-case-heading "FP guard: encabezados ES bien escritos"
noprobe "El equipo revisó el informe, y cuando terminó, lo publicó sin cambios." es es-trailing-ger "FP guard: ', cuando' no es gerundio"
noprobe "Gabriel García Márquez y Mario Vargas Llosa
Museo Nacional de Antropología e Historia de la Ciudad de México
Universidad Autónoma de Barcelona y Universidad Complutense de Madrid
Los tres nombres aparecen en la portada del informe anual." es es-title-case-heading "FP guard: líneas de nombres propios ES"
noprobe "El acceso al crédito resulta crucial y la estabilidad es vital para invertir." es es-vocab-weak "FP guard: 2 palabras de énfasis no puntúan (min 3)"

# adversarial round 2 — FP guards for the new rules
noprobe "Lista de tareas:
- comprar pan
- revisar el informe
- llamar al cliente" es em-dash "FP guard: bullets markdown no son raya"
noprobe "El resultado de 5 - 3 es 2, y el periodo 2015 - 2023 completo." es em-dash "FP guard: matemática y rangos con guion espaciado"
noprobe "Whether you're ready or not, the deadline is Monday for the whole team." en en-slop-phrases "FP guard: 'whether you're ready' (sin artículo) no es slop"
noprobe "Vi a tu hermana ayer. ¿La conoces? Trabaja en el mismo edificio." es es-label-colon "FP guard: ¿La conoces? no es pregunta-etiqueta"
noprobe "The system wasn't tested. Its deployment was delayed until next quarter." en en-negative-parallel "FP guard: 'Its' posesivo tras punto no es antítesis"
noprobe "El informe no es público. Los datos se comparten bajo demanda." es es-negative-parallel "FP guard: punto sin antítesis ES"
noprobe "Great launch today. The demo went well and nobody asked hard questions." en emoji-decor "FP guard: prosa sin emoji"
noprobe "**Note:** the docs moved to the new site last week." en bold-label "FP guard: 1 solo bold-label no puntúa (min 2)"

# adversarial round 3 — precision guards (prosa humana legítima debe callar)
noprobe "El contrato no es definitivo. Es un borrador que legal revisa esta semana." es es-negative-parallel "FP guard: negación-punto a mitad de frase (elaboración humana)"
noprobe "Desconecta el equipo. A continuación, retira los cuatro tornillos de la tapa." es es-transitions "FP guard: 'A continuación' instructivo (sin marco presentacional)"
noprobe "Hoy en día casi nadie imprime fotos, y mi abuela tenía cajas enteras." es es-transitions "FP guard: 'hoy en día' ya no puntúa (humano frecuente)"
noprobe "Ya sea que llueva o haga sol, el partido se juega el sábado." es es-calques "FP guard: 'ya sea que llueva' (impersonal, gramática normal)"
noprobe "Marta fue una pieza clave del proyecto y el torno es una herramienta potente." es es-vocab-weak "FP guard: pieza clave + herramienta potente (2 hits < min 3)"
noprobe "Más que nunca, es importante revisar las cifras antes de publicar." es es-negative-parallel "FP guard: 'más que nunca, es' no es paralelismo"
noprobe "The good news is that we passed the audit without findings." en en-slop-phrases "FP guard: 'the good news is that' (no forma pregunta)"
noprobe "She told me to stop worrying about the launch date entirely." en en-slop-phrases "FP guard: 'stop worrying' sin 'Start X-ing'"

echo ""
if [ "$fail" -eq 0 ]; then echo "ALL TESTS PASSED"; else echo "SOME TESTS FAILED"; exit 1; fi
