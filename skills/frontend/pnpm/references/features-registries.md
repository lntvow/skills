---
name: features-registries
description: Registry routing (registries, prefixes, serverType), registry revisions (+rN), and .npmrc / _auth credential handling.
---

# Registries, Revisions & Credentials

## registries (v11.23.0 shape)

```yaml
registries:
  https://registry.npmjs.org/:
    scopes: ['@acme'] # bare "@" = unscoped default
  https://npm.pkg.github.com/:
    prefix: work # `pnpm add work:@corp/lib`
  https://artifactory.example.com/api/npm/npm/:
    serverType: artifactory
  https://verdaccio.example.com/:
    supportsTimeField: true
```

- Keyed by registry URL; the only allowed entry fields are `scopes`, `ecosystem`, `packages`, `prefix`, `serverType`, `supportsTimeField` — anything else is rejected.
- Credential/TLS fields (`_authToken`, `_auth`, `_password`, `username`, `tokenHelper`, `ca`, `cert`, `key`, …) and URLs with embedded `user:pass@` are rejected here; they belong in `.npmrc`.
- One scope must not map to two registries. Each `prefix` is unique and reserved names are refused; lockfile keys become `foo@work:1.0.0`. `prefix` replaces the deprecated `namedRegistries` (v11.23.0); built-ins `gh:` and `npmjs:` need no config.
- `serverType`: omitted = strict (tarball URL is only omitted when the URL is exactly the canonical npm layout), `npm` for faithful mirrors, `artifactory` for registries that repeat the scope in file names (`@acme/widget/-/@acme/widget-1.0.0.tgz`) — needed for Artifactory and GitLab; Verdaccio, Nexus, Azure Artifacts, GitHub Packages and GHES need none.
- `supportsTimeField: true` when the registry's abbreviated metadata has `time` (needed by `minimumReleaseAge`); it is the per-registry form of `registrySupportsTimeField`.
- `ecosystem: npm | cargo | pypi` (v12.5.0); cargo/pypi entries reject `scopes`/`prefix`/`serverType`/`supportsTimeField`. `packages` (v12.5.1, pypi only) routes by exact name, `company-*` prefix or `*`/`**` for the default index; unmatched packages give `ERR_PNPM_UNCLAIMED_PYTHON_PACKAGE` and never fall back to another index.
- Scope: `serverType` and `supportsTimeField` only work in `pnpm-workspace.yaml`; the global `config.yaml` may declare ecosystem indexes and routing. Since v12.4.0 a registry in `.npmrc` wins over global `config.yaml` routing. Env vars are **not** expanded in URL keys.
- The older shape `registries: { default: <url>, '@acme': <url> }` still works but must not be mixed with the new one.

## Registry revisions (v12.0.0)

A registry may advertise replacement artifacts for a published version. Revision 0 is the original; revisions are fetched by digest from `<registry-base>/-/tarballs/sha512/<base64url-digest>` and validated against `dist.integrity` (failure: `ERR_PNPM_MALFORMED_METADATA`).

```yaml
overrides:
  ejs@2.7.4: 2.7.4+r1 # +rN travels as semver build metadata
```

- `+r0` keeps the original artifact, an unknown revision fails with `ERR_PNPM_NO_MATCHING_REVISION` (never rolls forward), and two conflicting revisions in one graph give `ERR_PNPM_REVISION_CONFLICT`. A `+rN` override also pins the version.
- Lockfile entries carry `revision: N` next to `resolution.integrity`; entries without it are revision 0 and stay byte-identical to older lockfiles.
- Refresh without changing versions: `pnpm update --patches` (`--pnpr-server <url>` for server-side resolution).

## Credentials (.npmrc and beyond)

Precedence: `<workspace root>/.npmrc` → `<pnpm config dir>/auth.ini` → `~/.npmrc` (change the file with `npmrcAuthFile`).

- **Project-level `.npmrc` does not expand env vars** since v11.5.3 (registry/proxy URLs, `@scope:registry`, `//…` keys, `_authToken`/`_auth`/`_password`/`username`/`tokenHelper`/`cert`/`key`); such entries are ignored with a warning. User-level files still expand `${NPM_TOKEN}`. Trust a project file explicitly with `PNPM_CONFIG_NPMRC_AUTH_FILE=.npmrc` (or use `NPM_CONFIG_USERCONFIG`).
- Token forms: `<URL>:_authToken=…`; scope-scoped tokens since v11.7.0: `//npm.pkg.github.com/:@org-a:_authToken=ORG_A_TOKEN`; `<URL>:tokenHelper=/abs/path` (user-level files only, no arguments).
- `_auth` (v11.10.0) is read **only** from the global `config.yaml` or `pnpm_config__auth`/`PNPM_CONFIG__AUTH` JSON:

```yaml
_auth:
  https://registry.npmjs.org:
    '@':
      authToken: ...
    '@org':
      authToken: ...
```

`authToken` is the only accepted field; `basicAuth`, `username`/`password` and `tokenHelper` are refused. `pnpm login` writes this shape since v12.1.0 (older versions used `auth.ini`, which is still read); `pnpm logout` removes only credentials pnpm wrote and keeps routing.

- Certificates: `ca`, `cafile`, `cert`, `key` (inline PEM values, not paths) with per-URL variants `//host/:cafile`, `//host/:ca`, `//host/:cert`, `//host/:certfile`, `//host/:key`, `//host/:keyfile`; related setting `strictSsl`.
- `.npmrc` is for auth/registry only — everything else goes in `pnpm-workspace.yaml` or the global `config.yaml` (see [core-configuration](core-configuration.md)).

<!--
Source references:
- https://pnpm.io/registries
- https://pnpm.io/registry-revisions
- https://pnpm.io/npmrc
- https://pnpm.io/settings/dependency-resolution
-->
