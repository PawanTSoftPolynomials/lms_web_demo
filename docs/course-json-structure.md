# Course JSON Structure (Canonical Course Package v2)

Reference for the `course.json` contract used by the Orange Tree LMS course import
system — the format behind **Instructor → Import Course → Import from ZIP** and
**Import from JSON**.

Everything here was reverse-engineered from the shipping implementation and then
verified by importing a probe package through the live API and reading the
resulting database rows. Where the code and the data model disagree, that is
called out explicitly rather than smoothed over.

## Source of truth

| Concern | File |
|---|---|
| Schema validation | `backend/lms-api/src/modules/course-import/services/v2PackageImporter.service.js` → `validateV2Manifest` |
| Import into DB | same file → `importV2Manifest` |
| Asset resolution | same file → `prepareV2Assets` |
| Package **generation** (export) | `backend/lms-api/src/modules/import/builders/packageBuilder.js` |
| Asset path convention | `backend/lms-api/src/modules/import/mappers/courseMapper.js` → `mapAssetReference` |
| Which import path runs | `backend/lms-api/src/modules/course-import/services/courseImporter.service.js` → `processJob` |
| Worked example | `backend/lms-api/src/modules/course-import/fixtures/sample_physics_course.json` |

## Which importer runs

`processJob` branches on one thing: whether a file literally named `course.json`
exists in the extracted package.

- **Present → V2 path.** The contract documented here.
- **Absent → V1 fallback.** A recursive file scan that infers structure
  heuristically. It prescribes **no folder names at all** — it is a "drop files in
  and let the analyzer guess" path, not a format you can author against.

`course.json` is found at the ZIP root, or exactly one directory deep (so a ZIP
that wraps everything in a single top-level folder still works).

## Package layout

A course package is one JSON file for the **entire** course, plus its media. There
is no per-entity file and no separate manifest — `course.json` *is* the manifest.

```
course-package.zip
├── course.json          ← the whole course
├── thumbnail.png        ← metadata.thumbnail (bare filename at root)
└── contents/
    ├── wave-demo.mp4    ← contents[].mediaFile
    └── worksheet.pdf
```

Asset paths follow `mapAssetReference`:

| Asset | Package path | Referenced by |
|---|---|---|
| Course thumbnail | bare filename at ZIP root (`thumbnail.png`) | `metadata.thumbnail` |
| Content media | `contents/<filename>` | `contents[].mediaFile` |

Paths must be relative and safe — leading `/`, `../`, `\`, and drive letters are
rejected (zip-slip protection in `zip.util.js` and `isSafePackagePath`). Any value
starting `http://` or `https://` is treated as an external URL and left alone.

On import, local assets are copied to `/uploads/thumbnails/` and `/uploads/contents/`
with generated filenames, and `canonicalJson.assetMap` records the
`packagePath → server URL` mapping.

## Shape

```jsonc
{
  "$schema": "https://orangetree.lms/schemas/course-v2.json",
  "version": "2.0",

  "metadata": { /* course identity */ },
  "settings": { /* course switches */ },

  "quizzes": [ /* COURSE-level quizzes */ ],

  "modules": [
    {
      "title": "...",
      "quizzes": [ /* MODULE-level quizzes */ ],
      "lessons": [
        {
          "title": "...",
          "quizzes": [ /* LESSON-level quizzes */ ],
          "topics": [
            {
              "title": "...",
              "quiz":    { /* TOPIC quiz, singular */ },
              "quizzes": [ /* or plural — both accepted */ ],
              "contents": [ /* the ONLY place content lives */ ]
            }
          ]
        }
      ]
    }
  ]
}
```

`$schema` and `version` are auto-filled by the importer when missing, but
`packageBuilder` hard-requires both, so always include them.

## Field reference

### `metadata`

