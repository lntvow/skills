import * as p from '@clack/prompts'
import { execFile as execFileCb, execFileSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sources, vendors } from '../meta'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const root = join(__dirname, '..')

export type CommandResult = 'completed' | 'cancelled' | 'failed'

export type Spinner = ReturnType<typeof p.spinner>

export interface Project {
  name: string
  url: string
  type: 'source' | 'vendor'
  path: string
}

export type SkillPair = { sourceSkillName: string; outputSkillName: string }

export function execFile(file: string, args: string[], cwd = root): string {
  return execFileSync(file, args, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

export function execFileSafe(file: string, args: string[], cwd = root): string | null {
  try {
    return execFile(file, args, cwd)
  } catch {
    return null
  }
}

/** Async version of execFile — does NOT block the event loop. */
export function execFileAsync(file: string, args: string[], cwd = root): Promise<string> {
  return new Promise((resolve, reject) => {
    execFileCb(file, args, { cwd, encoding: 'utf-8' }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr.trim() || error.message))
      else resolve(stdout.trim())
    })
  })
}

export async function execFileSafeAsync(file: string, args: string[], cwd = root): Promise<string | null> {
  try {
    return await execFileAsync(file, args, cwd)
  } catch {
    return null
  }
}

/** Run an async action under a spinner; returns whether it succeeded. */
export async function runStep(spinner: Spinner, label: string, action: () => Promise<unknown>): Promise<boolean> {
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

export async function fetchAllSubmodules(spinner: Spinner): Promise<boolean> {
  return runStep(spinner, 'Fetching submodule remotes', () =>
    execFileAsync('git', ['submodule', 'foreach', 'git', 'fetch'])
  )
}

function getSubmoduleConfigValues(key: 'path' | 'url'): Map<string, string> {
  const raw = execFileSafe('git', ['config', '-f', '.gitmodules', '--get-regexp', key]) ?? ''
  const values = new Map<string, string>()
  for (const line of raw.split('\n')) {
    const match = line.match(new RegExp(String.raw`^submodule\.(.+)\.${key}\s+(.+)$`))
    if (match) values.set(match[1], match[2])
  }
  return values
}

export function getSubmoduleConfigs(): Map<string, { path: string; url: string | null }> {
  const paths = getSubmoduleConfigValues('path')
  const urls = getSubmoduleConfigValues('url')
  return new Map([...paths.entries()].map(([name, path]) => [path, { path, url: urls.get(name) ?? null }]))
}

/**
 * Parse submodule paths from .gitmodules via git, e.g. ["vendor/vuejs-ai", ...].
 *
 * Note: no quotes around the `path` regexp — execSync shells out through cmd.exe on
 * Windows, which treats single quotes literally (unlike POSIX sh), so `'path'` would
 * never match. `path` is a plain token, safe on both platforms.
 */
export function getSubmodulePaths(): string[] {
  return [...getSubmoduleConfigs().keys()]
}

export function removeSubmodule(submodulePath: string): void {
  execFile('git', ['submodule', 'deinit', '-f', '--', submodulePath])
  execFile('git', ['rm', '-f', '--', submodulePath])
  rmSync(join(root, '.git', 'modules', submodulePath), { recursive: true, force: true })
}

export function getAllProjects(): Project[] {
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

/** Get the commit SHA pinned in the superproject for a submodule. */
export function getSubmodulePinnedSha(submodulePath: string): string | null {
  const line = execFileSafe('git', ['ls-tree', 'HEAD', submodulePath])
  if (!line) return null
  return line.split(/\s+/)[2] ?? null
}

/** Resolve a submodule's remote default branch without touching the network. */
export function getSubmoduleRemoteHead(submoduleDir: string): string | null {
  const originHead = execFileSafe('git', ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'], submoduleDir)
  if (originHead) return originHead
  const branches = execFileSafe(
    'git',
    ['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin'],
    submoduleDir
  )
  if (!branches) return null
  const list = branches.split('\n')
  return (
    list.find(ref => ref === 'origin/main') ??
    list.find(ref => ref === 'origin/master') ??
    list.find(ref => /^origin\/[^/]+$/.test(ref)) ??
    null
  )
}

/** Read the last-synced commit SHA recorded in a skill's SYNC.md. */
export function getSyncedSha(outputPath: string): string | null {
  const syncMd = join(outputPath, 'SYNC.md')
  if (!existsSync(syncMd)) return null
  const line = readFileSync(syncMd, 'utf-8')
    .split('\n')
    .find(l => l.includes('Git SHA'))
  return line?.match(/`([0-9a-f]{7,40})`/i)?.[1] ?? null
}

export function shaExists(repoDir: string, sha: string): boolean {
  return execFileSafe('git', ['rev-parse', '--verify', '--quiet', sha], repoDir) !== null
}

/** Plan which skills need an initial copy or an upstream update. */
export async function planVendorSync(
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
      upstream.push({ sourceSkillName, outputSkillName })
      continue
    }

    const hasChanges = await execFileSafeAsync(
      'git',
      ['log', `${startSha}..${remoteRef}`, '--oneline', '--', `skills/${sourceSkillName}`],
      vendorPath
    )
    if (hasChanges) upstream.push({ sourceSkillName, outputSkillName })
  }
  return { upstream, initial }
}
