"use client";

import { useEffect, useState } from "react";
import { dateSeed, mulberry32 } from "../lib/dateSeed";
import { fetchPoemTitles, fetchPoemText } from "../lib/wikisource";

// Hilfsfunktion: Gedicht laden, bei Leertext neue Auswahl versuchen
async function loadPoem(titles, maxTries = 5) {
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const idx = Math.floor(Math.random() * titles.length);
    const title = titles[idx];
    try {
      const text = await fetchPoemText(title);
      if (text && text.trim()) {
        return { idx, title, text };
      }
      // sonst: nächster Versuch
    } catch (err) {
      // Fehler optional loggen, dann neuen Versuch
    }
  }
  throw new Error("Konnte nach mehreren Versuchen kein nicht-leeres Gedicht finden.");
}

export default function PoemOfTheDay() {
  const [poem, setPoem] = useState({ title: "", text: "" });
  const [poemIdx, setPoemIdx] = useState(null);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initiales Laden: Titel und Gedicht zum Tages-Seed
  useEffect(() => {
    async function initialLoad() {
      setLoading(true);
      setError("");
      try {
        const loadedTitles = await fetchPoemTitles();
        setTitles(loadedTitles);

        const rng = mulberry32(dateSeed());
        const idx = Math.floor(rng() * loadedTitles.length);
        const title = loadedTitles[idx];
        const text = await fetchPoemText(title);

        if (text && text.trim()) {
          setPoem({ title, text });
          setPoemIdx(idx);
        } else {
          // Leerer Text → Fallback: wirklich gültiges Gedicht laden
          const fallbackPoem = await loadPoem(loadedTitles);
          setPoem({ title: fallbackPoem.title, text: fallbackPoem.text });
          setPoemIdx(fallbackPoem.idx);
        }
      } catch (err) {
        setError("Gedicht konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }
    initialLoad();
  }, []);

  // Button: neues zufälliges Gedicht (kein doppeltes, kein Leertext)
  async function handleClick() {
    if (!titles.length) return;
    setLoading(true);
    setError("");
    try {
      // Nur Gedichte wählen, deren Index nicht poemIdx ist (wenn möglich)
      let filteredTitles = titles;
      if (titles.length > 1 && poemIdx !== null) {
        filteredTitles = titles.filter((_, i) => i !== poemIdx);
      }
      const fallbackPoem = await loadPoem(filteredTitles);
      setPoem({ title: fallbackPoem.title, text: fallbackPoem.text });
      setPoemIdx(
        titles.findIndex((t) => t === fallbackPoem.title)
      );
    } catch (err) {
      setError("Neues Gedicht konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {loading && <div>Wird geladen…</div>}
      {!loading && !error && (
        <>
          <h2>{poem.title}</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{poem.text}</pre>
          <button
            onClick={handleClick}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              cursor: "pointer"
            }}
            disabled={loading}
          >
            Anderes Gedicht anzeigen
          </button>
        </>
      )}
    </div>
  );
}