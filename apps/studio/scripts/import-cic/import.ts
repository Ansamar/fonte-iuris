import {getCliClient} from 'sanity/cli'

import {client as readClient} from './client'
import {allCanons} from './data/canons'
import {structuralUnits} from './data/structuralUnits'
import {canonicalTextToPortableText, normalizeCanonicalText} from './portableText'
import type {CanonInput, CanonSegmentInput, CanonVersionInput} from './types'

const API_VERSION = '2026-03-25'
const CORPUS_CODE = 'cic-1983'

type CliOptions = {
  commitMode: boolean
  from?: number
  to?: number
}

function parsePositiveIntegerOption(args: string[], name: '--from' | '--to') {
  const index = args.indexOf(name)
  if (index === -1) return undefined

  const raw = args[index + 1]
  if (!raw || raw.startsWith('--')) {
    throw new Error(`${name} richiede un numero di canone.`)
  }

  const value = Number(raw)
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} deve essere un intero positivo; ricevuto: ${raw}`)
  }

  return value
}

function readCliOptions(): CliOptions {
  const args = process.argv.slice(2)
  const allowedFlags = new Set(['--commit', '--from', '--to'])

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]

    if (!allowedFlags.has(arg)) {
      if (i > 0 && (args[i - 1] === '--from' || args[i - 1] === '--to')) continue
      throw new Error(`Argomento non riconosciuto: ${arg}`)
    }

    if (arg === '--from' || arg === '--to') {
      i += 1
      if (i >= args.length) {
        throw new Error(`${arg} richiede un numero di canone.`)
      }
    }
  }

  const from = parsePositiveIntegerOption(args, '--from')
  const to = parsePositiveIntegerOption(args, '--to')

  if (from !== undefined && to !== undefined && from > to) {
    throw new Error(`Intervallo non valido: --from ${from} è maggiore di --to ${to}.`)
  }

  return {
    commitMode: args.includes('--commit'),
    from,
    to,
  }
}

const {commitMode, from, to} = readCliOptions()
const client = commitMode ? getCliClient({apiVersion: API_VERSION}) : readClient

function deterministicId(value: string): string {
  return value.replace(/[^A-Za-z0-9_.-]/g, '-')
}

function compactObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as T
}

function canonInSelectedRange(canon: CanonInput) {
  if (from !== undefined && canon.number < from) return false
  if (to !== undefined && canon.number > to) return false
  return true
}

function selectedCanons() {
  const selected = allCanons.filter(canonInSelectedRange)

  if (selected.length === 0) {
    const rangeLabel =
      from !== undefined || to !== undefined
        ? `${from ?? 'inizio'}–${to ?? 'fine'}`
        : 'completo'
    throw new Error(`Nessun canone trovato nell’intervallo ${rangeLabel}.`)
  }

  return selected
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

async function getSingleStructuralUnit(canonicalId: string) {
  const units = await client.fetch(
    `*[_type == "structuralUnit" && canonicalId == $canonicalId]{
      _id,
      canonicalId,
      unitType,
      number,
      title,
      parent->{canonicalId},
      order
    }`,
    {canonicalId},
  )

  if (units.length > 1) {
    throw new Error(
      `Unità strutturale ${canonicalId}: trovati ${units.length} documenti.`,
    )
  }

  return units[0] ?? null
}

async function ensureStructuralUnits(corpusId: string) {
  const resolved = new Map<string, string>()

  console.log(`Unità strutturali sorgente: ${structuralUnits.length}`)

  for (const unit of structuralUnits) {
    const existing = await getSingleStructuralUnit(unit.canonicalId)

    let parentId: string | undefined

    if (unit.parentCanonicalId) {
      parentId = resolved.get(unit.parentCanonicalId)

      if (!parentId) {
        const parent = await getSingleStructuralUnit(unit.parentCanonicalId)
        if (!parent) {
          throw new Error(
            `${unit.canonicalId}: unità superiore non trovata: ${unit.parentCanonicalId}`,
          )
        }
        parentId = parent._id
      }
    }

    const documentId =
      existing?._id ?? deterministicId(`structural-${unit.canonicalId}`)

    const fields = compactObject({
      corpus: {_type: 'reference', _ref: corpusId},
      unitType: unit.unitType,
      number: unit.number,
      title: unit.title,
      canonicalId: unit.canonicalId,
      slug: {_type: 'slug', current: unit.canonicalId},
      parent: parentId ? {_type: 'reference', _ref: parentId} : undefined,
      order: unit.order,
      canonicalLabel: unit.canonicalLabel,
    })

    console.log(
      `${existing ? 'UPDATE' : 'CREATE'} STRUCTURE — ${unit.canonicalLabel ?? unit.title}`,
    )

    if (commitMode) {
      let transaction = client.transaction()

      if (!existing) {
        transaction = transaction.createIfNotExists({
          _id: documentId,
          _type: 'structuralUnit',
          ...fields,
        })
      }

      transaction = transaction.patch(documentId, {set: fields})
      const result = await transaction.commit({autoGenerateArrayKeys: true})
      console.log(`  COMMIT OK — transactionId: ${result.transactionId}`)
    } else {
      console.log('  DRY RUN — nessuna scrittura')
    }

    resolved.set(unit.canonicalId, documentId)
  }

  return resolved
}

async function resolveStructuralUnitId(
  canonicalId: string,
  plannedUnits: Map<string, string>,
) {
  const planned = plannedUnits.get(canonicalId)
  if (planned) return planned

  const existing = await getSingleStructuralUnit(canonicalId)
  if (!existing) {
    throw new Error(`Unità strutturale non trovata: ${canonicalId}`)
  }

  return existing._id
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

async function importCanon(
  canon: CanonInput,
  corpusId: string,
  plannedUnits: Map<string, string>,
) {
  const canonicalId = `cic-1983-can-${canon.number}`
  const structuralUnitId = await resolveStructuralUnitId(
    canon.structuralUnitCanonicalId,
    plannedUnits,
  )
  const existingCanon = await getExistingCanon(canon, corpusId)
  const canonDocumentId = existingCanon?._id ?? deterministicId(`canon-${canonicalId}`)

  console.log(`\n${existingCanon ? 'UPDATE' : 'CREATE'} CANON — Can. ${canon.number}`)

  let transaction = client.transaction()

  if (!existingCanon) {
    transaction = transaction.createIfNotExists({
      _id: canonDocumentId,
      _type: 'canon',
      ...buildCanonFields(canon, corpusId, structuralUnitId),
    })
  }

  transaction = transaction.patch(canonDocumentId, {
    set: buildCanonFields(canon, corpusId, structuralUnitId),
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

  const canons = selectedCanons()
  if (from !== undefined || to !== undefined) {
    console.log(`Intervallo canoni: ${from ?? canons[0].number}–${to ?? canons[canons.length - 1].number}`)
  } else {
    console.log('Intervallo canoni: completo')
  }

  const corpus = await getCorpus()
  console.log(`Corpus: ${corpus.title}`)

  const plannedUnits = await ensureStructuralUnits(corpus._id)

  console.log(`Canoni sorgente selezionati: ${canons.length}`)

  for (const canon of canons) {
    await importCanon(canon, corpus._id, plannedUnits)
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
