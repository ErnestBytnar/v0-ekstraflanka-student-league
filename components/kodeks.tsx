"use client"

import { useState } from "react"
import { BookOpen, Globe, AlertTriangle, ChevronDown } from "lucide-react"

const CATEGORIES = [
  {
    id: "ogolne",
    icon: BookOpen,
    title: "Zasady Ogólne",
    color: "text-amber",
    borderColor: "border-amber/40",
    bgColor: "bg-amber/5",
    rules: [
      "Mecz sklada sie z dwoch druzyn po 3-5 zawodnikow. Liczba musi byc rowna po obu stronach.",
      "Flanke rzuca sie z pozycji stojacej, bez przekraczania linii rzutu.",
      "Kazdy zawodnik ma 3 proby na ture. Rzuty niecelne odliczane sa od puli celnych.",
      "Punkty przyznawane sa za precyzje: trafienie w srodek = 3 pkt, obrzeze = 1 pkt.",
      "Cel zostaje potwierdzony przez co najmniej dwoch swiadkow lub nagranie wideo.",
      "Zakaz uzywania pomocy mechanicznych, ksztaltujacych tor lotu.",
      "Remis rozstrzyga sie dogrywka - kazda druzyna gra po jednym rzucie naprzemiennie.",
    ],
  },
  {
    id: "regionalne",
    icon: Globe,
    title: "Wariacje Regionalne",
    color: "text-neon",
    borderColor: "border-neon/40",
    bgColor: "bg-neon/5",
    rules: [
      'Warszawa: Obowiazuje tzw. "Zasada Bielan" - rzuty zza 15 m sa premiowane x1.5.',
      'Krakow: Tryb "Kopiec Kosciuszki" - gra pod gore zwieksza wycene rzutow o +2 pkt.',
      'Trojmiasto: "Morska Flanka" - w dni wietrzne (>30 km/h) aktywny jest Tryb Turbo.',
      'Wroclaw: Wyspa Slodowa umozliwia gre "na mostku" - specjalne zasady odbic.',
      'Poznan: "Targi Dominikanskie" - rozszerzone pole gry, dostepny tryb 6v6.',
      "Lodz: Wlokniarz Mode - kazde trafienie w bok kortu liczy jak trafienie w srodek.",
    ],
  },
  {
    id: "kary",
    icon: AlertTriangle,
    title: "Kary i Faule",
    color: "text-red-400",
    borderColor: "border-red-400/40",
    bgColor: "bg-red-400/5",
    rules: [
      "Przekroczenie linii rzutu: utrata tury przez caly sklad (-5 pkt druzyny).",
      "Kontrowersja co do celu: runde weryfikacyjna rozgrywa sie ponownie.",
      "Uzycie zakazanego sprzetu: dyskwalifikacja z aktualnej rundy, zolta kartka.",
      "Dwie zolte kartki = czerwona. Zawodnik opuszcza boisko na 10 minut.",
      "Trzy czerwone kartki w sezonie = zawieszenie na jeden turniej.",
      "Celowe zaklocanie koncentracji (krzyki, gesty) = ostrzezenie i -2 pkt druzyny.",
      "Gra pod wplywem alkoholu: natychmiastowa dyskwalifikacja i zgloszenie do ligi.",
    ],
  },
]

export function Kodeks() {
  const [openId, setOpenId] = useState<string | null>("ogolne")

  return (
    <section id="kodeks" className="py-20 px-4 bg-secondary/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-amber font-sans text-sm uppercase tracking-widest mb-4">
            <BookOpen className="w-4 h-4" />
            Zasady
          </div>
          <h2 className="font-display font-black text-5xl md:text-6xl uppercase text-foreground text-balance">
            Kodeks Gry{" "}
            <span className="text-amber text-glow-amber">(Bez Oszukiwania)</span>
          </h2>
          <p className="text-muted-foreground font-sans text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Kazda ligowa flanka rozgrywana jest zgodnie z oficjalnym Kodeksem EkstraFlanki.
            Nieznajomosci zasad nie zwalnia z odpowiedzialnosci.
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isOpen = openId === cat.id

            return (
              <div
                key={cat.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  isOpen ? cat.borderColor : "border-border"
                } ${isOpen ? cat.bgColor : "bg-card"}`}
              >
                {/* Accordion trigger */}
                <button
                  onClick={() => setOpenId(isOpen ? null : cat.id)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded border flex items-center justify-center flex-shrink-0 ${
                        isOpen ? cat.borderColor : "border-border"
                      } bg-background`}
                    >
                      <Icon className={`w-5 h-5 ${isOpen ? cat.color : "text-muted-foreground"}`} />
                    </div>
                    <span
                      className={`font-display font-black text-xl uppercase tracking-wider ${
                        isOpen ? cat.color : "text-foreground"
                      }`}
                    >
                      {cat.title}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Accordion content */}
                {isOpen && (
                  <div className="px-6 pb-6">
                    <div className="h-px bg-border mb-5" />
                    <ol className="flex flex-col gap-3">
                      {cat.rules.map((rule, i) => (
                        <li key={i} className="flex gap-4">
                          <span
                            className={`font-display font-black text-lg leading-none mt-0.5 flex-shrink-0 ${cat.color}`}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <p className="font-sans text-sm text-foreground leading-relaxed">
                            {rule}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
