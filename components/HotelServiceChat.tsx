"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import hotels from "@/constants/hotels.json";

type Hotel = (typeof hotels)[number];
type Stage = "questions" | "room" | "date" | "nights" | "name" | "processing" | "done";
type Message = { id: number; sender: "guest" | "hotel"; text: string };
type Booking = { room: string; date: string; nights: string };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const topicKey = "pronto-phone-topic";
const pairedKey = "pronto-phone-paired";
const newTopic = () => `pronto-${Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;

const towelResponse = "Request #3561 'fresh towels' has been made for Room #113! Demo only — no request was sent to the hotel.";
const isTowelRequest = (text: string) => /\btowels?\b/i.test(text);

function serviceAnswer(question: string, hotel: Hotel) {
  const text = question.toLowerCase();
  if (isTowelRequest(text)) return towelResponse;
  if (/(women|woman|female|ladies|lady)/.test(text) && /(pool|swim)/.test(text)) return hotel.womenPool;
  if (/(men|man|male|gents)/.test(text) && /(pool|swim)/.test(text)) return hotel.menPool;
  if (/(pool|swim)/.test(text)) return hotel.pool;
  if (/(room|suite|accommodation)/.test(text)) return `The featured room types are ${hotel.rooms.join(", ")}. I can prepare a demo booking request for any of these.`;
  if (/(breakfast|morning meal)/.test(text)) return hotel.breakfast;
  if (/(check.?in|check.?out|arrival|departure)/.test(text)) return hotel.checkInOut;
  return "I can help with pool times, women's and men's pool slots, rooms, breakfast, check-in, fresh towels, and a demo booking request. Ask in your own words.";
}

export default function HotelServiceChat({ hotel }: { hotel: Hotel }) {
  const [stage, setStage] = useState<Stage>("questions");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "hotel", text: `Welcome to the ${hotel.serviceName}. What can I assist you with? Ask about your stay, make a demo request, or book a room.` },
  ]);
  const [booking, setBooking] = useState<Booking>({ room: "", date: "", nights: "" });
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [topic, setTopic] = useState("");
  const [phonePaired, setPhonePaired] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState("");
  const nextId = useRef(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [messages, busy]);
  useEffect(() => { if (!busy && stage !== "done") inputRef.current?.focus(); }, [busy, stage]);
  useEffect(() => {
    const saved = localStorage.getItem(topicKey);
    const value = saved && /^pronto-[a-f0-9]{32}$/.test(saved) ? saved : newTopic();
    localStorage.setItem(topicKey, value);
    setTopic(value);
    setPhonePaired(localStorage.getItem(pairedKey) === "true");
  }, []);

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

  function showNotice(text: string) {
    setNotice(text);
    if (phonePaired) void publishPhoneNotice(text);
    else setPhoneStatus("Connect your phone above to receive this alert in its notification center.");
  }

  async function publishPhoneNotice(text: string) {
    if (!topic || !phonePaired) {
      setPhoneStatus("Subscribe on your phone, then mark it paired before sending an alert.");
      return;
    }
    setPhoneStatus("Sending to your phone topic…");
    try {
      const response = await fetch(`https://ntfy.sh/${topic}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain", Title: `Pronto - ${hotel.name}` },
        body: text,
      });
      if (!response.ok) throw new Error("Publish failed");
      setPhoneStatus("Sent to your ntfy topic. Check the paired phone's notification center.");
    } catch {
      setPhoneStatus("Could not send the phone alert. Check the connection and try again.");
    }
  }

  function markPhonePaired() {
    localStorage.setItem(pairedKey, "true");
    setPhonePaired(true);
    setPhoneStatus("Phone marked as paired. Send a test alert to confirm it arrives.");
  }

  async function send(raw: string) {
    const value = raw.trim();
    if (!value || busy || stage === "processing" || stage === "done") return;
    setError("");
    if (stage === "room" && !hotel.rooms.some((room) => room.toLowerCase() === value.toLowerCase())) {
      setError(`Enter one of these room types: ${hotel.rooms.join(", ")}.`);
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

    setDraft("");
    addMessage("guest", value);

    if (stage === "questions") {
      if (/(book|reserve|reservation)/i.test(value)) {
        await answer(`Certainly. Which room would you like at ${hotel.name}? Type one of these: ${hotel.rooms.join(", ")}.`, "room");
      } else {
        await answer(serviceAnswer(value, hotel), "questions");
        if (isTowelRequest(value)) showNotice(towelResponse);
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
      setBusy(true);
      setStage("processing");
      const summary = `${booking.room} at ${hotel.name} for ${booking.nights} night${booking.nights === "1" ? "" : "s"} from ${booking.date}.`;
      await delay(1100);
      addMessage("hotel", `Your demo booking request is ready, ${value}. ${summary} This is a preview; no reservation was made.`);
      showNotice(`${summary} Demo preview only — no reservation was made.`);
      setStage("done");
      setBusy(false);
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  return <div className="service-chat" aria-label={`${hotel.serviceName} chat`}>
    <div className="service-chat-header"><div className="service-status"><span /> {hotel.serviceName.toUpperCase()}</div><h2>How can we help?</h2><p>Type a question or request in your own words. Answers are scripted for this demo.</p></div>
    <div className="service-chat-body" role="log" aria-live="polite" ref={bodyRef}>
      <div className="chat-day">TODAY · PRONTO SERVICE</div>
      {messages.map((message) => <div key={message.id} className={`service-message service-message-${message.sender}`}>{message.text}</div>)}
      {busy && <div className="service-typing" aria-label="Service center is typing"><span /><span /><span /></div>}
    </div>
    <div className="service-chat-bottom">
      <details className="phone-pairing"><summary>Connect a separate phone <span aria-hidden="true">↗</span></summary>
        <div className="phone-pairing-content">
          <p>Open the <a href="https://docs.ntfy.sh/subscribe/phone/" target="_blank" rel="noopener noreferrer">ntfy app</a> on your phone and allow notifications. Tap <strong>+</strong>, enter the topic below, and tap <strong>Subscribe</strong>. Keep the default server, <strong>ntfy.sh</strong>.</p>
          {topic && <>
            <div className="phone-pairing-code">
              <QRCodeSVG value={`https://ntfy.sh/${topic}`} size={120} marginSize={4} title="Open this topic in your phone browser" />
              <div><code>{topic}</code><small>The QR code opens the topic in your browser.</small></div>
            </div>
            <button type="button" onClick={markPhonePaired}>{phonePaired ? "Phone subscribed ✓" : "I've subscribed on my phone"}</button>
            <button type="button" onClick={() => void publishPhoneNotice("Pronto test alert — your phone is connected to the demo.")} disabled={!phonePaired}>Send test alert</button>
          </>}
          <small>Demo content uses a public ntfy topic. Anyone with this code can read or publish to it; do not use real guest details.</small></div>
      </details>
      {notice && <div className="service-notice" role="status"><strong>Demo notification</strong><p>{notice}</p><button type="button" onClick={() => void publishPhoneNotice(notice)} disabled={!phonePaired}>Send to paired phone ↗</button></div>}
      {phoneStatus && <p className="phone-status" role="status">{phoneStatus}</p>}
      {stage === "done" ? <button className="chat-restart" onClick={() => { setStage("questions"); setNotice(""); addMessage("hotel", "What else can I help you with?"); }}>Ask another question ↗</button> : <form onSubmit={submit}>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="chat-input-line"><input ref={inputRef} type={stage === "date" ? "date" : stage === "nights" ? "number" : "text"} min={stage === "nights" ? "1" : undefined} max={stage === "nights" ? "14" : undefined} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={stage === "name" ? "Your name" : stage === "nights" ? "Number of nights" : stage === "date" ? undefined : stage === "room" ? "Choose a room..." : "Ask about this hotel..."} aria-label={stage === "date" ? "Check-in date" : "Message"} disabled={busy} /><button type="submit" disabled={busy || !draft.trim()} aria-label="Send message">↑</button></div>
      </form>}
      <p className="chat-footnote">Demo only · No hotel request or reservation is created</p>
    </div>
  </div>;
}
