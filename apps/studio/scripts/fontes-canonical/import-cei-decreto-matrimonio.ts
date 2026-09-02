import {getCliClient} from 'sanity/cli'
import {client as readClient} from '../import-cic/client'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const commitMode=process.argv.includes('--commit')
const client=commitMode?getCliClient({apiVersion:'2026-03-25'}):readClient
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/cei-decreto-matrimonio-canonico')
const DATA=join(ROOT,'canonical.json')
const SOURCE_ID='source-cei-1990-decreto-generale-matrimonio-canonico'
const PROVISION_ID='italian-cei-1990-decreto-generale-matrimonio-canonico'

const ref=(_ref:string)=>({_type:'reference',_ref})

async function main(){
  console.log(`\nCEI — DECRETO GENERALE SUL MATRIMONIO CANONICO — ${commitMode?'IMPORT':'DRY RUN'}`)
  const c=JSON.parse(await readFile(DATA,'utf8'))
  if(c.documentId!=='cei-1990-decreto-generale-matrimonio-canonico')throw new Error('Canonical CEI inattesa')
  if(c.effectiveFrom!=='1991-02-17')throw new Error('effectiveFrom inatteso')
  if(!c.snapshot?.sha256||!c.snapshot?.sourceUrl||!c.snapshot?.path)throw new Error('Snapshot ufficiale incompleto')
  if(!c.provision||!Array.isArray(c.relations)||c.relations.length!==4)throw new Error('Provision/relations incomplete')

  const sourceFields={
    documentId:c.documentId,title:c.title,shortTitle:c.shortTitle,documentType:c.documentType,issuer:c.issuer,
    issuedAt:c.issuedAt,publishedAt:c.publishedAt,publicationReference:c.publicationReference,effectiveFrom:c.effectiveFrom,
    territorialScope:c.territorialScope,legalForce:c.legalForce,status:c.status,language:c.language,
    officialCitation:c.officialCitation,officialUrl:c.officialUrl,
    snapshot:c.snapshot,canonicalDataVersion:c.canonicalDataVersion,
    notes:'Fonte ufficiale CEI del Decreto generale sul matrimonio canonico; snapshot PDF congelato e identificato con SHA-256.'
  }

  const provisionFields={
    provisionId:c.provision.provisionId,title:c.provision.title,provisionType:c.provision.provisionType,issuer:c.provision.issuer,
    territorialScope:c.provision.territorialScope,legalForce:c.provision.legalForce,effectiveFrom:c.provision.effectiveFrom,
    status:c.provision.status,sourceDocument:ref(SOURCE_ID),summary:c.provision.summary,legalVerification:c.provision.legalVerification,
  }

  const resolved:any[]=[]
  for(const r of c.relations){
    const canon:any=await client.fetch('*[_type=="canon"&&number==$n][0]{_id,number,canonicalId}',{n:r.canon})
    if(!canon||canon.canonicalId!==`cic-1983-can-${r.canon}`)throw new Error(`Can. ${r.canon}: canone non risolto`)
    const relationId=`cei-1990-decreto-matrimonio-${r.relationType}-can-${r.canon}`
    resolved.push({r,canon,relationId,docId:`relation-${relationId}`})
  }

  console.log(`✔ sourceDocument — ${c.title}`)
  console.log(`✔ italianProvision — ${c.provision.title}`)
  resolved.forEach(({r})=>console.log(`✔ legalRelation — ${r.relationType} Can. ${r.canon}`))

  if(!commitMode){
    console.log('✔ DRY RUN COMPLETATO — nessuna scrittura effettuata')
    return
  }

  let tx=client.transaction()
  tx=tx.createIfNotExists({_id:SOURCE_ID,_type:'sourceDocument',...sourceFields}).patch(SOURCE_ID,{set:sourceFields})
  tx=tx.createIfNotExists({_id:PROVISION_ID,_type:'italianProvision',...provisionFields}).patch(PROVISION_ID,{set:provisionFields})
  for(const {r,canon,relationId,docId} of resolved){
    const fields={
      relationId,source:ref(PROVISION_ID),target:ref(canon._id),relationType:r.relationType,authorityLevel:r.authorityLevel,
      validFrom:r.validFrom,sourceDocument:ref(SOURCE_ID),
      officialCitation:`CEI, Decreto generale sul matrimonio canonico — riferimento al can. ${r.canon}`,
      note:`Il Decreto generale sul matrimonio canonico attua in Italia il can. ${r.canon}.`,verified:r.verified,
    }
    tx=tx.createIfNotExists({_id:docId,_type:'legalRelation',...fields}).patch(docId,{set:fields})
  }
  const result=await tx.commit({visibility:'sync'})
  console.log(`✔ Transazione completata — ${result.transactionId}`)

  const check:any=await client.fetch(`{
    "source":*[_id==$source][0]{_type,documentId,effectiveFrom,snapshot},
    "provision":*[_id==$provision][0]{_type,provisionId,effectiveFrom,sourceDocument},
    "relations":*[_type=="legalRelation"&&source._ref==$provision]{relationId,relationType,validFrom,verified,"target":target->{number}}
  }`,{source:SOURCE_ID,provision:PROVISION_ID})

  const errors:string[]=[]
  if(check.source?.documentId!==c.documentId||check.source?.effectiveFrom!==c.effectiveFrom||check.source?.snapshot?.sha256!==c.snapshot.sha256)errors.push('sourceDocument non conforme')
  if(check.provision?.provisionId!==c.provision.provisionId||check.provision?.effectiveFrom!==c.provision.effectiveFrom||check.provision?.sourceDocument?._ref!==SOURCE_ID)errors.push('italianProvision non conforme')
  if(check.relations?.length!==4)errors.push(`legalRelation=${check.relations?.length??0}, attese 4`)
  for(const {r,relationId} of resolved){
    const rel=check.relations?.find((x:any)=>x.relationId===relationId)
    if(!rel||rel.relationType!==r.relationType||rel.validFrom!==r.validFrom||rel.verified!==true||rel.target?.number!==r.canon)errors.push(`relazione non conforme: Can. ${r.canon}`)
  }
  if(errors.length){console.error('\n✖ READ-BACK FALLITO');errors.forEach(e=>console.error(`- ${e}`));process.exit(1)}
  console.log('✔ READ-BACK SUPERATO — 1 sourceDocument · 1 italianProvision · 4 legalRelation')
  console.log('✔ IMPORT CEI MATRIMONIO COMPLETATO')
}

main().catch(e=>{console.error('\n✖ CEI MATRIMONIO FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
