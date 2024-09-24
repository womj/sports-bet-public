"use client"

import React, { useMemo, useState } from "react"
import { bettingSimulator } from "./bettingSimulator"
import dynamic from "next/dynamic"
import { HistoricalGameData } from "@/src/model/model"
const NoSSR = dynamic(() => import('./graph'), { ssr: false })

function getStandardDeviation(array: number[]) {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return { stdDev: Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n), mean }
}


export default function Backtest({ historicalGameData }: { historicalGameData: HistoricalGameData }) {
    const HOME_PADDING = 0.051
    const AWAY_PADDING = 1
    const flatBet = true
    const betUnits = 2 / 100
    const kellyBet = false

    const [startDate, setStartDate] = useState(historicalGameData.data[0].gameday)
    const [endDate, setEndDate] = useState(historicalGameData.data[historicalGameData.data.length - 1].gameday)

    const simResults = useMemo(() => bettingSimulator(historicalGameData.data, betUnits, HOME_PADDING, AWAY_PADDING, flatBet, kellyBet, startDate, endDate), [HOME_PADDING, AWAY_PADDING, betUnits, startDate])
    const meanstd = getStandardDeviation(simResults.dayOnDayChanges)

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStartDate(e.target[0].value)
        setEndDate(e.target[1].value)
    }
    console.log(startDate)
    return (
        <section >
            <NoSSR historical={simResults}></NoSSR>
            <h1>balance: {simResults.balance}</h1>
            <h1>Day Count: {simResults.daysBet}</h1>
            <h1>Games Bet: {simResults.gamesBet}</h1>
            <h1>wins: {simResults.winCount}</h1>
            <h1>losses: {simResults.lossCount}</h1>
            <h1>winning factor: {simResults.multiplicativeEffectOfWins}</h1>
            <h1>losing factor: {simResults.multiplicativeEffectOfLosses}</h1>
            <h1>mean gain factor: {meanstd.mean}</h1>
            <h1>std dev: {meanstd.stdDev}</h1>
            <h1>most bets on a day: {simResults.mostBetsOnADay}</h1>
            <h1>games won: {simResults.gamesWon}</h1>
            <h1>expected games won: {simResults.expectedGamesWon}</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="YYYMMDD" name="startDate" />
                <input type="text" placeholder="YYYMMDD" name="endDate" />
                <button type="submit">Submit</button>
            </form>

            <table id="gamestable">
                <thead>
                    <tr>
                        <th>Home</th>
                        <th>Away</th>
                        <th>Game Day</th>
                        <th>Home Odds</th>
                        <th>Away Odds</th>
                        <th>Favourite</th>
                        <th>Home Breakpoint</th>
                        <th>Away Breakpoint</th>
                        <th>Home ev</th>
                        <th>Away ev</th>
                        <th>Is Neutral</th>
                        <th>Winner</th>
                        <th>Balance After</th>
                        <th>Home Odds Taken</th>
                        <th>Away Odds Taken</th>
                        <th>Units bet</th>
                    </tr>
                </thead>
                <tbody>
                    {simResults.simGames.map((game) => {
                        return (
                            <React.Fragment key={game.id}>
                                <tr
                                    key={game.id}
                                    className={game.shouldBet ? 'highlight' : ''}
                                >
                                    <td>{game.home}</td>
                                    <td>{game.away}</td>
                                    <td>{game.gameday}</td>
                                    <td>{game?.homeOdds?.toFixed(3)}</td>
                                    <td>{game?.awayOdds?.toFixed(3)}</td>
                                    <td>{game.btFavourite}</td>
                                    <td>{game?.homeBreakPoint?.toFixed(3)}</td>
                                    <td>{game?.awayBreakPoint?.toFixed(3)}</td>
                                    <td>{game?.homeEv?.toFixed(3)}</td>
                                    <td>{game?.awayEv?.toFixed(3)}</td>
                                    <td>{game?.isNeutral?.toString()}</td>
                                    <td>{game?.winner?.toString()}</td>
                                    <td>{game?.balanceAfter?.toFixed(3)}</td>
                                    <td>{game?.homeOddsTaken?.toFixed(3)}</td>
                                    <td>{game?.awayOddsTaken?.toFixed(3)}</td>
                                    <td>{game?.betAmount?.toFixed(3)}</td>
                                </tr>
                            </React.Fragment>
                        )
                    })}
                </tbody >
            </table >
        </section >
    )
}
