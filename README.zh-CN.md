# lntvow 的 Skills

一批精选的 [Agent Skills](https://agentskills.io/home)，聚焦 Vue.js 生态工具链 —— Vue 最佳实践、Vite、UnoCSS、Pinia、Vitest、VitePress 等。技能由官方文档生成，并用 git submodule 锁定来源，上下文准确、可随上游更新。

> 模板灵感来自 [antfu/skills](https://github.com/antfu/skills)。

<p align="center"><a href="https://github.com/lntvow/skills/blob/main/README.md">English</a> | 简体中文</p>

## 安装

```bash
pnpx skills add lntvow/skills -s '*' -a github-copilot
```

或全部装到全局：

```bash
pnpx skills add lntvow/skills -s '*' -a github-copilot -g
```

CLI 用法见 [skills](https://github.com/vercel-labs/skills)。

## 技能清单

每个技能位于 `skills/<分类>/<名称>/`；上游自带多个技能时多一层（如 `skills/frontend/gsap/gsap-core/`）。分类为 `frontend`、`general`、`misc`（`backend` 为预留）。

### 由官方文档生成的技能

不预设立场，但整体偏向现代技术栈（TypeScript、ESM、Composition API）。由 git submodule 锁定的官方文档生成，生成模型为 GitHub Copilot 上的 DeepSeek V4 Pro。

| 技能       | 说明                                                    | 来源                                                        |
| ---------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| skills-cli | Skills CLI —— 安装、管理、发现与创建 agent 技能         | [vercel-labs/skills](https://github.com/vercel-labs/skills) |
| pinia      | Pinia —— store、state、getter、action、插件、SSR、测试  | [vuejs/pinia](https://github.com/vuejs/pinia)               |
| vite       | Vite —— 配置、插件、资源处理、环境变量、构建、SSR       | [vitejs/vite](https://github.com/vitejs/vite)               |
| vitest     | Vitest —— 测试 API、断言、mock、配置、CLI               | [vitest-dev/vitest](https://github.com/vitest-dev/vitest)   |
| vitepress  | VitePress —— 配置、路由、Markdown、主题、数据加载       | [vuejs/vitepress](https://github.com/vuejs/vitepress)       |
| pnpm       | pnpm —— 配置、workspace、catalog、过滤、设置、CLI       | [pnpm/pnpm.io](https://github.com/pnpm/pnpm.io)             |
| unocss     | UnoCSS —— 配置、规则、快捷方式、预设、图标、attributify | [unocss/unocss](https://github.com/unocss/unocss)           |

### 同步自上游的技能

来自自行维护技能的外部仓库，只做同步、不改写。

| 技能                          | 说明                                                    | 来源                                                                    |
| ----------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| vue-best-practices            | Vue 3 + TypeScript 最佳实践与模式                       | [vuejs-ai/skills](https://github.com/vuejs-ai/skills)                   |
| vue-router-best-practices     | Vue Router 最佳实践与导航模式                           | [vuejs-ai/skills](https://github.com/vuejs-ai/skills)                   |
| vue-testing-best-practices    | Vue 测试最佳实践（Vitest + Vue Test Utils）             | [vuejs-ai/skills](https://github.com/vuejs-ai/skills)                   |
| frontend-design (Official)    | 打造有辨识度、可用于生产的界面                          | [anthropics/skills](https://github.com/anthropics/skills)               |
| web-design-guidelines         | 界面设计规范 —— 无障碍、交互与审查清单                  | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| tsdown (Official)             | tsdown —— Rolldown 驱动的 TypeScript 库打包器           | [rolldown/tsdown](https://github.com/rolldown/tsdown)                   |
| gsap-core (Official)          | GSAP 核心 API —— tween、easing、stagger、matchMedia     | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-timeline (Official)      | GSAP 时间线 —— 编排、位置参数、嵌套                     | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-scrolltrigger (Official) | GSAP ScrollTrigger —— 滚动联动、固定、scrub             | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-plugins (Official)       | GSAP 插件 —— Flip、Draggable、SplitText、ScrollTo 等    | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-frameworks (Official)    | GSAP × Vue/Svelte —— 生命周期、清理、作用域             | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-performance (Official)   | GSAP 性能 —— transform、will-change、批处理             | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |
| gsap-utils (Official)         | GSAP 工具函数 —— clamp、mapRange、random、snap、toArray | [greensock/gsap-skills](https://github.com/greensock/gsap-skills)       |

### 手写技能

由 lntvow 撰写 —— 个人工作流技能。

| 技能                   | 说明                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| git-commit-style       | 按仓库的 git 历史风格起草提交信息（优先匹配当前作者自己的写法）                                                                  |
| llm-pricing            | 核对 DeepSeek / OpenAI GPT 官方单价，并按 Token 用量样本比较成本（缓存、峰谷、档位）。仅手动调用 —— 在 Codex 里用 `$llm-pricing` |
| speculative-defense    | 拒绝为「从未发生过」的情况写防御代码 —— 举证表、批准门禁、防御只写在接收外部输入的一侧                                           |
| multilingual-authoring | 有几种语言就各写一份，不把一份逐句译成其余几份 —— 结构共用，措辞各按本语言写                                                     |

## 常见问题

### 这个集合有什么不同？

用 **git submodule** 直接引用源文档，上下文更可靠，也能随时间跟进上游变化。如果你主要用 Vue/Vite 生态，这份合集力求一站式覆盖。

项目同时刻意做成可当模板使用 —— 你可以 fork 它，生成自己的技能合集。

### Skills 与 llms.txt、AGENTS.md 的区别

Skills 提供的是**可分享、按需加载**的上下文。可分享意味着提示词更好管理、能跨项目复用；按需加载意味着技能只在需要时才被拉进来，规模远超任何模型一次能装进上下文窗口的量。

如果希望某些技能始终生效，直接在 `AGENTS.md` 里引用它们。本仓库的 `AGENTS.md` 本身就是一份「从文档生成技能」的规范。

## 生成你自己的技能

fork 本项目，就得到一份自己的技能合集。

1. fork 或 clone 本仓库
2. 安装依赖：`pnpm install`
3. 修改 `meta.ts`，换成你自己的项目与技能来源
4. 运行 `pnpm start init` —— 初始化 submodule
5. 运行 `pnpm start sync` —— 同步 vendor 技能
6. 需要清理时单独运行 `pnpm start cleanup`（移除 `meta.ts` 里已不存在的条目）
7. 让 agent 执行 `Generate skills for <project>`（建议一次一个，控制 Token 消耗）

详细规范见 [AGENTS.md](./AGENTS.md)。

## 许可

技能与仓库脚本以 [MIT](LICENSE) 授权。

同步自外部仓库的技能保留原有许可 —— 见各技能目录。
