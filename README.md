# Human-Writer

A Claude Code **skill** that humanizes AI-generated writing in **English and
Spanish** — it removes the tells that make text read as machine-written and
rewrites it to sound like a person.

It works in two steps:

1. **Detect** — `aidetect.mjs` scores text 0–100 for AI "tells" (higher =
   more machine-sounding), flags each pattern with the line and a fix, and
   measures sentence-length variation ("burstiness"). Zero dependencies,
   pure Node ≥18.
2. **Rewrite** — the agent rewrites the flagged spans using the evidence-based
   catalogs in [`references/`](references/), then re-scores to confirm the
   drop.

The anti-pattern criteria come from a fact-checked research pass
([references/research-summary.md](references/research-summary.md)) and were
hardened through field tests + an adversarial review round.

> **Honest scope**: the goal is writing that *reads human*, not "beating a
> detector." AI detectors are documented to be unreliable and biased against
> non-native writers — this tool never promises a text will pass one.

## Quick start

```bash
# score a file (auto-detects EN / ES / mixed)
node aidetect.mjs path/to/text.txt

# pipe text in
echo "your text here" | node aidetect.mjs -

# force a language, or get JSON
node aidetect.mjs --lang es path/to/text.txt
node aidetect.mjs --json path/to/text.txt
```

Full usage, the rewrite loop, and the rules table live in
[SKILL.md](SKILL.md).

## Install as a Claude Code skill

Clone (or symlink) this repo into your Claude skills directory so the
`/human-writer` command is discoverable:

```bash
git clone <your-repo-url> ~/.claude/skills/human-writer
```

Then in any Claude Code session: type `/human-writer`, or just ask
"humaniza este texto…" / "make this sound less like AI."

## Develop

```bash
sh run-tests.sh   # regression suite: score ranges, per-rule probes,
                  # false-positive guards, CLI checks. Run after ANY rule change.
```

- `aidetect.mjs` — the scorer (the driver).
- `references/anti-patterns-{en,es}.md` — the rewrite catalogs.
- `references/research-summary.md` — evidence base + sources.
- `samples/` — AI + human fixtures used by the suite.
- `NOTES.md` — refinement log and known accepted debt.
