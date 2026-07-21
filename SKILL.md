---
name: human-writer
description: >-
  Human-Writer — humanize AI-generated writing in English or Spanish. Remove
  the tells that make text sound machine-written and rewrite it to read like
  a person. Use when asked to humanize text, make writing sound human/
  natural/less like AI, remove ChatGPT/AI patterns, fix "it sounds like AI",
  de-slop, or in Spanish: humanizar texto, que no suene a IA, escritura
  humana, quitar patrones de IA. Scores text 0-100 for AI tells
  (aidetect.mjs), flags each pattern with a fix, and re-scores after
  rewriting.
---

# Human-Writer (EN/ES)

Turn AI-generated prose into writing that reads like a human wrote it, in
**English or Spanish**. This skill does two things:

1. **Detect** — `aidetect.mjs` scores the text 0–100 for AI "tells"
   (higher = more machine-sounding), flags every pattern with the exact
   line and a suggested fix, and measures sentence-length variation
   ("burstiness"). It does **not** rewrite.
2. **Rewrite** — *you* (the agent) rewrite the flagged spans using the
   anti-pattern catalog in [`references/`](references/), then re-run the
   scorer to confirm the score dropped.

The catalog is evidence-based — see [references/research-summary.md](references/research-summary.md)
for how AI detectors work and why these patterns are tells.

> Paths below are relative to this skill directory
> (`~/.claude/skills/human-writer/`). The scorer is pure Node ≥18, zero
> dependencies — it runs anywhere without `npm install`.

## The loop (agent path — do this)

```bash
cd ~/.claude/skills/human-writer

# 1. SCORE the original (auto-detects EN/ES). Save the number.
node aidetect.mjs path/to/text.txt

# or pipe text in:
echo "your text here" | node aidetect.mjs -

# or force a language / get JSON for programmatic use:
node aidetect.mjs --lang es path/to/text.txt
node aidetect.mjs --json path/to/text.txt
```

2. **Read the flagged patterns.** Each finding gives `why` it's a tell and
   `fix` for how to repair it, with line numbers and examples.
   **The scorer under-reports** — it's a regex linter, not a model. The
   catalog is the spec; the scorer is partial coverage. After fixing the
   flagged spans, sweep the text once against the rules table below (and
   the catalogs) before re-scoring.

3. **Rewrite** the text applying the fixes below + the full catalog
   ([anti-patterns-en.md](references/anti-patterns-en.md),
   [anti-patterns-es.md](references/anti-patterns-es.md)). Preserve the
   author's meaning and facts. **Never invent statistics, sources, named
   people, or events.** Grounding a generic claim in a concrete detail is
   good — but only with specifics already in the text, or clearly
   illustrative examples that assert nothing factual.

4. **Re-score the rewrite** (same `--lang` flag as step 1). Targets: heavy
   AI text (70+) → under 20; mid-range (30–60) → at least halve it and land
   under 15 for prose. Structured docs (specs, requirements) bottom out
   around 10–15 — that's fine, their format is legitimate. Report
   before/after to the user.

```bash
node aidetect.mjs rewrite.txt   # confirm the score fell
```

5. **HARD GATE — verify the exact text you deliver, not a draft.** Before
   claiming any pattern is removed, run the check on the final text (write
   it to a file or pipe the verbatim chat answer through stdin):

   ```bash
   grep -nE '—|–|(\w)--(\w)|\w - \w' final.txt   # must print nothing if you claim "no dashes"
   ```

   Rules of the gate:
   - **Headings, labels, and list items count.** "Objective 1 — Title" is
     an em-dash. There is no "structural" exemption unless the user grants
     one explicitly — if you keep any on purpose, SAY so and list them.
   - **Never re-deliver text claiming it is fixed without diffing it
     against your previous version.** If nothing changed, you fixed
     nothing. Field evidence: an agent re-sent byte-identical text as
     "the clean version" after the user said dashes remained.
   - This applies to every pattern you claim removed, not only dashes —
     the claim "X is gone" requires a mechanical check for X on the
     delivered text.

