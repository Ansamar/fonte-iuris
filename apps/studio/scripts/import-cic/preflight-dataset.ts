import {client} from './client'
import {allCanons} from './data/canons'
import {structuralUnits} from './data/structuralUnits'

type PreflightError = {
  scope: string
  message: string
}

async function main() {
  const errors: PreflightError[] = []

  console.log('\nPREFLIGHT DATASET CIC 1983')

  const corpus = await client.fetch(
    `*[_type == "corpus" && code == "cic-1983"][0]{_id, code, title}`,
  )

  if (!corpus) {
    errors.push({scope: 'corpus', message: 'Corpus cic-1983 non trovato'})
  } else {
    console.log(`✔ Corpus: ${corpus.title}`)
  }

  for (const unit of structuralUnits) {
    const matches = await client.fetch(
      `*[_type == "structuralUnit" && canonicalId == $canonicalId]{
        _id,
        canonicalId,
        unitType,
        number,
        title,
        parent->{canonicalId},
        order
      }`,
      {canonicalId: unit.canonicalId},
    )

    if (matches.length > 1) {
      errors.push({
        scope: unit.canonicalId,
        message: 'Più unità strutturali con lo stesso canonicalId',
      })
      continue
    }

    if (matches.length === 1) {
      const existing = matches[0]

      if (existing.unitType !== unit.unitType) {
        errors.push({
          scope: unit.canonicalId,
          message: `Tipo incompatibile: dataset=${existing.unitType}, sorgente=${unit.unitType}`,
        })
      }

      if (
        existing.parent?.canonicalId &&
        existing.parent.canonicalId !== unit.parentCanonicalId
      ) {
        errors.push({
          scope: unit.canonicalId,
          message: `Unità superiore incompatibile: dataset=${existing.parent.canonicalId}, sorgente=${unit.parentCanonicalId}`,
        })
      }
    }

    const parentInSource = structuralUnits.some(
      (candidate) => candidate.canonicalId === unit.parentCanonicalId,
    )

    if (!parentInSource) {
      const parentCount = await client.fetch(
        `count(*[_type == "structuralUnit" && canonicalId == $canonicalId])`,
        {canonicalId: unit.parentCanonicalId},
      )

      if (parentCount !== 1) {
        errors.push({
          scope: unit.canonicalId,
          message: `Unità superiore non risolvibile: ${unit.parentCanonicalId}`,
        })
      }
    }
  }

  const plannedStructuralIds = new Set(
    structuralUnits.map((unit) => unit.canonicalId),
  )

  for (const canon of allCanons) {
    const structuralUnitsInDataset = await client.fetch(
      `*[_type == "structuralUnit" && canonicalId == $canonicalId]{_id, canonicalId}`,
      {canonicalId: canon.structuralUnitCanonicalId},
    )

    const resolvableBySource = plannedStructuralIds.has(
      canon.structuralUnitCanonicalId,
    )

    if (structuralUnitsInDataset.length === 0 && !resolvableBySource) {
      errors.push({
        scope: `Can. ${canon.number}`,
        message: `Unità strutturale non trovata: ${canon.structuralUnitCanonicalId}`,
      })
    }

    if (structuralUnitsInDataset.length > 1) {
      errors.push({
        scope: `Can. ${canon.number}`,
        message: `Più unità strutturali con canonicalId ${canon.structuralUnitCanonicalId}`,
      })
    }

    const existingCanons = await client.fetch(
      `*[
        _type == "canon" &&
        (number == $number || canonicalId == $canonicalId)
      ]{_id, number, canonicalId}`,
      {
        number: canon.number,
        canonicalId: `cic-1983-can-${canon.number}`,
      },
    )

    const exactCanonMatches = existingCanons.filter(
      (doc: {number?: number; canonicalId?: string}) =>
        doc.number === canon.number &&
        doc.canonicalId === `cic-1983-can-${canon.number}`,
    )

    if (existingCanons.length > 0 && exactCanonMatches.length === 0) {
      errors.push({
        scope: `Can. ${canon.number}`,
        message: 'Conflitto tra numero del canone e canonicalId nel dataset',
      })
    }

    if (exactCanonMatches.length > 1) {
      errors.push({
        scope: `Can. ${canon.number}`,
        message: 'Esistono più documenti canon con lo stesso numero e canonicalId',
      })
    }

    for (const version of canon.versions) {
      const existingVersions = await client.fetch(
        `*[_type == "canonVersion" && versionId == $versionId]{
          _id,
          versionId,
          language,
          canon->{_id, number, canonicalId}
        }`,
        {versionId: version.versionId},
      )

      if (existingVersions.length > 1) {
        errors.push({
          scope: version.versionId,
          message: 'Esistono più canonVersion con lo stesso versionId',
        })
        continue
      }

      if (existingVersions.length === 1) {
        const existing = existingVersions[0]

        if (
          existing.canon?.number !== canon.number ||
          existing.canon?.canonicalId !== `cic-1983-can-${canon.number}`
        ) {
          errors.push({
            scope: version.versionId,
            message: 'La versione esistente è collegata a un canone diverso',
          })
        }

        if (existing.language && existing.language !== version.language) {
          errors.push({
            scope: version.versionId,
            message: `Lingua incompatibile: dataset=${existing.language}, sorgente=${version.language}`,
          })
        }
      }
    }
  }

  console.log(`Unità strutturali sorgente: ${structuralUnits.length}`)
  console.log(`Canoni sorgente: ${allCanons.length}`)

  if (errors.length === 0) {
    console.log('\n✔ PREFLIGHT SUPERATO')
    console.log('0 errori')
    console.log('Dataset compatibile con la sorgente.')
    return
  }

  console.error('\n✖ PREFLIGHT FALLITO')
  console.error(`${errors.length} errori\n`)

  for (const error of errors) {
    console.error(error.scope)
    console.error(`  ${error.message}\n`)
  }

  process.exit(1)
}

main().catch((error) => {
  console.error('\nERRORE TECNICO')
  console.error(error)
  process.exit(1)
})
