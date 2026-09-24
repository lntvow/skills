---
name: core-filtering
description: pnpm --filter selectors — names, globs, dependency/dependent ellipsis, directories, git-diff selectors, and the related flags.
---

# Filtering

`--filter` / `-F` restricts a command to a subset of workspace projects. Every `--filter` flag on the command line is unioned; a project runs if any selector matches it.

## Selector forms

| Selector                                | Selects                                                       |
| --------------------------------------- | ------------------------------------------------------------- |
| `foo`, `@scope/pkg`, `@babel/*`, `*core`| by name or glob                                               |
| `foo...`                                | `foo` **and its dependencies**                                 |
| `foo^...`                               | only the dependencies of `foo`                                 |
| `...foo`                                | `foo` **and its dependents**                                   |
| `...^foo`                               | only the dependents of `foo`                                   |
| `./packages/**`, `{packages/**}`        | by directory glob                                              |
| `[origin/main]`, `[HEAD~1]`             | projects changed since a commit/branch                         |
| `!foo`, `!./packages/legacy`            | exclude (escape as `\!` in zsh)                                |

Selectors compose: `"...{packages/**}[origin/master]..."`, `"@babel/*{components/**}"`.

```bash
pnpm --filter foo... test          # foo + its deps
pnpm --filter "...^foo" test       # only dependents of foo
pnpm --filter "...foo..." test     # deps + foo + dependents
pnpm --filter "./packages/**" build
pnpm --filter "[origin/main]" test
pnpm --filter "...[origin/main]" test
pnpm --filter=!foo test            # every project except foo
```

## Glob and name rules

- `*` and `?` match inside a single path segment, `**` crosses segments, `[ab]` is a character class.
- Neither `*` nor `?` matches a dot-prefixed name.
- An unscoped name such as `core` also matches `@babel/core`; if that is ambiguous pnpm matches nothing and says so.
- `legacyDirFiltering` (default `false`) keeps `{packages/*}` a one-level glob; `true` restores the old "whole subtree" behaviour. pnpm's own generated root selectors (`{<root>}`, `!{<root>}`) are always globs since v11.24.0.

## Related flags

```bash
pnpm --filter-prod foo... test                      # ignore devDependencies when selecting dependency projects
pnpm --filter "[origin/main]" --test-pattern="test/*" test   # changed test files don't pull in dependents
pnpm --filter "[origin/main]" --changed-files-ignore-pattern="**/README.md" build
pnpm --filter foo --fail-if-no-match test           # non-zero exit when nothing matches (setting: failIfNoMatch)
```

`--filter` never widens itself: task graph edges declared in `tasks` stay inside the selected projects (see [features-task-orchestration](features-task-orchestration.md)).

<!--
Source references:
- https://pnpm.io/filtering
- https://pnpm.io/workspace-task-orchestration
-->
