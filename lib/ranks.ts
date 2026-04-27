export type Rank = "Swiezak" | "Snajper spod Grzyba" | "Magister Celnosci" | "Legenda Narodowego"

export function getRank(wins: number): Rank {
  if (wins >= 25) return "Legenda Narodowego"
  if (wins >= 11) return "Magister Celnosci"
  if (wins >= 3) return "Snajper spod Grzyba"
  return "Swiezak"
}

export function getRankColor(rank: Rank): string {
  switch (rank) {
    case "Legenda Narodowego":
      return "text-red-400"
    case "Magister Celnosci":
      return "text-amber"
    case "Snajper spod Grzyba":
      return "text-neon"
    case "Swiezak":
    default:
      return "text-muted-foreground"
  }
}
