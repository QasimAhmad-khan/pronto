const roomsByHotel: Record<string, readonly string[]> = {
  "Islamabad Marriott Hotel": ["Deluxe King", "Executive King", "Executive Suite", "Royal Suite"],
  "Islamabad Serena Hotel": ["Deluxe Room", "Executive Room", "Junior Suite", "Executive Suite"],
  "Pearl-Continental Hotel Lahore": ["Standard King", "Deluxe King", "Executive King", "Business Suite"],
};

export function isBookingRequest(body: unknown): body is { phoneNumber: string; hotel: string; room: string } {
  if (!body || typeof body !== "object") return false;
  const booking = body as Record<string, unknown>;
  return typeof booking.hotel === "string" &&
    typeof booking.room === "string" &&
    roomsByHotel[booking.hotel]?.includes(booking.room) === true &&
    typeof booking.phoneNumber === "string" &&
    /^\+923\d{9}$/.test(booking.phoneNumber);
}
