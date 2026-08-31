import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-03-25'})

type Segment = {
  _id: string
  segmentId?: string
  parentId?: string
}

type Version = {
  _id: string
  versionId?: string
  fullText?: unknown[]
  segments: Segment[]
}

type Canon = {
  _id: string
  number: number
  structuralUnitId?: string
  versions: Version[]
}

async function main() {
  const rows = await client.fetch<Canon[]>(`*[_type == "canon" && number >= 368 && number <= 1752] | order(number asc) {
    _id,
    number,
    "structuralUnitId": structuralUnit->canonicalId,
    "versions": *[_type == "canonVersion" && canon._ref == ^._id] {
      _id,
      versionId,
      fullText,
      "segments": *[_type == "canonSegment" && version._ref == ^._id] {
        _id,
        segmentId,
        "parentId": parentSegment._ref
      }
    }
  }`)

  const expected = 1752 - 368 + 1
  const numberCounts = new Map<number, number>()
  for (const row of rows) numberCounts.set(row.number, (numberCounts.get(row.number) ?? 0) + 1)

  const missing: number[] = []
  const duplicateCanonNumbers: number[] = []
  for (let n = 368; n <= 1752; n++) {
    const count = numberCounts.get(n) ?? 0
    if (count === 0) missing.push(n)
    if (count > 1) duplicateCanonNumbers.push(n)
  }

  const noStructure = rows.filter((row) => !row.structuralUnitId).map((row) => row.number)
  const noVersion = rows.filter((row) => !row.versions?.length).map((row) => row.number)
  const versions = rows.flatMap((row) => row.versions ?? [])
  const segments = versions.flatMap((version) => version.segments ?? [])

  const versionIdCounts = new Map<string, number>()
  for (const version of versions) {
    if (version.versionId) versionIdCounts.set(version.versionId, (versionIdCounts.get(version.versionId) ?? 0) + 1)
  }
  const duplicateVersionIds = [...versionIdCounts].filter(([, count]) => count > 1).map(([id]) => id)

  const emptyTextVersions = versions.filter(
    (version) => !Array.isArray(version.fullText) || version.fullText.length === 0,
  )

  const duplicateSegmentsWithinVersion: string[] = []
  const orphanParents: string[] = []

  for (const version of versions) {
    const segmentIdCounts = new Map<string, number>()
    const documentIds = new Set((version.segments ?? []).map((segment) => segment._id))

    for (const segment of version.segments ?? []) {
      if (segment.segmentId) {
        segmentIdCounts.set(segment.segmentId, (segmentIdCounts.get(segment.segmentId) ?? 0) + 1)
      }
      if (segment.parentId && !documentIds.has(segment.parentId)) {
        orphanParents.push(`${version.versionId ?? version._id}:${segment.segmentId ?? segment._id}`)
      }
    }

    for (const [segmentId, count] of segmentIdCounts) {
      if (count > 1) duplicateSegmentsWithinVersion.push(`${version.versionId ?? version._id}:${segmentId}`)
    }
  }

  const errors =
    missing.length +
    duplicateCanonNumbers.length +
    noStructure.length +
    noVersion.length +
    duplicateVersionIds.length +
    duplicateSegmentsWithinVersion.length +
    orphanParents.length +
    emptyTextVersions.length

  console.log('\nREAD-BACK FINALE CIC 1983 — SANITY PRODUCTION')
  console.log(`Canoni: ${rows.length}/${expected}`)
  console.log(`Intervallo: ${rows[0]?.number ?? '-'}–${rows.at(-1)?.number ?? '-'}`)
  console.log(`Versioni: ${versions.length}`)
  console.log(`Segmenti: ${segments.length}`)
  console.log(`Canoni mancanti: ${missing.length}`)
  console.log(`Numeri canone duplicati: ${duplicateCanonNumbers.length}`)
  console.log(`Canoni senza struttura: ${noStructure.length}`)
  console.log(`Canoni senza versione: ${noVersion.length}`)
  console.log(`VersionId duplicati: ${duplicateVersionIds.length}`)
  console.log(`SegmentId duplicati nella stessa versione: ${duplicateSegmentsWithinVersion.length}`)
  console.log(`Segmenti con parent mancante nella stessa versione: ${orphanParents.length}`)
  console.log(`Versioni senza testo: ${emptyTextVersions.length}`)
  console.log(errors === 0 ? '✔ READ-BACK FINALE SUPERATO — 0 errori' : `✖ READ-BACK FINALE FALLITO — ${errors} errori`)

  if (missing.length) console.log(`Mancanti: ${missing.join(', ')}`)
  if (duplicateCanonNumbers.length) console.log(`Canoni duplicati: ${duplicateCanonNumbers.join(', ')}`)
  if (noStructure.length) console.log(`Senza struttura: ${noStructure.join(', ')}`)
  if (noVersion.length) console.log(`Senza versione: ${noVersion.join(', ')}`)
  if (duplicateVersionIds.length) console.log(`VersionId duplicati: ${duplicateVersionIds.join(', ')}`)
  if (duplicateSegmentsWithinVersion.length) console.log(`SegmentId duplicati: ${duplicateSegmentsWithinVersion.join(', ')}`)
  if (orphanParents.length) console.log(`Parent mancanti: ${orphanParents.join(', ')}`)
  if (emptyTextVersions.length) console.log(`Versioni senza testo: ${emptyTextVersions.map((v) => v.versionId ?? v._id).join(', ')}`)

  process.exitCode = errors ? 1 : 0
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
