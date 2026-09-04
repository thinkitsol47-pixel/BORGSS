import { NextResponse } from "next/server";

/**
 * OAI-PMH provider endpoint (stub).
 * Indexers (Google Scholar, OpenAlex, BASE, CORE) harvest published article
 * metadata from here. Implement verbs: Identify, ListMetadataFormats,
 * ListSets, ListIdentifiers, ListRecords, GetRecord.
 * Metadata formats to support: oai_dc (Dublin Core), oai_jats.
 */
export async function GET(request: Request) {
  const verb = new URL(request.url).searchParams.get("verb") ?? "Identify";
  // TODO: build valid OAI-PMH XML per verb
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request verb="${verb}">${new URL(request.url).origin}/api/oai</request>
  <error code="badVerb">OAI-PMH provider not yet implemented</error>
</OAI-PMH>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
