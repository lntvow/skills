---
name: core-manage
description: Managing installed skills — list, update, and remove commands plus the experimental lock-file commands.
---

# Managing Skills

## Command Aliases

Use the long names in shared scripts, but recognize these aliases when interpreting existing commands:

| Command | Aliases | Behavior |
| ------- | ------- | -------- |
| `add` | `a` | Install skills |
| `add` | `a`, `i`, `install` | Install skills; a source argument is still required |
| `remove` | `rm`, `r` | Remove installed skills |
| `find` | `search`, `f`, `s` | Search for skills |
| `update` | `check`, `upgrade` | Check for and install updates |

## List Installed Skills

```bash
npx skills list                # Installed skills
npx skills ls -g               # Global only
npx skills ls -a claude-code   # Filter by agent
npx skills ls --json           # Machine-readable output
```

Alias: `npx skills ls`. `--json` emits JSON without ANSI codes — prefer it over parsing the human output.

## Update Skills

```bash
npx skills update              # All skills (interactive scope prompt)
npx skills update my-skill     # Single skill
npx skills update skill-one skill-two
npx skills update -y           # Non-interactive, auto-detect scope
```

| Option          | Description                                                               |
| --------------- | ------------------------------------------------------------------------- |
| `-g, --global`  | Only update global skills                                                 |
| `-p, --project` | Only update project skills                                                |
| `-y, --yes`     | Skip prompts, auto-detect scope (project if in a project dir, else global) |

Behavior worth knowing:

- Project scope is detected by a `skills-lock.json` in the current working directory; non-TTY runs behave like `-y`.
- When the GitHub API is unavailable (or skill paths moved), updates fall back to an authenticated Git clone.
- Skills deleted upstream are reported and offered for local removal.
- Skills moved inside their source are relocated by normalized name; ambiguous matches (several skills sharing that name) fail closed — neither migrated nor deleted.

## Remove Skills

```bash
npx skills remove                # Interactive selection
npx skills remove my-skill       # By name
npx skills remove --all          # Shorthand for --skill '*' --agent '*' -y
npx skills remove --skill '*' -a cursor
```

Alias: `npx skills rm`

| Option         | Description                                     |
| -------------- | ----------------------------------------------- |
| `-g, --global` | Remove from global scope                        |
| `-a, --agent`  | Remove from specific agents (omit to clean all) |
| `-s, --skill`  | Skills to remove (use `'*'` for all)            |
| `-y, --yes`    | Skip confirmation prompts                       |
| `--all`        | Shorthand for `--skill '*' --agent '*' -y`      |

## Experimental Commands

| Command                           | Description                                                                 |
| --------------------------------- | --------------------------------------------------------------------------- |
| `npx skills experimental_install` | Reinstall everything in the project `skills-lock.json` to universal agents |
| `npx skills experimental_sync`    | Sync skills from `node_modules` into agent directories (`-a`, `-y`)        |

`experimental_install` targets only `.agents/skills/` (universal agents) and does not touch agent-specific directories; `node_modules` skills are handled by `experimental_sync`.

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/README.md
-->
