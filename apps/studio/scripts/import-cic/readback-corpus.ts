import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '2rq93txn',
  dataset: 'production',
  apiVersion: '2026-03-25',
  useCdn: false,
})

type Row = {
  _id: string
  number: number
  status?: string
  structuralUnit?: {_id?: string; canonicalId?: string}
  versions: Array<{
    _id?: string
    versionId?: string
    status?: string
    segments: Array<{
      segmentId?: string
      parentSegmentId?: string
    }>
  }>
}

async function main() {
  const rows = await client.fetch<Row[]>(`*[_type == "canon" && number >= 368 && number <= 1752] | order(number asc){
    _id,
    number,
    status,
    "structuralUnit": structuralUnit->{_id, canonicalId},
    "versions": *[_type == "canonVersion" && references(^._id)]{
      _id,
      versionId,
      status,
      "segments": segments[]{segmentId, parentSegmentId}
    }
  }`)

  const errors: string[] = []
  const expected = 1752 - 368 + 1
  const counts = new Map<number, number>()
  for (const row of rows) counts.set(row.number, (counts.get(row.number) ?? 0) + 1)

  const missing: number[] = []
  const duplicateNumbers: number[] = []
  for (let n = 368; n <= 1752; n++) {
    const count = counts.get(n) ?? 0
    if (count === 0) missing.push(n)
    if (count > 1) duplicateNumbers.push(n)
  }

  let versionCount = 0
  let segmentCount = 0
  let canonsWithoutStructure = 0
  let canonsWithoutVersions = 0
  let duplicateSegmentIds = 0
  let orphanParentSegments = 0

  for (const row of rows) {
    if (!row.structuralUnit?._id) {
      canonsWithoutStructure++
      errors.push(`Can. ${row.number}: riferimento strutturale assente/non risolto`)
    }
    if (!row.versions?.length) {
      canonsWithoutVersions++
      errors.push(`Can. ${row.number}: nessuna versione`)
    }
    versionCount += row.versions?.length ?? 0
    for (const version of row.versions ?? []) {
      const segments = version.segments ?? []
      segmentCount += segments.length
      const ids = new Set<string>()
      for (const segment of segments) {
        if (!segment.segmentId) continue
        if (ids.has(segment.segmentId)) {
          duplicateSegmentIds++
          errors.push(`Can. ${row.number} ${version.versionId ?? version._id}: segmentId duplicato ${segment.segmentId}`)
        }
        ids.add(segment.segmentId)
      }
      for (const segment of segments) {
        if (segment.parentSegmentId && !ids.has(segment.parentSegmentId)) {
          orphanParentSegments++
          errors.push(`Can. ${row.number} ${version.versionId ?? version._id}: parentSegmentId orfano ${segment.parentSegmentId}`)
        }
      }
    }
  }

  if (rows.length !== expected) errors.push(`Canoni: ${rows.length}/${expected}`)
  if (missing.length) errors.push(`Canoni mancanti: ${missing.join(', ')}`)
  if (duplicateNumbers.length) errors.push(`Numeri canonici duplicati: ${duplicateNumbers.join(', ')}`)

  console.log('\nREAD-BACK FINALE CIC 1983 — PRODUCTION')
  console.log(`Intervallo: 368–1752`)
  console.log(`Canoni: ${rows.length}/${expected}`)
  console.log(`Versioni: ${versionCount}`)
  console.log(`Segmenti: ${segmentCount}`)
  console.log(`Canoni mancanti: ${missing.length}`)
  console.log(`Numeri canonici duplicati: ${duplicateNumbers.length}`)
  console.log(`Canoni senza struttura: ${canonsWithoutStructure}`)
  console.log(`Canoni senza versioni: ${canonsWithoutVersions}`)
  console.log(`segmentId duplicati: ${duplicateSegmentIds}`)
  console.log(`parentSegmentId orfani: ${orphanParentSegments}`)

  if (errors.length) {
    console.log(`\n✖ READ-BACK FALLITO — ${errors.length} errori`)
    for (const error of errors.slice(0, 100)) console.log(`- ${error}`)
    process.exitCode = 1
    return
  }

  console.log('\n✔ READ-BACK FINALE SUPERATO — 0 errori')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
