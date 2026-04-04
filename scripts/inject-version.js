import { readFileSync, writeFileSync } from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import packageJson from '../package.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const versionFilePath = path.join(__dirname, '../lib/version.js')

const src = readFileSync(versionFilePath, 'utf-8')
const result = src.replace(/__VERSION__/, packageJson.version)
writeFileSync(versionFilePath, result)
