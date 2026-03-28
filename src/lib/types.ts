// ABOUTME: Defines shared domain types for the onboarding and boundary workflow.
// ABOUTME: Keeps UI, API routes, and deterministic rules aligned to one model.
export type QuestionResponseType = "text" | "textarea" | "boolean" | "scale" | "select";
export type EvidencePolicy = "none" | "optional" | "expected";

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
  evidencePolicy: EvidencePolicy;
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

export interface EvidenceReference {
  id: string;
  engagementId: string;
  answerId?: string;
  questionId?: string;
  title: string;
  source: string;
  note?: string;
}

export interface EvidenceReferenceInput {
  questionId: string;
  title: string;
  source: string;
  note?: string;
}

export interface Finding {
  id: string;
  engagementId: string;
  requirementId: string;
  controlId: string;
  title: string;
  statement: string;
  impact: string;
  evidenceUsed: string[];
  missingSupport: string[];
  confidence: string;
  priorityRationale: string;
  status: string;
  createdAt: string;
}

export interface FindingInput {
  requirementId: string;
  controlId: string;
  title: string;
  statement: string;
  impact: string;
  evidenceUsed: string[];
  missingSupport: string[];
  confidence: string;
  priorityRationale: string;
  status: string;
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

export interface BoundaryUpdateInput {
  summary?: string;
  assumptions?: string[];
  exclusions?: string[];
  inScopeSystems?: string[];
  protectedSystems?: string[];
  confidence?: number;
}

export type RequirementAssessmentStatus = "not-started" | "partial" | "supported";

export interface RequirementAssessment {
  id: string;
  framework: string;
  family: string;
  controlId: string;
  title: string;
  description: string;
  status: RequirementAssessmentStatus;
  evidenceCount: number;
  answeredQuestionIds: string[];
  missingQuestionIds: string[];
  mappedQuestionIds: string[];
  rationale: string;
}

export interface RequirementQuestionDetail {
  questionId: string;
  prompt: string;
  answered: boolean;
  answerValue?: string;
  answerScore?: number;
  evidenceReferences: EvidenceReference[];
}

export interface RequirementDetail extends RequirementAssessment {
  questionDetails: RequirementQuestionDetail[];
  nextAction: string;
  findingCandidate: {
    title: string;
    statement: string;
    impact: string;
  };
  findings: Finding[];
}

export interface AssessmentState {
  engagement: Engagement;
  requirements: RequirementAssessment[];
  counts: {
    notStarted: number;
    partial: number;
    supported: number;
  };
}

export interface RequirementDetailState {
  engagement: Engagement;
  requirement: RequirementDetail;
}

export interface OnboardingState {
  engagement: Engagement;
  sections: SectionStatus[];
  currentSectionId: SectionId;
  questions: Question[];
  followUpQuestions: Record<string, Question[]>;
  answers: Record<string, Answer>;
  evidenceReferences: Record<string, EvidenceReference[]>;
  boundaryPreview: BoundarySummary;
}

export interface CapabilitySummary {
  id: string;
  name: string;
  maturityScore: number;
  confidenceScore: number;
  summary: string;
  topGap: string;
}

export interface CapabilityDetail extends CapabilitySummary {
  whyItMatters: string;
  evidenceSignals: string[];
  nextActions: string[];
  linkedInitiativeIds: string[];
}

export interface InitiativePreview {
  id: string;
  title: string;
  priority: "do-now" | "do-next" | "plan-this-quarter";
  rationale: string;
  targetCapabilityIds: string[];
}

export interface Initiative {
  id: string;
  engagementId: string;
  title: string;
  summary: string;
  priority: "do-now" | "do-next" | "plan-this-quarter";
  targetCapabilityIds: string[];
  status: "candidate" | "planned" | "in-progress" | "completed";
  owner?: string;
  targetDate?: string;
  notes?: string;
  blockers?: string;
  createdAt: string;
}

export interface ProgramBaselineState {
  engagement: Engagement;
  summary: {
    operatingProfile: string;
    strongestArea: string;
    weakestArea: string;
    confidenceNote: string;
  };
  capabilities: CapabilitySummary[];
  roadmapPreview: InitiativePreview[];
  initiatives: Initiative[];
}

export interface CapabilityDetailState {
  engagement: Engagement;
  capability: CapabilityDetail;
}

export interface InitiativeDetailState {
  engagement: Engagement;
  initiative: Initiative & {
    whyNow: string;
    nextStatusOptions: Array<"planned" | "in-progress" | "completed">;
  };
}

export interface RoadmapWorkspaceState {
  engagement: Engagement;
  initiatives: Initiative[];
  counts: {
    candidate: number;
    planned: number;
    inProgress: number;
    completed: number;
    blocked: number;
  };
  nextFocus: string;
}
