import Backtest from "./backtest"
import { SPORTS_MAP } from "../sport-map"

export default function Home({ params: { sport } }: { params: { sport: string } }) {
    const repo = SPORTS_MAP[sport]
    const result = repo?.getHistoricalGames()

    return (
        <section>
            <Backtest historicalGameData={result!} />
        </section>
    )
}
