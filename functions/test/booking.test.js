const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isBookingRequest } = require("../lib/booking.js");

test("accepts only the demo hotel and a Pakistani mobile number", () => {
  assert.equal(isBookingRequest({ hotel: "Serena Hotel Islamabad", phoneNumber: "+923001234567" }), true);
  assert.equal(isBookingRequest({ hotel: "Other Hotel", phoneNumber: "+923001234567" }), false);
  assert.equal(isBookingRequest({ hotel: "Serena Hotel Islamabad", phoneNumber: "03001234567" }), false);
  assert.equal(isBookingRequest(null), false);
});
