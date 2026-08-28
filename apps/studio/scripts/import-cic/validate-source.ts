import {allCanons} from './data/canons'
import {structuralUnits} from './data/structuralUnits'
import {normalizeCanonicalText} from './portableText'
import type {CanonInput, CanonSegmentInput} from './types'

type ValidationError = {
  path: string
  message: string
}

function validateSegment(
  segment: CanonSegmentInput,
  textLength: number,
  path: string,
  segmentIds: Set<string>,
): ValidationError[] {
  const errors: ValidationError[] = []

  if (!segment.segmentId.trim()) {
    errors.push({path: `${path}.segmentId`, message: 'segmentId mancante'})
  }

  if (segmentIds.has(segment.segmentId)) {
    errors.push({
      path: `${path}.segmentId`,
      message: `segmentId duplicato: ${segment.segmentId}`,
    })
  } else {
    segmentIds.add(segment.segmentId)
  }

  if (!segment.label.trim()) {
    errors.push({path: `${path}.label`, message: 'Etichetta mancante'})
  }

  if (!Number.isInteger(segment.order) || segment.order < 0) {
    errors.push({path: `${path}.order`, message: 'order deve essere un intero >= 0'})
  }

  for (const [field, value] of [
    ['startOffset', segment.startOffset],
    ['endOffset', segment.endOffset],
  ] as const) {
    if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
      errors.push({
        path: `${path}.${field}`,
        message: `${field} deve essere un intero >= 0`,
      })
    }
  }

  if (
    segment.startOffset !== undefined &&
    segment.endOffset !== undefined &&
    segment.endOffset < segment.startOffset
  ) {
    errors.push({path, message: 'endOffset è inferiore a startOffset'})
  }

  if (segment.startOffset !== undefined && segment.startOffset > textLength) {
    errors.push({
      path: `${path}.startOffset`,
      message: `startOffset ${segment.startOffset} supera la lunghezza del testo ${textLength}`,
    })
  }

  if (segment.endOffset !== undefined && segment.endOffset > textLength) {
    errors.push({
      path: `${path}.endOffset`,
      message: `endOffset ${segment.endOffset} supera la lunghezza del testo ${textLength}`,
    })
  }

  return errors
}

function validateStructuralUnits(): ValidationError[] {
  const errors: ValidationError[] = []
  const ids = new Set<string>()

  for (const [index, unit] of structuralUnits.entries()) {
    const path = `structuralUnits[${index}]`

    if (ids.has(unit.canonicalId)) {
      errors.push({path, message: `canonicalId duplicato: ${unit.canonicalId}`})
    }
    ids.add(unit.canonicalId)

    if (!unit.title.trim()) {
      errors.push({path: `${path}.title`, message: 'Titolo mancante'})
    }

    if (!unit.parentCanonicalId.trim()) {
      errors.push({path: `${path}.parentCanonicalId`, message: 'Unità superiore mancante'})
    }

    if (!Number.isInteger(unit.order) || unit.order < 0) {
      errors.push({path: `${path}.order`, message: 'order deve essere un intero >= 0'})
    }
  }

  return errors
}

