import { getGameDataHistorical } from "@/src/lib/oddsapi";
import { HistoricalGameData } from "@/src/model/model";
import { getBartTorvikOddsHistorical } from "@/src/repository/ncaab/barttorvik";
import fs from "fs";
import tzmoment from 'moment-timezone';
import { getGameDataForDay } from "../../lib/oddsapi";
import { SportsRepository } from "../repository";
import { getBartTorvikOdds } from "./barttorvik";

async function getTodaysGame() {
    const bettingData = await getGameDataForDay()
    const bartTorvikData = await getBartTorvikOdds()

    const aggregatedGameData = bettingData.map((gameEntry) => {
        const barttorvikgame = bartTorvikData.find((game) => game.id === gameEntry.bt_id)

        if (!barttorvikgame) {
            console.log(gameEntry.bt_id, gameEntry.home, gameEntry.away)
        }

        // this will fuck up if bt and odds api dont agree on home/away
        const aggregatedEntry = {
            id: gameEntry.bt_id,
            gameday: gameEntry.gameday,
            home: gameEntry.home,
            away: gameEntry.away,
            btFavourite: barttorvikgame?.favourite,
            homeOdds: barttorvikgame?.homeOdds,
            awayOdds: barttorvikgame?.awayOdds,
            bookdata: gameEntry.bookentries,
            isNeutral: barttorvikgame?.isNeutral,
            isRed: barttorvikgame?.isRed,
            isBold: barttorvikgame?.isBold,
            gameTime: gameEntry.gametime
        }

        return aggregatedEntry
    })

    return aggregatedGameData
}

function getHistoricalGames() {
    const path = "./src/repository/ncaab/historical-odds.json"
    const file = fs.readFileSync(path, 'utf8')

    const results: HistoricalGameData = JSON.parse(file)

    return results
}

async function updateHistoricalGames() {
    const SEASON_START = 10
    const SEASON_END = 2
    const SCRAPER_START_DATE = "20201116"

    const path = "./src/repository/ncaab/historical-odds.json"
    const file = fs.readFileSync(path, 'utf8')
    const gameHistory: HistoricalGameData = JSON.parse(file)

    const lastPopulatedDate = gameHistory.data[gameHistory.data.length - 1]?.gameday
    const today = tzmoment().tz('America/New_York').add(-1, "days")

    const DayToQuery = lastPopulatedDate ? tzmoment.tz(lastPopulatedDate, 'YYYYMMDD', 'America/New_York').add(1, "days") : tzmoment.tz(SCRAPER_START_DATE, 'YYYYMMDD', 'America/New_York')

    DayToQuery.set({ hour: 11, minute: 0, second: 0 })

    while (DayToQuery.isBefore(today)) {
        // month is in array index, 9 is october, 4 is april
        if (DayToQuery.month() <= SEASON_END || DayToQuery.month() >= SEASON_START) {
            const dayString = DayToQuery.format("YYYYMMDD")
            const oddsApiIso = DayToQuery.toISOString(false).slice(0, -5) + "Z"

            console.log(dayString, oddsApiIso)

            const bartTorvikData = await getBartTorvikOddsHistorical(dayString)
            const bettingData = await getGameDataHistorical(oddsApiIso, dayString)

            const aggregatedGameData = bettingData.map((gameEntry) => {
                const barttorvikgame = bartTorvikData.find((game) => game.id === gameEntry.bt_id)

                if (!barttorvikgame) {
                    console.log(gameEntry.bt_id, gameEntry.home, gameEntry.away)
                }

                // this will fuck up if bt and odds api dont agree on home/away
                const aggregatedEntry = {
                    id: gameEntry.bt_id,
                    gameday: gameEntry.gameday,
                    home: gameEntry.home,
                    away: gameEntry.away,
                    btFavourite: barttorvikgame?.favourite,
                    homeOdds: barttorvikgame?.homeOdds,
                    awayOdds: barttorvikgame?.awayOdds,
                    bookdata: gameEntry.bookentries,
                    isNeutral: barttorvikgame?.isNeutral,
                    isRed: barttorvikgame?.isRed,
                    isBold: barttorvikgame?.isBold,
                    gameTime: gameEntry.gametime,
                    winner: barttorvikgame?.winner
                }

                return aggregatedEntry
            })

            gameHistory.data.push(...aggregatedGameData)
        }
        DayToQuery.add(1, "days")
    }

    fs.writeFileSync(path, JSON.stringify(gameHistory, null, 2));
}

export const ncaab: SportsRepository = {
    getTodaysGame: getTodaysGame,
    getHistoricalGames: getHistoricalGames,
    updateHistoricalGames,
}