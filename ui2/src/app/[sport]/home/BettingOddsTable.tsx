"use client"

import download_table_as_csv from "@/src/lib/table";
import React, { useState } from "react";
import { GameWithDerivedData, shouldBet } from "../backtest/bettingSimulator";
import { americanOddsToOdds } from "@/src/lib/utils";
import { Games } from "../../../model/model";

export default function BettingOddsTable({ aggregatedGameData }: { aggregatedGameData: Games }) {
    const HOME_PADDING = 5.1 / 100
    const AWAY_PADDING = 100 / 100

    const gamesCopy = JSON.parse(JSON.stringify(aggregatedGameData)) as GameWithDerivedData[]

    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const toggleRowExpansion = (id: string) => {
        setExpandedRows((prevExpandedRows) =>
            prevExpandedRows.includes(id)
                ? prevExpandedRows.filter((rowId) => rowId !== id)
                : [...prevExpandedRows, id]
        );
    };

    const totalGamesWithBooks = aggregatedGameData.filter((g) => g.bookdata.length > 0).length

    return (
        <>
            <h6>Total Games with books: {totalGamesWithBooks}</h6>
            <button onClick={() => download_table_as_csv("gamestable", ",")}>Download as csv</button>
            <div id="games-table-wrapper">
                <table id="gamestable">
                    <thead>
                        <tr>
                            <th>Home</th>
                            <th>Away</th>
                            <th>Game Time</th>
                            <th>Home Odds</th>
                            <th>Away Odds</th>
                            <th>Home Ev</th>
                            <th>Away Ev</th>
                            <th>Favourite</th>
                            <th>Home Breakpoint</th>
                            <th>Away Breakpoint</th>
                            <th>Is Neutral</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gamesCopy.map((game) => {
                            const bettingGuide = shouldBet(game, HOME_PADDING, AWAY_PADDING)
                            const isRowExpanded = expandedRows.includes(game.id);
                            const shouldBetLocal = bettingGuide.home || bettingGuide.away
                            return (
                                <React.Fragment key={game.id}>
                                    <tr
                                        key={game.id}
                                        onClick={() => toggleRowExpansion(game.id)}
                                        className={shouldBetLocal ? 'highlight' : ''}
                                    >
                                        <td
                                            className={game.isRed ? 'is-red' : ''}
                                        >
                                            {game.home}
                                        </td>
                                        <td>{game.away}</td>
                                        <td>{(new Date(game.gameTime)).toLocaleTimeString()}</td>
                                        <td>{game?.homeOdds?.toFixed(3)}</td>
                                        <td>{game?.awayOdds?.toFixed(3)}</td>
                                        <td>{game?.homeEv?.toFixed(3)}</td>
                                        <td>{game?.awayEv?.toFixed(3)}</td>
                                        <td>{game.btFavourite}</td>
                                        <td>{game?.homeBreakPoint?.toFixed(3)}</td>
                                        <td>{game?.awayBreakPoint?.toFixed(3)}</td>
                                        <td>{game?.isNeutral?.toString()}</td>
                                    </tr>
                                    {isRowExpanded && (
                                        <tr>
                                            <td colSpan={11}>
                                                <center>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Book</th>
                                                                <th>Home Odds</th>
                                                                <th>Away Odds</th>
                                                                <th>Home Implied Odds</th>
                                                                <th>Away Implied Odds</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {game.bookdata.map((book) => {
                                                                const shouldBetHome = (book.home_americanodds > (game?.homeBreakPoint ?? Infinity)) && shouldBetLocal
                                                                const shouldBetAway = (book.away_americanodds > (game?.awayBreakPoint ?? Infinity)) && shouldBetLocal
                                                                const homeClassName = shouldBetHome ? (book.home_americanodds === bettingGuide.homeBettingOddsConsidered ? 'highlight-max' : 'highlight') : ""
                                                                const awayClassName = shouldBetAway ? (book.away_americanodds === bettingGuide.awayBettingOddsConsidered ? 'highlight-max' : 'highlight') : ""
                                                                return (
                                                                    <tr key={book.bookmaker}>
                                                                        <td>{book.bookmaker}</td>
                                                                        <td className={homeClassName}>{book.home_americanodds}</td>
                                                                        <td className={awayClassName} >{book.away_americanodds}</td>
                                                                        <td>{americanOddsToOdds(book.home_americanodds).toFixed(3)}</td>
                                                                        <td>{americanOddsToOdds(book.away_americanodds).toFixed(3)}</td>
                                                                    </tr>)
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </center>
                                            </td>
                                        </tr>)
                                    }
                                </React.Fragment>
                            )
                        })}
                    </tbody >
                </table >
            </div>
        </ >
    )
}