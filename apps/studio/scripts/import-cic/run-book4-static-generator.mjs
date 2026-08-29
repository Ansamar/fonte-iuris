import {readFile, writeFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const sourcePath = join(here, 'generate-book4-static.mjs')
const tempPath = join(here, '.generate-book4-static-ci.mjs')

let source = await readFile(sourcePath, 'utf8')

const replacements = [
  [
    "const re=/Can\\.\\s*(\\d+)(?:\\s*§\\s*(\\d+))?(?:\\s*\\^\\{n\\})?\\s*[-–—]/g",
    "const re=/Can\\.\\s*(\\d+)(?:\\s*§\\s*(\\d+))?[^\\n]{0,20}?[-–—]/g",
  ],
  [
    "deg:'°'};return s.replace",
    "deg:'°',sect:'§',laquo:'«',raquo:'»'};return s.replace",
  ],
  [
    "let text=toText(html);const foot=text.indexOf('Indica che il testo corrisponde');if(foot>=0)text=text.slice(0,foot);",
    "let text=toText(html);const note=text.search(/\\(\\s*\\^\\{n\\}\\s*:/);if(note>=0)text=text.slice(0,note);const foot=text.indexOf('Indica che il testo corrisponde');if(foot>=0)text=text.slice(0,foot);",
  ],
]

for (const [from, to] of replacements) {
  if (!source.includes(from)) {
    throw new Error(`Book IV generator patch target not found: ${from}`)
  }
  source = source.replace(from, to)
}

await writeFile(tempPath, source, 'utf8')
await import(pathToFileURL(tempPath).href + `?run=${Date.now()}`)
