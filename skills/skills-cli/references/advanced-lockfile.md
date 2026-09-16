---
name: advanced-lockfile
description: Lock file internals — global .skill-lock.json, project skills-lock.json, folder hashes, and how updates are detected.
---

# Lock Files & Update Checking

## Global Lock

| Scope  | Path                                                  |
| ------ | ----------------------------------------------------- |
| Global | `~/.agents/.skill-lock.json` (or `$XDG_STATE_HOME/skills/.skill-lock.json` when `XDG_STATE_HOME` is set) |

- Schema **version 3**. Reading an older version wipes it, so users must reinstall to repopulate the new format.
- Key field: `skillFolderHash` — the GitHub tree SHA of the skill folder; changes when **any** file in the folder changes.
- Other fields: `source`, `sourceType`, `sourceUrl`, `ref`, `skillPath`, `installedAt`, `updatedAt`, `pluginName`, `wellKnownDigest`.

## Project Lock (`skills-lock.json`)

Committed to version control. Schema **version 1**, intentionally timestamp-free and alphabetically sorted so parallel branches merge cleanly.

- Key field: `computedHash` — SHA-256 computed from the skill folder's files **on disk** (the global lock uses the remote GitHub tree SHA instead).
- Optional fields: `source`, `sourceUrl`, `ref`, `sourceType`, `skillPath`, `subagents` (Eve subagent targets), `wellKnownDigest`.
- `npx skills experimental_install` reinstalls everything recorded here (see [core-manage](core-manage.md)).

## How Update Checking Works

1. Read the lock file for installed skills
2. Filter to GitHub-backed skills that have both `skillFolderHash` and `skillPath`
3. Fetch the current folder tree hash — anonymous GitHub API, then explicit `GITHUB_TOKEN`/`GH_TOKEN`, then `gh api` (see [advanced-sources](advanced-sources.md))
4. Fall back to an authenticated Git clone when the API is unavailable or skill paths changed
5. Compare the latest folder tree SHA with the locked `skillFolderHash`; a mismatch means an update is available
6. `skills update` reinstalls the affected skills by invoking the CLI entrypoint directly (`node <repo>/bin/cli.mjs add <source-tree-url> -g -y`) to avoid nested npm exec/npx behavior

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/AGENTS.md
- https://github.com/vercel-labs/skills/blob/main/src/skill-lock.ts
- https://github.com/vercel-labs/skills/blob/main/src/local-lock.ts
-->
