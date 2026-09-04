import LegalCorpusShell from "../LegalCorpusShell";
import MaterieBrowser from "./MaterieBrowser";

const PROJECT_ID="2rq93txn";
const DATASET="production";
const API_VERSION="2026-03-25";

type Concept={_id:string;label:string;slug?:{current:string};definition:string;synonyms?:string[];broaderConcept?:{_id:string;label:string;slug?:{current:string};broaderConcept?:{_id:string;label:string;slug?:{current:string}}|null}|null;relatedCanons?:Array<{_id:string;number:number;editorialTitle?:string}>};

async function loadConcepts():Promise<Concept[]>{
  const query=`*[_type=="legalConcept"]|order(label asc){_id,label,slug,definition,synonyms,"broaderConcept":broaderConcept->{_id,label,slug,"broaderConcept":broaderConcept->{_id,label,slug}},"relatedCanons":relatedCanons[]->{_id,number,editorialTitle}}`;
  const url=new URL(`https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);
  url.searchParams.set("query",query);
  const res=await fetch(url,{cache:"no-store"});
  if(!res.ok)throw new Error("Corpus materie non disponibile");
  return (await res.json()).result??[];
}

export default async function MateriePage(){
  const concepts=await loadConcepts();
  return <LegalCorpusShell section="Navigazione tematica" activeSection="materie"><MaterieBrowser concepts={concepts}/></LegalCorpusShell>;
}
