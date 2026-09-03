import Link from "next/link";
import {notFound} from "next/navigation";
import LegalCorpusShell from "../../LegalCorpusShell";
import styles from "./legal-page.module.css";

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
function scopeLabel(scope?:string){return scope==="universal"?"Universale":scope==="italy"?"Italia":scope||""}
function forceLabel(force?:string){return force==="normative"?"Normativa":force||""}
function relationLabel(type?:string){const map:Record<string,string>={interprets:"Interpreta",implements:"Attua",determines:"Determina",specifies:"Specifica",integrates:"Integra",derogates:"Deroga",replaces:"Sostituisce",repeals:"Abroga",refersTo:"Rinvio",presupposes:"Presuppone",appliesInItaly:"Applicazione in Italia",regulatesProcedure:"Regola la procedura",amendsText:"Modifica il testo",concordance:"Concordanza",exception:"Eccezione"};return map[type??""]||type||"Relazione normativa"}
function decodeEntities(text:string){const entities:Record<string,string>={amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" ",agrave:"à",egrave:"è",eacute:"é",igrave:"ì",ograve:"ò",ugrave:"ù",ccedil:"ç",ntilde:"ñ",ecirc:"ê",aacute:"á",iacute:"í",oacute:"ó",uacute:"ú",times:"×"};return text.replace(/&([a-z]+);/gi,(m,key)=>entities[key.toLowerCase()]??m).replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)));}
function cleanOfficialText(raw?:string){
  if(!raw)return "";
  const junk=new Set([
    "la santa sede","italiano","italian","français","english","português","español","deutsch","polski","العربية","العربيّة","中文","latine","×",
    "magisterium","calendario","celebrazioni liturgiche","biglietti udienze e celebrazioni pontificie","sommi pontefici","collegio cardinalizio",
    "curia romana e altre organizzazioni","sinodo","sala stampa","vatican news - radio vaticana","l'osservatore romano","francesco","motu proprio",
    "a","generazione pdf in corso.....","generazione pdf in corso...","de","en","es","fr","hr","it","la","pl","pt","zh_cn","zh_tw","-"
  ]);
  const languageMenu=/^(?:-\s*)?(?:DE|EN|ES|FR|HR|IT|LA|PL|PT|ZH_CN|ZH_TW)(?:\s*-\s*(?:DE|EN|ES|FR|HR|IT|LA|PL|PT|ZH_CN|ZH_TW))*$/i;
  const lines=decodeEntities(raw).split(/\r?\n/).map(line=>line.trimEnd()).filter(line=>{
    const trimmed=line.trim();
    const key=trimmed.toLocaleLowerCase("it");
    if(junk.has(key))return false;
    if(languageMenu.test(trimmed))return false;
    return true;
  });
  return lines.join("\n").replace(/\n{3,}/g,"\n\n").trim();
}

export default async function LegalPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const doc=await loadLegal(decodeURIComponent(id));if(!doc)notFound();const p=doc.provision;
  const title=p?.title||doc.title,issuer=p?.issuer||doc.issuer,status=p?.status||doc.status,effectiveFrom=p?.effectiveFrom||doc.effectiveFrom,effectiveUntil=p?.effectiveUntil||doc.effectiveUntil;
  const scope=p?.territorialScope||doc.territorialScope,force=p?.legalForce||doc.legalForce;
  const text=cleanOfficialText(p?.normativeText||doc.sourceText);const relations=Array.from(new Map((doc.relations??[]).map((r:any)=>[r._id,r])).values()) as any[];
  const kind=(p?.provisionType||doc.documentType||"Atto normativo").replace(/([a-z])([A-Z])/g,"$1 $2");
  return <LegalCorpusShell section="Lettura interna">
    <div className={styles.layout}>
      <article className={styles.article}>
        <div className={styles.hero}>
          <p className={styles.kind}>{kind}</p>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.meta}>{issuer&&<span className={styles.chip}>{issuer}</span>}{status&&<span className={`${styles.chip} ${styles.chipStrong}`}>{statusLabel(status)}</span>}{effectiveFrom&&<span className={styles.chip}>In vigore dal {effectiveFrom}</span>}{scope&&<span className={styles.chip}>{scopeLabel(scope)}</span>}</div>
        </div>
        <div className={styles.body}>
          {p?.summary&&<section className={styles.summary}><strong>Sintesi</strong><p>{p.summary}</p></section>}
          <section><h2>Testo ufficiale</h2>{text?<div className={styles.officialText}>{text}</div>:<p className={styles.empty}>Testo ufficiale non ancora acquisito nel corpus.</p>}</section>
        </div>
      </article>
      <aside className={styles.aside}>
        <section className={styles.panel}><h3>Dati giuridici</h3>{doc.officialCitation&&<div className={styles.fact}><b>Citazione</b><span>{doc.officialCitation}</span></div>}{effectiveFrom&&<div className={styles.fact}><b>Vigenza</b><span>dal {effectiveFrom}{effectiveUntil?` al ${effectiveUntil}`:""}</span></div>}{scope&&<div className={styles.fact}><b>Ambito</b><span>{scopeLabel(scope)}</span></div>}{force&&<div className={styles.fact}><b>Forza</b><span>{forceLabel(force)}</span></div>}</section>
        {relations.length>0&&<section className={styles.panel}><h3>Relazioni normative</h3>{relations.map((r:any)=><div key={r._id} className={styles.relation}><span className={styles.relationType}>{relationLabel(r.relationType)}</span><p>{r.target?.number?<>Can. <Link href={`/?can=${r.target.number}`}>{r.target.number}</Link></>:r.source?.number?<>Can. <Link href={`/?can=${r.source.number}`}>{r.source.number}</Link></>:r.note||r.officialCitation||"Relazione registrata"}</p></div>)}</section>}
        <section className={styles.panel}><h3>Provenienza</h3><div className={styles.fact}><b>Corpus</b><span>Fonte Iuris · testo acquisito e consultabile internamente</span></div>{doc.officialUrl&&<a className={styles.sourceLink} href={doc.officialUrl} target="_blank" rel="noreferrer">Fonte ufficiale esterna ↗</a>}<Link href="/fonti" className={styles.returnLink}>← Torna alle fonti normative</Link></section>
      </aside>
    </div>
  </LegalCorpusShell>
}
