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

## Refuted / be careful (things NOT to claim)

- ❌ **"Adding sentence-length variation (burstiness) also raises
  perplexity, so one fix improves both."** *Refuted 0-3.* Burstiness and
  perplexity are partly independent — address them separately. (This is why
  `aidetect.mjs` scores vocabulary tells and sentence-length variation as
  **separate** contributions.)
- ❌ Specific vendor accuracy boasts ("98%+, <1% false positives") did not
  survive verification. Don't cite them.

## Spanish — an explicit evidence gap

The verified English-language corpus contains **no direct evidence** on
Spanish-specific AI markers. The Spanish catalog in
[anti-patterns-es.md](anti-patterns-es.md) is built from (a) a Spanish-native
practitioner source ("11 señales de que ChatGPT escribió tu texto," which
confirms overuse of *gerundios* and formulaic markers like *además / por
otro lado*; it also names the *"poder + infinitivo"* hedging periphrasis,
which is **not yet encoded** in the scorer — see NOTES.md open gaps) and
(b) craft translation of the English tells. It is **less rigorously
verified** than the English catalog. The AI-vocabulary lists are also era-specific and rotate as
models change — expect to update them.

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
