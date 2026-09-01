import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'

const file = process.argv[2]
if (!file) throw new Error('Uso: tsx scripts/fontes-canonical/validate.ts <canonical.json>')

const data = JSON.parse(await readFile(file, 'utf8'))
const errors: string[] = []
const required = ['documentId','title','documentType','issuer','issuedAt','officialUrl','language','territorialScope','status','snapshot','effects']
for (const key of required) if (data[key] == null || data[key] === '') errors.push(`campo obbligatorio mancante: ${key}`)
if (!/^https:\/\/(www\.)?vatican\.va\//.test(data.officialUrl ?? '') && !/^https:\/\/press\.vatican\.va\//.test(data.officialUrl ?? '')) errors.push('officialUrl non appartiene a una fonte ufficiale vaticana ammessa')
if (!/^[a-f0-9]{64}$/.test(data.snapshot?.sha256 ?? '')) errors.push('snapshot.sha256 non valido')
if (!data.snapshot?.path) errors.push('snapshot.path mancante')
if (!Array.isArray(data.effects) || data.effects.length === 0) errors.push('effects deve contenere almeno un effetto normativo')
for (const [i, effect] of (data.effects ?? []).entries()) {
  if (!Number.isInteger(effect.canon) || effect.canon < 1 || effect.canon > 1752) errors.push(`effects[${i}].canon non valido`)
  if (!['replaces','adds','amends'].includes(effect.effect)) errors.push(`effects[${i}].effect non valido`)
  if (!effect.article) errors.push(`effects[${i}].article mancante`)
}
if (data.snapshot?.text) {
  const actual = createHash('sha256').update(data.snapshot.text, 'utf8').digest('hex')
  if (actual !== data.snapshot.sha256) errors.push(`SHA-256 non coincide: atteso ${data.snapshot.sha256}, calcolato ${actual}`)
}
if (errors.length) {
  console.error(`FONTES CANONICAL INVALID — ${errors.length} errori`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
console.log(`FONTES CANONICAL VALID — ${data.documentId} — ${data.effects.length} effetti — 0 errori`)
