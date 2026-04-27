"use client"

import { Target, Droplets, Trophy, TrendingUp, Flame, Star, Shield, Crown, Award, Activity } from "lucide-react"

const STATS = [
  { label: "Rzuty celne", value: "847", icon: Target, color: "text-amber", bg: "bg-amber/10" },
  { label: "Wypite litry (izotoników)", value: "34.2 L", icon: Droplets, color: "text-neon", bg: "bg-neon/10" },
  { label: "Wygrane mecze", value: "41", icon: Trophy, color: "text-amber", bg: "bg-amber/10" },
  { label: "Seria bez porażki", value: "7", icon: Flame, color: "text-red-400", bg: "bg-red-400/10" },
  { label: "Aktywne rankingi", value: "3", icon: Activity, color: "text-neon", bg: "bg-neon/10" },
  { label: "Odznaki", value: "12", icon: Award, color: "text-amber", bg: "bg-amber/10" },
]

const HISTORY = [
  { date: "Wczoraj", opponent: "Flanka_Bomber", result: "Wygrana", score: "15 – 9", spot: "Pola Mokotowskie" },
  { date: "2 dni temu", opponent: "MatiasKrul", result: "Wygrana", score: "12 – 11", spot: "Bulwary Wiślane" },
  { date: "3 dni temu", opponent: "Drużyna AGH", result: "Porażka", score: "8 – 13", spot: "Miasteczko AGH" },
  { date: "5 dni temu", opponent: "Zbychu_Strzelec", result: "Wygrana", score: "14 – 7", spot: "Wyspa Słodowa" },
]

const BADGES = [
  { icon: Crown, label: "Król Flanki", description: "10 wygranych z rzędu", earned: true },
  { icon: Target, label: "Snajper", description: "Celność powyżej 90%", earned: true },
  { icon: Flame, label: "W Ogniu", description: "5 wygranych w tydzień", earned: true },
  { icon: Star, label: "Veterano", description: "100 rozegranych meczy", earned: false },
  { icon: Shield, label: "Niezłomny", description: "Brak czerwonej kartki przez sezon", earned: true },
  { icon: Trophy, label: "Legenda", description: "Wygraj turniej miejski", earned: false },
]

export function Dashboard() {
  return (
    <section id="profil" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-amber font-sans text-sm uppercase tracking-widest mb-4">
            <Trophy className="w-4 h-4" />
            Profil
          </div>
          <h2 className="font-display font-black text-5xl md:text-6xl uppercase text-foreground text-balance">
            Mój <span className="text-amber text-glow-amber">Profil</span>
          </h2>
        </div>

        {/* Profile card */}
        <div className="border border-border rounded-lg bg-card p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-amber/10 border-2 border-amber flex items-center justify-center flex-shrink-0 glow-amber">
            <span className="font-display font-black text-3xl text-amber">K</span>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="font-display font-black text-2xl text-foreground uppercase tracking-wider">
              KaroMistrz_99
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 mb-3">
              <div className="inline-flex items-center gap-1.5 bg-amber/10 border border-amber/40 text-amber font-sans text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
                <Crown className="w-3 h-3" />
                Piwny Snajper
              </div>
              <div className="inline-flex items-center gap-1.5 bg-neon/10 border border-neon/40 text-neon font-sans text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
                <TrendingUp className="w-3 h-3" />
                #1 Ranking
              </div>
            </div>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-md">
              Gracz z Warszawy, mistrz Pól Mokotowskich. Specjalizacja: flanka z lewej ręki na 12 metrów.
            </p>
          </div>

          {/* Level bar */}
          <div className="flex-shrink-0 w-full sm:w-40 text-center">
            <div className="font-display font-bold text-xs text-muted-foreground uppercase tracking-widest mb-1">
              Postęp do Legendy
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-1">
              <div className="h-full bg-amber rounded-full" style={{ width: "78%" }} />
            </div>
            <div className="font-sans text-xs text-amber">78% – jeszcze trochę!</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="border border-border rounded-lg bg-card p-4 flex items-center gap-4 hover:border-amber/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="font-display font-black text-xl text-foreground">
                    {stat.value}
                  </div>
                  <div className="font-sans text-xs text-muted-foreground leading-tight">
                    {stat.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom grid: badges + history */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Badges */}
          <div>
            <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-wider mb-4">
              Odznaki
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {BADGES.map((badge) => {
                const Icon = badge.icon
                return (
                  <div
                    key={badge.label}
                    className={`border rounded-lg p-3 text-center transition-all ${
                      badge.earned
                        ? "border-amber/40 bg-amber/5"
                        : "border-border bg-card opacity-40 grayscale"
                    }`}
                    title={badge.description}
                  >
                    <div className="flex justify-center mb-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          badge.earned ? "bg-amber/20" : "bg-muted"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${badge.earned ? "text-amber" : "text-muted-foreground"}`} />
                      </div>
                    </div>
                    <div className="font-display font-bold text-xs text-foreground uppercase leading-tight">
                      {badge.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Match history */}
          <div>
            <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-wider mb-4">
              Historia Meczy
            </h3>
            <div className="flex flex-col gap-3">
              {HISTORY.map((match, i) => (
                <div
                  key={i}
                  className="border border-border rounded-lg bg-card p-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-sans text-xs text-muted-foreground">{match.date}</div>
                    <div className="font-display font-bold text-sm text-foreground">
                      vs {match.opponent}
                    </div>
                    <div className="font-sans text-xs text-muted-foreground">{match.spot}</div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-display font-black text-sm ${
                        match.result === "Wygrana" ? "text-neon" : "text-red-400"
                      }`}
                    >
                      {match.result}
                    </div>
                    <div className="font-sans text-xs text-muted-foreground">{match.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
