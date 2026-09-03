"use client";

import Link from "next/link";
import {useMemo,useState} from "react";

export type Source={_id:string;title:string;shortTitle?:string;documentType?:string;issuer?:string;status?:string;effectiveFrom?:string;effectiveUntil?:string;officialCitation?:string;territorialScope?:string;legalForce?:string;summary?:string;relationCount:number};

function normalize(value?:string){return (value??"").toLocaleLowerCase("it").normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function statusLabel(v?:string){return v==="inForce"?"Vigente":v==="amended"?"Modificato":v==="repealed"?"Abrogato":v==="historical"?"Storico":v||"Registrato"}
function kind(v?:string,title?:string){const s=`${v??""} ${title??""}`.toLowerCase();if(s.includes("motu proprio"))return "Motu proprio";if(s.includes("costituzione"))return "Costituzione apostolica";if(s.includes("decreto"))return "Decreto";if(s.includes("rescript")||s.includes("rescritto"))return "Rescritto";if(s.includes("codex")||s.includes("codice"))return "Codice";return v||"Documento normativo"}
function displayTitle(s:Source){const short=s.shortTitle?.trim();if(short)return short;const k=kind(s.documentType,s.title);return s.title.replace(new RegExp(`^${k}\\s+`,`i`),"").trim()||s.title}

export default function FontiBrowser({sources}:{sources:Source[]}){
 const [query,setQuery]=useState("");
 const [type,setType]=useState("Tutte");
 const types=useMemo(()=>["Tutte",...Array.from(new Set(sources.map(s=>kind(s.documentType,s.title)))).sort((a,b)=>a.localeCompare(b,"it"))],[sources]);
 const filtered=useMemo(()=>sources.filter(s=>{
   const matchesType=type==="Tutte"||kind(s.documentType,s.title)===type;
   const needle=normalize(query.trim());
   if(!matchesType)return false;
   if(!needle)return true;
   return [s.title,s.shortTitle,s.documentType,s.issuer,s.summary,s.officialCitation].some(v=>normalize(v).includes(needle));
 }),[sources,query,type]);

 return <>
  <div style={{display:"grid",gridTemplateColumns:"minmax(260px,1fr) auto",gap:12,alignItems:"center",margin:"0 0 22px"}}>
   <div style={{position:"relative"}}><span style={{position:"absolute",left:13,top:10,color:"var(--muted)"}}>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca titolo, autorità, citazione…" aria-label="Cerca nelle fonti normative" style={{width:"100%",height:42,border:"1px solid var(--line)",borderRadius:9,background:"var(--surface)",color:"var(--ink)",padding:"0 14px 0 38px",outline:"none"}}/></div>
   <select value={type} onChange={e=>setType(e.target.value)} aria-label="Filtra per tipo di atto" style={{height:42,border:"1px solid var(--line)",borderRadius:9,background:"var(--surface)",color:"var(--ink)",padding:"0 12px"}}>{types.map(t=><option key={t}>{t}</option>)}</select>
  </div>

  <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",margin:"0 0 12px",fontSize:12,color:"var(--muted)"}}><span>{filtered.length} {filtered.length===1?"atto":"atti"}</span>{(query||type!=="Tutte")&&<button onClick={()=>{setQuery("");setType("Tutte")}} style={{border:0,background:"transparent",color:"var(--blue)",fontWeight:700,cursor:"pointer"}}>Azzera filtri</button>}</div>

  {filtered.length?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(310px,1fr))",gap:14}}>{filtered.map(s=><Link key={s._id} href={`/legal/${encodeURIComponent(s._id)}`} style={{textDecoration:"none",color:"inherit",background:"var(--surface)",border:"1px solid var(--line)",borderRadius:11,padding:20,display:"block",boxShadow:"0 2px 8px rgba(10,30,50,.03)"}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:10}}><span style={{fontSize:11,fontWeight:800,textTransform:"uppercase",color:"var(--gold)"}}>{kind(s.documentType,s.title)}</span><span style={{fontSize:11,padding:"4px 8px",borderRadius:12,background:"var(--green-soft)",color:"var(--green)",fontWeight:700}}>{statusLabel(s.status)}</span></div><h2 style={{fontFamily:"Georgia,serif",fontSize:"1.15rem",lineHeight:1.3,color:"var(--blue)",margin:"0 0 9px"}}>{displayTitle(s)}</h2>{s.shortTitle&&s.shortTitle!==s.title&&<p style={{fontSize:12,lineHeight:1.45,margin:"0 0 10px"}}>{s.title}</p>}<p style={{fontSize:12,color:"var(--muted)",margin:"0 0 12px"}}>{[s.issuer,s.effectiveFrom?`in vigore dal ${s.effectiveFrom}`:null,s.territorialScope==="italy"?"Italia":s.territorialScope==="universal"?"Universale":null].filter(Boolean).join(" · ")}</p>{s.summary&&<p style={{fontSize:13,lineHeight:1.55,margin:"0 0 13px"}}>{s.summary}</p>}<div style={{display:"flex",justifyContent:"space-between",gap:10,borderTop:"1px solid var(--line)",paddingTop:11,fontSize:11,color:"var(--muted)"}}><span>{s.relationCount} relazioni normative</span><strong style={{color:"var(--blue)"}}>Apri l’atto →</strong></div></Link>)}</div>:<div style={{background:"var(--surface)",border:"1px solid var(--line)",borderRadius:11,padding:28,textAlign:"center"}}><strong>Nessuna fonte trovata</strong><p style={{color:"var(--muted)",marginBottom:0}}>Modifica la ricerca oppure azzera i filtri.</p></div>}
 </>
}
