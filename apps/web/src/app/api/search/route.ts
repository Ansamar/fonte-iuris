import {NextRequest, NextResponse} from "next/server";

const PROJECT_ID = "2rq93txn";
const DATASET = "production";
const API_VERSION = "2026-03-25";
const SANITY_QUERY_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`;

async function sanity<T>(query:string, params:Record<string,string|number> = {}):Promise<T>{
  const url = new URL(SANITY_QUERY_URL);
  url.searchParams.set("query",query);
  for(const [key,value] of Object.entries(params)) url.searchParams.set(`$${key}`,JSON.stringify(value));
  const response = await fetch(url,{cache:"no-store"});
  if(!response.ok) throw new Error(`Corpus API ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  return payload.result as T;
}

function normalize(value?:string){return (value??"").toLocaleLowerCase("it").normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function excerpt(text:string|undefined,query:string){const clean=(text??"").replace(/\s+/g," ").trim();if(!clean)return "";const hay=normalize(clean),needle=normalize(query),hit=hay.indexOf(needle),start=hit<0?0:Math.max(0,hit-55),end=Math.min(clean.length,start+185);return `${start>0?"…":""}${clean.slice(start,end).trim()}${end<clean.length?"…":""}`;}

type CanonRow={_id:string;number:number;editorialTitle?:string;status?:string;keywords?:string[];text?:string;structure?:any};
type ItalianRow={_id:string;provisionId:string;title:string;provisionType?:string;issuer?:string;status?:string;summary?:string;text?:string;effectiveFrom?:string;sourceTitle?:string};
type SourceRow={_id:string;documentId:string;title:string;shortTitle?:string;documentType?:string;issuer?:string;status?:string;sourceText?:string;effectiveFrom?:string;territorialScope?:string};
type RelationRow={_id:string;relationId:string;relationType:string;verified?:boolean;note?:string;officialCitation?:string;source?:any;target?:any};
function structureTitles(row:CanonRow){const titles:string[]=[];let current=row.structure;while(current){if(current.title)titles.unshift(current.title);current=current.parent;}return titles;}
function canonScore(row:CanonRow,q:string){const needle=normalize(q),title=normalize(row.editorialTitle),path=normalize(structureTitles(row).join(" ")),keys=normalize((row.keywords??[]).join(" ")),text=normalize(row.text);let score=0;if(title===needle)score+=95;else if(title.includes(needle))score+=48;if(keys.includes(needle))score+=36;if(path.includes(needle))score+=30;if(text.includes(needle))score+=12;if(needle==="matrimonio"&&row.number>=1055&&row.number<=1165)score+=18;if(needle==="matrimonio"&&row.number===1055)score+=45;return score;}

export async function GET(request:NextRequest){
 try{
  const q=request.nextUrl.searchParams.get("q")?.trim();if(!q)return NextResponse.json({results:[]});const term=`*${q.toLowerCase()}*`;
  const [canons,italian,documents,relations]=await Promise.all([
   sanity<CanonRow[]>(`*[_type=="canon" && (lower(coalesce(editorialTitle,"")) match $term || keywords[] match $term || structuralUnit->title match $term || structuralUnit->parent->title match $term || structuralUnit->parent->parent->title match $term || _id in *[_type=="canonVersion" && language=="it" && status=="current" && pt::text(fullText) match $term].canon._ref)][0...160]{_id,number,editorialTitle,keywords,status,"text":pt::text(((*[_type=="canonVersion" && canon._ref==^._id && language=="it" && status=="current"]|order(validFrom desc))[0]).fullText),"structure":structuralUnit->{title,"parent":parent->{title,"parent":parent->{title,"parent":parent->{title,"parent":parent->{title}}}}}}`,{term}),
   sanity<ItalianRow[]>(`*[_type=="italianProvision" && (lower(coalesce(title,"")) match $term || lower(coalesce(summary,"")) match $term || pt::text(normativeText) match $term || lower(coalesce(issuer,"")) match $term || lower(coalesce(provisionLocator,"")) match $term)][0...80]{_id,provisionId,title,provisionType,issuer,status,summary,effectiveFrom,"text":pt::text(normativeText),"sourceTitle":sourceDocument->title}`,{term}),
   sanity<SourceRow[]>(`*[_type=="sourceDocument" && (lower(coalesce(title,"")) match $term || lower(coalesce(shortTitle,"")) match $term || lower(coalesce(sourceText,"")) match $term || lower(coalesce(issuer,"")) match $term || lower(coalesce(officialCitation,"")) match $term)][0...80]{_id,documentId,title,shortTitle,documentType,issuer,status,sourceText,effectiveFrom,territorialScope}`,{term}),
   sanity<RelationRow[]>(`*[_type=="legalRelation" && (lower(coalesce(note,"")) match $term || lower(coalesce(officialCitation,"")) match $term || lower(coalesce(relationId,"")) match $term || source->title match $term || target->title match $term)][0...60]{_id,relationId,relationType,note,officialCitation,verified,"source":source->{_id,_type,"title":coalesce(title,editorialTitle,documentId,provisionId),number},"target":target->{_id,_type,"title":coalesce(title,editorialTitle,documentId,provisionId),number}}`,{term})
  ]);
  const results:any[]=[];
  for(const row of canons){const titles=structureTitles(row);results.push({_id:row._id,resultType:"canon",label:"Canone",number:row.number,title:`Can. ${row.number}${row.editorialTitle?` · ${row.editorialTitle}`:""}`,subtitle:titles.slice(-3).join(" · "),snippet:excerpt(row.text,q),status:row.status,matchReason:titles.some(t=>normalize(t).includes(normalize(q)))?"Collocazione sistematica":(row.keywords??[]).some(k=>normalize(k).includes(normalize(q)))?"Materia indicizzata":"Testo normativo",score:canonScore(row,q)});}
  for(const row of italian){const needle=normalize(q),title=normalize(row.title),summary=normalize(row.summary),text=normalize(row.text);let score=55;if(title===needle)score+=90;else if(title.includes(needle))score+=60;if(summary.includes(needle))score+=25;if(text.includes(needle))score+=18;results.push({_id:row._id,resultType:"italianProvision",label:"Fonte italiana",title:row.title,subtitle:[row.issuer,row.sourceTitle].filter(Boolean).join(" · "),snippet:excerpt(row.summary||row.text,q),status:row.status,effectiveFrom:row.effectiveFrom,matchReason:"Normativa italiana",score});}
  for(const row of documents){const needle=normalize(q),title=normalize(row.title),body=normalize(row.sourceText);let score=45;if(title===needle)score+=85;else if(title.includes(needle))score+=55;if(body.includes(needle))score+=16;results.push({_id:row._id,resultType:"sourceDocument",label:"Documento",title:row.title,subtitle:[row.issuer,row.documentType,row.territorialScope==="italy"?"Italia":undefined].filter(Boolean).join(" · "),snippet:excerpt(row.sourceText,q),status:row.status,effectiveFrom:row.effectiveFrom,matchReason:"Fonte documentale",score});}
  for(const row of relations){results.push({_id:row._id,resultType:"legalRelation",label:"Relazione normativa",title:row.relationId,subtitle:[row.source?.title,row.relationType,row.target?.number?`Can. ${row.target.number}`:row.target?.title].filter(Boolean).join(" → "),snippet:excerpt(row.note||row.officialCitation,q),matchReason:row.verified?"Relazione verificata":"Relazione registrata",score:35});}
  results.sort((a,b)=>b.score-a.score||(a.number??99999)-(b.number??99999)||String(a.title).localeCompare(String(b.title),"it"));
  return NextResponse.json({results:results.slice(0,60),counts:{canons:canons.length,italianProvisions:italian.length,sourceDocuments:documents.length,legalRelations:relations.length}});
 }catch(error){console.error(error);return NextResponse.json({error:"Non riesco a eseguire la ricerca giuridica"},{status:502});}
}
