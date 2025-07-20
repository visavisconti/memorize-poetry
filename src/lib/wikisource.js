// lib/wikisource.js
export async function fetchPoemTitles() {
  const category = "Kategorie:Gedicht";
  const apiUrl = `${process.env.WIKISOURCE_API_BASE}?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=50&format=json&origin=*`;
  
 
  console.log("API-URL:", apiUrl);
  const res = await fetch(apiUrl);
  const data = await res.json();
  const allTitles = data.query.categorymembers.map((item) => item.title);
  const filteredTitles = allTitles.filter(title => !title.includes('(') && !title.includes(')'));
  return filteredTitles;
}

export async function fetchPoemText(title) {
  const apiUrl = `${process.env.WIKISOURCE_API_BASE}?action=query&prop=revisions&titles=${encodeURIComponent(title)}&rvslots=*&rvprop=content&format=json&origin=*`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  if (!page.revisions || !page.revisions[0]?.slots?.main['*']) {
    throw new Error(`Kein Gedichttext für "${title}" gefunden.`);
  }
  const wikitext = page.revisions[0].slots.main['*'];

  // Extrahiere zwischen <poem> und </poem>
  const match = wikitext.match(/<poem>([\s\S]*?)<\/poem>/);
  if (!match) {
    throw new Error("Kein <poem>-Block gefunden!");
  }
  const poemText = match[1].trim();
  return poemText;
}



// Sehr vereinfachte Markup-Entfernung
function extractPlainText(wikitext) {
  return wikitext
    .replace(/{{.*?}}/gs, "")               // Templates entfernen
    .replace(/\[\[.*?\|(.+?)\]\]/g, "$1")   // Wiki-Links
    .replace(/\[\[(.*?)\]\]/g, "$1")
    .replace(/''+/g, "")                    // Kursiv/Fett
    .replace(/<.*?>/g, "")                  // HTML-Tags
    .replace(/==.*?==/g, "")                // Überschriften
    .trim();
}

