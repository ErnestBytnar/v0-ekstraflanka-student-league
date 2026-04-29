"use client"

import { useState } from "react"

export const dynamic = "force-dynamic"

import { AgeModal } from "@/components/age-modal"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Leaderboard } from "@/components/leaderboard"
import { Kodeks } from "@/components/kodeks"
import { SpotMap } from "@/components/spot-map"
import { MatchFinder } from "@/components/match-finder"
import { Dashboard } from "@/components/dashboard"
import { Events } from "@/components/events"
import { TournamentBracket } from "@/components/tournament-bracket"
import { Zap, Instagram, Twitter, Youtube } from "lucide-react"

export default function Page() {
  const [verified, setVerified] = useState(false)

  return (
    <>
      {/* Age gate */}
      {!verified && <AgeModal onConfirm={() => setVerified(true)} />}

      {/* App shell – visible but blurred until verified */}
      <div className={!verified ? "blur-sm pointer-events-none select-none" : ""}>
        <Navbar />

        <main>
          <Hero onCta={() => {
            document.getElementById("ekipa")?.scrollIntoView({ behavior: "smooth" })
          }} />

          <Leaderboard />
          <Kodeks />
          <Events />
          <TournamentBracket />
          <SpotMap />
          <MatchFinder />
          <Dashboard />
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-10">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-amber rounded flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-display font-black text-xl uppercase tracking-wider">
                    <span className="text-amber">Ekstra</span>
                    <span className="text-foreground">Flanka</span>
                  </span>
                </div>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-xs">
                  Pierwsza w Polsce oficjalna liga flanek. Rankingi, turnieje i mapa
                  spotów w Twoim mieście. Graj fair.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  {[Instagram, Twitter, Youtube].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-9 h-9 rounded border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-amber hover:border-amber/40 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Liga */}
              <div>
                <div className="font-display font-bold text-xs text-muted-foreground uppercase tracking-widest mb-4">
                  Liga
                </div>
                <ul className="flex flex-col gap-2">
                  {["Ranking", "Turnieje", "Kalendarz", "Nagrody"].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="font-sans text-sm text-muted-foreground hover:text-amber transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Info */}
              <div>
                <div className="font-display font-bold text-xs text-muted-foreground uppercase tracking-widest mb-4">
                  Informacje
                </div>
                <ul className="flex flex-col gap-2">
                  {["O nas", "Kodeks", "Kontakt", "Polityka prywatności"].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="font-sans text-sm text-muted-foreground hover:text-amber transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-sans text-xs text-muted-foreground">
                &copy; 2025 EkstraFlanka. Wszelkie prawa zastrzeżone. Graj odpowiedzialnie.
              </p>
              <div className="inline-flex items-center gap-1.5 border border-amber/30 bg-amber/5 text-amber font-sans text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
                <Zap className="w-3 h-3" />
                Oficjalna liga · Tylko 18+
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
