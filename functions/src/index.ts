import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import twilio from "twilio";
import { isBookingRequest } from "./booking.js";

const accountSid = defineSecret("TWILIO_ACCOUNT_SID");
const authToken = defineSecret("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = defineSecret("TWILIO_PHONE_NUMBER");

export const sendBookingNotification = onRequest(
  {
    region: "us-central1",
    secrets: [accountSid, authToken, twilioPhoneNumber],
    cors: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  },
  async (request, response) => {
    if (request.method !== "POST") {
      response.set("Allow", "POST").status(405).json({ error: "Method not allowed" });
      return;
    }

    if (!isBookingRequest(request.body)) {
      response.status(400).json({ error: "Invalid booking details" });
      return;
    }

    try {
      const client = twilio(accountSid.value(), authToken.value());
      await client.messages.create({
        body: "Pronto Booking: Your Executive Suite at Serena Hotel Islamabad is confirmed. We look forward to hosting you!",
        from: twilioPhoneNumber.value(),
        to: request.body.phoneNumber,
      });
      response.status(200).json({ success: true });
    } catch (error) {
      console.error("Failed to send booking notification", error);
      response.status(502).json({ error: "Could not send SMS confirmation" });
    }
  },
);
