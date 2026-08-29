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
    "deg:'°',sect:'§',laquo:'«',raquo:'»',aacute:'á',Aacute:'Á',iacute:'í',Iacute:'Í',oacute:'ó',Oacute:'Ó',uacute:'ú',Uacute:'Ú'};return s.replace",
  ],
  [
    "let text=toText(html);const foot=text.indexOf('Indica che il testo corrisponde');if(foot>=0)text=text.slice(0,foot);",
    "let text=toText(html);const note=text.search(/\\(\\s*\\^\\{n\\}\\s*:/);if(note>=0)text=text.slice(0,note);const foot=text.indexOf('Indica che il testo corrisponde');if(foot>=0)text=text.slice(0,foot);",
  ],
  [
    "t=t.replace(/§\\s+(\\d+)\\s*\\./g,'§$1.').replace(/§(\\d+)\\s*\\./g,'§$1.')",
    "t=t.replace(/§\\s+(\\d+)\\s*\\./g,'§$1.').replace(/§(\\d+)\\s*\\./g,'§$1.').replace(/(^|\\n\\n)(\\d+)\\.\\s/g,'$1§$2. ')"
  ],
  [
    "if(n===838&&/^1\\.\\s/.test(t)&&/§2\\./.test(t))t=t.replace(/^1\\.\\s/,'§1. ');return t}",
    "if(n===838&&/^1\\.\\s/.test(t)&&/§2\\./.test(t))t=t.replace(/^1\\.\\s/,'§1. ');t=t.replace(/\\n\\n§\\d+\\.\\s*\\n\\n(?=§\\d+\\.)/g,'\\n\\n');return t}"
  ],
  [
    "let best=null;for(const m of occ){const start=(m.index??0)+m[0].length;const later=ms.filter(x=>(x.index??0)>start&&Number(x[1])>n).sort((x,y)=>(x.index??0)-(y.index??0))[0];const end=later?.index??text.length;let body=cleanBody(text.slice(start,end),n);if(m[2])body=`§${m[2]}. ${body}`;if(!best||body.length>best.length)best=body}if(!best||best.length<3)throw new Error(`Empty Can. ${n} in ${url}`);out.push({number:n,text:best,sourceUrl:url})",
    "const m=occ.sort((x,y)=>(x.index??0)-(y.index??0)).at(-1);const start=(m.index??0)+m[0].length;const later=ms.filter(x=>(x.index??0)>start&&Number(x[1])>n).sort((x,y)=>(x.index??0)-(y.index??0))[0];const end=later?.index??text.length;let body=cleanBody(text.slice(start,end),n);if(m[2])body=`§${m[2]}. ${body}`;if(!body||body.length<3)throw new Error(`Empty Can. ${n} in ${url}`);out.push({number:n,text:body,sourceUrl:url})",
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
