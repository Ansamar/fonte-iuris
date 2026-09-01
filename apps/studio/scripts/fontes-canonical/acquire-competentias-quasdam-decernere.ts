import {createHash} from 'node:crypto'
import {mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere')
const ACT_URL='https://www.vatican.va/content/francesco/it/motu_proprio/documents/20220211-motu-proprio-assegnare-alcune-competenze.html'

function normalizeHtmlText(value:string){return value.replace(/&nbsp;|&#160;|&#xA0;/gi,' ').replace(/&sect;|&#167;|&#xA7;/gi,'§').replace(/&rsquo;|&#8217;|&#x2019;/gi,'’').replace(/<[^>]+>/g,' ').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim().toLocaleLowerCase('it')}

async function main(){
 await mkdir(ROOT,{recursive:true})
 console.log('\nACQUISIZIONE COMPETENTIAS QUASDAM DECERNERE — FONTE UFFICIALE')
 const response=await fetch(ACT_URL,{headers:{'user-agent':'Fonte-Iuris/1.0 canonical-source-acquisition'}})
 if(!response.ok)throw new Error(`act: acquisizione fallita HTTP ${response.status}`)
 const html=await response.text();const searchable=normalizeHtmlText(html)
 const markers=['Competentias quasdam decernere','Art. 1','can. 237 § 2','can. 242 § 1','can. 265','can. 604','can. 686 § 1','can. 688 § 2','699 § 2','Can. 700','can. 775 § 2','Can. 1308','Can. 1310','entrando in vigore il 15 febbraio 2022','11 febbraio dell’anno 2022']
 for(const marker of markers)if(!searchable.includes(normalizeHtmlText(marker)))throw new Error(`act: fonte inattesa, manca ${marker}`)
 const sha256=createHash('sha256').update(html,'utf8').digest('hex')
 const path='act.official.html';await writeFile(join(ROOT,path),html,'utf8')
 const manifest={documentId:'francis-2022-competentias-quasdam-decernere',sources:[{key:'act',sourceUrl:ACT_URL,capturedAt:new Date().toISOString(),sha256,path:`scripts/fontes-canonical/data/competentias-quasdam-decernere/${path}`}]}
 await writeFile(join(ROOT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n','utf8')
 console.log(`✔ act: sha256=${sha256}`)
 console.log('✔ COMPETENTIAS QUASDAM DECERNERE SOURCE OK — fonte ufficiale congelata')
}
main().catch(e=>{console.error('\n✖ ACQUISIZIONE COMPETENTIAS QUASDAM DECERNERE FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
