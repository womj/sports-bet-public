import { americanOddsToOdds, betPayoutFromAmericanOdds, calculateEv, calculateMedian, getKellyPercent, isWeekend, winChanceToAmericanOddsBreakpoint } from "@/src/lib/utils"
import { Book, Game } from "@/src/model/model"

type TShouldBet = {
    home: boolean
    away: boolean
    homeBettingOddsConsidered: number
    awayBettingOddsConsidered: number
}

export type GameWithDerivedData = Game & {
    homeBreakPoint?: number,
    awayBreakPoint?: number,
    shouldBet?: boolean,
    balanceAfter?: number
    homeOddsTaken?: number,
    awayOddsTaken?: number,
    homeEv?: number,
    awayEv?: number,
    betAmount?: number,
}

const HIGH_END_IMPLIED_ODDS = 0.65
const LOW_END_IMPLIED_ODDS = 0.35

function shouldBetHome(game: GameWithDerivedData, homePadding: number, bettingOddsConsidered: number) {
    const homeBreakpoint = winChanceToAmericanOddsBreakpoint(game.homeOdds ?? 0, homePadding)

    const impliedOdds = americanOddsToOdds(bettingOddsConsidered)

    const expectedValue = calculateEv(bettingOddsConsidered, (game.homeOdds ?? 0) - homePadding)

    if (impliedOdds > HIGH_END_IMPLIED_ODDS || impliedOdds < LOW_END_IMPLIED_ODDS) {
        return {
            shouldBet: false,
            breakPoint: homeBreakpoint,
            expectedValue,
        }
    }

    const isHomeFavourite = bettingOddsConsidered <= -110

    const btBets = !!(game.isRed && !isHomeFavourite)

    return {
        shouldBet: (bettingOddsConsidered > homeBreakpoint),
        breakPoint: homeBreakpoint,
        expectedValue
    }
}

function shouldBetAway(game: GameWithDerivedData, awayPadding: number, bettingOddsConsidered: number) {
    const awayBreakpoint = winChanceToAmericanOddsBreakpoint(game.awayOdds ?? 0, awayPadding)

    const impliedOdds = americanOddsToOdds(bettingOddsConsidered)

    const expectedValue = calculateEv(bettingOddsConsidered, game.awayOdds ?? 0 - awayBreakpoint)

    if (impliedOdds > HIGH_END_IMPLIED_ODDS || impliedOdds < LOW_END_IMPLIED_ODDS) {
        return {
            shouldBet: false,
            breakPoint: awayBreakpoint,
            expectedValue
        }
    }

    const isAwayFavourite = bettingOddsConsidered <= -110

    return {
        shouldBet: bettingOddsConsidered > awayBreakpoint,
        breakPoint: awayBreakpoint,
        expectedValue
    }
}

function pickBookToBetOnHome(books: Book[]) {
    if (books.length === 0) {
        return -Infinity
    }

    // return books.find((b) => b.bookmaker === "betonlineag")?.home_americanodds ?? -Infinity

    // return Math.max(...books.map((book) => book.home_americanodds))
    return calculateMedian(books.map((book) => book.home_americanodds))
}

function pickBookToBetOnAway(books: Book[]) {
    if (books.length === 0) {
        return -Infinity
    }

    // return books.find((b) => b.bookmaker === "betonlineag")?.away_americanodds ?? -Infinity

    // return Math.max(...books.map((book) => book.away_americanodds))
    return calculateMedian(books.map((book) => book.away_americanodds))
}

