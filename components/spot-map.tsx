"use client"

import { useEffect, useState } from "react"
import { MapPin, Users, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Spot {
  id: string
  name: string
  lat: number
  lng: number
  is_active: boolean
  description: string
}

const RZESZOW_CENTER = { lat: 50.0210, lng: 21.9840 }

export function SpotMap() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Spot | null>(null)
  const [user, setUser] = useState<{ id: string; nickname: string } | null>(null)
  const [checkedIn, setCheckedIn] = useState<string[]>([])
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

      // Fetch spots from database
      const { data: spotsData } = await supabase
        .from("spots")
        .select("*")
        .eq("is_active", true)

      if (spotsData) {
        setSpots(spotsData)
        if (spotsData.length > 0) {
          setSelected(spotsData[0])
        }
      }

      setLoading(false)
    }
    init()
  }, [])

  const handleCheckIn = async (spotId: string) => {
    if (!user) return

    // In a real app, you'd store this in a checkins table with a 2-hour expiry
    setCheckedIn((prev) =>
      prev.includes(spotId) ? prev.filter((s) => s !== spotId) : [...prev, spotId]
    )
  }

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
            Gdzie Grają{" "}
            <span className="text-amber text-glow-amber">Studenci?</span>
          </h2>
        </div>

        {/* Main layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Map Info - Rzeszow Center */}
          <div className="md:col-span-2 border border-border rounded-lg overflow-hidden bg-secondary p-8 flex flex-col items-center justify-center h-96 relative">
            <MapPin className="w-12 h-12 text-amber/30 mb-4" />
            <h3 className="font-display font-bold text-2xl text-foreground text-center mb-2">
              Miasteczko Studenckie Rzeszow
            </h3>
            <p className="font-sans text-muted-foreground text-center text-sm">
              Centrum: {RZESZOW_CENTER.lat}°N, {RZESZOW_CENTER.lng}°E
            </p>
            {loading ? (
              <p className="font-sans text-muted-foreground mt-8">Ladowanie spot-ow...</p>
            ) : spots.length === 0 ? (
              <p className="font-sans text-muted-foreground mt-8">Brak aktywnych spot-ow</p>
            ) : (
              <p className="font-sans text-muted-foreground mt-8">
                {spots.length} dostepnych spot-ow
              </p>
            )}
          </div>

          {/* Sidebar - Spots List */}
          <div className="border border-border rounded-lg bg-card p-6 h-96 overflow-y-auto">
            <h3 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber" />
              Dostepne Spoty
            </h3>

            {loading ? (
              <p className="font-sans text-sm text-muted-foreground">Ladowanie...</p>
            ) : spots.length === 0 ? (
              <p className="font-sans text-sm text-muted-foreground">Brak spot-ow</p>
            ) : (
              <div className="space-y-3">
                {spots.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => setSelected(spot)}
                    className={`w-full text-left p-3 rounded border transition-all ${
                      selected?.id === spot.id
                        ? "border-amber bg-amber/10"
                        : "border-border hover:border-amber/50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-display font-bold text-sm text-foreground truncate">
                          {spot.name}
                        </p>
                        <p className="font-sans text-xs text-muted-foreground truncate">
                          {spot.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selected && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-display font-bold text-sm text-foreground mb-3">
                  {selected.name}
                </h4>
                <p className="font-sans text-xs text-muted-foreground mb-4">
                  {selected.description}
                </p>
                <button
                  onClick={() => handleCheckIn(selected.id)}
                  disabled={!user}
                  className={`w-full font-display font-bold text-sm uppercase tracking-widest px-4 py-2 rounded transition-all flex items-center justify-center gap-2 ${
                    checkedIn.includes(selected.id)
                      ? "bg-neon/20 text-neon border border-neon/40"
                      : "bg-amber text-primary-foreground border border-amber hover:opacity-90"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {checkedIn.includes(selected.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Jestes tu (2h)
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      Meldunek
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