function validateCanons(canons: CanonInput[]): ValidationError[] {
  const errors: ValidationError[] = []
  const canonNumbers = new Set<number>()
  const versionIds = new Set<string>()

  for (const [canonIndex, canon] of canons.entries()) {
    const canonPath = `canons[${canonIndex}]`

    if (!Number.isInteger(canon.number) || canon.number < 1 || canon.number > 1752) {
      errors.push({
        path: `${canonPath}.number`,
        message: `Numero canone non valido: ${canon.number}`,
      })
    }

    if (canonNumbers.has(canon.number)) {
      errors.push({
        path: `${canonPath}.number`,
        message: `Canone duplicato: ${canon.number}`,
      })
    }
    canonNumbers.add(canon.number)

    if (!canon.structuralUnitCanonicalId.trim()) {
      errors.push({
        path: `${canonPath}.structuralUnitCanonicalId`,
        message: 'Unità strutturale mancante',
      })
    }

    if (!canon.versions.length) {
      errors.push({
        path: `${canonPath}.versions`,
        message: `Can. ${canon.number}: nessuna versione presente`,
      })
      continue
    }

    for (const [versionIndex, version] of canon.versions.entries()) {
      const versionPath = `${canonPath}.versions[${versionIndex}]`
      const expectedPrefix = `cic-1983-can-${canon.number}-`

      if (!version.versionId.startsWith(expectedPrefix)) {
        errors.push({
          path: `${versionPath}.versionId`,
          message: `versionId incompatibile con Can. ${canon.number}: ${version.versionId}`,
        })
      }

      if (!/^cic-1983-can-\d+-(it|la)-[a-z0-9-]+$/.test(version.versionId)) {
        errors.push({
          path: `${versionPath}.versionId`,
          message: `Formato versionId non valido: ${version.versionId}`,
        })
      }

      if (versionIds.has(version.versionId)) {
        errors.push({
          path: `${versionPath}.versionId`,
          message: `versionId duplicato: ${version.versionId}`,
        })
      }
      versionIds.add(version.versionId)

      if (!version.versionLabel.trim()) {
        errors.push({path: `${versionPath}.versionLabel`, message: 'Etichetta versione mancante'})
      }

      if (version.validFrom && Number.isNaN(Date.parse(version.validFrom))) {
        errors.push({
          path: `${versionPath}.validFrom`,
          message: `Data non valida: ${version.validFrom}`,
        })
      }

      if (version.validUntil && Number.isNaN(Date.parse(version.validUntil))) {
        errors.push({
          path: `${versionPath}.validUntil`,
          message: `Data non valida: ${version.validUntil}`,
        })
      }

      if (
        version.validFrom &&
        version.validUntil &&
        version.validUntil < version.validFrom
      ) {
        errors.push({path: versionPath, message: 'validUntil è precedente a validFrom'})
      }

      const normalizedText = normalizeCanonicalText(version.text)
      const segmentIds = new Set<string>()

      for (const [segmentIndex, item] of version.segments.entries()) {
        errors.push(
          ...validateSegment(
            item,
            normalizedText.length,
            `${versionPath}.segments[${segmentIndex}]`,
            segmentIds,
          ),
        )
      }

      for (const [segmentIndex, item] of version.segments.entries()) {
        if (item.parentSegmentId && !segmentIds.has(item.parentSegmentId)) {
          errors.push({
            path: `${versionPath}.segments[${segmentIndex}].parentSegmentId`,
            message: `Segmento superiore inesistente: ${item.parentSegmentId}`,
          })
        }

        if (item.parentSegmentId === item.segmentId) {
          errors.push({
            path: `${versionPath}.segments[${segmentIndex}].parentSegmentId`,
            message: 'Un segmento non può essere padre di sé stesso',
          })
        }
      }
    }
  }

  return errors
}

function main() {
  const errors = [...validateStructuralUnits(), ...validateCanons(allCanons)]

  const versionCount = allCanons.reduce(
    (total, canon) => total + canon.versions.length,
    0,
  )

  const segmentCount = allCanons.reduce(
    (total, canon) =>
      total + canon.versions.reduce((subtotal, version) => subtotal + version.segments.length, 0),
    0,
  )

  console.log('\nVALIDAZIONE SORGENTE CIC 1983')
  console.log(`Unità strutturali nuove: ${structuralUnits.length}`)
  console.log(`Canoni: ${allCanons.length}`)
  console.log(`Versioni: ${versionCount}`)
  console.log(`Segmenti: ${segmentCount}`)

  if (errors.length === 0) {
    console.log('\n✔ Sorgente valida')
    console.log('0 errori')
    return
  }

  console.error(`\n✖ ${errors.length} errori trovati\n`)

  for (const error of errors) {
    console.error(error.path)
    console.error(`  ${error.message}\n`)
  }

  process.exit(1)
}

main()
