# VedaConnect Member Portal — Frontend

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 — it redirects to `/onboarding/personal-details`.

## Structure

- `components/common/` — Logo, Button, Input. Shared everywhere (auth, dashboard, admin later).
- `components/onboarding/` — StepProgress, PersonalDetailsForm. Onboarding-flow-specific.
- `pages/onboarding/` — one page per step, composes the components above.
- `utils/onboardingSteps.js` — single source of truth for the 5 step labels, drives StepProgress.

## Adding Step 2 (Business Details)

1. Create `components/onboarding/BusinessDetailsForm.jsx` (same pattern as `PersonalDetailsForm.jsx`).
2. Create `pages/onboarding/Step2BusinessDetails.jsx` (same pattern as `Step1PersonalDetails.jsx`), pass `currentStep={2}` to `StepProgress`.
3. Add the route in `App.jsx`.

No changes needed to `Logo`, `Button`, `Input`, or `StepProgress` — they're already reusable.
