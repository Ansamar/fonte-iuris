"use client";

import {useEffect} from "react";

type SearchResult={
  resultType:"canon"|"italianProvision"|"sourceDocument"|"legalRelation";
  label:string;
  title:string;
  officialUrl?:string;
  targetNumber?:number;
};

export default function SearchResultActions(){
  useEffect(()=>{
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

      const popup=label==="Fonte italiana"||label==="Documento"?window.open("about:blank","_blank"):null;
      if(popup){
        popup.document.title="Fonte Iuris";
        popup.document.body.innerHTML="<p style='font-family:system-ui;padding:24px'>Apertura della fonte ufficiale…</p>";
      }

      void fetch(`/api/search?q=${encodeURIComponent(query)}`,{cache:"no-store"})
        .then(r=>r.json())
        .then((data:{results?:SearchResult[]})=>{
          const item=(data.results??[]).find(result=>result.label===label&&result.title===title);
          if(!item){popup?.close();return;}
          if(item.officialUrl){
            if(popup)popup.location.href=item.officialUrl;
            else window.open(item.officialUrl,"_blank","noopener,noreferrer");
            return;
          }
          if(item.targetNumber){
            popup?.close();
            window.location.href=`/?can=${item.targetNumber}`;
            return;
          }
          popup?.close();
        })
        .catch(()=>popup?.close());
    };

    document.addEventListener("mousedown",handleMouseDown,true);
    return()=>document.removeEventListener("mousedown",handleMouseDown,true);
  },[]);

  return null;
}
