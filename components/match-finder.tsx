"use client"

import { useEffect, useState } from "react"
import { Users, Clock, MapPin, Flame, Shield, Star, Plus, X, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Level = "Kazdy" | "Sredni" | "Zaawansowany" | "Pro"

interface Call {
  id: string
  author: string
  message: string
  spot: string
  time: string
  level: Level
  missing: number
  total: number
  postedAt: string
}

const LEVEL_STYLE: Record<Level, { bg: string; text: string; icon: typeof Flame }> = {
  Kazdy: { bg: "bg-neon/10", text: "text-neon", icon: Star },
  Sredni: { bg: "bg-amber/10", text: "text-amber", icon: Shield },
  Zaawansowany: { bg: "bg-orange-400/10", text: "text-orange-400", icon: Flame },
  Pro: { bg: "bg-red-400/10", text: "text-red-400", icon: Flame },
}

export function MatchFinder() {
  const [calls, setCalls] = useState<Call[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ message: "", spot: "", time: "", level: "Kazdy" as Level, missing: 1, total: 4 })
  const [user, setUser] = useState<{ id: string; nickname: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const init = async () => {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, nickname")
          .eq("id", authUser.id)
          .single()
        if (profile) {
          setUser({ id: authUser.id, nickname: profile.nickname })
        }
      }

      // Fetch match calls
      const { data: matches } = await supabase
        .from("matches")
        .select("*")
        .eq("verified", false)
        .order("created_at", { ascending: false })
        .limit(10)

      if (matches) {
        const formatted = matches.map((m) => ({
          id: m.id,
          author: "Admin Call",
          message: `Mecz do zgloszenia: ${m.team_a?.length || 0} vs ${m.team_b?.length || 0}`,
          spot: "Rzeszow",
          time: new Date(m.created_at).toLocaleTimeString("pl-PL"),
          level: "Pro" as Level,
          missing: 0,
          total: 0,
          postedAt: "pending",
        }))
        setCalls(formatted)
      }

      setLoading(false)
    }
    init()
  }, [])

  const handleAdd = async () => {
    if (!form.message || !form.spot || !user) return
    setSubmitting(true)

    const { data, error } = await supabase
      .from("matches")
      .insert({
        team_a: [user.id],
        team_b: [],
        verified: false,
        score_a: 0,
        score_b: 0,
      })
      .select()
      .single()

    if (!error && data) {
      const newCall: Call = {
        id: data.id,
        author: user.nickname,
        message: form.message,
        spot: form.spot,
        time: form.time,
        level: form.level,
        missing: form.missing,
        total: form.total,
        postedAt: "Przed chwila",
      }
      setCalls((prev) => [newCall, ...prev])
      setShowForm(false)
      setForm({ message: "", spot: "", time: "", level: "Kazdy", missing: 1, total: 4 })
    }
    setSubmitting(false)
  }

  return (
    <section id="ekipa" className="py-20 px-4 bg-secondary/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-amber font-sans text-sm uppercase tracking-widest mb-4">
              <Users className="w-4 h-4" />
              Społeczność
            </div>
            <h2 className="font-display font-black text-5xl md:text-6xl uppercase text-foreground text-balance">
              Szukam{" "}
              <span className="text-amber text-glow-amber">Ekipy</span>
            </h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={!user}
            className="flex items-center gap-2 bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-5 py-3 rounded hover:opacity-90 transition-opacity flex-shrink-0 glow-amber disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {user ? "Dodaj Ogloszenie" : "Zaloguj sie Aby Dodac"}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="border border-amber/40 bg-amber/5 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-bold text-amber uppercase tracking-wider">
                Nowe Ogłoszenie
              </span>
              <button onClick={() => setShowForm(false)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="font-sans text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                  Wiadomosc
                </label>
                <input
                  className="w-full bg-background border border-border rounded px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:border-amber transition-colors"
                  placeholder="np. Brakuje dwoch do skladu na 18:00..."
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>
              <div>
                <label className="font-sans text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                  Spot
                </label>
                <input
                  className="w-full bg-background border border-border rounded px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:border-amber transition-colors"
                  placeholder="np. Pola Mokotowskie"
                  value={form.spot}
                  onChange={(e) => setForm((f) => ({ ...f, spot: e.target.value }))}
                />
              </div>
              <div>
                <label className="font-sans text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                  Godzina
                </label>
                <input
                  className="w-full bg-background border border-border rounded px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:border-amber transition-colors"
                  placeholder="np. 18:00"
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                />
              </div>
              <div>
                <label className="font-sans text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                  Poziom
                </label>
                <select
                  className="w-full bg-background border border-border rounded px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:border-amber transition-colors"
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as Level }))}
                >
                  {(["Kazdy", "Sredni", "Zaawansowany", "Pro"] as Level[]).map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-sans text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                  Szukam (il. graczy)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="w-full bg-background border border-border rounded px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:border-amber transition-colors"
                  value={form.missing}
                  onChange={(e) => setForm((f) => ({ ...f, missing: Number(e.target.value) }))}
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={submitting || !form.message || !form.spot}
              className="mt-4 bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-6 py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? "Wysylanie..." : <>
                <Send className="w-4 h-4" />
                Opublikuj
              </>}
            </button>
          </div>
        )}

        {/* Calls list */}
        <div className="flex flex-col gap-4">
          {calls.map((call) => {
            const lvl = LEVEL_STYLE[call.level]
            const LevelIcon = lvl.icon
            const filledSlots = call.total - call.missing
            return (
              <div
                key={call.id}
                className="border border-border bg-card rounded-lg p-5 hover:border-amber/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Author + time */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                        <span className="font-display font-black text-xs text-amber">
                          {call.author.charAt(0)}
                        </span>
                      </div>
                      <span className="font-display font-bold text-sm text-foreground">
                        {call.author}
                      </span>
                      <span className="text-muted-foreground font-sans text-xs">
                        · {call.postedAt}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="font-sans text-sm text-foreground leading-relaxed mb-3">
                      {call.message}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
                        <MapPin className="w-3.5 h-3.5 text-amber" />
                        {call.spot}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
                        <Clock className="w-3.5 h-3.5 text-amber" />
                        {call.time}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-xs font-sans font-semibold px-2 py-0.5 rounded ${lvl.bg} ${lvl.text}`}
                      >
                        <LevelIcon className="w-3 h-3" />
                        Poziom: {call.level}
                      </span>
                    </div>
                  </div>

                  {/* Slots indicator */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="flex gap-1">
                      {Array.from({ length: call.total }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 rounded-sm ${
                            i < filledSlots ? "bg-amber" : "bg-muted border border-border"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-sans text-xs text-muted-foreground">
                      {call.missing} miejsc
                    </span>
                  </div>
                </div>

                {/* Join button */}
                <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                  <button className="font-display font-bold text-sm uppercase tracking-widest text-amber border border-amber/40 px-5 py-2 rounded hover:bg-amber/10 transition-colors">
                    Dołącz do Ekipy
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
