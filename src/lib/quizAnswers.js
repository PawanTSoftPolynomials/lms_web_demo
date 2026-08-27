// Shared "is this answer correct" check for quiz review/scoring UI — one
// rule per question type, used wherever a submitted answer needs comparing
// against a question's correctAnswer (result summary counts, per-question
// review highlighting).
export function checkAnswerCorrectness(type, selected, correct) {
  if (selected === undefined || selected === null) return false;

  if (type === "MCQ_SINGLE") {
    return selected === correct;
  }

  if (type === "MCQ_MULTI") {
    if (!Array.isArray(selected) || !Array.isArray(correct)) return false;
    return selected.length === correct.length && selected.every((v) => correct.includes(v));
  }

  if (type === "ARRANGE_TOKENS") {
    if (!Array.isArray(selected) || !Array.isArray(correct)) return false;
    return selected.length === correct.length && selected.every((v, i) => v === correct[i]);
  }

  if (type === "MATCH_PAIRS") {
    if (typeof selected !== "object" || typeof correct !== "object" || !selected || !correct) return false;
    const selKeys = Object.keys(selected);
    const corrKeys = Object.keys(correct);
    if (selKeys.length !== corrKeys.length) return false;
    return selKeys.every((k) => String(selected[k]) === String(correct[k]));
  }

  if (type === "SELF_ASSESSMENT") {
    return typeof selected === "string" && selected.trim().length > 0;
  }

  return false;
}
