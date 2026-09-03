"use client";

import {useEffect} from "react";

export default function PrimaryNavigationBridge(){
  useEffect(()=>{
    const onClick=(event:MouseEvent)=>{
      const target=event.target as HTMLElement|null;
      const button=target?.closest("button");
      if(!button)return;
      const label=(button.textContent??"").replace(/\s+/g," ").trim().toLocaleLowerCase("it");
      if(label.includes("fonti normative")){
        event.preventDefault();
        window.location.href="/fonti";
      }
    };
    document.addEventListener("click",onClick,true);
    return()=>document.removeEventListener("click",onClick,true);
  },[]);
  return null;
}
