import {NextRequest, NextResponse} from "next/server";

const PROJECT_ID = "2rq93txn";
const DATASET = "production";
const API_VERSION = "2026-03-25";
const SANITY_QUERY_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`;
const FIRST_CANON = 1;
const LAST_CANON = 1752;

async function sanity<T>(query:string, params:Record<string,string|number> = {}):Promise<T>{
  const url = new URL(SANITY_QUERY_URL);
  url.searchParams.set("query", query);
  for(const [key,value] of Object.entries(params)) url.searchParams.set(`$${key}`, JSON.stringify(value));
  const response = await fetch(url, {next:{revalidate:60}});
  if(!response.ok) throw new Error(`Corpus API ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  return payload.result as T;
}

const structureProjection = `{
  _id, unitType, number, title, canonicalLabel, canonicalId,
  "parent": parent->{
    _id, unitType, number, title, canonicalLabel, canonicalId,
    "parent": parent->{
      _id, unitType, number, title, canonicalLabel, canonicalId,
      "parent": parent->{
        _id, unitType, number, title, canonicalLabel, canonicalId,
        "parent": parent->{
          _id, unitType, number, title, canonicalLabel, canonicalId,
          "parent": parent->{_id, unitType, number, title, canonicalLabel, canonicalId}
        }
      }
    }
  }
}`;

const canonProjection = `{
  _id,
  number,
  canonicalId,
  editorialTitle,
  keywords,
  status,
  "structure": structuralUnit->${structureProjection},
  "version": *[_type == "canonVersion" && canon._ref == ^._id && language == "it" && status == "current"] | order(validFrom desc)[0]{
    _id, versionId, versionLabel, status, validFrom, validUntil,
    "text": pt::text(fullText), sourceCitation, sourceUrl, changeSummary
  },
  "versions": *[_type == "canonVersion" && canon._ref == ^._id && language == "it"] | order(validFrom desc){
    _id, versionId, versionLabel, status, validFrom, validUntil,
    "text": pt::text(fullText), sourceCitation, sourceUrl, changeSummary
  },
  "segments": *[_type == "canonSegment" && canon._ref == ^._id] | order(order asc){
    _id, segmentId, segmentType, label, order, startOffset, endOffset, isFormalDivision,
    "parentId": parentSegment->_id
  }
}`;

type SearchRow={
  _id:string;
  number:number;
  editorialTitle?:string;
  keywords?:string[];
  status:string;
  text?:string;
  structure?:{title?:string;parent?:{title?:string;parent?:{title?:string;parent?:{title?:string;parent?:{title?:string}}}}};
};