export function shouldBet(game: GameWithDerivedData, HOME_PADDING: number, AWAY_PADDING: number) {
    const toReturn: TShouldBet = {
        home: false,
        away: false,
        homeBettingOddsConsidered: 0,
        awayBettingOddsConsidered: 0
    }

    if (game.isNeutral) {
        return toReturn
    }

    const month = parseInt(game.gameday.substr(4, 2), 10)
    const isABettingMonth = ((3 >= month) || (month >= 12))

    if (!isABettingMonth) {
        return toReturn
    }

    // if (isWeekend(game.gameday)) {
    //     return toReturn
    // }

    const filteredBooks = game.bookdata.filter((b) => b.bookmaker !== "betfair")

    const consideredHomeBettingOdds = pickBookToBetOnHome(filteredBooks)
    const consideredAwayBettingOdds = pickBookToBetOnAway(filteredBooks)

    toReturn.homeBettingOddsConsidered = consideredHomeBettingOdds
    toReturn.awayBettingOddsConsidered = consideredAwayBettingOdds

    const shouldBetHomeRes = shouldBetHome(game, HOME_PADDING, consideredHomeBettingOdds)
    const shouldBetAwayRes = shouldBetAway(game, AWAY_PADDING, consideredAwayBettingOdds)

    toReturn.home = shouldBetHomeRes.shouldBet
    toReturn.away = shouldBetAwayRes.shouldBet

    /////////////////////////////////////////////////
    game.homeBreakPoint = shouldBetHomeRes.breakPoint
    game.awayBreakPoint = shouldBetAwayRes.breakPoint
    game.homeOddsTaken = consideredHomeBettingOdds
    game.awayOddsTaken = consideredAwayBettingOdds
    game.homeEv = shouldBetHomeRes.expectedValue
    game.awayEv = shouldBetAwayRes.expectedValue

    return toReturn
}

function factorFromSuccessfulBet(americanOdds: number, betUnits: number) {
    return 1 + betUnits * betPayoutFromAmericanOdds(americanOdds)
}

function factorFromFailedBet(betUnits: number) {
    return 1 - betUnits
}

function resolveBet(americanOdds: number, betUnits: number, success: boolean) {
    if (success) {
        return factorFromSuccessfulBet(americanOdds, betUnits)
    }

    return factorFromFailedBet(betUnits)
}

function resolveBets(doBet: TShouldBet, game: GameWithDerivedData, betUnits: number) {
    let gameResultFactor = 1

    const homeWon = game.winner === game.home
    if (doBet.home) {
        gameResultFactor = gameResultFactor * resolveBet(doBet.homeBettingOddsConsidered, betUnits, homeWon)
    }

    const awayWon = game.winner === game.away
    if (doBet.away) {
        gameResultFactor = gameResultFactor * resolveBet(doBet.awayBettingOddsConsidered, betUnits, awayWon)
    }

    return gameResultFactor
}

function handleGame(game: GameWithDerivedData, betUnits: number, HOME_PADDING: number, AWAY_PADDING: number, kellyBetting: boolean) {
    const doBet = shouldBet(game, HOME_PADDING, AWAY_PADDING)
    const KELLY_FACTOR = 0.2

    if (kellyBetting && doBet.home) {
        betUnits = KELLY_FACTOR * getKellyPercent((game?.homeOdds || 0), doBet.homeBettingOddsConsidered)
    }

    if (kellyBetting && doBet.away) {
        betUnits = KELLY_FACTOR * getKellyPercent((game?.awayOdds || 0), doBet.awayBettingOddsConsidered)
    }

    /////////////////////////////////////////
    game.shouldBet = doBet.home || doBet.away
    game.betAmount = betUnits

    return resolveBets(doBet, game, betUnits)
}

function handleDay(games: GameWithDerivedData[], betUnits: number, HOME_PADDING: number, AWAY_PADDING: number, dayStartBalance: number, flatBet: boolean, kellyBetting: boolean, prevDayWon: boolean) {
    let balanceChangeOnDay = 1
    let betsOnDay = 0
    let expectedGamesWon = 0
    let gamesWon = 0
    for (const game of games) {
        const bettingChangeRatio = handleGame(game, betUnits, HOME_PADDING, AWAY_PADDING, kellyBetting)

        if (bettingChangeRatio !== 1) {
            betsOnDay++
            expectedGamesWon += (game.homeOdds! - HOME_PADDING) // this is safe as we wouldn't bet if no home odds
            bettingChangeRatio > 1 && gamesWon++
        }

        balanceChangeOnDay += (bettingChangeRatio - 1)

        ///////////////////////////
        if (prevDayWon) {
            flatBet ? game.balanceAfter = dayStartBalance + (balanceChangeOnDay - 1) : game.balanceAfter = dayStartBalance * balanceChangeOnDay
        } else {
            game.balanceAfter = dayStartBalance
        }
    }

    return {
        balanceChangeOnDay,
        betsOnDay,
        expectedGamesWon,
        gamesWon
    }
}

