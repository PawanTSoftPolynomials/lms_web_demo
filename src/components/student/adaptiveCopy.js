/**
 * Translates backend decision-engine vocabulary (strategy names, raw
 * `reason` strings) into student-facing language. The student must never
 * see "MISCONCEPTION_REMEDIATION", "INDEPENDENT_PRACTICE", a KC identifier,
 * or the algorithm's internal rationale — only what's happening and what to
 * do next.
 */
export const STRATEGY_STUDENT_COPY = {
  MISCONCEPTION_REMEDIATION: {
    heading: "Let's clear up this concept.",
    body: "We'll walk through it together before moving on.",
  },
  CONCEPT_REMEDIATION: {
    heading: "Let's look at this from another angle.",
    body: "A quick refresher should help this click.",
  },
  GUIDED_PRACTICE: {
    heading: "Let's practice this together.",
    body: "We'll guide you through the next steps.",
  },
  INDEPENDENT_PRACTICE: {
    heading: "You're ready for another practice question.",
    body: "Give this one a try on your own.",
  },
  REVIEW: {
    heading: "Time for a quick refresher.",
    body: "Let's make sure this stays fresh.",
  },
  ADVANCE: {
    heading: "You're ready to move forward.",
    body: "Nice work — this concept is solid.",
  },
  CHALLENGE: {
    heading: "Ready for something harder?",
    body: "Let's push a little further.",
  },
};

export const getStrategyCopy = (strategy) =>
  STRATEGY_STUDENT_COPY[strategy] || STRATEGY_STUDENT_COPY.CONCEPT_REMEDIATION;

/**
 * Primary continue-CTA label for a Quick Check result, based on what the
 * decision engine recommends next. Only used when the student answered
 * correctly — an incorrect answer always shows a plain "Continue" per the
 * tutor-flow UX (see AdaptiveRemediationCard).
 */
export const getContinueLabel = (nextStrategy) => {
  if (nextStrategy === "ADVANCE") return "Continue to next concept";
  if (nextStrategy === "INDEPENDENT_PRACTICE") return "Practice once more";
  return "Continue learning";
};

/**
 * Splits raw tutor text into paragraphs for readable rendering — never
 * invents content, just breaks up the wall of text the model returned.
 * Handles both blank-line-separated and single-newline-separated output.
 */
export const splitIntoParagraphs = (text) => {
  if (typeof text !== "string" || !text.trim()) return [];

  const blocks = text.trim().split(/\n\s*\n/).filter(Boolean);
  const paragraphs = blocks.length > 1 ? blocks : text.trim().split(/\n/).filter(Boolean);

  return paragraphs.map((p) => p.trim()).filter(Boolean);
};

/**
 * Splits a single paragraph into plain/bold segments on `**...**` markdown
 * (qwen3 reliably produces this for emphasis even without explicit
 * instruction to). Purely a presentation transform — the words themselves
 * are untouched, nothing is added or removed.
 * @returns {Array<{ text: string, bold: boolean }>}
 */
export const parseInlineEmphasis = (paragraph) => {
  if (typeof paragraph !== "string") return [];

  const segments = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(paragraph)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: paragraph.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < paragraph.length) {
    segments.push({ text: paragraph.slice(lastIndex), bold: false });
  }

  return segments.length > 0 ? segments : [{ text: paragraph, bold: false }];
};
