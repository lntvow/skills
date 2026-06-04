---
name: features-scripts
description: pnpm scripts — lifecycle hooks, hidden scripts, environment variables, and execution order.
---

# Scripts & Lifecycle

## Hidden Scripts (v11+)

Scripts prefixed with `.` are hidden — cannot be run directly, only from other scripts:

```json
{
  "scripts": {
    ".helper": "echo 'internal only'",
    "build": "pnpm run .helper && tsc"
  }
}
```

`pnpm run .helper` fails; `pnpm run build` succeeds.

## Name Conflicts (v11+)

Built-in commands `clean`, `setup`, `deploy`, `rebuild` prefer user scripts. Force the built-in with `pnpm pm <name>`.

## Lifecycle Scripts

| Hook                 | When                                           |
| -------------------- | ---------------------------------------------- |
| `pnpm:devPreinstall` | Before install (root only, local install only) |
| `postinstall`        | After all packages installed                   |
| `preinstall`         | Before package installation begins             |

### pnpm:devPreinstall

Runs only on local `pnpm install`, before any dependency is installed. Root package only.

## Environment Variables

pnpm sets these during script execution:

- `npm_package_name` — package name
- `npm_package_version` — package version
- `npm_lifecycle_event` — current script name (e.g., `postinstall`)
- `npm_command` — executed command name

Since v11, pnpm does NOT set `npm_config_*` variables from its configuration.

## Running Multiple Scripts

```bash
pnpm run "/^watch:.*/"   # runs all scripts matching pattern
pnpm -r run build          # run build in all workspace packages
pnpm --if-present build    # skip if script doesn't exist
```

Scripts are run in parallel. For sequential execution, chain with `&&` inside a single script.

## PATH Resolution

- `node_modules/.bin` is added to PATH
- In workspaces, `<root>/node_modules/.bin` is also in PATH
- Tools installed in root can be called from any workspace package

## Key Points

- Hidden scripts (`.`) can only be called internally
- `pnpm:devPreinstall` is root-only, local-only
- No `npm_config_*` env vars since v11
- `-r` flag makes `run` recursive across workspace
- Regex patterns run matching scripts in parallel

<!--
Source references:
- https://pnpm.io/scripts
- https://pnpm.io/cli/run
-->
