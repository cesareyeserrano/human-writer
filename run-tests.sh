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

echo ""
if [ "$fail" -eq 0 ]; then echo "ALL TESTS PASSED"; else echo "SOME TESTS FAILED"; exit 1; fi
