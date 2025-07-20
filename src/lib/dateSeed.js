// lib/dateSeed.js
export function dateSeed() {
  const now = new Date();
  const berlinTime = new Date(now.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }));
  const y = berlinTime.getFullYear();
  const m = String(berlinTime.getMonth() + 1).padStart(2, '0');
  const d = String(berlinTime.getDate()).padStart(2, '0');
  return Number(`${y}${m}${d}`);
}

// Seedbare Zufallfunktion (Mulberry32)
export function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
