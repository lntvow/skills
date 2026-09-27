---
name: pnpm
description: pnpm package manager and monorepo workflows — configuration, workspaces, catalogs, filtering, CLI commands, settings, package sources, registries, lockfile, task orchestration, and releases. Used when working with pnpm, pnpm-workspace.yaml, pnpm-lock.yaml, or managing dependencies in a pnpm project.
metadata:
  author: lntvow
  version: '2026.9.24'
  source: Generated from https://github.com/pnpm/pnpm.io, scripts located at https://github.com/lntvow/skills
---

> The skill is based on pnpm v12 (pnpm.io docs snapshot 2026-09-23), generated at 2026-09-24. Behaviour that differs on v11 is annotated inline.

pnpm is a fast, disk-space-efficient package manager built around a content-addressable store and a strict, symlinked `node_modules`. Since v11 **all settings except auth/registry live in `pnpm-workspace.yaml` (project) or the global `config.yaml`** — `.npmrc` is only for registry and credentials, and the `pnpm` field of `package.json` is no longer read. Shorthands: `pn` = `pnpm`, `pnx` = `pnpm dlx`.

## Core References

| Topic         | Description                                                          | Reference                                                              |
| ------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Configuration | Config files, precedence, YAML syntax, env vars, renamed settings    | [core-configuration](references/core-configuration.md)                 |
| Workspace     | `packages` globs, `workspace:` protocol, workspace settings          | [core-workspace](references/core-workspace.md)                         |
| Catalogs      | Shared version ranges and the `catalog:` protocol                    | [core-catalogs](references/core-catalogs.md)                           |
| Filtering     | `--filter` selectors: names, globs, ellipsis, git-diff selectors      | [core-filtering](references/core-filtering.md)                         |

## Settings

| Topic                | Description                                                                       | Reference                                                                                  |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Layout & Store       | `nodeLinker`, hoisting, virtual store, `storeDir`, lockfile settings              | [settings-node-modules](references/settings-node-modules.md)                               |
| Resolution & Peers   | `overrides`, `packageExtensions`, supply-chain pinning, all peer settings          | [settings-dependency-resolution](references/settings-dependency-resolution.md)              |
| CLI, Network & Misc  | Output, runtimes, proxies, caches, `savePrefix`, global dirs                       | [settings-environment](references/settings-environment.md)                                  |

## Feature References

| Topic               | Description                                                                    | Reference                                                                        |
| ------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| CLI Commands        | Command cheat sheet, aliases, flags, error codes                               | [features-cli](references/features-cli.md)                                       |
| Scripts & Builds    | Hidden scripts, lifecycle hooks, script env, `allowBuilds` approval            | [features-scripts](references/features-scripts.md)                                |
| package.json        | `devEngines`, `dependenciesMeta.injected`, `publishConfig`, alt manifests       | [features-package-json](references/features-package-json.md)                      |
| Package Sources     | `jsr:`/`crate:`/`pypi:`, aliases, git and tarball specs, purl, Python, Cargo    | [features-package-sources](references/features-package-sources.md)                |
| Registries & Auth   | `registries` routing, registry revisions (`+rN`), `.npmrc` credentials          | [features-registries](references/features-registries.md)                          |
| Lockfile & Patches  | Two-document lockfile, frozen installs, branch lockfiles, `pnpm patch`          | [features-lockfile](references/features-lockfile.md)                              |
| Task Orchestration  | `tasks.dependsOn`, `concurrencyGroups`, priority, `pnpm pipeline`               | [features-task-orchestration](references/features-task-orchestration.md)          |
| Global Packages     | Isolated install groups, global virtual store, shims, runtimes                  | [features-global-packages](references/features-global-packages.md)                |
| Releases            | `pnpm change`/`version -r`/`lane`, publishing, staging, `pnpm deploy`           | [features-release-management](references/features-release-management.md)          |

## Advanced References

| Topic            | Description                                                                        | Reference                                                        |
| ---------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| pnpmfile Hooks   | `readPackage`, `updateConfig`, finders, custom resolvers and fetchers               | [advanced-pnpmfile](references/advanced-pnpmfile.md)              |
| CI & Containers  | Installing pnpm without Node, cache layout, Docker/Podman recipes, production installs | [advanced-ci-docker](references/advanced-ci-docker.md)         |
