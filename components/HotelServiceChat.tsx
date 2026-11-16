"use client";

import { useEffect, useRef, useState } from "react";
import hotels from "@/constants/hotels.json";

type Hotel = (typeof hotels)[number];
type Stage = "questions" | "room" | "date" | "nights" | "name" | "phone" | "processing" | "done";
type Message = { id: number; sender: "guest" | "hotel"; text: string };
type Booking = { room: string; date: string; nights: string; name: string };

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || (process.env.NEXT_PUBLIC_DEMO_MODE !== "false" && !process.env.NEXT_PUBLIC_BOOKING_API_URL);
const phonePattern = /^\+923\d{9}$/;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const quickQuestions = [
  { label: "Pool hours", prompt: "What are the pool hours?" },
  { label: "Women's pool time", prompt: "What is the women's pool time?" },
  { label: "Men's pool time", prompt: "What is the men's pool time?" },
  { label: "Room types", prompt: "What room types are available?" },
  { label: "Breakfast", prompt: "When does breakfast start?" },
  { label: "Check-in / out", prompt: "What are check-in and check-out times?" },
  { label: "Book a room", prompt: "I need to book a room." },
];

function serviceAnswer(question: string, hotel: Hotel) {
  const text = question.toLowerCase();
  if (/(women|woman|female|ladies|lady)/.test(text) && /(pool|swim)/.test(text)) return hotel.womenPool;
  if (/(men|man|male|gents)/.test(text) && /(pool|swim)/.test(text)) return hotel.menPool;
  if (/(pool|swim)/.test(text)) return hotel.pool;
  if (/(room|suite|accommodation)/.test(text)) return `The featured room types are ${hotel.rooms.join(", ")}. I can prepare a demo booking request for any of these.`;
  if (/(breakfast|morning meal)/.test(text)) return hotel.breakfast;
  if (/(check.?in|check.?out|arrival|departure)/.test(text)) return hotel.checkInOut;
  return "I can help with pool times, women's and men's pool slots, rooms, breakfast, check-in, and a demo booking request. Choose a question below or ask in your own words.";
}

