---
name: skills-cli
description: The Skills CLI — install, manage, discover, and create agent skills. Used when working with npx skills commands, agent skills ecosystem, skill discovery, or SKILL.md authoring.
metadata:
  author: lntvow
  version: '2026.9.16'
  source: Generated from https://github.com/vercel-labs/skills, scripts located at https://github.com/lntvow/skills
---

> The skill is based on skills-cli v1.5.26, generated at 2026-09-16.

The Skills CLI (`npx skills`) is the package manager for the open agent skills ecosystem. Skills are reusable instruction sets that extend coding agent capabilities, defined in `SKILL.md` files with YAML frontmatter.

## Core References

| Topic             | Description                                               | Reference                                      |
| ----------------- | --------------------------------------------------------- | ---------------------------------------------- |
| Installing Skills | `skills add` — source formats, key options, scope         | [core-install](references/core-install.md)     |
| Managing Skills   | `skills list`, `skills update`, `skills remove`, aliases, lock install/sync | [core-manage](references/core-manage.md) |
| Supported Agents  | All `--agent` values, project/global paths, Eve subagents | [core-agents](references/core-agents.md)       |
| Skill Discovery   | All directories the CLI searches for `SKILL.md` files      | [core-discovery](references/core-discovery.md) |

## Feature References

| Topic           | Description                                              | Reference                                      |
| --------------- | -------------------------------------------------------- | ---------------------------------------------- |
| Discovering Skills | `skills find` and `skills use` — search, pipe, or launch | [features-discovery](references/features-discovery.md) |
| Creating Skills | `skills init` — SKILL.md template and frontmatter        | [features-init](references/features-init.md)   |

## Advanced References

| Topic              | Description                                                     | Reference                                            |
| ------------------ | --------------------------------------------------------------- | ---------------------------------------------------- |
| Lock Files         | Global `.skill-lock.json`, project `skills-lock.json`, hashes    | [advanced-lockfile](references/advanced-lockfile.md) |
| Source Resolution  | Git/Azure/web sources, private repositories, and authentication | [advanced-sources](references/advanced-sources.md)  |
| Runtime Controls   | Telemetry opt-out and internal-skill visibility                  | [advanced-telemetry](references/advanced-telemetry.md) |
