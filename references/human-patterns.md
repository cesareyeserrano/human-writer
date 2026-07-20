# Human writing patterns — the positive catalog (EN/ES)

The complement to `anti-patterns-*.md`. Those files list what to **remove**
(AI tells); this one lists what to **introduce** so a text reads human. It
is bilingual on purpose: the last section is about what does **not** transfer
between English and Spanish, which only makes sense with both in view.

Evidence base: a 2026 fan-out research pass over peer-reviewed stylometry/
NLP sources (25 sources → 71 claims → 24 confirmed by 3-vote adversarial
checking, 1 refuted). Citations are per-pattern at the bottom. Read the
honest-scope note first — it governs how to use everything below.

> **Honest scope.** These are markers measured mostly on 2023–2025-era
> models, and the gap narrows every generation — diffusion models (LLaDA)
> already match human perplexity and burstiness. So treat this as a catalog
> of traits to **generate**, never as proof of authorship or a detector to
> beat. And introduce with judgment: the goal is prose that reads human, not
> a checklist mechanically applied until it reads like a different machine.

---

## Part A — Positive markers to introduce

### A1. Burstiness — a wide sentence-length *range*, including long sentences

The strongest, most-replicated human marker. LLMs concentrate sentences in a
narrow 10–30-token band; humans scatter far more widely **and produce long
sentences more often**. The usual advice "add short punchy sentences" is only
half of it — the human signal is the *range*, so the long tail matters as
much as the short one. A three-word sentence next to a forty-word one is more
human than a page of tidy fifteen-word sentences.

