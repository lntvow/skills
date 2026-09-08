import * as p from '@clack/prompts'
import { exec as execCb, execFileSync, execSync } from 'node:child_process'
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

function execFile(file: string, args: string[], cwd = root): string {
  return execFileSync(file, args, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
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

/**
 * Parse submodule paths from .gitmodules via git, e.g. ["vendor/vuejs-ai", ...].
 *
 * Note: no quotes around the `path` regexp — execSync shells out through cmd.exe on
 * Windows, which treats single quotes literally (unlike POSIX sh), so `'path'` would
 * never match. `path` is a plain token, safe on both platforms.
 */
function getSubmodulePaths(): string[] {
  const raw = execSafe(`git config -f .gitmodules --get-regexp path`) ?? ''
  if (!raw) return []
  return raw
    .split('\n')
    .map(line => line.trim().split(/\s+/).at(-1) ?? '')
    .filter(Boolean)
}

function removeSubmodule(submodulePath: string): void {
  // Deinitialize the submodule
  execFile('git', ['submodule', 'deinit', '-f', '--', submodulePath])
  // Remove from working tree and .gitmodules
  execFile('git', ['rm', '-f', '--', submodulePath])
  // Remove from .git/modules only after git rm succeeds
  rmSync(join(root, '.git', 'modules', submodulePath), { recursive: true, force: true })
}

interface Project {
  name: string
  url: string
  type: 'source' | 'vendor'
  path: string
}

type SkillPair = { sourceSkillName: string; outputSkillName: string }

type CommandResult = 'completed' | 'cancelled' | 'failed'

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

async function initSubmodules(skipPrompt = false): Promise<CommandResult> {
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
      return 'cancelled'
    }

    for (const project of selected as Project[]) {
      mkdirSync(join(root, dirname(project.path)), { recursive: true })
      const ok = await runStep(spinner, `Adding submodule: ${project.name}`, () =>
        execAsync(`git submodule add ${project.url} ${project.path}`)
      )
      if (!ok) return 'failed'
    }

    p.log.success('Submodules initialized')

    if (existingProjects.length > 0) {
      p.log.info(`Already initialized: ${existingProjects.map(p => p.name).join(', ')}`)
    }
  }

  // Always pull content for all submodules
  const ok = await runStep(spinner, 'Pulling submodule contents', () =>
    execAsync('git submodule update --init --recursive')
  )
  return ok ? 'completed' : 'failed'
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

async function syncSubmodules(): Promise<boolean> {
  const spinner = p.spinner()
  if (!(await fetchAllSubmodules(spinner))) return false

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
      if (!ok) return false
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
  return true
}

async function checkUpdates(): Promise<boolean> {
  const spinner = p.spinner()
  if (!(await fetchAllSubmodules(spinner))) return false

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
    return true
  }
  p.log.info('Updates available:')
  for (const update of updates) {
    p.log.message(`  ${update.name}: ${update.detail}`)
    for (const skill of update.skills ?? []) {
      p.log.message(`    - ${skill}`)
    }
  }
  return true
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

interface RemovalItem {
  label: string
  remove: () => void | Promise<void>
}

interface RemovalPlan {
  kind: string
  items: RemovalItem[]
}

interface RemovalResult {
  status: 'completed' | 'cancelled' | 'failed'
  hadItems: boolean
  removed: string[]
}

/** Confirm and remove a group of items no longer referenced by meta.ts. */
async function removeItems(spinner: Spinner, plan: RemovalPlan, skipPrompt: boolean): Promise<RemovalResult> {
  const { kind, items } = plan
  if (items.length === 0) return { status: 'completed', hadItems: false, removed: [] }

  p.log.warn(`Found ${items.length} ${kind} not in meta.ts:`)
  for (const item of items) p.log.message(`  - ${item.label}`)

  const shouldRemove = skipPrompt
    ? true
    : await p.confirm({ message: `Remove these extra ${kind}?`, initialValue: true })
  if (p.isCancel(shouldRemove)) return { status: 'cancelled', hadItems: true, removed: [] }
  if (!shouldRemove) return { status: 'completed', hadItems: true, removed: [] }

  const removed: string[] = []
  for (const [index, item] of items.entries()) {
    const ok = await runStep(spinner, `Removing ${item.label}`, async () => item.remove())
    if (!ok) {
      p.log.error(`Failed to remove: ${item.label}`)
      if (removed.length > 0) p.log.message(`Already removed: ${removed.join(', ')}`)
      const remaining = items.slice(index + 1).map(item => item.label)
      if (remaining.length > 0) p.log.message(`Not attempted: ${remaining.join(', ')}`)
      return { status: 'failed', hadItems: true, removed }
    }
    removed.push(item.label)
  }
  p.log.success(`Removed ${removed.length} ${kind}: ${removed.join(', ')}`)
  return { status: 'completed', hadItems: true, removed }
}

async function cleanup(skipPrompt = false): Promise<CommandResult> {
  const spinner = p.spinner()

  // Build both plans first, then execute them in order.
  const expectedSubmodulePaths = new Set(getAllProjects().map(p => p.path))
  const extraSubmodules = getSubmodulePaths().filter(path => !expectedSubmodulePaths.has(path))
  const expectedSkills = getExpectedSkillNames()
  const extraSkills = getExistingSkillNames().filter(name => !expectedSkills.has(name))

  const plans: RemovalPlan[] = [
    {
      kind: 'submodule(s)',
      items: extraSubmodules.map(path => ({ label: path, remove: () => removeSubmodule(path) })),
    },
    {
      kind: 'skill(s)',
      items: extraSkills.map(name => ({
        label: `skills/${name}`,
        remove: () => rmSync(join(root, 'skills', name), { recursive: true, force: true }),
      })),
    },
  ]

  let foundItems = false
  let removedCount = 0
  for (const plan of plans) {
    const result = await removeItems(spinner, plan, skipPrompt)
    if (result.status !== 'completed') return result.status
    foundItems ||= result.hadItems
    removedCount += result.removed.length
  }

  if (!foundItems) {
    p.log.success('Everything is clean, no unused submodules or skills found')
  } else if (removedCount > 0) {
    p.log.success('Cleanup completed')
  } else {
    p.log.info('Cleanup skipped; no items were removed')
  }
  return 'completed'
}

interface CommandDef {
  name: string
  title: string
  menuLabel: string
  hint: string
  run: (skip: boolean) => Promise<CommandResult>
}

const COMMANDS: CommandDef[] = [
  {
    name: 'sync',
    title: 'Sync',
    menuLabel: 'Sync submodules',
    hint: 'Pull latest and sync Type 2 skills',
    run: async () => ((await syncSubmodules()) ? 'completed' : 'failed'),
  },
  {
    name: 'init',
    title: 'Init',
    menuLabel: 'Init submodules',
    hint: 'Add submodules and sync Type 2 skills',
    run: async skip => {
      const result = await initSubmodules(skip)
      if (result === 'cancelled') return 'cancelled'
      if (result === 'failed') return 'failed'
      return (await syncSubmodules()) ? 'completed' : 'failed'
    },
  },
  {
    name: 'check',
    title: 'Check',
    menuLabel: 'Check updates',
    hint: 'See available updates',
    run: async () => ((await checkUpdates()) ? 'completed' : 'failed'),
  },
  {
    name: 'cleanup',
    title: 'Cleanup',
    menuLabel: 'Cleanup',
    hint: 'Remove unused submodules and skills',
    run: async skip => {
      const result = await cleanup(skip)
      if (result === 'cancelled') return 'cancelled'
      if (result === 'failed') return 'failed'
      return 'completed'
    },
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
    const result = await matched.run(skip)
    if (result === 'cancelled') {
      p.cancel('Cancelled')
      return
    }
    if (result === 'failed') process.exitCode = 1
    p.outro(result === 'failed' ? 'Failed' : 'Done')
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
  if (selected) {
    const result = await selected.run(false)
    if (result === 'cancelled') {
      p.cancel('Cancelled')
      return
    }
    if (result === 'failed') process.exitCode = 1
    p.outro(result === 'failed' ? 'Failed' : 'Done')
  }
}

main().catch(console.error)
