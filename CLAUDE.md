# CLAUDE.md — Frontend Guidelines (lms_web_demo)

## Project Overview

Orange Tree LMS Frontend is a Next.js 16 App Router application built with React 19, Tailwind CSS v4, TanStack React Query v5, and Axios. It serves three user roles: **ADMIN**, **INSTRUCTOR**, and **STUDENT**.

## Folder Structure

```text
src/
├── app/                        # Next.js App Router pages
│   ├── admin/                  # Admin portal (/admin/courses, /admin/dashboard, etc.)
│   ├── instructor/             # Instructor portal (/instructor/courses, /instructor/dashboard, etc.)
│   ├── student/                # Student portal (/student/courses, /student/learn/[courseId], etc.)
│   ├── courses/[courseId]/     # Student public course details page
│   ├── login/, register/       # Auth pages
│   └── page.tsx, layout.tsx    # Root landing & layout
├── components/                 # UI components
│   ├── common/, ui/            # Reusable UI primitives (Button, Card, Input, Modal, Loader)
│   ├── instructor/             # Instructor composer components (CourseComposerHeader, etc.)
│   └── student/                # Student components (CourseBuyButton, etc.)
├── hooks/
│   ├── queries/                # TanStack React Query custom hooks
│   │   ├── admin/              # Admin React Query hooks (useCourses, useDashboard, etc.)
│   │   ├── instructor/         # Instructor React Query hooks (useTopics, useModules, etc.)
│   │   └── student/            # Student React Query hooks (useCourses, useMyCourses, etc.)
│   └── useAuth.js, useRazorpayCheckout.js
├── services/                   # API layer (Axios wrappers)
│   ├── topic.service.js, course.service.js, module.service.js, lesson.service.js
│   ├── store.service.js, payment.service.js, enrollment.service.js
│   └── admin/, instructor/, student/ sub-services
├── lib/                        # Axios instance (`axios.js`), query options
└── constants/                  # `queryKeys.js`, navigation, config
```

## Canonical Course Hierarchy

```text
Course
  └── Module
      └── Lesson
          └── Topic
              └── Content
```

- **CURRENT STATE**: `Topic` is implemented in Prisma schema, backend API routes (`/topics`), frontend service (`topic.service.js`), instructor query hooks (`useTopics`, `useCreateTopic`, etc.), Instructor Course Composer (`setComposerMode("topic")`), and Student Learning Player (which flattens `selectedLesson?.topics` into contents).
- **TARGET STATE**: Fully seamless Topic-level management across all instructor composer modals and student navigation views.

## Role Boundaries & RBAC Rules

### ADMIN
- Responsible for: Setting/updating course pricing, discount pricing, Store pricing, reviewing courses, publishing courses, unpublishing courses, archiving courses.
- **Current Defect**: Admin course detail page (`/admin/courses/[courseId]`) lacks Store pricing controls UI.

### INSTRUCTOR
- Responsible for: Creating courses, editing owned course content, managing modules, lessons, topics, content items, quizzes, and course metadata.
- **Forbidden Actions**: Must NOT set prices, change prices, set discounts, change discounts, modify Store pricing, or publish courses.
- **Current Defect**: Instructor course composer page (`/instructor/courses/[courseId]`) contains a `handleTogglePublish` button allowing instructors to trigger course status publication. This control must be removed.

### STUDENT
- Responsible for: Browsing published courses, viewing details, purchasing valid paid courses, accessing enrolled courses.
- **Current Defect**: Student course details page (`/courses/[courseId]`) contains a hardcoded price fallback (`₹4,999.00`) when Store pricing is missing. This must be replaced with a `Pricing unavailable` state that disables purchase.

## Data-Fetching & State Architecture

1. **API Service Layer**: All HTTP calls must be placed inside `src/services/`. Pages/components must NEVER call Axios directly.
2. **Server State**: Use TanStack React Query hooks from `src/hooks/queries/`.
3. **Query Keys**: Standardized in `src/constants/queryKeys.js`.
4. **No Direct Checkout**: Recommendation cards must navigate to course details via `VIEW COURSE`. Direct Razorpay launch from recommendation cards is strictly forbidden.
5. **No Frontend Price Trust**: The frontend sends ONLY `{ courseId }` when initiating payment orders. It must NEVER send price or amount parameters.

## Available Scripts

```bash
npm run dev      # Launch Next.js dev server
npm run build    # Build production bundle
npm run start    # Start production server
npm run lint     # Run ESLint checks
```