export default function HotelServiceChat({ hotel }: { hotel: Hotel }) {
  const [stage, setStage] = useState<Stage>("questions");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "hotel", text: `Welcome to the ${hotel.serviceName}. What can I assist you with? Ask about your stay or start a demo booking request.` },
  ]);
  const [booking, setBooking] = useState<Booking>({ room: "", date: "", nights: "", name: "" });
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deviceAlertStatus, setDeviceAlertStatus] = useState("");
  const nextId = useRef(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [messages, busy]);
  useEffect(() => { if (!busy && stage !== "done") inputRef.current?.focus(); }, [busy, stage]);

  function addMessage(sender: Message["sender"], text: string) {
    setMessages((current) => [...current, { id: ++nextId.current, sender, text }]);
  }

  async function answer(text: string, nextStage: Stage) {
    setBusy(true);
    await delay(850);
    addMessage("hotel", text);
    setStage(nextStage);
    setBusy(false);
  }

  function showDeviceNotice(text: string) {
    setNotice(text);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try { new Notification(`${hotel.name} · Pronto demo`, { body: text }); } catch { /* In-page notice remains visible. */ }
    }
  }

  async function enableDeviceAlert() {
    if (typeof Notification === "undefined" || !window.isSecureContext) {
      setDeviceAlertStatus("Device alerts need a supported secure browser. The in-page notice is available here.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(`${hotel.name} · Pronto demo`, { body: notice });
        setDeviceAlertStatus("Device alerts enabled on this browser.");
      } else {
        setDeviceAlertStatus("Device alerts were not enabled. The in-page notice is available here.");
      }
    } catch {
      setDeviceAlertStatus("This browser cannot show device alerts. The in-page notice is available here.");
    }
  }

  async function send(raw: string) {
    const value = raw.trim();
    if (!value || busy || stage === "processing" || stage === "done") return;
    setError("");
    if (stage === "room" && !hotel.rooms.some((room) => room.toLowerCase() === value.toLowerCase())) {
      setError("Choose one of the room types shown below.");
      return;
    }
    if (stage === "date") {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < today) { setError("Choose today or a future check-in date."); return; }
    }
    if (stage === "nights" && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 14)) {
      setError("Enter a stay of 1 to 14 nights.");
      return;
    }
    if (stage === "name" && value.length < 2) { setError("Enter your guest name."); return; }
    if (stage === "phone" && !phonePattern.test(value)) { setError("Use the format +923001234567."); return; }

    setDraft("");
    addMessage("guest", value);

    if (stage === "questions") {
      if (/(book|reserve|reservation)/i.test(value)) {
        await answer(`Certainly. Which room would you like at ${hotel.name}? Choose one of the options below.`, "room");
      } else {
        await answer(serviceAnswer(value, hotel), "questions");
      }
    } else if (stage === "room") {
      const room = hotel.rooms.find((item) => item.toLowerCase() === value.toLowerCase())!;
      setBooking((current) => ({ ...current, room }));
      await answer(`${room} noted. What date would you like to check in?`, "date");
    } else if (stage === "date") {
      setBooking((current) => ({ ...current, date: value }));
      await answer("How many nights would you like to stay? Enter 1 to 14.", "nights");
    } else if (stage === "nights") {
      setBooking((current) => ({ ...current, nights: value }));
      await answer("What name should I put on your demo request?", "name");
    } else if (stage === "name") {
      setBooking((current) => ({ ...current, name: value }));
      await answer("Lastly, enter a Pakistani mobile number in the format +923001234567.", "phone");
    } else if (stage === "phone") {
      setBusy(true);
      setStage("processing");
      const summary = `${booking.room} at ${hotel.name} for ${booking.nights} night${booking.nights === "1" ? "" : "s"} from ${booking.date}.`;
      if (demoMode) {
        await delay(1100);
        addMessage("hotel", `Your demo booking request is ready, ${booking.name}. ${summary} This is a preview; no reservation or SMS was sent.`);
        showDeviceNotice(`${summary} Preview only — no reservation or SMS was sent.`);
        setStage("done");
      } else {
        try {
          const response = await fetch(process.env.NEXT_PUBLIC_BOOKING_API_URL || "/api/send-booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber: value, hotel: hotel.name, room: booking.room }),
          });
          if (!response.ok) throw new Error("Notification failed");
          addMessage("hotel", `A demo request summary for ${summary} was sent by SMS. This is not a confirmed reservation.`);
          showDeviceNotice(`${summary} Demo request summary sent by SMS; reservation not confirmed.`);
          setStage("done");
        } catch {
          addMessage("hotel", "I could not send the SMS. Your request has not been confirmed. Please check the number and try again.");
          setStage("phone");
        }
      }
      setBusy(false);
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  return <div className="service-chat" aria-label={`${hotel.serviceName} chat`}>
    <div className="service-chat-header"><div className="service-status"><span /> {hotel.serviceName.toUpperCase()}</div><h2>How can we help?</h2><p>Hotel-specific answers and a guided booking demo.</p></div>
    <div className="service-chat-body" role="log" aria-live="polite" ref={bodyRef}>
      <div className="chat-day">TODAY · PRONTO SERVICE</div>
      {messages.map((message) => <div key={message.id} className={`service-message service-message-${message.sender}`}>{message.text}</div>)}
      {busy && <div className="service-typing" aria-label="Service center is typing"><span /><span /><span /></div>}
    </div>
    <div className="service-chat-bottom">
      {notice && <div className="service-notice" role="status"><strong>Demo notification</strong><p>{notice}</p><button type="button" onClick={enableDeviceAlert}>Show as device alert ↗</button>{deviceAlertStatus && <small>{deviceAlertStatus}</small>}</div>}
      {!busy && stage === "questions" && <div className="quick-questions">{quickQuestions.map((question) => <button type="button" key={question.label} onClick={() => void send(question.prompt)}>{question.label}</button>)}</div>}
      {!busy && stage === "room" && <div className="quick-questions">{hotel.rooms.map((room) => <button type="button" key={room} onClick={() => void send(room)}>{room}</button>)}</div>}
      {!busy && stage === "nights" && <div className="quick-questions">{["1", "2", "3"].map((nights) => <button type="button" key={nights} onClick={() => void send(nights)}>{nights} night{nights === "1" ? "" : "s"}</button>)}</div>}
      {stage === "done" ? <button className="chat-restart" onClick={() => { setStage("questions"); setNotice(""); addMessage("hotel", "What else can I help you with?"); }}>Ask another question ↗</button> : <form onSubmit={submit}>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="chat-input-line"><input ref={inputRef} type={stage === "date" ? "date" : stage === "nights" ? "number" : stage === "phone" ? "tel" : "text"} min={stage === "nights" ? "1" : undefined} max={stage === "nights" ? "14" : undefined} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={stage === "phone" ? "+923001234567" : stage === "name" ? "Your name" : stage === "nights" ? "Number of nights" : stage === "date" ? undefined : stage === "room" ? "Choose a room..." : "Ask about this hotel..."} aria-label={stage === "date" ? "Check-in date" : stage === "phone" ? "Pakistani mobile number" : "Message"} disabled={busy} /><button type="submit" disabled={busy || !draft.trim()} aria-label="Send message">↑</button></div>
      </form>}
      <p className="chat-footnote">{demoMode ? "Demo only · No booking or SMS is created" : "SMS summary only · Hotel booking is not confirmed"}</p>
    </div>
  </div>;
}
