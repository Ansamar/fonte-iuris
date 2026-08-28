import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '2rq93txn',
  dataset: 'production',
  apiVersion: '2025-08-15',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
})

const documentId = '4aabc717-be0b-4d3a-afe1-a9f48a1643a1'

if (!process.env.SANITY_AUTH_TOKEN) {
  throw new Error('SANITY_AUTH_TOKEN non impostato')
}

await client
  .patch(documentId)
  .unset(['text'])
  .commit()

console.log(`Campo text rimosso da ${documentId}`)