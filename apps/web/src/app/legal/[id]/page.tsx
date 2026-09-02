import Link from "next/link";
import {notFound} from "next/navigation";

const PROJECT_ID="2rq93txn";
const DATASET="production";
const API_VERSION="2026-03-25";

async function loadLegal(id:string){
  const query=`{
    "selected":*[_id==$id][0]{_id,_type,"sourceId":select(_type=="italianProvision"=>sourceDocument._ref,_id)},
    "source":*[_type=="sourceDocument" && _id==*[_id==$id][0].sourceDocument._ref][0]{_id},
    "directSource":*[_type=="sourceDocument" && _id==$id][0]{_id}
  }`;
  const base=new URL(`https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);base.searchParams.set("query",query);base.searchParams.set("$id",JSON.stringify(id));
  const first=await fetch(base,{cache:"no-store"});if(!first.ok)return null;const found=(await first.json()).result;const sourceId=found?.selected?.sourceId||found?.source?._id||found?.directSource?._id;if(!sourceId)return null;
  const mergedQuery=`*[_type=="sourceDocument" && _id==$sourceId][0]{
    _id,_type,title,shortTitle,issuer,status,effectiveFrom,effectiveUntil,officialCitation,officialUrl,sourceText,documentType,territorialScope,legalForce,
    "provision":*[_type=="italianProvision" && sourceDocument._ref==^._id][0]{_id,title,summary,"normativeText":pt::text(normativeText),provisionType,issuer,status,effectiveFrom,effectiveUntil,territorialScope,legalForce,legalVerification},
    "relations":*[_type=="legalRelation" && (sourceDocument._ref==^._id || source._ref==^._id || source._ref in *[_type=="italianProvision" && sourceDocument._ref==^._id]._id || target._ref==^._id)]{
      _id,relationType,note,officialCitation,verified,
      source->{_id,_type,title,editorialTitle,number,provisionId,documentId},
      target->{_id,_type,title,editorialTitle,number,provisionId,documentId}
    }
  }`;
  const url=new URL(`https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);url.searchParams.set("query",mergedQuery);url.searchParams.set("$sourceId",JSON.stringify(sourceId));
  const res=await fetch(url,{cache:"no-store"});if(!res.ok)return null;return (await res.json()).result;
}

function statusLabel(status?:string){return status==="inForce"?"Vigente":status==="amended"?"Modificato":status==="repealed"?"Abrogato":status==="historical"?"Storico":status||""}

export default async function LegalPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const doc=await loadLegal(decodeURIComponent(id));if(!doc)notFound();const p=doc.provision;
  const title=p?.title||doc.title,issuer=p?.issuer||doc.issuer,status=p?.status||doc.status,effectiveFrom=p?.effectiveFrom||doc.effectiveFrom,effectiveUntil=p?.effectiveUntil||doc.effectiveUntil;
  const text=p?.normativeText||doc.sourceText;const relations=Array.from(new Map((doc.relations??[]).map((r:any)=>[r._id,r])).values()) as any[];
  return <main style={{minHeight:"100vh",background:"var(--paper)",color:"var(--ink)"}}>
    <header style={{height:72,display:"flex",alignItems:"center",gap:18,padding:"0 28px",background:"var(--surface)",borderBottom:"1px solid var(--line)"}}><Link href="/" style={{color:"var(--blue)",textDecoration:"none",fontWeight:800}}>← Fonte Iuris</Link><span style={{color:"var(--muted)",fontSize:13}}>Atto normativo</span></header>
    <div style={{maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"minmax(0,1fr) 300px",gap:28,padding:"34px 28px"}}>
      <article style={{background:"var(--surface)",border:"1px solid var(--line)",borderRadius:12,padding:"34px 40px"}}>
        <p style={{margin:"0 0 8px",color:"var(--gold)",fontWeight:800,textTransform:"uppercase",fontSize:12}}>Atto normativo</p>
        <h1 style={{fontFamily:"Georgia,serif",color:"var(--blue)",fontSize:"2rem",margin:"0 0 10px"}}>{title}</h1>
        <p style={{color:"var(--muted)",margin:"0 0 28px"}}>{[issuer,statusLabel(status),effectiveFrom?`in vigore dal ${effectiveFrom}`:null].filter(Boolean).join(" · ")}</p>
        {p?.summary&&<section style={{padding:"16px 18px",background:"var(--surface2)",borderRadius:9,marginBottom:28}}><strong>Sintesi</strong><p style={{lineHeight:1.65}}>{p.summary}</p></section>}
        <section><h2 style={{fontFamily:"Georgia,serif",color:"var(--blue)"}}>Testo ufficiale</h2>{text?<div style={{whiteSpace:"pre-wrap",fontFamily:"Georgia,serif",fontSize:"1.05rem",lineHeight:1.72}}>{text}</div>:<p style={{color:"var(--muted)"}}>Testo ufficiale non ancora acquisito nel corpus.</p>}</section>
      </article>
      <aside>
        <section style={{background:"var(--surface)",border:"1px solid var(--line)",borderRadius:10,padding:18,marginBottom:16}}><h3 style={{marginTop:0}}>Dati giuridici</h3>{doc.officialCitation&&<p><b>Citazione</b><br/>{doc.officialCitation}</p>}{effectiveFrom&&<p><b>Vigenza</b><br/>dal {effectiveFrom}{effectiveUntil?` al ${effectiveUntil}`:""}</p>}{(p?.territorialScope||doc.territorialScope)&&<p><b>Ambito</b><br/>{p?.territorialScope||doc.territorialScope}</p>}{(p?.legalForce||doc.legalForce)&&<p><b>Forza</b><br/>{p?.legalForce||doc.legalForce}</p>}</section>
        {relations.length>0&&<section style={{background:"var(--surface)",border:"1px solid var(--line)",borderRadius:10,padding:18}}><h3 style={{marginTop:0}}>Relazioni normative</h3>{relations.map((r:any)=><div key={r._id} style={{padding:"10px 0",borderTop:"1px solid var(--line)"}}><b>{r.relationType}</b><p style={{margin:"5px 0",fontSize:13}}>{r.target?.number?<>Can. <Link href={`/?can=${r.target.number}`}>{r.target.number}</Link></>:r.source?.number?<>Can. <Link href={`/?can=${r.source.number}`}>{r.source.number}</Link></>:r.note||r.officialCitation||"Relazione registrata"}</p></div>)}</section>}
        {doc.officialUrl&&<p style={{fontSize:12,color:"var(--muted)",marginTop:16}}>La fonte ufficiale esterna resta disponibile solo come riferimento secondario.</p>}
      </aside>
    </div>
  </main>
}
