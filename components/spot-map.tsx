"use client"

import { useState } from "react"
import { MapPin, AlertTriangle, Zap, CheckCircle, Users, Clock } from "lucide-react"

type Status = "hot" | "calm" | "danger"

interface Spot {
  id: number
  name: string
  city: string
  status: Status
  statusLabel: string
  players: number
  lastActive: string
  description: string
  x: number // % position on map
  y: number // % position on map
}

const SPOTS: Spot[] = [
  {
    id: 1,
    name: "Pola Mokotowskie",
    city: "Warszawa",
    status: "hot",
    statusLabel: "Tu się dzieje",
    players: 24,
    lastActive: "Teraz",
    description: "Największy spot w Warszawie. Codziennie od 16:00 pełno ekip.",
    x: 58,
    y: 32,
  },
  {
    id: 2,
    name: "Wyspa Słodowa",
    city: "Wrocław",
    status: "hot",
    statusLabel: "Tu się dzieje",
    players: 18,
    lastActive: "Teraz",
    description: "Ikoniczne miejsce na Odrze. Tryb 'Mostowy' dostępny.",
    x: 36,
    y: 52,
  },
  {
    id: 3,
    name: "Miasteczko AGH",
    city: "Kraków",
    status: "danger",
    statusLabel: "Uwaga: Niebiescy w pobliżu",
    players: 6,
    lastActive: "15 min temu",
    description: "Dobry spot ale ostatnio zainteresowały się nim służby porządkowe.",
    x: 52,
    y: 62,
  },
  {
    id: 4,
    name: "Park Sołacki",
    city: "Poznań",
    status: "calm",
    statusLabel: "Spokój",
    players: 4,
    lastActive: "1h temu",
    description: "Spokojny spot, idealny na treningi solo i w małej ekipie.",
    x: 38,
    y: 28,
  },
  {
    id: 5,
    name: "Gdańsk Oliwa",
    city: "Gdańsk",
    status: "calm",
    statusLabel: "Spokój",
    players: 2,
    lastActive: "2h temu",
    description: "Nowy spot, słabo znany. Idealne miejsce dla początkujących.",
    x: 50,
    y: 12,
  },
  {
    id: 6,
    name: "Łazienki Królewskie",
    city: "Warszawa",
    status: "danger",
    statusLabel: "Uwaga: Niebiescy w pobliżu",
    players: 0,
    lastActive: "3h temu",
    description: "Zamknięte – wczorajszy incydent przyciągnął uwagę ochrony parku.",
    x: 60,
    y: 28,
  },
  {
    id: 7,
    name: "Bulwary Wiślane",
    city: "Kraków",
    status: "hot",
    statusLabel: "Tu się dzieje",
    players: 14,
    lastActive: "5 min temu",
    description: "Letni hit. Wieczorami gra się po zmroku z latarkami.",
    x: 54,
    y: 65,
  },
  {
    id: 8,
    name: "Manufaktura",
    city: "Łódź",
    status: "calm",
    statusLabel: "Spokój",
    players: 3,
    lastActive: "45 min temu",
    description: "Betonowy spot z ciekawymi odbiciami. Styl Włókniarz Mode.",
    x: 48,
    y: 38,
  },
]

const STATUS_CONFIG: Record<Status, { color: string; bg: string; border: string; icon: typeof Zap; dot: string }> = {
  hot: {
    color: "text-neon",
    bg: "bg-neon/10",
    border: "border-neon/40",
    icon: Zap,
    dot: "bg-neon",
  },
  calm: {
    color: "text-amber",
    bg: "bg-amber/10",
    border: "border-amber/40",
    icon: CheckCircle,
    dot: "bg-amber",
  },
  danger: {
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/40",
    icon: AlertTriangle,
    dot: "bg-red-400",
  },
}

