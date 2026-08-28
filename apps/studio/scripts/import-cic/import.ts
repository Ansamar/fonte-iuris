import {getCliClient} from 'sanity/cli'

import {client as readClient} from './client'
import {sampleCanons} from './data/canons.sample'
import {canonicalTextToPortableText, normalizeCanonicalText} from './portableText'
import type {CanonInput, CanonSegmentInput, CanonVersionInput} from './types'

const API_VERSION = '2026-03-25'
const CORPUS_CODE = 'cic-1983'

const commitMode = process.argv.includes('--commit')
const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--commit')

if (unknownArgs.length > 0) {
  throw new Error(`Argomenti non riconosciuti: ${unknownArgs.join(', ')}`)
}

const client = commitMode ? getCliClient({apiVersion: API_VERSION}) : readClient

function deterministicId(value: string): string {
  return value.replace(/[^A-Za-z0-9_.-]/g, '-')
}

function compactObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as T
}

async function getCorpus() {
  const corpora = await client.fetch(
    `*[_type == "corpus" && code == $code]{_id, code, title}`,
    {code: CORPUS_CODE},
  )

  if (corpora.length !== 1) {
    throw new Error(`Atteso un solo corpus ${CORPUS_CODE}; trovati ${corpora.length}.`)
  }

  return corpora[0]
}

async function getStructuralUnit(canonicalId: string) {
  const units = await client.fetch(
    `*[_type == "structuralUnit" && canonicalId == $canonicalId]{_id, canonicalId, title}`,
    {canonicalId},
  )

  if (units.length !== 1) {
    throw new Error(
      `Unità strutturale ${canonicalId}: atteso 1 documento, trovati ${units.length}.`,
    )
  }

  return units[0]
}

async function getSourceDocument(title?: string) {
  if (!title) return null

  const sources = await client.fetch(
    `*[_type == "sourceDocument" && title == $title]{_id, title}`,
    {title},
  )

  if (sources.length !== 1) {
    throw new Error(
      `Fonte normativa "${title}": atteso 1 documento, trovati ${sources.length}.`,
    )
  }

  return sources[0]
}

async function getExistingCanon(canon: CanonInput, corpusId: string) {
  const canonicalId = `cic-1983-can-${canon.number}`

  const matches = await client.fetch(
    `*[
      _type == "canon" &&
      corpus._ref == $corpusId &&
      (canonicalId == $canonicalId || number == $number)
    ]{_id, canonicalId, number}`,
    {corpusId, canonicalId, number: canon.number},
  )

  if (matches.length > 1) {
    throw new Error(`Can. ${canon.number}: conflitto tra numero e canonicalId nel dataset.`)
  }

  if (matches.length === 1) {
    const match = matches[0]

    if (match.number !== canon.number || match.canonicalId !== canonicalId) {
      throw new Error(
        `Can. ${canon.number}: il documento esistente non coincide con ${canonicalId}.`,
      )
    }

    return match
  }

  return null
}

async function getExistingVersion(versionId: string) {
  const matches = await client.fetch(
    `*[_type == "canonVersion" && versionId == $versionId]{
      _id,
      versionId,
      canon->{_id, number, canonicalId},
      language
    }`,
    {versionId},
  )

  if (matches.length > 1) {
    throw new Error(`Versione duplicata nel dataset: ${versionId}`)
  }

  return matches[0] ?? null
}

async function getExistingSegments(versionDocumentId: string) {
  return client.fetch(
    `*[_type == "canonSegment" && version._ref == $versionDocumentId]{_id, segmentId}`,
    {versionDocumentId},
  )
}

function buildCanonFields(
  canon: CanonInput,
  corpusId: string,
  structuralUnitId: string,
) {
  return compactObject({
    corpus: {_type: 'reference', _ref: corpusId},
    number: canon.number,
    canonicalId: `cic-1983-can-${canon.number}`,
    slug: {_type: 'slug', current: `can-${canon.number}`},
    structuralUnit: {_type: 'reference', _ref: structuralUnitId},
    status: canon.status ?? 'inForce',
    editorialTitle: canon.editorialTitle,
    keywords: canon.keywords,
  })
}

function buildVersionFields(
  version: CanonVersionInput,
  canonDocumentId: string,
  sourceDocumentId?: string,
) {
  const normalizedText = normalizeCanonicalText(version.text)

  return compactObject({
    canon: {_type: 'reference', _ref: canonDocumentId},
    versionId: version.versionId,
    versionLabel: version.versionLabel,
    status: version.status,
    validFrom: version.validFrom,
    validUntil: version.validUntil,
    language: version.language,
    fullText: normalizedText ? canonicalTextToPortableText(normalizedText) : undefined,
    sourceDocument: sourceDocumentId
      ? {_type: 'reference', _ref: sourceDocumentId}
      : undefined,
    sourceCitation: version.sourceCitation,
    sourceUrl: version.sourceUrl,
    changeSummary: version.changeSummary,
  })
}

function buildSegmentFields(
  segment: CanonSegmentInput,
  canonDocumentId: string,
  versionDocumentId: string,
  parentDocumentId?: string,
) {
  return compactObject({
    canon: {_type: 'reference', _ref: canonDocumentId},
    version: {_type: 'reference', _ref: versionDocumentId},
    segmentType: segment.segmentType,
    segmentId: segment.segmentId,
    label: segment.label,
    parentSegment: parentDocumentId
      ? {_type: 'reference', _ref: parentDocumentId}
      : undefined,
    order: segment.order,
    startOffset: segment.startOffset,
    endOffset: segment.endOffset,
    isFormalDivision: segment.isFormalDivision,
  })
}

