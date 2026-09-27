---
name: features-discovery
description: Discover and use agent skills — keyword search, non-interactive behavior, prompt piping, and launching a supported agent.
---

# Discovering and Using Skills

## Find a Skill

Use the skills.sh leaderboard for popular candidates, then search by one or more specific keywords:

```bash
npx skills find typescript
npx skills find react performance
npx skills find react --owner vercel
```

`--owner <owner>` restricts results to a GitHub user or organization. Results come from the skills.sh search API, with at most 20 results and install counts. `SKILLS_API_URL` overrides the API base URL.

When recommending a result, check its source reputation and install count instead of trusting a search hit alone. Install a selected skill with:

```bash
npx skills add <source> --skill <name>
```

In an agent or other non-TTY environment, bare `skills find` does not open the interactive selector; pass a query instead.

## Use Without Installing

`skills use` resolves a source like `skills add`, writes the selected skill to a temporary directory, and emits a generated prompt:

```bash
# Pipe the prompt into an agent
npx skills use vercel-labs/agent-skills@web-design-guidelines | claude

# Let the CLI launch one supported agent
npx skills use vercel-labs/agent-skills --skill web-design-guidelines --agent claude-code
```

| Option                | Behavior                                           |
| --------------------- | -------------------------------------------------- |
| `-s, --skill <skill>` | Select the skill, also possible with `@skill`      |
| `-a, --agent <agent>` | Launch one supported agent interactively           |
| `--full-depth`        | Search nested directories beyond normal discovery  |

Without `--agent`, only the prompt is written to stdout: nothing is installed and no agent directory is modified. Use this for a one-off task that should not persist on disk.

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/README.md
- https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md
- https://github.com/vercel-labs/skills/blob/main/src/find.ts
- https://github.com/vercel-labs/skills/blob/main/src/use.ts
-->
