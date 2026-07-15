# Human-Writer

A Claude Code **skill** that humanizes AI-generated writing in **English and
Spanish**. It strips out the tells that make text read as machine-written and
rewrites it to sound like a person.

The skill works in two steps.

1. **Detect.** `aidetect.mjs` scores text from 0 to 100 for AI "tells" (higher
   means more machine-sounding). It flags each pattern with its line and a
   suggested fix, and it measures sentence-length variation ("burstiness").
   Zero dependencies, pure Node 18+.
2. **Rewrite.** The agent fixes the flagged spans using the catalogs in
   [`references/`](references/), then re-scores to confirm the number dropped.

The anti-pattern criteria come from a fact-checked research pass (see
[references/research-summary.md](references/research-summary.md)) and got
hardened through six field tests plus a three-reviewer adversarial round.

> **Honest scope.** The goal is writing that *reads human*, not writing that
> "beats a detector." AI detectors are unreliable and biased against
> non-native writers, so this tool never promises your text will pass one.

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

The full usage, the rewrite loop, and the rules table live in
[SKILL.md](SKILL.md).

## Install as a Claude Code skill

Clone this repo straight into your Claude skills directory so the
`/human-writer` command shows up:

```bash
git clone https://github.com/cesareyeserrano/human-writer ~/.claude/skills/human-writer
```

Then, in any Claude Code session, type `/human-writer`, or just ask it to
"humaniza este texto…" or "make this sound less like AI."

## Develop

```bash
sh run-tests.sh   # regression suite: score ranges, per-rule probes,
                  # false-positive guards, CLI checks. Run it after any rule change.
```

What lives where:

- `aidetect.mjs` is the scorer (the driver).
- `references/anti-patterns-{en,es}.md` are the rewrite catalogs.
- `references/research-summary.md` is the evidence base, with sources.
- `samples/` holds the AI and human fixtures the suite runs against.
- `NOTES.md` is the refinement log, including the debt we knowingly kept.

## License

MIT. Use it, fork it, ship it.
