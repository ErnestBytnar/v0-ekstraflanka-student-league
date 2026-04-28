"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Check, X, ArrowLeft, Plus, Minus, Save, 
  Shield, Users, Calendar, MapPin, Trophy, 
  BarChart3, GraduationCap, Clock, Database
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export const dynamic = "force-dynamic"

type Tab = "moderation" | "players" | "tournaments" | "analytics"

interface PlayerPoints {
  id: string
  nickname: string
  faculty: string
  university: string
  points: number
  is_admin: boolean
}

interface PendingEvent {
  id: string
  title: string
  location: string
  event_date: string
  description: string
  created_by: string
  is_approved: boolean
  created_at: string
  creator?: { nickname: string }
}

interface PendingSpot {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  created_by: string
  is_approved: boolean
  created_at: string
  creator?: { nickname: string }
}

interface Tournament {
  id: string
  name: string
  bracket_data: any
  status: string
  created_at: string
}

interface Analytics {
  totalUsers: number
  totalEvents: number
  totalSpots: number
  totalTournaments: number
  topUniversities: { university: string; count: number }[]
  recentActivity: { type: string; description: string; date: string }[]
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className || ''}`} />
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("moderation")
  const [players, setPlayers] = useState<PlayerPoints[]>([])
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([])
  const [pendingSpots, setPendingSpots] = useState<PendingSpot[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [pointsChanges, setPointsChanges] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  // Tournament form state
  const [showTournamentForm, setShowTournamentForm] = useState(false)
  const [tournamentForm, setTournamentForm] = useState({ name: '', teams: '' })
  const [creatingTournament, setCreatingTournament] = useState(false)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      if (!supabaseRef.current) {
        supabaseRef.current = createClient()
      }
      const supabase = supabaseRef.current

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      if (!profile?.is_admin) {
        router.push("/")
        return
      }

      setIsAdmin(true)

      // Load all data in parallel
      const [playersRes, eventsRes, spotsRes, tournamentsRes] = await Promise.all([
        supabase.from("profiles").select("id, nickname, faculty, university, points, is_admin").order("points", { ascending: false }),
        supabase.from("events").select("*").eq("is_approved", false).order("created_at", { ascending: false }),
        supabase.from("spots").select("*").eq("is_approved", false).order("created_at", { ascending: false }),
        supabase.from("tournaments").select("*").order("created_at", { ascending: false }),
      ])

      if (playersRes.data) setPlayers(playersRes.data)
      if (eventsRes.data) setPendingEvents(eventsRes.data)
      if (spotsRes.data) setPendingSpots(spotsRes.data)
      if (tournamentsRes.data) setTournaments(tournamentsRes.data)

      // Calculate analytics
      const totalUsers = playersRes.data?.length || 0
      const { count: totalEvents } = await supabase.from("events").select("*", { count: "exact", head: true })
      const { count: totalSpots } = await supabase.from("spots").select("*", { count: "exact", head: true })
      const totalTournaments = tournamentsRes.data?.length || 0

      // Top universities
      const universityCount: Record<string, number> = {}
      playersRes.data?.forEach((p) => {
        if (p.university) {
          universityCount[p.university] = (universityCount[p.university] || 0) + 1
        }
      })
      const topUniversities = Object.entries(universityCount)
        .map(([university, count]) => ({ university, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setAnalytics({
        totalUsers,
        totalEvents: totalEvents || 0,
        totalSpots: totalSpots || 0,
        totalTournaments,
        topUniversities,
        recentActivity: [],
      })

      setLoading(false)
    }

    checkAdminAndLoadData()
  }, [router])

  const updatePoints = (playerId: string, delta: number) => {
    setPointsChanges((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] || 0) + delta,
    }))
  }

  const savePointsChanges = async () => {
    setSaving(true)
    try {
      const supabase = supabaseRef.current || createClient()

      for (const [playerId, delta] of Object.entries(pointsChanges)) {
        const player = players.find((p) => p.id === playerId)
        if (!player) continue

        const newPoints = Math.max(0, player.points + delta)
        await supabase.from("profiles").update({ points: newPoints }).eq("id", playerId)
      }

      // Reload players
      const { data: updated } = await supabase
        .from("profiles")
        .select("id, nickname, faculty, university, points, is_admin")
        .order("points", { ascending: false })

      if (updated) setPlayers(updated)
      setPointsChanges({})
      toast.success("Punkty zaktualizowane!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Blad przy zapisywaniu")
    } finally {
      setSaving(false)
    }
  }

  const approveEvent = async (eventId: string) => {
    try {
      const supabase = supabaseRef.current || createClient()
      await supabase.from("events").update({ is_approved: true }).eq("id", eventId)
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId))
      toast.success("Event zatwierdzony!")
    } catch (error) {
      toast.error("Blad przy zatwierdzaniu")
    }
  }

  const rejectEvent = async (eventId: string) => {
    try {
      const supabase = supabaseRef.current || createClient()
      await supabase.from("events").delete().eq("id", eventId)
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId))
      toast.success("Event odrzucony")
    } catch (error) {
      toast.error("Blad przy odrzucaniu")
    }
  }

  const approveSpot = async (spotId: string) => {
    try {
      const supabase = supabaseRef.current || createClient()
      await supabase.from("spots").update({ is_approved: true }).eq("id", spotId)
      setPendingSpots((prev) => prev.filter((s) => s.id !== spotId))
      toast.success("Spot zatwierdzony!")
    } catch (error) {
      toast.error("Blad przy zatwierdzaniu")
    }
  }

  const rejectSpot = async (spotId: string) => {
    try {
      const supabase = supabaseRef.current || createClient()
      await supabase.from("spots").delete().eq("id", spotId)
      setPendingSpots((prev) => prev.filter((s) => s.id !== spotId))
      toast.success("Spot odrzucony")
    } catch (error) {
      toast.error("Blad przy odrzucaniu")
    }
  }

  const createTournament = async () => {
    if (!tournamentForm.name) return
    setCreatingTournament(true)
    
    try {
      const supabase = supabaseRef.current || createClient()
      const teams = tournamentForm.teams.split(',').map(t => t.trim()).filter(Boolean)
      
      const bracketData = {
        teams,
        rounds: [],
        currentRound: 0,
      }

      const { data, error } = await supabase
        .from("tournaments")
        .insert({
          name: tournamentForm.name,
          bracket_data: bracketData,
          status: "active",
        })
        .select()
        .single()

      if (error) throw error

      setTournaments((prev) => [data, ...prev])
      setTournamentForm({ name: '', teams: '' })
      setShowTournamentForm(false)
      toast.success("Turniej utworzony!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Blad przy tworzeniu turnieju")
    } finally {
      setCreatingTournament(false)
    }
  }

  const handleLogout = async () => {
    const supabase = supabaseRef.current || createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleSeedData = async () => {
    setSeeding(true)
    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      toast.success(`Dane testowe dodane! Eventow: ${data.results.events}, Spotow: ${data.results.spots}, Turniejow: ${data.results.tournaments}`)
      
      // Reload data
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Blad przy seedowaniu')
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-sans text-muted-foreground">Ladowanie...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  const hasChanges = Object.keys(pointsChanges).length > 0
  const totalPending = pendingEvents.length + pendingSpots.length

  const tabs: { id: Tab; label: string; icon: typeof Shield; badge?: number }[] = [
    { id: "moderation", label: "Moderacja", icon: Shield, badge: totalPending > 0 ? totalPending : undefined },
    { id: "players", label: "Gracze", icon: Users },
    { id: "tournaments", label: "Turnieje", icon: Trophy },
    { id: "analytics", label: "Statystyki", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-sans text-sm uppercase tracking-widest">Wrol</span>
          </Link>
          <h1 className="font-display font-black text-xl uppercase tracking-widest text-foreground">
            Admin Panel
          </h1>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-display font-bold text-sm uppercase tracking-widest transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "text-amber border-amber"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Moderation Tab */}
        {activeTab === "moderation" && (
          <div className="space-y-8">
            {/* Pending Events */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-display font-black text-xl uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber" />
                Oczekujace Eventy ({pendingEvents.length})
              </h2>
              
              {pendingEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Brak oczekujacych eventow</p>
              ) : (
                <div className="space-y-4">
                  {pendingEvents.map((event) => (
                    <div key={event.id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-foreground">{event.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.event_date).toLocaleDateString('pl-PL')}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveEvent(event.id)}
                          className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectEvent(event.id)}
                          className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Spots */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-display font-black text-xl uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber" />
                Oczekujace Spoty ({pendingSpots.length})
              </h2>
              
              {pendingSpots.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Brak oczekujacych spotow</p>
              ) : (
                <div className="space-y-4">
                  {pendingSpots.map((spot) => (
                    <div key={spot.id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-foreground">{spot.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{spot.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Koordynaty: {spot.lat?.toFixed(4)}, {spot.lng?.toFixed(4)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveSpot(spot.id)}
                          className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectSpot(spot.id)}
                          className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === "players" && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display font-black text-xl uppercase tracking-widest text-foreground mb-6">
              Zarzadzanie Punktami
            </h2>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">Gracz</th>
                    <th className="text-left py-3 px-3 font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">Uczelnia</th>
                    <th className="text-center py-3 px-3 font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">Punkty</th>
                    <th className="text-center py-3 px-3 font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">Zmiana</th>
                    <th className="text-center py-3 px-3 font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">Nowe</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-4 px-3">
                        <div>
                          <p className="font-display font-bold text-foreground">{player.nickname}</p>
                          {player.is_admin && <p className="font-sans text-xs text-amber">Admin</p>}
                        </div>
                      </td>
                      <td className="py-4 px-3 font-sans text-muted-foreground text-xs">
                        {player.university || '-'}
                      </td>
                      <td className="py-4 px-3 text-center font-display font-bold text-amber">{player.points}</td>
                      <td className="py-4 px-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => updatePoints(player.id, -1)}
                            className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-display font-bold text-foreground">
                            {pointsChanges[player.id] || 0}
                          </span>
                          <button
                            onClick={() => updatePoints(player.id, 1)}
                            className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center font-display font-bold text-foreground">
                        {Math.max(0, player.points + (pointsChanges[player.id] || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasChanges ? (
              <div className="flex gap-3">
                <button
                  onClick={savePointsChanges}
                  disabled={saving}
                  className="flex items-center gap-2 bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {saving ? "Zapisywanie..." : "Zapisz Zmiany"}
                </button>
                <button
                  onClick={() => setPointsChanges({})}
                  className="bg-secondary border border-border text-muted-foreground font-display font-bold text-sm uppercase tracking-widest px-6 py-3 rounded hover:border-amber transition-colors"
                >
                  Anuluj
                </button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground font-sans text-sm">Brak zmian do zapisania</p>
            )}
          </div>
        )}

        {/* Tournaments Tab */}
        {activeTab === "tournaments" && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-black text-xl uppercase tracking-widest text-foreground">
                  Turnieje
                </h2>
                <button
                  onClick={() => setShowTournamentForm(!showTournamentForm)}
                  className="flex items-center gap-2 bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-4 py-2 rounded hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Nowy Turniej
                </button>
              </div>

              {showTournamentForm && (
                <div className="border border-amber/40 bg-amber/5 rounded-lg p-4 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        Nazwa turnieju
                      </label>
                      <input
                        type="text"
                        value={tournamentForm.name}
                        onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
                        placeholder="np. Puchar Rzeszowa 2026"
                        className="w-full bg-background border border-border rounded px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:border-amber transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        Zespoly (oddzielone przecinkiem)
                      </label>
                      <input
                        type="text"
                        value={tournamentForm.teams}
                        onChange={(e) => setTournamentForm({ ...tournamentForm, teams: e.target.value })}
                        placeholder="np. Druzyna A, Druzyna B, Druzyna C, Druzyna D"
                        className="w-full bg-background border border-border rounded px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:border-amber transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={createTournament}
                        disabled={creatingTournament || !tournamentForm.name}
                        className="bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-4 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {creatingTournament ? "Tworzenie..." : "Utworz"}
                      </button>
                      <button
                        onClick={() => setShowTournamentForm(false)}
                        className="bg-secondary border border-border text-muted-foreground font-display font-bold text-sm uppercase tracking-widest px-4 py-2 rounded hover:border-amber transition-colors"
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tournaments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Brak turniejow</p>
              ) : (
                <div className="space-y-4">
                  {tournaments.map((tournament) => (
                    <div key={tournament.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-display font-bold text-foreground">{tournament.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Status: <span className={tournament.status === 'active' ? 'text-neon' : 'text-muted-foreground'}>{tournament.status}</span>
                            {' | '}
                            Utworzono: {new Date(tournament.created_at).toLocaleDateString('pl-PL')}
                          </p>
                          {tournament.bracket_data?.teams && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Zespolow: {tournament.bracket_data.teams.length}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            tournament.status === 'active' 
                              ? 'bg-neon/20 text-neon' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {tournament.status === 'active' ? 'Aktywny' : 'Zakonczony'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && analytics && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-amber/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber" />
                  </div>
                  <div>
                    <p className="font-display font-black text-2xl text-foreground">{analytics.totalUsers}</p>
                    <p className="font-sans text-xs text-muted-foreground">Graczy</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-neon/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-neon" />
                  </div>
                  <div>
                    <p className="font-display font-black text-2xl text-foreground">{analytics.totalEvents}</p>
                    <p className="font-sans text-xs text-muted-foreground">Eventow</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-amber/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber" />
                  </div>
                  <div>
                    <p className="font-display font-black text-2xl text-foreground">{analytics.totalSpots}</p>
                    <p className="font-sans text-xs text-muted-foreground">Spotow</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-neon/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-neon" />
                  </div>
                  <div>
                    <p className="font-display font-black text-2xl text-foreground">{analytics.totalTournaments}</p>
                    <p className="font-sans text-xs text-muted-foreground">Turniejow</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Universities */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-display font-black text-xl uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber" />
                Najpopularniejsze Uczelnie
              </h2>
              
              {analytics.topUniversities.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Brak danych</p>
              ) : (
                <div className="space-y-3">
                  {analytics.topUniversities.map((uni, i) => (
                    <div key={uni.university} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`font-display font-black text-lg ${i === 0 ? 'text-amber' : 'text-muted-foreground'}`}>
                          #{i + 1}
                        </span>
                        <span className="font-sans text-foreground">{uni.university}</span>
                      </div>
                      <span className="font-display font-bold text-amber">{uni.count} graczy</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Developer Tools */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-display font-black text-xl uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                <Database className="w-5 h-5 text-amber" />
                Narzedzia Developerskie
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Wygeneruj dane testowe do bazy danych (eventy, spoty, turnieje, zgloszenia meczy).
              </p>
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="flex items-center gap-2 bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                {seeding ? 'Generowanie...' : 'Generuj Dane Testowe'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
