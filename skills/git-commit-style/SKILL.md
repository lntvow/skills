---
name: git-commit-style
description: Draft commit messages that match a repository's written conventions and recent history, prioritizing the current author's style.
metadata:
  author: lntvow
  version: '2026.9.8'
---

# Git Commit Style Match

Draft a commit message that looks native to the target repository. Analyze the
actual proposed change first, then use repository rules and commit history to
choose the message format.

This skill only drafts commit copy. Never run `git commit` or any equivalent
mutation from this workflow; a separately authorized commit workflow may use
the returned message later.

## 1) Resolve scope and repository rules

- Determine the target repository root from the current directory or the user's
  explicit path.
- Read relevant written conventions in `AGENTS.md`, `CONTRIBUTING.md`,
  `.github/`, or documented release guidelines. Written repository rules take
  precedence over inferred history.
- Establish what would actually be committed:

  ```bash
  git status --short
  git diff --cached --stat
  git diff --cached
  ```

- Prefer the staged diff as the message scope. If nothing is staged, inspect
  `git diff` and clearly treat the result as a draft for unstaged changes. Do
  not include unrelated files or unstaged changes in a staged-commit message.

## 2) Identify the author's style

Check the configured identity:

```bash
git config user.name
git config user.email
```

Use recent commit metadata to find the identity the user actually commits
under; the configured identity and commit author may differ.

## 3) Sample representative history

Inspect a useful batch of recent commits with full subjects and bodies:

```bash
git log --pretty=format:'%h%x09%an%x09%ae%x09%s%x09%b' -100
```

- If the current branch is too short, add `--all`.
- Weight the most recent 30–50 commits more heavily when conventions changed.
- One or two commits are not enough to establish a style unless no more history
  is available.

## 4) Infer the message template

Record only patterns supported by the repository or the user's own commits:

- Prefix or type vocabulary, including custom forms such as `JIRA-123` or
  `pkg:`.
- Subject shape, scope syntax, separator, casing, and breaking-change marker.
- Tone: imperative, past tense, or noun phrase.
- Language, emoji usage, and typical subject length.
- Body and footer conventions, including bullets, issue references, trailers,
  and `BREAKING CHANGE:`.

Choose styles in this order:

1. Explicit user instructions.
2. Written repository conventions.
3. The current user's own recent commits, when enough evidence exists.
4. The repository's dominant recent style.
5. A minimal Conventional Commit fallback when no reliable convention exists.

If the author's history is sparse, combine it with the repository's recent
style instead of overfitting to one commit.

## 5) Draft and validate

- Describe the real change in the selected scope; do not merely repeat a file
  name or implementation detail.
- Match the selected template exactly. Do not introduce a type, scope, body,
  footer, casing, or punctuation pattern that the repository does not use.
- Follow repository-specific length limits when documented. Otherwise prefer a
  concise subject (normally no more than 100 characters), no trailing period,
  and body lines no longer than 100 characters.
- Use lowercase and the standard types `build chore ci docs feat fix perf
  refactor revert style test` only as defaults when no project-specific style
  is inferable.
- Add a body only when the change needs context or the repository commonly uses
  bodies. Preserve the repository's blank-line, bullet, and footer conventions.
- Re-read the final message against the actual diff and inferred template.

Return the commit message as text, preferably in a fenced code block, and stop.
If a fallback or an ambiguity materially affects the result, add one short note
after the message; otherwise do not add commentary.

## Safety boundary

Do not create or amend commits, reset or restore files, stage files, or alter
repository state. A request to draft a message is never permission to perform
any of those operations.
