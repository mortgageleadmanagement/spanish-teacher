import { normalize } from "../services/intents";
import type { ExpectStep, Lesson, LessonStep } from "./types";

/**
 * Pure lesson state machine. The screen drives it:
 *   next() → what she should do now (speak / listen)
 *   answer(transcript) → outcome of Ross's reply
 * Keeping it pure makes it trivially testable and later swappable
 * for a server-driven or LLM-augmented engine.
 */

export type EngineAction =
  | { type: "speak"; text: string; gloss?: string; slow?: boolean; thenListen: false }
  | { type: "listen"; step: ExpectStep }
  | { type: "finished" };

export type AnswerResult =
  | { type: "pass"; praise: string }
  | { type: "retry"; hint: string; replayModel: boolean }
  | { type: "control" };

export class LessonEngine {
  private i = 0;
  private failCount = 0;

  constructor(public readonly lesson: Lesson) {}

  /** Current position, for progress display and persistence. */
  get index(): number {
    return this.i;
  }

  get total(): number {
    return this.lesson.steps.length;
  }

  restoreTo(index: number): void {
    this.i = Math.min(Math.max(index, 0), this.lesson.steps.length);
    this.failCount = 0;
  }

  current(): LessonStep | null {
    return this.i < this.lesson.steps.length ? this.lesson.steps[this.i] : null;
  }

  next(): EngineAction {
    const step = this.current();
    if (!step) return { type: "finished" };
    if (step.kind === "say") {
      return { type: "speak", text: step.speak, gloss: step.gloss, slow: step.slow, thenListen: false };
    }
    return { type: "listen", step };
  }

  /** Advance past a completed "say" step. */
  advance(): void {
    this.i++;
    this.failCount = 0;
  }

  /**
   * Pure check: would this transcript pass the current expect step?
   * Used by the screen to let a correct answer win over the control-phrase
   * matcher (Lesson 2 teaches "otra vez" etc. as expected answers).
   */
  wouldPass(transcript: string): boolean {
    const step = this.current();
    if (!step || step.kind !== "expect") return false;
    const heard = normalize(transcript);
    return step.accept.some((a) => {
      const want = normalize(a);
      return (
        heard === want ||
        heard.includes(want) ||
        (want.includes(heard) && heard.length >= Math.ceil(want.length * 0.6))
      );
    });
  }

  /**
   * Judge Ross's reply against the current expect step.
   * Matching is deliberately forgiving: normalized substring/containment —
   * the recognizer often pads or trims words.
   */
  answer(transcript: string): AnswerResult {
    const step = this.current();
    if (!step || step.kind !== "expect") return { type: "control" };

    if (this.wouldPass(transcript)) {
      this.advance();
      return { type: "pass", praise: step.onPass };
    }

    this.failCount++;
    // Two misses → replay the model line slowly, then keep listening (never a wall).
    return { type: "retry", hint: step.hint, replayModel: this.failCount >= 2 };
  }

  /** Skip a step Ross can't get past (wired to the "next" control intent). */
  skip(): void {
    this.advance();
  }
}
