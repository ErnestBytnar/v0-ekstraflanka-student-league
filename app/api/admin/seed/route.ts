import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const UNIVERSITIES = [
  'Politechnika Rzeszowska',
  'Uniwersytet Rzeszowski',
  'WSIiZ Rzeszow',
  'AGH Krakow',
  'Politechnika Krakowska',
]

const FACULTIES = [
  'Informatyka',
  'Elektrotechnika',
  'Budownictwo',
  'Zarzadzanie',
  'Ekonomia',
]

const NICKNAMES = [
  'FlankaMaster',
  'RzeszowSniper',
  'PiwnySamurai',
  'KrolTrawnika',
  'BulwarowyBoss',
  'AcademiaGun',
  'StudenckaLegenda',
  'MistrzParkow',
]

const LOCATIONS = [
  'Park Millenium, Rzeszow',
  'Bulwary nad Wisloka',
  'Miasteczko AGH',
  'Park Jordana, Krakow',
  'Blonia Krakowskie',
]

const EVENT_TITLES = [
  'Turniej Flanek - Runda Eliminacyjna',
  'Puchar Rzeszowa 2026',
  'Liga Studencka - Mecz 1',
  'Nocny Turniej Pod Gwiazdami',
  'Pojedynek Uczelni',
]

const SPOT_NAMES = [
  'Trawnik Millenium',
  'Polana Bulwarowa',
  'Skwer Akademicki',
  'Laka Miejska',
  'Park Studencki',
]

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const results = {
      profiles: 0,
      matchRequests: 0,
      events: 0,
      spots: 0,
      tournaments: 0,
    }

    // Generate dummy profiles (we can't create auth users, but we can check existing or note it)
    // For profiles, we'll create entries that reference existing users or skip if RLS blocks it
    // Instead, we'll seed other data that doesn't require auth users

    // Seed match requests (using the admin's user_id)
    for (let i = 0; i < 5; i++) {
      const { error } = await supabase.from('match_requests').insert({
        user_id: user.id,
        location: LOCATIONS[i % LOCATIONS.length],
        description: `Szukam ${Math.floor(Math.random() * 4) + 2} graczy na wieczorny mecz. Poziom: ${['poczatkujacy', 'sredni', 'zaawansowany'][i % 3]}. Spotkanie o ${17 + i}:00.`,
        players_needed: Math.floor(Math.random() * 4) + 2,
      })
      if (!error) results.matchRequests++
    }

    // Seed events
    for (let i = 0; i < 5; i++) {
      const eventDate = new Date()
      eventDate.setDate(eventDate.getDate() + i * 7 + 1)
      
      const { error } = await supabase.from('events').insert({
        title: EVENT_TITLES[i % EVENT_TITLES.length],
        location: LOCATIONS[i % LOCATIONS.length],
        description: `Zapraszamy na ${EVENT_TITLES[i % EVENT_TITLES.length]}! Przyjdz i pokaz swoje umiejetnosci. Wstep wolny, nagrody dla najlepszych.`,
        event_date: eventDate.toISOString(),
        created_by: user.id,
        is_approved: i < 3, // First 3 approved, last 2 pending for moderation testing
      })
      if (!error) results.events++
    }

    // Seed spots
    const baseLatLng = { lat: 50.0413, lng: 21.9990 } // Rzeszow center
    for (let i = 0; i < 5; i++) {
      const { error } = await supabase.from('spots').insert({
        name: SPOT_NAMES[i % SPOT_NAMES.length],
        description: `Swietne miejsce na flanki! ${['Duzo miejsca', 'Rowny teren', 'Blisko parkingu', 'Oswietlone wieczorem', 'Ciche i spokojne'][i]}. Polecam!`,
        lat: baseLatLng.lat + (Math.random() - 0.5) * 0.02,
        lng: baseLatLng.lng + (Math.random() - 0.5) * 0.02,
        created_by: user.id,
        is_approved: i < 3, // First 3 approved, last 2 pending
      })
      if (!error) results.spots++
    }

    // Seed tournaments
    const tournamentTeams = [
      ['Druzyna PRz', 'Akademia UR', 'Snajperzy WSIiZ', 'Mistrzowie AGH'],
      ['Bulwarowi', 'Parkowi', 'Trawnikowi', 'Polani'],
    ]

    for (let i = 0; i < 2; i++) {
      const { error } = await supabase.from('tournaments').insert({
        name: i === 0 ? 'Puchar Rzeszowa 2026' : 'Liga Studencka - Sezon 1',
        bracket_data: {
          teams: tournamentTeams[i],
          rounds: [],
          currentRound: 0,
        },
        status: i === 0 ? 'active' : 'completed',
      })
      if (!error) results.tournaments++
    }

    return NextResponse.json({
      success: true,
      message: 'Dane testowe zostaly dodane!',
      results,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Seed failed' },
      { status: 500 }
    )
  }
}