- ❌ *The tool is useful. It saves time. Teams adopt it quickly. Results
  improve. Everyone benefits.* (five sentences, all 3–5 words — uniform is
  uniform even when it's short)
- ✅ *The tool saves time. What took an analyst a full afternoon — pulling
  the numbers, reconciling three spreadsheets, chasing down the one figure
  that never matches — now takes a support rep about ten minutes, and they
  don't need to file a ticket to do it.*

How: after rewriting, re-score and check the variation (CV) is up, but also
eyeball whether any genuinely long sentence survives. A text can score
"uniform" by being relentlessly *short*, too.

### A2. Personal voice and stylistic individuality

Human authors scatter widely in stylometric space — individual habits, a
point of view, the odd digression. LLM output clusters tightly around a
neutral centroid with limited range. This is the marker that survives best
against neural detectors, because it's the hardest to fake at generation
time.

Introduce, where the text's register allows it:
- **First person and a stated stance** — *I think this is the wrong
  trade-off*, not *it could be argued that trade-offs exist*.
- **A concrete opinion or mild judgment** instead of balanced neutrality.
- **An aside or a parenthetical** that a person would actually add.
- **Idiosyncrasy** — a recurring turn of phrase, a preferred connective.

Caveat: this is best-evidenced for creative/narrative writing. In a spec or a
legal clause, "voice" is thinner — don't force it where the genre refuses it.

### A3. Morphosyntactic variety — break the dense noun-phrase pile-up

AI text leans on **dense noun phrases** and high lexical density (meaning
packed into nouns). Human text uses more **adjectives, adpositions,
auxiliaries, and pronouns**, more varied sentence structures, and *shorter*
constituents with more natural dependency distances. The practical move:

- ❌ *Implementation of a data-driven customer-retention optimization
  framework* (noun stack — five nouns leaning on each other)
- ✅ *We changed how we keep customers, and we let the data decide what to
  try.* (verbs, pronouns, an auxiliary, a shorter span per idea)

How: when a phrase is three or more nouns deep, unpack it into a clause with
a real verb and a pronoun. Prefer "we did X" over "the doing of X."

---

## Part B — Calibration: what NOT to chase

These are verified **negative** results — traits that feel human but aren't,
or plain-writing that gets wrongly treated as a tell. They keep the rewrite
from over-correcting.

### B1. Do not chase "richer vocabulary" / lexical diversity

Higher type-token ratio, fancier words, more synonyms — **these point toward
AI, not away from it.** In a controlled comparison, ChatGPT scored *higher*
than human L2 students on lexical diversity (TTR, MTLD, Voc-D) and syntactic
complexity. Reaching for the thesaurus to "sound more sophisticated" is the
exact move that trips inflated-vocabulary tells (see anti-patterns §2). Plain,
specific words beat rare ones.

### B2. Plain, simple, low-perplexity writing is a legitimate human register

Do **not** treat simple prose as an AI tell to "fix." Seven detectors
misflagged ~61% of non-native-English TOEFL essays as AI precisely because
those essays had low perplexity (a limited, plain range of expression) — the
same reason canonical human texts get flagged. This validates the skill's
existing floor: structured docs and plain registers bottom out around 10–15
and *that is fine*. Humanizing ≠ making it fancier. It often means the
opposite.

### B3. No single metric is proof — so don't optimize one to a number

No stylometric metric (perplexity, burstiness, lexical diversity,
readability) robustly separates human from machine on its own; diffusion
models already match humans on perplexity and burstiness. The score is a
targeting aid, not a verdict — the project's standing "honest scope."

---

## Part C — Bilingual: what does NOT transfer between EN and ES

The single most actionable *new* finding: "humanizing" is not the same
operation in the two languages. Register dimensions and interpersonal
(stance/reader-engagement) features are partly language-specific — a trait
that reads human in English can read wrong in Spanish, and vice versa. Do not
port a move blindly across the language line.

### C1. Stance and reader-engagement differ (academic register, best-evidenced)

Contrastive corpus work on research articles found a consistent split:

| | English | Spanish |
|---|---|---|
| Hedging | **more** hedged, more tentative | **less** hedged, more assertive |
| Reader pronouns / imperatives | fewer | **more** (reader-inclusive, direct) |
| Stance toward the reader | more dialogic about the reader's role | more assertive, brings the reader along |

So when humanizing **Spanish**, a more direct, assertive, reader-inclusive
voice reads *native* — piling on English-style hedges ("it could be argued
that…", "perhaps one might suggest…") reads translated. When humanizing
**English**, some genuine hedging and dialogic engagement is human, not a
tell to strip to zero.

### C2. Spanish has native hedging devices English lacks — use them

Native Spanish academic writers hedge with the **conditional -ría**
(*sería conveniente*, *podría interpretarse como*) as a mitigation resource —
one that L2 (English-thinking) writers underuse. Reaching for a Spanish-native
hedge like this reads more human than calquing an English hedge. (Contrast
with the *"poder + infinitivo"* periphrasis flagged as a possible over-tell
in NOTES — the point is native *idiom*, not hedge-stacking.)

### C3. Don't assume register universals

The one cross-linguistic "universal" tested here (a shared oral/literate
dimension across all languages) was **refuted** in verification. Practical
takeaway: don't assume any register feature is language-independent. Calibrate
per language against real human text in that language, not by translating the
English intuition.

> **Open gap (honest):** nearly all EN↔ES contrastive evidence above is from
> **academic** registers (research articles, student essays). Whether the same
> stance/hedging asymmetry holds for conversational, literary, journalistic,
> or corporate Spanish is **not established** — treat C1/C2 as strongest for
> formal prose and provisional elsewhere. Logged in NOTES as an open question.

---

## A note the research did *not* strongly support

"Controlled imperfection" (deliberate fragments, digressions, self-correction,
asides) is craft advice this skill still endorses — but the research pass
found **little direct empirical grounding** for it as a distinct, measurable
human marker, unlike burstiness, voice, and morphosyntactic variety, which are
quantitatively supported. Keep using it as a light touch; don't oversell it as
evidence-based. It's the weakest-evidenced item in this catalog.

---

## Evidence & sources (verified subset)

Each pattern maps to peer-reviewed findings confirmed by 3-vote adversarial
verification (2026 research pass). Confidence high unless noted.

- **A1 Burstiness** — Connection Science 2025 (T&F, 10.1080/09540091.2025.2507183);
  arXiv 2308.09067 (Springer AI Review 2024, EN news: "human texts exhibit
  more scattered sentence length distributions", LLMs concentrate 10–30
  tokens); Nature HSSC 2025 (s41599-025-05986-3: AI "significantly lower
  burstiness across all tested corpora").
- **A2 Voice / individuality** — Nature HSSC 2025 (Burrows' Delta: LLM outputs
  "form tighter clusters", humans "scattered widely"); arXiv 2507.00838
  (temperature/alignment don't recover human stylistic diversity).
- **A3 Morphosyntactic variety** — MDPI Information 2025 (16/11/979: humans
  use more adjectives, pronouns, adjectival/prepositional modifiers); arXiv
  2308.09067 (shorter constituents, more optimized dependency distances).
- **B1 Lexical diversity is not human-positive** — Frontiers in Education 2025
  (feduc.2025.1616935: ChatGPT > L2 students on TTR/MTLD/Voc-D).
- **B2 Low perplexity is a human register** — Liang et al. 2023, Patterns/Cell
  Press (S2666389923001307: 61.3% FP on TOEFL essays; enriching word choice
  cut FP to 11.6%).
- **B3 No single metric is proof** — arXiv 2507.10475 (LLaDA matches human
  perplexity 44.62 vs 43.03 and burstiness); survey arXiv 2403.01152.
- **C1/C2 EN↔ES stance & hedging** — Mur-Dueñas 2011, Journal of Pragmatics
  (S0378216611001366: Spanish more reader pronouns/imperatives, English more
  hedged; engagement 18.5 vs 14.5 per 10k words); Gang Yao, Ibérica (Spanish
  conditional -ría as native hedge, underused by L2).
- **C3 Register dimensions are language-specific** — Biber 1995, *Dimensions
  of Register Variation* (Cambridge UP; EN "Abstract style" and Korean
  "Honorification" have no cross-linguistic equivalent). The oral/literate
  universal was refuted 0-3 in this pass.

Caveats that bound all of the above: scope mismatches (arXiv 2308.09067 is EN
news only; Nature HSSC is creative writing; Frontiers compares ChatGPT to L2,
not L1 experts); the EN↔ES evidence is academic-register; and every
stylometric contrast is time-sensitive against newer models. See
`research-summary.md` for the detector-reliability evidence and the full
source list.
