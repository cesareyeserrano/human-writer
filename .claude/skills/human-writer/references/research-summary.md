# Research summary — why these patterns are AI tells

Evidence base for this skill's anti-pattern catalog. Built from a fan-out
web-research pass (24 sources fetched, 119 candidate claims, 25 verified by
3-vote adversarial checking → 22 confirmed, 3 refuted). Confidence and
sources are noted per finding. **This is a 2025–2026 snapshot of a
fast-moving arms race — treat specific numbers as dated.**

## How AI detectors actually work

Detectors fall into **two families**:

1. **Statistical** (original GPTZero, DetectGPT, Binoculars). They measure
   **perplexity** (how predictable each token is under a reference model —
   low perplexity = likely AI) and **burstiness** (how much that
   predictability *varies* sentence to sentence — AI text is more uniform).
   *(Sources: gptzero.me; arXiv 2402.14873. High confidence.)*
2. **Supervised neural classifiers** (e.g. Pangram). A transformer trained
   to recognize "the underlying patterns of speech and voice" of LLM output
   directly, rather than probability estimates. *(arXiv 2402.14873. High
   confidence.)*

**Implication for a humanizer:** the strongest detectable tells are *learned
stylistic regularities*, not just token statistics. Fixing perplexity/
burstiness alone does not fool a neural classifier. Writing that genuinely
reads human is the durable target — chasing a specific detector's score is
not.

## Detectors are unreliable — do not promise "passes detection"

This is the single most important caveat for how this skill talks to users.

- **False positives on real human text**: on 250 pre-ChatGPT human articles,
  one detector flagged 30.4% and another 16% as AI. *(PMC12331776. High.)*
- **Bias against non-native English writers**: Stanford/Liang 2023 found
  detectors flagged **61%** of non-native (TOEFL) essays as AI vs near-zero
  for native speakers — driven by the low perplexity of ESL writing.
  *(High.)*
- **Canonical human texts get flagged**: the US Declaration of Independence
  is flagged ~98% AI, because LLMs are trained to minimize perplexity on
  exactly such canonical documents. *(pangram.com; PMC12331776. High.)*
- **Peer-reviewed verdict**: multiple studies (Weber-Wulff et al. 2023)
  conclude detectors are "neither accurate nor reliable"; Originality and
  Turnitin scored only 0.69 and 0.61 accuracy in academic tests. *(High.)*
- **Statistical detection is eroding**: GPT-4-class+ models are "the most
  difficult to classify based on probability-based features." Humanizing/
  paraphrasing dropped GPTZero's true-positive rate 99.7%→60% and
  Binoculars' 94%→28% at a fixed 5% false-positive rate. *(arXiv 2501.03437.
  High.)* But at least one neural detector (Pangram) still caught
  prompt-humanized text at ~92–97%. So: **do not tell a user their text will
  pass a detector.** Aim for writing that reads human.

## English tells (verified against Wikipedia's "Signs of AI writing")

- **Clustered inflated vocabulary** is "one of the strongest tells." The
  catalogued set: *delve, boasts, bolstered, crucial, landscape, meticulous,
  pivotal, underscore, tapestry, testament, vibrant*, plus era-specific
  *align with, enhance, fostering, showcasing*. One or two may be
  coincidental; a cluster is the signal. *(en.wikipedia.org. High.)*
- **Negative parallelism** — "not just X, but Y" / "it's not X, it's Y" —
  LLMs use it **~3× more than humans**; called by one source "the single most
  reliable AI tell." *(Wikipedia; worldcomgroup; smartinbound. High.)*
- **Em-dash overuse**: AI drops them roughly every 50–80 words vs ~1 per 500
  for humans (ChatGPT ~2–3× the human rate). *(vrid.ai; flowingdata. Medium
  — vendor/blog figures, but directionally consistent across sources.)*
- **Vague/unsourced attribution**: "Industry reports," "Experts argue,"
  "Some critics argue." Replace with a named source or delete. *(Wikipedia.
  High.)*
- **Superficial -ing commentary** appended to sentences: "…highlighting the
  importance of," "…reflecting broader trends." Cut it; make a direct claim.
  *(Wikipedia. High.)*
- Also catalogued: rule-of-three triads, formulaic transitions (*Moreover,
  In summary, Overall*), title-casing, curly quotes, over-structuring.

## Human writing markers (what to introduce)

Human text shows "a broader range of narrative voice and personal
expression," variable sentence flow (**high burstiness**), higher perplexity
(surprising word choices), and greater lexical diversity; AI text is
"balanced, neutral… predictable." The rewriting moves that follow:
(1) **vary sentence length deliberately** — mix short and long; (2) **add
concrete, specific detail** over generic phrasing; (3) **allow idiosyncratic
voice and controlled imperfection**; (4) **make direct claims** instead of
hedged ones. *(SSRN 5833302; gptzero.me; arXiv 2402.14873. High.)*

**Expanded in the 2026 positive-catalog pass** (see
[human-patterns.md](human-patterns.md) for the actionable version; 25
sources → 24 claims confirmed 3-0):

- **Burstiness is the strongest, most-replicated positive marker** — but the
  human signal is the *range*, including the long tail. LLMs concentrate in a
  10–30-token band; humans "exhibit more scattered sentence length
  distributions" and produce long sentences more often. So "add short punchy
  sentences" is only half — a genuinely long sentence is as human as a short
  one. *(arXiv 2308.09067; Nature s41599-025-05986-3; T&F 2507183. High.)*
