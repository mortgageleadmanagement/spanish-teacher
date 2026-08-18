export type WordTiming = {
  word: string;
  /** fraction of total audio duration [0..1) at which this word starts/ends */
  startFrac: number;
  endFrac: number;
};

/**
 * Approximate per-word timings by syllable weight.
 * Exact timestamps come later from the pre-generated content pipeline
 * (Azure batch synthesis word-boundary data); this estimate is good enough
 * for readable karaoke on live-synthesized speech.
 */
export function estimateWordTimings(text: string): WordTiming[] {
  const rawWords = text.split(/\s+/).filter((w) => w.length > 0);
  if (rawWords.length === 0) return [];
  const weights = rawWords.map((w) => {
    const vowelGroups = w.toLowerCase().match(/[aeiouáéíóúü]+/g);
    let weight = Math.max(1, vowelGroups ? vowelGroups.length : 1);
    // punctuation implies a pause — charge it to the preceding word
    if (/[.!?…]$/.test(w)) weight += 1.6;
    else if (/[,;:]$/.test(w)) weight += 0.8;
    return weight;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  const timings: WordTiming[] = [];
  let acc = 0;
  for (let i = 0; i < rawWords.length; i++) {
    const start = acc / total;
    acc += weights[i];
    timings.push({ word: rawWords[i], startFrac: start, endFrac: acc / total });
  }
  return timings;
}

