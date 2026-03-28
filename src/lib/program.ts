// ABOUTME: Derives a program-first baseline from the saved onboarding state.
// ABOUTME: Produces capability summaries, detail views, and a roadmap preview without replacing persisted workflow data.
import type {
  Answer,
  BoundarySummary,
  CapabilityDetailState,
  Engagement,
  EvidenceReference,
  Initiative,
  InitiativeDetailState,
  InitiativePreview,
  ProgramBaselineState,
} from "@/lib/types";

export function buildProgramBaselineState(input: {
  engagement: Engagement;
  answers: Record<string, Answer>;
  evidenceByQuestionId: Record<string, EvidenceReference[]>;
  boundaryPreview: BoundarySummary;
  initiatives: ProgramBaselineState["initiatives"];
}): ProgramBaselineState {
  const capabilities = [
    buildGovernanceCapability(input.answers),
    buildIdentityCapability(input.answers),
    buildAssetCapability(input.answers),
    buildDependencyCapability(input.answers),
    buildBoundaryCapability(input.answers, input.boundaryPreview),
  ];
  const weakestArea = [...capabilities].sort(byWeakestFirst)[0];
  const strongestArea = [...capabilities].sort(byStrongestFirst)[0];

  return {
    engagement: input.engagement,
    summary: {
      operatingProfile: buildOperatingProfile(input.answers, input.boundaryPreview),
      strongestArea: strongestArea.name,
      weakestArea: weakestArea.name,
      confidenceNote: buildConfidenceNote(capabilities),
    },
    capabilities,
    roadmapPreview: buildRoadmapPreview(capabilities, input.answers),
    initiatives: input.initiatives,
  };
}

export function buildCapabilityDetailState(input: {
  engagement: Engagement;
  capabilityId: string;
  answers: Record<string, Answer>;
  evidenceByQuestionId: Record<string, EvidenceReference[]>;
  boundaryPreview: BoundarySummary;
  initiatives: ProgramBaselineState["initiatives"];
}): CapabilityDetailState | undefined {
  const baseline = buildProgramBaselineState(input);
  const capability = baseline.capabilities.find((item) => item.id === input.capabilityId);

  if (!capability) {
    return undefined;
  }

  const linkedInitiatives = baseline.roadmapPreview.filter((initiative) =>
    initiative.targetCapabilityIds.includes(capability.id),
  );

  return {
    engagement: input.engagement,
    capability: {
      ...capability,
      whyItMatters: buildWhyItMatters(capability.id),
      evidenceSignals: buildEvidenceSignals(capability.id, input.answers, input.boundaryPreview),
      nextActions: [capability.topGap, ...linkedInitiatives.map((initiative) => initiative.title)],
      linkedInitiativeIds: linkedInitiatives.map((initiative) => initiative.id),
    },
  };
}

export function buildInitiativeInput(preview: InitiativePreview) {
  return {
    title: preview.title,
    summary: preview.rationale,
    priority: preview.priority,
    targetCapabilityIds: preview.targetCapabilityIds,
    status: "candidate",
  };
}

export function buildInitiativeDetailState(input: {
  engagement: Engagement;
  initiative: Initiative;
}): InitiativeDetailState {
  return {
    engagement: input.engagement,
    initiative: {
      ...input.initiative,
      whyNow: `This initiative is currently prioritized as ${input.initiative.priority.replaceAll("-", " ")} because it addresses a near-term program need.`,
      nextStatusOptions: buildNextStatusOptions(input.initiative.status),
    },
  };
}

function buildGovernanceCapability(answers: Record<string, Answer>) {
  const maturityScore = answers["security-program-maturity"]?.score ?? 1;

  return {
    id: "governance-policy",
    name: "Governance and policy",
    maturityScore,
    confidenceScore: clampScore(maturityScore),
    summary:
      maturityScore >= 4
        ? "The client reports a fairly established program baseline."
        : "The current program baseline appears underdeveloped or inconsistent.",
    topGap:
      maturityScore >= 4
        ? "Validate that the claimed maturity is backed by current artifacts."
        : "Establish a more repeatable governance and policy baseline.",
  };
}

function buildIdentityCapability(answers: Record<string, Answer>) {
  const hasIdentityProvider = Boolean(answers["identity-provider"]?.value?.trim());

  return {
    id: "identity-access",
    name: "Identity and access management",
    maturityScore: hasIdentityProvider ? 3 : 1,
    confidenceScore: hasIdentityProvider ? 3 : 1,
    summary: hasIdentityProvider
      ? "An identity platform is named, but the access program still needs deeper validation."
      : "No identity platform is recorded yet.",
    topGap: hasIdentityProvider
      ? "Confirm MFA, privileged access, and joiner-mover-leaver practices."
      : "Identify the primary identity platform and ownership model.",
  };
}

