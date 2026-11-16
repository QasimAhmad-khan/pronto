import Link from "next/link";

export default function BrandHeader({ onBlue = false }: { onBlue?: boolean }) {
  return <header className={onBlue ? "brand-header brand-header-blue" : "brand-header"}>
    <Link href="/" className="brand-mark" aria-label="Pronto home">
      <img src="/brand/pronto-logo.jpg" alt="Pronto" />
    </Link>
    <nav aria-label="Main navigation">
      <Link href="/#hotels">Hotels</Link>
      <Link href="/#requests">How it works</Link>
    </nav>
    <Link className="header-link" href="/#hotels">Explore hotels <span aria-hidden="true">↗</span></Link>
  </header>;
}
