import {readFile, writeFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const sourcePath = join(here, 'generate-book4-static.mjs')
const tempPath = join(here, '.generate-book4-static-ci.mjs')

let source = await readFile(sourcePath, 'utf8')
const oldMarker = "const re=/Can\\.\\s*(\\d+)(?:\\s*§\\s*(\\d+))?(?:\\s*\\^\\{n\\})?\\s*[-–—]/g"
const newMarker = "const re=/Can\\.\\s*(\\d+)(?:\\s*§\\s*(\\d+))?[^\\n]{0,20}?[-–—]/g"

if (!source.includes(oldMarker)) {
  throw new Error('Book IV generator marker expression not found; refusing an unverified patch.')
}
source = source.replace(oldMarker, newMarker)
await writeFile(tempPath, source, 'utf8')
await import(pathToFileURL(tempPath).href + `?run=${Date.now()}`)
