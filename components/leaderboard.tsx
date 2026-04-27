"use client"

import { useEffect, useState } from "react"
import { Trophy, Target, Star, Crown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getRank } from "@/lib/ranks"

const TABS = [
  { id: "snajperzy", label: "Top Snajperzy", icon: Target },
]

interface Player {
  pos: number
  gracz: string
  wygrane: number
  losses: number
  ranga: string
}

const POS_COLORS: Record<number, string> = {
  1: "text-amber",
  2: "text-zinc-300",
  3: "text-amber/60",
}

export function Leaderboard() {
  const [active, setActive] = useState("snajperzy")
  const [data, setData] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("wins", { ascending: false })
        .limit(20)

      if (!error && profiles) {
        const ranked = profiles.map((p, i) => ({
          pos: i + 1,
          gracz: p.nickname || "Anonimowy",
          wygrane: p.wins || 0,
          losses: p.losses || 0,
          ranga: getRank(p.wins || 0),
        }))
        setData(ranked)
      }
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

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
            <div className="col-span-6 font-sans text-xs text-muted-foreground uppercase tracking-widest">
              Gracz
            </div>
            <div className="col-span-2 font-sans text-xs text-muted-foreground uppercase tracking-widest text-center">
              Wygrane
            </div>
            <div className="col-span-3 font-sans text-xs text-muted-foreground uppercase tracking-widest text-right">
              Przegrane
            </div>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="px-4 py-8 text-center text-muted-foreground">Ladowanie...</div>
          ) : data.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">Brak graczy na ranking</div>
          ) : (
            data.map((row, i) => (
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
                <div className="col-span-6">
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

                {/* Wygrane */}
                <div className="col-span-2 text-center">
                  <span className="font-display font-bold text-neon text-lg text-glow-neon">
                    {row.wygrane}
                  </span>
                </div>

                {/* Przegrane */}
                <div className="col-span-3 text-right">
                  <span className="font-display font-bold text-foreground text-lg">
                    {row.losses}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
