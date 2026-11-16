# Pronto

A three-hotel service demo for Islamabad Marriott, Islamabad Serena, and Pearl-Continental Lahore. Each hotel has its own guide and scripted service chat.

## Run locally

```sh
npm install
npm run dev
```

The supported questions and request flow are in [DEMO_QUESTIONS.md](DEMO_QUESTIONS.md). Hotel requests and reservations are simulated.

## Notifications on a separate phone

Pronto uses [ntfy](https://ntfy.sh/) for this demo, so a request made on a laptop can appear in a separate phone's notification center. There is no SMS or phone-number step.

1. On the laptop, open a hotel and expand **Connect a separate phone** in its chat.
2. Install the ntfy Android or iOS app on the phone and allow its notifications.
3. Scan the pairing QR code with the phone camera to open ntfy, or subscribe in ntfy to the topic shown on the laptop.
4. Click **I've subscribed on my phone** and **Send test alert**. Confirm the test appears in the phone's notification center.
5. Ask for fresh towels or finish a demo booking request on the laptop. Pronto publishes that demo alert to the paired topic.

The topic is generated randomly and stored in the laptop browser. ntfy topics are public: anyone with the topic name can read or publish to it. Pronto sends only scripted demo details, without the guest name or a phone number. Do not use this public service for real guest requests. A successful publish means ntfy accepted the alert; delivery also depends on the phone's subscription, connection, and notification settings.

## Deploy to Vercel

Import this repository with the **Next.js** preset, the repository root as root directory, the default build command, and no Output Directory override. `next.config.ts` exports the pages as static files. No environment variables are required.

The old Firebase/Twilio function remains in `functions/` for reference, but the current frontend does not call or deploy it. The phone notification demo sends no SMS.
