# Student Adaptive Learning — retired frontend

Removed from the active Student product on 2026-09-09. Source is preserved
here verbatim under `source/`, mirroring its original path under `src/`, so the
feature can be restored without reconstructing it.

Nothing in this folder is imported by the running app. `backup` is excluded
from `tsconfig.json` and from ESLint's `globalIgnores`, so it is never type
checked, linted or bundled.

## What this feature was

After a student submitted a quiz, the result page queued one AI remediation
card per incorrectly-answered question. Each card asked the backend for a
pedagogical decision, streamed a tutor response, then generated and evaluated a
verification question before advancing to the next incorrect question.

## Files moved (original path → here)

| Original path under `src/` | Role |
|---|---|
| `components/student/AdaptiveRemediationCard.jsx` | Root component; the only thing the app rendered |
| `components/student/AdaptiveQuestionCard.jsx` | Verification-question UI |
| `components/student/AdaptiveTutorMessage.jsx` | Streamed tutor message UI |
| `components/student/JourneyProgress.jsx` | Stage indicator, used only by the remediation card |
| `components/student/adaptiveCopy.js` | Copy strings for the three components above |
| `hooks/queries/student/useAdaptiveLearning.js` | Barrel-exported, never consumed |
| `hooks/queries/student/useAdaptiveResponse.js` | `POST /adaptive-learning/respond` |
| `hooks/queries/student/useAdaptiveResponseStream.js` | `POST /adaptive-learning/respond/stream` |
| `hooks/queries/student/useEvaluateVerificationAnswer.js` | `POST /adaptive-learning/verification/evaluate` |
| `hooks/queries/student/useGenerateVerificationQuestion.js` | `POST /adaptive-learning/verification/generate` |
| `hooks/queries/student/usePedagogicalDecision.js` | `POST /learner-model/decision` |
| `services/adaptiveLearning.service.js` | Axios wrapper for all of the above |

## Edits made in files that stayed

- `src/app/student/result/[quizId]/page.jsx` — removed the `AdaptiveRemediationCard`
  import, the rendered "Adaptive Learning" section, the `incorrectQuestions`
  memo and the `activeRemediationIndex` queue state that existed only to drive
  it, plus the `useState` and `checkAnswerCorrectness` imports left unused.
  The score summary, concept-score breakdown and Detailed Question Review are
  untouched.
- `src/hooks/queries/student/index.js` — dropped the `useAdaptiveLearning` re-export.
- `src/components/student/attempt/QuizExperience.jsx` — removed two
  `[Adaptive TRACE]` `console.log` calls marked "TEMP DIAGNOSTIC — remove after
  investigation". Submission behaviour is unchanged.

## Deliberately NOT removed

These carry adaptive-sounding names but are load-bearing elsewhere. Removing
them would break unrelated features.

- **`backend/lms-api/src/modules/learner-model/`** — required at runtime by
  `modules/quizzes/quiz.service.js` (the `recordEvidence` call in `submitQuiz`,
  which sits in the same function as the Progress roll-up) and by
  `modules/questions/question.validation.js` (`MISCONCEPTION_TAXONOMY`, used for
  instructor question authoring).
- **`backend/lms-api/src/modules/adaptive-learning/`** — left mounted at
  `/adaptive-learning`. Its only caller was the frontend removed above, so it is
  now an orphaned API surface; retiring it is a separate decision.
- **`QuizSubmission.conceptScores`** and the concept breakdown it renders on the
  result page — backend quiz data, not adaptive routing.
- **`RecommendedCoursesCarousel` / `RecommendedCourseCard`** — the dashboard's
  "Recommended for You" row is a plain not-yet-enrolled course carousel fed by
  `useCourses`. No adaptive logic.
- **`navigationItems.js` "AI Recommendations"** — a label pointing at
  `/student/courses`. Cosmetic naming only; it routes to normal course browse.

## Restoring

Move `source/<path>` back to `src/<path>`, re-add the `AdaptiveRemediationCard`
import and section to the quiz result page, and restore the `useAdaptiveLearning`
re-export in the student hooks barrel. The backend endpoints it calls are still
mounted and were never changed.
