import type { Lesson } from "./types";

/**
 * Lesson 1 — "Meeting her" (curriculum §4, Lesson 1).
 * Pronunciation focus: pure vowels. Voice-only walking-skeleton version:
 * teach 6 chunks → short drills → communicative task (a complete first
 * meeting, run twice, second time with variation).
 */
export const lesson01: Lesson = {
  id: "L01",
  title: "Lección 1 — Meeting her",
  steps: [
    {
      kind: "say",
      speak:
        "¡Hola, Ross! I'm your profesora. Today you learn your first real Spanish — a whole first meeting. Listen first, then you speak.",
    },
    {
      kind: "say",
      speak: "Hola. Buenos días.",
      gloss: "Hi. Good morning.",
      slow: true,
    },
    {
      kind: "say",
      speak:
        "Spanish vowels are short and pure. Not 'oh-la' — 'o-la'. Your turn: say... Hola, buenos días.",
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["hola buenos dias", "buenos dias"],
      prompt: "Say: Hola, buenos días",
      hint: "Almost — keep every vowel short. O-la. Bue-nos di-as. Try again.",
      onPass: "Sí. Clean vowels — that's the whole secret.",
      model: "Hola. Buenos días.",
    },
    {
      kind: "say",
      speak: "¿Cómo estás?",
      gloss: "How are you?",
      slow: true,
    },
    {
      kind: "say",
      speak: "That's the question you'll hear every day of your life now. Ask me: ¿Cómo estás?",
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["como estas"],
      prompt: "Ask: ¿Cómo estás?",
      hint: "Stress the last part: co-mo es-TAS. Otra vez — again.",
      onPass: "Muy bien. And here's my answer...",
      model: "¿Cómo estás?",
    },
    {
      kind: "say",
      speak: "Bien, gracias. ¿Y tú?",
      gloss: "Fine, thanks. And you?",
      slow: true,
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["bien gracias y tu", "bien gracias", "muy bien gracias y tu"],
      prompt: "Answer: Bien, gracias. ¿Y tú?",
      hint: "GRA-cias — two syllables, no 'sh'. Bien, gracias, ¿y tú?",
      onPass: "That 'gracias' was tidy.",
      model: "Bien, gracias. ¿Y tú?",
    },
    {
      kind: "say",
      speak: "Me llamo Dalia.",
      gloss: "My name is Dalia.",
      slow: true,
    },
    {
      kind: "say",
      speak: "Double L sounds like the y in 'yes': me YA-mo. Tell me your name: Me llamo Ross.",
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["me llamo ross", "me llamo"],
      prompt: "Say: Me llamo Ross",
      hint: "Me YA-mo Ross. No 'L' sound in llamo. Try again.",
      onPass: "Mucho gusto, Ross — which is exactly the next phrase.",
      model: "Me llamo Ross.",
    },
    {
      kind: "say",
      speak: "Mucho gusto.",
      gloss: "Nice to meet you.",
      slow: true,
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["mucho gusto"],
      prompt: "Say: Mucho gusto",
      hint: "MU-cho GUS-to — the u is short, like 'oo' in 'book'.",
      onPass: "Igualmente — that means 'likewise'. Just listen for now.",
      model: "Mucho gusto.",
    },
    {
      kind: "say",
      speak: "Hasta mañana.",
      gloss: "See you tomorrow.",
      slow: true,
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["hasta manana"],
      prompt: "Say: Hasta mañana",
      hint: "The h is silent, and ñ says 'ny': AS-ta ma-NYA-na.",
      onPass: "Perfecto — silent h and a real ñ.",
      model: "Hasta mañana.",
    },
    {
      kind: "say",
      speak:
        "Now the real thing: a complete first meeting, you and me, start to finish. I begin — you answer from memory. ¡Hola! Buenos días.",
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["hola buenos dias", "buenos dias", "hola"],
      prompt: "She greeted you — greet her back",
      hint: "Greet me back: Hola, buenos días.",
      onPass: "¿Cómo estás?",
      model: "Hola, buenos días.",
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["bien gracias y tu", "muy bien gracias y tu", "bien gracias"],
      prompt: "She asked how you are — answer, and ask her back",
      hint: "Bien, gracias... and send it back with ¿y tú?",
      onPass: "Muy bien, gracias. Me llamo Dalia. ¿Y tú?",
      model: "Bien, gracias. ¿Y tú?",
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["me llamo ross"],
      prompt: "Tell her your name",
      hint: "Me llamo Ross.",
      onPass: "Mucho gusto, Ross.",
      model: "Me llamo Ross.",
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["mucho gusto"],
      prompt: "Nice to meet you too...",
      hint: "Mucho gusto.",
      onPass: "And we're done for today, so...",
      model: "Mucho gusto.",
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["hasta manana", "adios hasta manana"],
      prompt: "Say goodbye — see you tomorrow",
      hint: "Hasta mañana.",
      onPass: "¡Hasta mañana, Ross!",
      model: "Hasta mañana.",
    },
    {
      kind: "say",
      speak:
        "Round two — same meeting, but real conversations never repeat exactly. If I say '¿qué tal?', it also means 'how's it going' — answer it like ¿cómo estás? Ready... ¡Buenas! ¿Qué tal?",
    },
    {
      kind: "expect",
      lang: "es-MX",
      accept: ["bien gracias y tu", "muy bien gracias y tu", "bien gracias", "muy bien y tu"],
      prompt: "New words, same meaning — answer her",
      hint: "¿Qué tal? works like ¿cómo estás? — Bien, gracias, ¿y tú?",
      onPass: "¡Muy bien! You just survived your first curveball.",
      model: "Bien, gracias. ¿Y tú?",
    },
    {
      kind: "say",
      speak:
        "That's Lesson 1: you met someone in Spanish, twice. Tomorrow, Lesson 2 — you learn to run these lessons in Spanish. Hasta mañana, Ross.",
      gloss: "See you tomorrow.",
    },
  ],
};
