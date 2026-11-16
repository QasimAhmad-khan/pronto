"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import hotels from "@/constants/hotels.json";
import ChatWidget from "@/components/ChatWidget";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className="arrow">{diagonal ? "↗" : "→"}</span>;
}

function HotelCard({ hotel, index, onBook }: { hotel: (typeof hotels)[number]; index: number; onBook: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <article ref={ref} className={`hotel-card hotel-card-${index + 1}`}>
      <div className="hotel-image-wrap">
        <motion.img
          src={hotel.image}
          alt={`Illustrative interior for ${hotel.name}`}
          className="hotel-image"
          style={reduceMotion ? undefined : { y }}
          loading="lazy"
        />
        <span className="hotel-number">0{index + 1} / 03</span>
      </div>
      <div className="hotel-meta">
        <div>
          <p className="eyebrow hotel-location">{hotel.location}</p>
          <h3>{hotel.name}</h3>
          <p className="room-list">{hotel.rooms.join(" · ")}</p>
        </div>
        <div className="hotel-end">
          <span className="price">From {hotel.price}</span>
          <button onClick={onBook} className="round-arrow" aria-label={`Enquire about ${hotel.name}`}><Arrow diagonal /></button>
        </div>
      </div>
    </article>
  );
}

const areas = ["All stays", "Karachi", "Lahore", "Islamabad", "Northern Pakistan", "Other cities"] as const;

function HotelDirectory() {
  const [activeArea, setActiveArea] = useState<(typeof areas)[number]>("All stays");
  const reduceMotion = useReducedMotion();
  const listedHotels = hotels.slice(3).filter((hotel) => activeArea === "All stays" || hotel.area === activeArea);

  return <section className="directory-section" id="across-pakistan">
    <div className="directory-intro">
      <p className="eyebrow">02 / EXPLORE PAKISTAN</p>
      <div className="directory-heading-row"><h2>Go a little <em>further.</em></h2><p>From big city icons to mountain escapes, discover more places to stay. The guided booking demo currently features Serena Islamabad.</p></div>
    </div>
    <div className="directory-filters" role="group" aria-label="Filter hotels by destination">
      {areas.map((area) => <button key={area} type="button" className={activeArea === area ? "active" : ""} onClick={() => setActiveArea(area)} aria-pressed={activeArea === area}>{area}</button>)}
    </div>
    <motion.div layout className="directory-grid">
      <AnimatePresence mode="popLayout">
        {listedHotels.map((hotel) => <motion.article key={hotel.id} layout initial={reduceMotion ? false : { opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -18 }} transition={{ duration: reduceMotion ? 0 : .38 }} className="directory-card">
          <div className="directory-image-wrap"><img src={hotel.image} alt={`Illustrative view for ${hotel.name}`} loading="lazy" /></div>
          <div className="directory-card-details"><span className="eyebrow">{hotel.location}</span><h3>{hotel.name}</h3><span className="directory-rate">{hotel.price}</span></div>
        </motion.article>)}
      </AnimatePresence>
    </motion.div>
    <p className="directory-footnote">A curated demo collection · Images are illustrative · Rates and availability vary</p>
  </section>;
}

export default function Home() {
  const chatRef = useRef<{ open: () => void }>(null);
  const openChat = () => chatRef.current?.open();

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Pronto home">pronto<span className="wordmark-dot">.</span></a>
        <nav aria-label="Main navigation">
          <a href="#stays">Featured stays</a>
          <a href="#across-pakistan">Across Pakistan</a>
          <a href="#approach">Our approach</a>
        </nav>
        <button className="header-action" onClick={openChat}>Plan your stay <Arrow diagonal /></button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> A NEW WAY TO STAY IN PAKISTAN</p>
          <h1>Somewhere<br /><em>worth staying.</em></h1>
          <div className="hero-bottom">
            <p>Extraordinary places, thoughtfully found. Discover your next stay in the cities you love.</p>
            <a className="text-link" href="#stays">Explore the stays <Arrow diagonal /></a>
          </div>
        </div>
        <div className="hero-image-frame">
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90" alt="Warm, contemporary hotel lounge" className="hero-image" />
          <div className="hero-image-note"><span>01 / 03</span><span>YOUR NEXT CHAPTER BEGINS HERE</span></div>
        </div>
        <div className="hero-scroll">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></div>
      </section>

      <section className="stays-section" id="stays">
        <div className="section-heading">
          <div><p className="eyebrow">01 / HANDPICKED STAYS</p><h2>Places with<br /><em>a point of view.</em></h2></div>
          <p>From the capital to the heart of Lahore, find a place that feels like more than a room.</p>
        </div>
        <div className="hotel-grid">
          {hotels.slice(0, 3).map((hotel, index) => <HotelCard key={hotel.id} hotel={hotel} index={index} onBook={openChat} />)}
        </div>
      </section>

      <HotelDirectory />

      <section className="approach-section" id="approach">
        <p className="eyebrow">03 / THE PRONTO WAY</p>
        <div className="approach-row"><h2>Less searching.<br /><em>More arriving.</em></h2><div><p>Tell us where you want to go. Our guided booking chat takes you from first thought to a confirmation in just a few steps.</p><button className="light-button" onClick={openChat}>Start a conversation <Arrow diagonal /></button></div></div>
        <div className="approach-footer"><span>CONSIDERED STAYS. SIMPLE MOMENTS.</span><span>PAKISTAN, REIMAGINED.</span></div>
      </section>

      <footer className="site-footer"><a className="wordmark" href="#top">pronto<span className="wordmark-dot">.</span></a><p>Made for the journey, and everything after.</p><small>Demo hotel details and imagery are illustrative.</small></footer>
      <ChatWidget ref={chatRef} />
    </main>
  );
}
