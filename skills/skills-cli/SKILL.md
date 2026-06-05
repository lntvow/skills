---
name: skills-cli
description: The Skills CLI — install, manage, discover, and create agent skills. Used when working with npx skills commands, agent skills ecosystem, skill discovery, or SKILL.md authoring.
metadata:
  author: lntvow
  version: '2026.6.5'
  source: Generated from https://github.com/vercel-labs/skills, scripts located at https://github.com/lntvow/skills
---

> The skill is based on skills-cli v1.5.10, generated at 2026-06-05.

The Skills CLI (`npx skills`) is the package manager for the open agent skills ecosystem. Skills are reusable instruction sets that extend coding agent capabilities, defined in `SKILL.md` files with YAML frontmatter.

## Core References

| Topic             | Description                                              | Reference                                    |
| ----------------- | -------------------------------------------------------- | -------------------------------------------- |
| Installing Skills | `skills add` — source formats, key options, scope        | [core-install](references/core-install.md)   |
| Managing Skills   | `skills list`, `skills update`, `skills remove`          | [core-manage](references/core-manage.md)     |
| Supported Agents  | All `--agent` values, project/global paths               | [core-agents](references/core-agents.md)     |
| Skill Discovery   | All directories the CLI searches for `SKILL.md` files     | [core-discovery](references/core-discovery.md) |

## Feature References

| Topic           | Description                                        | Reference                                      |
| --------------- | -------------------------------------------------- | ---------------------------------------------- |
| Finding Skills  | `skills find` — interactive and keyword search     | [features-find](references/features-find.md)   |
| Creating Skills | `skills init` — SKILL.md template and frontmatter  | [features-init](references/features-init.md)   |

## Advanced References

| Topic       | Description                                             | Reference                                            |
| ----------- | ------------------------------------------------------- | ---------------------------------------------------- |
| Lock Files  | `skills-lock.json`, `skillFolderHash`, update checking  | [advanced-lockfile](references/advanced-lockfile.md) |
