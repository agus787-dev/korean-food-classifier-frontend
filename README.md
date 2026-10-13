# Hansik — Korean food classifier

A responsive React demo for recognizing two Korean food classes—bibimbap and
fried rice—with a PyTorch image-classification model served by FastAPI on
Hugging Face Spaces.

## Screenshot

_Add a screenshot of the running app here._

## Features

- Upload, drag and drop, or paste a JPG, PNG, or WebP image (up to 5 MB).
- Preview and remove an image before submitting it.
- Display the predicted class, confidence, and probabilities returned by the API.
- Show classifier availability and friendly validation, network, and server errors.
- Support light and dark themes.

## Tech stack

- React 19, TypeScript, and Vite
- Tailwind CSS 4
- Lucide icons
- FastAPI image-classification API hosted on Hugging Face Spaces

## Run locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_URL` in `.env.local` to the FastAPI Space origin:

```env
VITE_API_URL=https://agus-dev-korean-food-classifier.hf.space
```

The frontend calls `GET /health` when the classifier area loads. Predictions
are sent as `multipart/form-data` to `POST /predict` with the image in the
`file` field. The browser sets the multipart content type and boundary; do not
set a JSON content type for this endpoint.

The prediction response is expected to contain:

```json
{
  "predicted_class": "bibimbap",
  "confidence": 0.87,
  "probabilities": {
    "bibimbap": 0.87,
    "fried_rice": 0.13
  }
}
```

## Deploy to Vercel

1. Open the Vercel project.
2. Go to **Settings → Environment Variables**.
3. Add `VITE_API_URL` with value `https://agus-dev-korean-food-classifier.hf.space`.
4. Apply it to Production and Preview as needed.
5. Redeploy the frontend so the variable takes effect.

Vite environment variables are included in the browser bundle. Store only the
public API origin here; never put secrets in a `VITE_*` variable.

The backend must allow cross-origin requests from the deployed Vercel
production domain and any preview domains you use. Configure allowed origins in
FastAPI rather than relying on unrestricted production CORS. The published
Space source reads a comma-separated `ALLOWED_ORIGINS` setting. Add the exact
Vercel production and preview origins to the Hugging Face Space environment and
redeploy it; do not use `*` for production.

## Project structure

```text
src/
  api/
    predict.ts             # API calls, response validation, and API errors
  components/
    ClassifierPanel.tsx    # Health, upload, preview, and prediction states
    Footer.tsx
    Header.tsx
    ResultCard.tsx         # Prediction summary and probability bars
    ThemeToggle.tsx
  hooks/
    useTheme.ts
  App.tsx
  index.css
.env.example
```

## Scripts

```sh
npm run dev
npm run build
npm run lint
```
