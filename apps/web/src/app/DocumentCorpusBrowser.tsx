"use client";

import Link from "next/link";
import {useMemo,useState} from "react";

export type CorpusDocument={_id:string;title:string;shortTitle?:string;documentType?:string;issuer?:string;issuedAt?:string;publishedAt?:string;officialCitation?:string;territorialScope?:string;legalForce?:string;summary?:string;relationCount:number;canonNumbers?:number[]};

type Kind="pastoral"|"practice";

function normalize(value?:string){return (value??"").toLocaleLowerCase("it").normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function displayTitle(d:CorpusDocument){return d.shortTitle?.trim()||d.title;}
function typeLabel(v?:string){const map:Record<string,string>={pastoralDocument:"Documento pastorale",instruction:"Istruzione",decree:"Decreto",other:"Documento",judgment:"Decisione",sentence:"Sentenza",practice:"Prassi"};return map[v??""]||v?.replace(/([a-z])([A-Z])/g,"$1 $2")||"Documento";}

export default function DocumentCorpusBrowser({documents,kind}:{documents:CorpusDocument[];kind:Kind}){
 const [mode,setMode]=useState<"start"|"search"|"browse"|"canon">("start");
 const [query,setQuery]=useState("");
 const [issuer,setIssuer]=useState("Tutte");
 const [canon,setCanon]=useState("");
 const issuers=useMemo(()=>["Tutte",...Array.from(new Set(documents.map(d=>d.issuer).filter(Boolean) as string[])).sort((a,b)=>a.localeCompare(b,"it"))],[documents]);
 const canonNumber=Number.parseInt(canon.replace(/\D/g,""),10);
 const filtered=useMemo(()=>documents.filter(d=>{
   if(issuer!=="Tutte"&&d.issuer!==issuer)return false;
   if(mode==="canon"&&Number.isFinite(canonNumber)&&canonNumber>0&&!d.canonNumbers?.includes(canonNumber))return false;
   const needle=normalize(query.trim());
   return !needle||[d.title,d.shortTitle,d.documentType,d.issuer,d.summary,d.officialCitation].some(v=>normalize(v).includes(needle));
 }),[documents,issuer,query,mode,canonNumber]);
 const pastoral=kind==="pastoral";
 const reset=()=>{setQuery("");setIssuer("Tutte");setCanon("")};
 const labels=pastoral?{
  searchEyebrow:"So quale documento cerco",searchTitle:"Cerca un documento",searchDesc:"Cerca per titolo, autorità, citazione o parola chiave.",
  browseEyebrow:"Voglio orientarmi",browseTitle:"Esplora per autorità",browseDesc:"Esamina i documenti secondo l’autorità o l’organismo che li ha emanati.",
  canonEyebrow:"Parto dal Codice",canonTitle:"Parto da un canone",canonDesc:"Verifica quali documenti pastorali presenti nel corpus sono collegati a un canone.",
  result:"documenti"
 }:{
  searchEyebrow:"So cosa sto cercando",searchTitle:"Cerca decisione o prassi",searchDesc:"Cerca per autorità, riferimento, titolo o parola chiave.",
  browseEyebrow:"Voglio orientarmi",browseTitle:"Esplora per autorità",browseDesc:"Distingui progressivamente giurisprudenza, decisioni e prassi secondo la loro provenienza.",
  canonEyebrow:"Parto dal Codice",canonTitle:"Parto da un canone",canonDesc:"Ricostruisci le decisioni e le prassi collegate a uno specifico canone.",
  result:"risultati"
 };
 const start=(next:"search"|"browse"|"canon")=>{reset();setMode(next);setTimeout(()=>document.getElementById(next==="canon"?"corpus-canon":"corpus-search")?.focus(),0)};
 return <>
  {mode==="start"&&<section aria-label="Come vuoi iniziare" style={{margin:"0 0 24px"}}><h2 style={{font:"700 1.35rem Georgia,serif",color:"var(--blue)",margin:"0 0 12px"}}>Come vuoi iniziare?</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:14}}>
   {(["search","browse","canon"] as const).map(m=><button key={m} onClick={()=>start(m)} style={{textAlign:"left",cursor:"pointer",font:"inherit",background:"var(--surface)",border:"1px solid var(--line)",borderRadius:14,padding:22,color:"var(--ink)"}}><span style={{display:"block",fontSize:10,fontWeight:850,color:"var(--gold)",textTransform:"uppercase",marginBottom:7}}>{m==="search"?labels.searchEyebrow:m==="browse"?labels.browseEyebrow:labels.canonEyebrow}</span><strong style={{display:"block",font:"700 1.15rem Georgia,serif",color:"var(--blue)",marginBottom:7}}>{m==="search"?labels.searchTitle:m==="browse"?labels.browseTitle:labels.canonTitle}</strong><span style={{fontSize:12,lineHeight:1.55,color:"var(--muted)"}}>{m==="search"?labels.searchDesc:m==="browse"?labels.browseDesc:labels.canonDesc}</span></button>)}
  </div></section>}

  {mode!=="start"&&<><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"baseline",margin:"0 0 14px"}}><div><p style={{fontSize:10,fontWeight:850,color:"var(--gold)",textTransform:"uppercase",margin:"0 0 4px"}}>Percorso guidato</p><h2 style={{font:"700 1.35rem Georgia,serif",color:"var(--blue)",margin:0}}>{mode==="search"?labels.searchTitle:mode==="browse"?labels.browseTitle:labels.canonTitle}</h2></div><button onClick={()=>{reset();setMode("start")}} style={{border:0,background:"transparent",color:"var(--blue)",fontWeight:800,cursor:"pointer"}}>Torna all’inizio</button></div>
   <div style={{display:"grid",gridTemplateColumns:"minmax(240px,1fr) auto",gap:12,margin:"0 0 20px"}}>
    {mode==="canon"?<div><input id="corpus-canon" inputMode="numeric" value={canon} onChange={e=>setCanon(e.target.value)} placeholder="Numero del canone, es. 1095" aria-label="Numero del canone" style={{width:"100%",height:42,border:"1px solid var(--line)",borderRadius:9,background:"var(--surface)",color:"var(--ink)",padding:"0 14px",outline:"none"}}/>{Number.isFinite(canonNumber)&&canonNumber>0&&<Link href={`/?can=${canonNumber}`} style={{display:"inline-block",marginTop:7,fontSize:11,fontWeight:800,color:"var(--blue)",textDecoration:"none"}}>Apri can. {canonNumber} nel CIC →</Link>}</div>:<input id="corpus-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca titolo, autorità, riferimento…" aria-label="Cerca nel corpus" style={{width:"100%",height:42,border:"1px solid var(--line)",borderRadius:9,background:"var(--surface)",color:"var(--ink)",padding:"0 14px",outline:"none"}}/>}
    <select value={issuer} onChange={e=>setIssuer(e.target.value)} aria-label="Filtra per autorità" style={{height:42,border:"1px solid var(--line)",borderRadius:9,background:"var(--surface)",color:"var(--ink)",padding:"0 12px"}}>{issuers.map(v=><option key={v}>{v}</option>)}</select>
   </div>
   <div style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>{filtered.length} {labels.result}</div>
   {filtered.length?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(310px,1fr))",gap:14}}>{filtered.map(d=><Link key={d._id} href={`/legal/${encodeURIComponent(d._id)}`} style={{textDecoration:"none",color:"inherit",background:"var(--surface)",border:"1px solid var(--line)",borderRadius:11,padding:20,display:"block"}}><div style={{fontSize:10,fontWeight:850,textTransform:"uppercase",color:"var(--gold)",marginBottom:8}}>{typeLabel(d.documentType)}</div><h3 style={{font:"700 1.1rem/1.3 Georgia,serif",color:"var(--blue)",margin:"0 0 9px"}}>{displayTitle(d)}</h3><p style={{fontSize:11,color:"var(--muted)",margin:"0 0 10px"}}>{[d.issuer,d.issuedAt||d.publishedAt].filter(Boolean).join(" · ")}</p>{d.summary&&<p style={{fontSize:13,lineHeight:1.55,margin:"0 0 13px"}}>{d.summary}</p>}<div style={{borderTop:"1px solid var(--line)",paddingTop:10,display:"flex",justifyContent:"space-between",gap:10,fontSize:11,color:"var(--muted)"}}><span>{d.relationCount} relazioni</span><strong style={{color:"var(--blue)"}}>Apri →</strong></div></Link>)}</div>:<div style={{background:"var(--surface)",border:"1px solid var(--line)",borderRadius:11,padding:28,textAlign:"center"}}><strong>Nessun documento collegato</strong><p style={{color:"var(--muted)",marginBottom:0}}>Il corpus non contiene ancora risultati per questo criterio.</p></div>}
  </>}
 </>;
}
