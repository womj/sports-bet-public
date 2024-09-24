import { Games, HistoricalGameData } from "@/src/model/model"

export type SportsRepository = {
    getTodaysGame: () => Promise<Games>,
    getHistoricalGames: () => HistoricalGameData,
    updateHistoricalGames: () => Promise<void>
}
