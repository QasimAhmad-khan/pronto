"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

type Step = "INIT" | "LOCATION" | "CONFIRM" | "PHONE" | "PROCESSING" | "DONE";
type Message = { id: number; from: "bot" | "user"; text: string };
type Notice = { title: string; body: string };

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const phonePattern = /^\+92(?:3\d{9})$/;
const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || (process.env.NEXT_PUBLIC_DEMO_MODE !== "false" && !process.env.NEXT_PUBLIC_BOOKING_API_URL);

const ChatWidget = forwardRef<{ open: () => void }>(function ChatWidget(_, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("INIT");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [notificationStatus, setNotificationStatus] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  function addMessage(from: Message["from"], text: string) {
    setMessages((current) => [...current, { id: ++nextId.current, from, text }]);
  }

  function showNotice(nextNotice: Notice) {
    setNotice(nextNotice);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try { new Notification(nextNotice.title, { body: nextNotice.body }); } catch { /* The in-page notice remains available. */ }
    }
  }

  async function enableDeviceAlerts() {
    if (typeof Notification === "undefined" || !window.isSecureContext) {
      setNotificationStatus("Device alerts need a supported browser and HTTPS. The in-page notification still works.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted" && notice) {
        new Notification(notice.title, { body: notice.body });
        setNotificationStatus("Device alerts are enabled for this browser.");
      } else {
        setNotificationStatus("Device alerts were not enabled. The in-page notification still works.");
      }
    } catch {
      setNotificationStatus("This browser cannot show device alerts. The in-page notification still works.");
    }
  }

  function open() {
    setIsOpen(true);
    if (step === "INIT") {
      setStep("LOCATION");
      setTyping(true);
      window.setTimeout(() => {
        addMessage("bot", "Welcome to Pronto! Where in Pakistan are you looking to stay?");
        setTyping(false);
      }, 1200);
    }
  }

  useImperativeHandle(ref, () => ({ open }));
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing, isOpen]);
  useEffect(() => { if (isOpen && !typing) inputRef.current?.focus(); }, [isOpen, typing]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    if (!value || typing || step === "PROCESSING" || step === "DONE") return;
    if (step === "PHONE" && !phonePattern.test(value)) {
      setError("Enter a Pakistani mobile number in the format +923001234567.");
      return;
    }

    setError("");
    setInput("");
    addMessage("user", value);
    setTyping(true);

    if (step === "LOCATION") {
      setStep("CONFIRM");
      await pause(1200);
      addMessage("bot", "Excellent. We have the Executive Suite available at the Serena Hotel tonight. Would you like to book this?");
    } else if (step === "CONFIRM") {
      setStep("PHONE");
      await pause(1200);
      addMessage("bot", demoMode ? "Perfect! Enter a Pakistani mobile number (e.g., +923001234567) to preview your confirmation. No SMS or reservation is created in demo mode." : "Perfect! Please enter your mobile number (e.g., +923001234567) to receive your booking confirmation.");
    } else if (step === "PHONE") {
      setStep("PROCESSING");
      if (demoMode) {
        await pause(1200);
        addMessage("bot", "Demo confirmation ready! Your preview notification is shown on this device. No SMS was sent.");
        showNotice({ title: "Pronto · Demo confirmation", body: "Executive Suite at Serena Hotel Islamabad. This is a preview; no reservation or SMS was sent." });
        setStep("DONE");
      } else try {
        const response = await fetch(process.env.NEXT_PUBLIC_BOOKING_API_URL || "/api/send-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: value, hotel: "Serena Hotel Islamabad" }),
        });
        if (!response.ok) throw new Error("SMS service unavailable");
        await pause(1200);
        addMessage("bot", "Booking confirmed! You will receive an SMS confirmation on your phone momentarily.");
        showNotice({ title: "Pronto · Booking confirmation", body: "Your SMS request for Serena Hotel Islamabad was accepted." });
        setStep("DONE");
      } catch {
        addMessage("bot", "We couldn't send your confirmation right now. Please check the number and try again.");
        setStep("PHONE");
      }
    }
    setTyping(false);
  }

  return <div className="chat-shell">
    {isOpen && <section className="chat-panel" aria-label="Pronto booking chat">
      <div className="chat-header"><div><span className="chat-status" /> <span>PRONTO CONCIERGE {demoMode ? "· DEMO MODE" : ""}</span><strong>Let’s find your stay.</strong></div><button onClick={() => setIsOpen(false)} aria-label="Close chat">×</button></div>
      <div className="chat-messages" role="log" aria-live="polite">
        <div className="chat-date">TODAY · YOUR BOOKING JOURNEY</div>
        {messages.map((message) => <div key={message.id} className={`message message-${message.from}`}>{message.text}</div>)}
        {typing && <div className="typing-indicator" aria-label="Pronto is typing"><span /><span /><span /></div>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="chat-form">
        {error && <p className="chat-error" role="alert">{error}</p>}
        <div className="chat-input-row"><input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder={step === "PHONE" ? "+923001234567" : step === "DONE" ? "Booking complete" : "Type your message..."} aria-label={step === "PHONE" ? "Pakistani mobile number" : "Your message"} disabled={typing || step === "PROCESSING" || step === "DONE"} autoComplete={step === "PHONE" ? "tel" : "off"} /><button type="submit" aria-label="Send message" disabled={!input.trim() || typing || step === "PROCESSING" || step === "DONE"}>↑</button></div>
        <p className="chat-disclaimer">{demoMode ? "Preview only · No SMS or reservation will be created" : "A guided demo experience by Pronto"}</p>
      </form>
    </section>}
    {notice && <div className="booking-notice" role="status" aria-live="polite">
      <div className="booking-notice-top"><span className="booking-notice-icon">✳</span><span>{demoMode ? "DEMO NOTIFICATION" : "BOOKING UPDATE"}</span><button onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button></div>
      <strong>{notice.title}</strong><p>{notice.body}</p>
      <button className="device-alert-button" onClick={enableDeviceAlerts}>Show as device alert <span aria-hidden="true">↗</span></button>
      {notificationStatus && <small>{notificationStatus}</small>}
    </div>}
    <button className="chat-launcher" onClick={() => isOpen ? setIsOpen(false) : open()} aria-label={isOpen ? "Close booking chat" : "Open booking chat"} aria-expanded={isOpen}>
      {isOpen ? <span className="launcher-close">×</span> : <><span className="launcher-spark">✳</span><span>Let’s talk stays</span><span className="launcher-arrow">↗</span></>}
    </button>
  </div>;
});

export default ChatWidget;
