import Link from "next/link";
import {notFound} from "next/navigation";
import LegalCorpusShell from "../../LegalCorpusShell";
import styles from "./materia-detail.module.css";

const PROJECT_ID="2rq93txn",DATASET="production",API_VERSION="2026-03-25";

type Ref={_id:string;label?:string;title?:string;number?:number;slug?:{current:string};documentType?:string;issuer?:string;editorialTitle?:string};
type Bib={citation:string;kind?:string;url?:string;note?:string};
type Materia={
  _id:string;
  label:string;
  slug:{current:string};
  definition:string;
  academicSummary?:string;
  systematicFramework?:unknown;
  ecclesiologicalFoundation?:unknown;
  codicialDiscipline?:unknown;
  normativeEvolution?:unknown;
  extraCodicialLegislation?:unknown;
  interpretationDoctrine?:unknown;
  interpretation?:unknown;
  jurisprudencePractice?:unknown;
  controversialIssues?:unknown;
  bibliography?:Bib[];
  synonyms?:string[];
  broaderConcept?:Ref;
  children?:Materia[];
  relatedCanons?:Ref[];
  relatedSources?:Ref[];
  relatedProvisions?:Ref[];
  relatedConcepts?:Ref[];
  marriageCanons?:Ref[];
  marriageSources?:Ref[];
  marriageProvisions?:Ref[];
};

function text(v:unknown){
  if(typeof v==="string")return v;
  if(!Array.isArray(v))return "";
  return v.map((b:any)=>b?.children?.map((c:any)=>c?.text??"").join("")??"").filter(Boolean).join("\n\n");
}

const marriageOrder=[
  "fondament",
  "propriet",
  "capac",
  "prepar",
  "impediment",
  "consenso",
  "forma",
  "misti",
  "effetti",
  "separazione",
  "scioglimento",
  "convalid",
  "sanazione",
  "nullit",
  "processo",
];

function marriageRank(label:string){
  const normalized=label.toLocaleLowerCase("it");
  const index=marriageOrder.findIndex(key=>normalized.includes(key));
  return index===-1?999:index;
}

async function load(slug:string):Promise<Materia|null>{
  const q=`*[_type=="legalConcept"&&slug.current==$slug][0]{
    ...,
    "broaderConcept":broaderConcept->{_id,label,slug},
    "children":*[_type=="legalConcept"&&broaderConcept._ref==^._id]{_id,label,slug,definition},
    "relatedCanons":relatedCanons[]->{_id,number,editorialTitle},
    "relatedSources":relatedSources[]->{_id,title,documentType,issuer},
    "relatedProvisions":relatedProvisions[]->{_id,title},
    "relatedConcepts":relatedConcepts[]->{_id,label,slug},
    "marriageCanons":*[_type=="canon"&&number>=1055&&number<=1165]|order(number asc){_id,number,editorialTitle},
    "marriageSources":*[_type=="sourceDocument"&&(
      title match "*Mitis Iudex*" ||
      title match "*Rescritto*2015*" ||
      title match "*7 dicembre 2015*" ||
      title match "*matrimonio canonico*" ||
      title match "*Codex Iuris Canonici*"
    )]|order(title asc){_id,title,documentType,issuer},
    "marriageProvisions":*[_type=="italianProvision"&&title match "*matrimonio*"]|order(title asc){_id,title}
  }`;
  const u=new URL(`https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`);
  u.searchParams.set("query",q);
  u.searchParams.set("$slug",JSON.stringify(slug));
  const r=await fetch(u,{cache:"no-store"});
  if(!r.ok)throw new Error("Materia non disponibile");
  return (await r.json()).result??null;
}

const sections=[
  ["quadro","Inquadramento giuridico e sistematico","systematicFramework"],
  ["fondamento","Fondamento ecclesiologico e conciliare","ecclesiologicalFoundation"],
  ["disciplina","Disciplina codiciale","codicialDiscipline"],
  ["evoluzione","Evoluzione normativa","normativeEvolution"],
  ["extracodiciale","Legislazione extracodiciale","extraCodicialLegislation"],
  ["interpretazione","Interpretazione e dottrina","interpretation"],
  ["giurisprudenza","Giurisprudenza e prassi","jurisprudencePractice"],
  ["questioni","Questioni problematiche e controverse","controversialIssues"]
] as const;

