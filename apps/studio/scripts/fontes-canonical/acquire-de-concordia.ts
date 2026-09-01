import {createHash} from 'node:crypto'
import {mkdir, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const OFFICIAL_URL = 'https://www.vatican.va/content/francesco/it/motu_proprio/documents/papa-francesco-motu-proprio_20160531_de-concordia-inter-codices.html'
const OUT_DIR = join(process.cwd(), 'scripts/fontes-canonical/data/de-concordia-inter-codices')
const SNAPSHOT_PATH = join(OUT_DIR, 'official-it.html')
const META_PATH = join(OUT_DIR, 'snapshot.json')

async function main() {
  const response = await fetch(OFFICIAL_URL, {headers: {'user-agent': 'Fonte-Iuris/1.0 canonical-source-acquisition'}})
  if (!response.ok) throw new Error(`Acquisizione fallita: HTTP ${response.status}`)
  const text = await response.text()
  const requiredMarkers = [
    'De concordia inter Codices',
    'Art. 1.',
    'can. 111 CIC',
    'Art. 11.',
    'can. 1127 CIC',
    '31 maggio',
    '2016',
  ]
  for (const marker of requiredMarkers) {
    if (!text.includes(marker)) throw new Error(`Fonte inattesa: manca il marcatore ${marker}`)
  }
  const sha256 = createHash('sha256').update(text, 'utf8').digest('hex')
  await mkdir(OUT_DIR, {recursive: true})
  await writeFile(SNAPSHOT_PATH, text, 'utf8')
  await writeFile(META_PATH, JSON.stringify({sourceUrl: OFFICIAL_URL, capturedAt: new Date().toISOString(), sha256, path: 'scripts/fontes-canonical/data/de-concordia-inter-codices/official-it.html'}, null, 2) + '\n', 'utf8')
  console.log(`DE CONCORDIA SOURCE OK — sha256=${sha256}`)
  console.log(`snapshot=${SNAPSHOT_PATH}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
