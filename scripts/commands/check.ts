import * as p from '@clack/prompts'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { sources, vendors } from '../../meta'
import {
  execFileSafe,
  fetchAllSubmodules,
  getSubmodulePinnedSha,
  getSubmoduleRemoteHead,
  planVendorSync,
  root,
} from '../shared'

export async function checkUpdates(): Promise<boolean> {
  const spinner = p.spinner()
  if (!(await fetchAllSubmodules(spinner))) return false

  const updates: { name: string; type: 'source' | 'vendor'; detail: string; skills?: string[] }[] = []

  const sourceCheckPaths = ['docs', 'README.md']
  for (const name of Object.keys(sources)) {
    const sourcePath = join(root, 'sources', name)
    if (!existsSync(sourcePath)) continue

    const checkPath = sourceCheckPaths.find(path => existsSync(join(sourcePath, path)))
    if (!checkPath) continue

    const pinnedSha = getSubmodulePinnedSha(`sources/${name}`)
    const remoteRef = getSubmoduleRemoteHead(sourcePath)
    if (!pinnedSha || !remoteRef) continue

    const hasChanges = execFileSafe(
      'git',
      ['log', `${pinnedSha}..${remoteRef}`, '--oneline', '--', checkPath],
      sourcePath
    )
    if (hasChanges) {
      updates.push({ name, type: 'source', detail: `${checkPath} has upstream changes` })
    }
  }

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
        skills: upstream.map(skill => skill.sourceSkillName),
      })
    }
    if (initial.length > 0) {
      updates.push({
        name,
        type: 'vendor',
        detail: `${initial.length} skill(s) not synced yet`,
        skills: initial.map(skill => skill.sourceSkillName),
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
