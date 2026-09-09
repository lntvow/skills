import * as p from '@clack/prompts'
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { vendors } from '../../meta'
import { execFileAsync, execFileSafeAsync, fetchAllSubmodules, planVendorSync, root, runStep } from '../shared'

const LICENSE_NAMES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'license.md', 'license.txt']

export async function syncSubmodules(): Promise<boolean> {
  const spinner = p.spinner()
  if (!(await fetchAllSubmodules(spinner))) return false

  let anySynced = false

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

    const { upstream, initial } = await planVendorSync(vendorPath, vendorSkillsPath, vendorConfig.skills)
    const pendingSkills = [...upstream, ...initial]
    if (pendingSkills.length === 0) continue

    if (upstream.length > 0) {
      const ok = await runStep(spinner, `Updating submodule: ${vendorName}`, () =>
        execFileAsync('git', ['submodule', 'update', '--remote', '--merge', vendorPath])
      )
      if (!ok) return false
    }

    for (const { sourceSkillName, outputSkillName } of pendingSkills) {
      const sourceSkillPath = join(vendorSkillsPath, sourceSkillName)
      const outputPath = join(root, 'skills', outputSkillName)

      rmSync(outputPath, { recursive: true, force: true })
      cpSync(sourceSkillPath, outputPath, { recursive: true })

      for (const licenseName of LICENSE_NAMES) {
        const licensePath = join(vendorPath, licenseName)
        if (existsSync(licensePath)) {
          cpSync(licensePath, join(outputPath, 'LICENSE.md'))
          break
        }
      }

      const sha = await execFileSafeAsync(
        'git',
        ['log', '-1', '--format=%H', '--', `skills/${sourceSkillName}`],
        vendorPath
      )
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
