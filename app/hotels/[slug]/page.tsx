import Link from "next/link";
import { notFound } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import HotelServiceChat from "@/components/HotelServiceChat";
import hotels from "@/constants/hotels.json";

export function generateStaticParams() {
  return hotels.map((hotel) => ({ slug: hotel.slug }));
}

export default async function HotelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hotel = hotels.find((item) => item.slug === slug);
  if (!hotel) notFound();

  return <main className="detail-page">
    <div className="detail-nav-wrap"><BrandHeader onBlue /></div>
    <div className="detail-shell">
      <div className="detail-content">
        <Link className="back-link" href="/#hotels">← All hotels</Link>
        <div className="detail-intro"><span className="micro-label">{hotel.location.toUpperCase()} · HOTEL GUIDE</span><h1>{hotel.name}</h1><p>{hotel.description}</p><a className="detail-chat-jump" href="#hotel-chat">Ask {hotel.serviceName} ↗</a></div>
        <div className="detail-hero-image"><img src={hotel.image} alt={`${hotel.name} official property photograph`} /></div>
        <div className="detail-gallery">{hotel.gallery.map((photo) => <img key={photo.src} src={photo.src} alt={photo.alt} loading="lazy" />)}</div>
        <div className="guide-section"><div className="guide-heading"><span>01 / THE STAY</span><h2>A closer look.</h2></div><p>{hotel.description}</p><div className="guide-facts"><div><small>LOCATION</small><strong>{hotel.address}</strong></div><div><small>ROOM OPTIONS</small><strong>{hotel.rooms.length} featured types</strong></div><div><small>SERVICE</small><strong>{hotel.serviceName}</strong></div></div></div>
        <div className="guide-section"><div className="guide-heading"><span>02 / ROOMS</span><h2>Find your space.</h2></div><div className="room-grid">{hotel.rooms.map((room, index) => <div className="room-tile" key={room}><span>0{index + 1}</span><h3>{room}</h3><p>Ask the service center to include this room in your demo request.</p></div>)}</div></div>
        <div className="guide-section"><div className="guide-heading"><span>03 / GOOD TO KNOW</span><h2>At a glance.</h2></div><div className="info-list"><div><strong>Breakfast</strong><p>{hotel.breakfast}</p></div><div><strong>Pool</strong><p>{hotel.pool}</p></div><div><strong>Arrival</strong><p>{hotel.checkInOut}</p></div></div><p className="source-note">Pool hours and gender-specific slots labeled “demo” are illustrative. Verify current policies and availability with the hotel. <a href={hotel.source} target="_blank" rel="noopener noreferrer">Official hotel details ↗</a> · <a href={hotel.photosSource} target="_blank" rel="noopener noreferrer">Official photo source ↗</a></p></div>
      </div>
      <aside className="detail-chat-column" id="hotel-chat"><HotelServiceChat hotel={hotel} /></aside>
    </div>
    <footer className="detail-footer"><Link href="/">PRONTO</Link><span>Your stay, at your fingertips.</span><Link href="/#hotels">Explore all three hotels ↗</Link></footer>
  </main>;
}
