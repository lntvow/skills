---
name: advanced-ci-docker
description: pnpm in CI and containers — installing pnpm without Node, store/cache caching, frozen lockfiles, multi-stage Docker builds, Podman reflinks, and production installs.
---

# CI, Docker & Production

## Installing pnpm in CI

```sh
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

The standalone script needs no Node.js (pnpm is a self-contained executable and can install a runtime with `pnpm runtime set node lts -g`) and it follows the project's pinned version: it installs the latest stable pnpm, then switches to whatever `packageManager` / `devEngines.packageManager` declares on first use. GitHub Actions has its own action instead.

Avoid Corepack in CI: it installs a JavaScript shim, so every `pnpm` call first boots Node to run the shim before pnpm itself starts.

The installer writes to `PNPM_HOME` and appends to a shell profile that a CI job never reloads — declare `PNPM_HOME` and put `$PNPM_HOME/bin` on `PATH` explicitly.

## Caching and lockfile behaviour

- Cache pnpm's store directory (`pnpm store path`) and, since v11.22.0, the metadata cache directory printed by `pnpm cache path`. The latter also holds the lockfile verification log, so an unchanged lockfile can skip re-checking the configured supply-chain policies — the dominant cost of a warm CI install.
- Only cache these directories in locations writable by trusted jobs: a store or cache restored from an untrusted job is a supply-chain risk.
- Caching the store is optional and does not guarantee a faster install.
- pnpm switches to frozen-lockfile mode automatically when it detects CI (ci-info: `CI`, `CONTINUOUS_INTEGRATION`, `BUILD_NUMBER`, `RUN_ID`) and a lockfile exists. Since v11 a lockfile written by a newer pnpm major fails the install instead of being silently rewritten, so keep the CI pnpm version in step with the lockfile.
- `pnpm fetch` installs from the lockfile alone (no manifests needed), which is the building block for Docker layer caching: `pnpm fetch --prod` followed by `pnpm install -r --offline --prod`.

## Docker

Use the official image `ghcr.io/pnpm/pnpm` (tag `12`, …), which already sets `PNPM_HOME=/pnpm` and adds `/pnpm/bin` to `PATH`, or `node:XX-slim`. Let pnpm manage Node when you want the version pinned by `devEngines.runtime`:

```dockerfile
FROM ghcr.io/pnpm/pnpm:12 AS base
RUN pnpm runtime set node 24 -g
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
CMD ["pnpm", "start"]
```

- Separate `pnpm install --prod` stage from the build stage so the final image only ships production dependencies.
- **Do not bake a warm store into an image layer.** Hardlinking from a lower layer makes overlayfs copy the file into the writable layer first, so an install silently copies most of the store; `packageImportMethod: copy` is usually faster there (measurably so on ext4). A BuildKit cache mount does not have this problem.
- In a monorepo, deploy the app package instead of copying the whole workspace:

```dockerfile
FROM workspace AS pruned
RUN pnpm --filter <pkg> --prod deploy pruned

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=pruned /app/pruned .
```

- Podman on a copy-on-write filesystem (Btrfs) can reflink between the host and a container: mount both the host store and `node_modules` into the container. On Ext4 pnpm copies instead. Only mount a store into containers you trust.
- `.dockerignore` should exclude `node_modules`, `.git`, `dist` and docs before copying the context.

## Production installs

```bash
pnpm install --prod --frozen-lockfile   # deployment, no devDependencies
pnpm install --offline --prod           # after `pnpm fetch --prod`
pnpm --filter <pkg> --prod deploy <dir> # portable directory, own lockfile and node_modules
```

`--prod` without a lockfile still resolves `devDependencies` (and fails if that resolution fails). Deleting a `file:` target without `--frozen-lockfile` is an error.

<!--
Source references:
- https://pnpm.io/continuous-integration
- https://pnpm.io/docker
- https://pnpm.io/podman
- https://pnpm.io/production
- https://pnpm.io/cli/fetch
- https://pnpm.io/cli/deploy
-->
