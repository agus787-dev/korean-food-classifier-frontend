# Hansik — Korean food classifier

A responsive React application for classifying Korean food photos, reviewing
prediction history, and collecting user feedback. The frontend communicates
only with the Node.js/Express backend; the backend forwards prediction requests
to the separately deployed model service.

## Screenshots

_Add a screenshot of the public landing page here._

_Add a screenshot of the prediction and feedback experience here._

_Add a screenshot of the admin dashboard here._

_Add screenshots of the admin users, predictions, and feedback pages here._

## Features

- Register and sign in; authenticated sessions are restored from a JWT stored
  in browser local storage.
- Upload, drag and drop, or paste a JPG, PNG, or WebP image up to 5 MB.
- View a classification, confidence, and per-class probabilities.
- Submit, update, or remove feedback for a prediction.
- Review paginated prediction history, including lazily loaded saved thumbnails.
- Manage the account profile and sign out.
- Admin dashboard with usage and feedback statistics, user role management,
  prediction filters, feedback review, and CSV export.
- Light and dark themes with responsive layouts and keyboard-accessible
  dialogs.

## Tech stack

- React 19, TypeScript, and Vite
- Tailwind CSS 4
- React Router
- Recharts
- Lucide icons

## Run locally

Requirements: Node.js supported by the frontend toolchain and a running backend.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Configure `.env.local` with the backend origin. The API client adds `/api`
paths itself.

```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=false
```

`VITE_USE_MOCK=true` enables a mock result for the prediction request only, and
only while running Vite in development mode. Authentication, history, feedback,
images, and admin APIs still require the backend. Never put passwords, tokens,
or other secrets in Vite environment variables.

The backend must allow the frontend's development or deployed origin through
its CORS configuration. The browser sends prediction uploads as
`multipart/form-data` with the `file` field; do not set the multipart
`Content-Type` manually.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login`, `/register` | Public | Account access |
| `/predict` | Signed in | Upload and classify a photo; submit feedback |
| `/history` | Signed in | Browse, inspect, and delete predictions |
| `/profile` | Signed in | Account details and prediction count |
| `/admin` | Admin | Statistics dashboard |
| `/admin/users` | Admin | Search accounts and manage roles |
| `/admin/predictions` | Admin | Filter and inspect predictions |
| `/admin/feedback` | Admin | Review feedback and export CSV |

Admin routes are guarded in the UI, and API requests continue to use the
backend's authorization. A non-admin account receives a clear unauthorized
state instead of an admin-page redirect loop.

## Creating the first administrator

Create or register an account first. Then, from the backend project root, run
the backend's admin creation command using that account's email:

```sh
npm run create-admin -- user@example.com
```

The account's role is refreshed on its next authenticated request. Sign out and
sign back in if the admin navigation does not appear immediately.

## Deployment

Set `VITE_API_URL` to the public Node backend origin in the hosting provider's
environment settings, then rebuild and redeploy the frontend. Configure the
backend's CORS allowlist to include the deployed frontend origin. The frontend
must never be configured to call the model service directly.

## Scripts

```sh
npm run dev
npm run build
npm run lint
npm run preview
```