6. **DELIVER the full rewritten text — always, unprompted.** The text IS
   the deliverable; the score and the change-list are not. End your reply
   with the complete humanized text, in full, verbatim, ready to copy. Do
   not summarize it, truncate it, or point to it ("final text above",
   "listo para usar") — paste the whole thing. Order: (a) one line with
   before/after score, (b) a brief bullet list of what you changed, then
   (c) the full text as the last thing in the reply. Field failure: agents
   keep ending on the change-list, forcing the user to ask "where's the
   text?" every single time. If the user asked to humanize it, output it.

## The rules, in one screen

Delete or replace these. Full catalog + Spanish equivalents in `references/`.

| AI tell | Human fix |
|---|---|
| Em-dashes everywhere `—` (also `–`, `--`, spaced ` - `) | Period, comma, or parentheses. Keep ≤1 per few paragraphs. |
| "It's not just X, it's Y" / "not only… but also" / "It's not X. It's Y." | State the point directly. Cut the setup. |
| Emoji bullets 🚀✅💡 and bold-label cards "**Speed:** …" | Delete the decoration; fold labels into prose. |
| Inflated words: *delve, tapestry, testament, underscore, leverage, foster, realm, landscape, navigate, robust, seamless* | Plain verbs: *use, show, area, field*. Or delete. |
| Formulaic openers: *Moreover, Furthermore, In conclusion, It's important to note* | Delete, or use a concrete link. |
| Vague attribution: *studies show, experts say* | Name the source + year, or make the claim yourself. |
| Triads (rule of three): "X, Y, and Z" repeated | Break the rhythm — two items, or four, or split sentences. |
| Cliché scene-setting: "In today's fast-paced world…" | Start with the actual subject. |
| Uniform sentence length (low CV) | **Burstiness**: mix very short sentences with long ones. |
| Repeated sentence openers ("The system shall…" ×N) | Vary how sentences start. |
| Label-colon cards: "The Challenge:", "El dato:" | Fold into prose; drop the label. |
| Trailing "-ing"/gerund commentary: "…, highlighting X" / "…, optimizando Y" | Cut it, or make it its own sentence. |
| Over-hedging, sycophancy, "I hope this helps" | Cut. Make direct claims. |

**Spanish tells** (see [anti-patterns-es.md](references/anti-patterns-es.md)):
*Además, Por otro lado, No obstante, En resumen, Es importante destacar,
cabe mencionar, sumérgete, en el vasto mundo de*, gerundios de coletilla
(", optimizando…"), calcos del inglés ("está siendo", "en términos de"),
y **Title Case en encabezados** (calco: en español solo va mayúscula
inicial).

## What "human" looks like (introduce these)

Full evidence-based catalog in [references/human-patterns.md](references/human-patterns.md)
(the positive-space complement to the anti-patterns files). The essentials:

- **Burstiness** — vary sentence length hard, in *both* directions. A
  three-word sentence next to a forty-word one. The human signal is the
  *range* including the long tail — LLMs cluster in a 10–30-word band, so a
  genuinely long sentence is as human as a short one. (Don't fake variation
  by only chopping things short — relentlessly short is uniform too.)
- **Voice** — first person, a stated stance, a real aside, idiosyncrasy. This
  is the marker that best survives neural detectors; introduce it where the
  register allows.
- **Break dense noun-phrase stacks** — humans use more verbs, pronouns and
  auxiliaries; AI packs meaning into noun piles. "We changed how we keep
  customers" beats "implementation of a customer-retention framework."
- **Specificity** — concrete nouns, real numbers, named things (only ones
  already in the text — never invented).
- **Directness** — claim things outright instead of hedging.
- **Don't chase "richer" vocabulary** — high lexical diversity points toward
  AI, not away (ChatGPT beats humans on it). Plain, specific words win.
- **Spanish ≠ English here** — Spanish reads native when it's *more* direct
  and reader-inclusive (fewer hedges, more "tú/usted" and imperatives);
  English tolerates more hedging. Don't calque one language's voice onto the
  other. See human-patterns.md §C.

## Verifying / re-running the scorer