function normalize(value?:string){return (value??"").toLocaleLowerCase("it").normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function structureTitles(row:SearchRow){
  const titles:string[]=[];
  let current:SearchRow["structure"]|undefined=row.structure;
  while(current){if(current.title)titles.unshift(current.title);current=current.parent;}
  return titles;
}
function excerpt(text:string|undefined, query:string){
  const clean=(text??"").replace(/\s+/g," ").trim();
  if(!clean)return "";
  const hay=normalize(clean); const needle=normalize(query);
  const hit=hay.indexOf(needle);
  const start=hit<0?0:Math.max(0,hit-55);
  const end=Math.min(clean.length,start+175);
  return `${start>0?"…":""}${clean.slice(start,end).trim()}${end<clean.length?"…":""}`;
}
function rank(row:SearchRow, query:string){
  const needle=normalize(query);
  const title=normalize(row.editorialTitle);
  const path=normalize(structureTitles(row).join(" "));
  const keywords=normalize((row.keywords??[]).join(" "));
  const text=normalize(row.text);
  let score=0;
  if(title===needle)score+=80; else if(title.includes(needle))score+=40;
  if(keywords.includes(needle))score+=32;
  if(path.includes(needle))score+=28;
  if(text.includes(needle))score+=10;
  const occurrences=needle?text.split(needle).length-1:0;
  score+=Math.min(occurrences,8);
  return score;
}

export async function GET(request:NextRequest){
  try{
    const numberParam = request.nextUrl.searchParams.get("number");
    const queryParam = request.nextUrl.searchParams.get("q")?.trim();
    const browse = request.nextUrl.searchParams.get("browse");
    const bookId = request.nextUrl.searchParams.get("book")?.trim();

    if(numberParam){
      const number = Number(numberParam);
      if(!Number.isInteger(number) || number < FIRST_CANON || number > LAST_CANON){
        return NextResponse.json({error:"Numero di canone non valido"},{status:400});
      }
      const canon = await sanity(`*[_type == "canon" && number == $number][0]${canonProjection}`,{number});
      if(!canon) return NextResponse.json({error:"Canone non trovato"},{status:404});
      const nearby = await sanity(`*[_type == "canon" && number >= $from && number <= $to] | order(number asc){
        _id, number, editorialTitle, status,
        "text": *[_type == "canonVersion" && canon._ref == ^._id && language == "it" && status == "current"][0].fullText[]{children[]{text}}
      }`,{from:Math.max(FIRST_CANON,number-2),to:Math.min(LAST_CANON,number+2)});
      return NextResponse.json({canon,nearby});
    }

    if(bookId){
      const prefix = `${bookId}*`;
      const canons = await sanity(`*[_type == "canon" && structuralUnit->canonicalId match $prefix] | order(number asc){
        _id, number, editorialTitle, status,
        "text": *[_type == "canonVersion" && canon._ref == ^._id && language == "it" && status == "current"][0].fullText[]{children[]{text}}
      }`,{prefix});
      return NextResponse.json({canons});
    }

    if(queryParam){
      const digits = queryParam.match(/\d{1,4}/)?.[0];
      const numeric = digits ? Number(digits) : NaN;
      if(Number.isInteger(numeric) && numeric >= FIRST_CANON && numeric <= LAST_CANON){
        const exact = await sanity(`*[_type == "canon" && number == $number][0]{_id,number,editorialTitle,status}`,{number:numeric});
        if(exact) return NextResponse.json({results:[exact]});
      }

      const term = `*${queryParam.toLowerCase()}*`;
      const rows = await sanity<SearchRow[]>(`*[
        _type == "canon" && (
          lower(coalesce(editorialTitle,"")) match $term ||
          keywords[] match $term ||
          structuralUnit->title match $term ||
          structuralUnit->parent->title match $term ||
          structuralUnit->parent->parent->title match $term ||
          _id in *[_type == "canonVersion" && language == "it" && status == "current" && pt::text(fullText) match $term].canon._ref
        )
      ][0...120]{
        _id,number,editorialTitle,keywords,status,
        "text": pt::text(((*[_type == "canonVersion" && canon._ref == ^._id && language == "it" && status == "current"] | order(validFrom desc))[0]).fullText),
        "structure": structuralUnit->{title,"parent":parent->{title,"parent":parent->{title,"parent":parent->{title,"parent":parent->{title}}}}}
      }`,{term});

      const results=rows.map(row=>{
        const titles=structureTitles(row);
        return {
          _id:row._id,
          number:row.number,
          editorialTitle:row.editorialTitle,
          status:row.status,
          contextPath:titles.slice(-3).join(" · "),
          snippet:excerpt(row.text,queryParam),
          matchReason:titles.some(t=>normalize(t).includes(normalize(queryParam)))?"Collocazione sistematica":(row.keywords??[]).some(k=>normalize(k).includes(normalize(queryParam)))?"Materia indicizzata":"Testo normativo",
          score:rank(row,queryParam)
        };
      }).sort((a,b)=>b.score-a.score||a.number-b.number).slice(0,30);
      return NextResponse.json({results});
    }

    if(browse === "books"){
      const books = await sanity(`*[_type == "structuralUnit" && unitType == "book"] | order(order asc){_id,number,title,canonicalLabel,canonicalId}`);
      return NextResponse.json({books});
    }

    return NextResponse.json({ok:true});
  }catch(error){
    console.error(error);
    return NextResponse.json({error:"Non riesco a leggere il corpus CIC"},{status:502});
  }
}
