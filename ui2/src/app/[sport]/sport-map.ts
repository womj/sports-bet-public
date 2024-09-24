import { ncaab } from "@/src/repository/ncaab/ncaab"
import { SportsRepository } from "@/src/repository/repository"

type SportsRepositoryMap = {
    [s: string]: SportsRepository | undefined
}

export const SPORTS_MAP: SportsRepositoryMap = {
    "ncaab": ncaab
}
