---
name: features-task-orchestration
description: pnpm workspace task graph — tasks.dependsOn, concurrency and concurrencyGroups, priority, pnpm pipeline caching, inspect and resume flags.
---

# Workspace Task Orchestration

`pnpm -r run <script>` schedules tasks shaped `<project>#<script>`. A task becomes ready once every task it depends on succeeded, and ready tasks run under `--workspace-concurrency`. Independent tasks have no guaranteed relative order.

## Declaring the graph

```yaml
packages:
  - packages/*

tasks:
  build:
    dependsOn:
      - ^build
  test:
    dependsOn:
      - build
```

| `dependsOn` entry | Meaning                                                     |
| ----------------- | ----------------------------------------------------------- |
| `build`           | the `build` task of the same project                        |
| `^build`          | the `build` task of each selected workspace dependency      |

- A task **without** a `tasks` entry defaults to depending on the same task in its workspace dependencies (an unconfigured `build` behaves as `dependsOn: ['^build']`).
- Once a task has an entry, an omitted `dependsOn` means `dependsOn: []` — declare `^build` explicitly if you still want the topological relation.
- `dependsOn` never widens the `--filter` / `includeWorkspaceRoot` selection.
- A selected project without that script is a pass-through: the task is reported skipped after its dependencies, so it does not sever the chain.

## Concurrency and priority

```yaml
tasks:
  build:
    concurrency: 2
    dependsOn: [^build]
    concurrencyGroup: cargo
    priority: 10
  test:rust:
    concurrencyGroup: cargo
    dependsOn: []

concurrencyGroups:
  cargo: 2
```

- `concurrency` limits simultaneous instances of one task across projects; a task waiting for a task slot does not hold a workspace slot, so unrelated ready tasks still run.
- `concurrencyGroups` (v12.5.0) caps a group machine-wide across pnpm processes sharing `stateDir`, including `pnpm pipeline`. A nested `pnpm run` in the same group reuses its parent's slot; slots are released when the process ends, even on crash. A missing or zero limit does not restrict anything, and a different `stateDir` gets a separate pool.
- `priority` (v12.6.0, default `0`) orders waiting tasks, higher first, ties by arrival.
- `pnpm tasks status` (v12.6.0) lists running and waiting tasks per group; if a project script is named `tasks`, use `pnpm pm tasks status`.

## Inspecting and controlling a run

```bash
pnpm -r run --dry-run build          # resolve the graph, run nothing (stable topological order)
pnpm -r run --dry-run --json test    # { tasks: [{ project, script, missingScript, dependsOn }] }
pnpm -r run build --resume-from @scope/app   # skip work recorded as passing in the same invocation
pnpm -r run build --no-bail                  # keep independent tasks running after a failure
pnpm -r run build --reverse                  # reverse every edge, including dependsOn
pnpm -r run build --report-summary           # write pnpm-exec-summary.json
```

- Default `--bail` stops dispatching, cancels running tasks and their processes, and the cancelled task is not reported as a failure; `--no-bail` still exits non-zero overall (`ERR_PNPM_RUN_FAILED`).
- `--resume-from` only uses a run record when the invocation matches (projects, command, args, settings, script bodies); otherwise it falls back to graph position.
- Output is inherited when at most one script can run at a time; otherwise it is piped — `--stream` for immediate prefixed output, `--aggregate-output` per task after it finishes.
- Cycles fail before anything starts with `ERR_PNPM_TASK_CYCLE`; `ignoreWorkspaceCycles: true` downgrades it to a warning and removes ordering among the cycle's members.
- `tasks` only configures recursive `run`: recursive `exec` follows project dependencies but no `dependsOn`, and `--no-sort` (implied by `--parallel`) ignores `tasks`, which also disables `--reverse`/`--resume-from` semantics.

## pnpm pipeline (v12.4.0, pnpm 12, experimental)

`pnpm pipeline [name]` runs a group of tasks like a CI job: frozen install, select affected projects, run the task graph, restore cached outputs and replay logs on a cache hit, and report **all** failures instead of stopping at the first.

```yaml
pipelines: # set; order comes from tasks.dependsOn
  default: [build, test]
tasks:
  build:
    dependsOn: [^build]
    outputs: [dist/**] # no `outputs` key = never cached; `outputs: []` = cacheable, produces nothing
    inputs: [src/**] # `+src/**` appends to the inferred inputs
    env: [NODE_ENV]
    cache: false
```

The cache key includes the script text, dependency task keys, the lockfile and the runtime. Options: `--no-cache`, `--dry-run`, `--json`, `--report`, `--report-to <url>`, `--repo <url> --watch`. With `outputs`/`inputs`/`cache`/`cargoTargetDir` the cache is used only by `pipeline` — a plain `pnpm -r run` never restores from it.

<!--
Source references:
- https://pnpm.io/workspace-task-orchestration
- https://pnpm.io/cli/run
- https://pnpm.io/cli/pipeline
- https://pnpm.io/cli/recursive
-->
