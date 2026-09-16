---
name: advanced-sources
description: How the CLI resolves sources — GitHub/GitLab/Azure Repos URLs, skill/ref selectors, well-known discovery, and direct download of SKILL.md or archives.
---

# Source Resolution & Authentication

## Accepted Source Formats

```bash
npx skills add owner/repo                      # GitHub shorthand
npx skills add github:owner/repo               # explicit host prefix (also gitlab:)
npx skills add https://github.com/owner/repo
npx skills add https://github.com/owner/repo/tree/main/skills/web-design
npx skills add https://gitlab.com/org/repo/-/tree/main/skills/foo
npx skills add https://dev.azure.com/org/project/_git/repo
npx skills add https://dev.azure.com/org/project/_git/repo?path=/skills/web-design&version=GBmain
npx skills add git@github.com:owner/repo.git   # any git URL (SSH or HTTPS)
npx skills add ./local-skills                  # local path
npx skills add https://example.com             # well-known site or direct download
```

- **Azure Repos** is detected by the `/_git/{repo}` segment on any host (`dev.azure.com`, `*.visualstudio.com`, Azure DevOps Server). `?path=` selects a subfolder; `version=GBbranch` or `GTtag` selects the ref. Commit IDs (`GC…`) are ignored because `git clone --branch` cannot check out a SHA.
- **Selectors**: `owner/repo@skill-name` picks a skill, `#ref` pins a branch/tag, and `#ref@skill-name` combines both on git-like URLs. Prefer `--skill <name>` in scripts — it composes better with other flags.
- Unknown remote URLs are resolved in this order: **well-known discovery** → **direct download**. GitHub, GitLab and Azure Repos URLs are cloned instead.

## Well-Known Discovery

For a non-git HTTPS URL the provider tries `/.well-known/agent-skills/index.json` (v0.2.0, preferred), then `/.well-known/skills/index.json` (legacy), checking the URL path first and the domain root second. Index entries are either `skill-md` or `archive` and carry a `sha256:` digest that is stored in the lock file so later updates can detect changes.

## Direct Download

The URL may serve a single valid `SKILL.md` **or** a `.zip`, `.tar`, `.tar.gz`, `.tgz` archive; no file extension is required. Extraction is path-traversal guarded.

| Limit              | Default | Override env var            |
| ------------------ | ------- | --------------------------- |
| Download size      | 10 MiB  | `SKILLS_DOWNLOAD_MAX_BYTES` |
| Extracted contents | 25 MiB  | `SKILLS_EXTRACT_MAX_BYTES`  |
| Files per archive  | 1000    | `SKILLS_EXTRACT_MAX_FILES`  |

Only raise these for sources you trust. HTTP requests time out after 30 s.

## Private Repositories

Public and private repositories use the same commands. For GitHub shorthand and HTTPS sources, installation tries regular Git credentials, then `gh repo clone`, then SSH. The CLI never runs `gh auth token` or copies the GitHub CLI credential into the Node process.

For GitHub tree lookups used by update checks, the order is anonymous request, explicit `GITHUB_TOKEN`/`GH_TOKEN`, then `gh api`. If the API remains unavailable, update checks fall back to an authenticated Git clone.

| Variable       | Purpose                                      |
| -------------- | -------------------------------------------- |
| `GITHUB_TOKEN` | Explicit token for authenticated GitHub APIs |
| `GH_TOKEN`     | Fallback explicit GitHub API token           |

Tokens are optional when Git, GitHub CLI, or SSH authentication already works. Public repositories need no token scopes. Unauthenticated GitHub API requests are limited to 60 per hour per IP; authenticated requests are limited to 5,000 per hour.

<!--
Source references:
- https://github.com/vercel-labs/skills/blob/main/README.md
- https://github.com/vercel-labs/skills/blob/main/src/source-parser.ts
- https://github.com/vercel-labs/skills/blob/main/src/download-source.ts
- https://github.com/vercel-labs/skills/blob/main/src/providers/wellknown.ts
- https://github.com/vercel-labs/skills/blob/main/src/git.ts
-->
