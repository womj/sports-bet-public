import cheerio from 'cheerio'
import tzmoment from 'moment-timezone';
import { calculateSHA256Hash } from "../../lib/utils"

interface ParsedGame {
    id: string;
    homeTeam: string;
    awayTeam: string;
    gameday: string;
    homeOdds: number;
    awayOdds: number;
    favourite: string;
    isNeutral: boolean;
    isRed: boolean;
    isBold: boolean;
}

interface ParsedGameWithResults extends ParsedGame {
    winner: string
}

/*
** Retrieves and parses the relevant data from each game from bartorvik
*/
async function getBartTorvikOdds() {
    const daystring = tzmoment().tz("EST").format("YYYYMMDD")

    const url = `https://www.barttorvik.com/schedule.php?date=${daystring}&conlimit=`
    const result = await fetch(url)
    const bartHtml = await result.text()
    const $ = cheerio.load(bartHtml)

    const table = $("#tblData > tbody > tr")

    const parsedGames: ParsedGame[] = []

    table.each(function (rowIndex, rowElement) {
        if (rowIndex == table.length - 1) {
            return
        }
        const tableRow = $(rowElement)

        const td = $(tableRow.children().first())
        const startTime = td.text()

        const style = td.attr('style')

        const isRed = style?.includes("color:red")
        const isBold = style?.includes("font-weight: bold")

        const teamsTd = td.next()
        const [awayTeam, homeTeam] = [teamsTd.find("a").first().text(), teamsTd.find("a").last().text()]
        const isNeutral = teamsTd.text().includes(" vs ")

        const favouriteOddsTd = teamsTd.next()
        const favouriteText = favouriteOddsTd.find("a").first().text()
        const oddsText = favouriteText.split(" (")
        const favouriteOdds = oddsText[1].split("%)")[0]

        const favouriteName = oddsText[0].split(" -")[0]

        const favouriteOddsParsed = parseInt(favouriteOdds) / 100

        const homeOdds = favouriteName === homeTeam ? favouriteOddsParsed : 1 - favouriteOddsParsed
        const awayOdds = 1 - homeOdds

        const teamsSortedAlphabetically = [homeTeam, awayTeam].sort(((a, b) => a.localeCompare(b)))

        const id = calculateSHA256Hash(daystring + teamsSortedAlphabetically[0] + teamsSortedAlphabetically[1])

        parsedGames.push({
            id,
            homeTeam,
            awayTeam,
            gameday: daystring,
            homeOdds,
            awayOdds,
            favourite: favouriteName,
            isNeutral,
            isRed: isRed ?? false,
            isBold: isBold ?? false,
        })
    })

    return parsedGames
}

async function getBartTorvikOddsHistorical(daystring: string) {
    const url = `https://www.barttorvik.com/schedule.php?date=${daystring}&conlimit=`
    const result = await fetch(url)
    const bartHtml = await result.text()
    const $ = cheerio.load(bartHtml)

    const table = $("#tblData > tbody > tr")

    const parsedGames: ParsedGameWithResults[] = []

    table.each(function (rowIndex, rowElement) {
        if (rowIndex == table.length - 1) {
            return
        }
        const tableRow = $(rowElement)

        const td = $(tableRow.children().first())
        const startTime = td.text()
        const style = td.attr('style')

        const isRed = style?.includes("color:red")
        const isBold = style?.includes("font-weight: bold")

        const teamsTd = td.next()
        const [awayTeam, homeTeam] = [teamsTd.find("a").first().text(), teamsTd.find("a").last().text()]
        const isNeutral = teamsTd.text().includes(" vs ")

        const favouriteOddsTd = teamsTd.next()
        const favouriteText = favouriteOddsTd.find("a").first().text()
        const oddsText = favouriteText.split(" (")
        const favouriteOdds = oddsText[1].split("%)")[0]

        const favouriteName = oddsText[0].split(" -")[0]

        const gameResultTd = favouriteOddsTd.next().next()
        const winnerName = gameResultTd.text().split(", ")[0]

        const favouriteOddsParsed = parseInt(favouriteOdds) / 100

        const homeOdds = favouriteName === homeTeam ? favouriteOddsParsed : 1 - favouriteOddsParsed
        const awayOdds = 1 - homeOdds

        const teamsSortedAlphabetically = [homeTeam, awayTeam].sort(((a, b) => a.localeCompare(b)))

        const id = calculateSHA256Hash(daystring + teamsSortedAlphabetically[0] + teamsSortedAlphabetically[1])

        parsedGames.push({
            id,
            homeTeam,
            awayTeam,
            gameday: daystring,
            homeOdds,
            awayOdds,
            favourite: favouriteName,
            isNeutral,
            winner: winnerName,
            isRed: isRed ?? false,
            isBold: isBold ?? false
        })
    })

    return parsedGames
}

export {
    getBartTorvikOdds,
    getBartTorvikOddsHistorical
}
