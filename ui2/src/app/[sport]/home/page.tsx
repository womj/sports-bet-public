import dynamic from "next/dynamic"
import { SPORTS_MAP } from "../sport-map"
const NoSSR = dynamic(() => import('./BettingOddsTable'), { ssr: false })

export default async function Home({ params }) {
  console.log(params, "sport descended")
  const repo = SPORTS_MAP[params.sport]
  const aggregatedGameData = await repo?.getTodaysGame()


  return (
    <div id="home">
      <NoSSR aggregatedGameData={aggregatedGameData!} />
    </div >
  )
}
