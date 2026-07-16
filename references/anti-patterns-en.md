# AI Anti-Patterns — English

Each entry: the tell → why it reads as AI → a before/after rewrite. The
scorer (`aidetect.mjs`) flags most of these by id; this file is the
rewriting reference for what to do once flagged.

Rewrite for *meaning first*. Never invent facts to sound human — cut,
compress, or make the existing claim direct.

---

## 1. Negative parallelism — "It's not just X, it's Y"

Also: "not only… but also", "it's not merely… but rather", "isn't about X,
it's about Y". This construction is one of the strongest LLM signatures —
LLMs use it roughly 3× more than humans. Watch for ALL its shapes:

- `it's not X, it's Y` — *It's not a librarian, it's a convincing generator.*
- `isn't A; it's B` — *Its core function isn't search; it's prediction.*
- `not X, but Y` — *Their job isn't to invent facts, but to point you elsewhere.*
- `doesn't X; it Y` — *That doesn't reduce your duty; it increases it.*
- Antithesis **section headings** — a heading shaped as "It's not X, it's Y"
  is the same tell in title form.

Examples:

- ❌ *AI isn't just a tool — it's a revolution reshaping the fabric of society.*
- ✅ *AI is changing how companies write code, run support, and forecast demand.*
- ❌ *Its core function isn't search; it's prediction.*
- ✅ *At its core, it predicts.*

Fix: delete the negated frame and assert the real point, ideally with a
concrete example instead of an abstraction. **Exception**: if ONE antithesis
is the text's deliberate hook (a memorable closing line), keep it — the tell
is density, not existence. Five in one essay is a signature; one is style.

Caution (false positive): a conditional like *"if you don't work in tech,
it's normal to feel lost"* is NOT parallelism — don't rewrite those.

## 2. Inflated / promotional vocabulary

High-frequency LLM words: *delve, tapestry, testament, underscore, leverage,
foster, harness, realm, navigate, unlock, elevate, nestled, seamless, myriad,
plethora, boast, vibrant, bustling, intricate, meticulous, bolster, showcase,
enhance, captivating, majestic, fascinating, aligns with, cutting-edge,
bespoke, undoubtedly, flawless, game-changer.*

**Register-ambiguous tier** — *robust, landscape, crucial, vital, pivotal,
paramount, profound* — is normal in formal human prose (academic papers use
"robust standard errors" and "crucial" legitimately). The scorer only counts
these as a tell when 3+ cluster together. When rewriting, keep the one that
earns its place; thin out the pile-up.

- ❌ *Delving into the realm of ML, we uncover a rich tapestry of possibilities.*
- ✅ *Machine learning already runs fraud detection, ad ranking, and medical triage.*

Fix: replace with plain words (*use, show, area, field, many*) or cut the
sentence. If a word is doing real work, keep it — the problem is the cluster.

## 3. Formulaic transitions & hedge openers

*Moreover, Furthermore, Additionally, Consequently, Ultimately, In
conclusion, In summary, That being said, It's important to note, It's worth
noting, Importantly, Notably.*

- ❌ *Moreover, it is important to note that adoption continues to grow.*
- ✅ *Adoption is still growing — up 40% since last year.*

Fix: delete the opener. If a logical link is needed, make it specific
("Because of that…", "The catch:"). Humans rarely start a sentence with
"Moreover".

## 4. Vague attribution

*Studies show, research indicates, experts say, it is widely known, many
believe, some argue.*

- ❌ *Studies show that businesses leveraging AI see significant improvements.*
- ✅ *A 2024 McKinsey survey found 63% of adopters reported cost savings.* (or, if you have no source, drop the claim to authority entirely)

Fix: name the source and date, or make the claim in your own voice and own it.

## 5. Superficial "-ing" analysis — opening AND trailing

Two shapes, same filler. Sentence-initial: *Delving/Exploring/Embracing/
Navigating…* followed by a vague payoff. And — the more common form per
Wikipedia's catalog — the **trailing commentary clause** bolted onto the end
of a sentence: *…, highlighting the importance of X*, *…, underscoring Y*,
*…, reflecting broader trends*, *…, paving the way for Z*.

- ❌ *Exploring the future of work, we see endless opportunities.*
- ✅ *Remote work killed the 9-to-5 for a third of knowledge workers.*
- ❌ *Revenue grew 40% last year, highlighting the importance of diversification.*
- ✅ *Revenue grew 40% last year. Most of that came from the two new lines.*

