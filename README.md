# 🏋️ Gym Tracker

A modern workout tracking app built with **React**, **TypeScript**, and **Vite**. Start a session, add exercises, log your sets, and track your progress over time.

> Pairs with the [Gym Tracker API](https://github.com/Lethanial-Leveille/gym-tracker) — a FastAPI backend handling auth, sessions, exercises, and set data.

---

## Live Demo

🔗 **[gym-tracker-web.onrender.com](https://gym-tracker-web.onrender.com)** *(free tier — may take ~30s to wake up)* *(P.S. — only available through April 2026)*

---

## Screenshots

| Home | Session | Library |
|------|---------|---------|
| Start or resume a session | Log exercises, reps, and weight | Browse and filter exercises |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Routing | React Router v6 (layout routes) |
| Styling | Custom CSS design system (no frameworks) |
| Font | [Outfit](https://fonts.google.com/specimen/Outfit) via Google Fonts |
| Auth | JWT stored in localStorage |
| Deployment | Render (static site) |

---

## Features

- **Session-first flow** — Start a workout, add exercises on the fly, log sets as you go
- **Exercise search** — Find exercises from a pre-built library with muscle group filtering
- **Live timer** — Real-time elapsed time while your session is active
- **Set logging** — Track reps and weight per exercise with inline inputs
- **Personal stats** — See your PR (best weight) and last-used weight per exercise
- **Session history** — View past completed sessions with expandable exercise details
- **Exercise library** — Browse all exercises with muscle group chip filters
- **Bottom navigation** — App-like tab bar (Home, Session, History, Library)
- **JWT authentication** — Secure login/register with token-based auth
- **Responsive design** — Works on mobile, tablet, and desktop

---

## App Flow

```
Login / Register
       ↓
    Home Page
       ↓
  Start Session → Name it (e.g. "Push Day")
       ↓
  Add Exercises → Search library → Tap "Add"
       ↓
   Log Sets → Enter reps + weight → ✓
       ↓
  Finish Session → Saved to History
```

---

## Project Structure

```
gym-tracker-web/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   └── ProtectedLayout.tsx   # Auth guard + bottom nav (layout route)
│   ├── pages/
│   │   ├── LoginPage.tsx         # Login / register form
│   │   ├── HomePage.tsx          # Dashboard with session CTA
│   │   ├── SessionPage.tsx       # Active session: add exercises, log sets
│   │   ├── HistoryPage.tsx       # Past completed sessions
│   │   └── LibraryPage.tsx       # Exercise database with filters
│   ├── api.ts                    # API client (fetch wrapper with auth headers)
│   ├── auth.ts                   # Login, register, logout helpers
│   ├── App.tsx                   # Route definitions
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Full design system (colors, cards, buttons, etc.)
├── .env.local                    # API base URL
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Architecture

### Layout Routes

The app uses React Router v6's **layout route** pattern. Instead of wrapping each page in an auth guard:

```tsx
// OLD — repetitive
<Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
<Route path="/session" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
```

We use a shared layout that handles auth and renders the bottom nav once:

```tsx
// NEW — layout route
<Route element={<ProtectedLayout />}>
  <Route path="/" element={<HomePage />} />
  <Route path="/session" element={<SessionPage />} />
  <Route path="/history" element={<HistoryPage />} />
  <Route path="/library" element={<LibraryPage />} />
</Route>
```

`ProtectedLayout` checks for a JWT token, renders the bottom navigation bar, and uses `<Outlet />` as a slot where the active page renders. This is the same pattern used in production React apps at companies like Meta and Airbnb.

### API Client

All HTTP requests go through `api.ts`, which automatically:
- Prepends the base URL from environment variables
- Attaches the JWT token as a `Bearer` header
- Parses JSON responses
- Throws descriptive errors for non-200 responses

### Design System

The entire UI is built with a custom CSS design system in `index.css` — no Tailwind, no component libraries. This was an intentional choice to learn CSS fundamentals:

- **CSS custom properties** for theming (colors, spacing, radii, shadows)
- **Utility classes** for common patterns (`.stack-md`, `.row-sm`, `.text-muted`)
- **Component classes** for cards, buttons, inputs, badges, and exercise blocks
- **Animations** with staggered fade-in for page transitions

---

## Design

| Element | Value |
|---------|-------|
| Background | `#07070a` (near black) |
| Surface | `#121215` (dark grey) |
| Accent | `#8b5cf6` (purple) |
| Text | `#f0f0f3` (silver/white) |
| Muted text | `#a0a0b0` (grey) |
| Font | Outfit (300–800 weights) |
| Border radius | 14px cards, 10px buttons, 999px pills |

Inspired by Apple Fitness — clean, dark, minimal with a pop of color.

---

## Local Development

### Prerequisites
- Node.js 18+
- The [Gym Tracker API](https://github.com/Lethanial-Leveille/gym-tracker) running locally or on Render

### Setup

```bash
# Clone the repo
git clone https://github.com/Lethanial-Leveille/gym-tracker-web.git
cd gym-tracker-web

# Install dependencies
npm install

# Set API URL (create .env.local)
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://gym-tracker-api-96ij.onrender.com` |

---

## Deployment (Render)

1. Create a new **Static Site** on Render
2. Connect your GitHub repo
3. Set the build command: `npm install && npm run build`
4. Set the publish directory: `dist`
5. Add a rewrite rule: `/* → /index.html` (for client-side routing)
6. Add environment variable `VITE_API_BASE_URL` pointing to your API

---

## Roadmap

- [x] JWT auth (login / register)
- [x] Session-first workout flow
- [x] Exercise search and add
- [x] Set logging with reps and weight
- [x] Session history with expandable details
- [x] Exercise library with muscle group filters
- [x] Bottom tab navigation
- [x] Responsive mobile-first design
- [ ] Progress charts (weight over time per exercise)
- [ ] Rest timer between sets
- [ ] Body weight / measurements tracking
- [ ] Workout streak / calendar view
- [ ] Light / dark mode toggle
- [ ] PWA support (installable on phone)
- [ ] React Native / Swift native app

---

## Built By

**Lethanial Leveille** — Computer Engineering, University of Florida

- [GitHub](https://github.com/Lethanial-Leveille)
