"use client";

import { useEffect, useState } from "react";
import { dateSeed, mulberry32 } from "../lib/dateSeed";
import { fetchPoemTitles, fetchPoemText } from "../lib/wikisource";

export default function PoemOfTheDay() {
  const [poem, setPoem] = useState({ title: "", text: "" });
  const [poemIdx, setPoemIdx] = useState(null); // Speichert manuellen Index, sonst null
  const [titles, setTitles] = useState([]);

  // Beim ersten Rendern: Titel laden
  useEffect(() => {
    async function loadTitlesAndPoem() {
      const loadedTitles = await fetchPoemTitles();
      setTitles(loadedTitles);

      // Initiales Gedicht: Seed wie gehabt (täglich gleich)
      const rng = mulberry32(dateSeed());
      const idx = Math.floor(rng() * loadedTitles.length);
      setPoemIdx(idx); // Index speichern, damit wir später einfach weiterzählen/-würfeln
    }
    loadTitlesAndPoem();
  }, []);

  // Bei Index-Änderung: Gedicht laden
  useEffect(() => {
    if (!titles.length || poemIdx === null) return;

    async function loadPoem() {
      const title = titles[poemIdx];
      const text = await fetchPoemText(title);
      setPoem({ title, text });
    }
    loadPoem();
  }, [poemIdx, titles]);

  // Button-Handler: zufälligen Index wählen (der sich evtl. vom aktuellen unterscheidet)
  function handleClick() {
    if (!titles.length) return;
    let newIdx;
    do {
      newIdx = Math.floor(Math.random() * titles.length);
    } while (newIdx === poemIdx && titles.length > 1); // kein doppeltes Gedicht
    setPoemIdx(newIdx);
  }

  return (
    <div>
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
      >
        Anderes Gedicht anzeigen
      </button>
    </div>
  );
}

