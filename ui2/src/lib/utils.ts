import crypto from 'crypto'

function calculateSHA256Hash(input: string) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

function winChanceToAmericanOddsBreakpoint(oddsOfSuccess: number, padding: number) {
    const neededImpliedOddsToBet = oddsOfSuccess - padding

    if (neededImpliedOddsToBet <= 0) {
        return NaN
    }

    return oddsToAmericanOdds(neededImpliedOddsToBet)
}

function americanOddsToOdds(p: number) {
    if (p < 0) {
        return p / (p - 100)
    }

    return 100 / (100 + p)
}

function oddsToAmericanOdds(p: number) {
    return p > 0.5 ? -100 * p / (1 - p) : 100 * (1 - p) / p
}

function getKellyPercent(pWinning: number, americanOdds: number) {
    if (pWinning <= 0) {
        return 0
    }
    const returnPerDollar = betPayoutFromAmericanOdds(americanOdds)

    const percentBet = pWinning - (1 - pWinning) / returnPerDollar

    return Math.max(percentBet, 0)
}

function calculateMedian(array: number[]) {
    // Make a copy of the array and sort it in ascending order
    const sortedArray = [...array].sort((a, b) => a - b);

    const length = sortedArray.length;

    // Array has odd length
    return sortedArray[Math.floor(length / 2)];
}

function betPayoutFromAmericanOdds(americanOdds: number) {
    return americanOdds > 0 ? americanOdds / 100 : -100 / americanOdds
}

function calculateEv(americanOdds: number, probSuccess: number) {
    const netGain = betPayoutFromAmericanOdds(americanOdds)
    const ev = (netGain + 1) * probSuccess - 1

    return ev
}

function isWeekend(date: string): boolean {
    const year = parseInt(date.substr(0, 4), 10);
    const month = parseInt(date.substr(4, 2), 10) - 1;
    const day = parseInt(date.substr(6, 2), 10);

    const weekday = new Date(year, month, day).getDay();

    return !(weekday === 0);
}


export {
    winChanceToAmericanOddsBreakpoint,
    americanOddsToOdds,
    oddsToAmericanOdds,
    calculateSHA256Hash,
    getKellyPercent,
    calculateMedian,
    betPayoutFromAmericanOdds,
    calculateEv,
    isWeekend
}
