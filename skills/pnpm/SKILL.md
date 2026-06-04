---
name: pnpm
description: Configures and manages pnpm workspaces, catalogs, filtering, and monorepo workflows. Used when working with pnpm, pnpm-workspace.yaml, monorepos, or managing dependencies with pnpm commands.
metadata:
  author: lntvow
  version: '2026.6.4'
  source: Generated from https://github.com/pnpm/pnpm.io, scripts located at https://github.com/lntvow/skills
---

> The skill is based on pnpm v11, generated at 2026-06-04.

pnpm is a fast, disk-space-efficient package manager. Use `pnpm-workspace.yaml` for all pnpm-specific config (not `.npmrc` except for auth/registry). Use the shorthand `pn` for `pnpm`, `pnx` for `pnpm dlx`.

## Core References

| Topic     | Description                                                 | Reference                                      |
| --------- | ----------------------------------------------------------- | ---------------------------------------------- |
| Workspace | `pnpm-workspace.yaml`, workspace protocol, `packageConfigs` | [core-workspace](references/core-workspace.md) |
| Catalogs  | Centralized version management with `catalog:` protocol     | [core-catalogs](references/core-catalogs.md)   |
| Filtering | `--filter` syntax for targeting packages in monorepos       | [core-filtering](references/core-filtering.md) |

## Feature References

| Topic        | Description                                                        | Reference                                                    |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| package.json | pnpm-specific fields: `dependenciesMeta`, `devEngines`, `injected` | [features-package-json](references/features-package-json.md) |
| CLI Commands | `add`, `install`, `run`, `dlx`, `exec`, `why` patterns             | [features-cli](references/features-cli.md)                   |
| Scripts      | Hidden scripts, lifecycle hooks, env variables, regex matching     | [features-scripts](references/features-scripts.md)           |