| Field | Type | Notes |
|---|---|---|
| `title` | string | **Required**, non-empty. The only hard-required field in the file. |
| `description` | string | |
| `category` | string | Free text |
| `level` | string | Free text on `Course`; `BEGINNER` / `INTERMEDIATE` / `ADVANCED` by convention |
| `thumbnail` | string | Package path or external URL. Note: `thumbnail`, **not** `thumbnailUrl`. |
| `language` | string | Defaults to `English` |
| `tags` | string[] | |
| `estimatedLearningHours` | number | Float |
| `price` | number | **Ignored by the importer.** Pricing is Store/admin-owned; `Course` has no price column. |

### `settings`

| Field | Type | Default |
|---|---|---|
| `visibility` | `PUBLIC` \| `PRIVATE` \| `UNLISTED` | `PUBLIC` |
| `certificatesEnabled` | boolean | `false` |
| `discussionEnabled` | boolean | `true` |

Absent `settings` is auto-filled with `{ visibility: "PUBLIC", certificatesEnabled: true, discussionEnabled: true }`.

An imported course is always created with `status: "DRAFT"` — packages cannot
self-publish.

### `modules[]`, `lessons[]`, `topics[]`

All three levels take the same fields:

| Field | Type | Notes |
|---|---|---|
| `title` | string | **Required**, non-empty |
| `description` | string | |
| `order` | number | Defaults to `0` |
| `isPublished` | boolean | Coerced with `Boolean()`; absent → `false` |

### `contents[]` — topic level only

| Field | Type | Notes |
|---|---|---|
| `type` | string | **Required**, must be a valid `ContentType` (below) |
| `title` | string | |
| `order` | number | Defaults to `0` |
| `duration` | number | Minutes |
| `htmlContent` | string | Inline HTML body |
| `mediaFile` | string | Package path. For `type: "VIDEO"` it resolves into `videoUrl`; for anything else into `fileUrl`. |
| `videoUrl` | string | Direct URL, used when no `mediaFile` |
| `externalUrl` | string | Also seeds `fileUrl` when no `mediaFile` |
| `data` | object | Free-form JSON passthrough |

### Quizzes — all four levels

Accepted at course (`quizzes[]`), module (`modules[].quizzes[]`), lesson
(`…lessons[].quizzes[]`) and topic (`…topics[].quiz` as a single object, or
`…topics[].quizzes[]` as an array — both work).

| Field | Type | Notes |
|---|---|---|
| `title` | string | **Required**, non-empty |
| `description` | string | |
| `quizTag` | `FINAL` \| `SELF_TEST` | Defaults to `FINAL`. Anything other than the exact string `SELF_TEST` becomes `FINAL`. |
| `passingScore` | number | 0–100, defaults to `50` |
| `timeLimit` | number | Minutes. **Forced to `null` when `quizTag` is `SELF_TEST`**, whatever the package says. |
| `isPublished` | boolean | Defaults to `true` |
| `questions` | array | |

`quizTag` is how the assessment semantics are expressed:

| Intent | Value |
|---|---|
| Final / graded assessment | `"quizTag": "FINAL"` (timed allowed) |
| Self-assessed practice | `"quizTag": "SELF_TEST"` (always untimed) |

### `questions[]`

| Field | Type | Notes |
|---|---|---|
| `question` | string | **Required**, non-empty |
| `questionType` | string | **Required**, see accepted list below |
| `options` | array \| object | |
| `correctAnswer` | string | Defaults to `""` |
| `explanation` | string | |
| `marks` | number | Defaults to `1` |
| `negativeMarks` | number | Defaults to `0` |
| `difficulty` | `EASY` \| `MEDIUM` \| `HARD` | Defaults to `MEDIUM` |

## Enums

**`ContentType`** — all 18 accepted:

```
VIDEO  DOCUMENT  TEXT  LINK  PRESENTATION  IMAGE  PDF  FILE  EXTERNAL_LINK
HTML   CODE      ASSIGNMENT  CODING_EXERCISE  SCORM  INTERACTIVE_LAB
AUDIO  EMBED     SLIDE
```

**`questionType`** — the package validator accepts these 9:

