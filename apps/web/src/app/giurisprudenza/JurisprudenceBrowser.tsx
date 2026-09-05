"use client";

import Link from "next/link";
import {useMemo,useState} from "react";

export type JurisprudenceDecision={
 _id:string;title:string;tribunal:string;tribunalLevel?:string;decisionType?:string;decisionDate:string;protocolNumber?:string;officialCitation?:string;causeType?:string;caseLabel?:string;ratioSummary?:string;proceduralOutcome?:string;publicationStatus?:string;canonNumbers?:number[];holdingCount?:number;
};

function normalize(v?:string){return (v??"").toLocaleLowerCase("it").normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function typeLabel(v?:string){return ({sentence:"Sentenza",decree:"Decreto",administrativeDecision:"Decisione amministrativa",proceduralOrder:"Provvedimento processuale",other:"Decisione"} as Record<string,string>)[v??""]||"Decisione";}

export default function JurisprudenceBrowser({decisions}:{decisions:JurisprudenceDecision[]}){
 const [mode,setMode]=useState<"start"|"search"|"tribunal"|"canon">("start");
 const [query,setQuery]=useState("");const [tribunal,setTribunal]=useState("Tutti");const [canon,setCanon]=useState("");
 const tribunals=useMemo(()=>["Tutti",...Array.from(new Set(decisions.map(d=>d.tribunal))).sort((a,b)=>a.localeCompare(b,"it"))],[decisions]);
 const canonNumber=Number.parseInt(canon.replace(/\D/g,""),10);
 const filtered=useMemo(()=>decisions.filter(d=>{
  if(tribunal!=="Tutti"&&d.tribunal!==tribunal)return false;
  if(mode==="canon"&&Number.isFinite(canonNumber)&&canonNumber>0&&!d.canonNumbers?.includes(canonNumber))return false;
  const needle=normalize(query.trim());return !needle||[d.title,d.tribunal,d.protocolNumber,d.officialCitation,d.causeType,d.caseLabel,d.ratioSummary].some(v=>normalize(v).includes(needle));
 }),[decisions,tribunal,canonNumber,mode,query]);
 const start=(m:"search"|"tribunal"|"canon")=>{setQuery("");setTribunal("Tutti");setCanon("");setMode(m);setTimeout(()=>document.getElementById(m==="canon"?"juris-canon":"juris-search")?.focus(),0)};
 const cards=[
  {m:"search" as const,e:"So cosa sto cercando",t:"Cerca una decisione",d:"Cerca per oggetto, protocollo, tribunale, citazione o materia."},
  {m:"tribunal" as const,e:"Voglio orientarmi",t:"Esplora per tribunale",d:"Distingui le decisioni secondo l’autorità giudiziaria che le ha pronunciate."},
  {m:"canon" as const,e:"Parto dal Codice",t:"Parto da un canone",d:"Trova le decisioni che richiamano o applicano uno specifico canone."},
 ];
 return <>
  {mode==="start"?<section aria-label="Come vuoi iniziare"><h2 style={{font:"700 1.35rem Georgia,serif",color:"var(--blue)",margin:"0 0 12px"}}>Come vuoi iniziare?</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:14}}>{cards.map(c=><button key={c.m} onClick={()=>start(c.m)} style={{textAlign:"left",cursor:"pointer",font:"inherit",background:"var(--surface)",border:"1px solid var(--line)",borderRadius:14,padding:22,color:"var(--ink)"}}><span style={{display:"block",fontSize:10,fontWeight:850,color:"var(--gold)",textTransform:"uppercase",marginBottom:7}}>{c.e}</span><strong style={{display:"block",font:"700 1.15rem Georgia,serif",color:"var(--blue)",marginBottom:7}}>{c.t}</strong><span style={{fontSize:12,lineHeight:1.55,color:"var(--muted)"}}>{c.d}</span></button>)}</div></section>:<>
   <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"baseline",marginBottom:14}}><div><p style={{fontSize:10,fontWeight:850,color:"var(--gold)",textTransform:"uppercase",margin:"0 0 4px"}}>Percorso guidato</p><h2 style={{font:"700 1.35rem Georgia,serif",color:"var(--blue)",margin:0}}>{mode==="canon"?"Parto da un canone":mode==="tribunal"?"Esplora per tribunale":"Cerca una decisione"}</h2></div><button onClick={()=>setMode("start")} style={{border:0,background:"transparent",color:"var(--blue)",fontWeight:800,cursor:"pointer"}}>Torna all’inizio</button></div>
   <div style={{display:"grid",gridTemplateColumns:"minmax(240px,1fr) auto",gap:12,marginBottom:20}}>{mode==="canon"?<div><input id="juris-canon" inputMode="numeric" value={canon} onChange={e=>setCanon(e.target.value)} placeholder="Numero del canone, es. 1097" aria-label="Numero del canone" style={{width:"100%",height:42,border:"1px solid var(--line)",borderRadius:9,background:"var(--surface)",color:"var(--ink)",padding:"0 14px"}}/>{Number.isFinite(canonNumber)&&canonNumber>0&&<Link href={`/?can=${canonNumber}`} style={{display:"inline-block",marginTop:7,fontSize:11,fontWeight:800,color:"var(--blue)",textDecoration:"none"}}>Apri can. {canonNumber} nel CIC →</Link>}</div>:<input id="juris-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca oggetto, protocollo, tribunale…" style={{width:"100%",height:42,border:"1px solid var(--line)",borderRadius:9,background:"var(--surface)",color:"var(--ink)",padding:"0 14px"}}/>}<select value={tribunal} onChange={e=>setTribunal(e.target.value)} style={{height:42,border:"1px solid var(--line)",borderRadius:9,background:"var(--surface)",color:"var(--ink)",padding:"0 12px"}}>{tribunals.map(t=><option key={t}>{t}</option>)}</select></div>
   <div style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>{filtered.length} decisioni</div>
   {filtered.length?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(310px,1fr))",gap:14}}>{filtered.map(d=><Link key={d._id} href={`/legal/${encodeURIComponent(d._id)}`} style={{textDecoration:"none",color:"inherit",background:"var(--surface)",border:"1px solid var(--line)",borderRadius:11,padding:20,display:"block"}}><div style={{fontSize:10,fontWeight:850,textTransform:"uppercase",color:"var(--gold)",marginBottom:8}}>{typeLabel(d.decisionType)} · {d.decisionDate}</div><h3 style={{font:"700 1.1rem/1.3 Georgia,serif",color:"var(--blue)",margin:"0 0 8px"}}>{d.title}</h3><p style={{fontSize:11,color:"var(--muted)",margin:"0 0 10px"}}>{d.tribunal}{d.protocolNumber?` · ${d.protocolNumber}`:""}</p>{d.ratioSummary&&<p style={{fontSize:13,lineHeight:1.55,margin:"0 0 13px"}}>{d.ratioSummary}</p>}{d.canonNumbers?.length?<p style={{fontSize:11,fontWeight:750,color:"var(--blue)",margin:"0 0 12px"}}>Can. {d.canonNumbers.join(", ")}</p>:null}<div style={{borderTop:"1px solid var(--line)",paddingTop:10,display:"flex",justifyContent:"space-between",gap:10,fontSize:11,color:"var(--muted)"}}><span>{d.holdingCount||0} principi estratti</span><strong style={{color:"var(--blue)"}}>Apri la decisione →</strong></div></Link>)}</div>:<div style={{background:"var(--surface)",border:"1px solid var(--line)",borderRadius:11,padding:28,textAlign:"center"}}><strong>Nessuna decisione collegata</strong><p style={{color:"var(--muted)",marginBottom:0}}>Il corpus non contiene ancora decisioni per questo criterio.</p></div>}
  </>}
 </>;
}
