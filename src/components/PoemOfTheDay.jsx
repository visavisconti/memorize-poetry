"use client";

import { useEffect, useState } from "react";
import { dateSeed, mulberry32 } from "../lib/dateSeed";
import { fetchPoemTitles, fetchPoemText } from "../lib/wikisource";

// Gruppiert Textzeilen in Strophen à 4 Zeilen
function groupPoemIntoStanzas(poemText, linesPerStanza = 4) {
  const lines = poemText.split("\n").map(line => line.trim()).filter(Boolean);
  const stanzas = [];
  for (let i = 0; i < lines.length; i += linesPerStanza) {
    stanzas.push(lines.slice(i, i + linesPerStanza));
  }
  return stanzas;
}

// Lädt ein nicht-leeres Gedicht aus der Liste der Titel
async function loadPoem(titles, excludeIdx = null, maxTries = 6) {
  for (let attempt = 0; attempt < maxTries; attempt++) {
    let idx;
    do {
      idx = Math.floor(Math.random() * titles.length);
    } while (titles.length > 1 && idx === excludeIdx);

    const title = titles[idx];
    try {
      const text = await fetchPoemText(title);
      if (text && text.trim()) {
        return { idx, title, text: text.trim() };
      }
    } catch {
      // Ignorieren, neuer Versuch
    }
  }
  throw new Error("Es konnte kein vollständiges Gedicht geladen werden.");
}

export default function PoemOfTheDay() {
  const [poem, setPoem] = useState({ title: "", text: "" });
  const [poemIdx, setPoemIdx] = useState(null);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blur, setBlur] = useState(false);

  // Initial: Lade die Gedicht-Titel & Tagesgedicht
  useEffect(() => {
    async function initialLoad() {
      setLoading(true);
      setError("");
      try {
        const loadedTitles = await fetchPoemTitles();
        setTitles(loadedTitles);

        // Gedicht des Tages wählen mit seedbasiertem Zufall
        const rng = mulberry32(dateSeed());
        const idx = Math.floor(rng() * loadedTitles.length);
        const title = loadedTitles[idx];
        const text = await fetchPoemText(title);

        if (text && text.trim()) {
          setPoem({ title, text: text.trim() });
          setPoemIdx(idx);
        } else {
          // Fallback: suche Nicht-Leertext-Gedicht
          const result = await loadPoem(loadedTitles);
          setPoem({ title: result.title, text: result.text });
          setPoemIdx(result.idx);
        }
      } catch {
        setError("Gedicht konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    initialLoad();
  }, []);

  // Neues zufälliges Gedicht laden (kein Duplikat)
  async function handleOtherPoem() {
    if (!titles.length) return;
    setLoading(true);
    setError("");
    try {
      const result = await loadPoem(titles, poemIdx, 6);
      setPoem({ title: result.title, text: result.text });
      setPoemIdx(result.idx);
      setBlur(false); // Blur zurücksetzen
    } catch {
      setError("Neues Gedicht konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Stanza/Blur Styling */}
      <style>{`
        .poem-stanza {
          margin-bottom: 1.2rem;
          transition: filter 0.3s ease;
        }

        .blurry {
          filter: blur(4px);
        }

        .blurry:hover {
          filter: blur(0);
        }
      `}</style>

      {/* Eigentliche App */}
      {loading && <p>Wird geladen…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <h2>{poem.title}</h2>

          <button
            onClick={() => setBlur(b => !b)}
            style={{
              marginBottom: "1rem",
              marginRight: "1rem",
            }}
          >
            {blur ? "Sichtbar machen" : "Verdecken"}
          </button>

          <button
            onClick={handleOtherPoem}
            style={{
              marginBottom: "1rem",
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            Anderes Gedicht anzeigen
          </button>

          <div id="poem">
            {groupPoemIntoStanzas(poem.text).map((stanza, idx) => (
              <div
                className={`poem-stanza${blur ? " blurry" : ""}`}
                key={idx}
              >
                {stanza.map((line, lidx) => (
                  <div key={lidx}>{line}</div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

