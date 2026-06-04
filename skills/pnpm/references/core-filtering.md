---
name: core-filtering
description: pnpm --filter syntax for targeting specific packages in monorepo workspaces.
---

# Filtering

`--filter` (or `-F`) restricts commands to specific packages. Standard selectors and exclusion with `!` prefix.

## Basic Matching

```bash
pnpm --filter <package_name> <command>
pnpm --filter "@scope/*" test
pnpm --filter "*utils" build
```

## Dependency/Dependent Selectors

| Selector  | Meaning                                       |
| --------- | --------------------------------------------- |
| `foo...`  | `foo` + all its dependencies                  |
| `foo^...` | Only dependencies of `foo` (not `foo` itself) |
| `...foo`  | `foo` + all packages depending on it          |
| `...^foo` | Only dependents of `foo`                      |

```bash
pnpm --filter foo... test         # foo + its deps
pnpm --filter "...^foo" test      # only packages that depend on foo
pnpm --filter "...foo..." test    # foo + deps + dependents
```

## Directory/Glob Filtering

```bash
pnpm --filter "./packages/**" <cmd>
pnpm --filter "{packages/**}" <cmd>
```

Combined with dependency selectors:

```bash
pnpm --filter "...{packages/ui}" test   # deps of ui package
pnpm --filter "{packages/*}..." test    # packages/* + their deps
```

## Changed Since

Select packages changed since a commit/branch:

```bash
pnpm --filter "[origin/main]" test
pnpm --filter "...[origin/main]" test    # + dependents
pnpm --filter "{packages/**}[origin/main]" build  # changed in directory
```

## X Exclusion

```bash
pnpm --filter=!foo test            # everything except foo
pnpm --filter=!./lib test          # everything except lib/
```

## Multiple Filters

All selectors that match at least one package are included:

```bash
pnpm --filter ...foo --filter bar --filter baz... test
```

## Additional Options

```bash
# Exclude devDependencies when resolving deps
pnpm --filter-prod foo... test

# Ignore test files in "changed since"
pnpm --filter="...[origin/main]" --test-pattern="test/*" test

# Ignore specific files in "changed since"
pnpm --filter="...[origin/main]" --changed-files-ignore-pattern="**/README.md" build
```

## Key Points

- `...` prefix = dependents, suffix = dependencies
- Pattern matching: `@scope/*`, `*utils`
- `[<since>]` = git diff based filtering
- `!` prefix excludes packages
- Combine selectors freely; any match = included

<!--
Source references:
- https://pnpm.io/filtering
-->
