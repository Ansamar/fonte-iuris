import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'

type Segment={id:string;type:'paragraph'|'number'|'letter'|'clause';label:string;order:number;parentId?:string;startOffset:number;endOffset:number}
type Canon={number:number;text:string;segments:Segment[]}
type Book={canons:Canon[]}

const SOURCE_URL='https://www.vatican.va/archive/cod-iuris-canonici/cic_index_it.html'
const AMENDED_CANONS=new Set([111,112,230,237,242,265,295,296])

function unit(n:number){
 if(n<=6)return'cic-1983-book-1'
 const simple:[number,number,string][]=[[7,22,'title-1'],[23,28,'title-2'],[29,34,'title-3'],[94,95,'title-5'],[124,128,'title-7'],[129,144,'title-8'],[197,199,'title-10'],[200,203,'title-11']]
 for(const [a,b,id] of simple)if(n>=a&&n<=b)return`cic-1983-book-1-${id}`
 const ranges:[number,number,string][]=[
 [35,47,'book-1-title-4-chapter-1'],[48,58,'book-1-title-4-chapter-2'],[59,75,'book-1-title-4-chapter-3'],[76,84,'book-1-title-4-chapter-4'],[85,93,'book-1-title-4-chapter-5'],
 [96,112,'book-1-title-6-chapter-1'],[113,123,'book-1-title-6-chapter-2'],
 [145,156,'book-1-title-9-chapter-1'],[157,157,'book-1-title-9-chapter-1-article-1'],[158,163,'book-1-title-9-chapter-1-article-2'],[164,179,'book-1-title-9-chapter-1-article-3'],[180,183,'book-1-title-9-chapter-1-article-4'],[184,186,'book-1-title-9-chapter-2'],[187,189,'book-1-title-9-chapter-2-article-1'],[190,191,'book-1-title-9-chapter-2-article-2'],[192,195,'book-1-title-9-chapter-2-article-3'],[196,196,'book-1-title-9-chapter-2-article-4'],
 [204,207,'book-2-part-1'],[208,223,'book-2-part-1-title-1'],[224,231,'book-2-part-1-title-2'],[232,264,'book-2-part-1-title-3-chapter-1'],[265,272,'book-2-part-1-title-3-chapter-2'],[273,289,'book-2-part-1-title-3-chapter-3'],[290,293,'book-2-part-1-title-3-chapter-4'],[294,297,'book-2-part-1-title-4'],[298,311,'book-2-part-1-title-5-chapter-1'],[312,320,'book-2-part-1-title-5-chapter-2'],[321,326,'book-2-part-1-title-5-chapter-3'],[327,329,'book-2-part-1-title-5-chapter-4'],
 [330,330,'book-2-part-2-section-1-chapter-1'],[331,335,'book-2-part-2-section-1-chapter-1-article-1'],[336,341,'book-2-part-2-section-1-chapter-1-article-2'],[342,348,'book-2-part-2-section-1-chapter-2'],[349,359,'book-2-part-2-section-1-chapter-3'],[360,361,'book-2-part-2-section-1-chapter-4'],[362,367,'book-2-part-2-section-1-chapter-5']]
 for(const [a,b,id] of ranges)if(n>=a&&n<=b)return`cic-1983-${id}`
 throw new Error(`Nessuna struttura per can. ${n}`)
}

async function main(){
 const input=resolve('scripts/cic-canonical/build/canoni-1-367.json');const output=resolve('scripts/import-cic/data/canons.1-367.canonical.ts')
 const book=JSON.parse(await readFile(input,'utf8')) as Book
 const canons=book.canons.map(c=>({number:c.number,structuralUnitCanonicalId:unit(c.number),status:AMENDED_CANONS.has(c.number)?'amended':'inForce',versions:[{versionId:`cic-1983-can-${c.number}-it-current`,versionLabel:'Testo vigente — fonte ufficiale della Santa Sede',status:'current',language:'it',text:c.text,sourceDocumentTitle:'Codice di Diritto Canonico',sourceCitation:`Codice di Diritto Canonico, can. ${c.number}`,sourceUrl:SOURCE_URL,segments:c.segments.map(s=>({segmentId:s.id,segmentType:s.type,label:s.label,order:s.order,...(s.parentId?{parentSegmentId:s.parentId}:{}),startOffset:s.startOffset,endOffset:s.endOffset,isFormalDivision:true}))}]}))
 await mkdir(dirname(output),{recursive:true});await writeFile(output,`import type {CanonInput} from '../types'\n\nexport const canons1to367Canonical: CanonInput[] = ${JSON.stringify(canons,null,2)}\n`,'utf8')
 console.log(`IMPORT_SOURCE_1_367_OK ${canons.length}/367`)
}
main().catch(e=>{console.error(e);process.exitCode=1})
