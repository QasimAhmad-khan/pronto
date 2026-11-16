export function isBookingRequest(body: unknown): body is { phoneNumber: string; hotel: "Serena Hotel Islamabad" } {
  if (!body || typeof body !== "object") return false;
  const booking = body as Record<string, unknown>;
  return booking.hotel === "Serena Hotel Islamabad" &&
    typeof booking.phoneNumber === "string" &&
    /^\+923\d{9}$/.test(booking.phoneNumber);
}
