"use client"

import { useState } from "react"
import { Menu, X, Zap } from "lucide-react"

const NAV_ITEMS = [
  { label: "Ranking", href: "#ranking" },
  { label: "Kodeks", href: "#kodeks" },
  { label: "Mapa Spotów", href: "#mapa" },
  { label: "Szukam Ekipy", href: "#ekipa" },
  { label: "Mój Profil", href: "#profil" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-amber rounded flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-black text-xl uppercase tracking-wider">
            <span className="text-amber">Ekstra</span>
            <span className="text-foreground">Flanka</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-sans text-sm text-muted-foreground hover:text-amber transition-colors uppercase tracking-widest"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a
          href="#ekipa"
          className="hidden md:inline-flex items-center gap-2 bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-4 py-2 rounded hover:opacity-90 transition-opacity"
        >
          Graj Teraz
        </a>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md px-4 py-4 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-display font-bold text-lg text-muted-foreground hover:text-amber transition-colors uppercase tracking-widest"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#ekipa"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center bg-amber text-primary-foreground font-display font-bold uppercase tracking-widest px-4 py-3 rounded mt-2"
          >
            Graj Teraz
          </a>
        </nav>
      )}
    </header>
  )
}
