"use client";

import { useMemo, useState } from "react";

const canons = [
  { n: 1055, title: "Nozione e proprietà del matrimonio", text: "Il patto matrimoniale, con cui l'uomo e la donna stabiliscono tra loro la comunità di tutta la vita, per sua natura ordinata al bene dei coniugi e alla procreazione ed educazione della prole, tra battezzati è stato elevato da Cristo Signore alla dignità di sacramento." },
  { n: 1063, title: "Cura pastorale e preparazione", text: "I pastori d'anime sono tenuti all'obbligo di provvedere che la propria comunità ecclesiastica presti ai fedeli quell'assistenza mediante la quale lo stato matrimoniale perseveri nello spirito cristiano e progredisca nella perfezione." },
  { n: 1083, title: "Età per contrarre matrimonio", text: "§ 1. L'uomo prima dei sedici anni compiuti, la donna prima dei quattordici pure compiuti, non possono celebrare un valido matrimonio.\n\n§ 2. È diritto della Conferenza Episcopale fissare una età maggiore per la lecita celebrazione del matrimonio." },
  { n: 1095, title: "Incapacità a contrarre matrimonio", text: "Sono incapaci a contrarre matrimonio coloro che mancano di sufficiente uso di ragione, difettano gravemente di discrezione di giudizio o non possono assumere gli obblighi essenziali del matrimonio per cause di natura psichica." },
];

const sources = [
  { kind: "CEI · Delibera", title: "Delibera n. 10", date: "23 dicembre 1983", relation: "Determina per l'Italia", detail: "Per la lecita celebrazione del matrimonio l'età dei nubendi è di 18 anni.", status: "Vigente" },
  { kind: "CEI · Decreto generale", title: "Decreto generale sul matrimonio canonico", date: "5 novembre 1990", relation: "Attua e sviluppa", detail: "Disciplina particolare per la celebrazione del matrimonio canonico in Italia.", status: "Vigente" },
  { kind: "Relazione normativa", title: "Can. 1067", date: "CIC 1983", relation: "Materia collegata", detail: "Esame dei nubendi e investigazioni prematrimoniali.", status: "CIC" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(1083);
  const canon = canons.find((item) => item.n === selected) ?? canons[2];
  const results = useMemo(() => {
    const q = query.toLowerCase().trim().replace("can.", "").replace("can", "");
    if (!q) return [];
    return canons.filter((item) => `${item.n} ${item.title} ${item.text}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">FI</span><div><strong>Fontes Iuris</strong><small>Diritto canonico · Italia</small></div></div>
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca canone, materia, fonte…" aria-label="Ricerca giuridica" />
          <kbd>⌘ K</kbd>
          {query && <div className="search-results">
            <div className="result-label">Risultati immediati</div>
            {results.length ? results.map((item) => <button key={item.n} onClick={() => { setSelected(item.n); setQuery(""); }}><span>Can. {item.n}</span><strong>{item.title}</strong><small>CIC 1983 · Libro IV</small></button>) : <div className="empty"><strong>Nessun vicolo cieco</strong><span>Prova “matrimonio”, “1083” o esplora la materia Matrimonio.</span></div>}
          </div>}
        </div>
        <button className="icon-button" aria-label="Preferiti">☆</button>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="eyebrow">Codice di Diritto Canonico</div>
          <h2>Libro IV</h2><p>La funzione di santificare della Chiesa</p>
          <div className="tree"><span>Parte I · I Sacramenti</span><strong>Titolo VII · Il matrimonio</strong><span>Cap. I · Cura pastorale</span><span>Cap. II · Impedimenti dirimenti</span></div>
          <div className="canon-list">{canons.map((item) => <button className={item.n === selected ? "active" : ""} key={item.n} onClick={() => setSelected(item.n)}><b>{item.n}</b><span>{item.title}</span></button>)}</div>
        </aside>

        <article className="reader">
          <nav className="breadcrumbs">CIC 1983 <span>›</span> Libro IV <span>›</span> Matrimonio</nav>
          <div className="canon-heading"><div><span className="status">● VIGENTE</span><h1>Can. {canon.n}</h1><p>{canon.title}</p></div><button className="outline">Condividi</button></div>
          <section className="canon-text">{canon.text.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</section>
          <div className="text-meta"><span>Testo italiano vigente</span><span>Fonte ufficiale · Santa Sede</span></div>
          <section className="context"><div className="section-title"><span>Rete normativa</span><b>Italia</b></div><h3>Questa norma non vive isolata.</h3><p>Fontes Iuris collega il canone alla legislazione universale e alla normativa particolare applicabile in Italia, distinguendo natura della relazione, autorità e stato temporale.</p></section>
        </article>

        <aside className="sources-panel">
          <div className="panel-heading"><div><span className="eyebrow">Fontes</span><h2>Rete giuridica</h2></div><span className="count">{sources.length}</span></div>
          <div className="tabs"><button className="selected">Fonti</button><button>Concordanze</button><button>Storia</button></div>
          <div className="source-stack">{sources.map((source) => <article className="source-card" key={source.title}><div className="source-top"><span>{source.kind}</span><b>{source.status}</b></div><h3>{source.title}</h3><time>{source.date}</time><div className="relation">↳ {source.relation}</div><p>{source.detail}</p><button>Apri fonte →</button></article>)}</div>
          <div className="legend"><strong>Perché lo vedo?</strong><p>Ogni collegamento indica il rapporto giuridico con il canone selezionato.</p></div>
        </aside>
      </div>
    </main>
  );
}
