import LegalCorpusShell from "../LegalCorpusShell";
import JurisprudenceBrowser,{type JurisprudenceDecision} from "./JurisprudenceBrowser";

const PROJECT_ID="2rq93txn",DATASET="production",API_VERSION="2026-03-25";

async function loadDecisions():Promise<JurisprudenceDecision[]>{
 const query=`*[_type=="jurisprudentialDecision"]|order(decisionDate desc,title asc){_id,title,tribunal,tribunalLevel,decisionType,decisionDate,protocolNumber,officialCitation,causeType,caseLabel,ratioSummary,proceduralOutcome,publicationStatus,"canonNumbers":relatedCanons[]->number,"holdingCount":count(holdings)}`;
 const url=new URL(`https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);url.searchParams.set("query",query);
 const res=await fetch(url,{cache:"no-store"});if(!res.ok)throw new Error("Corpus giurisprudenziale non disponibile");return (await res.json()).result??[];
}

export default async function GiurisprudenzaPage(){const decisions=await loadDecisions();return <LegalCorpusShell section="Giurisprudenza e prassi" activeSection="giurisprudenza"><div style={{maxWidth:1280,margin:"0 auto",padding:"34px 28px"}}>
 <p style={{margin:0,color:"var(--gold)",fontWeight:800,textTransform:"uppercase",fontSize:12}}>Giurisprudenza e prassi</p>
 <h1 style={{fontFamily:"Georgia,serif",color:"var(--blue)",fontSize:"2.2rem",margin:"8px 0"}}>Segui come il diritto viene interpretato e applicato</h1>
 <section style={{maxWidth:980,margin:"18px 0 24px",padding:"20px 22px",borderLeft:"3px solid var(--gold)",background:"var(--surface)"}}>
  <h2 style={{font:"700 1.15rem Georgia,serif",color:"var(--blue)",margin:"0 0 10px"}}>Come leggere la giurisprudenza</h2>
  <p style={{fontSize:13,lineHeight:1.7,margin:"0 0 10px"}}>Fonte Iuris tratta la <strong>decisione</strong> come entità giurisprudenziale distinta dal documento che ne conserva testo e provenienza. Tribunale, data, protocollo, questione decisa, ratio e collegamenti ai canoni restano così interrogabili separatamente.</p>
  <p style={{fontSize:13,lineHeight:1.7,margin:"0 0 10px"}}>Le decisioni mostrano come il diritto viene interpretato e applicato nei casi concreti, ma <strong>non sono automaticamente norme generali o precedenti vincolanti</strong>. Il loro peso deve essere valutato secondo autorità, competenza, natura e contesto.</p>
  <p style={{fontSize:13,lineHeight:1.7,margin:0}}><strong>Puoi partire anche dal Codice:</strong> inserendo il numero di un canone ricostruisci le decisioni del corpus che lo richiamano o applicano.</p>
 </section>
 <JurisprudenceBrowser decisions={decisions}/>
 <p style={{color:"var(--muted)",fontSize:12,marginTop:22}}>{decisions.length} decisioni strutturate presenti nel corpus giurisprudenziale.</p>
 </div></LegalCorpusShell>}
