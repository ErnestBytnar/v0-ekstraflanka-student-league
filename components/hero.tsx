"use client"

import { Zap, Trophy, MapPin } from "lucide-react"

interface HeroProps {
  onCta: () => void
}

export function Hero({ onCta }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-24">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--amber) 1px, transparent 1px), linear-gradient(90deg, var(--amber) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Amber glow blob top-left */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl bg-amber pointer-events-none" />
      {/* Neon glow blob bottom-right */}
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10 blur-3xl bg-neon pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-amber/40 bg-amber/10 text-amber font-sans text-sm font-semibold px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5" />
          Liga 2024/25 · Sezon otwarty
        </div>

        {/* Main heading */}
        <h1 className="font-display font-black uppercase leading-none mb-6">
          <span className="block text-7xl md:text-[9rem] text-amber text-glow-amber tracking-tight">
            Zostań
          </span>
          <span className="block text-6xl md:text-8xl text-foreground tracking-widest">
            Legendą
          </span>
          <span className="block text-5xl md:text-7xl text-neon text-glow-neon tracking-widest">
            Trawnika
          </span>
        </h1>

        {/* Subtext */}
        <p className="font-sans text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 text-pretty">
          Pierwsza w Polsce oficjalna liga flanek. Rankingi, turnieje i mapa
          spotów w&nbsp;Twoim mieście.
        </p>

        {/* CTA */}
        <button
          onClick={onCta}
          className="inline-flex items-center gap-3 bg-amber text-primary-foreground font-display font-bold text-2xl uppercase tracking-widest px-10 py-4 rounded transition-all hover:opacity-90 hover:scale-105 active:scale-95 glow-amber"
        >
          <Trophy className="w-6 h-6" />
          Dołącz do Gry
        </button>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto">
          {[
            { value: "4 200+", label: "Zawodników" },
            { value: "38", label: "Miast" },
            { value: "12 000+", label: "Rozegranych Meczów" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-black text-3xl md:text-4xl text-amber">
                {stat.value}
              </div>
              <div className="font-sans text-muted-foreground text-xs uppercase tracking-widest mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground">
        <MapPin className="w-4 h-4 text-amber animate-bounce" />
        <span className="font-sans text-xs uppercase tracking-widest">Przewiń</span>
      </div>
    </section>
  )
}
