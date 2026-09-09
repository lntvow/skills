import * as p from '@clack/prompts'
import process from 'node:process'
import type { CommandResult } from './shared'
import { checkUpdates } from './commands/check'
import { cleanup } from './commands/cleanup'
import { initSubmodules } from './commands/init'
import { syncSubmodules } from './commands/sync'

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
    hint: 'Add and initialize submodules',
    run: async skip => initSubmodules(skip),
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
    run: async skip => cleanup(skip),
  },
]

async function main() {
  const args = process.argv.slice(2)
  const skip = args.includes('-y') || args.includes('--yes')
  const command = args.find(arg => !arg.startsWith('-'))

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

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
