'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, MapPin, Users, Plus, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  location: string
  event_date: string
  description: string
  created_by: string
  is_approved: boolean
  attendee_count: number
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className || ''}`} />
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; nickname: string; is_admin: boolean } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', location: '', event_date: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [joined, setJoined] = useState<Set<string>>(new Set())

  const fetchEvents = async (isAdmin: boolean) => {
    const supabase = createClient()
    
    // Fetch events - show all if admin, only approved otherwise
    let query = supabase
      .from('events')
      .select('*, event_attendees(user_id)')
      .order('event_date', { ascending: true })

    if (!isAdmin) {
      query = query.eq('is_approved', true)
    }

    const { data: eventsData } = await query

    if (eventsData) {
      const formattedEvents = eventsData.map((e) => ({
        ...e,
        attendee_count: (e as any).event_attendees?.length || 0,
      }))
      setEvents(formattedEvents)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      let isAdmin = false
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, nickname, is_admin')
          .eq('id', authUser.id)
          .single()
        if (profile) {
          setUser(profile)
          isAdmin = profile.is_admin
        }
      }

      await fetchEvents(isAdmin)

      // Check which events user joined
      if (authUser) {
        const { data: attendances } = await supabase
          .from('event_attendees')
          .select('event_id')
          .eq('user_id', authUser.id)

        if (attendances) {
          setJoined(new Set(attendances.map((a) => a.event_id)))
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Musisz byc zalogowany')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data, error: createError } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          location: formData.location,
          event_date: new Date(formData.event_date).toISOString(),
          description: formData.description,
          created_by: user.id,
          is_approved: user.is_admin, // Auto-approve if admin
        })
        .select()
        .single()

      if (createError) throw createError

      await fetchEvents(user.is_admin)
      setFormData({ title: '', location: '', event_date: '', description: '' })
      setShowForm(false)
      
      if (user.is_admin) {
        toast.success('Event utworzony i zatwierdzony!')
      } else {
        toast.success('Event wyslany do moderacji!')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Blad tworzenia eventu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoinEvent = async (eventId: string) => {
    if (!user) return

    try {
      const supabase = createClient()
      
      if (joined.has(eventId)) {
        // Leave event
        await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id)

        setJoined((prev) => {
          const newSet = new Set(prev)
          newSet.delete(eventId)
          return newSet
        })
        toast.success('Wypisales sie z eventu')
      } else {
        // Join event
        await supabase
          .from('event_attendees')
          .insert({ event_id: eventId, user_id: user.id })

        setJoined((prev) => new Set([...prev, eventId]))
        toast.success('Dołaczyles do eventu!')
      }

      // Refresh events
      await fetchEvents(user.is_admin)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Blad przy dołaczeniu')
    }
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pl-PL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  return (
    <section id="events" className="py-20 px-4 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-amber font-sans text-sm uppercase tracking-widest mb-4">
            <Calendar className="w-4 h-4" />
            Eventy
          </div>
          <h2 className="font-display font-black text-5xl md:text-6xl uppercase text-foreground text-balance mb-4">
            Organizowane <span className="text-amber">Imprezy</span>
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={!user}
            className="inline-flex items-center gap-2 bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-5 py-3 rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {user ? 'Dodaj Event' : 'Zaloguj sie aby dodac'}
          </button>
        </div>

        {/* Create Event Form */}
        {showForm && user && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Nazwa Eventu
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="np. Turniej flanek - Runda 1"
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Miejsce
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="np. Park Centralny"
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Data i godzina
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Opis
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Opisz event i zasady udzialu..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors resize-none"
                />
              </div>

              {!user.is_admin && (
                <p className="text-xs text-muted-foreground">
                  Event zostanie wyslany do moderacji przed publikacja.
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-4 py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? 'Tworzenie...' : 'Utworz Event'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-secondary border border-border text-muted-foreground font-display font-bold text-sm uppercase tracking-widest px-4 py-2.5 rounded hover:border-amber transition-colors"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-border rounded-lg bg-card">
            Brak eventow. Badz pierwszy i stworz jeden!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className={`bg-card border rounded-lg p-6 hover:border-amber/40 transition-colors ${
                  !event.is_approved ? 'border-orange-400/40' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-display font-bold text-lg text-foreground flex-1">{event.title}</h3>
                  <div className="flex gap-2">
                    {!event.is_approved && (
                      <span className="text-orange-400 font-sans text-xs font-semibold bg-orange-400/10 px-2 py-1 rounded">
                        Oczekuje
                      </span>
                    )}
                    {user?.id === event.created_by && (
                      <span className="text-amber font-sans text-xs font-semibold bg-amber/10 px-2 py-1 rounded">
                        Twoj event
                      </span>
                    )}
                    {!isUpcoming(event.event_date) && (
                      <span className="text-muted-foreground font-sans text-xs font-semibold bg-muted px-2 py-1 rounded">
                        Zakonczony
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-amber" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-amber" />
                    <span>{formatEventDate(event.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 text-amber" />
                    <span>{event.attendee_count} osob sie zapisalo</span>
                  </div>
                </div>

                <p className="font-sans text-sm text-muted-foreground mb-4 line-clamp-2">
                  {event.description}
                </p>

                {event.is_approved && isUpcoming(event.event_date) && (
                  <button
                    onClick={() => handleJoinEvent(event.id)}
                    disabled={!user}
                    className={`w-full font-display font-bold text-sm uppercase tracking-widest px-4 py-2.5 rounded transition-colors ${
                      joined.has(event.id)
                        ? 'bg-amber/20 text-amber border border-amber/40 hover:bg-amber/30'
                        : 'bg-amber text-primary-foreground hover:opacity-90'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {user ? (joined.has(event.id) ? 'Juz sie zapisales' : 'Zapisz sie') : 'Zaloguj sie'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
