const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isBookingRequest } = require("../lib/booking.js");

test("accepts only featured hotel rooms and a Pakistani mobile number", () => {
  assert.equal(isBookingRequest({ hotel: "Islamabad Marriott Hotel", room: "Deluxe King", phoneNumber: "+923001234567" }), true);
  assert.equal(isBookingRequest({ hotel: "Islamabad Serena Hotel", room: "Executive Suite", phoneNumber: "+923001234567" }), true);
  assert.equal(isBookingRequest({ hotel: "Pearl-Continental Hotel Lahore", room: "Business Suite", phoneNumber: "+923001234567" }), true);
  assert.equal(isBookingRequest({ hotel: "Other Hotel", room: "Deluxe King", phoneNumber: "+923001234567" }), false);
  assert.equal(isBookingRequest({ hotel: "Islamabad Marriott Hotel", room: "Fake Suite", phoneNumber: "+923001234567" }), false);
  assert.equal(isBookingRequest({ hotel: "Islamabad Marriott Hotel", room: "Deluxe King", phoneNumber: "03001234567" }), false);
  assert.equal(isBookingRequest(null), false);
});
