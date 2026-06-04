---
name: features-cli
description: Key pnpm CLI commands — add, install, run, dlx, why, outdated, patch.
---

# CLI Commands

Shorthand: `pn` = `pnpm`, `pnx` = `pnpm dlx` (v11+).

## add

```bash
pnpm add <pkg>            # save to dependencies
pnpm add -D <pkg>         # save to devDependencies
pnpm add -O <pkg>         # save to optionalDependencies
pnpm add -g <pkg>         # global install
pnpm add <pkg> -E         # exact version
pnpm add <pkg> --save-peer  # peerDependencies
pnpm add <pkg> --save-catalog  # add to default catalog (v10.12+)
pnpm add <pkg> -w         # add to workspace root
pnpm add --allow-build=esbuild <pkg>  # allow postinstall script
```

## install

```bash
pnpm install               # install all
pnpm install --frozen-lockfile  # CI: fail if lockfile changed
pnpm install --prefer-offline   # use cached packages
```

## run

```bash
pnpm run <script>          # run a script
pnpm <script>              # shorthand (if no naming conflict)
pnpm run "/^watch:.*/"     # run all matching scripts via regex
pnpm -r run build          # recursive: run in all workspace packages
pnpm --if-present build    # skip if script doesn't exist
```

## dlx (pnx)

Execute a package without installing:

```bash
pnpm dlx create-vue my-app
pnx create-vue my-app      # shorthand
```

## exec

Run a command from `node_modules/.bin`:

```bash
pnpm exec eslint src --fix
```

## Other Useful Commands

```bash
pnpm why <pkg>             # why is this package installed?
pnpm outdated              # list outdated packages
pnpm update --latest       # update to latest within ranges
pnpm patch <pkg>           # create a patch for a package
pnpm patch-commit <dir>    # commit a patch
pnpm dedupe                # deduplicate lockfile
pnpm store prune           # remove unreferenced packages from store
pnpm publish --no-git-checks  # publish without git checks
```

## Configuration

```bash
pnpm config list            # list current configuration
pnpm config get <key>       # get a specific setting
pnpm config set <key> <val> # set a setting
```

## Key Points

- `pnpm <script>` runs a script directly (shorthand for `pnpm run <script>`)
- `-r` / `--recursive` runs commands across workspace packages
- `-w` / `--workspace-root` targets the workspace root
- Regex matching for running multiple scripts: `pnpm run "/pattern/"`
- `--frozen-lockfile` for CI environments

<!--
Source references:
- https://pnpm.io/cli/add
- https://pnpm.io/cli/run
- https://pnpm.io/cli/install
- https://pnpm.io/pnpm-cli
-->
