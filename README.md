# InnovestAI Frontend

Web app for InnovestAI, a portfolio tracking tool. Users sign in, build a watchlist, view price charts, write strategy notes, track holdings with profit/loss and get AI risk analysis of their portfolio.

## Tech stack

- React 19 and Vite
- React Router 7
- Tailwind CSS 4
- Supabase Auth (`@supabase/supabase-js`)
- Recharts (price charts)

This app needs the [InnovestAI backend](../innovestai-backend) running. All data goes through its REST API.

## Prerequisites

- Node.js 18 or later
- A Supabase project (the same one the backend uses)
- The backend running locally or deployed

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment variables

Create a `.env` file in this folder:

| Variable                 | Description                                                         |
| ------------------------ | ------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL, e.g. `https://xxxx.supabase.co`               |
| `VITE_SUPABASE_ANON_KEY` | Supabase **publishable** key (`sb_publishable_...`)                 |
| `VITE_API_URL`           | Backend base URL including `/api`, e.g. `http://localhost:5000/api` |

Only publishable keys belong here. Anything starting with `VITE_` is bundled into the browser code and is visible to every visitor. Never add secret keys, or OpenAI or Polygon keys. `.env` is listed in `.gitignore`.

Restart `npm run dev` after changing `.env`.

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with hot reload |
| `npm run build`   | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally   |
| `npm run lint`    | Run ESLint                           |

## Pages

| Route        | Access    | Description                                                                         |
| ------------ | --------- | ----------------------------------------------------------------------------------- |
| `/auth`      | Public    | Log in                                                                              |
| `/dashboard` | Signed in | Three-column view: watchlist, market chart, and strategy notes with AI analysis     |
| `/portfolio` | Signed in | Holdings table with quantity, buy price, current value and profit/loss, plus totals |

Unknown routes redirect to `/dashboard`. Signed-out users are redirected to `/auth` by `ProtectedRoute`.

## How authentication works

- `supabaseClient.js` creates the Supabase client. By default it stores the session in the browser's local storage and refreshes the token automatically.
- `AuthContext` exposes `user`, `loading`, `login`, `signUp` and `logout` through the `useAuth()` hook.
- To call the backend, pages read the access token with `supabase.auth.getSession()` and send it as `Authorization: Bearer <token>`.

## Project structure

```
supabaseClient.js          Supabase client setup
src/
  main.jsx                 Entry point, wraps the app in AuthProvider
  App.jsx                  Routes
  context/AuthContext.jsx  Session state and auth actions
  components/
    ProtectedRoute.jsx     Redirects signed-out users to /auth
    Header.jsx             Shared logo, navigation and log out
    AiAnalysis.jsx         AI result card with thinking and typing animation
  views/
    Auth.jsx               Log in
    Dashboard.jsx          Core market view
    Portfolio.jsx          Holdings and profit/loss
public/favicon.svg         App icon
```

## Features

- Add and remove stock or crypto assets, with duplicate and input validation messages from the backend
- Price history chart for the selected asset
- Per-asset strategy notes with save feedback
- AI risk analysis of the whole watchlist, shown with a thinking animation and typed-out text
- Editable quantity and buy price per asset, with live value and profit/loss
- Responsive layout that stacks on small screens

## Building for production

```bash
npm run build
```

Deploy the `dist/` folder to a static host such as Vercel or Netlify, and set the three `VITE_` variables in the host's settings. Then:

1. Allow your frontend URL in the backend's CORS settings.
2. Add the URL in Supabase under Authentication → URL Configuration.

## Troubleshooting

- **Blank page or "Missing Supabase environment variable" in the console:** check `.env`, then restart the dev server.
- **Requests fail with a network or CORS error:** make sure the backend is running and `VITE_API_URL` is correct.
- **Redirected to `/auth` unexpectedly:** the session expired or was cleared. Log in again.
- **Chart or price shows an error:** the backend's Polygon free plan allows about 5 requests per minute. Wait a minute and retry.
- **Logged in on one browser but not another:** sessions are stored per browser.
