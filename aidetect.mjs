#!/usr/bin/env node
// aidetect.mjs — bilingual (EN/ES) AI-writing "tell" scorer.
// Zero dependencies. Node >= 18.
//
// Usage:
//   node aidetect.mjs <file>                # score a file
//   node aidetect.mjs --lang es <file>      # force language (auto|en|es)
//   node aidetect.mjs --json <file>         # machine-readable output
//   echo "some text" | node aidetect.mjs -  # read from stdin
//
// It does NOT rewrite. It flags patterns + gives a 0-100 "AI-tell score"
// (higher = more machine-sounding) so an agent can target its edits and
// re-score before/after. The scorer UNDER-reports by design (regex catalog,
// not a model): treat it as a partial linter, and sweep the text against
// references/anti-patterns-*.md before calling a rewrite done. See SKILL.md.

import { readFileSync } from "node:fs";

// ---------- pattern catalog ----------
// Each rule: { id, weight, cap, re (global), why, fix, min? }
// weight = points per match, capped per-rule. `min` = minimum hits before
// the rule scores at all (cluster threshold, for register-ambiguous words
// that are normal in formal human writing — one "crucial" is not a tell).

const SHARED = [
  { id: "em-dash", weight: 3, cap: 9,
    // Real em-dash (spaced or not) — PLUS the two substitutes AI/copy-paste
    // commonly use instead: a spaced en-dash ( – ) and a spaced double-hyphen
    // ( -- ). Both require surrounding spaces so this doesn't fire on digit
    // ranges ("2020–2023") or CLI flags ("--json", which has no space after
    // the hyphens).
    re: /\s—\s|—|\s–\s|\s--\s/g,
    why: "Em-dash overuse is a strong LLM tell (AI uses them several times more often than humans). Also catches en-dash (–) and double-hyphen (--) used the same way.",
    fix: "Replace by function: heading→parentheses, explanation→colon, joined ideas→period or comma, contrast→conjunction. Keep at most one per few paragraphs." },
  { id: "curly-quotes", weight: 1, cap: 3, re: /[“”‘’]/g,
    why: "Curly/smart quotes suggest auto-formatted machine output.",
    fix: "Use straight quotes unless the house style demands curly." },
  { id: "rule-of-three", weight: 4, cap: 12, re: /\b([\w']+),\s+([\w']+),?\s+and\s+([\w']+)\b|\b([\w']+),\s+([\w']+)\s+y\s+([\w']+)\b/g,
    why: "Triads (X, Y, and Z) are an LLM rhythm signature when frequent.",
    fix: "Break the triad: keep one item, or vary to two/four, or split into sentences." },
];

