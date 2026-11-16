# Pronto

A Next.js hotel booking demo with a guided chat and a Firebase Cloud Function that sends a real Twilio SMS.

## Local setup

1. Run `npm install` and `npm install --prefix functions`.
2. Run `npm run dev` to view the frontend. Local development defaults to a clearly labeled notification preview: it shows an in-page confirmation, and can request a device alert from a supported secure browser. It does not send SMS or create a reservation. For SMS testing, create a Firebase project, copy `.firebaserc.example` to `.firebaserc`, and replace `YOUR_PROJECT_ID`. Install the Firebase CLI with `npm install -g firebase-tools`, then run `firebase login`.
3. Set the Firebase secrets: `firebase functions:secrets:set TWILIO_ACCOUNT_SID`, `firebase functions:secrets:set TWILIO_AUTH_TOKEN`, and `firebase functions:secrets:set TWILIO_PHONE_NUMBER`.
4. Start the Functions emulator with `firebase emulators:start --only functions`. Copy `.env.example` to `.env.local`, replace the project ID in the emulator URL, then restart the Next.js dev server. For emulator-only testing, set secret values in `functions/.secret.local` as described in Firebase's emulator documentation.

## Deploy

### Vercel demo

Import this repository into Vercel with the root directory set to the repository root. The included `vercel.json` selects Next.js and the static `out` output. Vercel runs `npm run build`; no environment variables are required for the notification demo. The site defaults to demo mode when no booking API URL is configured, so it never presents an unsent SMS as a real confirmation.

### Firebase Hosting and live SMS

Run `npm run build`, `npm run build --prefix functions`, then `firebase deploy --only hosting,functions`. Firebase Hosting serves the static Next.js export from `out` and rewrites `/api/send-booking` to `sendBookingNotification`. Build with `NEXT_PUBLIC_DEMO_MODE=false` to enable that live endpoint. The function requires a Blaze plan and valid Twilio credentials. The catalog and conversation are demo content; a successful SMS request is required before the live UI shows confirmation.

For a phone demo, open the site on that phone. The in-page confirmation works without browser notification permission. A browser device alert requires a supported browser and HTTPS; it appears on the device viewing the site. Sending an automatic SMS to another phone requires the configured Twilio function.

The SMS endpoint is public and can incur Twilio charges. Add abuse protection such as Firebase App Check and rate limiting before exposing it beyond a controlled demo.
