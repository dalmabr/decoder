// scrape-jazz.js
import fetch from 'node-fetch';
import fs from 'fs';

const JAZZ_ROOT = 'https://jazz.seu.server:9443/ccm';  // <-- altere
const USER      = 'seu_user';
const PASS      = 'sua_senha';
const PROJECT   = '_6xFtcAEREe2QiaA';                 // <-- ID do projeto (ver em /ccm/process/project-areas)

const cred = Buffer.from(`${USER}:${PASS}`).toString('base64');

async function* fetchAllWI() {
  let start = 0;
  const page = 50;
  while (true) {
    const url = `${JAZZ_ROOT}/oslc/contexts/${PROJECT}/workitems?` +
                `oslc.select=dcterms:identifier,dcterms:title,dcterms:type,dcterms:status&` +
                `_startIndex=${start}&_pageSize=${page}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json', Authorization: `Basic ${cred}` }
    });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    for (const wi of json['oslc:results'] || []) yield wi;
    if (!json['oslc:next']) break;
    start += page;
  }
}

(async () => {
  const rows = [];
  for await (const wi of fetchAllWI()) {
    rows.push({
      id:    wi['dcterms:identifier'],
      title: wi['dcterms:title'],
      type:  wi['dcterms:type'],
      status:wi['dcterms:status']
    });
  }
  fs.writeFileSync('jazz_data.json', JSON.stringify(rows, null, 2));
  console.log(`Salvos ${rows.length} work items em jazz_data.json`);
})();