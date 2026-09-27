---
name: advanced-telemetry
description: Runtime controls for the Skills CLI — disable anonymous telemetry and reveal internal skills when explicitly needed.
---

# Runtime Controls

## Telemetry

The CLI sends anonymous usage telemetry. GitHub repository and skill identifiers are sent only after GitHub confirms that the repository is public; other remote source types may include identifiers because their visibility cannot be checked through GitHub.

Disable telemetry for a command by setting either variable:

```bash
DISABLE_TELEMETRY=1 npx skills add vercel-labs/agent-skills --skill frontend-design -y
DO_NOT_TRACK=1 npx skills update -y
```

Both variables disable telemetry entirely. `--metadata <json>` is different: it adds valid JSON to an install telemetry event and does not change installation behavior.

## Internal Skills

Skills with `metadata.internal: true` are hidden by default. Set `INSTALL_INTERNAL_SKILLS=1` or `true` when listing or bulk-installing internal skills:

```bash
INSTALL_INTERNAL_SKILLS=1 npx skills add vercel-labs/agent-skills --list
```

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/README.md
- https://github.com/vercel-labs/skills/blob/main/src/telemetry.ts
- https://github.com/vercel-labs/skills/blob/main/src/skills.ts
-->
