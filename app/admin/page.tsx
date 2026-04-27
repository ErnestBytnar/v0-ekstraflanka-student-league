"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Check, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

interface Match {
  id: string
  team_a: string[]
  team_b: string[]
  score_a: number
  score_b: number
  verified: boolean
  created_at: string
}

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [approving, setApproving] = useState<string | null>(null)
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
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

      // Fetch pending matches
      const { data: pendingMatches } = await supabase
        .from("matches")
        .select("*")
        .eq("verified", false)
        .order("created_at", { ascending: false })

      if (pendingMatches) {
        setMatches(pendingMatches as Match[])
      }
      setLoading(false)
    }

    checkAdmin()
  }, [])

  const handleApprove = async (matchId: string, match: Match) => {
    setApproving(matchId)
    const supabase = supabaseRef.current || createClient()

    // Increment wins for team_a
    if (match.team_a.length > 0) {
      for (const userId of match.team_a) {
        await supabase
          .from("profiles")
          .update({ wins: 1 })
          .eq("id", userId)
          .then(({ data }) => {
            if (data) {
              const currentWins = (data as any)[0]?.wins || 0
              supabase
                .from("profiles")
                .update({ wins: currentWins + 1 })
                .eq("id", userId)
            }
          })
      }
    }

    // Increment losses for team_b
    if (match.team_b.length > 0) {
      for (const userId of match.team_b) {
        await supabase
          .from("profiles")
          .update({ losses: 1 })
          .eq("id", userId)
          .then(({ data }) => {
            if (data) {
              const currentLosses = (data as any)[0]?.losses || 0
              supabase
                .from("profiles")
                .update({ losses: currentLosses + 1 })
                .eq("id", userId)
            }
          })
      }
    }

    // Mark match as verified
    await supabase
      .from("matches")
      .update({ verified: true })
      .eq("id", matchId)

    setMatches((prev) => prev.filter((m) => m.id !== matchId))
    setApproving(null)
  }

  const handleReject = async (matchId: string) => {
    setApproving(matchId)
    const supabase = supabaseRef.current || createClient()
    await supabase
      .from("matches")
      .delete()
      .eq("id", matchId)

    setMatches((prev) => prev.filter((m) => m.id !== matchId))
    setApproving(null)
  }

  if (!isAdmin) {
    return null
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 text-amber hover:text-amber/80 transition-colors mb-8 font-sans text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Wroc do strony
        </Link>

        <div className="mb-12">
          <h1 className="font-display font-black text-5xl md:text-6xl uppercase text-foreground mb-4">
            Panel <span className="text-amber">Admina</span>
          </h1>
          <p className="font-sans text-muted-foreground text-lg">
            Zarzadzaj czekajacymi meczami i zatwierdz wyniki
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Ladowanie meczow...</div>
        ) : matches.length === 0 ? (
          <div className="border border-border rounded-lg p-12 text-center bg-card">
            <p className="font-sans text-muted-foreground mb-4">Brak czekajacych meczow</p>
            <p className="font-sans text-sm text-muted-foreground">
              Wszystkie meczy zostaly zatwierdzone!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="border border-border bg-card rounded-lg p-6 hover:border-amber/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">
                      Druzyna A vs Druzyna B
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground">
                      ID: {match.id.substring(0, 8)}...
                    </p>
                    <p className="font-sans text-xs text-muted-foreground mt-2">
                      {new Date(match.created_at).toLocaleString("pl-PL")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="font-display font-black text-3xl text-foreground">
                      {match.score_a} - {match.score_b}
                    </div>
                    <div className="font-sans text-xs text-muted-foreground mt-1">
                      {match.team_a.length} vs {match.team_b.length} graczy
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    onClick={() => handleApprove(match.id, match)}
                    disabled={approving === match.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-neon/20 text-neon border border-neon/40 font-display font-bold text-sm uppercase tracking-widest px-4 py-3 rounded hover:bg-neon/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" />
                    {approving === match.id ? "Zatwierdzanie..." : "Zatwierdz"}
                  </button>
                  <button
                    onClick={() => handleReject(match.id)}
                    disabled={approving === match.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-400/20 text-red-400 border border-red-400/40 font-display font-bold text-sm uppercase tracking-widest px-4 py-3 rounded hover:bg-red-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    {approving === match.id ? "Usuwanie..." : "Odrzuc"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