function groupGamesByDay(deepCopy: GameWithDerivedData[]) {
    const gamesGroupedByDay: GameWithDerivedData[][] = []
    let currentDayGames: GameWithDerivedData[] = []
    deepCopy.forEach((game, idx) => {
        currentDayGames.push(game)
        if (deepCopy?.[idx + 1]?.gameday !== game.gameday) {
            gamesGroupedByDay.push(currentDayGames)
            currentDayGames = []
        }
    })

    return gamesGroupedByDay
}

export function bettingSimulator(historicalGames: Game[], betUnits: number, HOME_PADDING: number, AWAY_PADDING: number, flatBet: boolean, kellyBet: boolean, startDate: string, endDate: string) {
    const deepCopy: GameWithDerivedData[] = JSON.parse(JSON.stringify(historicalGames))

    const firstOccurence = deepCopy.findIndex((game) => parseInt(game.gameday) >= parseInt(startDate))
    const lastOccurence = deepCopy.findLastIndex((game) => parseInt(game.gameday) <= parseInt(endDate))
    const slicedDeepCopy = deepCopy.slice(firstOccurence, lastOccurence + 1)

    const groupedByDay = groupGamesByDay(slicedDeepCopy)

    let balance = 1
    let daysBet = 0
    let gamesBet = 0
    let mostBetsOnADay = 0
    let expectedGamesWon = 0
    let gamesWon = 0

    const gainRatios: number[] = []
    const losingDays: number[] = []
    const winningDays: number[] = []
    const dayOnDayChanges: number[] = []

    let prevDayWon = false

    for (const day of groupedByDay) {
        prevDayWon = true // added to treat as if we are always betting
        const { balanceChangeOnDay, betsOnDay, expectedGamesWon: expectedGamesWonInner, gamesWon: gamesWonInner } = handleDay(day, betUnits, HOME_PADDING, AWAY_PADDING, balance, flatBet, kellyBet, prevDayWon)
        if (prevDayWon) {
            flatBet ? balance = balance + (balanceChangeOnDay - 1) : balance = balance * balanceChangeOnDay
        }

        dayOnDayChanges.push(balanceChangeOnDay)
        if (balanceChangeOnDay !== 1) {
            prevDayWon && gainRatios.push(balanceChangeOnDay)
            prevDayWon && daysBet++
            prevDayWon && (gamesBet += betsOnDay)
            betsOnDay > mostBetsOnADay && (mostBetsOnADay = betsOnDay)
        }
        if (balanceChangeOnDay < 1) {
            prevDayWon && losingDays.push(balanceChangeOnDay)
            prevDayWon = false
        }
        if (balanceChangeOnDay > 1) {
            prevDayWon && winningDays.push(balanceChangeOnDay)
            prevDayWon = true
        }
        expectedGamesWon += expectedGamesWonInner
        gamesWon += gamesWonInner
    }

    const multiplicativeEffectOfWins = winningDays.reduce((prev, cur) => prev * cur, 1)
    const multiplicativeEffectOfLosses = losingDays.reduce((prev, cur) => prev * cur, 1)

    return {
        balance,
        daysBet,
        multiplicativeEffectOfWins,
        multiplicativeEffectOfLosses,
        winCount: winningDays.length,
        lossCount: losingDays.length,
        simGames: slicedDeepCopy,
        gamesBet,
        dayOnDayChanges,
        mostBetsOnADay,
        expectedGamesWon,
        gamesWon
    }
}
