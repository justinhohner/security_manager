// ABOUTME: Defines shared domain types for the onboarding and boundary workflow.
// ABOUTME: Keeps UI, API routes, and deterministic rules aligned to one model.
export type QuestionResponseType = "text" | "textarea" | "boolean" | "scale" | "select";

export type SectionId =
  | "engagement-setup"
  | "business-contract-context"
  | "organization-profile"
  | "environment-overview"
  | "boundary-baseline";

export interface Company {
  id: string;
  legalName: string;
}

export interface Engagement {
  id: string;
  companyId: string;
  companyName: string;
  engagementName: string;
  targetFrameworks: string[];
  targetCmmcLevel: string;
  currentStage: string;
  currentSectionId: SectionId;
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  sectionId: SectionId;
  prompt: string;
  helperText?: string;
  responseType: QuestionResponseType;
  options?: QuestionOption[];
  parentQuestionId?: string;
  isFollowUp: boolean;
}

export interface AnswerInput {
  questionId: string;
  score?: number;
  value?: string;
  rationale?: string;
}

export interface Answer extends AnswerInput {
  id: string;
  engagementId: string;
}

export interface SectionStatus {
  id: SectionId;
  title: string;
  description: string;
  totalQuestions: number;
  answeredQuestions: number;
  isComplete: boolean;
}

export interface BoundarySummary {
  summary: string;
  includesCui: boolean;
  includesFci: boolean;
  assumptions: string[];
  exclusions: string[];
  unresolvedScopeQuestions: string[];
  inScopeSystems: string[];
  protectedSystems: string[];
  confidence: number;
}

export interface OnboardingState {
  engagement: Engagement;
  sections: SectionStatus[];
  currentSectionId: SectionId;
  questions: Question[];
  followUpQuestions: Record<string, Question[]>;
  answers: Record<string, Answer>;
  boundaryPreview: BoundarySummary;
}