function buildAssetCapability(answers: Record<string, Answer>) {
  const systemCount = splitCommaList(answers["core-systems"]?.value).length;

  return {
    id: "asset-configuration",
    name: "Asset and configuration management",
    maturityScore: systemCount > 1 ? 3 : systemCount === 1 ? 2 : 1,
    confidenceScore: systemCount > 0 ? 3 : 1,
    summary:
      systemCount > 0
        ? "The consultant has a starter system inventory for the environment."
        : "The system inventory is still too thin to trust as a baseline.",
    topGap:
      systemCount > 0
        ? "Expand the inventory into a more authoritative system and ownership view."
        : "Document the primary systems and owners that matter to the program.",
  };
}

function buildDependencyCapability(answers: Record<string, Answer>) {
  const outsourcedIt = answers["outsourced-it"]?.value === "true";
  const providerNamed = Boolean(answers["outsourced-it-provider"]?.value?.trim());

  return {
    id: "vendor-third-party",
    name: "Vendor and third-party oversight",
    maturityScore: outsourcedIt ? (providerNamed ? 3 : 2) : 3,
    confidenceScore: outsourcedIt ? (providerNamed ? 3 : 2) : 4,
    summary: outsourcedIt
      ? providerNamed
        ? "Outsourced support is in use and at least one provider is named."
        : "Outsourced support is in use but responsibilities remain unclear."
      : "No outsourced IT dependency has been recorded so far.",
    topGap: outsourcedIt
      ? providerNamed
        ? "Clarify the exact security and operational responsibilities for the provider."
        : "Name the provider and define where responsibility boundaries sit."
      : "Confirm whether any third-party operational dependencies still need review.",
  };
}

function buildBoundaryCapability(answers: Record<string, Answer>, boundaryPreview: BoundarySummary) {
  const maturityScore = clampScore(answers["boundary-confidence"]?.score ?? 1);

  return {
    id: "boundary-data-handling",
    name: "Boundary and data handling",
    maturityScore,
    confidenceScore: clampScore(Math.max(1, maturityScore - boundaryPreview.unresolvedScopeQuestions.length)),
    summary:
      boundaryPreview.unresolvedScopeQuestions.length === 0
        ? "The current scope picture is reasonably coherent for a first-pass baseline."
        : "The current scope picture still has open questions that affect confidence.",
    topGap:
      boundaryPreview.unresolvedScopeQuestions[0] ??
      "Validate the current data handling and boundary assumptions with direct evidence.",
  };
}

function buildOperatingProfile(answers: Record<string, Answer>, boundaryPreview: BoundarySummary) {
  const coreSystems = splitCommaList(answers["core-systems"]?.value);
  const outsourcedIt = answers["outsourced-it"]?.value === "true";

  return [
    boundaryPreview.includesCui ? "CUI handling appears relevant to the program." : "No CUI handling is currently recorded.",
    coreSystems.length > 0 ? `${coreSystems.length} core systems are named.` : "Core systems are still largely undefined.",
    outsourcedIt ? "Outsourced support influences the operating model." : "The operating model currently appears mostly internal.",
  ].join(" ");
}

function buildConfidenceNote(
  capabilities: ProgramBaselineState["capabilities"],
) {
  const lowConfidence = capabilities.filter((capability) => capability.confidenceScore <= 2);

  if (lowConfidence.length === 0) {
    return "No low-confidence capability areas are currently flagged in the baseline.";
  }

  return `Low-confidence areas still need validation: ${lowConfidence.map((capability) => capability.name).join(", ")}.`;
}

