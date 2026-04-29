"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Target, Droplets, Trophy, TrendingUp, Flame, Star, Shield, Crown, Award, Activity, GraduationCap } from "lucide-react"

interface Profile {
  id: string
  nickname: string
  faculty: string
  university: string
  points: number
  avatar_url?: string
  is_admin: boolean
}

interface MatchRequest {
  id: string
  location: string
  description: string
  players_needed: number
  created_at: string
}

const RANK_THRESHOLDS = [
  { min: 0, max: 10, name: 'Swiezak', color: 'text-muted-foreground' },
  { min: 11, max: 30, name: 'Amateur', color: 'text-neon' },
  { min: 31, max: 75, name: 'Mistrz', color: 'text-amber' },
  { min: 76, max: Infinity, name: 'Legenda', color: 'text-amber' },
]

const BADGES = [
  { icon: Crown, label: "Krol Flanki", description: "10 wygranych z rzedu", pointsRequired: 50 },
  { icon: Target, label: "Snajper", description: "Celnosc powyzej 90%", pointsRequired: 30 },
  { icon: Flame, label: "W Ogniu", description: "5 wygranych w tydzien", pointsRequired: 20 },
  { icon: Star, label: "Veterano", description: "100 rozegranych meczy", pointsRequired: 75 },
  { icon: Shield, label: "Niezlomny", description: "Brak czerwonej kartki przez sezon", pointsRequired: 40 },
  { icon: Trophy, label: "Legenda", description: "Wygraj turniej miejski", pointsRequired: 100 },
]

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className || ''}`} />
}

export function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [rank, setRank] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Fetch user's match requests
      const { data: requests } = await supabase
        .from("match_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (requests) {
        setMatchRequests(requests)
      }

      // Calculate rank position
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt("points", profileData?.points || 0)

      setRank((count || 0) + 1)
      setLoading(false)
    }

    fetchData()
  }, [])

  const getRankInfo = (points: number) => {
    return RANK_THRESHOLDS.find((r) => points >= r.min && points <= r.max) || RANK_THRESHOLDS[0]
  }

  const getStats = (profile: Profile | null) => {
    if (!profile) return []
    const points = profile.points || 0
    return [
      { label: "Punkty", value: points.toString(), icon: Target, color: "text-amber", bg: "bg-amber/10" },
      { label: "Pozycja w rankingu", value: `#${rank}`, icon: TrendingUp, color: "text-neon", bg: "bg-neon/10" },
      { label: "Zgloszenia meczy", value: matchRequests.length.toString(), icon: Trophy, color: "text-amber", bg: "bg-amber/10" },
      { label: "Aktywne rankingi", value: "1", icon: Activity, color: "text-neon", bg: "bg-neon/10" },
      { label: "Zdobyte odznaki", value: BADGES.filter(b => points >= b.pointsRequired).length.toString(), icon: Award, color: "text-amber", bg: "bg-amber/10" },
      { label: "Seria", value: Math.floor(points / 10).toString(), icon: Flame, color: "text-red-400", bg: "bg-red-400/10" },
    ]
  }

  if (!profile && !loading) {
    return (
      <section id="profil" className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-amber font-sans text-sm uppercase tracking-widest mb-4">
            <Trophy className="w-4 h-4" />
            Profil
          </div>
          <h2 className="font-display font-black text-5xl md:text-6xl uppercase text-foreground text-balance mb-8">
            Mój <span className="text-amber text-glow-amber">Profil</span>
          </h2>
          <p className="text-muted-foreground mb-6">Zaloguj sie, zeby zobaczyc swoj profil i statystyki.</p>
          <a 
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition-opacity"
          >
            Zaloguj sie
          </a>
        </div>
      </section>
    )
  }

  const stats = getStats(profile)
  const rankInfo = profile ? getRankInfo(profile.points) : RANK_THRESHOLDS[0]
  const progressToNext = profile ? Math.min((profile.points % 25) / 25 * 100, 100) : 0

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
          {loading ? (
            <>
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="flex-1 space-y-3 w-full">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </>
          ) : (
            <>
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-amber/10 border-2 border-amber flex items-center justify-center flex-shrink-0 glow-amber">
                <span className="font-display font-black text-3xl text-amber">
                  {profile?.nickname?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <div className="font-display font-black text-2xl text-foreground uppercase tracking-wider">
                    {profile?.nickname || "Gracz"}
                  </div>
                  {profile?.is_admin && (
                    <div className="inline-flex items-center gap-1 bg-amber/20 border border-amber/40 text-amber font-sans text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest">
                      <Crown className="w-3 h-3" />
                      Admin
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 mb-3 flex-wrap">
                  <div className={`inline-flex items-center gap-1.5 bg-amber/10 border border-amber/40 ${rankInfo.color} font-sans text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest`}>
                    <Crown className="w-3 h-3" />
                    {rankInfo.name}
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-neon/10 border border-neon/40 text-neon font-sans text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
                    <TrendingUp className="w-3 h-3" />
                    #{rank} Ranking
                  </div>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                  {profile?.university && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-amber" />
                      {profile.university}
                    </span>
                  )}
                  {profile?.faculty && (
                    <span>{profile.faculty}</span>
                  )}
                </div>
              </div>

              {/* Level bar */}
              <div className="flex-shrink-0 w-full sm:w-40 text-center">
                <div className="font-display font-bold text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  Postep do nastepnej rangi
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-amber rounded-full transition-all" style={{ width: `${progressToNext}%` }} />
                </div>
                <div className="font-sans text-xs text-amber">{profile?.points || 0} pkt</div>
              </div>
            </>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg bg-card p-4">
                <Skeleton className="h-10 w-10 rounded mb-2" />
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : (
            stats.map((stat) => {
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
            })
          )}
        </div>

        {/* Bottom grid: badges + history */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Badges */}
          <div>
            <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-wider mb-4">
              Odznaki
            </h3>
            {loading ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {BADGES.map((badge) => {
                  const Icon = badge.icon
                  const earned = (profile?.points || 0) >= badge.pointsRequired
                  return (
                    <div
                      key={badge.label}
                      className={`border rounded-lg p-3 text-center transition-all ${
                        earned
                          ? "border-amber/40 bg-amber/5"
                          : "border-border bg-card opacity-40 grayscale"
                      }`}
                      title={badge.description}
                    >
                      <div className="flex justify-center mb-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            earned ? "bg-amber/20" : "bg-muted"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${earned ? "text-amber" : "text-muted-foreground"}`} />
                        </div>
                      </div>
                      <div className="font-display font-bold text-xs text-foreground uppercase leading-tight">
                        {badge.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Match history */}
          <div>
            <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-wider mb-4">
              Ostatnie Zgloszenia
            </h3>
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : matchRequests.length === 0 ? (
              <div className="border border-border rounded-lg bg-card p-6 text-center">
                <p className="text-muted-foreground text-sm">Brak zgloszen meczy. Stworz pierwsze!</p>
                <a 
                  href="#ekipa"
                  className="inline-block mt-3 text-amber hover:underline text-sm font-semibold"
                >
                  Szukaj ekipy
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {matchRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-border rounded-lg bg-card p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-sans text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString('pl-PL')}
                      </div>
                      <div className="font-display font-bold text-sm text-foreground">
                        {request.location}
                      </div>
                      <div className="font-sans text-xs text-muted-foreground line-clamp-1">
                        {request.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-black text-sm text-neon">
                        {request.players_needed} graczy
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
