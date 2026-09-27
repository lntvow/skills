---
name: vitest
description: Vitest testing framework — test, expect, mocking with vi, configuration, CLI, and soft assertions. Used when writing or configuring tests with Vitest for Vite-based projects.
metadata:
  author: lntvow
  version: '2026.6.4'
  source: Generated from https://github.com/vitest-dev/vitest, scripts located at https://github.com/lntvow/skills
---

> The skill is based on Vitest v4, generated at 2026-06-04.

Vitest is a Vite-native testing framework. Config goes in `vitest.config.ts` or `test` field in `vite.config.ts`. Use `vi.mock` for module mocking and `expect.soft` for non-critical assertions.

## Core References

| Topic         | Description                                                          | Reference                                    |
| ------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| Test API      | `test`, `describe`, `beforeEach`, `afterEach`, lifecycle hooks       | [core-test-api](references/core-test-api.md) |
| Assertions    | `expect` matchers, `toBe`, `toEqual`, `toContain`, `toMatchSnapshot` | [core-expect](references/core-expect.md)     |
| Configuration | `vitest.config.ts`, `test` options, globals, environment, coverage   | [core-config](references/core-config.md)     |

## Feature References

| Topic   | Description                                                        | Reference                                          |
| ------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| Mocking | `vi.mock`, `vi.fn`, `vi.spyOn`, `vi.importActual`, mock patterns   | [features-mocking](references/features-mocking.md) |
| CLI     | `vitest`, `vitest run`, `--watch`, `--reporter`, filtering options | [features-cli](references/features-cli.md)         |

## Best Practices

| Topic           | Description                                                          | Reference                                                |
| --------------- | -------------------------------------------------------------------- | -------------------------------------------------------- |
| Soft Assertions | `expect.soft` for non-critical checks, multiple failures in one test | [best-practices-soft](references/best-practices-soft.md) |
