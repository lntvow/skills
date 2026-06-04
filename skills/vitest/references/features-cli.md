---
name: features-cli
description: Vitest CLI — running tests, watch mode, filtering, reporters, and common options.
---

# CLI

## Basic Commands

```bash
vitest                    # run in watch mode (default)
vitest run                # run once (no watch)
vitest dev                # alias for vitest (watch mode)
vitest related            # run tests related to changed files
vitest --ui               # open Vitest UI
```

## Filtering

```bash
vitest sum                # run files matching "sum"
vitest -t "adds"          # run tests with "adds" in name
vitest src/               # run all tests in src/
vitest src/math.test.ts   # run specific file
vitest --testNamePattern "adds" # run tests matching pattern
```

## Watching

```bash
vitest                  # watch mode (default)
vitest --watch false    # run once
```

## CI / Single Run

```bash
vitest run                      # single run
vitest run --reporter=verbose   # detailed output
vitest run --reporter=json      # JSON output
```

## Coverage

```bash
vitest run --coverage
vitest run --coverage --coverage.include="src/**"
```

## Other Options

```bash
vitest --update                   # update snapshots
vitest run --bail 3               # stop after 3 failures
vitest run --retry 2              # retry failed tests 2x
vitest --pool threads             # thread/forks pool
vitest --environment jsdom        # override environment
vitest --shard 1/4                # run 1st of 4 shards
vitest --config ./test/vitest.config.ts  # custom config
```

## Workspace / Monorepo

```bash
vitest --project ui               # run specific workspace project
```

## Key Points

- `vitest` = watch mode; `vitest run` = single run
- Filter by filename (`vitest math`) or test name (`-t "adds"`)
- `--coverage` for coverage reports
- `--update` to update snapshots
- `--bail` to stop after N failures (CI)

<!--
Source references:
- https://vitest.dev/guide/cli.html
- https://vitest.dev/guide/cli-generated.html
-->
