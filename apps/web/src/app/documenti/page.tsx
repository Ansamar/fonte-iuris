import LegalCorpusShell from "../LegalCorpusShell";
import DocumentCorpusBrowser,{type CorpusDocument} from "../DocumentCorpusBrowser";

const PROJECT_ID="2rq93txn",DATASET="production",API_VERSION="2026-03-25";

async function loadDocuments():Promise<CorpusDocument[]>{
 const query=`*[_type=="sourceDocument" && (legalForce=="pastoral" || documentType=="pastoralDocument")]|order(issuedAt desc,title asc){_id,title,shortTitle,documentType,issuer,issuedAt,publishedAt,officialCitation,territorialScope,legalForce,"summary":notes,"relationCount":count(*[_type=="legalRelation" && (sourceDocument._ref==^._id || source._ref==^._id || target._ref==^._id)]),"canonNumbers":array::unique(*[_type=="legalRelation" && (sourceDocument._ref==^._id || source._ref==^._id || target._ref==^._id)][]{"n":select(source->number!=null=>source->number,target->number!=null=>target->number)}.n)}`;
 const url=new URL(`https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);url.searchParams.set("query",query);
 const res=await fetch(url,{cache:"no-store"});if(!res.ok)throw new Error("Corpus pastorale non disponibile");return (await res.json()).result??[];
}

export default async function DocumentiPastoraliPage(){const documents=await loadDocuments();return <LegalCorpusShell section="Documenti pastorali" activeSection="documenti"><div style={{maxWidth:1280,margin:"0 auto",padding:"34px 28px"}}>
 <p style={{margin:0,color:"var(--gold)",fontWeight:800,textTransform:"uppercase",fontSize:12}}>Documenti pastorali</p>
 <h1 style={{fontFamily:"Georgia,serif",color:"var(--blue)",fontSize:"2.2rem",margin:"8px 0"}}>Comprendi l’applicazione pastorale del diritto</h1>
 <section style={{maxWidth:980,margin:"18px 0 24px",padding:"20px 22px",borderLeft:"3px solid var(--gold)",background:"var(--surface)"}}>
  <h2 style={{font:"700 1.15rem Georgia,serif",color:"var(--blue)",margin:"0 0 10px"}}>Come leggere i documenti pastorali</h2>
  <p style={{fontSize:13,lineHeight:1.7,margin:"0 0 10px"}}>I documenti pastorali aiutano a comprendere come la disciplina canonica viene presentata, applicata e inserita nella vita ecclesiale. <strong>Non devono però essere confusi automaticamente con una fonte normativa:</strong> il loro valore dipende dalla natura del documento, dall’autorità che lo emana e dal contenuto concreto.</p>
  <p style={{fontSize:13,lineHeight:1.7,margin:"0 0 10px"}}>Fonte Iuris li mantiene quindi distinti dal corpus delle fonti normative, ma li collega ai <strong>canoni, alle materie e agli atti</strong> ai quali offrono orientamento pastorale o applicativo.</p>
  <p style={{fontSize:13,lineHeight:1.7,margin:0}}><strong>Il documento pastorale non sostituisce la norma:</strong> serve a comprenderne il contesto ecclesiale, l’applicazione e le implicazioni operative.</p>
 </section>
 <DocumentCorpusBrowser documents={documents} kind="pastoral"/>
 <p style={{color:"var(--muted)",fontSize:12,marginTop:22}}>{documents.length} documenti pastorali presenti nel corpus.</p>
 </div></LegalCorpusShell>}
