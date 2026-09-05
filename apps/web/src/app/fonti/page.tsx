import LegalCorpusShell from "../LegalCorpusShell";
import FontiBrowser,{type Source} from "./FontiBrowser";

const PROJECT_ID="2rq93txn";
const DATASET="production";
const API_VERSION="2026-03-25";

async function loadSources():Promise<Source[]>{
 const query=`*[_type=="sourceDocument"]|order(effectiveFrom desc,title asc){_id,title,shortTitle,documentType,issuer,status,effectiveFrom,effectiveUntil,officialCitation,territorialScope,legalForce,"summary":(*[_type=="italianProvision" && sourceDocument._ref==^._id][0].summary),"relations":*[_type=="legalRelation" && (sourceDocument._ref==^._id || source._ref==^._id || source._ref in *[_type=="italianProvision" && sourceDocument._ref==^._id]._id || target._ref==^._id)]{relationType,"targetNumber":target->number,"sourceNumber":source->number}}`;
 const url=new URL(`https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);url.searchParams.set("query",query);
 const res=await fetch(url,{cache:"no-store"});if(!res.ok)throw new Error("Corpus fonti non disponibile");const result=(await res.json()).result??[];return result.map((s:any)=>({...s,relationCount:s.relations?.length??0}));
}

export default async function FontiPage(){const sources=await loadSources();return <LegalCorpusShell section="Corpus normativo">
 <div style={{maxWidth:1280,margin:"0 auto",padding:"34px 28px"}}>
  <p style={{margin:0,color:"var(--gold)",fontWeight:800,textTransform:"uppercase",fontSize:12}}>Fonti normative</p>
  <h1 style={{fontFamily:"Georgia,serif",color:"var(--blue)",fontSize:"2.2rem",margin:"8px 0"}}>Ricostruisci la disciplina vigente attraverso le fonti</h1>
  <section style={{maxWidth:980,margin:"18px 0 24px",padding:"20px 22px",borderLeft:"3px solid var(--gold)",background:"var(--surface)"}}>
   <h2 style={{font:"700 1.15rem Georgia,serif",color:"var(--blue)",margin:"0 0 10px"}}>Come funziona la consultazione delle fonti normative</h2>
   <p style={{fontSize:13,lineHeight:1.7,margin:"0 0 10px"}}>Il Codice di Diritto Canonico costituisce il riferimento centrale, ma la disciplina vigente non si esaurisce nel testo codiciale. Atti successivi possono <strong>modificare, integrare, specificare, attuare o derogare</strong> disposizioni del Codice.</p>
   <p style={{fontSize:13,lineHeight:1.7,margin:"0 0 10px"}}>Questa sezione raccoglie gli atti già acquisiti nel corpus e consente di leggerli dentro Fonte Iuris insieme a <strong>vigenza, autorità emanante, provenienza ufficiale e relazioni normative</strong>.</p>
   <p style={{fontSize:13,lineHeight:1.7,margin:0}}><strong>La fonte non è presentata come documento isolato:</strong> il suo valore emerge dal rapporto con il CIC e con gli altri atti che concorrono a formare la disciplina applicabile.</p>
  </section>
  <FontiBrowser sources={sources}/>
  <p style={{color:"var(--muted)",fontSize:12,marginTop:22}}>{sources.length} atti documentali presenti nel corpus.</p>
 </div>
 </LegalCorpusShell>}
