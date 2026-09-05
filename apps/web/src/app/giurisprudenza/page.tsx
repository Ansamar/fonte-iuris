import LegalCorpusShell from "../LegalCorpusShell";
import DocumentCorpusBrowser,{type CorpusDocument} from "../DocumentCorpusBrowser";

const PROJECT_ID="2rq93txn",DATASET="production",API_VERSION="2026-03-25";

async function loadDocuments():Promise<CorpusDocument[]>{
 const query=`*[_type=="sourceDocument" && legalForce=="practice"]|order(issuedAt desc,title asc){_id,title,shortTitle,documentType,issuer,issuedAt,publishedAt,officialCitation,territorialScope,legalForce,"summary":notes,"relationCount":count(*[_type=="legalRelation" && (sourceDocument._ref==^._id || source._ref==^._id || target._ref==^._id)]),"canonNumbers":array::unique(*[_type=="legalRelation" && (sourceDocument._ref==^._id || source._ref==^._id || target._ref==^._id)][]{"n":select(source->number!=null=>source->number,target->number!=null=>target->number)}.n)}`;
 const url=new URL(`https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);url.searchParams.set("query",query);
 const res=await fetch(url,{cache:"no-store"});if(!res.ok)throw new Error("Corpus giurisprudenziale non disponibile");return (await res.json()).result??[];
}

export default async function GiurisprudenzaPage(){const documents=await loadDocuments();return <LegalCorpusShell section="Giurisprudenza e prassi" activeSection="giurisprudenza"><div style={{maxWidth:1280,margin:"0 auto",padding:"34px 28px"}}>
 <p style={{margin:0,color:"var(--gold)",fontWeight:800,textTransform:"uppercase",fontSize:12}}>Giurisprudenza e prassi</p>
 <h1 style={{fontFamily:"Georgia,serif",color:"var(--blue)",fontSize:"2.2rem",margin:"8px 0"}}>Segui come il diritto viene interpretato e applicato</h1>
 <section style={{maxWidth:980,margin:"18px 0 24px",padding:"20px 22px",borderLeft:"3px solid var(--gold)",background:"var(--surface)"}}>
  <h2 style={{font:"700 1.15rem Georgia,serif",color:"var(--blue)",margin:"0 0 10px"}}>Come leggere giurisprudenza e prassi</h2>
  <p style={{fontSize:13,lineHeight:1.7,margin:"0 0 10px"}}>Le decisioni dei tribunali ecclesiastici e le prassi applicative mostrano come le norme vengono interpretate nei casi concreti. <strong>Non coincidono però automaticamente con una norma generale</strong> e devono essere valutate secondo autorità, competenza, natura e contesto.</p>
  <p style={{fontSize:13,lineHeight:1.7,margin:"0 0 10px"}}>Fonte Iuris distingue la <strong>norma vigente</strong> dalla sua elaborazione giurisprudenziale e dalla prassi, collegando ogni elemento ai canoni e alle materie pertinenti senza trasformare un orientamento applicativo in fonte normativa.</p>
  <p style={{fontSize:13,lineHeight:1.7,margin:0}}><strong>La funzione di questa sezione è ricostruttiva:</strong> consente di vedere come una disposizione è stata letta, precisata o applicata, mantenendo visibile il diverso valore giuridico delle fonti.</p>
 </section>
 <DocumentCorpusBrowser documents={documents} kind="practice"/>
 <p style={{color:"var(--muted)",fontSize:12,marginTop:22}}>{documents.length} documenti di giurisprudenza o prassi presenti nel corpus.</p>
 </div></LegalCorpusShell>}
