import * as p from '@clack/prompts'
import { exec as execCb, execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { manual, sources, vendors } from '../meta'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function exec(cmd: string, cwd = root): string {
  return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

function execSafe(cmd: string, cwd = root): string | null {
  try {
    return exec(cmd, cwd)
  } catch {
    return null
  }
}

/**
 * Async version of exec — does NOT block the event loop.
 * Use with spinner so the animation keeps running during long operations.
 */
function execAsync(cmd: string, cwd = root): Promise<string> {
  return new Promise((resolve, reject) => {
    execCb(cmd, { cwd, encoding: 'utf-8' }, (err, stdout) => {
      if (err) reject(new Error(err.stderr?.trim() || err.message))
      else resolve(stdout.trim())
    })
  })
}

async function execSafeAsync(cmd: string, cwd = root): Promise<string | null> {
  try {
    return await execAsync(cmd, cwd)
  } catch {
    return null
  }
}

type Spinner = ReturnType<typeof p.spinner>

/** Run an async action under a spinner; returns whether it succeeded. */
async function runStep(spinner: Spinner, label: string, action: () => Promise<unknown>): Promise<boolean> {
  spinner.start(label)
  try {
    await action()
    spinner.stop(label)
    return true
  } catch (error) {
    spinner.stop(`Failed: ${error}`)
    return false
  }
}

async function fetchAllSubmodules(spinner: Spinner): Promise<boolean> {
  return runStep(spinner, 'Fetching submodule remotes', () => execAsync('git submodule foreach git fetch'))
}

const LICENSE_NAMES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'license.md', 'license.txt']

/** Parse submodule paths from .gitmodules via git, e.g. ["vendor/vuejs-ai", ...]. */
function getSubmodulePaths(): string[] {
  const raw = execSafe(`git config -f .gitmodules --get-regexp 'path'`) ?? ''
  if (!raw) return []
  return raw
    .split('\n')
    .map(line => line.split(/\s+/).at(-1) ?? '')
    .filter(Boolean)
}

function removeSubmodule(submodulePath: string): void {
  // Deinitialize the submodule
  execSafe(`git submodule deinit -f ${submodulePath}`)
  // Remove from .git/modules
  rmSync(join(root, '.git', 'modules', submodulePath), { recursive: true, force: true })
  // Remove from working tree and .gitmodules
  exec(`git rm -f ${submodulePath}`)
}

interface Project {
  name: string
  url: string
  type: 'source' | 'vendor'
  path: string
}

type SkillPair = { sourceSkillName: string; outputSkillName: string }

function getAllProjects(): Project[] {
  return [
    ...Object.entries(sources).map(([name, url]) => ({
      name,
      url,
      type: 'source' as const,
      path: `sources/${name}`,
    })),
    ...Object.entries(vendors).map(([name, config]) => ({
      name,
      url: config.source,
      type: 'vendor' as const,
      path: `vendor/${name}`,
    })),
  ]
}

async function initSubmodules(skipPrompt = false) {
  const spinner = p.spinner()
  const allProjects = getAllProjects()
  const existing = new Set(getSubmodulePaths())
  const newProjects = allProjects.filter(project => !existing.has(project.path))
  const existingProjects = allProjects.filter(project => existing.has(project.path))

  if (newProjects.length === 0) {
    p.log.info('All submodules already initialized')
  } else {
    const selected = skipPrompt
      ? newProjects
      : await p.multiselect({
          message: 'Select projects to initialize',
          options: newProjects.map(project => ({
            value: project,
            label: `${project.name} (${project.type})`,
            hint: project.url,
          })),
          initialValues: newProjects,
        })

    if (p.isCancel(selected)) {
      p.cancel('Cancelled')
      return
    }

    for (const project of selected as Project[]) {
      mkdirSync(join(root, dirname(project.path)), { recursive: true })
      await runStep(spinner, `Adding submodule: ${project.name}`, () =>
        execAsync(`git submodule add ${project.url} ${project.path}`)
      )
    }

    p.log.success('Submodules initialized')

    if (existingProjects.length > 0) {
      p.log.info(`Already initialized: ${existingProjects.map(p => p.name).join(', ')}`)
    }
  }

  // Always pull content for all submodules
  await runStep(spinner, 'Pulling submodule contents', () => execAsync('git submodule update --init --recursive'))
}

/**
 * Get the commit SHA pinned in the superproject (gitlink) for a submodule.
 * This is "what we last committed", independent of whether the submodule's own
 * HEAD is detached or on a branch.
 */
function getSubmodulePinnedSha(submodulePath: string): string | null {
  const line = execSafe(`git ls-tree HEAD ${submodulePath}`)
  if (!line) return null
  // Output format: "160000 commit <sha>\t<path>"
  return line.split(/\s+/)[2] ?? null
}

/**
 * Resolve the remote default-branch ref (e.g. "origin/main") for a submodule
 * without touching the network. Falls back to scanning remote-tracking branches.
 */
function getSubmoduleRemoteHead(submoduleDir: string): string | null {
  const originHead = execSafe(`git symbolic-ref --short refs/remotes/origin/HEAD`, submoduleDir)
  if (originHead) return originHead
  const branches = execSafe(`git for-each-ref --format=%(refname:short) refs/remotes/origin`, submoduleDir)
  if (!branches) return null
  const list = branches.split('\n')
  return (
    list.find(ref => ref === 'origin/main') ??
    list.find(ref => ref === 'origin/master') ??
    list.find(ref => /^origin\/[^/]+$/.test(ref)) ??
    null
  )
}

/**
 * Read the last-synced commit SHA recorded in a skill's SYNC.md, if present.
 * This is the true "we already have this version" marker (the pinned gitlink is
 * only updated when the superproject is committed, so it lags behind local syncs).
 */
function getSyncedSha(outputPath: string): string | null {
  const syncMd = join(outputPath, 'SYNC.md')
  if (!existsSync(syncMd)) return null
  // The SHA lives on the "**Git SHA:** `...`" line; parse the backticked hex.
  const line = readFileSync(syncMd, 'utf-8')
    .split('\n')
    .find(l => l.includes('Git SHA'))
  return line?.match(/`([0-9a-f]{7,40})`/i)?.[1] ?? null
}

/** Whether a commit SHA resolves inside a submodule (guards against rewritten history). */
function shaExists(repoDir: string, sha: string): boolean {
  return execSafe(`git rev-parse --verify --quiet ${sha}`, repoDir) !== null
}

/**
 * Plan what needs syncing for one vendor's skills.
 *
 * Returns two groups:
 * - `upstream`: has a SYNC.md record, but upstream has new commits touching the
 *   skill dir since that record (or the recorded SHA can no longer be resolved,
 *   e.g. upstream rewrote history) -> incremental re-sync.
 * - `initial`: no sync record yet (missing output dir or SYNC.md) -> full sync.
 *
 * Skills whose source dir doesn't exist are ignored. Works even when the
 * submodule is in detached HEAD.
 */
async function planVendorSync(
  vendorPath: string,
  vendorSkillsPath: string,
  skills: Record<string, string>
): Promise<{ upstream: SkillPair[]; initial: SkillPair[] }> {
  const upstream: SkillPair[] = []
  const initial: SkillPair[] = []
  const vendorName = basename(vendorPath)
  const remoteRef = getSubmoduleRemoteHead(vendorPath)
  if (!remoteRef) p.log.warn(`Cannot resolve upstream remote for ${vendorName}`)

  for (const [sourceSkillName, outputSkillName] of Object.entries(skills)) {
    const sourceSkillPath = join(vendorSkillsPath, sourceSkillName)
    if (!existsSync(sourceSkillPath)) continue

    const outputPath = join(root, 'skills', outputSkillName)
    const startSha = getSyncedSha(outputPath)

    if (!startSha) {
      initial.push({ sourceSkillName, outputSkillName })
      continue
    }
    if (!remoteRef) continue

    if (!shaExists(vendorPath, startSha)) {
      // Recorded SHA no longer resolvable (upstream history rewritten/pruned)
      upstream.push({ sourceSkillName, outputSkillName })
      continue
    }

    const hasChanges = await execSafeAsync(
      `git log ${startSha}..${remoteRef} --oneline -- skills/${sourceSkillName}`,
      vendorPath
    )
    if (hasChanges) upstream.push({ sourceSkillName, outputSkillName })
  }
  return { upstream, initial }
}

async function syncSubmodules() {
  const spinner = p.spinner()
  if (!(await fetchAllSubmodules(spinner))) return

  let anySynced = false

  // Sync Type 2 skills — only update submodules that have skill changes upstream
  for (const [vendorName, vendorConfig] of Object.entries(vendors)) {
    const vendorPath = join(root, 'vendor', vendorName)
    const vendorSkillsPath = join(vendorPath, 'skills')

    if (!existsSync(vendorPath)) {
      p.log.warn(`Vendor submodule not found: ${vendorName}. Run init first.`)
      continue
    }
    if (!existsSync(vendorSkillsPath)) {
      p.log.warn(`No skills directory in vendor/${vendorName}/skills/`)
      continue
    }

    // Classify what needs doing: skills with upstream changes since the recorded
    // sync point, plus skills with no sync record yet -> first-time full sync.
    const { upstream, initial } = await planVendorSync(vendorPath, vendorSkillsPath, vendorConfig.skills)
    const pendingSkills = [...upstream, ...initial]
    if (pendingSkills.length === 0) continue

    // Bring the submodule forward only when there are real upstream changes
    if (upstream.length > 0) {
      const ok = await runStep(spinner, `Updating submodule: ${vendorName}`, () =>
        execAsync(`git submodule update --remote --merge ${vendorPath}`)
      )
      if (!ok) continue
    }

    for (const { sourceSkillName, outputSkillName } of pendingSkills) {
      const sourceSkillPath = join(vendorSkillsPath, sourceSkillName)
      const outputPath = join(root, 'skills', outputSkillName)

      // Replace the output dir with a clean recursive copy of the source skill
      rmSync(outputPath, { recursive: true, force: true })
      cpSync(sourceSkillPath, outputPath, { recursive: true })

      // Copy LICENSE from vendor repo root if it exists
      for (const licenseName of LICENSE_NAMES) {
        const licensePath = join(vendorPath, licenseName)
        if (existsSync(licensePath)) {
          cpSync(licensePath, join(outputPath, 'LICENSE.md'))
          break
        }
      }

      // Record the sync point in SYNC.md
      const sha = await execSafeAsync(`git log -1 --format=%H -- skills/${sourceSkillName}`, vendorPath)
      const date = new Date().toISOString().split('T')[0]
      const syncContent = `# Sync Info

- **Source:** \`vendor/${vendorName}/skills/${sourceSkillName}\`
- **Git SHA:** \`${sha}\`
- **Synced:** ${date}
`
      writeFileSync(join(outputPath, 'SYNC.md'), syncContent)

      p.log.success(`Synced: ${sourceSkillName} → ${outputSkillName}`)
      anySynced = true
    }
  }

  p.log.success(anySynced ? 'Skills synced' : 'All skills are already latest — nothing to sync')
}

async function checkUpdates() {
  const spinner = p.spinner()
  if (!(await fetchAllSubmodules(spinner))) return

  const updates: { name: string; type: 'source' | 'vendor'; detail: string; skills?: string[] }[] = []

  // Check sources — look for docs/ changes, fall back to README.md
  const sourceCheckPaths = ['docs', 'README.md']
  for (const name of Object.keys(sources)) {
    const sourcePath = join(root, 'sources', name)
    if (!existsSync(sourcePath)) continue

    const checkPath = sourceCheckPaths.find(p => existsSync(join(sourcePath, p)))
    if (!checkPath) continue

    const pinnedSha = getSubmodulePinnedSha(`sources/${name}`)
    const remoteRef = getSubmoduleRemoteHead(sourcePath)
    if (!pinnedSha || !remoteRef) continue

    const hasChanges = execSafe(`git log ${pinnedSha}..${remoteRef} --oneline -- ${checkPath}`, sourcePath)
    if (hasChanges) {
      updates.push({ name, type: 'source', detail: `${checkPath} has upstream changes` })
    }
  }

  // Check vendors
  for (const [name, vendorConfig] of Object.entries(vendors)) {
    const vendorPath = join(root, 'vendor', name)
    const vendorSkillsPath = join(vendorPath, 'skills')
    if (!existsSync(vendorPath) || !existsSync(vendorSkillsPath)) continue

    const { upstream, initial } = await planVendorSync(vendorPath, vendorSkillsPath, vendorConfig.skills)
    if (upstream.length > 0) {
      updates.push({
        name,
        type: 'vendor',
        detail: `${upstream.length} skill(s) have upstream changes`,
        skills: upstream.map(s => s.sourceSkillName),
      })
    }
    if (initial.length > 0) {
      updates.push({
        name,
        type: 'vendor',
        detail: `${initial.length} skill(s) not synced yet`,
        skills: initial.map(s => s.sourceSkillName),
      })
    }
  }

  if (updates.length === 0) {
    p.log.success('All submodules are up to date')
    return
  }
  p.log.info('Updates available:')
  for (const update of updates) {
    p.log.message(`  ${update.name}: ${update.detail}`)
    for (const skill of update.skills ?? []) {
      p.log.message(`    - ${skill}`)
    }
  }
}

function getExpectedSkillNames(): Set<string> {
  const expected = new Set<string>()

  // Skills from sources (generated skills use same name as source key)
  for (const name of Object.keys(sources)) {
    expected.add(name)
  }

  // Skills from vendors (use the output skill name)
  for (const config of Object.values(vendors)) {
    for (const outputName of Object.values(config.skills)) {
      expected.add(outputName)
    }
  }

  // Manual skills
  for (const name of manual) {
    expected.add(name)
  }

  return expected
}

function getExistingSkillNames(): string[] {
  const skillsDir = join(root, 'skills')
  if (!existsSync(skillsDir)) {
    return []
  }

  return readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}

/**
 * Confirm and remove "extra" items (submodules / skills) no longer referenced by
 * meta.ts. Returns 'removed' | 'skipped' | 'cancelled' | 'none'.
 */
async function removeExtra(
  spinner: Spinner,
  kind: string,
  items: string[],
  skipPrompt: boolean,
  describe: (item: string) => string,
  remove: (item: string) => void | Promise<void>
): Promise<'removed' | 'skipped' | 'cancelled' | 'none'> {
  if (items.length === 0) return 'none'

  p.log.warn(`Found ${items.length} ${kind} not in meta.ts:`)
  for (const item of items) p.log.message(`  - ${describe(item)}`)

  const shouldRemove = skipPrompt
    ? true
    : await p.confirm({ message: `Remove these extra ${kind}?`, initialValue: true })
  if (p.isCancel(shouldRemove)) return 'cancelled'
  if (!shouldRemove) return 'skipped'

  for (const item of items) {
    await runStep(spinner, `Removing ${describe(item)}`, async () => remove(item))
  }
  return 'removed'
}

async function cleanup(skipPrompt = false) {
  const spinner = p.spinner()

  // 1. Remove submodules not referenced by meta.ts
  const expectedSubmodulePaths = new Set(getAllProjects().map(p => p.path))
  const extraSubmodules = getSubmodulePaths().filter(path => !expectedSubmodulePaths.has(path))
  const submodulesResult = await removeExtra(
    spinner,
    'submodule(s)',
    extraSubmodules,
    skipPrompt,
    path => path,
    path => removeSubmodule(path)
  )
  if (submodulesResult === 'cancelled') return

  // 2. Remove skill output directories not referenced by meta.ts
  const expectedSkills = getExpectedSkillNames()
  const extraSkills = getExistingSkillNames().filter(name => !expectedSkills.has(name))
  const skillsResult = await removeExtra(
    spinner,
    'skill(s)',
    extraSkills,
    skipPrompt,
    name => `skills/${name}`,
    name => rmSync(join(root, 'skills', name), { recursive: true, force: true })
  )
  if (skillsResult === 'cancelled') return

  if (submodulesResult === 'none' && skillsResult === 'none') {
    p.log.success('Everything is clean, no unused submodules or skills found')
  } else if (submodulesResult === 'removed' || skillsResult === 'removed') {
    p.log.success('Cleanup completed')
  }
}

interface CommandDef {
  name: string
  title: string
  menuLabel: string
  hint: string
  run: (skip: boolean) => Promise<void>
}

const COMMANDS: CommandDef[] = [
  {
    name: 'sync',
    title: 'Sync',
    menuLabel: 'Sync submodules',
    hint: 'Pull latest and sync Type 2 skills',
    run: () => syncSubmodules(),
  },
  {
    name: 'init',
    title: 'Init',
    menuLabel: 'Init submodules',
    hint: 'Add, cleanup, and sync — full setup',
    run: async skip => {
      await cleanup(skip)
      await initSubmodules(skip)
      await syncSubmodules()
    },
  },
  {
    name: 'check',
    title: 'Check',
    menuLabel: 'Check updates',
    hint: 'See available updates',
    run: () => checkUpdates(),
  },
  {
    name: 'cleanup',
    title: 'Cleanup',
    menuLabel: 'Cleanup',
    hint: 'Remove unused submodules and skills',
    run: skip => cleanup(skip),
  },
]

async function main() {
  const args = process.argv.slice(2)
  const skip = args.includes('-y') || args.includes('--yes')
  const command = args.find(arg => !arg.startsWith('-'))

  // Run a named subcommand directly
  const matched = command ? COMMANDS.find(c => c.name === command) : undefined
  if (matched) {
    p.intro(`Skills Manager - ${matched.title}`)
    await matched.run(skip)
    p.outro('Done')
    return
  }

  // No subcommand: show interactive menu (requires interaction)
  if (skip) {
    p.log.error('Command required when using -y flag')
    p.log.info('Available commands: init, sync, check, cleanup')
    process.exit(1)
  }

  p.intro('Skills Manager')

  const action = await p.select({
    message: 'What would you like to do?',
    options: COMMANDS.map(c => ({ value: c.name, label: c.menuLabel, hint: c.hint })),
  })

  if (p.isCancel(action)) {
    p.cancel('Cancelled')
    process.exit(0)
  }

  const selected = COMMANDS.find(c => c.name === action)
  if (selected) await selected.run(false)
  p.outro('Done')
}

main().catch(console.error)
