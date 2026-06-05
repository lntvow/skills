---
name: core-install
description: Installing skills via npx skills add — source formats, key options, scope, and common patterns.
---

# Installing Skills

`npx skills add` is the primary command for installing agent skills.

## Source Formats

```bash
# GitHub shorthand
npx skills add vercel-labs/agent-skills

# Full GitHub URL
npx skills add https://github.com/vercel-labs/agent-skills

# Direct path to a skill in a repo
npx skills add https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines

# GitLab URL
npx skills add https://gitlab.com/org/repo

# Any git URL
npx skills add git@github.com:vercel-labs/agent-skills.git

# Local path
npx skills add ./my-local-skills
```

## Key Options

| Option                    | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `-g, --global`            | Install to user directory instead of project          |
| `-a, --agent <agents...>` | Target specific agents (e.g., `claude-code`, `codex`) |
| `-s, --skill <skills...>` | Install specific skills by name (use `'*'` for all)   |
| `-l, --list`              | List available skills without installing              |
| `--copy`                  | Copy files instead of symlinking                      |
| `-y, --yes`               | Skip confirmation prompts                             |
| `--all`                   | Install all skills to all agents without prompts      |

## Installation Scope

| Scope       | Flag      | Location            |
| ----------- | --------- | ------------------- |
| **Project** | (default) | `./<agent>/skills/` |
| **Global**  | `-g`      | `~/<agent>/skills/` |

## Common Patterns

```bash
# List skills in a repository
npx skills add vercel-labs/agent-skills --list

# Install specific skills
npx skills add vercel-labs/agent-skills --skill frontend-design --skill skill-creator

# Install to specific agents
npx skills add vercel-labs/agent-skills -a claude-code -a opencode

# Non-interactive (CI/CD)
npx skills add vercel-labs/agent-skills --skill frontend-design -g -a claude-code -y
```

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/README.md
-->
