import {readFile, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const OUT_DIR = join(process.cwd(), 'scripts/fontes-canonical/data/de-concordia-inter-codices')
const META_PATH = join(OUT_DIR, 'snapshot.json')
const CANONICAL_PATH = join(OUT_DIR, 'canonical.json')

async function main() {
  const snapshot = JSON.parse(await readFile(META_PATH, 'utf8'))
  const canonical = {
    canonicalDataVersion: '1.1.0',
    documentId: 'francis-2016-de-concordia-inter-codices',
    title: 'De concordia inter Codices',
    shortTitle: 'De concordia inter Codices',
    documentType: 'motuProprio',
    issuer: 'Franciscus PP.',
    issuedAt: '2016-05-31',
    publicationReference: 'AAS 108 (2016) 602–606',
    effectiveFrom: '2016-12-16',
    officialUrl: snapshot.sourceUrl,
    language: 'it',
    territorialScope: 'universal',
    legalForce: 'normative',
    status: 'inForce',
    snapshot,
    effects: [
      {article: '1', canon: 111, locator: null, effect: 'replaces'},
      {article: '2', canon: 112, locator: null, effect: 'replaces'},
      {article: '3', canon: 535, locator: '§2', effect: 'replaces'},
      {article: '4', canon: 868, locator: '§1, 2°', effect: 'replaces'},
      {article: '5', canon: 868, locator: '§3', effect: 'adds'},
      {article: '6', canon: 1108, locator: '§3', effect: 'adds'},
      {article: '7', canon: 1109, locator: null, effect: 'replaces'},
      {article: '8', canon: 1111, locator: '§1', effect: 'replaces'},
      {article: '9', canon: 1112, locator: '§1', effect: 'replaces'},
      {article: '10', canon: 1116, locator: '§3', effect: 'adds'},
      {article: '11', canon: 1127, locator: '§1', effect: 'replaces'},
    ],
    juridicalVerification: {
      status: 'verified',
      note: 'Entrata in vigore fissata al 16 dicembre 2016 secondo la vacatio legis del can. 8 §1 CIC applicata alla promulgazione mediante L’Osservatore Romano. Fonte documentaria ufficiale conservata nello snapshot.',
    },
  }
  await writeFile(CANONICAL_PATH, JSON.stringify(canonical, null, 2) + '\n', 'utf8')
  console.log(`DE CONCORDIA CANONICAL BUILT — ${canonical.effects.length} effetti`)
  console.log(`effectiveFrom=${canonical.effectiveFrom}`)
  console.log(`canonical=${CANONICAL_PATH}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
