"use client";

import {useEffect} from "react";

type SearchResult={
  _id:string;
  resultType:"canon"|"italianProvision"|"sourceDocument"|"legalRelation";
  label:string;
  tone?:string;
  title:string;
  targetNumber?:number;
};

const toneByLabel:Record<string,string>={
  "Canone":"canon",
  "Motu proprio":"motu",
  "Costituzione apostolica":"constitution",
  "Decreto":"decree",
  "Rescritto":"rescript",
  "Istruzione":"instruction",
  "Codice":"code",
  "Documento":"document",
  "Relazione normativa":"relation",
};

function applySearchTones(){
  document.querySelectorAll<HTMLButtonElement>(".search-results .result").forEach(button=>{
    const label=button.querySelector(":scope > span")?.textContent?.trim()??"";
    const tone=toneByLabel[label]??"document";
    button.dataset.searchTone=tone;
  });
}

export default function SearchResultActions(){
  useEffect(()=>{
    applySearchTones();
    const observer=new MutationObserver(applySearchTones);
    observer.observe(document.body,{childList:true,subtree:true});

    const handleMouseDown=(event:MouseEvent)=>{
      const target=event.target as HTMLElement|null;
      const button=target?.closest<HTMLButtonElement>(".search-results .result");
      if(!button)return;

      const label=button.querySelector(":scope > span")?.textContent?.trim()??"";
      if(!label||label==="Canone")return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const title=button.querySelector("b")?.textContent?.trim()??"";
      const query=(document.getElementById("global-search") as HTMLInputElement|null)?.value.trim()??"";
      if(!query||!title)return;

      void fetch(`/api/search?q=${encodeURIComponent(query)}`,{cache:"no-store"})
        .then(r=>r.json())
        .then((data:{results?:SearchResult[]})=>{
          const item=(data.results??[]).find(result=>result.label===label&&result.title===title);
          if(!item)return;
          if(item.resultType==="italianProvision"||item.resultType==="sourceDocument"){
            window.location.href=`/legal/${encodeURIComponent(item._id)}`;
            return;
          }
          if(item.targetNumber){
            window.location.href=`/?can=${item.targetNumber}`;
          }
        });
    };

    document.addEventListener("mousedown",handleMouseDown,true);
    return()=>{
      observer.disconnect();
      document.removeEventListener("mousedown",handleMouseDown,true);
    };
  },[]);

  return null;
}
