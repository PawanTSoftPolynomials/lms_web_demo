import { resolveResumeTarget } from "../resumeTarget.js";

/**
 * resolveResumeTarget must walk leaves in the SAME order the player itself
 * uses (courseUnits.js: a level's own content/quizzes interleaved with its
 * children by `order`, not "own content always first"). These cases
 * construct hierarchies where the old "content before children" rule and the
 * real order-interleaved rule disagree, so a wrong implementation resolves
 * to a different (wrong) leaf id than the correct one.
 */

function runTests() {
  const testCases = [];

  testCases.push({
    name: "a lesson ordered before its module's own content is visited first",
    input: {
      hierarchy: {
        contents: [],
        quizzes: [],
        modules: [
          {
            id: "m1",
            order: 1,
            contents: [{ id: "modcontent1", order: 2, visited: true, completed: false }],
            quizzes: [],
            lessons: [
              {
                id: "l1",
                order: 1,
                contents: [{ id: "lessoncontent1", order: 1, visited: true, completed: true }],
                quizzes: [],
                topics: [],
              },
            ],
          },
        ],
      },
    },
    // lessoncontent1 (order 1) comes before modcontent1 (order 2) in real
    // course order, so the last-visited-and-incomplete leaf is modcontent1.
    expected: { id: "modcontent1" },
  });

  testCases.push({
    name: "a topic's own quiz is part of the resume sequence",
    input: {
      hierarchy: {
        contents: [],
        quizzes: [],
        modules: [
          {
            id: "m1",
            order: 1,
            contents: [],
            quizzes: [],
            lessons: [
              {
                id: "l1",
                order: 1,
                contents: [],
                quizzes: [],
                topics: [
                  {
                    id: "t1",
                    order: 1,
                    contents: [{ id: "tc1", order: 1, visited: true, completed: true }],
                    quizzes: [{ id: "tq1", order: 2, visited: false, completed: false }],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    // tc1 is visited+completed, so the resume target is the next leaf after
    // it in course order — the topic's own quiz, tq1.
    expected: { id: "tq1" },
  });

  testCases.push({
    name: "nothing visited anywhere resolves to the course's first leaf",
    input: {
      hierarchy: {
        contents: [{ id: "c1", order: 1, visited: false, completed: false }],
        quizzes: [],
        modules: [],
      },
    },
    expected: { id: "c1" },
  });

  testCases.push({
    name: "no hierarchy resolves to null",
    input: {},
    expected: null,
  });

  let passed = 0;
  let failed = 0;

  console.log("=== RUNNING RESUME TARGET TESTS ===");
  testCases.forEach((tc) => {
    const result = resolveResumeTarget(tc.input);
    const matches = tc.expected === null ? result === null : result?.id === tc.expected.id;

    if (matches) {
      console.log(`[PASS] ${tc.name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${tc.name}`);
      console.error("  Expected id:", tc.expected?.id ?? null);
      console.error("  Actual:     ", result);
      failed++;
    }
  });

  console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
