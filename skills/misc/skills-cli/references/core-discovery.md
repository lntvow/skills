---
name: core-discovery
description: Where the skills CLI searches for skills in repositories — discovery directories, depth rules, and --full-depth flag.
---

# Skill Discovery Directories

The CLI searches for `SKILL.md` files in these directories within a repository:

- Root directory (if it contains `SKILL.md`)
- `skills/`
- `skills/.curated/`
- `skills/.experimental/`
- `skills/.system/`
- `.aider-desk/skills/`
- `.agents/skills/`
- `data/skills/`
- `.autohand/skills/`
- `.augment/skills/`
- `.bob/skills/`
- `.claude/skills/`
- `.codeartsdoer/skills/`
- `.codebuddy/skills/`
- `.codemaker/skills/`
- `.codestudio/skills/`
- `.commandcode/skills/`
- `.continue/skills/`
- `.cortex/skills/`
- `.crush/skills/`
- `.devin/skills/`
- `agent/skills/`
- `.forge/skills/`
- `.fx/skills/`
- `.goose/skills/`
- `.grok/skills/`
- `.hermes/skills/`
- `.inferencesh/skills/`
- `.jazz/skills/`
- `.junie/skills/`
- `.iflow/skills/`
- `.kimchi/skills/`
- `.kiro/skills/`
- `.kode/skills/`
- `.lingma/skills/`
- `.mcpjam/skills/`
- `.minimax/skills/`
- `.vibe/skills/`
- `.moxby/skills/`
- `.mux/skills/`
- `.openhands/skills/`
- `.ona/skills/`
- `.pi/skills/`
- `.posit/assistant/skills/`
- `.qoder/skills/`
- `.qwen/skills/`
- `.reasonix/skills/`
- `.rovodev/skills/`
- `.roo/skills/`
- `.tabnine/agent/skills/`
- `.terramind/skills/`
- `.tinycloud/skills/`
- `.trae/skills/`
- `.windsurf/skills/`
- `.zcode/skills/`
- `.zencoder/skills/`
- `.neovate/skills/`
- `.pochi/skills/`
- `.adal/skills/`

## Depth Rules

- Each skill container directory is walked **up to three levels deep** (`DEFAULT_SKILL_CONTAINER_DEPTH = 3`)
- Covers flat layout `skills/<name>/SKILL.md` and catalog layouts with one or two category levels: `skills/<category>/<name>/SKILL.md` and `skills/<category>/<category>/<name>/SKILL.md`
- A `SKILL.md` at a shallower level **shadows** anything nested below it
- Use `--full-depth` to discover `SKILL.md` files outside the container directories (e.g., `examples/`, `tests/`)
- If nothing is found in the standard locations, the CLI falls back to a recursive search

## Plugin Manifest Discovery

If `.claude-plugin/marketplace.json` or `.claude-plugin/plugin.json` exists, skills declared in those manifests are also discovered at their declared depth. These declared paths are not limited by the normal depth-3 catalog walk. If standard locations produce no skills, the CLI performs a recursive fallback search.

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/README.md
-->
