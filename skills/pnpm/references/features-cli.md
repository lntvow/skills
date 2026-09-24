---
name: features-cli
description: pnpm CLI cheat sheet — shorthands, global flags, install/add/update/remove, scripts, inspection, security, store/cache, global installs, and publish/release commands.
---

# CLI Cheat Sheet

## Shorthands and aliases

- `pn` = `pnpm`, `pnx` = `pnpm dlx` (v11.0.0); command aliases: `i`/`install`, `it`/`install-test`, `up`/`upgrade`/`update`, `rm`/`un`/`uninstall`/`remove`, `ls`/`list`, `ln`/`link`, `c`/`config`, `rt`/`runtime`, `m`/`multi`/`recursive`/`-r`, `ss`/`set-script`, `t`/`tst`/`test`, `ci`/`clean-install`/`ic`, `s`/`se`/`find`/`search`, `info`/`show`/`view`, `purge`/`clean`, `adduser`/`login`, `owners`/`owner`, `home`/`docs`, `issues`/`bugs`.
- Global flags: `-C <path>`/`--dir`, `-w`/`--workspace-root`, `-r`, `--ignore-workspace` (ignore any parent workspace), `--filter`/`-F`, `--reporter=<default|append-only|ndjson|silent>`, `-s`/`--silent` — but in `pnpm run` `-s` means `--sequential`.
- Commands act on the nearest ancestor manifest, except `pnpm init` and `pnpm exec`, which act on the current directory.
- Unknown options are an **error**: `pnpm install --target_arch=x64` fails; use `--config.target_arch=x64`.
- `pnpm pm <cmd>` forces pnpm's own built-in command past a same-named script.

## Dependencies

```bash
pnpm add <pkg>                # -> dependencies (-P); -D dev, -O optional, --save-peer, -E exact, --tilde (v12.6.0)
pnpm add --save-catalog       # write the catalog instead of package.json
pnpm add --config <pkg>       # add a config dependency
pnpm add -w <pkg>             # add to the workspace root
pnpm add --workspace <pkg>    # only succeed via workspace:, never fall back to the registry
pnpm add -g <pkg>             # global install - see features-global-packages
pnpm install                  # --frozen-lockfile is implied in CI
pnpm update [pkg...]          # keep the original range; --latest crosses majors
pnpm remove <pkg>             # -r, -g, -D
pnpm dedupe [--check]         # collapse redundant versions (v12.4.1 covers all workspace projects)
pnpm prune                    # drop extraneous packages (--prod also removes devDependencies)
pnpm import                   # build pnpm-lock.yaml from package-lock.json / yarn.lock
```

Notable install flags: `--lockfile-only`, `--no-lockfile`, `--fix-lockfile`, `--update-checksums` (v11.4.0, also the only way past a fixed integrity mismatch), `--dry-run` (v11.8.0, resolution only, always exit 0), `--prod`/`--dev`/`--no-optional`, `--no-runtime` (v11.1.0), `--offline`/`--prefer-offline`, `--force`, `--ignore-scripts`, `--merge-git-branch-lockfiles`.

Gotchas:
- Since v11.4.0 a tarball integrity mismatch is fatal (`ERR_PNPM_TARBALL_INTEGRITY`); neither `--force` nor `pnpm update` bypasses it.
- Since v11.23.0 `pnpm update <pkg>@<version>` fails for indirect dependencies (`ERR_PNPM_UPDATE_VERSION_ON_INDIRECT_DEP`) — use `overrides`.
- `pnpm update --patches` (v12.0.0) refreshes registry revisions only and cannot be combined with selectors, `--latest`, `--interactive` or `--global` (`ERR_PNPM_PATCHES_WITH_SELECTOR`).
- `pnpm update --changeset` / `--include-github-actions` (v11.16.0) write change intents / bump Action versions.

## Scripts and execution

```bash
pnpm run <script>            # see features-scripts for selectors and env
pnpm exec <cmd>              # run from node_modules/.bin (position-sensitive with -r)
pnpm dlx / pnx <pkg>         # fetch and run without installing (--package, catalog: specs)
pnpm with <version|current> <args...>   # run one command with another pnpm version (v11.0.0)
pnpm -r run build --resume-from @scope/app --dry-run --json --report-summary
pnpm test / pnpm start       # shorthands; start falls back to `node server.js`
```

## Inspection

```bash
pnpm list [pattern] [--depth=1] [--lockfile-only] [--json] [-g]
pnpm why <pkg>               # reverse tree; --find-by=<finder> uses .pnpmfile.mjs finders
pnpm outdated [pattern] [--format=json] [--include-github-actions]
pnpm licenses list [--json]
pnpm peers check             # unresolved peers from the lockfile (v11.0.0)
pnpm doctor [--json] [--offline]   # environment diagnostics; any failure exits non-zero
pnpm prefix                  # nearest directory with a package.json (v11.10.0)
pnpm root / pnpm bin [-g]
```

