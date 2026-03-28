// ABOUTME: Tests question-driven UI behavior decisions for onboarding fields.
// ABOUTME: Prevents save affordances from drifting across question types.
import { describe, expect, it } from "vitest";
import { getQuestionById } from "@/lib/onboarding";
import { usesExplicitSave } from "@/lib/question-behavior";

describe("usesExplicitSave", () => {
  it("returns true for text-style questions that need an explicit save action", () => {
    expect(usesExplicitSave(getQuestionById("lead-assessor")!)).toBe(true);
    expect(usesExplicitSave(getQuestionById("core-systems")!)).toBe(true);
  });

  it("returns false for immediate-save questions", () => {
    expect(usesExplicitSave(getQuestionById("handles-cui")!)).toBe(false);
    expect(usesExplicitSave(getQuestionById("boundary-confidence")!)).toBe(false);
  });
});
