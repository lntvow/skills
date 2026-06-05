---
name: features-find
description: Searching for skills using npx skills find — interactive and keyword-based discovery.
---

# Finding Skills

`npx skills find` searches for skills interactively or by keyword.

```bash
# Interactive search (fzf-style)
npx skills find

# Search by keyword
npx skills find typescript
npx skills find react performance
```

## Workflow for Helping Users

1. Check [skills.sh](https://skills.sh/) leaderboard first — top skills ranked by installs
2. Run `npx skills find <query>` if leaderboard doesn't cover the need
3. Verify quality before recommending: prefer 1K+ installs from reputable sources
4. Present the install command: `npx skills add <source> --skill <name>`

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/README.md
- https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md
-->
