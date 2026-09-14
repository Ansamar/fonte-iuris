import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-03-25'}).withConfig({
  projectId: '2rq93txn',
  dataset: 'production',
  useCdn: false,
  perspective: 'raw',
})
const dryRun = process.argv.includes('--dry-run')
const targetId = 'legal-concept-matrimonio-canonico'

const expectedCitations = [
  'Codex Iuris Canonici (1983), Libro IV, Parte I, Titolo VII, cann. 1055-1165.',
  'Conferenza Episcopale Italiana, Decreto generale sul matrimonio canonico, 5 novembre 1990.',
  'Francesco, Litterae Apostolicae motu proprio datae Mitis Iudex Dominus Iesus, 15 agosto 2015.',
]

async function main() {
  const cfg = client.config()
  const probe = await client.fetch<{
    _id: string
    _type: string
    label?: string
    bibliographyDefined: boolean
    bibliographyCount: number
  } | null>(
    `*[_id==$id][0]{_id,_type,label,"bibliographyDefined":defined(bibliography),"bibliographyCount":count(bibliography)}`,
    {id: targetId},
  )

  console.log('DIAGNOSTICA CLIENT')
  console.log(JSON.stringify({projectId: cfg.projectId, dataset: cfg.dataset, perspective: cfg.perspective, probe}, null, 2))

  const withInline = await client.fetch<Array<{_id: string; label?: string; bibliography?: Array<{citation?: string}>}>>(
    `*[_type=="legalConcept" && defined(bibliography) && count(bibliography)>0]{_id,label,bibliography}`,
  )

  if (withInline.length !== 1 || withInline[0]._id !== targetId) {
    throw new Error(`Atteso un solo legalConcept con bibliography inline (${targetId}); trovati: ${withInline.map((d) => d._id).join(', ') || 'nessuno'}`)
  }

  const doc = await client.fetch<{
    _id: string
    label: string
    bibliography?: Array<{citation?: string}>
    canons: number[]
    sources: string[]
  } | null>(
    `*[_id==$id][0]{_id,label,bibliography,"canons":relatedCanons[]->number,"sources":relatedSources[]->_id}`,
    {id: targetId},
  )

  if (!doc) throw new Error(`Documento non trovato: ${targetId}`)

  const citations = (doc.bibliography ?? []).map((entry) => entry.citation ?? '')
  if (citations.length !== expectedCitations.length || !expectedCitations.every((citation) => citations.includes(citation))) {
    throw new Error('La bibliography inline non coincide con le 3 voci legacy attese; nessuna modifica eseguita.')
  }

  const canonNumbers = doc.canons ?? []
  if (canonNumbers.length !== 111 || canonNumbers[0] !== 1055 || canonNumbers[canonNumbers.length - 1] !== 1165) {
    throw new Error(`Relazioni canoniche non complete: attesi 111 canoni 1055-1165, trovati ${canonNumbers.length}.`)
  }

  const requiredSources = [
    'source-cei-1990-decreto-generale-matrimonio-canonico',
    'source-mitis-iudex-dominus-iesus-2015',
  ]
  if (!requiredSources.every((id) => (doc.sources ?? []).includes(id))) {
    throw new Error('Le fonti strutturate CEI/Mitis Iudex non sono entrambe presenti; nessuna modifica eseguita.')
  }

  console.log(`MATRIMONIO CANONICO · ${dryRun ? 'DRY RUN' : 'RIMOZIONE BIBLIOGRAFIA LEGACY'}`)
  console.log(`Bibliografia inline: ${citations.length} voci legacy verificate`)
  console.log(`Relazioni sostitutive: ${canonNumbers.length} canoni + ${requiredSources.length} fonti verificate`)

  if (dryRun) {
    console.log('Nessuna scrittura eseguita.')
    return
  }

  await client.patch(targetId).unset(['bibliography']).commit()

  const readBack = await client.fetch<{_id: string; bibliographyDefined: boolean; bibliographyCount: number}>(
    `*[_id==$id][0]{_id,"bibliographyDefined":defined(bibliography),"bibliographyCount":count(bibliography)}`,
    {id: targetId},
  )

  if (readBack.bibliographyDefined || readBack.bibliographyCount > 0) {
    throw new Error('Read-back fallito: bibliography risulta ancora presente.')
  }

  console.log(JSON.stringify(readBack, null, 2))
  console.log('RIMOZIONE OK · bibliography inline legacy eliminata; relazioni strutturate preservate')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