The bundled samples let you confirm the tool works before trusting it on
real text:

```bash
sh run-tests.sh   # full regression suite (score ranges, per-rule probes,
                  # false-positive guards, CLI checks). It prints PASS/FAIL
                  # per check and exits nonzero on failure. Run after ANY
                  # rule change.
```

Or spot-check individual samples:

```bash
node aidetect.mjs samples/ai-sample-en.txt        # ~76 HEAVILY AI-flavored
node aidetect.mjs samples/ai-sample-es.txt        # ~72 HEAVILY AI-flavored
node aidetect.mjs samples/human-sample-en.txt     # ~10 reads human
node aidetect.mjs samples/human-academic-en.txt   # ~14 human academic register stays low
node aidetect.mjs samples/ai-slop-en.txt          # ~20 engagement-bait slop
node aidetect.mjs samples/ai-cards-en.txt         # ~73 emoji/bold-label card slop (was 3)
node aidetect.mjs samples/ai-cards-es.txt         # ~58 slop de tarjetas ES (was 0)
node aidetect.mjs samples/ai-mixed-en-es.txt      # lang=mixed — both rule sets run
```

## Gotchas

- **The scorer is a targeting aid, not a verdict.** A high score means "these
  spans read like AI," not "a detector will flag this." Do not promise the
  user their text will pass GPTZero/Turnitin — those tools are probabilistic
  and have documented false positives. The goal is *writing that reads human*,
  which is the durable win.
- **Em-dashes and triads occur in real human writing too.** The scorer counts
  from the first hit (small weights, per-rule caps), so a lone em-dash adds a
  few points — that alone never changes the verdict. The judgment call stays
  with you: don't strip every one mechanically; judge in context.
- **Register-ambiguous words (crucial, vital, robust, fundamental…) only
  score as a cluster** (3+ hits). One or two in formal prose is normal
  human register, and the scorer treats it that way.
- **Language auto-detection** uses stopword counts. Substantially bilingual
  text is detected as `mixed` and both rule sets run. For very short or
  code-heavy input it can guess wrong — pass `--lang en|es` explicitly.
- **Don't over-correct into a new monotony.** After rewriting, re-score: if
  burstiness is still low, you replaced one uniform rhythm with another.
- **Rewriting is the agent's job, not the script's.** `aidetect.mjs` never
  edits text. It only measures, so you can measure the before and after.
- **You are an LLM — your default style IS the tell.** Em-dashes read
  natural to you, so you will LEAVE the original's dashes in place and
  reintroduce your own (or en-dashes / double-hyphens standing in for
  them) without noticing. Field evidence: the most common failure mode of
  this skill is a "humanized" text delivered with the original's dashes
  intact — including in headings and labels ("Objective 1 — Title"), which
  agents silently exempt as "structural." The score won't save you — the
  em-dash rule caps at 9 points, and a low-scoring text (9/100) still
  failed this way in the field. Sweep dashes explicitly (checklist item #1
  in both catalogs) and run the hard gate in step 5 on the exact text you
  deliver.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot find module` / syntax error | Needs Node ≥18. Check `node --version`. |
| Scores Spanish text as English (`lang=en`) | Pass `--lang es`. |
| `No input text.` | File empty, or forgot the `-` when piping via stdin. |
| Score barely dropped after rewrite | You fixed vocabulary but not rhythm — vary sentence length (burstiness). |

## Files

- [`aidetect.mjs`](aidetect.mjs) — the scorer (the driver). Run it, read it, extend the pattern dicts.
- [`references/anti-patterns-en.md`](references/anti-patterns-en.md) — English catalog with before/after (what to remove).
- [`references/anti-patterns-es.md`](references/anti-patterns-es.md) — Spanish catalog with before/after (what to remove).
- [`references/human-patterns.md`](references/human-patterns.md) — positive catalog (EN/ES): what to *introduce*, incl. the EN↔ES contrast.
- [`references/research-summary.md`](references/research-summary.md) — how detectors work; sources.
- [`samples/`](samples/) — AI + human fixtures for verifying the scorer.
