# Pronto demo questions

Open one of the three hotels from the landing page. The service center on that hotel's guide answers with hotel-specific hardcoded content. These exact prompts are available as buttons and also work when typed:

1. **What are the pool hours?**
2. **What is the women's pool time?**
3. **What is the men's pool time?**
4. **What room types are available?**
5. **When does breakfast start?**
6. **What are check-in and check-out times?**
7. **I need to book a room.**

The booking request flow then asks for a featured room, check-in date, number of nights (1–14), guest name, and Pakistani mobile number (`+923001234567` format). It ends with a visible demo notification and an optional browser device alert. The default Vercel demo does not create a reservation or send an SMS.

The bot recognizes related wording for pool, swimming, women/female, men/male, rooms/suites, breakfast, check-in/out, and book/reserve. Other questions receive a prompt showing its supported topics.

**Data note:** Published details and photos link to official hotel pages. Pool hours, gender-specific pool slots, and any breakfast time marked **demo** are illustrative values, not verified hotel policies. Confirm current schedules with the hotel.