- **Personal voice / stylistic individuality** survives best against neural
  detectors: humans scatter widely in stylometric space (Burrows' Delta),
  LLMs cluster tightly; temperature/alignment don't recover the diversity.
  *(Nature s41599-025-05986-3; arXiv 2507.00838. High. Scope: creative
  writing.)*
- **Morphosyntactic variety, not lexical density** — humans use more
  adjectives, pronouns, adpositions, auxiliaries and shorter constituents;
  AI packs meaning into dense noun phrases. Break the noun-stack into a clause
  with a verb. *(MDPI 16/11/979; arXiv 2308.09067. High.)*
- **Do NOT chase lexical diversity** — ChatGPT scored *higher* than human L2
  writers on TTR/MTLD/Voc-D. Higher lexical diversity points toward AI, not
  away. *(Frontiers feduc.2025.1616935. High.)* This is why the anti-pattern
  catalog targets *inflated* vocabulary, not "richer" vocabulary.
- **Low perplexity / plain writing is a legitimate human register**, not a
  tell to fix: it's why detectors falsely flag ~61% of non-native TOEFL
  essays. Validates the skill's ~10–15 floor for structured/plain prose.
  *(Liang 2023, Patterns S2666389923001307. High.)*
- **Weakest-evidenced:** "controlled imperfection" (fragments, digressions,
  self-correction) has little direct empirical grounding as a measurable
  marker — keep it as light craft advice, don't oversell it.

## Refuted / be careful (things NOT to claim)

- ❌ **"Adding sentence-length variation (burstiness) also raises
  perplexity, so one fix improves both."** *Refuted 0-3.* Burstiness and
  perplexity are partly independent — address them separately. (This is why
  `aidetect.mjs` scores vocabulary tells and sentence-length variation as
  **separate** contributions.)
- ❌ Specific vendor accuracy boasts ("98%+, <1% false positives") did not
  survive verification. Don't cite them.

## Spanish — AI markers vs. what reads native (EN↔ES no transfiere)

Two separate questions, two different evidence levels:

**(a) Spanish-specific AI *tells*** — still the weaker corner. The Spanish
catalog in [anti-patterns-es.md](anti-patterns-es.md) draws on a
Spanish-native practitioner source ("11 señales de que ChatGPT escribió tu
texto," confirming overuse of *gerundios* and formulaic *además / por otro
lado*; it also names the *"poder + infinitivo"* hedging periphrasis, **not
yet encoded** — see NOTES.md) plus craft translation of the English tells.
Less rigorously verified than the English catalog; the vocab lists are
era-specific and rotate.

**(b) What reads *native* in Spanish vs English** — this **is** now backed by
peer-reviewed contrastive-rhetoric evidence (2026 pass), and the headline is
that **the two languages don't share a humanizing recipe**:

- Spanish academic writers **hedge less** and use **more reader pronouns and
  imperatives** — a more assertive, reader-inclusive stance. English writers
  **hedge more** and are more dialogic about the reader. So Spanish-style
  directness reads native; calquing English hedges ("podría argumentarse
  que…") reads translated. *(Mur-Dueñas 2011, J. Pragmatics
  S0378216611001366: engagement 18.5 vs 14.5 per 10k words. High.)*
- Spanish has native hedging devices English lacks — the **conditional -ría**
  (*sería conveniente*, *podría interpretarse*), underused by L2 writers.
  *(Gang Yao, Ibérica. High.)*
- Register dimensions are **partly language-specific**; a claimed
  cross-linguistic oral/literate "universal" was **refuted 0-3** here. Don't
  assume a register trait ports across languages. *(Biber 1995, Cambridge UP.
  High.)*
- Caveat: this evidence is **academic-register**; whether it holds for
  conversational/literary/corporate Spanish is unestablished (NOTES open gap).

See [human-patterns.md](human-patterns.md) §C for the actionable version.

## Sources (verified subset)

- Wikipedia, "Signs of AI writing" — https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
- GPTZero, "How AI detectors work" — https://gptzero.me/news/how-ai-detectors-work/
- Pangram, "Why perplexity and burstiness fail" — https://www.pangram.com/blog/why-perplexity-and-burstiness-fail-to-detect-ai
- Pangram technical report — https://arxiv.org/pdf/2402.14873
- DAMAGE (humanizer evasion study) — https://arxiv.org/pdf/2501.03437
- Detector reliability, academic contexts — https://link.springer.com/article/10.1007/s40979-026-00213-1
- False positives on human text — https://pmc.ncbi.nlm.nih.gov/articles/PMC12331776/
- AI vs human writing features (SSRN) — https://papers.ssrn.com/sol3/Delivery.cfm/5833302.pdf?abstractid=5833302
- Spanish-native tell catalog — https://luisorlandolencarpio.substack.com/p/11-senales-de-que-chatgpt-escribio

Positive-catalog pass (2026), verified subset:

- Burstiness / scattered sentence length (EN news) — https://arxiv.org/pdf/2308.09067
- Burstiness + Burrows' Delta clustering (creative) — https://www.nature.com/articles/s41599-025-05986-3
- AI lower perplexity / uniform structure — https://www.tandfonline.com/doi/full/10.1080/09540091.2025.2507183
- Stylometry recovers author signal, temp/alignment don't — https://arxiv.org/pdf/2507.00838
- Morphosyntactic-category differences (essays) — https://www.mdpi.com/2078-2489/16/11/979
- ChatGPT > L2 on lexical diversity — https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1616935/full
- No single metric separates (diffusion/LLaDA) — https://arxiv.org/pdf/2507.10475
- GPT detectors biased vs non-native writers — https://www.sciencedirect.com/science/article/pii/S2666389923001307
- EN↔ES metadiscourse (Mur-Dueñas 2011) — https://www.researchgate.net/publication/251586757
- Spanish hedging with conditional -ría (Gang Yao) — https://www.academia.edu/146197617
- Cross-linguistic register dimensions (Biber 1995) — https://www.cambridge.org/core/books/dimensions-of-register-variation/FF817F2C32378B398C8019090381352E
