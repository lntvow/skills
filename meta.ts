export interface VendorSkillMeta {
  official?: boolean
  source: string
  skills: Record<string, string> // sourceSkillName -> outputSkillName
}

/**
 * Repositories to clone as submodules and generate skills from source
 */
export const sources: Record<string, string> = {
  'skills-cli': 'https://github.com/vercel-labs/skills',
  'pinia': 'https://github.com/vuejs/pinia',
  'vite': 'https://github.com/vitejs/vite',
  'vitest': 'https://github.com/vitest-dev/vitest',
  'vitepress': 'https://github.com/vuejs/vitepress',
  'pnpm': 'https://github.com/pnpm/pnpm.io',
  'unocss': 'https://github.com/unocss/unocss',
}

/**
 * Already generated skills, sync with their `skills/` directory
 */
export const vendors: Record<string, VendorSkillMeta> = {
  // 'vueuse': {
  //   official: true,
  //   source: 'https://github.com/vueuse/vueuse',
  //   skills: {
  //     'vueuse-functions': 'vueuse-functions',
  //   },
  // },
  'vuejs-ai': {
    source: 'https://github.com/vuejs-ai/skills',
    skills: {
      'vue-best-practices': 'vue-best-practices',
      'vue-router-best-practices': 'vue-router-best-practices',
      'vue-testing-best-practices': 'vue-testing-best-practices',
    },
  },
  'anthropics-skills': {
    official: true,
    source: 'https://github.com/anthropics/skills',
    skills: {
      'frontend-design': 'frontend-design',
    },
  },
  'web-design-guidelines': {
    source: 'https://github.com/vercel-labs/agent-skills',
    skills: {
      'web-design-guidelines': 'web-design-guidelines',
    },
  },
  'tsdown': {
    official: true,
    source: 'https://github.com/rolldown/tsdown',
    skills: {
      tsdown: 'tsdown',
    },
  },
  'gsap-skills': {
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
}

/**
 * Type 3: 手写技能（放在 skills/ 目录下）
 */
export const manual: string[] = [
  'git-commit-style',
  // 'my-preferences',
]
