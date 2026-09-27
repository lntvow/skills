---
name: settings-environment
description: CLI output, Node/runtime, network/proxy, and remaining miscellaneous pnpm settings (savePrefix, global dirs, caches, resolution/CI flags).
---

# CLI, Network & Miscellaneous Settings

## CLI behaviour

| Setting                    | Default | Effect                                                                                          |
| -------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `color` (`--no-color`)     | `auto`  | `auto`/`always`/`never`.                                                                        |
| `progress`                 | `true` (v12.6.0) | Print the progress line; warnings and summaries still show when disabled.               |
| `loglevel`                 | `info`  | `debug`/`info`/`warn`/`error`; `--silent` silences everything.                                   |
| `useBetaCli`               | `false` | Opt into experimental CLI features.                                                             |
| `recursiveInstall`         | `true`  | `pnpm install` behaves like `-r` and covers every workspace project.                             |
| `engineStrict`             | `false` | Refuse packages whose `engines` don't match this Node; a mismatched root `engines` always fails.  |
| `npmPath`                  | —       | npm executable used by actions such as publishing.                                              |
| `pmOnFail`                 | `download` (v11.0.0) | What to do when the running pnpm doesn't match `packageManager`/`devEngines.packageManager`: `download`/`error`/`warn`/`ignore`. |
| `ignoreWorkspaceRootCheck` | `false` | Don't require `-w` when running install/add at the workspace root.                               |
| `useStderr`                | `false` | Send all output to stderr.                                                                      |
| `updateNotifier`           | `true`  | Once-a-day notice about newer pnpm versions.                                                    |

## Node.js and runtimes

| Setting               | Default            | Effect                                                                                              |
| --------------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| `nodeVersion`         | current `node -v`  | Node version assumed when validating `engines` (only blocks anything together with `engineStrict`).  |
| `runtimeOnFail`       | —  (v11.0.0)       | Overrides `devEngines.runtime`'s `onFail`: `download`/`error`/`warn`/`ignore`; since v12.5.0 also governs Python interpreter downloads. |
| `tools`               | — (v12.5.0)        | Mirrors (`node.channels`, `bun`, `python`) for runtime downloads. **Global config / `PNPM_CONFIG_TOOLS` only.** |
| `nodeDownloadMirrors` | — (v11.0.0)        | Release-channel → mirror map for Node downloads; superseded by `tools.node`.                         |

## Network & requests

| Setting                | Default                              | Effect                                                                               |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| `httpsProxy` / `httpProxy` | `null`                           | Proxy URLs; `HTTPS_PROXY`/`HTTP_PROXY` take precedence. Empty = unset, `false`/`null` disables. Legacy `.npmrc` `proxy` is the fallback. |
| `noProxy`              | `null`                               | Comma-separated domain suffixes that bypass the proxy (subdomains included).          |
| `localAddress`         | —                                    | Local interface IP used for registry connections.                                    |
| `maxsockets` (alias `maxSockets`) | `networkConcurrency × 3`    | Max connections per origin.                                                          |
| `networkConcurrency`   | auto: `clamp(workers × 3, 16, 64)`   | Max concurrent HTTP(S) requests.                                                     |
| `strictSsl`            | `true`                               | Verify HTTPS certificates.                                                           |
| `gitShallowHosts`      | `[github.com, gist.github.com, gitlab.com, bitbucket.com, bitbucket.org]` | Hosts whose git dependencies are shallow-cloned.         |
| `fetchRetries` / `fetchRetryFactor` / `fetchRetryMintimeout` / `fetchRetryMaxtimeout` | `2` / `10` / `10000` / `60000` | Retry count and exponential backoff bounds.                 |
| `fetchTimeout`         | `60000` ms                           | Stall timeout; v12.4.0 resets it per data chunk, so it no longer caps total duration. |
| `fetchWarnTimeoutMs` / `fetchMinSpeedKiBps` | `10000` / `50` (v10.18.0) | Warn on slow metadata requests / slow tarball downloads.                      |
| `registrySupportsTimeField` | `false`                        | Set `true` for registries whose abbreviated metadata has `time` (Verdaccio ≥ 5.15.1); overridable per registry. |

## Saving, caches and global state

| Setting                    | Default  | Effect                                                                                     |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `savePrefix`               | `'^'`    | Prefix written by `pnpm add` (`'^'`/`'~'`/`''`/`'='`); ignored when the package already has a range. |
| `saveTypes`                | `false` (v12.6.0) | Also save available `@types/*` packages into `devDependencies`.                     |
| `tag`                      | `latest` | dist-tag used when no version is given.                                                     |
| `globalDir` / `globalBinDir` | OS pnpm data dirs | Global package dir / global bin dir (since v11 bins live in `$PNPM_HOME/bin`).     |
| `globalShims`              | `{node: auto, deno: auto, bun: auto}` (v12.0.0-rc.2) | Project-aware shim policy `auto`/`prompt`/`always`/`false`. **Global config only.** |
| `npmrcAuthFile`            | `~/.npmrc` (v11.0.0) | Credentials file (machine-level only — see [features-registries](features-registries.md)). |
| `stateDir`                 | OS pnpm state dir | Machine-level state: update checks and concurrency-group slots (machine-level only). |
| `cacheDir`                 | OS pnpm cache dir | Metadata, dlx and check-result cache.                                               |
| `preferSymlinkedExecutables` | `true` with `hoisted` on POSIX | Use symlinks instead of command shims in `node_modules/.bin` (no effect on Windows). |
| `ignoreCompatibilityDb`    | `false`  | Turn off automatic fixes from `@yarnpkg/extensions`.                                        |
| `extendNodePath`           | `true`   | Set `NODE_PATH` in bin shims; keep enabled (together with the resolve hook) under the global virtual store. |
| `deployAllFiles`           | `false`  | Copy every file on `deploy`/local installs instead of honouring `files`.                    |
| `optimisticRepeatInstall`  | `true` (v10.1.0) | Fast pre-check that makes warm repeat installs much quicker.                        |
| `requiredScripts`          | —        | Scripts every workspace project must define, or `pnpm -r run` fails.                        |
| `ci`                       | auto-detected | Explicitly declare whether this is a CI environment.                                  |
| `macosBackup.excludeModulesDir` / `.excludeStoreDir` | `false` (v12.6.0) | Mark `node_modules`/store as Time Machine exclusions. **Global config only.** |

## Pitfalls

- `verifyDepsBeforeRun` (default `install`) silently runs an install before `pnpm run`/`pnpm exec` when `node_modules` is stale — a script can appear to work in a directory with no dependencies.
- Unknown CLI options **fail** (unlike npm): `pnpm install --target_arch=x64` errors; use `--config.target_arch=x64` or an env var.
- Boolean flags support explicit assignment since v12.4.0: `--prod=false`, `--no-prod`.

<!--
Source references:
- https://pnpm.io/settings/cli
- https://pnpm.io/settings/network
- https://pnpm.io/settings/other
- https://pnpm.io/cli/config
-->
