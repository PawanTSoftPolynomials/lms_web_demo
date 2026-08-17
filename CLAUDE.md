Orange Tree LMS — Frontend

Read this file before modifying frontend code.

Project

Orange Tree LMS frontend is the Next.js application for the LMS roles:

ADMIN

INSTRUCTOR

STUDENT

The frontend consumes the existing backend APIs. Do not change backend contracts simply to make frontend implementation easier.

Stack

Next.js 16 App Router

React 19

JavaScript / JSX

Tailwind CSS v4

TanStack React Query

Axios

Context API where required

Recharts

React Icons

Frontend architecture

Use the existing project conventions:

src/
├── app/
├── components/
├── hooks/
│ └── queries/
│ ├── admin/
│ ├── instructor/
│ └── student/
├── services/
├── lib/
└── constants/

Rules

Pages must not call APIs directly.

API calls belong in services/.

Server-state fetching belongs in React Query hooks.

Query keys belong in the existing query-key/constants convention.

Reuse existing components before creating new ones.

Do not create duplicate components such as Button2, CourseCardV2, or NewModal.

Do not introduce another state-management library when React Query/Context is sufficient.

Keep business logic out of page JSX.

Do not refactor unrelated code.

Do not change backend APIs without an explicit requirement.

Use mock data only when the backend contract genuinely does not exist.

Role boundaries

ADMIN

The Admin UI may manage:

Course price

Discount price

Currency

Course review

Publish

Unpublish

Archive

INSTRUCTOR

The Instructor UI may manage:

Course creation

Own course content

Modules

Lessons

Quizzes

Course metadata

The Instructor UI must not provide controls for:

Setting price

Changing price

Setting discount

Changing discount

Store pricing

Publishing

Unpublishing

Archiving

Hiding a control is not a security mechanism. Backend RBAC remains authoritative.

STUDENT

Student UI must:

Display the actual Store price.

Show BUY COURSE only for a valid paid course.

Show Pricing unavailable when Store pricing is missing/invalid.

Show CONTINUE LEARNING after successful enrollment.

Use VIEW COURSE for recommended courses.

Pricing rules

A course is purchasable only when:

Store exists
AND price > 0
AND isFree = false

Never display a hardcoded fallback price such as ₹4,999.

The frontend must not send authoritative payment values:

amount
price
discountPrice
userId

For payment order creation, send only the required course identifier according to the existing API contract.

Payment flow

Keep:

Course Details
→ BUY COURSE
→ POST /payments/orders
→ Razorpay Checkout
→ POST /payments/verify
→ Enrollment ACTIVE
→ CONTINUE LEARNING

Do not create direct Razorpay checkout logic inside recommendation cards.

Do not manually mark payment as successful.

Do not manually create enrollment from frontend state.

UI/UX rules

Follow the existing Orange Tree LMS design system.

Reuse existing components.

Keep UI clean, minimal, responsive, and consistent.

Do not introduce arbitrary styling when an existing component/pattern exists.

Preserve accessibility.

Inputs require labels.

Keyboard focus must remain visible.

Async errors must be understandable.

Do not rely only on color for status.

React Query

Use the existing:

services/
hooks/queries/
constants/queryKeys
lib/queryOptions

pattern.

Do not put direct Axios calls inside components/pages.

Working procedure

Before changing code:

Inspect the relevant page.

Inspect the related service.

Inspect the related React Query hook.

Search for an existing reusable component.

Check the existing API contract.

Make the smallest change necessary.

Test the affected flow.

Report exact files changed.

Do not

Do not:

Add free-course UI.

Add instructor price proposal UI.

Add price approval UI.

Add price history UI.

Add fake price fallbacks.

Add direct checkout to recommendation cards.

Change Razorpay architecture without an actual defect.

Change Enrollment architecture without an actual defect.

Rewrite shared components for an unrelated feature.

Reformat unrelated files.

Testing

Run the project's available checks before declaring completion.

Where available:

npm test
npm run lint
npm run build

Payment verification must also be tested through the project's payment test flow.

Never claim a test passed unless it was actually executed.
