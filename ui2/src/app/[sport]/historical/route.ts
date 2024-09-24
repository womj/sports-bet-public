import { SPORTS_MAP } from "../sport-map"

// this updates the json to hold the historical data of all ncaa games
export async function GET(req) {
    const url = new URL(req.url)

    const sport = url.pathname.split('/')[1]
    const repo = SPORTS_MAP[sport]

    await repo?.updateHistoricalGames()
    console.log("done")

    return new Response("successfully updated games", { status: 200 })
}   