async function importCanon(canon: CanonInput, corpusId: string) {
  const canonicalId = `cic-1983-can-${canon.number}`
  const structuralUnit = await getStructuralUnit(canon.structuralUnitCanonicalId)
  const existingCanon = await getExistingCanon(canon, corpusId)
  const canonDocumentId = existingCanon?._id ?? deterministicId(`canon-${canonicalId}`)

  console.log(`\n${existingCanon ? 'UPDATE' : 'CREATE'} CANON — Can. ${canon.number}`)

  let transaction = client.transaction()

  if (!existingCanon) {
    transaction = transaction.createIfNotExists({
      _id: canonDocumentId,
      _type: 'canon',
      ...buildCanonFields(canon, corpusId, structuralUnit._id),
    })
  }

  transaction = transaction.patch(canonDocumentId, {
    set: buildCanonFields(canon, corpusId, structuralUnit._id),
  })

  for (const version of canon.versions) {
    const existingVersion = await getExistingVersion(version.versionId)

    if (existingVersion && existingVersion.canon?.canonicalId !== canonicalId) {
      throw new Error(
        `${version.versionId}: collegata a un canone diverso da ${canonicalId}.`,
      )
    }

    if (existingVersion?.language && existingVersion.language !== version.language) {
      throw new Error(
        `${version.versionId}: lingua dataset=${existingVersion.language}, sorgente=${version.language}.`,
      )
    }

    const versionDocumentId =
      existingVersion?._id ?? deterministicId(`version-${version.versionId}`)

    const sourceDocument = await getSourceDocument(version.sourceDocumentTitle)
    const versionFields = buildVersionFields(
      version,
      canonDocumentId,
      sourceDocument?._id,
    )

    console.log(
      `  ${existingVersion ? 'UPDATE' : 'CREATE'} VERSION — ${version.versionId}`,
    )
    console.log(
      `    testo: ${normalizeCanonicalText(version.text) ? 'SET' : 'SKIP'} · segmenti: ${version.segments.length}`,
    )

    if (!existingVersion) {
      transaction = transaction.createIfNotExists({
        _id: versionDocumentId,
        _type: 'canonVersion',
        ...versionFields,
      })
    }

    transaction = transaction.patch(versionDocumentId, {set: versionFields})

    if (version.segments.length > 0) {
      const existingSegments = await getExistingSegments(versionDocumentId)
      const existingBySegmentId = new Map<string, string>(
        existingSegments.map((item: {_id: string; segmentId: string}) => [
          item.segmentId,
          item._id,
        ]),
      )

      const segmentDocumentIds = new Map<string, string>()

      for (const segment of version.segments) {
        const documentId =
          existingBySegmentId.get(segment.segmentId) ??
          deterministicId(`segment-${version.versionId}-${segment.segmentId}`)

        segmentDocumentIds.set(segment.segmentId, documentId)
      }

      for (const segment of version.segments) {
        const segmentDocumentId = segmentDocumentIds.get(segment.segmentId)

        if (!segmentDocumentId) {
          throw new Error(`ID segmento non risolto: ${segment.segmentId}`)
        }

        const parentDocumentId = segment.parentSegmentId
          ? segmentDocumentIds.get(segment.parentSegmentId)
          : undefined

        if (segment.parentSegmentId && !parentDocumentId) {
          throw new Error(
            `${segment.segmentId}: parentSegmentId non trovato: ${segment.parentSegmentId}`,
          )
        }

        const fields = buildSegmentFields(
          segment,
          canonDocumentId,
          versionDocumentId,
          parentDocumentId,
        )

        if (!existingBySegmentId.has(segment.segmentId)) {
          transaction = transaction.createIfNotExists({
            _id: segmentDocumentId,
            _type: 'canonSegment',
            ...fields,
          })
        }

        transaction = transaction.patch(segmentDocumentId, {set: fields})
      }
    }
  }

  if (!commitMode) {
    console.log('  DRY RUN — nessuna scrittura')
    return
  }

  const result = await transaction.commit({autoGenerateArrayKeys: true})
  console.log(`  COMMIT OK — transactionId: ${result.transactionId}`)
}

async function main() {
  console.log('\nIMPORTATORE CIC 1983')
  console.log(commitMode ? 'MODALITÀ: COMMIT' : 'MODALITÀ: DRY RUN')

  if (commitMode) {
    console.log('Le scritture sono abilitate tramite il token utente Sanity CLI.')
  }

  const corpus = await getCorpus()
  console.log(`Corpus: ${corpus.title}`)
  console.log(`Canoni sorgente: ${sampleCanons.length}`)

  for (const canon of sampleCanons) {
    await importCanon(canon, corpus._id)
  }

  console.log(
    commitMode
      ? '\nIMPORT COMPLETATO'
      : '\nDRY RUN COMPLETATO — nessuna scrittura effettuata.',
  )
}

main().catch((error) => {
  console.error('\nIMPORT FALLITO')
  console.error(error)
  process.exit(1)
})
