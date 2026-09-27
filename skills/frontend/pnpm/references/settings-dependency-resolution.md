---
name: settings-dependency-resolution
description: Settings that shape resolution — overrides, packageExtensions, resolutionMode, update.* and the supply-chain pinning/trust settings, plus all peer dependency settings.
---

# Dependency Resolution & Peer Settings

## overrides

Force versions across the whole graph, including peer dependencies. Only the **root** `pnpm-workspace.yaml` is honoured.

```yaml
overrides:
  foo: '^2.0.0' # every foo
  bar@^2.1.0: '3.0.0' # only matching bar versions
  qar@1>zoo: '2' # zoo only under qar@1
  foo@1.0.0>bar: '-' # remove (alias) bar from foo@1.0.0
  ejs@2.7.4: 2.7.4+r1 # pin a registry revision (see features-registries)
```

**Convergence overrides** (v11.13.0): an empty range means "rewrite only when the edge's own range is satisfied by the target", and the target must be an exact version — `"pkg@": "1.2.3"`. They cannot be combined with a parent selector.

## packageExtensions

Patch missing or wrong metadata before resolution:

```yaml
packageExtensions:
  react-redux:
    peerDependencies:
      react-dom: '*'
    dependencies:
      extra-lib: '^1'
```

## Resolution behaviour

| Setting                       | Default          | Effect                                                                                                        |
| ----------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `resolutionMode`              | `highest`        | `highest` / `time-based` (lowest for direct deps, then bounded by the last direct-dependency release) / `lowest-direct`. |
| `allowedDeprecatedVersions`   | —                | Silence deprecation warnings for given packages/ranges.                                                        |
| `supportedArchitectures`      | —                | Install optional deps for other platforms (`cpu`/`os`/`libc`, v12.5.0 also platform lists, Rust triples, `current`). |
| `ignoredOptionalDependencies` | —                | Skip optional dependencies by name or glob.                                                                    |
| `dedupeDirectDeps`            | `false`          | Deps already linked into the workspace-root `node_modules` are not linked again into subprojects.               |
| `autoDedupe`                  | `false` (v12.6.0)| Collapse multiple dependency versions to one that satisfies the whole workspace on install/add (not in frozen installs). |

### update.*

```yaml
update:
  ignoreDeps: ['react'] # pnpm update/outdated skip these (v11.16.0, was updateConfig.ignoreDependencies)
  changeset: true # write a change intent after updating (deps=patch, peers=major)
  githubActions: true # also update Action versions in workflows
  githubActionsServer: https://ghe.example.com # GHES base URL
```

## Supply-chain pinning

| Setting                                | Default                       | Effect                                                                                                     |
| -------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `minimumReleaseAge`                    | `1440` (minutes, since v11)   | Only install versions published at least N minutes ago (anti-typosquat). `0` opts out, `10080` = a week.     |
| `minimumReleaseAgeExclude`             | —                             | Exemption list; supports `@org/*` and exact `pkg@1.2.3 \|\| 5.0.0` entries.                                 |
| `minimumReleaseAgeExcludePrune`        | `false` (v11.22.0)            | Drop exemptions the lockfile no longer resolves.                                                            |
| `minimumReleaseAgeIgnoreMissingTime`   | `true` (v11.0.0)              | Skip the age check when the registry exposes no `time` field (`false` ⇒ resolution fails). Applies to `trustPolicy` too. |
| `minimumReleaseAgeStrict`              | `true` when set explicitly    | Fail instead of falling back when no in-range version is old enough.                                        |
| `trustPolicy`                          | `off` (`no-downgrade`, v10.21.0) | Reject versions whose publisher trust level dropped relative to history.                                 |
| `trustPolicyExclude` / `TrustPolicyIgnoreAfter` / `TrustPolicyExcludePrune` | `[]` / — / `false` | Exempt selectors, stop checking packages older than N minutes, prune stale exemptions (v12.4.0). |
| `trustLockfile`                        | `false` (v11.3.0)             | Skip the lockfile supply-chain recheck (less memory, less safety).                                          |
| `blockExoticSubdeps`                   | `true` (v10.26.0)             | Only direct dependencies may use git/URL sources; transitive dependencies must come from a trusted registry.  |

## Peer dependencies

| Setting                        | Default | Effect                                                                                                    |
| ------------------------------ | ------- | --------------------------------------------------------------------------------------------------------- |
| `autoInstallPeers`             | `true`  | Install missing non-optional peers. Conflicting required peers are **not** auto-installed — pnpm warns instead. |
| `dedupePeerDependents`         | `true`  | Deduplicate package instances after peer resolution when there is no peer conflict.                        |
| `dedupePeers`                  | `false` (v10.33.0) | Peer suffix uses only `name@version`, dropping nested suffixes and with them most duplicate instances. |
| `strictPeerDependencies`       | `false` | Fail the command on missing or invalid peers.                                                              |
| `resolvePeersFromWorkspaceRoot`| `true`  | Resolve every project's peers against the root project's dependencies.                                      |

```yaml
peerDependencyRules:
  ignoreMissing: ['react-dom'] # silence missing-peer warnings (patterns allowed)
  allowedVersions:
    react: '17' # relax the allowed range
  allowAny: ['button'] # accept any version, no warning
```

Peer specs may carry a scheme since v11.14.0 (`npm:` alias, `file:`, git/URL, named registry like `work:5.x.x`) and are matched against the range they carry. A bare `name@version` in `peerDependencies` is rejected with `ERR_PNPM_INVALID_PEER_DEPENDENCY_SPECIFICATION`; `peerDependenciesMeta.*.optional: true` marks a peer as optional (a name that is not in `peerDependencies` at all is also treated as optional/any).

Registry routing (`registries`, `namedRegistries`) is documented in [features-registries](features-registries.md).

<!--
Source references:
- https://pnpm.io/settings/dependency-resolution
- https://pnpm.io/settings/peer-dependencies
- https://pnpm.io/how-peers-are-resolved
- https://pnpm.io/supply-chain-security
-->