const EN = [
  { id: "en-negative-parallel", weight: 6, cap: 18,
    re: /\bit['’]?s not (?:just|only|merely|simply|about)\b|\bit['’]?s not\s+[\w'’]+(?:\s+[\w'’]+){0,5}\s*[,;:—–]\s*it['’]?s\b|\bnot only\b[^.]*\bbut(?:\s+also)?\b|\bnot\s+[\w'’]+(?:\s+[\w'’]+){0,5},\s+but\b|\b(?:is|are|was|were)n['’]?t\s+[\w'’]+(?:\s+[\w'’]+){0,5}\s*[,;:—–]\s*(?:it['’]?s|its|they['’]?re|but|rather)\b|\b(?:does|do|did)n['’]?t\s+[\w'’]+(?:\s+[\w'’]+){0,5};\s+it\b/gi,
    why: "Negative parallelism: \"it's not X, it's Y\" / \"not X, but Y\" / \"isn't A — it's B\". LLMs use it ~3x more than humans.",
    fix: "State the claim directly. Cut the negated setup clause. (One deliberate antithesis as a hook is fine — five are a signature.)" },
  { id: "en-inflated-vocab", weight: 3, cap: 18,
    re: /\b(delve|delving|tapestry|testament|underscore[sd]?|nestled|realm|navigat(?:e|ing)|foster(?:s|ed|ing)?|leverag(?:e|es|ed|ing)|unlock(?:s|ed|ing)?|harness(?:es|ed|ing)?|elevate[sd]?|seamless(?:ly)?|myriad|plethora|boast(?:s|ed|ing)?|vibrant|bustling|intricate|meticulous(?:ly)?|bolster(?:s|ed|ing)?|showcas(?:e|es|ing|ed)|enhanc(?:e|es|ing|ed)|captivating|majestic|fascinating|align(?:s|ed|ing)? with|cutting[- ]edge|bespoke|undoubtedly|flawless(?:ly)?|game[- ]chang(?:er|ing))\b/gi,
    why: "Inflated/promotional vocabulary favored by LLMs (Wikipedia 'Signs of AI writing' set).",
    fix: "Swap for a plain, specific word (use, show, area, field…) or delete." },
  { id: "en-vocab-weak", weight: 2, cap: 8, min: 3,
    re: /\b(robust|landscape|crucial|vital|pivotal|paramount|profound(?:ly)?)\b/gi,
    why: "Cluster of register-ambiguous emphasis words (crucial/vital/robust/landscape…). One or two are normal formal prose; a pile-up is the tell.",
    fix: "Keep the one that earns its place; replace the rest with plain words." },
  { id: "en-transitions", weight: 4, cap: 12,
    re: /(?:^|[.!?]\s+|\n)\s*(?:moreover|furthermore|additionally|consequently|ultimately|importantly|notably)\b|\b(?:in conclusion|in summary|to sum up|that being said|it['’]?s worth noting|it['’]?s important to note|it is important to note)\b/gi,
    why: "Formulaic connective/hedge openers.",
    fix: "Delete or replace with a concrete link. Humans rarely open with 'Moreover'." },
  { id: "en-vague-attribution", weight: 5, cap: 10,
    re: /\b(studies show|research (?:shows|indicates|suggests)|experts (say|agree|believe)|it is (widely )?(known|believed)|many believe|some argue|according to (studies|experts|research))\b/gi,
    why: "Vague, sourceless attribution.",
    fix: "Name the source and year, or drop the appeal to authority and make the claim yourself." },
  { id: "en-superficial-ing", weight: 4, cap: 8,
    re: /(^|[.!?]\s+)(delving|exploring|diving|embracing|unlocking|harnessing|leveraging|navigating|understanding|considering)\b/gi,
    why: "Sentence-initial -ing 'analysis' filler.",
    fix: "Start with the subject and a concrete verb instead." },
  { id: "en-trailing-ing", weight: 4, cap: 12,
    re: /,\s+(highlighting|underscoring|emphasizing|emphasising|reflecting|symbolizing|symbolising|showcasing|demonstrating|illustrating|signaling|signalling|cementing|solidifying|reinforcing|contributing to|paving the way|marking a)\b/gi,
    why: "Trailing '-ing' commentary clause (\"…, highlighting the importance of X\") — superficial analysis filler.",
    fix: "Cut the trailing clause, or make it a direct claim in its own sentence." },
  { id: "en-sycophancy", weight: 3, cap: 6,
    re: /\b(great question|absolutely|certainly|of course|i hope this helps|feel free to|dive in|there are many factors to consider)\b/gi,
    why: "Chatbot sycophancy / filler.",
    fix: "Remove. Get to the point." },
  { id: "en-cliche-opener", weight: 5, cap: 10,
    re: /\bin (?:today['’]?s|this) (?:(?:fast-paced|ever-changing|ever-evolving|rapidly evolving|rapidly changing|modern|digital|dynamic|competitive|interconnected|fast-moving)\s+){1,3}(?:world|landscape|age|era|society)\b|\bin the (?:world|realm|age) of\b|\bin an era (?:of|where)\b|\bwhen it comes to\b/gi,
    why: "Cliché scene-setting opener.",
    fix: "Cut it and start with the actual subject." },
  { id: "en-slop-phrases", weight: 5, cap: 20,
    re: /(?:^|[.!?]\s+|\n)\s*(?:here['’]?s the thing|the bottom line[:?]|let['’]?s break it down|let['’]?s dive in)\b|\bin a world where\b|\byour future self will thank you\b|\bit['’]?s less about\b[^.\n]{0,60}\bmore about\b|\bat the end of the day\b|\bwhat does this mean for you\b/gi,
    why: "Stock engagement-bait phrasing (\"Here's the thing\", \"The bottom line?\", \"Let's break it down\", \"In a world where…\").",
    fix: "Delete the filler beat and say the point." },
  { id: "en-label-colon", weight: 3, cap: 9,
    re: /(^|\n|[.!?]\s+)The [A-Z][\w-]*(?: [A-Z][\w-]*)?:\s/g,
    why: "Label-colon template (\"The Challenge:\", \"The Bottom Line:\") — AI summary-card structure, inline or as a heading.",
    fix: "Fold it into the prose, or drop the label." },
];

const ES = [
  { id: "es-negative-parallel", weight: 6, cap: 18,
    re: /\bno (?:es|son) (?:solo|sólo|simplemente|meramente|únicamente|unicamente)\b|\bno (?:solo|sólo)\b[^.]*\bsino (?:también|tambien|más bien|mas bien)\b|\bno\s+(?:es|son|se trata(?: solo| sólo)? de)\s+[\wáéíóúñü'’]+(?:\s+[\wáéíóúñü'’]+){0,5}\s*[,;:—–]\s*(?:sino|se trata|es\b|son\b)/gi,
    why: "Paralelismo negativo: \"no es X, sino Y\" / \"no se trata de X: se trata de Y\".",
    fix: "Afirma directo. Elimina la cláusula de contraste. (Una antítesis como gancho está bien; cinco son firma de IA.)" },
  { id: "es-inflated-vocab", weight: 3, cap: 18,
    re: /\b(sumérgete|sumergete|sumergirse|desbloquea(?:r(?:l[oa]s?)?|n|ndo)?|potencia(?:r(?:l[oa]s?|se)?|n|ndo)?|fomenta(?:r(?:l[oa]s?)?|n|ndo)?|aprovecha(?:r(?:l[oa]s?)?|n|ndo)?|navegar|tapiz|testimonio|subraya(?:r|n)?|realza(?:r|n)?|sin fisuras|innumerables|un sinf[ií]n|vibrante|bullicioso|intrincado|paisaje|redefine(?:n)?|redefinir|revoluciona(?:r|n)?|de vanguardia|marca(?:n)? la diferencia|impulsad[oa]s? por)\b/gi,
    why: "Vocabulario inflado/promocional típico de IA (incluye enclíticos: potenciarlo, y gerundios: potenciando).",
    fix: "Cámbialo por una palabra llana y concreta (usar, mostrar, campo…) o elimínalo." },
  { id: "es-vocab-weak", weight: 2, cap: 8, min: 3,
    re: /\b(robusto|profund(?:o|a|os|as|amente)|crucial|fundamental|primordial|vital|indispensable)\b/gi,
    why: "Racimo de énfasis ambiguo de registro (crucial/fundamental/vital…). Uno o dos son prosa formal normal; el montón es el tell.",
    fix: "Deja el que de verdad aporta; cambia el resto por palabras llanas." },
  { id: "es-calques", weight: 4, cap: 12,
    re: /\bestá(?:n)? siendo\b|\ben términos de\b|\bjuega(?:n)? un (?:rol|papel)\b|\bjugar un (?:rol|papel)\b|\bal final del día\b|\btomar acción\b|\bhace(?:r)? sentido\b|\bimpacta(?:r|n|ndo)\b/gi,
    why: "Calco del inglés (pasiva progresiva \"está siendo\", \"en términos de\", \"jugar un rol\", \"impactar\"…).",
    fix: "Reformula en español natural: \"se está transformando\" / \"en cuanto a\" / \"desempeñar un papel\" / \"afectar\"." },
  { id: "es-label-colon", weight: 3, cap: 9,
    re: /(^|\n|[.!?]\s+)(?:El|La|Lo) [\wáéíóúñÁÉÍÓÚÑ]+:\s|(^|\n|[.!?]\s+)¿(?:La clave|La conclusión|La conclusion|El secreto|La verdad)\?/g,
    why: "Etiqueta-dos-puntos (\"El dato:\", \"La clave:\") o pregunta-etiqueta retórica (\"¿La clave?\") — plantilla de resumen típica de IA.",
    fix: "Intégralo en la prosa o elimina la etiqueta." },
  { id: "es-transitions", weight: 4, cap: 12,
    re: /(?:^|[.!?¡¿]\s+|\n)\s*(?:además|asimismo|no obstante|por otro lado|por otra parte|en conclusión|en conclusion|en resumen|en síntesis)\b|\b(?:cabe (?:mencionar|destacar|señalar|resaltar)|es importante (?:destacar|señalar|mencionar|resaltar|tener en cuenta)|es fundamental (?:subrayar|destacar|señalar))\b/gi,
    why: "Conectores/muletillas formulaicas de IA.",
    fix: "Elimínalo o usa un enlace concreto. Nadie empieza hablando con 'Además'." },
  { id: "es-vague-attribution", weight: 5, cap: 10,
    re: /\b(los estudios (demuestran|muestran|indican)|la investigación (demuestra|muestra)|los expertos (dicen|señalan|coinciden|afirman|creen)|se (sabe|cree|dice|estima) que|muchos (creen|piensan)|según (los )?(estudios|expertos))\b/gi,
    why: "Atribución vaga y sin fuente.",
    fix: "Cita la fuente y el año, o quita la apelación a la autoridad y haz la afirmación tú." },
  { id: "es-cliche-opener", weight: 5, cap: 10,
    re: /\ben (?:el|un) (?:(?:vasto|fascinante|apasionante|dinámico|dinamico|cambiante|competitivo|acelerado)\s+)?(?:mundo|universo|ámbito|ambito|campo|panorama|entorno) (?:de|del)\b|\ben un mundo (?:donde|cada vez más|en el que)\b|\ben la era (?:digital|moderna|de la)\b/gi,
    why: "Apertura cliché de 'ambientación' (\"en el vasto mundo de\", \"en un mundo donde…\").",
    fix: "Elimínala y empieza por el tema real." },
  { id: "es-trailing-ger", weight: 4, cap: 12,
    re: /,\s+(destacando|subrayando|resaltando|reflejando|evidenciando|demostrando|ilustrando|consolidando|reforzando|contribuyendo a|marcando un|allanando el camino|optimizando|aliviando|evaluando|mejorando|facilitando|permitiendo|garantizando|impulsando|potenciando|fomentando|transformando|generando|brindando|ofreciendo|asegurando|promoviendo|fortaleciendo|sentando las bases|lo que (?:demuestra|refleja|evidencia|subraya|confirma|pone de manifiesto))\b/gi,
    why: "Coletilla de comentario final (\"…, optimizando X\" / \"…, lo que demuestra Y\") — análisis superficial de relleno.",
    fix: "Corta la coletilla, o conviértela en afirmación directa en su propia frase." },
  { id: "es-superficial-ger", weight: 4, cap: 8,
    re: /(^|[.!?]\s+)(explorando|sumergiéndonos|sumergiendonos|adentrándonos|adentrandonos|descubriendo|comprendiendo|aprovechando|navegando)\b/gi,
    why: "Gerundio inicial de 'análisis' de relleno.",
    fix: "Empieza con el sujeto y un verbo conjugado." },
];

// ---------- language detection ----------
// Returns "es", "en", or "mixed" (both languages substantially present —
// then BOTH rule sets run, so a bilingual doc can't hide half its tells).
function detectLang(text) {
  const es = (text.match(/\b(el|la|los|las|de|que|una|para|con|por|como|más|está|son|pero|también|inteligencia)\b/gi) || []).length;
  const en = (text.match(/\b(the|of|and|to|in|is|that|for|with|as|are|this|it|not|but|our)\b/gi) || []).length;
  const total = es + en;
  if (total >= 12 && Math.min(es, en) / total >= 0.3) return "mixed";
  return es > en ? "es" : "en";
}

// ---------- sentence stats (burstiness) ----------
// Newlines count as boundaries so periodless bullet lists still register as
// separate "sentences" (otherwise a whole list collapses into one and both
// burstiness and opener-repetition go blind).
function sentenceStats(text) {
  const sentences = text
    .split(/(?<=[.!?…])\s+|\r?\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 0);
  const lens = sentences.map((s) => (s.match(/\b[\wáéíóúñü']+\b/gi) || []).length).filter((n) => n > 0);
  if (lens.length === 0) return { count: 0, mean: 0, std: 0, cv: 0, lens: [], sentences: [] };
  const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
  const variance = lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length;
  const std = Math.sqrt(variance);
  const cv = mean ? std / mean : 0; // coefficient of variation
  return { count: lens.length, mean: +mean.toFixed(1), std: +std.toFixed(1), cv: +cv.toFixed(2), lens, sentences };
}

// Repeated sentence openers ("The system shall…" ×11 / "El sistema debe…"):
// uniform openings are a strong structural tell the per-pattern regexes miss.
function openerRepetition(sentences) {
  const counts = new Map();
  for (const s of sentences) {
    const words = s.replace(/^[-*•\d.)\s"“¿¡]+/, "").split(/\s+/).slice(0, 3).join(" ").toLowerCase();
    if (words.split(" ").length < 3) continue; // too short to be a meaningful opener
    counts.set(words, (counts.get(words) || 0) + 1);
  }
  let worst = null;
  for (const [opener, n] of counts) {
    if (n >= 4 && (!worst || n > worst.n)) worst = { opener, n };
  }
  return worst;
}

// Spanish headings in Title Case ("Un Futuro Sostenible y Desafiante") are an
// English calque — proper Spanish capitalizes only the first word.
// Guard against proper-noun lines (author lists, institutions): the line must
// START like a heading (article/determiner/interrogative/gerund), because
// "Gabriel García Márquez y Mario Vargas Llosa" is correct Spanish, not a tell.
function titleCaseHeadingsEs(text) {
  const STOP = new Set(["de","del","la","el","los","las","en","y","o","u","e","para","con","a","al","un","una","unos","unas","por","que","su","sus","como","hacia"]);
  const HEAD_START = /^(?:El|La|Los|Las|Un|Una|Unos|Unas|Cómo|Como|Qué|Por|Hacia|Del|Al|Este|Esta|Estos|Estas|Nuestr[oa]s?|Tu|Su|[A-ZÁÉÍÓÚÑ][a-záéíóúñ]*(?:ando|iendo))$/;
  let hits = 0;
  const examples = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().replace(/^[\d.)\-*•\s]+/, "");
    if (!line || /[.!?;,]$/.test(line)) continue;
    const words = line.split(/\s+/);
    if (words.length < 3 || words.length > 14) continue;
    if (!HEAD_START.test(words[0].replace(/[":]+$/, ""))) continue;
    let caps = 0;
    for (let j = 1; j < words.length; j++) {
      if (words[j - 1].endsWith(":")) continue; // word after colon is legitimately capitalized
      const w = words[j].replace(/^["'“”¿¡(]+|[)"'“”?!:]+$/g, "");
      if (!w || /^[A-ZÁÉÍÓÚÑ]{2,}$/.test(w)) continue;
      if (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(w) && !STOP.has(w.toLowerCase())) caps++;
    }
    if (caps >= 3) {
      hits++;
      if (examples.length < 3) examples.push({ text: line.slice(0, 60), line: i + 1 });
    }
  }
  return { hits, examples };
}

// ---------- line lookup for a match index ----------
function lineFor(text, idx) {
  return text.slice(0, idx).split("\n").length;
}

// ---------- scoring ----------
function analyze(text, lang) {
  const rules = [...SHARED, ...(lang === "es" ? ES : lang === "mixed" ? [...EN, ...ES] : EN)];
  const findings = [];
  let patternScore = 0;

  for (const rule of rules) {
    rule.re.lastIndex = 0;
    let m;
    let hits = 0;
    const examples = [];
    while ((m = rule.re.exec(text)) !== null) {
      hits++;
      if (examples.length < 5) {
        // Anchored rules capture a leading newline — point at the tell itself,
        // not the preceding line break (keeps line numbers accurate).
        const lead = /^[\r\n]+/.exec(m[0]);
        const at = m.index + (lead ? lead[0].length : 0);
        examples.push({ text: m[0].trim().replace(/\s+/g, " "), line: lineFor(text, at) });
      }
      if (m.index === rule.re.lastIndex) rule.re.lastIndex++; // avoid zero-width loop
    }
    if (hits >= (rule.min || 1)) {
      const pts = Math.min(hits * rule.weight, rule.cap);
      patternScore += pts;
      findings.push({ id: rule.id, hits, points: pts, why: rule.why, fix: rule.fix, examples });
    }
  }

  // Spanish-only structural check: Title Case headings (English calque).
  // Skipped in mixed mode: English portions legitimately title-case headings.
  if (lang === "es") {
    const tc = titleCaseHeadingsEs(text);
    if (tc.hits > 0) {
      const pts = Math.min(tc.hits * 4, 12);
      patternScore += pts;
      findings.push({ id: "es-title-case-heading", hits: tc.hits, points: pts,
        why: "Encabezados en Title Case (Mayúscula Por Palabra) — calco del inglés; en español solo la primera palabra va en mayúscula.",
        fix: "Deja solo la mayúscula inicial: \"Un futuro sostenible y desafiante\".",
        examples: tc.examples });
    }
  }

  // burstiness contribution: low variation in sentence length is AI-like.
  const stats = sentenceStats(text);
  let burstPenalty = 0;
  const burstNotes = [];
  if (stats.count >= 4) {
    if (stats.cv < 0.35) { burstPenalty += 12; burstNotes.push(`Low sentence-length variation (CV=${stats.cv}). Humans vary more — mix short punchy sentences with long ones.`); }
    else if (stats.cv < 0.5) { burstPenalty += 6; burstNotes.push(`Somewhat uniform sentence length (CV=${stats.cv}). Add a few very short and very long sentences.`); }
    if (stats.mean > 24) { burstPenalty += 6; burstNotes.push(`High mean sentence length (${stats.mean} words). Cut some sentences in half.`); }
    const rep = openerRepetition(stats.sentences);
    if (rep) {
      const pts = Math.min(4 + (rep.n - 4) * 2, 12);
      burstPenalty += pts;
      burstNotes.push(`${rep.n} sentences open with "${rep.opener}…" — uniform openers read as machine-generated. Vary how sentences start.`);
    }
  }

  const raw = patternScore + burstPenalty;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  findings.sort((a, b) => b.points - a.points);
  return { lang, score, patternScore, burstPenalty, stats, findings, burstNotes };
}

// ---------- CLI ----------
function readInput(args) {
  let forced = "auto", json = false, file = null, useStdin = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--json") json = true;
    else if (a === "--lang") {
      const v = args[++i];
      if (v === "en" || v === "es" || v === "auto") forced = v;
      else console.error(`Unknown --lang value: ${v ?? "(none)"} — using auto-detect.`);
    } else if (a === "-") useStdin = true;
    else if (a.startsWith("--")) console.error(`Unknown option ignored: ${a}`);
    else file = a;
  }
  let text;
  try {
    text = useStdin || !file ? readFileSync(0, "utf8") : readFileSync(file, "utf8");
  } catch (e) {
    console.error(`Cannot read ${useStdin || !file ? "stdin" : `"${file}"`}: ${e.code || e.message}`);
    process.exit(1);
  }
  return { text, forced, json, file };
}

function render(r) {
  const bar = (n) => {
    const filled = Math.round(n / 5);
    return "█".repeat(filled) + "░".repeat(20 - filled);
  };
  const verdict = r.score >= 60 ? "HEAVILY AI-flavored" : r.score >= 30 ? "moderately AI-flavored" : r.score >= 12 ? "lightly AI-flavored" : "reads human";
  let out = "";
  out += `\n  AI-TELL SCORE  ${r.score}/100  [${bar(r.score)}]  — ${verdict}\n`;
  out += `  lang=${r.lang}  patterns=${r.patternScore}  burstiness-penalty=${r.burstPenalty}\n`;
  out += `  sentences=${r.stats.count}  mean-len=${r.stats.mean}w  variation(CV)=${r.stats.cv}\n`;
  if (r.findings.length) {
    out += `\n  FLAGGED PATTERNS (most impactful first):\n`;
    for (const f of r.findings) {
      out += `\n  • ${f.id}  (${f.hits} hit${f.hits > 1 ? "s" : ""}, +${f.points})\n`;
      out += `      why: ${f.why}\n`;
      out += `      fix: ${f.fix}\n`;
      const ex = f.examples.map((e) => `L${e.line} “${e.text}”`).join("  |  ");
      if (ex) out += `      e.g. ${ex}${f.hits > f.examples.length ? `  (first ${f.examples.length} of ${f.hits})` : ""}\n`;
    }
  }
  if (r.burstNotes.length) {
    out += `\n  RHYTHM:\n`;
    for (const n of r.burstNotes) out += `      - ${n}\n`;
  }
  if (r.score < 12 && !r.findings.length) out += `\n  No strong tells found. (The scorer under-reports — sweep against the catalog before declaring victory.)\n`;
  out += `\n`;
  return out;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node aidetect.mjs [--lang auto|en|es] [--json] <file|->\n  auto also detects mixed EN/ES documents and runs both rule sets.");
    process.exit(0);
  }
  const { text, forced, json } = readInput(args);
  if (!text.trim()) { console.error("No input text."); process.exit(1); }
  const lang = forced !== "auto" ? forced : detectLang(text);
  const r = analyze(text, lang);
  if (json) {
    const { stats, ...rest } = r;
    console.log(JSON.stringify({ ...rest, stats: { count: stats.count, mean: stats.mean, std: stats.std, cv: stats.cv } }, null, 2));
  } else {
    process.stdout.write(render(r));
  }
}

main();
