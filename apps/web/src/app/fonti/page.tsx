import LegalCorpusShell from "../LegalCorpusShell";
import FontiBrowser,{type Source} from "./FontiBrowser";

const PROJECT_ID="2rq93txn";
const DATASET="production";
const API_VERSION="2026-03-25";

async function loadSources():Promise<Source[]>{
 const query=`*[_type=="sourceDocument"]|order(effectiveFrom desc,title asc){_id,title,shortTitle,documentType,issuer,status,effectiveFrom,effectiveUntil,officialCitation,territorialScope,legalForce,"summary":(*[_type=="italianProvision" && sourceDocument._ref==^._id][0].summary),"relationCount":count(*[_type=="legalRelation" && (sourceDocument._ref==^._id || source._ref==^._id || target._ref==^._id)])}`;
 const url=new URL(`https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);url.searchParams.set("query",query);
 const res=await fetch(url,{cache:"no-store"});if(!res.ok)throw new Error("Corpus fonti non disponibile");return (await res.json()).result??[];
}

export default async function FontiPage(){const sources=await loadSources();return <LegalCorpusShell section="Corpus normativo">
 <div style={{maxWidth:1280,margin:"0 auto",padding:"34px 28px"}}>
  <p style={{margin:0,color:"var(--gold)",fontWeight:800,textTransform:"uppercase",fontSize:12}}>Fonti normative</p>
  <h1 style={{fontFamily:"Georgia,serif",color:"var(--blue)",fontSize:"2.2rem",margin:"8px 0"}}>Corpus delle fonti normative</h1>
  <p style={{maxWidth:760,color:"var(--muted)",lineHeight:1.6,margin:"0 0 28px"}}>Atti universali e fonti applicabili in Italia già acquisiti nel corpus. Ogni atto è consultabile integralmente dentro Fonte Iuris, con vigenza, provenienza e relazioni con i canoni.</p>
  <FontiBrowser sources={sources}/>
  <p style={{color:"var(--muted)",fontSize:12,marginTop:22}}>{sources.length} atti documentali presenti nel corpus.</p>
 </div>
 </LegalCorpusShell>}