## Security

```bash
pnpm audit [--fix | --fix=update] [--audit-level=high] [--json]
pnpm audit signatures        # verify ECDSA signatures (v11.1.0); invalid signature => exit 1
pnpm sbom --sbom-format=cyclonedx|spdx [--lockfile-only] [--out=...] [--split]
pnpm approve-builds [pkg... | --all | -g]     # writes allowBuilds
pnpm ignored-builds
```

`pnpm audit` uses the bulk advisories endpoint since v11, so it reports **GHSA** ids, not CVEs: `--ignore` takes GHSAs and `auditConfig.ignoreCves` is dead. Configure via `audit.level`, `audit.ignore`, `audit.ignorePrune` (v12.0.0). `pnpm sbom` requires `--sbom-format`; `--lockfile-only` avoids an install.

## Store, cache and maintenance

```bash
pnpm store path | status | add <pkg> | prune
pnpm cache list | list-registries | view | delete | path (v11.22.0) | prune (v12.5.0)
pnpm fetch [--prod]           # populate the virtual store from the lockfile only (Docker layering)
pnpm rebuild                  # re-run builds of dependencies
pnpm clean / purge            # remove node_modules contents per workspace project
pnpm ci                       # clean + install --frozen-lockfile (v11.0.0)
pnpm setup                    # configure PNPM_HOME/PATH (also exports them in GitHub Actions since v11.18.0)
pnpm self-update [version]    # updates the project pin, or the global install when unpinned
```

## Global and runtimes

```bash
pnpm add -g <pkg> / remove -g / update -g / list -g     # never with sudo (ERR_PNPM_SUDO_NOT_SUPPORTED)
pnpm runtime set node 22 -g   # replaces the deprecated `pnpm env`; also deno, bun
pnpm shim add <pkg> / ls / rm   # project-aware command shims (v12.0.0-rc.6)
```

## Publishing and release

```bash
pnpm publish [-r] [--batch] [--no-git-checks] [--tag <tag>] [--access public] [--provenance]
pnpm pack [-r] [--out <pattern>] ; pnpm pack-app   # pack-app: Node SEA single executable (v11.0.0)
pnpm stage publish|list|view|approve|reject|download   # staged publishing (v11.3.0)
pnpm version <spec> | pnpm version -r   # native release flow (v11.0.0 / v11.13.0)
pnpm change [--bump patch --summary "..."] [status|check]
pnpm lane [name] --filter <pattern>     # release lanes (v11.13.0)
pnpm deploy --filter=<pkg> --prod <dir> # self-contained deploy directory
pnpm access / pnpm team / pnpm repo / pnpm dist-tag / pnpm deprecate / pnpm unpublish / pnpm star
```

`pnpm publish` is a native implementation since v11 (it no longer shells out to npm); `-r` only publishes versions missing from the registry, and `--batch` sends one request per registry (all-or-nothing). See [features-release-management](features-release-management.md).

## Manifest helpers

```bash
pnpm init [--bare] [--init-type=module|commonjs] [--init-package-manager]
pnpm create <template> [args...]
pnpm pkg get|set|delete|fix        # dotted or indexed paths, --json
pnpm set-script <name> "<cmd>"     # scripts.<name> = cmd; supports json5/yaml manifests
pnpm patch <pkg>@<version> ; pnpm patch-commit <dir> ; pnpm patch-remove <pkg>
```

## Frequent error codes

`ERR_PNPM_TARBALL_INTEGRITY`, `ERR_PNPM_IGNORED_BUILDS` (unreviewed build scripts), `ERR_PNPM_RUN_FAILED`, `ERR_PNPM_TASK_CYCLE`, `ERR_PNPM_UPDATE_VERSION_ON_INDIRECT_DEP`, `ERR_PNPM_PATCHES_WITH_SELECTOR`, `ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE`, `ERR_PNPM_UNSUPPORTED_SCRIPT_COMMAND_FORMAT`, `ERR_PNPM_SUDO_NOT_SUPPORTED`, `ERR_PNPM_PACKAGE_MANAGER_IN_SELECTION`, `ERR_PNPM_CONFIG_SET_NOT_A_PROJECT_SETTING`.

<!--
Source references:
- https://pnpm.io/pnpm-cli
- https://pnpm.io/cli/install
- https://pnpm.io/cli/add
- https://pnpm.io/cli/update
- https://pnpm.io/cli/run
- https://pnpm.io/cli/audit
- https://pnpm.io/cli/sbom
- https://pnpm.io/cli/recursive
-->
