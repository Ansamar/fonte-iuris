"use client";

import { useMemo, useState } from "react";

type SearchItem = {
  id: string;
  type: "Canone" | "Fonte CEI" | "Materia";
  title: string;
  subtitle: string;
  text: string;
  terms: string[];
  canon?: number;
  status: "Vigente" | "CIC";
};

const canons = [
  { n: 1055, title: "Nozione e proprietà del matrimonio", text: "Il patto matrimoniale, con cui l'uomo e la donna stabiliscono tra loro la comunità di tutta la vita, per sua natura ordinata al bene dei coniugi e alla procreazione ed educazione della prole, tra battezzati è stato elevato da Cristo Signore alla dignità di sacramento." },
  { n: 1063, title: "Cura pastorale e preparazione", text: "I pastori d'anime sono tenuti all'obbligo di provvedere che la propria comunità ecclesiastica presti ai fedeli quell'assistenza mediante la quale lo stato matrimoniale perseveri nello spirito cristiano e progredisca nella perfezione." },
  { n: 1067, title: "Esame dei nubendi", text: "La Conferenza Episcopale stabilisca le norme circa l'esame dei nubendi, nonché circa le pubblicazioni matrimoniali e gli altri mezzi opportuni per compiere le necessarie investigazioni prematrimoniali." },
  { n: 1083, title: "Età per contrarre matrimonio", text: "§ 1. L'uomo prima dei sedici anni compiuti, la donna prima dei quattordici pure compiuti, non possono celebrare un valido matrimonio.\n\n§ 2. È diritto della Conferenza Episcopale fissare una età maggiore per la lecita celebrazione del matrimonio." },
  { n: 1095, title: "Incapacità a contrarre matrimonio", text: "Sono incapaci a contrarre matrimonio coloro che mancano di sufficiente uso di ragione, difettano gravemente di discrezione di giudizio o non possono assumere gli obblighi essenziali del matrimonio per cause di natura psichica." },
];

const sources = [
  { kind: "CEI · Delibera", title: "Delibera n. 10", date: "23 dicembre 1983", relation: "Determina per l'Italia", detail: "Per la lecita celebrazione del matrimonio l'età dei nubendi è di 18 anni.", status: "Vigente" },
  { kind: "CEI · Decreto generale", title: "Decreto generale sul matrimonio canonico", date: "5 novembre 1990", relation: "Attua e sviluppa", detail: "Disciplina particolare per la celebrazione del matrimonio canonico in Italia.", status: "Vigente" },
  { kind: "Relazione normativa", title: "Can. 1067", date: "CIC 1983", relation: "Materia collegata", detail: "Esame dei nubendi e investigazioni prematrimoniali.", status: "CIC" },
];

const searchIndex: SearchItem[] = [
  ...canons.map((c) => ({ id: `canon-${c.n}`, type: "Canone" as const, title: `Can. ${c.n} — ${c.title}`, subtitle: "CIC 1983 · Libro IV · Titolo VII", text: c.text, terms: [String(c.n), `can ${c.n}`, `canone ${c.n}`, c.title, c.text], canon: c.n, status: "CIC" as const })),
  { id: "cei-10", type: "Fonte CEI", title: "Delibera CEI n. 10", subtitle: "23 dicembre 1983 · Italia", text: "Età richiesta per la lecita celebrazione del matrimonio.", terms: ["delibera 10", "cei 10", "età matrimonio", "eta minima", "nubendi", "18 anni"], canon: 1083, status: "Vigente" },
  { id: "cei-matrimonio-1990", type: "Fonte CEI", title: "Decreto generale sul matrimonio canonico", subtitle: "CEI · 5 novembre 1990 · Italia", text: "Disciplina particolare del matrimonio canonico in Italia.", terms: ["decreto matrimonio", "matrimonio canonico", "cei matrimonio", "preparazione matrimonio", "nubendi"], status: "Vigente" },
  { id: "materia-matrimonio", type: "Materia", title: "Matrimonio", subtitle: "Materia giuridica · rete normativa", text: "Canoni, fonti universali, normativa CEI e documenti applicativi collegati al matrimonio.", terms: ["matrimonio", "matrimoniale", "nozze", "sposi", "coniugi", "nubendi", "consenso", "nullità"], status: "Vigente" },
];

