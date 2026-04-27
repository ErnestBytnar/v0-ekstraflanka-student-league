export type Rank = "Swiezak" | "Snajper spod Grzyba" | "Magister Celnosci" | "Legenda Narodowego"

export function getRank(points: number): Rank {
  if (points >= 100) return "Legenda Narodowego"
  if (points >= 50) return "Magister Celnosci"
  if (points >= 10) return "Snajper spod Grzyba"
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