Fix: start with the subject and a concrete verb; cut trailing clauses or
promote them to their own sentence with a real claim.

## 5b. Em-dash overuse (and its substitutes: en-dash, double-hyphen)

LLM output uses em-dashes far more often than human writing of the same
genre, and in places where a human would use a comma, colon, or parentheses.
Watch for the same tell wearing different clothes: a spaced **en-dash**
(*word – word*) or a spaced **double-hyphen** (*word -- word*) serve the
exact same function and are just as common in AI output — the scorer
catches all three. Replace each one **by its function**, not mechanically:

- Heading or aside → parentheses: *Lo que está bien (no lo toques)*
- Before an explanation → colon: *one thing matters: rhythm*
- Joining two independent ideas → period or comma
- Contrast → a conjunction: *…not verbatim, though you can open space for it*

One expressive em-dash per page is style. Four per paragraph is a signature.

## 5c. Engagement-bait slop phrases

Stock "creator voice" beats: *Here's the thing. / The bottom line? /
Let's break it down. / In a world where… / At the end of the day… /
What does this mean for you? / Your future self will thank you. /
It's less about X and more about Y.*

Fix: delete the beat and say the point. These add rhythm, not content.

## 6. Rule of three (triads)

LLMs love "X, Y, and Z". One is fine; a paragraph of them is a rhythm
signature.

- ❌ *It fosters innovation, enhances productivity, and unlocks opportunity.*
- ✅ *It cuts the busywork so people ship faster.*

Fix: break the pattern — use two items, or four, or split into separate
sentences of different lengths.

## 7. Cliché scene-setting openers

*In today's fast-paced digital world/landscape/age, In the realm of, When
it comes to, In an era of.*

- ❌ *In today's fast-paced digital landscape, cybersecurity is more important than ever.*
- ✅ *Ransomware hit 66% of mid-size companies last year.*

Fix: delete the runway and start on the actual subject, ideally a fact.

## 8. Uniform sentence length (low burstiness)

Human writing swings between short and long sentences. AI output clusters
around one medium length. The scorer measures this as CV (coefficient of
variation); below ~0.35 is a flag.

- ❌ *AI is useful. It saves time. It improves quality. It reduces errors. It helps teams.* (all 3–4 words)
- ✅ *AI saves time. Not always — the first week I lost hours cleaning up its confident, wrong suggestions — but once you learn to read its output critically, the boring work evaporates.*

Fix: deliberately write one very short sentence and one long one. Read it
aloud; if the rhythm is a metronome, vary it.

## 9. Hedging, sycophancy, chatbot filler

*Great question, Absolutely, Certainly, Of course, I hope this helps, Feel
free to, It depends, There are many factors to consider.*

- ❌ *That's a great question! There are many factors to consider…*
- ✅ *(just answer)*

Fix: delete. Say the thing.

## 10. Over-structuring & formatting tells

Bulleted lists where prose belongs, a header on every short section,
Title Case On Everything, bold on random phrases, emoji section markers,
curly quotes `“ ”` from auto-formatting.

**Label-colon templates**: lines opening with a short capitalized label —
*The Challenge:*, *The Pivot:*, *The Reality Check:*, *The Bottom Line:*.
This summary-card structure is an AI signature.

- ❌ *The Challenge: reps can no longer rely on scripts.*
- ✅ *Reps can't lean on scripts anymore.*

Fix: for narrative prose, use paragraphs. Fold labeled cards into the text.
Reserve lists for things that are genuinely lists. Sentence case. Straight
quotes unless house style says otherwise.

---

## Rewrite checklist

Before returning humanized text, confirm:

- [ ] No "it's not just X, it's Y" and no "not only… but also" left.
- [ ] Inflated-word cluster gone (delve/tapestry/realm/leverage/foster…).
- [ ] No sentence opens with Moreover/Furthermore/In conclusion.
- [ ] Every "studies show" either sourced or removed.
- [ ] Sentence lengths vary (re-score: CV ≥ 0.5).
- [ ] Generic statements grounded in specifics **already present in the
      text** (or clearly illustrative examples). No invented statistics,
      sources, or events — ever.
- [ ] Meaning and facts preserved.
- [ ] Re-scored with `aidetect.mjs`; number dropped substantially.
