"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import BrandHeader from "@/components/BrandHeader";
import hotels from "@/constants/hotels.json";

export default function Home() {
  const reducedMotion = useReducedMotion();

  return <main>
    <section className="landing-hero">
      <BrandHeader onBlue />
      <div className="hero-layout">
        <div className="hero-words">
          <p className="micro-label">PRONTO · HOTEL SERVICE MADE SIMPLE</p>
          <h1>Your stay,<br /><em>at your fingertips.</em></h1>
          <p className="hero-intro">Choose a hotel, open its guide, and ask its service center what you need.</p>
          <Link className="pill-button pill-button-white" href="#hotels">Explore the hotels <span aria-hidden="true">↗</span></Link>
          <div className="hero-index"><span>01 / 03</span><span>ISLAMABAD · LAHORE</span></div>
        </div>
        <div className="hero-photo-composition">
          <motion.div initial={reducedMotion ? false : { opacity: 0, y: 45 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }} className="hero-main-photo">
            <img src={hotels[0].image} alt="Islamabad Marriott Hotel exterior" />
            <span>ISLAMABAD MARRIOTT</span>
          </motion.div>
          <motion.div initial={reducedMotion ? false : { opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8, delay: .2 }} className="hero-side-photo">
            <img src={hotels[1].image} alt="Islamabad Serena Hotel exterior" />
            <span>ISLAMABAD SERENA</span>
          </motion.div>
        </div>
      </div>
      <div className="hero-bottom-bar"><span>DISCOVER YOUR NEXT STAY</span><span aria-hidden="true">↓</span></div>
    </section>

    <section className="hotels-section" id="hotels">
      <div className="section-topline"><span>THE HOTEL COLLECTION</span><span>THREE PLACES · ONE SIMPLE WAY TO ASK</span></div>
      <div className="hotels-heading"><h2>Choose your <em>hotel.</em></h2><p>Every hotel has its own guide and service center. Select one to explore rooms, amenities, and a booking request demo.</p></div>
      <div className="hotel-cards">
        {hotels.map((hotel, index) => <motion.article key={hotel.id} initial={reducedMotion ? false : { opacity: 0, y: 42 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .55, delay: index * .1 }} className="hotel-preview">
          <Link href={`/hotels/${hotel.slug}`} aria-label={`Open ${hotel.name} guide`}>
            <div className="preview-image"><img src={hotel.image} alt={`${hotel.name} official property photograph`} loading="lazy" /><span className="preview-number">0{index + 1}</span></div>
            <div className="preview-meta"><div><span className="micro-label">{hotel.location.toUpperCase()}</span><h3>{hotel.name}</h3><p>{hotel.serviceName} · Hotel guide</p></div><span className="preview-arrow" aria-hidden="true">↗</span></div>
          </Link>
        </motion.article>)}
      </div>
    </section>

    <section className="requests-section" id="requests">
      <p className="micro-label">WHAT PRONTO IS FOR</p>
      <div className="requests-layout"><h2>ALL YOUR REQUESTS<br /><em>HANDLED PRONTO.</em></h2><div><p>No more waiting on the landline, tell Pronto what you need and know that it will be done.</p><Link className="pill-button pill-button-outline" href="#hotels">Choose your hotel <span aria-hidden="true">↗</span></Link></div></div>
      <div className="requests-rule"><span>ROOMS</span><span>DINING</span><span>POOL</span><span>BOOKING REQUESTS</span></div>
    </section>

    <footer className="site-footer"><span>PRONTO</span><p>Your stay, at your fingertips.</p><small>Hotel photos and published details are linked to their official sources. Service times marked “demo” are illustrative.</small></footer>
  </main>;
}
