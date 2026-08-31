import {createHash} from 'node:crypto'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'

type Segment={
  id:string
  type:'paragraph'|'number'
  label:string
  order:number
  parentId?:string
  startOffset:number
  endOffset:number
}

type Canon={number:number;text:string;segments:Segment[]}

const FROM=1
const TO=367
const EXPECTED=367

function normalizeNewlines(value:string){return value.replace(/\r\n?/g,'\n').normalize('NFC')}

function addNumbers(result:Segment[],canon:number,text:string,baseOffset:number,absoluteEnd:number,parentId?:string){
  const numbers=[...text.matchAll(/^(\d+)\s*[°º)]\s*/gm)]
  for(let i=0;i<numbers.length;i++){
    const match=numbers[i]
    const number=Number(match[1])
    const startOffset=baseOffset+(match.index??0)
    const endOffset=numbers[i+1]?baseOffset+(numbers[i+1].index??text.length):absoluteEnd
    const prefix=parentId?`${parentId}-num`:`can-${canon}-num`
    result.push({id:`${prefix}-${number}`,type:'number',label:`${number}°`,order:number,...(parentId?{parentId}:{}),startOffset,endOffset})
  }
}

function compileSegments(canon:number,text:string):Segment[]{
  const result:Segment[]=[]
  const paragraphs=[...text.matchAll(/^§\s*(\d+)\s*[.:]?\s*/gm)]
  if(!paragraphs.length){addNumbers(result,canon,text,0,text.length);return result}
  for(let i=0;i<paragraphs.length;i++){
    const match=paragraphs[i]
    const number=Number(match[1])
    const startOffset=match.index??0
    const endOffset=paragraphs[i+1]?.index??text.length
    const parentId=`can-${canon}-par-${number}`
    result.push({id:parentId,type:'paragraph',label:`§ ${number}`,order:number,startOffset,endOffset})
    addNumbers(result,canon,text.slice(startOffset,endOffset),startOffset,endOffset,parentId)
  }
  return result
}

function splitCanons(source:string):Canon[]{
  const marker=/^@@CANON\s+(\d+)\s*$/gm
  const matches=[...source.matchAll(marker)]
  const canons:Canon[]=[]
  for(let i=0;i<matches.length;i++){
    const current=matches[i]
    const number=Number(current[1])
    const bodyStart=(current.index??0)+current[0].length
    const bodyEnd=matches[i+1]?.index??source.length
    let text=source.slice(bodyStart,bodyEnd).trim().replace(/\n?@@END\s*$/m,'').trim()
    canons.push({number,text,segments:compileSegments(number,text)})
  }
  return canons
}

async function main(){
  const sourcePath=resolve('scripts/cic-canonical/source/canoni-1-367.source.txt')
  const outputPath=resolve('scripts/cic-canonical/build/canoni-1-367.json')
  const raw=normalizeNewlines(await readFile(sourcePath,'utf8'))
  const sha256=createHash('sha256').update(raw).digest('hex')
  const canons=splitCanons(raw)
  const payload={schemaVersion:1,corpus:'cic-1983',language:'it',range:{from:FROM,to:TO},expectedCanons:EXPECTED,source:{authority:'Santa Sede',indexUrl:'https://www.vatican.va/archive/cod-iuris-canonici/cic_index_it.html',sha256},canons}
  await mkdir(dirname(outputPath),{recursive:true})
  await writeFile(outputPath,JSON.stringify(payload,null,2)+'\n','utf8')
  console.log(`CANONICAL_1_367_BUILD ${canons.length}/${EXPECTED}`)
  console.log(`SOURCE_SHA256 ${sha256}`)
}

main().catch(error=>{console.error(error);process.exitCode=1})
