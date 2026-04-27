'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Edit2, LogOut, Award, Target } from 'lucide-react'
import Link from 'next/link'

interface Profile {
  id: string
  nickname: string
  faculty: string
  points: number
  avatar_url?: string
}

const RANK_THRESHOLDS = [
  { min: 0, max: 10, name: 'Swiezak', icon: 'bottle' },
  { min: 11, max: 30, name: 'Amateur', icon: 'bottle-half' },
  { min: 31, max: 75, name: 'Mistrz', icon: 'bottle-full' },
  { min: 76, max: Infinity, name: 'Legenda', icon: 'trophy' },
]

export default function ProfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [editFaculty, setEditFaculty] = useState('')
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const faculties = [
    'Informatyka',
    'Elektrotechnika',
    'Budownictwo',
    'Zarzadzanie',
    'Ekonomia',
    'Prawo',
    'Medycyna',
    'Inne',
  ]

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        router.push('/auth/login')
        return
      }

      setProfile(data)
      setEditNickname(data.nickname || '')
      setEditFaculty(data.faculty || '')
      setLoading(false)
    }

    fetchProfile()
  }, [router])

  const getRankInfo = (points: number) => {
    return RANK_THRESHOLDS.find((r) => points >= r.min && points <= r.max) || RANK_THRESHOLDS[0]
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setEditLoading(true)
    setEditError('')

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          nickname: editNickname,
          faculty: editFaculty,
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({
        ...profile,
        nickname: editNickname,
        faculty: editFaculty,
      })
      setIsEditing(false)
    } catch (error: unknown) {
      setEditError(error instanceof Error ? error.message : 'Blad aktualizacji')
    } finally {
      setEditLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-sans text-muted-foreground">Ladowanie profilu...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-sans text-red-400">Blad ladowania profilu</p>
          <Link href="/auth/login" className="text-amber hover:underline text-sm mt-2">
            Wrol do logowania
          </Link>
        </div>
      </div>
    )
  }

  const rankInfo = getRankInfo(profile.points)
  const rankProgress = Math.min(profile.points % 25, 25)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-sans text-sm uppercase tracking-widest">Wrol</span>
          </Link>
          <h1 className="font-display font-black text-xl uppercase tracking-widest text-foreground">
            Moj Profil
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          {!isEditing ? (
            <>
              {/* Display Mode */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Nickname
                  </p>
                  <h2 className="font-display font-black text-2xl uppercase tracking-widest text-foreground mb-4">
                    {profile.nickname}
                  </h2>
                  <p className="font-sans text-sm text-muted-foreground mb-1">
                    <span className="text-foreground font-semibold">Wydzial:</span> {profile.faculty}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded hover:border-amber transition-colors text-muted-foreground hover:text-amber"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="font-sans text-xs uppercase tracking-widest hidden sm:inline">
                    Edytuj profil
                  </span>
                </button>
              </div>

              {/* Rank & Points */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-xs text-muted-foreground uppercase tracking-widest">
                      Ranga
                    </span>
                    <span className="font-display font-bold text-amber">{rankInfo.name}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber transition-all"
                      style={{ width: `${(rankProgress / 25) * 100}%` }}
                    />
                  </div>
                  <p className="font-sans text-xs text-muted-foreground mt-1">
                    {profile.points} / 100 punktow
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary p-4 rounded">
                    <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest mb-1">
                      Calkowite Punkty
                    </p>
                    <p className="font-display font-black text-2xl text-amber">{profile.points}</p>
                  </div>
                  <div className="bg-secondary p-4 rounded">
                    <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest mb-1">
                      Ranga
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {rankInfo.icon === 'trophy' && <Award className="w-5 h-5 text-amber" />}
                      {rankInfo.icon !== 'trophy' && <Target className="w-5 h-5 text-amber" />}
                      <span className="font-display font-bold text-foreground">{rankInfo.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Nickname
                  </label>
                  <input
                    type="text"
                    required
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Wydzial
                  </label>
                  <select
                    required
                    value={editFaculty}
                    onChange={(e) => setEditFaculty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors appearance-none"
                  >
                    {faculties.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {editError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded font-sans">
                    {editError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-4 py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {editLoading ? 'Zapisywanie...' : 'Zapisz'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-secondary border border-border text-muted-foreground font-display font-bold text-sm uppercase tracking-widest px-4 py-2.5 rounded hover:border-amber transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
