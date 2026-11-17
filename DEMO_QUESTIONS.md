# Pronto demo questions

Open one of the three hotels from the landing page and type a question into that hotel's service center. The chat has no suggested-question buttons. These prompts and related wording work:

1. **What are the pool hours?**
2. **What is the women's pool time?**
3. **What is the men's pool time?**
4. **What room types are available?**
5. **When does breakfast start?**
6. **What are check-in and check-out times?**
7. **I need to book a room.**
8. **I need fresh towels in my room.** The bot replies: `Fresh towels for Room #113. Request #3561.` It also publishes that alert to the saved phone topic.

The scripted women's pool answer is **3:00 PM to 6:00 PM on weekdays**. The scripted breakfast answer is **8:00 AM to 11:00 AM**, including the reminder that late diners aren't entertained and an invitation to ask about breakfast options. The scripted check-in answer is **10:00 AM**, with check-out **before noon**. These are demo answers for all three hotels, not verified policies.

The booking request flow then asks for a featured room, check-in date, number of nights (1–14), and guest name. It ends with a visible demo notification and publishes a phone alert when a separate phone is paired. The guest name is not included in the phone alert. No reservation or SMS is created.

The bot recognizes related wording for pool, swimming, women/female, men/male, rooms/suites, breakfast, check-in/out, towels, and book/reserve. Other questions receive a prompt showing its supported topics.

**Data note:** Published photos link to official hotel pages. All service answers and request numbers in this demo are scripted; confirm real schedules and requests with the hotel.
