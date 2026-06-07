import * as p from '@clack/prompts'
import { exec as execCb, execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
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
      if (err) reject(err)
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

function submoduleExists(path: string): boolean {
  const gitmodules = join(root, '.gitmodules')
  if (!existsSync(gitmodules)) {
    return false
  }
  const content = readFileSync(gitmodules, 'utf-8')
  return content.includes(`path = ${path}`)
}

const RE_SUBMODULE_PATH = /path\s*=\s*(.+)/g

function getExistingSubmodulePaths(): string[] {
  const gitmodules = join(root, '.gitmodules')
  if (!existsSync(gitmodules)) {
    return []
  }
  const content = readFileSync(gitmodules, 'utf-8')
  const matches = content.matchAll(RE_SUBMODULE_PATH)
  return Array.from(matches, match => match[1].trim())
}

function removeSubmodule(submodulePath: string): void {
  // Deinitialize the submodule
  execSafe(`git submodule deinit -f ${submodulePath}`)
  // Remove from .git/modules
  const gitModulesPath = join(root, '.git', 'modules', submodulePath)
  if (existsSync(gitModulesPath)) {
    rmSync(gitModulesPath, { recursive: true })
  }
  // Remove from working tree and .gitmodules
  exec(`git rm -f ${submodulePath}`)
}

interface Project {
  name: string
  url: string
  type: 'source' | 'vendor'
  path: string
}

interface VendorConfig {
  source: string
  skills: Record<string, string> // sourceSkillName -> outputSkillName
}

async function initSubmodules(skipPrompt = false) {
  const allProjects: Project[] = [
    ...Object.entries(sources).map(([name, url]) => ({
      name,
      url,
      type: 'source' as const,
      path: `sources/${name}`,
    })),
    ...Object.entries(vendors).map(([name, config]) => ({
      name,
      url: (config as VendorConfig).source,
      type: 'vendor' as const,
      path: `vendor/${name}`,
    })),
  ]

  const spinner = p.spinner()

  // Check for extra submodules that are not in meta.ts
  const existingSubmodulePaths = getExistingSubmodulePaths()
  const expectedPaths = new Set(allProjects.map(p => p.path))
  const extraSubmodules = existingSubmodulePaths.filter(path => !expectedPaths.has(path))

  if (extraSubmodules.length > 0) {
    p.log.warn(`Found ${extraSubmodules.length} submodule(s) not in meta.ts:`)
    for (const path of extraSubmodules) {
      p.log.message(`  - ${path}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: 'Remove these extra submodules?',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('Cancelled')
      return
    }

    if (shouldRemove) {
      for (const submodulePath of extraSubmodules) {
        spinner.start(`Removing submodule: ${submodulePath}`)
        try {
          removeSubmodule(submodulePath)
          spinner.stop(`Removed: ${submodulePath}`)
        } catch (error) {
          spinner.stop(`Failed to remove ${submodulePath}: ${error}`)
        }
      }
    }
  }

  const existingProjects = allProjects.filter(p => submoduleExists(p.path))
  const newProjects = allProjects.filter(p => !submoduleExists(p.path))

  if (newProjects.length === 0) {
    p.log.info('All submodules already initialized')
    return
  }

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
    spinner.start(`Adding submodule: ${project.name}`)

    // Ensure parent directory exists
    const parentDir = join(root, dirname(project.path))
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true })
    }

    try {
      exec(`git submodule add ${project.url} ${project.path}`)
      spinner.stop(`Added: ${project.name}`)
    } catch (error) {
      spinner.stop(`Failed to add ${project.name}: ${error}`)
    }
  }

  p.log.success('Submodules initialized')

  if (existingProjects.length > 0) {
    p.log.info(`Already initialized: ${existingProjects.map(p => p.name).join(', ')}`)
  }
}

/**
 * Check which skills in a vendor have upstream changes.
 * Returns the list of skills that have new commits touching their source dir.
 * Does NOT log anything — caller decides how to report.
 */
async function getVendorSkillChanges(
  vendorPath: string,
  vendorSkillsPath: string,
  skills: Record<string, string>
): Promise<{ sourceSkillName: string; outputSkillName: string }[]> {
  const changed: { sourceSkillName: string; outputSkillName: string }[] = []
  for (const [sourceSkillName, outputSkillName] of Object.entries(skills)) {
    const sourceSkillPath = join(vendorSkillsPath, sourceSkillName)
    if (!existsSync(sourceSkillPath)) continue
    const hasChanges = await execSafeAsync(`git log HEAD..@{u} -- skills/${sourceSkillName}`, vendorPath)
    if (hasChanges) changed.push({ sourceSkillName, outputSkillName })
  }
  return changed
}

async function syncSubmodules() {
  const spinner = p.spinner()

  // Only fetch remote changes, don't modify working tree yet
  spinner.start('Fetching submodule remotes...')
  try {
    await execAsync('git submodule foreach git fetch')
    spinner.stop('Fetched remote changes')
  } catch (error) {
    spinner.stop(`Failed to fetch submodules: ${error}`)
    return
  }

  let anySynced = false

  // Sync Type 2 skills — only update submodules that have skill changes upstream
  for (const [vendorName, config] of Object.entries(vendors)) {
    const vendorConfig = config as VendorConfig
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

    // Check each skill: does upstream have new commits touching its source dir?
    p.log.info(`Checking vendor: ${vendorName}`)
    const pendingSkills = await getVendorSkillChanges(vendorPath, vendorSkillsPath, vendorConfig.skills)

    // Log per-skill results
    for (const [sourceSkillName] of Object.entries(vendorConfig.skills)) {
      const changed = pendingSkills.some(s => s.sourceSkillName === sourceSkillName)
      if (changed) {
        p.log.message(`Upstream changes: ${vendorName}/skills/${sourceSkillName}`)
      } else {
        p.log.message(`Already latest: ${vendorName}/skills/${sourceSkillName}`)
      }
    }

    if (pendingSkills.length === 0) {
      // No skill changes upstream → working tree stays clean
      p.log.success(`No updates: ${vendorName} skills are already latest`)
      continue
    }

    p.log.info(`${vendorName}: ${pendingSkills.length} skill(s) have upstream changes`)

    // Upstream has skill changes: update this specific submodule once
    spinner.start(`Updating submodule: ${vendorName}`)
    try {
      await execAsync(`git submodule update --remote --merge ${vendorPath}`)
      spinner.stop(`Updated submodule: ${vendorName}`)
    } catch (error) {
      spinner.stop(`Failed to update ${vendorName}: ${error}`)
      continue
    }

    // Sync each skill that has upstream changes
    for (const { sourceSkillName, outputSkillName } of pendingSkills) {
      const sourceSkillPath = join(vendorSkillsPath, sourceSkillName)
      const outputPath = join(root, 'skills', outputSkillName)

      p.log.message(`Syncing: ${sourceSkillName} → ${outputSkillName}`)

      // Remove existing output directory to ensure clean sync
      if (existsSync(outputPath)) {
        rmSync(outputPath, { recursive: true })
      }
      mkdirSync(outputPath, { recursive: true })

      // Copy all files from source skill to output
      const files = readdirSync(sourceSkillPath, { recursive: true, withFileTypes: true })
      for (const file of files) {
        if (file.isFile()) {
          const fullPath = join(file.parentPath, file.name)
          const relativePath = fullPath.replace(sourceSkillPath, '')
          const destPath = join(outputPath, relativePath)

          // Ensure destination directory exists
          const destDir = dirname(destPath)
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true })
          }

          cpSync(fullPath, destPath)
        }
      }

      // Copy LICENSE file from vendor repo root if it exists
      const licenseNames = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'license.md', 'license.txt']
      for (const licenseName of licenseNames) {
        const licensePath = join(vendorPath, licenseName)
        if (existsSync(licensePath)) {
          cpSync(licensePath, join(outputPath, 'LICENSE.md'))
          break
        }
      }

      // Update SYNC.md
      const date = new Date().toISOString().split('T')[0]
      const syncPath = join(outputPath, 'SYNC.md')
      const sha = await execSafeAsync(`git log -1 --format=%H -- skills/${sourceSkillName}`, vendorPath)

      const syncContent = `# Sync Info

- **Source:** \`vendor/${vendorName}/skills/${sourceSkillName}\`
- **Git SHA:** \`${sha}\`
- **Synced:** ${date}
`

      writeFileSync(syncPath, syncContent)

      p.log.success(`Synced: ${sourceSkillName} → ${outputSkillName}`)
      anySynced = true
    }
  }

  if (anySynced) {
    p.log.success('Skills synced')
  } else {
    p.log.success('All skills are already latest — nothing to sync')
  }
}

async function checkUpdates() {
  const spinner = p.spinner()
  spinner.start('Fetching remote changes...')

  try {
    await execAsync('git submodule foreach git fetch')
    spinner.stop('Fetched remote changes')
  } catch (error) {
    spinner.stop(`Failed to fetch: ${error}`)
    return
  }

  const updates: { name: string; type: string; detail: string; skills?: string[] }[] = []

  // Check sources — look for docs/ changes, fall back to README.md
  for (const name of Object.keys(sources)) {
    const path = join(root, 'sources', name)
    if (!existsSync(path)) continue

    const checkPath = existsSync(join(path, 'docs')) ? 'docs' : 'README.md'
    const hasChanges = execSafe(`git log HEAD..@{u} -- ${checkPath}`, path)
    if (hasChanges) {
      updates.push({ name, type: 'source', detail: `${checkPath} has upstream changes` })
    }
  }

  // Check vendors
  for (const [name, config] of Object.entries(vendors)) {
    const vendorConfig = config as VendorConfig
    const vendorPath = join(root, 'vendor', name)
    const vendorSkillsPath = join(vendorPath, 'skills')

    if (!existsSync(vendorPath)) continue
    if (!existsSync(vendorSkillsPath)) continue

    const changed = await getVendorSkillChanges(vendorPath, vendorSkillsPath, vendorConfig.skills)
    if (changed.length > 0) {
      updates.push({
        name,
        type: 'vendor',
        detail: `${changed.length} skill(s) have upstream changes`,
        skills: changed.map(s => s.sourceSkillName),
      })
    }
  }

  if (updates.length === 0) {
    p.log.success('All submodules are up to date')
  } else {
    p.log.info('Updates available:')
    for (const update of updates) {
      p.log.message(`  ${update.name}: ${update.detail}`)
      if (update.skills) {
        for (const skill of update.skills) {
          p.log.message(`    - ${skill}`)
        }
      }
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
    const vendorConfig = config as VendorConfig
    for (const outputName of Object.values(vendorConfig.skills)) {
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

async function cleanup(skipPrompt = false) {
  const spinner = p.spinner()
  let hasChanges = false

  // 1. Find and remove extra submodules
  const allProjects: Project[] = [
    ...Object.entries(sources).map(([name, url]) => ({
      name,
      url,
      type: 'source' as const,
      path: `sources/${name}`,
    })),
    ...Object.entries(vendors).map(([name, config]) => ({
      name,
      url: (config as VendorConfig).source,
      type: 'vendor' as const,
      path: `vendor/${name}`,
    })),
  ]

  const existingSubmodulePaths = getExistingSubmodulePaths()
  const expectedSubmodulePaths = new Set(allProjects.map(p => p.path))
  const extraSubmodules = existingSubmodulePaths.filter(path => !expectedSubmodulePaths.has(path))

  if (extraSubmodules.length > 0) {
    p.log.warn(`Found ${extraSubmodules.length} submodule(s) not in meta.ts:`)
    for (const path of extraSubmodules) {
      p.log.message(`  - ${path}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: 'Remove these extra submodules?',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('Cancelled')
      return
    }

    if (shouldRemove) {
      hasChanges = true
      for (const submodulePath of extraSubmodules) {
        spinner.start(`Removing submodule: ${submodulePath}`)
        try {
          removeSubmodule(submodulePath)
          spinner.stop(`Removed: ${submodulePath}`)
        } catch (error) {
          spinner.stop(`Failed to remove ${submodulePath}: ${error}`)
        }
      }
    }
  }

  // 2. Find and remove extra skills
  const existingSkills = getExistingSkillNames()
  const expectedSkills = getExpectedSkillNames()
  const extraSkills = existingSkills.filter(name => !expectedSkills.has(name))

  if (extraSkills.length > 0) {
    p.log.warn(`Found ${extraSkills.length} skill(s) not in meta.ts:`)
    for (const name of extraSkills) {
      p.log.message(`  - skills/${name}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: 'Remove these extra skills?',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('Cancelled')
      return
    }

    if (shouldRemove) {
      hasChanges = true
      for (const skillName of extraSkills) {
        spinner.start(`Removing skill: ${skillName}`)
        try {
          rmSync(join(root, 'skills', skillName), { recursive: true })
          spinner.stop(`Removed: skills/${skillName}`)
        } catch (error) {
          spinner.stop(`Failed to remove skills/${skillName}: ${error}`)
        }
      }
    }
  }

  if (!hasChanges && extraSubmodules.length === 0 && extraSkills.length === 0) {
    p.log.success('Everything is clean, no unused submodules or skills found')
  } else if (hasChanges) {
    p.log.success('Cleanup completed')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const skipPrompt = args.includes('-y') || args.includes('--yes')
  const command = args.find(arg => !arg.startsWith('-'))

  // Handle subcommands directly
  if (command === 'init') {
    p.intro('Skills Manager - Init')
    await initSubmodules(skipPrompt)
    p.outro('Done')
    return
  }

  if (command === 'sync') {
    p.intro('Skills Manager - Sync')
    await syncSubmodules()
    p.outro('Done')
    return
  }

  if (command === 'check') {
    p.intro('Skills Manager - Check')
    await checkUpdates()
    p.outro('Done')
    return
  }

  if (command === 'cleanup') {
    p.intro('Skills Manager - Cleanup')
    await cleanup(skipPrompt)
    p.outro('Done')
    return
  }

  // No subcommand: show interactive menu (requires interaction)
  if (skipPrompt) {
    p.log.error('Command required when using -y flag')
    p.log.info('Available commands: init, sync, check, cleanup')
    process.exit(1)
  }

  p.intro('Skills Manager')

  const action = await p.select({
    message: 'What would you like to do?',
    options: [
      { value: 'sync', label: 'Sync submodules', hint: 'Pull latest and sync Type 2 skills' },
      { value: 'init', label: 'Init submodules', hint: 'Add new submodules' },
      { value: 'check', label: 'Check updates', hint: 'See available updates' },
      { value: 'cleanup', label: 'Cleanup', hint: 'Remove unused submodules and skills' },
    ],
  })

  if (p.isCancel(action)) {
    p.cancel('Cancelled')
    process.exit(0)
  }

  switch (action) {
    case 'init':
      await initSubmodules()
      break
    case 'sync':
      await syncSubmodules()
      break
    case 'check':
      await checkUpdates()
      break
    case 'cleanup':
      await cleanup()
      break
    default:
  }

  p.outro('Done')
}

main().catch(console.error)
