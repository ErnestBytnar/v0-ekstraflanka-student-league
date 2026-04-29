"use client"

import { useEffect, useState } from "react"
import { Users, Clock, MapPin, Flame, Shield, Star, Plus, X, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type Level = "Kazdy" | "Sredni" | "Zaawansowany" | "Pro"

interface MatchRequest {
  id: string
  user_id: string
  location: string
  description: string
  players_needed: number
  created_at: string
  profile?: {
    nickname: string
  }
}

const LEVEL_STYLE: Record<Level, { bg: string; text: string; icon: typeof Flame }> = {
  Kazdy: { bg: "bg-neon/10", text: "text-neon", icon: Star },
  Sredni: { bg: "bg-amber/10", text: "text-amber", icon: Shield },
  Zaawansowany: { bg: "bg-orange-400/10", text: "text-orange-400", icon: Flame },
  Pro: { bg: "bg-red-400/10", text: "text-red-400", icon: Flame },
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className || ''}`} />
}

export function MatchFinder() {
  const [requests, setRequests] = useState<MatchRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ 
    description: "", 
    location: "", 
    players_needed: 4,
    level: "Kazdy" as Level 
  })
  const [user, setUser] = useState<{ id: string; nickname: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = async () => {
    const supabase = createClient()
    
    // Fetch match requests with profile info
    const { data: matchRequests } = await supabase
      .from("match_requests")
      .select(`
        *,
        profile:profiles!match_requests_user_id_fkey(nickname)
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    if (matchRequests) {
      setRequests(matchRequests as MatchRequest[])
    }
  }

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      
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

      await fetchRequests()
      setLoading(false)
    }
    init()
  }, [])

  const handleAdd = async () => {
    if (!form.description || !form.location || !user) return
    setSubmitting(true)
    
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("match_requests")
        .insert({
          user_id: user.id,
          location: form.location,
          description: form.description,
          players_needed: form.players_needed,
        })
        .select()
        .single()

      if (error) throw error

      // Refresh the list
      await fetchRequests()
      
      setShowForm(false)
      setForm({ description: "", location: "", players_needed: 4, level: "Kazdy" })
      toast.success("Siema! Ogloszenie dodane")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Blad przy dodawaniu")
    } finally {
      setSubmitting(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Przed chwila"
    if (diffMins < 60) return `${diffMins} min temu`
    if (diffHours < 24) return `${diffHours}h temu`
    return `${diffDays} dni temu`
  }

  const getLevelFromPlayers = (players: number): Level => {
    if (players <= 2) return "Kazdy"
    if (players <= 4) return "Sredni"
    if (players <= 6) return "Zaawansowany"
    return "Pro"
  }

  return (
    <section id="ekipa" className="py-20 px-4 bg-secondary/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-amber font-sans text-sm uppercase tracking-widest mb-4">
              <Users className="w-4 h-4" />
              Spolecznosc
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
                Nowe Ogloszenie
              </span>
              <button onClick={() => setShowForm(false)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="font-sans text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                  Opis (czego szukasz?)
                </label>
                <input
                  className="w-full bg-background border border-border rounded px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:border-amber transition-colors"
                  placeholder="np. Szukam dwoch do skladu na 18:00, gramy na czas..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="font-sans text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                  Lokalizacja
                </label>
                <input
                  className="w-full bg-background border border-border rounded px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:border-amber transition-colors"
                  placeholder="np. Park Millenium, Rzeszow"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="font-sans text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                  Ilu graczy szukasz?
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="w-full bg-background border border-border rounded px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:border-amber transition-colors"
                  value={form.players_needed}
                  onChange={(e) => setForm((f) => ({ ...f, players_needed: Number(e.target.value) }))}
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={submitting || !form.description || !form.location}
              className="mt-4 bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-6 py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? "Wysylanie..." : <>
                <Send className="w-4 h-4" />
                Opublikuj
              </>}
            </button>
          </div>
        )}

        {/* Requests list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-lg bg-card">
            <p className="text-muted-foreground mb-4">Brak ogloszen. Badz pierwszy!</p>
            {user && (
              <button
                onClick={() => setShowForm(true)}
                className="text-amber hover:underline font-semibold"
              >
                Dodaj ogloszenie
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {requests.map((request) => {
              const level = getLevelFromPlayers(request.players_needed)
              const lvl = LEVEL_STYLE[level]
              const LevelIcon = lvl.icon
              const authorName = request.profile?.nickname || "Anonim"
              
              return (
                <div
                  key={request.id}
                  className="border border-border bg-card rounded-lg p-5 hover:border-amber/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Author + time */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                          <span className="font-display font-black text-xs text-amber">
                            {authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-display font-bold text-sm text-foreground">
                          {authorName}
                        </span>
                        <span className="text-muted-foreground font-sans text-xs">
                          · {getTimeAgo(request.created_at)}
                        </span>
                      </div>

                      {/* Message */}
                      <p className="font-sans text-sm text-foreground leading-relaxed mb-3">
                        {request.description}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
                          <MapPin className="w-3.5 h-3.5 text-amber" />
                          {request.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
                          <Users className="w-3.5 h-3.5 text-amber" />
                          Szuka {request.players_needed} graczy
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs font-sans font-semibold px-2 py-0.5 rounded ${lvl.bg} ${lvl.text}`}
                        >
                          <LevelIcon className="w-3 h-3" />
                          {level}
                        </span>
                      </div>
                    </div>

                    {/* Slots indicator */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(request.players_needed, 6) }).map((_, i) => (
                          <div
                            key={i}
                            className="w-2.5 h-2.5 rounded-sm bg-muted border border-border"
                          />
                        ))}
                      </div>
                      <span className="font-sans text-xs text-muted-foreground">
                        {request.players_needed} miejsc
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                    <button 
                      disabled={!user}
                      className="font-display font-bold text-sm uppercase tracking-widest text-amber border border-amber/40 px-5 py-2 rounded hover:bg-amber/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {user ? "Napisz wiadomosc" : "Zaloguj sie"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
