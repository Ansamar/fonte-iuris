import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-03-25'})

async function main() {
  const rows = await client.fetch<Array<{
    number:number
    structuralUnitId?:string
    versions:Array<{versionId?:string;text?:unknown;segments?:Array<{segmentId?:string;parentSegmentId?:string}>}>
  }>>(`*[_type == "canon" && number >= 368 && number <= 1752] | order(number asc) {
    number,
    "structuralUnitId": structuralUnit->canonicalId,
    "versions": *[_type == "canonVersion" && references(^._id)] {
      versionId,
      text,
      "segments": *[_type == "canonSegment" && references(^._id)] {segmentId,parentSegmentId}
    }
  }`)

  const expected = 1752 - 368 + 1
  const numbers = rows.map(r => r.number)
  const unique = new Set(numbers)
  const missing:number[] = []
  for (let n=368;n<=1752;n++) if (!unique.has(n)) missing.push(n)
  const duplicates = numbers.filter((n,i) => numbers.indexOf(n) !== i)
  const noStructure = rows.filter(r => !r.structuralUnitId).map(r => r.number)
  const noVersion = rows.filter(r => !r.versions?.length).map(r => r.number)
  const versions = rows.flatMap(r => r.versions || [])
  const segments = versions.flatMap(v => v.segments || [])
  const versionIds = versions.map(v => v.versionId).filter(Boolean) as string[]
  const segmentIds = segments.map(s => s.segmentId).filter(Boolean) as string[]
  const duplicateVersionIds = [...new Set(versionIds.filter((x,i) => versionIds.indexOf(x)!==i))]
  const duplicateSegmentIds = [...new Set(segmentIds.filter((x,i) => segmentIds.indexOf(x)!==i))]
  const segmentSet = new Set(segmentIds)
  const orphanParents = segments.filter(s => s.parentSegmentId && !segmentSet.has(s.parentSegmentId)).map(s => s.segmentId)
  const emptyText = rows.flatMap(r => (r.versions||[]).filter(v => !v.text).map(() => r.number))

  const errors = missing.length + duplicates.length + noStructure.length + noVersion.length + duplicateVersionIds.length + duplicateSegmentIds.length + orphanParents.length + emptyText.length

  console.log('\nREAD-BACK FINALE CIC 1983 — SANITY PRODUCTION')
  console.log(`Canoni: ${rows.length}/${expected}`)
  console.log(`Intervallo: ${rows[0]?.number ?? '-'}–${rows.at(-1)?.number ?? '-'}`)
  console.log(`Versioni: ${versions.length}`)
  console.log(`Segmenti: ${segments.length}`)
  console.log(`Canoni mancanti: ${missing.length}`)
  console.log(`Numeri canone duplicati: ${duplicates.length}`)
  console.log(`Canoni senza struttura: ${noStructure.length}`)
  console.log(`Canoni senza versione: ${noVersion.length}`)
  console.log(`VersionId duplicati: ${duplicateVersionIds.length}`)
  console.log(`SegmentId duplicati: ${duplicateSegmentIds.length}`)
  console.log(`Segmenti con parent mancante: ${orphanParents.length}`)
  console.log(`Versioni senza testo: ${emptyText.length}`)
  console.log(errors === 0 ? '✔ READ-BACK FINALE SUPERATO — 0 errori' : `✖ READ-BACK FINALE FALLITO — ${errors} errori`)
  if (missing.length) console.log(`Mancanti: ${missing.join(', ')}`)
  if (noStructure.length) console.log(`Senza struttura: ${noStructure.join(', ')}`)
  process.exitCode = errors ? 1 : 0
}

main().catch(e => {console.error(e);process.exitCode=1})
