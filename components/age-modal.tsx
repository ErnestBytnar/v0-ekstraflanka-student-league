"use client"

import { useState } from "react"
import { Shield } from "lucide-react"

interface AgeModalProps {
  onConfirm: () => void
}

export function AgeModal({ onConfirm }: AgeModalProps) {
  const [denied, setDenied] = useState(false)

  if (denied) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center px-8">
          <div className="text-6xl font-display font-black mb-4 text-amber">18+</div>
          <p className="text-muted-foreground text-lg font-sans">
            Przykro nam. Ta strona jest przeznaczona wylacznie dla osob pelnolenich.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(var(--amber) 1px, transparent 1px), linear-gradient(90deg, var(--amber) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Card */}
        <div className="border border-amber/30 bg-card rounded-lg p-8 glow-amber text-center">
          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-amber/10 border border-amber/40 flex items-center justify-center">
              <Shield className="w-8 h-8 text-amber" />
            </div>
          </div>

          {/* Brand */}
          <div className="mb-2">
            <span className="font-display font-black text-4xl tracking-wider text-amber text-glow-amber uppercase">
              Ekstra
            </span>
            <span className="font-display font-black text-4xl tracking-wider text-foreground uppercase">
              Flanka
            </span>
          </div>

          <div className="inline-block bg-amber text-primary-foreground font-display font-bold text-sm px-3 py-1 rounded mb-6 uppercase tracking-widest">
            18+
          </div>

          <p className="text-foreground font-sans text-base leading-relaxed mb-2">
            Ta strona jest przeznaczona wyłącznie dla osób{" "}
            <span className="text-amber font-semibold">pełnoletnich</span>.
          </p>
          <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-8">
            Wchodząc, potwierdzasz że masz ukończone{" "}
            <span className="text-amber font-semibold">18 lat</span>.
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full py-3 bg-amber text-primary-foreground font-display font-bold text-xl uppercase tracking-widest rounded transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] glow-amber"
            >
              Mam 18+ – Wchodzę
            </button>
            <button
              onClick={() => setDenied(true)}
              className="w-full py-3 bg-transparent border border-border text-muted-foreground font-sans text-sm rounded hover:border-destructive hover:text-destructive transition-colors"
            >
              Nie mam 18 lat
            </button>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-4 font-sans">
          EkstraFlanka promuje odpowiedzialną grę i zdrowy styl życia.
        </p>
      </div>
    </div>
  )
}