const semanticConcepts: Record<string, string[]> = {
  matrimonio: ["matrimonio", "matrimoniale", "nozze", "sposi", "coniugi", "nubendi"],
  eta: ["eta", "età", "anni", "minima", "nubendi", "1083"],
  nullita: ["nullita", "nullità", "incapacita", "incapacità", "consenso", "1095"],
  preparazione: ["preparazione", "pastorale", "esame", "nubendi", "1063", "1067"],
};

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/§/g, " par ").replace(/\b(canone|can\.)\b/g, "can").replace(/[^a-z0-9]+/g, " ").trim();
}

function distance(a: string, b: string) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return row[b.length];
}

function scoreItem(item: SearchItem, rawQuery: string) {
  const q = normalize(rawQuery);
  if (!q) return 0;
  const haystack = normalize([item.title, item.subtitle, item.text, ...item.terms].join(" "));
  if (normalize(item.title) === q) return 1000;
  if (item.canon && q === String(item.canon)) return 950;
  if (haystack.startsWith(q)) return 800;
  if (haystack.includes(q)) return 650;

  const queryWords = q.split(" ");
  const hayWords = haystack.split(" ");
  let score = 0;
  for (const word of queryWords) {
    if (word.length < 2) continue;
    if (hayWords.some((candidate) => candidate.startsWith(word))) score += 120;
    else if (word.length >= 4 && hayWords.some((candidate) => Math.abs(candidate.length - word.length) <= 2 && distance(candidate, word) <= 2)) score += 90;
    for (const conceptTerms of Object.values(semanticConcepts)) {
      const normalizedTerms = conceptTerms.map(normalize);
      if (normalizedTerms.some((term) => term === word || (word.length >= 4 && distance(term, word) <= 2)) && normalizedTerms.some((term) => haystack.includes(term))) score += 70;
    }
  }
  return score;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState<"Tutto" | SearchItem["type"]>("Tutto");
  const [selected, setSelected] = useState(1083);
  const canon = canons.find((item) => item.n === selected) ?? canons[3];

  const results = useMemo(() => searchIndex.map((item) => ({ item, score: scoreItem(item, query) })).filter(({ score, item }) => score > 0 && (filter === "Tutto" || item.type === filter)).sort((a, b) => b.score - a.score).slice(0, 8), [query, filter]);
  const availableFilters = useMemo(() => ["Tutto", ...Array.from(new Set(searchIndex.map((item) => item.type)))] as const, []);

  function choose(item: SearchItem) {
    if (item.canon) setSelected(item.canon);
    setQuery(""); setSearchOpen(false); setFilter("Tutto");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">FI</span><div><strong>Fontes Iuris</strong><small>Diritto canonico · Italia</small></div></div>
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input value={query} onFocus={() => setSearchOpen(true)} onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }} placeholder="Canone, materia, fonte… es. ‘età matrimonio’" aria-label="Ricerca giuridica predittiva" autoComplete="off" />
          <kbd>⌘ K</kbd>
          {searchOpen && <div className="search-results">
            {!query ? <>
              <div className="result-label">Accesso rapido</div>
              <button onMouseDown={() => setQuery("matrimonio")}><span>Materia</span><strong>Matrimonio</strong><small>CIC + rete normativa italiana</small></button>
              <button onMouseDown={() => setQuery("1083")}><span>Canone recente</span><strong>Can. 1083</strong><small>Età per contrarre matrimonio</small></button>
              <button onMouseDown={() => setQuery("decreto matrimonio")}><span>Fonte CEI</span><strong>Decreto generale sul matrimonio canonico</strong><small>5 novembre 1990</small></button>
            </> : <>
              <div className="result-label">Risultati mentre digiti · {results.length}</div>
              <div className="tabs">{availableFilters.map((name) => <button key={name} className={filter === name ? "selected" : ""} onMouseDown={(e) => { e.preventDefault(); setFilter(name); }}>{name}</button>)}</div>
              {results.length ? results.map(({ item }) => <button key={item.id} onMouseDown={() => choose(item)}><span>{item.type} · {item.status}</span><strong>{item.title}</strong><small>{item.subtitle} · {item.text}</small></button>) : <div className="empty"><strong>Nessun vicolo cieco</strong><span>Nessuna corrispondenza esatta. Prova “matrimonio”, “1083”, “età minima”, “nullità” oppure esplora la materia Matrimonio.</span></div>}
            </>}
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
