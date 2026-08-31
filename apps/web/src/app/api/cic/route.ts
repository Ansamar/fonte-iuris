import {NextRequest, NextResponse} from "next/server";

const PROJECT_ID = "2rq93txn";
const DATASET = "production";
const API_VERSION = "2026-03-25";
const SANITY_QUERY_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`;

async function sanity<T>(query:string, params:Record<string,string|number> = {}):Promise<T>{
  const url = new URL(SANITY_QUERY_URL);
  url.searchParams.set("query", query);
  for(const [key,value] of Object.entries(params)) url.searchParams.set(`$${key}`, JSON.stringify(value));
  const response = await fetch(url, {next:{revalidate:60}});
  if(!response.ok) throw new Error(`Sanity ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  return payload.result as T;
}

const projection = `{
  _id,
  number,
  canonicalId,
  editorialTitle,
  status,
  "structure": structuralUnit->{
    _id, unitType, number, title, canonicalLabel,
    "parent": parent->{
      _id, unitType, number, title, canonicalLabel,
      "parent": parent->{
        _id, unitType, number, title, canonicalLabel,
        "parent": parent->{
          _id, unitType, number, title, canonicalLabel,
          "parent": parent->{
            _id, unitType, number, title, canonicalLabel,
            "parent": parent->{_id, unitType, number, title, canonicalLabel}
          }
        }
      }
    }
  },
  "version": *[_type == "canonVersion" && canon._ref == ^._id && language == "it" && status == "current"] | order(validFrom desc)[0]{
    _id, versionId, versionLabel, status, validFrom, validUntil,
    "text": pt::text(fullText), sourceCitation, sourceUrl, changeSummary
  }
}`;

export async function GET(request:NextRequest){
  try{
    const numberParam = request.nextUrl.searchParams.get("number");
    const queryParam = request.nextUrl.searchParams.get("q")?.trim();

    if(numberParam){
      const number = Number(numberParam);
      if(!Number.isInteger(number) || number < 368 || number > 1752) return NextResponse.json({error:"Numero di canone non valido"},{status:400});
      const canon = await sanity(`*[_type == "canon" && number == $number][0]${projection}`,{number});
      if(!canon) return NextResponse.json({error:"Canone non trovato"},{status:404});
      const nearby = await sanity(`*[_type == "canon" && number >= $from && number <= $to] | order(number asc){_id,number,editorialTitle,status,"text": *[_type == "canonVersion" && canon._ref == ^._id && language == "it" && status == "current"][0].fullText[]{children[]{text}}}` ,{from:Math.max(368,number-2),to:Math.min(1752,number+2)});
      return NextResponse.json({canon,nearby});
    }

    if(queryParam){
      const numeric = Number(queryParam.replace(/[^0-9]/g,""));
      if(Number.isInteger(numeric) && numeric >= 368 && numeric <= 1752){
        const exact = await sanity(`*[_type == "canon" && number == $number][0]{_id,number,editorialTitle,status}`,{number:numeric});
        if(exact) return NextResponse.json({results:[exact]});
      }
      const term = `*${queryParam.toLowerCase()}*`;
      const results = await sanity(`*[_type == "canon" && (lower(editorialTitle) match $term || keywords[] match $term)] | order(number asc)[0...20]{_id,number,editorialTitle,status}`,{term});
      return NextResponse.json({results});
    }

    const books = await sanity(`*[_type == "structuralUnit" && unitType == "book"] | order(order asc){_id,number,title,canonicalLabel,canonicalId}`);
    return NextResponse.json({books});
  }catch(error){
    console.error(error);
    return NextResponse.json({error:"Impossibile leggere il corpus CIC da Sanity"},{status:502});
  }
}
