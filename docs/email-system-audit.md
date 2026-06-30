# Email System Architecture Audit

## 1. Current Architecture Overview
- **Framework:** Next.js v15.5.19 utilizing the **App Router** exclusively.
- **Database / ORM:** PostgreSQL accessed via Prisma ORM (`v6.19.3`).
- **Deployment Platform:** Hostinger.
- **Background Jobs:** Powered by `bullmq` and `ioredis`. Existing queues exist for product importing (`product-import-worker`) and a rudimentary email worker (`email-worker`).
- **UI Libraries:** Vanilla React with inline styles and generic CSS. No Tailwind CSS or component libraries (like Shadcn UI) are currently in use.
- **Validation:** Zod is used for server-side payload validation.

## 2. Authentication & Administration
- **Admin Structure:** The admin panel is located at `src/app/admin/(dashboard)`. It utilizes a fixed sidebar layout (`layout.tsx`).
- **Auth System:** Custom cookie-based authentication. `customer_auth` and `admin_auth` cookies are validated via `src/middleware.ts`.
- **Roles/Permissions:** Minimal. There is no fine-grained Role-Based Access Control (RBAC) currently; authorization is simply based on the presence/validity of the `admin_auth` cookie.

## 3. Customer & User Models
- **Customer Model:** `Customer` table in Prisma contains `email`, `passwordHash`, `firstName`, `lastName`, `phone`, `marketingConsent`, etc.
- **Email Verification:** There is **no** existing email verification field (e.g., `emailVerifiedAt`) or token table. Accounts are implicitly active upon registration.
- **Password Reset:** There is **no** existing password reset implementation (no token fields, no `/forgot-password` route).

## 4. Commerce Lifecycles
- **Order Statuses:** `OrderStatus` enum includes `PENDING`, `PROCESSING`, `PAID`, `DELIVERED`, `FAILED`, `CANCELLED`, `EXPIRED`, `REFUNDED`.
- **Payment Lifecycle:** Payments are handled via webhooks (e.g., `/api/webhooks/monirize`), transitioning orders from `PENDING` to `PAID` or `FAILED`.
- **Cart & Checkout:** Cart is managed locally (likely via context or store). Checkout submits directly to `src/app/(frontend)/checkout/actions.ts`.
- **Inventory:** `Product` model tracks `stockQuantity` and `stockStatus`.

## 5. Existing Email Code
- **Provider:** Resend is the current provider, accessed via `fetch` natively in `src/lib/email/provider.ts`.
- **Templates:** Currently hardcoded HTML snippets inside the database `EmailTemplate` model. No React Email engine is used yet.
- **Current Integration:** Registration creates an `EmailPreference` record and queues a `welcome_email`. Checkout queues an `order_confirmation` email upon successful payment via webhook.

## 6. Proposed Architecture & Changes for Next Phases
### Required Database Changes
- Add `EmailSettings`, `EmailTemplateVersion`, `EmailMessage`, `EmailAttempt`, `EmailEvent`, `EmailSuppression`, `EmailVerificationToken`, and `EmailAuditLog` models to fully replace/augment the current rudimentary email models.
- Add `emailVerified` boolean and verification relation to the `Customer` model.

### Reusable Components & UI Direction
- The email admin dashboard will continue to use the inline-styled, premium vanilla React approach to match the current Admin dashboard.
- A React Email template engine (or similar component tree) will be built for visual email design.

### Proposed Email Events
- `customer.registered`, `customer.email_verified`, `customer.password_reset`
- `order.created`, `order.paid`, `order.shipped`, `order.delivered`, `order.cancelled`
- `marketing.campaign_launch`

### Proposed Directory Structure
```
src/lib/email/
├── providers/        # Resend Adapter
├── queue/            # BullMQ logic
├── render/           # Template rendering engine
├── templates/        # React Email components
├── events/           # Event listeners for ecommerce triggers
├── validation/       # Zod schemas
├── types/            # Interfaces
└── email-service.ts  # Core API
```

### Proposed Environment Variables
- `RESEND_API_KEY`
- `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`, `EMAIL_REPLY_TO`
- `EMAIL_MARKETING_FROM_ADDRESS`
- `APP_URL`
- `EMAIL_WORKER_SECRET` (For scheduled or authenticated queue invocation if moved to serverless, otherwise not needed for long-running BullMQ).

### Migration & Testing Strategy
- **Migration:** Run non-destructive `prisma db push` to append new tables. Map existing `EmailJob` records to the new `EmailMessage` structure if necessary, or start fresh.
- **Testing:** Add Zod validation tests for all templates, unit tests for queue idempotency, and E2E tests for the new email verification flow.
