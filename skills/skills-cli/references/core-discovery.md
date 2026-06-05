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
- `.factory/skills/`
- `.forge/skills/`
- `.goose/skills/`
- `.hermes/skills/`
- `.inferencesh/skills/`
- `.jazz/skills/`
- `.junie/skills/`
- `.iflow/skills/`
- `.kilocode/skills/`
- `.kiro/skills/`
- `.kode/skills/`
- `.lingma/skills/`
- `.mcpjam/skills/`
- `.vibe/skills/`
- `.moxby/skills/`
- `.mux/skills/`
- `.openhands/skills/`
- `.ona/skills/`
- `.pi/skills/`
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
- `.zencoder/skills/`
- `.neovate/skills/`
- `.pochi/skills/`
- `.adal/skills/`

## Depth Rules

- Each skill container directory is walked **one level deep** for flat layout: `skills/<name>/SKILL.md`
- Walked **two levels deep** for catalog layout: `skills/<category>/<name>/SKILL.md`
- A `SKILL.md` at the shallower level **shadows** anything nested below it
- Use `--full-depth` to discover `SKILL.md` files outside standard container directories (e.g., `examples/`, `tests/`)

## Plugin Manifest Discovery

If `.claude-plugin/marketplace.json` or `.claude-plugin/plugin.json` exists, skills declared in those manifests are also discovered at their declared depth.

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/README.md
-->
