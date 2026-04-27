"use client"

import { useState } from "react"
import { Trophy, Target, Star, Crown } from "lucide-react"

const TABS = [
  { id: "snajperzy", label: "Top Snajperzy", icon: Target },
  { id: "wydzialy", label: "Bitwa Wydziałów", icon: Trophy },
  { id: "legendy", label: "Legendy Miast", icon: Crown },
]

const SNAJPERZY = [
  { pos: 1, gracz: "KaroMistrz_99", celnosc: "94%", wygrane: 47, ranga: "Legenda" },
  { pos: 2, gracz: "Flanka_Bomber", celnosc: "91%", wygrane: 43, ranga: "Pro" },
  { pos: 3, gracz: "PawełSnajper", celnosc: "89%", wygrane: 41, ranga: "Pro" },
  { pos: 4, gracz: "Zbychu_Strzelec", celnosc: "87%", wygrane: 38, ranga: "Zaawansowany" },
  { pos: 5, gracz: "MatiasKrul", celnosc: "85%", wygrane: 36, ranga: "Zaawansowany" },
  { pos: 6, gracz: "Grzesiu_Top", celnosc: "83%", wygrane: 33, ranga: "Zaawansowany" },
  { pos: 7, gracz: "KrzysWaw", celnosc: "81%", wygrane: 30, ranga: "Średni" },
  { pos: 8, gracz: "Dominik_AGH", celnosc: "79%", wygrane: 28, ranga: "Średni" },
]

const WYDZIALY = [
  { pos: 1, gracz: "Politechnika Warszawska", celnosc: "88%", wygrane: 120, ranga: "Elita" },
  { pos: 2, gracz: "AGH Kraków", celnosc: "86%", wygrane: 112, ranga: "Elita" },
  { pos: 3, gracz: "Uniwersytet Wrocławski", celnosc: "83%", wygrane: 98, ranga: "Pro" },
  { pos: 4, gracz: "UJ Kraków", celnosc: "80%", wygrane: 91, ranga: "Pro" },
  { pos: 5, gracz: "Politechnika Gdańska", celnosc: "77%", wygrane: 85, ranga: "Zaawansowana" },
  { pos: 6, gracz: "SGH Warszawa", celnosc: "75%", wygrane: 78, ranga: "Zaawansowana" },
]

const LEGENDY = [
  { pos: 1, gracz: "Warszawa", celnosc: "91%", wygrane: 580, ranga: "Stolica Legend" },
  { pos: 2, gracz: "Kraków", celnosc: "89%", wygrane: 520, ranga: "Legenda" },
  { pos: 3, gracz: "Wrocław", celnosc: "86%", wygrane: 470, ranga: "Legenda" },
  { pos: 4, gracz: "Gdańsk", celnosc: "83%", wygrane: 410, ranga: "Pro" },
  { pos: 5, gracz: "Poznań", celnosc: "80%", wygrane: 390, ranga: "Pro" },
  { pos: 6, gracz: "Łódź", celnosc: "77%", wygrane: 340, ranga: "Zaawansowane" },
]

const DATA_MAP: Record<string, typeof SNAJPERZY> = {
  snajperzy: SNAJPERZY,
  wydzialy: WYDZIALY,
  legendy: LEGENDY,
}

const POS_COLORS: Record<number, string> = {
  1: "text-amber",
  2: "text-zinc-300",
  3: "text-amber/60",
}

export function Leaderboard() {
  const [active, setActive] = useState("snajperzy")
  const data = DATA_MAP[active]

  return (
    <section id="ranking" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-amber font-sans text-sm uppercase tracking-widest mb-4">
            <Star className="w-4 h-4" />
            Ranking
          </div>
          <h2 className="font-display font-black text-5xl md:text-6xl uppercase text-foreground text-balance">
            Kto Rządzi{" "}
            <span className="text-amber text-glow-amber">Boiskiem?</span>
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded font-display font-bold text-sm uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-amber text-primary-foreground glow-amber"
                    : "bg-secondary text-muted-foreground border border-border hover:border-amber/50 hover:text-amber"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          {/* Table header */}
          <div className="grid grid-cols-12 px-4 py-3 border-b border-border bg-muted/50">
            <div className="col-span-1 font-sans text-xs text-muted-foreground uppercase tracking-widest">
              Poz.
            </div>
            <div className="col-span-5 font-sans text-xs text-muted-foreground uppercase tracking-widest">
              Gracz
            </div>
            <div className="col-span-3 font-sans text-xs text-muted-foreground uppercase tracking-widest text-center">
              Celność
            </div>
            <div className="col-span-3 font-sans text-xs text-muted-foreground uppercase tracking-widest text-right">
              Wygrane
            </div>
          </div>

          {/* Rows */}
          {data.map((row, i) => (
            <div
              key={row.gracz}
              className={`grid grid-cols-12 items-center px-4 py-4 border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30 ${
                i === 0 ? "bg-amber/5" : ""
              }`}
            >
              {/* Position */}
              <div className="col-span-1">
                {row.pos <= 3 ? (
                  <Crown
                    className={`w-5 h-5 ${POS_COLORS[row.pos] ?? "text-muted-foreground"}`}
                  />
                ) : (
                  <span className="font-display font-bold text-muted-foreground text-lg">
                    {row.pos}
                  </span>
                )}
              </div>

              {/* Gracz */}
              <div className="col-span-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <span className="font-display font-black text-xs text-amber">
                      {row.gracz.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className={`font-display font-bold text-sm ${i === 0 ? "text-amber" : "text-foreground"}`}>
                      {row.gracz}
                    </div>
                    <div className="font-sans text-xs text-muted-foreground">
                      {row.ranga}
                    </div>
                  </div>
                </div>
              </div>

              {/* Celność */}
              <div className="col-span-3 text-center">
                <span className="font-display font-bold text-neon text-lg text-glow-neon">
                  {row.celnosc}
                </span>
              </div>

              {/* Wygrane */}
              <div className="col-span-3 text-right">
                <span className="font-display font-bold text-foreground text-lg">
                  {row.wygrane}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
