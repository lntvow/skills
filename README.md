# lntvow's Skills

A curated collection of [Agent Skills](https://agentskills.io/home) focused on Vue.js ecosystem tooling — Vue, Vite, UnoCSS, Pinia, Vitest, VitePress, and more. Skills are generated from official documentation using git submodules for accurate, up-to-date context.

> Template inspired by [antfu/skills](https://github.com/antfu/skills).

## Installation

```bash
pnpx skills add lntvow/skills -s '*' -a github-copilot
```

Or to install all of them globally:

```bash
pnpx skills add lntvow/skills -s '*' -a github-copilot -g
```

Learn more about CLI usage at [skills](https://github.com/vercel-labs/skills).

## Skills

### Skills Generated from Official Documentation

Unopinionated but tilted toward modern stacks (TypeScript, ESM, Composition API). Generated from official documentation with git submodules, using DeepSeek V4 Pro via GitHub Copilot.

| Skill      | Description                                                           | Source                                                      |
| ---------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| skills-cli | Skills CLI — install, manage, discover, and create agent skills       | [vercel-labs/skills](https://github.com/vercel-labs/skills) |
| vue        | Vue 3 — reactivity, SFC, components, composables, TypeScript, SSR     | [vuejs/docs](https://github.com/vuejs/docs)                 |
| pinia      | Pinia — stores, state, getters, actions, plugins, SSR, testing        | [vuejs/pinia](https://github.com/vuejs/pinia)               |
| vite       | Vite — config, plugins, asset handling, env variables, build, SSR     | [vitejs/vite](https://github.com/vitejs/vite)               |
| vitest     | Vitest — test API, assertions, mocking, configuration, CLI            | [vitest-dev/vitest](https://github.com/vitest-dev/vitest)   |
| vitepress  | VitePress — config, routing, markdown, theme, data loading            | [vuejs/vitepress](https://github.com/vuejs/vitepress)       |
| pnpm       | pnpm — workspaces, catalogs, filtering, CLI, scripts                  | [pnpm/pnpm.io](https://github.com/pnpm/pnpm.io)             |
| unocss     | UnoCSS — configuration, rules, shortcuts, presets, icons, attributify | [unocss/unocss](https://github.com/unocss/unocss)           |

### Vendored Skills

Synced from external repositories that maintain their own skills.

| Skill                         | Description                                               | Source                                                                  |
| ----------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| vue-best-practices            | Vue 3 + TypeScript best practices and patterns            | [vuejs-ai/skills](https://github.com/vuejs-ai/skills)                   |
| vue-router-best-practices     | Vue Router best practices and navigation patterns         | [vuejs-ai/skills](https://github.com/vuejs-ai/skills)                   |
| vue-testing-best-practices    | Vue testing best practices with Vitest and Vue Test Utils | [vuejs-ai/skills](https://github.com/vuejs-ai/skills)                   |
| frontend-design (Official)    | Create distinctive, production-grade frontend interfaces  | [anthropics/skills](https://github.com/anthropics/skills)               |
| web-design-guidelines         | Web design guidelines for building beautiful interfaces   | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| tsdown (Official)             | tsdown — TypeScript library bundler powered by Rolldown   | [rolldown/tsdown](https://github.com/rolldown/tsdown)                   |
| gsap-core (Official)          | GSAP core API — tweens, easing, stagger, matchMedia       | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-timeline (Official)      | GSAP timelines — sequencing, position parameter, nesting  | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-scrolltrigger (Official) | GSAP ScrollTrigger — scroll-linked animations, pinning    | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-plugins (Official)       | GSAP plugins — Flip, Draggable, SplitText, ScrollTo, etc. | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-frameworks (Official)    | GSAP with Vue, Svelte — lifecycle, cleanup, scoping       | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-performance (Official)   | GSAP performance — transforms, will-change, batching      | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-utils (Official)         | GSAP utilities — clamp, mapRange, random, snap, toArray   | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |

## FAQ

### What Makes This Collection Different?

This collection uses **git submodules** to directly reference source documentation. This provides more reliable context and allows skills to stay up-to-date with upstream changes over time. If you primarily work with Vue/Vite ecosystem tools, this aims to be a comprehensive one-stop collection.

The project is also designed to be flexible — you can fork and use it as a template to generate your own skills collection.

### Skills vs llms.txt vs AGENTS.md

Skills provide **shareable, on-demand** context. Being shareable makes prompts easier to manage and reuse across projects. Being on-demand means skills can be pulled in as needed, scaling far beyond what any agent's context window could fit at once.

If you want certain skills to always apply, you can reference them directly in your `AGENTS.md`. The `AGENTS.md` in this repository itself provides guidelines for generating new skills from documentation.

## Generate Your Own Skills

Fork this project to create your own customized skill collection.

1. Fork or clone this repository
2. Install dependencies: `pnpm install`
3. Update `meta.ts` with your own projects and skill sources
4. Run `pnpm start init` — this will cleanup, init submodules, and sync skills in one go
5. Ask your agent to `Generate skills for <project>` (recommended one at a time to manage token usage)

See [AGENTS.md](./AGENTS.md) for detailed generation guidelines.

## License

Skills and the scripts in this repository are [MIT](LICENSE) licensed.

Vendored skills from external repositories retain their original licenses — see each skill directory for details.