export function SpotMap() {
  const [selected, setSelected] = useState<Spot | null>(SPOTS[0])
  const [filter, setFilter] = useState<Status | "all">("all")

  const filtered = filter === "all" ? SPOTS : SPOTS.filter((s) => s.status === filter)

  return (
    <section id="mapa" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-amber font-sans text-sm uppercase tracking-widest mb-4">
            <MapPin className="w-4 h-4" />
            Mapa
          </div>
          <h2 className="font-display font-black text-5xl md:text-6xl uppercase text-foreground text-balance">
            Gdzie{" "}
            <span className="text-amber text-glow-amber">Rzucamy?</span>
          </h2>
          <p className="text-muted-foreground font-sans text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Sprawdź najlepsze spoty w Polsce, ich status i ilu zawodników gra teraz.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {([
            ["all", "Wszystkie", "bg-secondary border-border text-foreground"],
            ["hot", "Tu się dzieje", "bg-neon/10 border-neon/40 text-neon"],
            ["calm", "Spokój", "bg-amber/10 border-amber/40 text-amber"],
            ["danger", "Ostrzeżenia", "bg-red-400/10 border-red-400/40 text-red-400"],
          ] as const).map(([val, label, cls]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-1.5 rounded border font-sans text-sm font-semibold uppercase tracking-wider transition-all ${cls} ${
                filter === val ? "opacity-100 ring-1 ring-offset-1 ring-offset-background ring-current" : "opacity-60 hover:opacity-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Map + sidebar layout */}
        <div className="grid md:grid-cols-5 gap-6">
          {/* SVG Map of Poland */}
          <div className="md:col-span-3 relative border border-border rounded-lg bg-card overflow-hidden" style={{ minHeight: 420 }}>
            {/* Grid lines */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--amber) 1px, transparent 1px), linear-gradient(90deg, var(--amber) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />

            {/* Stylised Poland silhouette via react-simple-maps would be ideal, but we use a custom SVG outline */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full opacity-10"
              preserveAspectRatio="none"
            >
              <polygon
                points="25,10 75,10 85,25 90,50 80,75 60,90 40,88 20,75 12,50 18,25"
                fill="none"
                stroke="var(--amber)"
                strokeWidth="0.5"
              />
            </svg>

            {/* Pins */}
            {SPOTS.filter((s) => filter === "all" || s.status === filter).map((spot) => {
              const cfg = STATUS_CONFIG[spot.status]
              const isSelected = selected?.id === spot.id
              return (
                <button
                  key={spot.id}
                  onClick={() => setSelected(spot)}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  aria-label={spot.name}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all ${cfg.dot} ${
                      isSelected ? "scale-150 ring-2 ring-white/30" : "scale-100 group-hover:scale-125"
                    } ${spot.status === "hot" ? "animate-pulse" : ""}`}
                    style={{ borderColor: "rgba(255,255,255,0.3)" }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover border border-border text-foreground text-xs font-sans px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                    {spot.name}
                  </div>
                </button>
              )
            })}

            {/* Map label */}
            <div className="absolute bottom-3 left-3 text-xs font-sans text-muted-foreground uppercase tracking-widest">
              Polska · EkstraFlanka Mapa Spotów
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-2 flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
            {filtered.map((spot) => {
              const cfg = STATUS_CONFIG[spot.status]
              const StatusIcon = cfg.icon
              const isSelected = selected?.id === spot.id
              return (
                <button
                  key={spot.id}
                  onClick={() => setSelected(spot)}
                  className={`text-left border rounded-lg p-4 transition-all ${
                    isSelected
                      ? `${cfg.border} ${cfg.bg}`
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
                        {spot.name}
                      </div>
                      <div className="font-sans text-xs text-muted-foreground">
                        {spot.city}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-sans font-semibold px-2 py-0.5 rounded ${cfg.bg} ${cfg.color} flex-shrink-0`}>
                      <StatusIcon className="w-3 h-3" />
                      {spot.statusLabel}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-sans">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {spot.players} graczy
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {spot.lastActive}
                    </span>
                  </div>
                  {isSelected && (
                    <p className="mt-3 text-xs font-sans text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                      {spot.description}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
