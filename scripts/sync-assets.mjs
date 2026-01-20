import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.cwd())
const assetsDir = resolve(root, 'assets')
const webPublicDir = resolve(root, 'apps', 'web', 'public')

if (!existsSync(assetsDir)) {
  throw new Error('assets directory not found')
}

if (!existsSync(webPublicDir)) {
  mkdirSync(webPublicDir, { recursive: true })
}

const pairs = [
  { from: resolve(assetsDir, 'favicons'), to: resolve(webPublicDir, 'favicons') },
  { from: resolve(assetsDir, 'logos'), to: resolve(webPublicDir, 'logos') }
]

for (const { from, to } of pairs) {
  if (!existsSync(from)) {
    throw new Error(`missing source: ${from}`)
  }
  mkdirSync(to, { recursive: true })
  cpSync(from, to, { recursive: true })
}

console.log('Assets synced to apps/web/public')