function buildRoadmapPreview(
  capabilities: ProgramBaselineState["capabilities"],
  answers: Record<string, Answer>,
): ProgramBaselineState["roadmapPreview"] {
  const initiatives: ProgramBaselineState["roadmapPreview"] = [];

  const governance = capabilities.find((capability) => capability.id === "governance-policy");
  if (governance && governance.maturityScore <= 2) {
    initiatives.push({
      id: "initiative-governance-baseline",
      title: "Stabilize governance and policy baseline",
      priority: "do-now",
      rationale: "Program maturity is low, so the consultant needs a stronger governance baseline before larger improvements will stick.",
      targetCapabilityIds: [governance.id],
    });
  }

  const dependencies = capabilities.find((capability) => capability.id === "vendor-third-party");
  if (dependencies && dependencies.confidenceScore <= 2) {
    initiatives.push({
      id: "initiative-clarify-outsourced-support",
      title: "Clarify outsourced support responsibilities",
      priority: "do-now",
      rationale: "The operating model depends on third parties, but the current responsibility split is too unclear to trust.",
      targetCapabilityIds: [dependencies.id],
    });
  }

  const boundary = capabilities.find((capability) => capability.id === "boundary-data-handling");
  if (boundary && boundary.confidenceScore <= 2) {
    initiatives.push({
      id: "initiative-validate-boundary",
      title: "Validate scope and data handling assumptions",
      priority: "do-next",
      rationale: "Low scope confidence will distort later prioritization unless the current boundary is clarified first.",
      targetCapabilityIds: [boundary.id],
    });
  }

  const hasIdentityProvider = Boolean(answers["identity-provider"]?.value?.trim());
  if (hasIdentityProvider) {
    initiatives.push({
      id: "initiative-identity-validation",
      title: "Validate core identity control coverage",
      priority: "plan-this-quarter",
      rationale: "A named identity platform exists, so the next step is to confirm whether it is operating effectively across the environment.",
      targetCapabilityIds: ["identity-access"],
    });
  }

  return initiatives.slice(0, 4);
}

function buildWhyItMatters(capabilityId: string) {
  const messages: Record<string, string> = {
    "governance-policy":
      "This capability shapes whether the security program is repeatable enough to sustain improvements over time.",
    "identity-access":
      "This capability affects who can reach critical systems and whether access risk can be contained quickly.",
    "asset-configuration":
      "This capability determines whether the consultant can trust the inventory and ownership picture that later work depends on.",
    "vendor-third-party":
      "This capability matters because third-party responsibilities can hide major operating and security gaps if they are unclear.",
    "boundary-data-handling":
      "This capability matters because weak scope clarity will distort prioritization and framework reporting later in the engagement.",
  };

  return messages[capabilityId] ?? "This capability influences the health of the overall security program.";
}

function buildNextStatusOptions(status: Initiative["status"]): Array<"planned" | "in-progress"> {
  if (status === "candidate") {
    return ["planned", "in-progress"];
  }

  if (status === "planned") {
    return ["in-progress"];
  }

  return [];
}

function buildEvidenceSignals(
  capabilityId: string,
  answers: Record<string, Answer>,
  boundaryPreview: BoundarySummary,
) {
  const signals: Record<string, string[]> = {
    "governance-policy": [
      answers["security-program-maturity"]?.score
        ? `Security program maturity is currently scored ${answers["security-program-maturity"].score}/5.`
        : "Security program maturity has not been scored yet.",
    ],
    "identity-access": [
      answers["identity-provider"]?.value
        ? `Identity provider recorded: ${answers["identity-provider"].value}.`
        : "No identity provider is recorded yet.",
    ],
    "asset-configuration": [
      answers["core-systems"]?.value
        ? `Named systems: ${answers["core-systems"].value}.`
        : "No core systems are recorded yet.",
    ],
    "vendor-third-party": [
      answers["outsourced-it"]?.value === "true"
        ? "Outsourced support is present in the operating model."
        : "No outsourced IT dependency is currently recorded.",
      answers["outsourced-it-provider"]?.value
        ? `Provider named: ${answers["outsourced-it-provider"].value}.`
        : "No outsourced support provider is named yet.",
    ],
    "boundary-data-handling": [
      boundaryPreview.includesCui
        ? "CUI handling is currently in scope for the program view."
        : "CUI handling is not currently recorded in scope.",
      boundaryPreview.unresolvedScopeQuestions.length > 0
        ? `Open scope gaps: ${boundaryPreview.unresolvedScopeQuestions.join(" ")}`
        : "No unresolved scope gaps are currently flagged.",
    ],
  };

  return signals[capabilityId] ?? ["No evidence signals are defined for this capability yet."];
}

function splitCommaList(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function clampScore(value: number) {
  return Math.max(1, Math.min(5, value));
}

function byWeakestFirst(
  left: ProgramBaselineState["capabilities"][number],
  right: ProgramBaselineState["capabilities"][number],
) {
  if (left.maturityScore !== right.maturityScore) {
    return left.maturityScore - right.maturityScore;
  }

  return left.confidenceScore - right.confidenceScore;
}

function byStrongestFirst(
  left: ProgramBaselineState["capabilities"][number],
  right: ProgramBaselineState["capabilities"][number],
) {
  if (left.maturityScore !== right.maturityScore) {
    return right.maturityScore - left.maturityScore;
  }

  return right.confidenceScore - left.confidenceScore;
}
