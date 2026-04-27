'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, BookOpen } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  
  // Register state
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regNickname, setRegNickname] = useState('')
  const [regFaculty, setRegFaculty] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  const faculties = [
    'Informatyka',
    'Elektrotechnika',
    'Budownictwo',
    'Zarządzanie',
    'Ekonomia',
    'Prawo',
    'Medycyna',
    'Inne',
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })
      
      if (error) throw error
      router.push('/profil')
    } catch (error: unknown) {
      setLoginError(error instanceof Error ? error.message : 'Blad logowania')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegLoading(true)
    setRegError('')

    try {
      const supabase = createClient()
      
      // Sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        },
      })
      
      if (signUpError) throw signUpError
      
      // Create profile immediately
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            nickname: regNickname,
            faculty: regFaculty,
            points: 0,
            is_admin: false,
          })
        
        if (profileError) throw profileError
        
        // Sign in after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: regEmail,
          password: regPassword,
        })
        
        if (signInError) throw signInError
        router.push('/profil')
      }
    } catch (error: unknown) {
      setRegError(error instanceof Error ? error.message : 'Blad rejestracji')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl uppercase tracking-widest text-foreground mb-2">
            EkstraFlanka
          </h1>
          <p className="font-sans text-sm text-muted-foreground">
            Pierwsze oficjalne mistrzostwa flanki
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-secondary p-1 rounded">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 px-3 rounded font-display font-bold text-sm uppercase tracking-widest transition-all ${
              tab === 'login'
                ? 'bg-amber text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Zaloguj sie
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 px-3 rounded font-display font-bold text-sm uppercase tracking-widest transition-all ${
              tab === 'register'
                ? 'bg-amber text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Rejestracja
          </button>
        </div>

        {/* Login Tab */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="twoj@email.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                Haslo
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors"
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded font-sans">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-4 py-3 rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'Logowanie...' : 'Zaloguj sie'}
            </button>
          </form>
        )}

        {/* Register Tab */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="twoj@email.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                Nickauname
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={regNickname}
                  onChange={(e) => setRegNickname(e.target.value)}
                  placeholder="Twoj_nick"
                  className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                Wydzial
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <select
                  required
                  value={regFaculty}
                  onChange={(e) => setRegFaculty(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors appearance-none"
                >
                  <option value="">Wybierz wydzial</option>
                  {faculties.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs text-muted-foreground uppercase tracking-widest mb-2">
                Haslo
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-secondary border border-border rounded font-sans text-sm focus:outline-none focus:border-amber transition-colors"
                />
              </div>
            </div>

            {regError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded font-sans">
                {regError}
              </div>
            )}

            <button
              type="submit"
              disabled={regLoading}
              className="w-full bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-4 py-3 rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {regLoading ? 'Rejestrowanie...' : 'Zarejestruj sie'}
            </button>
          </form>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6 font-sans">
          Tylko osoby pelnolethe (18+) moga sie zarejestrować
        </p>
      </div>
    </div>
  )
}
