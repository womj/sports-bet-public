export interface HistoricalGameData {
    name: string,
    data: Game[]
}

export interface Game {
    id: string;
    gameday: string;
    home: string;
    away: string;
    btFavourite: string | undefined;
    homeOdds: number | undefined;
    awayOdds: number | undefined;
    bookdata: Book[];
    isNeutral: boolean | undefined;
    gameTime: string;
    winner?: string;
    isRed?: boolean;
    isBold?: boolean;
}

export interface Book {
    bookmaker: string;
    gameday: string;
    home_americanodds: number;
    away_americanodds: number;
}


export type Games = Game[]
