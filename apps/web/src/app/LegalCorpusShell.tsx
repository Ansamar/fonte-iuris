"use client";

import Link from "next/link";
import {ReactNode,useEffect,useState} from "react";
import styles from "./legal-corpus-shell.module.css";

type Theme="light"|"dark";
type FontSize="normal"|"large"|"xlarge";

function Logo(){return <div className={styles.logo}><span className={styles.logoSymbol}><i>†</i><b>⌒</b></span><div><strong>Fonte Iuris</strong><small>Ius Canonicum · Italia</small></div></div>}

export default function LegalCorpusShell({children,section="Fonti normative"}:{children:ReactNode;section?:string}){
 const [theme,setTheme]=useState<Theme>("light");
 const [fontSize,setFontSize]=useState<FontSize>("normal");
 const [settings,setSettings]=useState(false);
 useEffect(()=>{const t=localStorage.getItem("fi-theme") as Theme|null;const f=localStorage.getItem("fi-font") as FontSize|null;if(t)setTheme(t);if(f)setFontSize(f)},[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.font=fontSize;localStorage.setItem("fi-theme",theme);localStorage.setItem("fi-font",fontSize)},[theme,fontSize]);
 return <main className={styles.shell}>
  <aside className={styles.rail}>
   <Link href="/" className={styles.brand}><Logo/></Link>
   <p className={styles.navLabel}>Navigazione</p>
   <nav className={styles.nav}>
    <Link href="/">▤ <span>Codice di Diritto Canonico</span></Link>
    <Link href="/fonti" className={styles.active}>▧ <span>Fonti normative</span></Link>
    <Link href="/">◇ <span>Materie</span></Link>
    <Link href="/">▱ <span>Documenti pastorali</span></Link>
    <Link href="/">⚖ <span>Giurisprudenza e prassi</span></Link>
   </nav>
   <div className={styles.bottom}>
    <button className={styles.accessibility} onClick={()=>setSettings(v=>!v)} aria-expanded={settings}><strong>Aa</strong><span>Accessibilità</span></button>
    <div className={styles.footer}><span>FI</span><p>Un’unica fonte,<br/>mille riferimenti.</p></div>
   </div>
  </aside>
  <section className={styles.main}>
   <header className={styles.topbar}><Link href="/fonti">Fonti normative</Link><span>{section}</span></header>
   {children}
  </section>
  {settings&&<aside className={styles.settings}><h3>Accessibilità</h3><p>Modalità</p><div className={styles.segmented}><button className={theme==="light"?styles.selected:""} onClick={()=>setTheme("light")}>☀ Chiaro</button><button className={theme==="dark"?styles.selected:""} onClick={()=>setTheme("dark")}>☾ Scuro</button></div><p>Dimensione testo</p><div className={styles.fontOptions}><button className={fontSize==="normal"?styles.selected:""} onClick={()=>setFontSize("normal")}><b>A</b> Normale</button><button className={fontSize==="large"?styles.selected:""} onClick={()=>setFontSize("large")}><b>A</b> Grande</button><button className={fontSize==="xlarge"?styles.selected:""} onClick={()=>setFontSize("xlarge")}><b>A</b> Molto grande</button></div></aside>}
 </main>
}
