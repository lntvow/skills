---
name: advanced-lockfile
description: Lock file internals — skills-lock.json, skillFolderHash, and update checking via GitHub Trees API.
---

# Lock File & Update Checking

## Lock File Location

| Scope   | Path                          |
| ------- | ----------------------------- |
| Global  | `~/.agents/.skill-lock.json`  |
| Project | `./skills-lock.json`          |

## Lock File Format (v3)

Key field: `skillFolderHash` — the GitHub tree SHA for the skill folder, used to detect changes.

If an older lock file version is read, it's wiped. Users must reinstall to populate the new format.

## How Update Checking Works

1. Reads lock file for installed skills
2. Filters to GitHub-backed skills that have both `skillFolderHash` and `skillPath`
3. Calls GitHub Trees API (`/git/trees/<branch>?recursive=1`) — tries `main`, then `master` fallback
4. Auth token sourced from `GITHUB_TOKEN`, `GH_TOKEN`, or `gh auth token` (improves rate limits)
5. Compares latest folder tree SHA with lock file `skillFolderHash`
6. Mismatch → update available; `skills update` reinstalls via `skills add <source-tree-url> -g -y`

## GitHub Rate Limits

Unauthenticated GitHub API requests are limited to 60/hour (shared per IP). `skills update` and `skills check` need authentication to avoid `Failed to fetch tree` errors (5,000/hour authenticated).

The CLI resolves tokens from: `GITHUB_TOKEN` → `GH_TOKEN` → `gh auth token`.

Tokens need **no scopes** for public repos — a classic token with empty permissions is sufficient.

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/AGENTS.md
-->
