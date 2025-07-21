"use client";

import { useEffect, useState } from "react";
import { dateSeed, mulberry32 } from "../lib/dateSeed";
import { fetchPoemTitles, fetchPoemText } from "../lib/wikisource";

function groupPoemIntoStanzas(poemText, linesPerStanza = 4) {
  const lines = poemText.split("\n").map(line => line.trim()).filter(Boolean);
  const stanzas = [];
  for (let i = 0; i < lines.length; i += linesPerStanza) {
    stanzas.push(lines.slice(i, i + linesPerStanza));
  }
  return stanzas;
}

export default function PoemOfTheDay() {
  const [poem, setPoem] = useState({ title: "", text: "" });
  const [poemIdx, setPoemIdx] = useState(null);
  const [titles, setTitles] = useState([]);
  const [blur, setBlur] = useState(false);

  // Initial: Lade die Titel und das Tagesgedicht
  useEffect(() => {
    async function initialLoad() {
      const loadedTitles = await fetchPoemTitles();
      setTitles(loadedTitles);

      const rng = mulberry32(dateSeed());
      const idx = Math.floor(rng() * loadedTitles.length);
      const title = loadedTitles[idx];
      const text = await fetchPoemText(title);

      setPoem({ title, text: text.trim() });
      setPoemIdx(idx);
    }
    initialLoad();
  }, []);

  // Button: Lade zufällig anderes Gedicht
  async function handleOtherPoem() {
    if (!titles.length) return;
    let newIdx;
    do {
      newIdx = Math.floor(Math.random() * titles.length);
    } while (titles.length > 1 && newIdx === poemIdx); // kein Duplikat
    const title = titles[newIdx];
    const text = await fetchPoemText(title);

    setPoem({ title, text: text.trim() });
    setPoemIdx(newIdx);
    setBlur(false);
  }

  return (
    <div>
      <style>{`
        .poem-stanza {
          margin-bottom: 1.5rem;
          transition: filter 0.3s ease;
        }
        .blurry {
          filter: blur(4px);
        }
        .blurry:hover {
          filter: blur(0);
        }
      `}</style>
      <h2>{poem.title}</h2>
      <button
        onClick={() => setBlur(b => !b)}
        style={{ marginBottom: "1rem", marginRight: "1rem"}}
      >
        {blur ? "Gedicht scharf machen" : "Gedicht unscharf machen"}
      </button>
      <button
        onClick={handleOtherPoem}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          cursor: "pointer"
        }}
      >
        Anderes Gedicht anzeigen
      </button>
      <div id="poem">
        {groupPoemIntoStanzas(poem.text, 4).map((stanza, idx) => (
          <div className={`poem-stanza${blur ? " blurry" : ""}`} key={idx}>
            {stanza.map((line, lidx) => (
              <div key={lidx}>{line}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
