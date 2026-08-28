import {client} from './client'
import {sampleCanons} from './data/canons.sample'

async function main() {
  const corpus = await client.fetch(
    `*[_type == "corpus" && code == "cic-1983"][0]{
      _id,
      title,
      code
    }`,
  )

  if (!corpus) {
    throw new Error('Corpus CIC 1983 non trovato')
  }

  console.log('\nCORPUS')
  console.log(corpus)

  for (const input of sampleCanons) {
    const canonicalId = `cic-1983-can-${input.number}`

    const existingCanon = await client.fetch(
      `*[
        _type == "canon" &&
        canonicalId == $canonicalId
      ][0]{
        _id,
        canonicalId,
        number
      }`,
      {canonicalId},
    )

    const structuralUnit = await client.fetch(
      `*[
        _type == "structuralUnit" &&
        canonicalId == $canonicalId
      ][0]{
        _id,
        canonicalId,
        title
      }`,
      {
        canonicalId: input.structuralUnitCanonicalId,
      },
    )

    if (!structuralUnit) {
      throw new Error(
        `Unità strutturale non trovata: ${input.structuralUnitCanonicalId}`,
      )
    }

    const canonDocumentId =
      existingCanon?._id ?? `canon-cic-1983-${input.number}`

    console.log(
      `\n${existingCanon ? 'UPDATE' : 'CREATE'} — Can. ${input.number}`,
    )

    console.log({
      _id: canonDocumentId,
      _type: 'canon',
      corpus: {
        _type: 'reference',
        _ref: corpus._id,
      },
      number: input.number,
      canonicalId,
      slug: {
        _type: 'slug',
        current: `can-${input.number}`,
      },
      structuralUnit: {
        _type: 'reference',
        _ref: structuralUnit._id,
      },
      status: input.status ?? 'inForce',
      editorialTitle: input.editorialTitle,
      keywords: input.keywords,
    })

    for (const version of input.versions) {
      const existingVersion = await client.fetch(
        `*[
          _type == "canonVersion" &&
          versionId == $versionId
        ][0]{
          _id,
          versionId
        }`,
        {
          versionId: version.versionId,
        },
      )

      console.log(
        `  ${existingVersion ? 'UPDATE' : 'CREATE'} VERSION — ${
          version.versionId
        }`,
      )

      console.log({
        _id:
          existingVersion?._id ??
          `version-${version.versionId}`,
        canon: canonDocumentId,
        language: version.language,
        status: version.status,
        validFrom: version.validFrom,
        textLength: version.text.length,
        segments: version.segments.length,
      })
    }
  }

  console.log('\nDRY RUN COMPLETATO')
  console.log('Nessuna scrittura effettuata.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})