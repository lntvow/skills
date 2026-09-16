---
name: core-install
description: Installing skills via npx skills add — source formats, key options, scope, and common patterns.
---

# Installing Skills

`npx skills add` is the primary command for installing agent skills.

## Source Formats

```bash
# GitHub shorthand or URL
npx skills add vercel-labs/agent-skills
npx skills add https://github.com/vercel-labs/agent-skills

# Direct path to one skill
npx skills add https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines

# Local path
npx skills add ./my-local-skills

# GitLab, Azure Repos, or another Git URL
npx skills add https://gitlab.com/org/repo
npx skills add https://dev.azure.com/org/project/_git/repo
npx skills add git@github.com:vercel-labs/agent-skills.git

# Well-known site or direct SKILL.md/archive URL
npx skills add https://example.com/download/my-skill
```

Source selectors, well-known discovery, archives, download limits, and private-repository authentication: [advanced-sources](advanced-sources.md).

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
| `--full-depth`            | Search all subdirectories even when a root `SKILL.md` exists |
| `--json`                  | Output results as a JSON array (machine-readable, no ANSI) |
| `--metadata <json>`       | Attach JSON to install telemetry; see runtime controls |
| `--subagent <names...>`   | Install into Eve subagents (use `root` for the root agent) |

## Installation Scope

| Scope       | Flag      | Location            |
| ----------- | --------- | ------------------- |
| **Project** | (default) | `./<agent>/skills/` |
| **Global**  | `-g`      | `~/<agent>/skills/` |

## Installation Method

Interactive installs default to a symlink from each agent directory to a canonical copy. Prefer this when supported so updates have one source of truth. Use `--copy` when symlinks are unavailable or the agent needs an independent copy.

## Common Patterns

```bash
# List skills in a repository
npx skills add vercel-labs/agent-skills --list

# Install specific skills
npx skills add vercel-labs/agent-skills --skill frontend-design --skill skill-creator

# Install to specific agents
npx skills add vercel-labs/agent-skills -a claude-code -a opencode

# Install all skills to all agents
npx skills add vercel-labs/agent-skills --all

# Install one skill to every agent
npx skills add vercel-labs/agent-skills --skill frontend-design --agent '*'

# Non-interactive (CI/CD)
npx skills add vercel-labs/agent-skills --skill frontend-design -g -a claude-code -y

# Machine-readable output for scripts
npx skills add vercel-labs/agent-skills --json -y
```

In a non-TTY shell, provide `--agent <name>` (or `--agent '*'`) and `-y` so the CLI does not wait for an agent-selection prompt. When running inside a detected coding agent, the CLI supplies non-interactive defaults automatically.

## Machine-Readable Output

`--json` prints a JSON array (one entry per skill) to stdout with no ANSI codes; human-facing errors go to stderr, so the stream stays parseable. Prefer it over scraping the pretty output.

`--json` is non-interactive: pair it with `--yes` (or `--all`), and do not combine it with `--list`. It is currently unavailable for well-known skill sources.

`--metadata <json>` attaches valid JSON to the install telemetry event only — it has no effect on installation.

## Eve Subagents

Eve installs are project-only and live under `agent/`. Pass `--subagent <name>` to also copy skills into `agent/subagents/<name>/skills`; use `--subagent root` for the root agent (`agent/skills`). See [core-agents](core-agents.md).

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/README.md
-->
