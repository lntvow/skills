import * as p from '@clack/prompts'
import { existsSync, lstatSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import {
  type CommandResult,
  execFileAsync,
  execFileSafe,
  getAllProjects,
  getSubmoduleConfigs,
  type Project,
  root,
  runStep,
} from '../shared'

function isAvailableSubmodulePath(path: string): boolean {
  if (!existsSync(path)) return true
  const stat = lstatSync(path)
  return stat.isDirectory() && readdirSync(path).length === 0
}

function isValidExistingSubmodulePath(path: string): boolean {
  if (!existsSync(path)) return true
  const stat = lstatSync(path)
  if (!stat.isDirectory()) return false
  if (readdirSync(path).length === 0) return true
  return Boolean(execFileSafe('git', ['-C', path, 'rev-parse', '--show-superproject-working-tree']))
}

export async function initSubmodules(skipPrompt = false): Promise<CommandResult> {
  const spinner = p.spinner()
  const allProjects = getAllProjects()
  const existingConfigs = getSubmoduleConfigs()
  const existing = new Set(existingConfigs.keys())
  const newProjects = allProjects.filter(project => !existing.has(project.path))
  const existingProjects = allProjects.filter(project => existing.has(project.path))

  const invalidExistingProjects = existingProjects.filter(
    project => !isValidExistingSubmodulePath(join(root, project.path))
  )
  if (invalidExistingProjects.length > 0) {
    for (const project of invalidExistingProjects) {
      p.log.error(`Cannot initialize ${project.name}: target path is not a valid submodule`)
      p.log.message(`  path: ${project.path}`)
      p.log.message('  Restore the submodule directory, then run init again.')
    }
    return 'failed'
  }

  for (const project of existingProjects) {
    const configuredUrl = existingConfigs.get(project.path)?.url
    if (configuredUrl !== project.url) {
      p.log.warn(`Updating submodule URL: ${project.path}`)
      p.log.message(`  configured: ${configuredUrl ?? '(missing)'}`)
      p.log.message(`  expected:   ${project.url}`)
      const ok = await runStep(spinner, `Updating submodule URL: ${project.name}`, () =>
        execFileAsync('git', ['submodule', 'set-url', '--', project.path, project.url])
      )
      if (!ok) return 'failed'
    }
  }

  if (newProjects.length === 0) {
    p.log.info('All submodules already configured')
  } else {
    const selected = skipPrompt
      ? newProjects
      : await p.multiselect({
          message: 'Select projects to add',
          options: newProjects.map(project => ({
            value: project,
            label: `${project.name} (${project.type})`,
            hint: project.url,
          })),
          initialValues: newProjects,
        })

    if (p.isCancel(selected)) return 'cancelled'

    const selectedProjects = selected as Project[]
    const blockedProjects = selectedProjects.filter(project => !isAvailableSubmodulePath(join(root, project.path)))
    if (blockedProjects.length > 0) {
      for (const project of blockedProjects) {
        p.log.error(`Cannot add ${project.name}: target path is not an empty directory`)
        p.log.message(`  path: ${project.path}`)
        p.log.message('  Move or remove the existing path, then run init again.')
      }
      return 'failed'
    }

    for (const project of selectedProjects) {
      mkdirSync(join(root, dirname(project.path)), { recursive: true })
      const ok = await runStep(spinner, `Adding submodule: ${project.name}`, () =>
        execFileAsync('git', ['submodule', 'add', project.url, project.path])
      )
      if (!ok) return 'failed'
    }

    if (selectedProjects.length > 0) {
      p.log.success('Submodules initialized')
    } else {
      p.log.info('No new submodules selected')
    }

    if (existingProjects.length > 0) {
      p.log.info(`Already configured: ${existingProjects.map(p => p.name).join(', ')}`)
    }
  }

  const ok = await runStep(spinner, 'Pulling submodule contents', () =>
    execFileAsync('git', ['submodule', 'update', '--init', '--recursive'])
  )
  return ok ? 'completed' : 'failed'
}
