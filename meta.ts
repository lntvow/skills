export interface VendorSkillMeta {
  official?: boolean
  source: string
  skills: Record<string, string> // sourceSkillName -> outputSkillName
}

/** Skills of one domain category, grouped by how they are produced. */
export interface CategoryMeta {
  /** Type 1: repos cloned as submodules, generated from their documentation. `project -> repo url` */
  sources: Record<string, string>

  /** Type 2: repos that maintain their own skills, synced into this repository. */
  vendors: Record<string, VendorSkillMeta>

  /** Type 3: hand-written skills. */
  manual: string[]
}

/**
 * Every output skill grouped by domain category — the single place to register a skill.
 *
 * Output path: `skills/<category>/<name>/`, or `skills/<category>/<vendor>/<name>/`
 * when that vendor ships more than one skill.
 */
export const categories: Record<string, CategoryMeta> = {
  frontend: {
    sources: {
      pinia: 'https://github.com/vuejs/pinia',
      vite: 'https://github.com/vitejs/vite',
      vitest: 'https://github.com/vitest-dev/vitest',
      vitepress: 'https://github.com/vuejs/vitepress',
      unocss: 'https://github.com/unocss/unocss',
      pnpm: 'https://github.com/pnpm/pnpm.io',
    },
    vendors: {
      // 'vueuse': {
      //   official: true,
      //   source: 'https://github.com/vueuse/vueuse',
      //   skills: { 'vueuse-functions': 'vueuse-functions' },
      // },
      'vuejs-ai': {
        source: 'https://github.com/vuejs-ai/skills',
        skills: {
          'vue-best-practices': 'vue-best-practices',
          'vue-router-best-practices': 'vue-router-best-practices',
          'vue-testing-best-practices': 'vue-testing-best-practices',
        },
      },
      'anthropics': {
        official: true,
        source: 'https://github.com/anthropics/skills',
        skills: { 'frontend-design': 'frontend-design' },
      },
      'web-design-guidelines': {
        source: 'https://github.com/vercel-labs/agent-skills',
        skills: { 'web-design-guidelines': 'web-design-guidelines' },
      },
      'tsdown': {
        official: true,
        source: 'https://github.com/rolldown/tsdown',
        skills: { tsdown: 'tsdown' },
      },
      'gsap': {
        official: true,
        source: 'https://github.com/greensock/gsap-skills',
        skills: {
          'gsap-core': 'gsap-core',
          'gsap-frameworks': 'gsap-frameworks',
          'gsap-performance': 'gsap-performance',
          'gsap-plugins': 'gsap-plugins',
          'gsap-scrolltrigger': 'gsap-scrolltrigger',
          'gsap-timeline': 'gsap-timeline',
          'gsap-utils': 'gsap-utils',
        },
      },
    },
    manual: [],
  },
  general: {
    sources: {},
    vendors: {},
    manual: [
      'git-commit-style',
      // 'my-preferences',
    ],
  },
  misc: {
    sources: {
      'skills-cli': 'https://github.com/vercel-labs/skills',
    },
    vendors: {},
    manual: ['llm-pricing'],
  },
  // Reserved placement: no skills yet.
  backend: {
    sources: {},
    vendors: {},
    manual: [],
  },
}

/** Flat `project -> repo url` view of every Type 1 source. */
export const sources: Record<string, string> = Object.fromEntries(
  Object.values(categories).flatMap(category => Object.entries(category.sources))
)

/** Flat `project -> meta` view of every Type 2 vendor. */
export const vendors: Record<string, VendorSkillMeta> = Object.fromEntries(
  Object.values(categories).flatMap(category => Object.entries(category.vendors))
)

/** Flat list of every Type 3 hand-written skill. */
export const manual: string[] = Object.values(categories).flatMap(category => category.manual)
