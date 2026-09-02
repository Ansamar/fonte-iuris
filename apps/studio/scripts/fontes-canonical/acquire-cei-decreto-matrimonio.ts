import {createHash} from 'node:crypto'
import {mkdir, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/cei-decreto-matrimonio-canonico')
const PAGE_URL='https://www.chiesacattolica.it/documenti-segreteria/decreto-generale-sul-matrimonio-canonico/'
const PDF_URL='https://www.chiesacattolica.it/wp-content/uploads/sites/31/2017/02/Decreto_generale_matrimonio_canonico.pdf'

async function sha(data:Buffer|string){return createHash('sha256').update(data).digest('hex')}

async function main(){
  await mkdir(ROOT,{recursive:true})
  console.log('\nACQUISIZIONE CEI — DECRETO GENERALE SUL MATRIMONIO CANONICO')

  const pageResponse=await fetch(PAGE_URL,{headers:{'user-agent':'Fonte-Iuris/1.0 canonical-source-acquisition'}})
  if(!pageResponse.ok)throw new Error(`Pagina CEI: HTTP ${pageResponse.status}`)
  const page=await pageResponse.text()
  for(const marker of ['Decreto generale sul matrimonio canonico','05 Novembre 1990']){
    if(!page.toLocaleLowerCase('it').includes(marker.toLocaleLowerCase('it')))throw new Error(`Pagina CEI inattesa: manca ${marker}`)
  }
  const pageHash=await sha(page)
  await writeFile(join(ROOT,'landing.official.html'),page,'utf8')

  const pdfResponse=await fetch(PDF_URL,{headers:{'user-agent':'Fonte-Iuris/1.0 canonical-source-acquisition'}})
  if(!pdfResponse.ok)throw new Error(`PDF CEI: HTTP ${pdfResponse.status}`)
  const pdf=Buffer.from(await pdfResponse.arrayBuffer())
  if(pdf.length<10000||pdf.subarray(0,4).toString('ascii')!=='%PDF')throw new Error('PDF CEI inatteso o incompleto')
  const pdfHash=await sha(pdf)
  await writeFile(join(ROOT,'decreto-generale-matrimonio-canonico.official.pdf'),pdf)

  const capturedAt=new Date().toISOString()
  const canonical={
    documentId:'cei-1990-decreto-generale-matrimonio-canonico',
    title:'Decreto generale sul matrimonio canonico',
    shortTitle:'Decreto generale sul matrimonio canonico',
    documentType:'decree',issuer:'Conferenza Episcopale Italiana',issuedAt:'1990-11-05',publishedAt:'1990-11-05',
    publicationReference:'Notiziario CEI 1990, n. 10, pp. 257-279',effectiveFrom:'1991-02-17',territorialScope:'italy',legalForce:'normative',status:'inForce',language:'it',
    officialCitation:'CEI, Decreto generale sul matrimonio canonico, 5 novembre 1990, NCEI 1990, 10/257-279',officialUrl:PAGE_URL,
    snapshot:{sourceUrl:PDF_URL,capturedAt,sha256:pdfHash,path:'scripts/fontes-canonical/data/cei-decreto-matrimonio-canonico/decreto-generale-matrimonio-canonico.official.pdf'},
    landingSnapshot:{sourceUrl:PAGE_URL,capturedAt,sha256:pageHash,path:'scripts/fontes-canonical/data/cei-decreto-matrimonio-canonico/landing.official.html'},
    canonicalDataVersion:'1',
    provision:{provisionId:'cei-1990-decreto-generale-matrimonio-canonico',title:'Decreto generale sul matrimonio canonico',provisionType:'generalDecree',issuer:'Conferenza Episcopale Italiana',territorialScope:'italy',legalForce:'normative',effectiveFrom:'1991-02-17',status:'inForce',legalVerification:'verified',summary:'Normativa generale della Conferenza Episcopale Italiana per l’applicazione in Italia della disciplina canonica del matrimonio. Attua e specifica disposizioni del CIC, in particolare i cann. 1067, 1121 §1, 1126 e 1127 §2, ed è in vigore dal 17 febbraio 1991.'},
    relations:[1067,1121,1126,1127].map(canon=>({canon,relationType:'implements',authorityLevel:'official',validFrom:'1991-02-17',verified:true}))
  }
  await writeFile(join(ROOT,'canonical.json'),JSON.stringify(canonical,null,2)+'\n','utf8')
  console.log(`✔ landing CEI sha256=${pageHash}`)
  console.log(`✔ PDF ufficiale CEI sha256=${pdfHash}`)
  console.log('✔ canonical.json creato — effectiveFrom=1991-02-17')
}

main().catch(e=>{console.error('\n✖ ACQUISIZIONE CEI FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
