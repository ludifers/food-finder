# FoodFinder

FoodFinder is a UCF-focused restaurant matching app that helps students and
nearby visitors decide where to eat without scrolling through a huge list of
places. The app turns food preferences, budget, travel time, and open-now needs
into a swipe-style restaurant flow.

This project is built as a portfolio app. It runs in mock data mode by default
so it can be reviewed locally without paid Google Maps usage or private API
keys.

## Features

- UCF-only restaurant discovery around campus, Knights Plaza, University Blvd,
  Alafaya Trail, Waterford Lakes, Research Park, Oviedo, and nearby East
  Orlando.
- Preference quiz for cravings, budget, travel mode, travel time, and open-now
  filtering.
- Swipe flow with Yes, No, and Maybe decisions.
- Account system with login, create account, Google sign-in, and forgot
  password support through Firebase.
- Profile page for saved matching defaults and credit status.
- Saved spots with liked/maybe lists, notes, visit status, and map view.
- 5 free swipe decisions per account.
- Optional paid 20-choice packs through a Stripe Payment Link.
- Manual credit fulfillment message after payment.
- Google API cost controls in the app, including daily/hourly request caps and
  cooldowns.
- Mock map mode for demos and portfolio review without external APIs.

## Tech Stack

- React
- Vite
- React Router
- Firebase Authentication
- Cloud Firestore
- Google Maps / Places API, optional
- OpenStreetMap fallback, optional
- Stripe Payment Links, optional
- Plain CSS

## Demo Mode

The app defaults to:

```env
VITE_MAP_PROVIDER=mock
```

Mock mode uses local UCF-area sample restaurants and does not require a Google
Maps API key. This is the recommended mode for portfolio review and local
development.

Supported map providers:

```env
VITE_MAP_PROVIDER=mock
VITE_MAP_PROVIDER=osm
VITE_MAP_PROVIDER=google
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Start the dev server:

```bash
npm run dev
```

Open the local app:

```txt
http://localhost:5173
```

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Environment Variables

`.env` is intentionally ignored by Git. Do not commit real API keys.

Use `.env.example` as the template:

```env
VITE_MAP_PROVIDER=mock
VITE_GOOGLE_MAPS_API_KEY=
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_STRIPE_CHOICES_PAYMENT_LINK=
```

For a portfolio clone, `VITE_MAP_PROVIDER=mock` is enough to explore the main
restaurant matching experience.

## Firebase Setup

Firebase is used for authentication, saved spots, preferences, and swipe credit
tracking.

Enable these Firebase products if you want full account behavior:

- Authentication
- Email/password sign-in
- Google sign-in, optional
- Cloud Firestore

The app stores user data under:

```txt
users/{uid}/preferences/settings
users/{uid}/saved/{restaurantId}
users/{uid}/usage/swipeDecisions
```

Swipe usage looks like:

```js
{
  count: 5,
  paidChoicesRemaining: 20
}
```

`count` tracks the free decisions used. `paidChoicesRemaining` tracks manually
added paid credits.

## Stripe Payment Flow

This portfolio version uses Stripe Payment Links with manual fulfillment to stay
off Firebase Blaze/Cloud Functions.

Flow:

1. User runs out of free choices.
2. User clicks `Buy 20 more choices`.
3. Stripe Payment Link opens.
4. After payment, Stripe redirects back to:

```txt
/account?payment=pending
```

5. The app shows:

```txt
Payment received. Your credits should be added to your account within an hour.
```

6. The app owner manually adds credits in Firestore:

```txt
users/{uid}/usage/swipeDecisions
```

Set or increase:

```js
paidChoicesRemaining: 20
```

If the user already has credits, add 20 to the existing number.

## Google Maps / Places Setup

Live Google mode is optional. Keep mock mode enabled unless you are testing live
places.

To use Google:

```env
VITE_MAP_PROVIDER=google
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Enable only the APIs the app needs:

- Maps JavaScript API
- Places API
- Geocoding API

Recommended Google Cloud restrictions:

- Restrict the key to websites.
- For local testing, allow:

```txt
http://localhost:5173/*
http://127.0.0.1:5173/*
```

- Restrict the key to the APIs listed above.
- Add low quotas while testing.

The app also includes local clamps:

- 20 Google requests per day
- 10 Google requests per hour
- 30 second cooldown between live map refreshes
- Limited Places result count and detail hydration

These app-side controls reduce accidental usage, but Google Cloud key
restrictions and quotas are still the real protection for a public API key.

## Project Structure

```txt
src/
  components/
    GoogleRestaurantMap.jsx
    MockRestaurantMap.jsx
    Navbar.jsx
    SavedSpotsMap.jsx
  context/
    AuthContext.jsx
  pages/
    Account.jsx
    Cravings.jsx
    Dashboard.jsx
    SavedSpots.jsx
    SearchPage.jsx
    SwipePage.jsx
  services/
    apiUsageLimits.js
    firebase.js
    googleMaps.js
    mapProvider.js
    matchPreferences.js
    mockRestaurants.js
    payments.js
    userDataService.js
```

## Main User Flow

1. Choose preferences in the quiz.
2. Open Discover.
3. Review UCF-area restaurant matches.
4. Swipe Yes, No, or Maybe.
5. Create an account to keep using decisions and save spots.
6. Save restaurants to liked/maybe lists.
7. Buy a 20-choice pack if more decisions are needed.

## Portfolio Notes

This app is intended to demonstrate:

- React state and routing
- Firebase authentication and Firestore data modeling
- API cost-control thinking
- User gating and credit-based product logic
- Local mock data strategy for safe portfolio demos
- Practical UX flows around restaurant discovery and decision fatigue

## Security Notes

- Real `.env` files are ignored by Git.
- `.env.example` contains placeholders only.
- Do not commit Firebase, Google, or Stripe secrets.
- Firebase web config is not a server secret, but API keys should still be
  restricted where possible.
- Stripe secret keys should never be placed in the React frontend.

## Status

Portfolio-ready local app:

- Mock mode works without private keys.
- Firebase/Google/Stripe integrations are optional and require your own account
  configuration.
- Payment fulfillment is manual by design to avoid requiring a paid Firebase
  backend plan.
