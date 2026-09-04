"use client";

import Link from "next/link";
import {useMemo,useState} from "react";

type CanonRef={_id:string;number:number;editorialTitle?:string};
type Concept={_id:string;label:string;slug?:{current:string};definition:string;synonyms?:string[];broaderConcept?:{_id:string;label:string}|null;relatedCanons?:CanonRef[]};

export default function MaterieBrowser({concepts}:{concepts:Concept[]}){
  const [query,setQuery]=useState("");
  const normalized=query.trim().toLocaleLowerCase("it");
  const filtered=useMemo(()=>concepts.filter(c=>{
    if(!normalized)return true;
    const hay=[c.label,c.definition,...(c.synonyms??[]),c.broaderConcept?.label??"",...(c.relatedCanons??[]).map(x=>`canone ${x.number} ${x.editorialTitle??""}`)].join(" ").toLocaleLowerCase("it");
    return hay.includes(normalized);
  }),[concepts,normalized]);

  return <div style={{maxWidth:1280,margin:"0 auto",padding:"34px 28px 60px"}}>
    <p style={{margin:0,color:"var(--gold)",fontWeight:800,textTransform:"uppercase",fontSize:12}}>Materie</p>
    <h1 style={{fontFamily:"Georgia,serif",color:"var(--blue)",fontSize:"2.2rem",margin:"8px 0"}}>Navigazione per materia</h1>
    <p style={{maxWidth:820,color:"var(--muted)",lineHeight:1.6,margin:"0 0 24px"}}>Esplora il diritto canonico per concetti giuridici trasversali. Ogni materia apre un dossier accademico e mantiene i collegamenti con la struttura ufficiale del CIC.</p>
    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:24}}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca materia, concetto o canone…" aria-label="Cerca nelle materie" style={{width:"100%",maxWidth:560,padding:"12px 14px",border:"1px solid var(--line)",borderRadius:9,background:"var(--surface)",color:"var(--ink)",font:"inherit"}}/>{query&&<button onClick={()=>setQuery("")} style={{border:"1px solid var(--line)",background:"var(--surface)",color:"var(--blue)",borderRadius:8,padding:"11px 13px",fontWeight:800}}>Azzera</button>}</div>
    {filtered.length?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:14}}>{filtered.map(c=><article key={c._id} style={{background:"var(--surface)",border:"1px solid var(--line)",borderRadius:12,padding:20,boxShadow:"0 2px 8px rgba(10,30,50,.03)"}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}><h2 style={{fontFamily:"Georgia,serif",fontSize:"1.2rem",lineHeight:1.3,color:"var(--blue)",margin:"0 0 10px"}}>{c.slug?.current?<Link href={`/materie/${c.slug.current}`} style={{color:"inherit",textDecoration:"none"}}>{c.label}</Link>:c.label}</h2>{c.broaderConcept&&<span style={{fontSize:10,padding:"4px 8px",borderRadius:12,background:"var(--surface2)",color:"var(--muted)",whiteSpace:"nowrap"}}>in {c.broaderConcept.label}</span>}</div><p style={{fontSize:13,lineHeight:1.6,margin:"0 0 12px"}}>{c.definition}</p>{(c.synonyms?.length??0)>0&&<p style={{fontSize:11,color:"var(--muted)",margin:"0 0 14px"}}><strong>Termini collegati:</strong> {c.synonyms!.join(" · ")}</p>}<div style={{borderTop:"1px solid var(--line)",paddingTop:12,display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}><div>{(c.relatedCanons?.length??0)>0?<span style={{fontSize:11,color:"var(--muted)"}}>{c.relatedCanons!.length} canoni collegati</span>:<span style={{fontSize:11,color:"var(--muted)"}}>Dossier tematico</span>}</div>{c.slug?.current&&<Link href={`/materie/${c.slug.current}`} style={{textDecoration:"none",fontSize:11,fontWeight:850,color:"var(--blue)"}}>Apri dossier →</Link>}</div></article>)}</div>:<div style={{background:"var(--surface)",border:"1px solid var(--line)",borderRadius:12,padding:24}}><strong style={{color:"var(--blue)"}}>Nessuna materia corrisponde alla ricerca.</strong></div>}
    <p style={{color:"var(--muted)",fontSize:12,marginTop:22}}>{filtered.length} materie visualizzate · {concepts.length} presenti nel corpus.</p>
  </div>
}