export default async function MateriaDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const m=await load(slug);
  if(!m)notFound();

  const isMarriage=slug==="matrimonio-canonico";
  const content=(key:string)=>key==="interpretation"?text(m.interpretation)||text(m.interpretationDoctrine):text((m as any)[key]);
  const visible=sections.filter(([, ,k])=>content(k));
  const canons=isMarriage&&m.marriageCanons?.length?m.marriageCanons:m.relatedCanons??[];
  const sources=isMarriage&&m.marriageSources?.length?m.marriageSources:m.relatedSources??[];
  const provisions=isMarriage&&m.marriageProvisions?.length?m.marriageProvisions:m.relatedProvisions??[];
  const children=[...(m.children??[])].sort((a,b)=>isMarriage?marriageRank(a.label)-marriageRank(b.label)||a.label.localeCompare(b.label,"it"):a.label.localeCompare(b.label,"it"));

  return <LegalCorpusShell section="Dossier accademico" activeSection="materie">
    <main className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/materie">Materie</Link><span>›</span>
        {m.broaderConcept?.label?<><span>{m.broaderConcept.label}</span><span>›</span></>:null}
        <span>{m.label}</span>
      </div>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>Materia · dossier giuridico</p>
        <h1 className={styles.title}>{m.label}</h1>
        <p className={styles.definition}>{m.academicSummary||m.definition}</p>
        <div className={styles.metaLine}>
          {isMarriage?<span>CIC 1983 · cann. 1055–1165</span>:null}
          {m.broaderConcept?.label?<span>{m.broaderConcept.label}</span>:null}
          <span>Livello accademico</span>
        </div>
      </header>

      {children.length?<section id="mappa" className={styles.systematic}>
        <div className={styles.systematicHead}>
          <p className={styles.eyebrow}>Indice sistematico</p>
          <h2>Articolazione della materia</h2>
          <p>Un percorso ordinato attraverso gli istituti che compongono il dossier.</p>
        </div>
        <nav className={styles.systematicList} aria-label="Articolazione della materia">
          {children.map((c,i)=><Link href={`/materie/${c.slug.current}`} key={c._id}>
            <b>{String(i+1).padStart(2,"0")}</b>
            <span>
              <strong>{c.label}</strong>
              {c.definition?<small>{c.definition}</small>:null}
            </span>
            <i aria-hidden="true">→</i>
          </Link>)}
        </nav>
      </section>:null}

      <div className={styles.grid}>
        <aside className={styles.toc}>
          <div className={styles.tocBox}>
            <p className={styles.sideLabel}>Nel dossier</p>
            {visible.map(([id,title])=><a href={`#${id}`} key={id}>{title}</a>)}
            {m.bibliography?.length?<a href="#bibliografia">Bibliografia scientifica</a>:null}
          </div>
        </aside>

        <article className={styles.main}>
          <section className={styles.abstract}>
            <p className={styles.eyebrow}>Sintesi accademica</p>
            <p>{m.definition}</p>
          </section>

          {visible.map(([id,title,key],index)=><section id={id} className={`${styles.section} ${id==="evoluzione"?styles.evolution:""}`} key={id}>
            <div className={styles.sectionHeading}>
              <span>{String(index+1).padStart(2,"0")}</span>
              <h2>{title}</h2>
            </div>
            {content(key).split("\n\n").map((p,i)=><p key={i}>{p}</p>)}
          </section>)}

          {m.bibliography?.length?<section id="bibliografia" className={styles.section}>
            <div className={styles.sectionHeading}>
              <span>{String(visible.length+1).padStart(2,"0")}</span>
              <h2>Bibliografia scientifica</h2>
            </div>
            <ol className={styles.bibliography}>{m.bibliography.map((b,i)=><li key={i}>{b.citation}{b.note?` — ${b.note}`:""}</li>)}</ol>
          </section>:null}
        </article>

        <aside className={styles.rail}>
          <div className={styles.railBox}>
            <p className={styles.sideLabel}>Rete normativa</p>

            {canons.length?<section className={styles.railSection}>
              <h3>Disciplina codiciale</h3>
              {isMarriage?<>
                <Link className={styles.primaryRef} href="/?can=1055">
                  <strong>Cann. 1055–1165</strong>
                  <span>Disciplina codiciale del matrimonio</span>
                </Link>
                <p className={styles.rangeNote}>{canons.length} canoni presenti nel corpus</p>
              </>:<div className={styles.canonGrid}>{canons.slice(0,24).map(c=><Link key={c._id} href={`/?can=${c.number}`} title={c.editorialTitle}>{c.number}</Link>)}</div>}
            </section>:null}

            {sources.length?<section className={styles.railSection}>
              <h3>Fonti normative</h3>
              {sources.map(s=><Link className={styles.ref} key={s._id} href={`/legal/${s._id}`}>
                <strong>{s.title}</strong>
                {s.documentType||s.issuer?<small>{[s.documentType,s.issuer].filter(Boolean).join(" · ")}</small>:null}
              </Link>)}
            </section>:null}

            {provisions.length?<section className={styles.railSection}>
              <h3>Diritto particolare italiano</h3>
              {provisions.map(s=><Link className={styles.ref} key={s._id} href={`/legal/${s._id}`}><strong>{s.title}</strong></Link>)}
            </section>:null}

            {!canons.length&&!sources.length&&!provisions.length?<p className={styles.muted}>Nessuna relazione strutturata disponibile.</p>:null}
          </div>

          {m.relatedConcepts?.length?<div className={styles.railBox}>
            <p className={styles.sideLabel}>Materie correlate</p>
            {m.relatedConcepts.map(c=><Link className={styles.ref} key={c._id} href={`/materie/${c.slug?.current}`}><strong>{c.label}</strong></Link>)}
          </div>:null}

          <Link className={styles.back} href="/materie">← Tutte le materie</Link>
        </aside>
      </div>
    </main>
  </LegalCorpusShell>;
}
