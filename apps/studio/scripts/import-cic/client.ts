import {createClient} from '@sanity/client'

export const client = createClient({
  projectId: '2rq93txn',
  dataset: 'production',
  apiVersion: '2026-03-25',
  useCdn: false,
})