"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Check, X, ArrowLeft, Plus, Minus, Save, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

interface PlayerPoints {
  id: string
  nickname: string
  faculty: string
  points: number
  is_admin: boolean
}

export default function AdminPage() {
  const [players, setPlayers] = useState<PlayerPoints[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [pointsChanges, setPointsChanges] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    const checkAdminAndLoadPlayers = async () => {
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

      // Load all players
      const { data: allPlayers } = await supabase
        .from("profiles")
        .select("id, nickname, faculty, points, is_admin")
        .order("points", { ascending: false })

      if (allPlayers) {
        setPlayers(allPlayers)
      }
      setLoading(false)
    }

    checkAdminAndLoadPlayers()
  }, [router])

  const updatePoints = (playerId: string, delta: number) => {
    setPointsChanges((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] || 0) + delta,
    }))
  }

  const saveChanges = async () => {
    setSaving(true)
    try {
      const supabase = supabaseRef.current || createClient()

      for (const [playerId, delta] of Object.entries(pointsChanges)) {
        const player = players.find((p) => p.id === playerId)
        if (!player) continue

        const newPoints = Math.max(0, player.points + delta)
        await supabase
          .from("profiles")
          .update({ points: newPoints })
          .eq("id", playerId)
      }

      // Reload players
      const { data: updated } = await supabase
        .from("profiles")
        .select("id, nickname, faculty, points, is_admin")
        .order("points", { ascending: false })

      if (updated) {
        setPlayers(updated)
      }

      setPointsChanges({})
      setToast({ message: "Punkty zaktualizowane!", type: "success" })
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Blad przy zapisywaniu",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    const supabase = supabaseRef.current || createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-sans text-muted-foreground">Ladowanie...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const hasChanges = Object.keys(pointsChanges).length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
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

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded font-sans text-sm font-semibold flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Zarzadzanie Punktami */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-display font-black text-xl uppercase tracking-widest text-foreground mb-6">
            Zarzadzanie Punktami
          </h2>

          {/* Players Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">
                    Gracz
                  </th>
                  <th className="text-left py-3 px-3 font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">
                    Wydzial
                  </th>
                  <th className="text-center py-3 px-3 font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">
                    Aktualne Punkty
                  </th>
                  <th className="text-center py-3 px-3 font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">
                    Zmiana
                  </th>
                  <th className="text-center py-3 px-3 font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">
                    Nowe Punkty
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-3">
                      <div>
                        <p className="font-display font-bold text-foreground">{player.nickname}</p>
                        {player.is_admin && (
                          <p className="font-sans text-xs text-amber">Admin</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3 font-sans text-muted-foreground">{player.faculty}</td>
                    <td className="py-4 px-3 text-center font-display font-bold text-amber">
                      {player.points}
                    </td>
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

          {/* Save Button */}
          {hasChanges && (
            <div className="flex gap-3">
              <button
                onClick={saveChanges}
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
          )}

          {!hasChanges && (
            <p className="text-center text-muted-foreground font-sans text-sm">
              Brak zmian do zapisania
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