```
MCQ_SINGLE  MCQ_MULTI  TRUE_FALSE  FILL_BLANK  SHORT_ANSWER
LONG_ANSWER  ARRANGE_TOKENS  MATCH_PAIRS  SELF_ASSESSMENT
```

> The database `QuestionType` enum also contains `MCQ` and `MULTIPLE_CORRECT`, but
> `validateV2Manifest` **rejects** them. Do not use them in a package.

## Validation rules

`validateV2Manifest` fails the package unless:

- `metadata.title` is a non-empty string
- `modules` is an array **and is not empty**
- every module has a non-empty `title`
- every module has a `lessons` **array**
- every lesson has a non-empty `title` and a `topics` **array**
- every topic has a non-empty `title` and a `contents` **array**
- every content item has a `type` that is a valid `ContentType`
- every quiz at every level has a non-empty `title`; `passingScore` within 0–100;
  `timeLimit` non-negative; each question has `question` and a supported `questionType`

The full depth is mandatory: a course with a module but no lessons, or a lesson
with no `topics` array, is rejected. The arrays may be empty, but must exist.

`packageBuilder` additionally refuses to build a package whose
`metadata.thumbnail` or any `contents[].mediaFile` does not correspond to a file
actually included in the ZIP.

## What the importer silently ignores

The Prisma schema is broader than the importer. `Content` and `Assignment` both
carry nullable `courseId` / `moduleId` / `lessonId` / `topicId`, so the database
*can* hold content and assignments attached directly at any level — but the V2
importer never reads them:

| Authored in `course.json` | Result |
|---|---|
| `contents[]` at course level | **Dropped** |
| `contents[]` at module level | **Dropped** |
| `contents[]` at lesson level | **Dropped** |
| `assignments[]` at any level | **Dropped** — no `Assignment` row is ever created |
| `metadata.price` | Ignored (Store owns pricing) |

Content is created **only** from `…topics[].contents[]`.

The only way to express an assignment in a V2 package today is a topic content
item with `"type": "ASSIGNMENT"`, which produces a `Content` row of that type —
not an `Assignment` entity. (The V1 path has an `unmappedAssignments` hook, but it
is unreachable once a `course.json` is present.)

Verified empirically: a probe package carrying `contents[]` and `assignments[]` at
all four levels imported cleanly and produced 4 quizzes (one per level, with
correct `quizTag`), 3 contents (all topic-level), and **0 assignments**.

## Minimal valid package

```json
{
  "$schema": "https://orangetree.lms/schemas/course-v2.json",
  "version": "2.0",
  "metadata": { "title": "My Course" },
  "settings": { "visibility": "PUBLIC" },
  "modules": [
    {
      "title": "Module 1",
      "lessons": [
        {
          "title": "Lesson 1",
          "topics": [
            {
              "title": "Topic 1",
              "contents": [
                { "type": "HTML", "title": "Intro", "order": 1, "htmlContent": "<p>Hello</p>" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Re-verifying this document

The validator can be run directly, without a server, to confirm any claim here:

```bash
cd backend/lms-api
node -e "
const { validateV2Manifest } = require('./src/modules/course-import/services/v2PackageImporter.service');
const doc = require('./src/modules/course-import/fixtures/sample_physics_course.json');
console.log(validateV2Manifest(JSON.parse(JSON.stringify(doc))));
"
```

Checked when this document was written: the minimal package above validates; the
shipped fixture validates; `questionType: "MCQ"`, an empty `modules` array, and a
lesson missing its `topics` array are each rejected with the errors described.

Pass a deep copy — `validateV2Manifest` mutates the object it is given
(normalising `metadata` and `settings`).

## Import lifecycle

`CourseImportStatus`: `UPLOADED → EXTRACTING → ANALYZING → MAPPING → READY → IMPORTING → COMPLETED`, with `FAILED` reachable from any stage.

> `MAPPING` is declared in the enum but **no code path writes it** — `ANALYZING`
> goes straight to `READY`.

The instructor-facing flow holds at `READY`, hands the validated structure to the
Course Composer for review, and only then writes to the database
(`IMPORTING → COMPLETED`).
