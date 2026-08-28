import {client} from './client'

const numbers = [368, 369]

async function main() {
  for (const number of numbers) {
    const canonicalId = `cic-1983-can-${number}`
    const expectedId = `canon-cic-1983-${number}`

    const docs = await client.fetch(
      `*[
        _type == "canon" &&
        (
          number == $number ||
          canonicalId == $canonicalId ||
          _id == $expectedId
        )
      ]{
        _id,
        number,
        canonicalId,
        editorialTitle
      }`,
      {
        number,
        canonicalId,
        expectedId,
      },
    )

    console.log(`\nCan. ${number}`)
    console.dir(docs, {depth: null})

    if (docs.length > 1) {
      console.warn(
        `ATTENZIONE: trovati ${docs.length} documenti potenzialmente concorrenti.`,
      )
    }

    if (docs.length === 1 && docs[0]._id !== expectedId) {
      console.warn(
        `ID esistente non deterministico: ${docs[0]._id} → previsto ${expectedId}`,
      )
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})