import { NextResponse } from "next/server";

/**
 * OAI-PMH provider endpoint (stub).
 * Indexers (Google Scholar, OpenAlex, BASE, CORE) harvest published article
 * metadata from here. Implement verbs: Identify, ListMetadataFormats,
 * ListSets, ListIdentifiers, ListRecords, GetRecord.
 * Metadata formats to support: oai_dc (Dublin Core), oai_jats.
 */
export async function GET(request: Request) {
  // TODO: build valid OAI-PMH XML per verb.
  // The query string is not echoed back: interpolating `verb` unescaped into
  // XML served from this origin let a crafted link inject an XHTML <script>.
  // The spec also omits request attributes when answering badVerb.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request>${new URL(request.url).origin}/api/oai</request>
  <error code="badVerb">OAI-PMH provider not yet implemented</error>
</OAI-PMH>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
