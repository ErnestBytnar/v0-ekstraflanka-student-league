"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trophy, Users, Calendar } from "lucide-react"

interface Tournament {
  id: string
  name: string
  bracket_data: {
    teams: string[]
    rounds?: {
      matches: {
        team1: string
        team2: string
        score1?: number
        score2?: number
        winner?: string
      }[]
    }[]
  }
  status: string
  created_at: string
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className || ''}`} />
}

export function TournamentBracket() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)

  useEffect(() => {
    const fetchTournaments = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("tournaments")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5)

      if (data) {
        setTournaments(data)
        if (data.length > 0) {
          setSelectedTournament(data[0])
        }
      }
      setLoading(false)
    }

    fetchTournaments()
  }, [])

  const generateBracket = (teams: string[]) => {
    // Generate a simple bracket visualization
    const rounds: { team1: string; team2: string }[][] = []
    let currentTeams = [...teams]
    
    while (currentTeams.length > 1) {
      const round: { team1: string; team2: string }[] = []
      for (let i = 0; i < currentTeams.length; i += 2) {
        round.push({
          team1: currentTeams[i] || "TBD",
          team2: currentTeams[i + 1] || "TBD",
        })
      }
      rounds.push(round)
      // For visualization, we just show the structure
      currentTeams = round.map((_, i) => `Zwyciezca ${i + 1}`)
    }
    
    return rounds
  }

  if (loading) {
    return (
      <section id="turnieje" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-32 mx-auto mb-4" />
            <Skeleton className="h-16 w-64 mx-auto" />
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </section>
    )
  }

  if (tournaments.length === 0) {
    return (
      <section id="turnieje" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-amber font-sans text-sm uppercase tracking-widest mb-4">
              <Trophy className="w-4 h-4" />
              Turnieje
            </div>
            <h2 className="font-display font-black text-5xl md:text-6xl uppercase text-foreground text-balance">
              Drabinka <span className="text-amber text-glow-amber">Turniejowa</span>
            </h2>
          </div>
          <div className="text-center py-16 border border-border rounded-lg bg-card">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Brak aktywnych turniejow</p>
            <p className="text-xs text-muted-foreground">Sprawdz pozniej lub skontaktuj sie z adminem</p>
          </div>
        </div>
      </section>
    )
  }

  const bracket = selectedTournament?.bracket_data?.teams 
    ? generateBracket(selectedTournament.bracket_data.teams)
    : []

  return (
    <section id="turnieje" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-amber font-sans text-sm uppercase tracking-widest mb-4">
            <Trophy className="w-4 h-4" />
            Turnieje
          </div>
          <h2 className="font-display font-black text-5xl md:text-6xl uppercase text-foreground text-balance">
            Drabinka <span className="text-amber text-glow-amber">Turniejowa</span>
          </h2>
        </div>

        {/* Tournament selector */}
        {tournaments.length > 1 && (
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {tournaments.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTournament(t)}
                className={`px-4 py-2 rounded font-display font-bold text-sm uppercase tracking-widest transition-colors ${
                  selectedTournament?.id === t.id
                    ? "bg-amber text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {/* Tournament Info */}
        {selectedTournament && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display font-black text-2xl text-foreground uppercase tracking-wider">
                  {selectedTournament.name}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-amber" />
                    {selectedTournament.bracket_data?.teams?.length || 0} zespolow
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-amber" />
                    {new Date(selectedTournament.created_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded font-display font-bold text-sm uppercase tracking-widest ${
                selectedTournament.status === 'active'
                  ? 'bg-neon/20 text-neon'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {selectedTournament.status === 'active' ? 'W trakcie' : 'Zakonczony'}
              </span>
            </div>

            {/* Bracket Visualization */}
            {bracket.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex gap-8 min-w-max py-4">
                  {bracket.map((round, roundIndex) => (
                    <div key={roundIndex} className="flex flex-col justify-center gap-4">
                      <div className="text-center mb-2">
                        <span className="font-display font-bold text-xs text-muted-foreground uppercase tracking-widest">
                          {roundIndex === bracket.length - 1 ? 'Final' : `Runda ${roundIndex + 1}`}
                        </span>
                      </div>
                      {round.map((match, matchIndex) => (
                        <div
                          key={matchIndex}
                          className="border border-border rounded-lg bg-secondary/50 overflow-hidden"
                          style={{ marginTop: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 20}px` : 0 }}
                        >
                          <div className="border-b border-border px-4 py-3 flex items-center justify-between gap-4 min-w-[180px]">
                            <span className="font-sans text-sm text-foreground truncate">
                              {match.team1}
                            </span>
                            <span className="font-display font-bold text-amber">-</span>
                          </div>
                          <div className="px-4 py-3 flex items-center justify-between gap-4">
                            <span className="font-sans text-sm text-foreground truncate">
                              {match.team2}
                            </span>
                            <span className="font-display font-bold text-amber">-</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  
                  {/* Winner placeholder */}
                  <div className="flex flex-col justify-center">
                    <div className="text-center mb-2">
                      <span className="font-display font-bold text-xs text-amber uppercase tracking-widest">
                        Zwyciezca
                      </span>
                    </div>
                    <div className="border-2 border-amber/40 rounded-lg bg-amber/5 px-6 py-6 text-center min-w-[140px]">
                      <Trophy className="w-8 h-8 text-amber mx-auto mb-2" />
                      <span className="font-display font-bold text-foreground">TBD</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Drabinka nie zostala jeszcze wygenerowana</p>
              </div>
            )}

            {/* Teams List */}
            {selectedTournament.bracket_data?.teams && selectedTournament.bracket_data.teams.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-widest mb-4">
                  Uczestnicy
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTournament.bracket_data.teams.map((team, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-secondary border border-border rounded font-sans text-sm text-foreground"
                    >
                      {team}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
