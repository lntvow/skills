import * as p from '@clack/prompts'
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { manual, sources, vendors } from '../../meta'
import {
  type CommandResult,
  getAllProjects,
  getSubmodulePaths,
  removeSubmodule,
  root,
  runStep,
  type Spinner,
} from '../shared'

function getExpectedSkillNames(): Set<string> {
  const expected = new Set<string>()

  for (const name of Object.keys(sources)) expected.add(name)
  for (const config of Object.values(vendors)) {
    for (const outputName of Object.values(config.skills)) expected.add(outputName)
  }
  for (const name of manual) expected.add(name)

  return expected
}

function getExistingSkillNames(): string[] {
  const skillsDir = join(root, 'skills')
  if (!existsSync(skillsDir)) return []

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

export async function cleanup(skipPrompt = false): Promise<CommandResult> {
  const spinner = p.spinner()
  const expectedSubmodulePaths = new Set(getAllProjects().map(project => project.path))
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
