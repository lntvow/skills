---
name: core-manage
description: Managing installed skills — list, update, and remove commands.
---

# Managing Skills

## List Installed Skills

```bash
npx skills list              # All installed skills
npx skills ls -g             # Global only
npx skills ls -a claude-code  # Filter by agent
```

Alias: `npx skills ls`

## Update Skills

```bash
npx skills update              # All skills (interactive)
npx skills update my-skill     # Single skill
npx skills update -y           # Non-interactive, auto-detect scope
```

| Option          | Description                    |
| --------------- | ------------------------------ |
| `-g, --global`  | Only update global skills      |
| `-p, --project` | Only update project skills     |
| `-y, --yes`     | Skip prompts, auto-detect scope |

## Remove Skills

```bash
npx skills remove                # Interactive selection
npx skills remove my-skill       # By name
npx skills remove --all          # All skills, no confirmation
```

Alias: `npx skills rm`

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/README.md
-->
