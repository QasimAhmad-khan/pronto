# Pronto

A three-hotel, blue-and-white booking service demo for Islamabad Marriott, Islamabad Serena, and Pearl-Continental Lahore. Each hotel has an individual guide and an embedded, hotel-specific service chat. The images are served from the hotels' official sites; their source links appear on each guide.

## Run locally

```sh
npm install
npm run dev
```

The chat answers typed questions in [DEMO_QUESTIONS.md](DEMO_QUESTIONS.md), simulates a room-service request, and walks through a booking *request* preview. By default, it shows an in-page notification. The **Show as device alert** button can display that specific request on the phone viewing the HTTPS site, after the user grants notification permission. On iPhone, add the site to the Home Screen before requesting an alert. Neither notification creates a hotel request or reservation, or sends an SMS to another phone.

## Deploy to Vercel

Import this repository with the **Next.js** framework preset and the repository root as the root directory. Use the default build command and **leave the Output Directory override empty**. `next.config.ts` exports the three hotel pages as static files. No environment variables are needed for the default demo.

## Optional Firebase and Twilio SMS demo

The Firebase function accepts a Pakistani mobile number, one of the three featured hotel names, and one of that hotel's featured rooms. It sends a clearly labeled demo request summary, not a reservation confirmation.

1. Install function dependencies with `npm install --prefix functions`.
2. Create a Firebase project, copy `.firebaserc.example` to `.firebaserc`, and set its project ID.
3. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` with `firebase functions:secrets:set`.
4. Build with `npm run build` and `npm run build --prefix functions`, then deploy with `firebase deploy --only hosting,functions`.
5. Set `NEXT_PUBLIC_DEMO_MODE=false` at frontend build time. Firebase Hosting rewrites `/api/send-booking` to the function. For the Vercel frontend, also set `NEXT_PUBLIC_BOOKING_API_URL` to the deployed function URL. The current Vercel production origin is allowed in the function's CORS settings.

The public SMS endpoint can incur Twilio charges. Add rate limiting or other abuse protection before opening it beyond a controlled demo.
