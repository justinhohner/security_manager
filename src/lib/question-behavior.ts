// ABOUTME: Encodes small UI behaviors that vary by onboarding question shape.
// ABOUTME: Keeps save and evidence affordances consistent across the workspace.
import type { Question } from "@/lib/types";

export function usesExplicitSave(question: Question) {
  return question.responseType === "text" || question.responseType === "textarea";
}
