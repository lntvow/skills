---
name: git-commit-style
description: Match an existing repo's git commit format and style when generating or writing commits. When the user asks to "generate commit", "write a commit message", "commit changes", or wants it consistent with history, first read the project's git log conventions (type/scope prefix, language, capitalization, body/footer style), then produce a message indistinguishable from the project's own history — weighting commits authored by the current git user highest. Also relevant when asked about commit conventions or how a repo formats commits.
metadata:
  author: lntvow
  version: '2026.9.3'
---

# Git Commit Style Match

**Goal:** when asked to help commit or to produce a commit message, emit one that looks like it belongs in this repository's own history — not a generic template you happen to know.

Follow the workflow in order unless the user says otherwise.

## 1) Resolve the repo and explicit rules (first)

- Determine the repository root (the current git repo, or the one the user points to).
- If the repo declares commit conventions in writing (`AGENTS.md`, `CONTRIBUTING.md`, `docs/`, `.github/`), honor those first. **Written rules outrank inferred style.**

## 2) Identify the current git author

```bash
git config user.name
git config user.email
```

Also inspect the `%an` / `%ae` of recent commits to learn which identity the user actually commits under (it may differ from local config, e.g. multiple emails).

## 3) Sample the history

Pull a representative batch (author + full subject + body):

```bash
git log --pretty=format:'%h%x09%an%x09%ae%x09%s%x09%b' -100
```

- If the branch is short, add `--all`.
- If the history shows a style transition (old vs. new conventions), weight the **most recent window** (~last 30–50 commits) over the distant past.
- One or two messages are not enough — infer from a batch to avoid noise.

## 4) Extract the style dimensions

Analyze the batch and record:

- **Type vocabulary:** `feat / fix / chore / docs / refactor / perf / test / style / build / ci / ...`, or project-specific prefixes (`JIRA-123`, `pkg:`, none at all).
- **Subject anatomy:** is there a prefix, `type:` vs `type(scope):`, exact separator (`: `, `:`, ` - `), uppercase `type`/`scope`, `!` for breaking changes?
- **Tone:** imperative mood, past tense, or noun phrase.
- **Language & casing:** English / 中文 / emoji prefix; lower-case vs Title Case start.
- **Length tendency:** typical subject length in characters (50 / 72 / longer).
- **Body & footer style:** blank line before body, bullet char (`-`), closing keywords (`Closes #12`, `Refs`), `BREAKING CHANGE:`, `Co-authored-by`, signed-off.

## 5) Weight by author (key rule)

Group the sampled commits by author and pick the style template by priority:

1. **Current git user's own commits** — exact name/email match. Highest weight. If fewer than ~5 exist, merge them with step 2's samples.
2. **Repository's dominant/recent style** — the most recent mainline committers and the latest window.
3. **Fallback:** generic Conventional Commits only if nothing else is inferable.

The user's personal style beats the repo's average when they have enough history — match *their* habits (same prefixes, language, tone) over the crowd.

## 6) Write the message

- Draft a subject, plus a body when the change needs it, that **exactly follows** the template from steps 4–5.
- Match length, casing, tone, and structure. Do not invent formats the repo never uses.
- If the repo mixes languages (EN/中文), follow what the current user predominantly writes.
- Show the user the message (then commit if asked). Re-read the message once against the template before finalizing.

## Keep in mind

- The goal is **consistency**, not novelty: an experienced contributor should not be able to tell your message was machine-generated.
- When the repo has no meaningful history (fresh repo), fall back to a sensible default and note the assumption.
