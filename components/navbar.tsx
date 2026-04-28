"use client"

import { useEffect, useState } from "react"
import { Menu, X, Zap, LogOut, Settings, Crown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"

const NAV_ITEMS = [
  { label: "Ranking", href: "#ranking" },
  { label: "Kodeks", href: "#kodeks" },
  { label: "Eventy", href: "#events" },
  { label: "Mapa Spotow", href: "#mapa" },
  { label: "Szukam Ekipy", href: "#ekipa" },
]

interface UserInfo {
  nickname: string
  avatar_url?: string
  is_admin: boolean
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase
          .from("profiles")
          .select("nickname, avatar_url, is_admin")
          .eq("id", authUser.id)
          .single()
        if (data) {
          setUser(data)
        }
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-amber rounded flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-black text-xl uppercase tracking-wider">
            <span className="text-amber">Ekstra</span>
            <span className="text-foreground">Flanka</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-sans text-sm text-muted-foreground hover:text-amber transition-colors uppercase tracking-widest"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA / User */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {user.is_admin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 bg-amber/10 border border-amber/40 text-amber hover:bg-amber/20 transition-colors font-display font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
              <Link
                href="/profil"
                className="flex items-center gap-2 px-3 py-2 rounded bg-secondary border border-border hover:border-amber transition-colors"
              >
                {user.avatar_url && (
                  <Image
                    src={user.avatar_url}
                    alt={user.nickname}
                    width={24}
                    height={24}
                    className="rounded w-6 h-6"
                  />
                )}
                <span className="font-display font-bold text-sm text-foreground">
                  {user.nickname}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="bg-amber text-primary-foreground font-display font-bold text-sm uppercase tracking-widest px-4 py-2 rounded hover:opacity-90 transition-opacity"
            >
              Zaloguj sie
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md px-4 py-4 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-display font-bold text-lg text-muted-foreground hover:text-amber transition-colors uppercase tracking-widest"
            >
              {item.label}
            </a>
          ))}
          {user?.is_admin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-amber font-display font-bold uppercase tracking-widest"
            >
              <Settings className="w-4 h-4" />
              Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-display font-bold uppercase tracking-widest mt-2 pt-4 border-t border-border"
            >
              <LogOut className="w-4 h-4" />
              Wyloguj sie
            </button>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center bg-amber text-primary-foreground font-display font-bold uppercase tracking-widest px-4 py-3 rounded mt-2"
            >
              Zaloguj sie
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
