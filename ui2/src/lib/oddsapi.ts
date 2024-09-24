import tzmoment from "moment-timezone";
import { calculateSHA256Hash } from "./utils";

interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: {
    key: string;
    last_update: string;
    outcomes: {
      name: string;
      price: number;
    }[];
  }[];
}

interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

const oddsApiToBartorvikNames = {
  "Abilene Christian Wildcats": "Abilene Christian",
  "Air Force Falcons": "Air Force",
  "Akron Zips": "Akron",
  "Alabama A&M Bulldogs": "Alabama A&M",
  "Alabama Crimson Tide": "Alabama",
  "Alabama St Hornets": "Alabama St.",
  "Albany Great Danes": "Albany",
  "Alcorn St Braves": "Alcorn St.",
  "American Eagles": "American",
  "Appalachian St Mountaineers": "Appalachian St.",
  "Arizona St Sun Devils": "Arizona St.",
  "Arizona Wildcats": "Arizona",
  "Arkansas Razorbacks": "Arkansas",
  "Arkansas St Red Wolves": "Arkansas St.",
  "Arkansas-Little Rock Trojans": "Little Rock",
  "Arkansas-Pine Bluff Golden Lions": "Arkansas Pine Bluff",
  "Army Knights": "Army",
  "Auburn Tigers": "Auburn",
  "Austin Peay Governors": "Austin Peay",
  "Ball State Cardinals": "Ball St.",
  "Baylor Bears": "Baylor",
  "Bellarmine Knights": "Bellarmine",
  "Belmont Bruins": "Belmont",
  "Bethune-Cookman Wildcats": "Bethune Cookman",
  "Binghamton Bearcats": "Binghamton",
  "Boise State Broncos": "Boise St.",
  "Boston College Eagles": "Boston College",
  "Boston Univ. Terriers": "Boston University",
  "Bowling Green Falcons": "Bowling Green",
  "Bradley Braves": "Bradley",
  "Brown Bears": "Brown",
  "Bryant Bulldogs": "Bryant",
  "Bucknell Bison": "Bucknell",
  "Buffalo Bulls": "Buffalo",
  "Butler Bulldogs": "Butler",
  "BYU Cougars": "BYU",
  "Cal Baptist Lancers": "Cal Baptist",
  "Cal Poly Mustangs": "Cal Poly",
  "California Golden Bears": "California",
  "Campbell Fighting Camels": "Campbell",
  "Canisius Golden Griffins": "Canisius",
  "Central Arkansas Bears": "Central Arkansas",
  "Central Connecticut St Blue Devils": "Central Connecticut",
  "Central Michigan Chippewas": "Central Michigan",
  "Charleston Cougars": "College of Charleston",
  "Charleston Southern Buccaneers": "Charleston Southern",
  "Charlotte 49ers": "Charlotte",
  "Chattanooga Mocs": "Chattanooga",
  "Chicago St Cougars": "Chicago St.",
  "Cincinnati Bearcats": "Cincinnati",
  "Clemson Tigers": "Clemson",
  "Cleveland St Vikings": "Cleveland St.",
  "Coastal Carolina Chanticleers": "Coastal Carolina",
  "Colgate Raiders": "Colgate",
  "Colorado Buffaloes": "Colorado",
  "Colorado St Rams": "Colorado St.",
  "Columbia Lions": "Columbia",
  "Coppin St Eagles": "Coppin St.",
  "Cornell Big Red": "Cornell",
  "Creighton Bluejays": "Creighton",
  "CSU Bakersfield Roadrunners": "Cal St. Bakersfield",
  "CSU Fullerton Titans": "Cal St. Fullerton",
  "CSU Northridge Matadors": "Cal St. Northridge",
  "Dartmouth Big Green": "Dartmouth",
  "Davidson Wildcats": "Davidson",
  "Dayton Flyers": "Dayton",
  "Delaware Blue Hens": "Delaware",
  "Delaware St Hornets": "Delaware St.",
  "Denver Pioneers": "Denver",
  "DePaul Blue Demons": "DePaul",
  "Detroit Mercy Titans": "Detroit",
  "Dixie State Trailblazers": "Utah Tech",
  "Drake Bulldogs": "Drake",
  "Drexel Dragons": "Drexel",
  "Duke Blue Devils": "Duke",
  "Duquesne Dukes": "Duquesne",
  "East Carolina Pirates": "East Carolina",
  "East Tennessee St Buccaneers": "East Tennessee St.",
  "Eastern Illinois Panthers": "Eastern Illinois",
  "Eastern Kentucky Colonels": "Eastern Kentucky",
  "Eastern Michigan Eagles": "Eastern Michigan",
  "Eastern Washington Eagles": "Eastern Washington",
  "Elon Phoenix": "Elon",
  "Evansville Purple Aces": "Evansville",
  "Fairfield Stags": "Fairfield",
  "Fairleigh Dickinson Knights": "Fairleigh Dickinson",
  "Florida A&M Rattlers": "Florida A&M",
  "Florida Atlantic Owls": "Florida Atlantic",
  "Florida Gators": "Florida",
  "Florida Gulf Coast Eagles": "Florida Gulf Coast",
  "Florida Int'l Golden Panthers": "FIU",
  "Florida St Seminoles": "Florida St.",
  "Fordham Rams": "Fordham",
  "Fort Wayne Mastodons": "Fort Wayne",
  "Fresno St Bulldogs": "Fresno St.",
  "Furman Paladins": "Furman",
  "Gardner-Webb Bulldogs": "Gardner Webb",
  "George Mason Patriots": "George Mason",
  "George Washington Colonials": "George Washington",
  "Georgetown Hoyas": "Georgetown",
  "Georgia Bulldogs": "Georgia",
  "Georgia Southern Eagles": "Georgia Southern",
  "Georgia St Panthers": "Georgia St.",
  "Georgia Tech Yellow Jackets": "Georgia Tech",
  "Gonzaga Bulldogs": "Gonzaga",
  "Grambling St Tigers": "Grambling St.",
  "Grand Canyon Antelopes": "Grand Canyon",
  "Green Bay Phoenix": "Green Bay",
  "Hampton Pirates": "Hampton",
  "Hartford Hawks": "Hartford",
  "Harvard Crimson": "Harvard",
  "Hawai'i Rainbow Warriors": "Hawaii",
  "High Point Panthers": "High Point",
  "Hofstra Pride": "Hofstra",
  "Holy Cross Crusaders": "Holy Cross",
  "Houston Baptist Huskies": "Houston Christian",
  "Houston Cougars": "Houston",
  "Howard Bison": "Howard",
  "Idaho State Bengals": "Idaho St.",
  "Idaho Vandals": "Idaho",
  "Illinois Fighting Illini": "Illinois",
  "Illinois St Redbirds": "Illinois St.",
  "Incarnate Word Cardinals": "Incarnate Word",
  "Indiana Hoosiers": "Indiana",
  "Indiana St Sycamores": "Indiana St.",
  "Iona Gaels": "Iona",
  "Iowa Hawkeyes": "Iowa",
  "Iowa State Cyclones": "Iowa St.",
  "IUPUI Jaguars": "IUPUI",
  "Jackson St Tigers": "Jackson St.",
  "Jacksonville Dolphins": "Jacksonville",
  "Jacksonville St Gamecocks": "Jacksonville St.",
  "James Madison Dukes": "James Madison",
  "Kansas Jayhawks": "Kansas",
  "Kansas St Wildcats": "Kansas St.",
  "Kennesaw St Owls": "Kennesaw St.",
  "Kent State Golden Flashes": "Kent St.",
  "Kentucky Wildcats": "Kentucky",
  "La Salle Explorers": "La Salle",
  "Lafayette Leopards": "Lafayette",
  "Lamar Cardinals": "Lamar",
  "Lehigh Mountain Hawks": "Lehigh",
  "Liberty Flames": "Liberty",
  "Lindenwood Lions": "Lindenwood",
  "Lipscomb Bisons": "Lipscomb",
  "LIU Brooklyn Blackbirds": "LIU Brooklyn",
  "LIU Sharks": "LIU Brooklyn",
  "Long Beach St 49ers": "Long Beach St.",
  "Longwood Lancers": "Longwood",
  "Louisiana Ragin' Cajuns": "Louisiana Lafayette",
  "Louisiana Tech Bulldogs": "Louisiana Tech",
  "Louisville Cardinals": "Louisville",
  "Loyola (Chi) Ramblers": "Loyola Chicago",
  "Loyola (MD) Greyhounds": "Loyola MD",
  "Loyola Marymount Lions": "Loyola Marymount",
  "LSU Tigers": "LSU",
  "Maine Black Bears": "Maine",
  "Manhattan Jaspers": "Manhattan",
  "Marist Red Foxes": "Marist",
  "Marquette Golden Eagles": "Marquette",
  "Marshall Thundering Herd": "Marshall",
  "Maryland Terrapins": "Maryland",
  "Maryland-Eastern Shore Hawks": "Maryland Eastern Shore",
  "Massachusetts Minutemen": "Massachusetts",
  "McNeese Cowboys": "McNeese St.",
  "Mcneese St Mcneese": "McNeese St.",
  "Memphis Tigers": "Memphis",
  "Mercer Bears": "Mercer",
  "Merrimack Warriors": "Merrimack",
  "Miami (OH) RedHawks": "Miami OH",
  "Miami Hurricanes": "Miami FL",
  "Michigan St Spartans": "Michigan St.",
  "Michigan Wolverines": "Michigan",
  "Middle Tennessee Blue Raiders": "Middle Tennessee",
  "Milwaukee Panthers": "Milwaukee",
  "Minnesota Golden Gophers": "Minnesota",
  "Miss Valley St Delta Devils": "Mississippi Valley St.",
  "Mississippi St Bulldogs": "Mississippi St.",
  "Missouri St Bears": "Missouri St.",
  "Missouri Tigers": "Missouri",
  "Monmouth Hawks": "Monmouth",
  "Montana Grizzlies": "Montana",
  "Montana St Bobcats": "Montana St.",
  "Morehead St Eagles": "Morehead St.",
  "Morgan St Bears": "Morgan St.",
  "Mt. St. Mary's Mountaineers": "Mount St. Mary's",
  "Murray St Racers": "Murray St.",
  "N Colorado Bears": "Northern Colorado",
  "Navy Midshipmen": "Navy",
  "NC State Wolfpack": "North Carolina St.",
  "Nebraska Cornhuskers": "Nebraska",
  "Nevada Wolf Pack": "Nevada",
  "New Hampshire Wildcats": "New Hampshire",
  "New Mexico Lobos": "New Mexico",
  "New Mexico St Aggies": "New Mexico St.",
  "New Orleans Privateers": "New Orleans",
  "Niagara Purple Eagles": "Niagara",
  "Nicholls St Colonels": "Nicholls St.",
  "NJIT Highlanders": "NJIT",
  "Norfolk St Spartans": "Norfolk St.",
  "North Alabama Lions": "North Alabama",
  "North Carolina A&T Aggies": "North Carolina A&T",
  "North Carolina Central Eagles": "North Carolina Central",
  "North Carolina Tar Heels": "North Carolina",
  "North Dakota Fighting Hawks": "North Dakota",
  "North Dakota St Bison": "North Dakota St.",
  "North Florida Ospreys": "North Florida",
  "North Texas Mean Green": "North Texas",
  "Northeastern Huskies": "Northeastern",
  "Northern Arizona Lumberjacks": "Northern Arizona",
  "Northern Illinois Huskies": "Northern Illinois",
  "Northern Iowa Panthers": "Northern Iowa",
  "Northern Kentucky Norse": "Northern Kentucky",
  "Northwestern St Demons": "Northwestern St.",
  "Northwestern Wildcats": "Northwestern",
  "Notre Dame Fighting Irish": "Notre Dame",
  "Oakland Golden Grizzlies": "Oakland",
  "Ohio Bobcats": "Ohio",
  "Ohio State Buckeyes": "Ohio St.",
  "Oklahoma Sooners": "Oklahoma",
  "Oklahoma St Cowboys": "Oklahoma St.",
  "Old Dominion Monarchs": "Old Dominion",
  "Ole Miss Rebels": "Mississippi",
  "Omaha Mavericks": "Nebraska Omaha",
  "Oral Roberts Golden Eagles": "Oral Roberts",
  "Oregon Ducks": "Oregon",
  "Oregon St Beavers": "Oregon St.",
  "Pacific Tigers": "Pacific",
  "Penn State Nittany Lions": "Penn St.",
  "Pennsylvania Quakers": "Penn",
  "Pepperdine Waves": "Pepperdine",
  "Pittsburgh Panthers": "Pittsburgh",
  "Portland Pilots": "Portland",
  "Portland St Vikings": "Portland St.",
  "Prairie View Panthers": "Prairie View A&M",
  "Presbyterian Blue Hose": "Presbyterian",
  "Princeton Tigers": "Princeton",
  "Providence Friars": "Providence",
  "Purdue Boilermakers": "Purdue",
  "Queens University Royals": "Queens",
  "Quinnipiac Bobcats": "Quinnipiac",
  "Radford Highlanders": "Radford",
  "Rhode Island Rams": "Rhode Island",
  "Rice Owls": "Rice",
  "Richmond Spiders": "Richmond",
  "Rider Broncs": "Rider",
  "Robert Morris Colonials": "Robert Morris",
  "Rutgers Scarlet Knights": "Rutgers",
  "Sacramento St Hornets": "Sacramento St.",
  "Sacred Heart Pioneers": "Sacred Heart",
  "Saint Joseph's Hawks": "Saint Joseph's",
  "Saint Louis Billikens": "Saint Louis",
  "Saint Mary's Gaels": "Saint Mary's",
  "Saint Peter's Peacocks": "Saint Peter's",
  "Sam Houston St Bearkats": "Sam Houston St.",
  "Samford Bulldogs": "Samford",
  "San Diego St Aztecs": "San Diego St.",
  "San Diego Toreros": "San Diego",
  "San Francisco Dons": "San Francisco",
  "San José St Spartans": "San Jose St.",
  "Santa Clara Broncos": "Santa Clara",
  "SE Louisiana Lions": "Southeastern Louisiana",
  "SE Missouri St Redhawks": "Southeast Missouri St.",
  "Seattle Redhawks": "Seattle",
  "Seton Hall Pirates": "Seton Hall",
  "Siena Saints": "Siena",
  "SIU-Edwardsville Cougars": "SIU Edwardsville",
  "SMU Mustangs": "SMU",
  "South Alabama Jaguars": "South Alabama",
  "South Carolina Gamecocks": "South Carolina",
  "South Carolina St Bulldogs": "South Carolina St.",
  "South Carolina Upstate Spartans": "USC Upstate",
  "South Dakota Coyotes": "South Dakota",
  "South Dakota St Jackrabbits": "South Dakota St.",
  "South Florida Bulls": "South Florida",
  "Southern Illinois Salukis": "Southern Illinois",
  "Southern Indiana Screaming Eagles": "Southern Indiana",
  "Southern Jaguars": "Southern",
  "Southern Miss Golden Eagles": "Southern Miss",
  "Southern Utah Thunderbirds": "Southern Utah",
  "St. Bonaventure Bonnies": "St. Bonaventure",
  "St. Francis (PA) Red Flash": "St. Francis PA",
  "St. Francis BKN Terriers": "St. Francis NY",
  "St. John's Red Storm": "St. John's",
  "St. Thomas (MN) Tommies": "St. Thomas",
  "Stanford Cardinal": "Stanford",
  "Stephen F. Austin Lumberjacks": "Stephen F. Austin",
  "Stetson Hatters": "Stetson",
  "Stonehill Skyhawks": "Stonehill",
  "Stony Brook Seawolves": "Stony Brook",
  "Syracuse Orange": "Syracuse",
  "Tarleton State Texans": "Tarleton St.",
  "TCU Horned Frogs": "TCU",
  "Temple Owls": "Temple",
  "Tennessee St Tigers": "Tennessee St.",
  "Tennessee Tech Golden Eagles": "Tennessee Tech",
  "Tennessee Volunteers": "Tennessee",
  "Tenn-Martin Skyhawks": "Tennessee Martin",
  "Texas A&M Aggies": "Texas A&M",
  "Texas A&M-CC Islanders": "Texas A&M Corpus Chris",
  "Texas A&M-Commerce Lions": "Texas A&M Commerce",
  "Texas Longhorns": "Texas",
  "Texas Southern Tigers": "Texas Southern",
  "Texas State Bobcats": "Texas St.",
  "Texas Tech Red Raiders": "Texas Tech",
  "The Citadel Bulldogs": "The Citadel",
  "Toledo Rockets": "Toledo",
  "Towson Tigers": "Towson",
  "Troy Trojans": "Troy",
  "Tulane Green Wave": "Tulane",
  "Tulsa Golden Hurricane": "Tulsa",
  "UAB Blazers": "UAB",
  "UC Davis Aggies": "UC Davis",
  "UC Irvine Anteaters": "UC Irvine",
  "UC Riverside Highlanders": "UC Riverside",
  "UC San Diego Tritons": "UC San Diego",
  "UC Santa Barbara Gauchos": "UC Santa Barbara",
  "UCF Knights": "UCF",
  "UCLA Bruins": "UCLA",
  "UConn Huskies": "Connecticut",
  "UIC Flames": "Illinois Chicago",
  "UL Monroe Warhawks": "Louisiana Monroe",
  "UMass Lowell River Hawks": "UMass Lowell",
  "UMBC Retrievers": "UMBC",
  "UMKC Kangaroos": "UMKC",
  "UNC Asheville Bulldogs": "UNC Asheville",
  "UNC Greensboro Spartans": "UNC Greensboro",
  "UNC Wilmington Seahawks": "UNC Wilmington",
  "UNLV Rebels": "UNLV",
  "USC Trojans": "USC",
  "UT Rio Grande Valley Vaqueros": "UT Rio Grande Valley",
  "Utah State Aggies": "Utah St.",
  "Utah Tech Trailblazers": "Utah Tech",
  "Utah Utes": "Utah",
  "Utah Valley Wolverines": "Utah Valley",
  "UT-Arlington Mavericks": "UT Arlington",
  "UTEP Miners": "UTEP",
  "UTSA Roadrunners": "UTSA",
  "Valparaiso Beacons": "Valparaiso",
  "Valparaiso Crusaders": "Valparaiso",
  "Vanderbilt Commodores": "Vanderbilt",
  "VCU Rams": "VCU",
  "Vermont Catamounts": "Vermont",
  "Villanova Wildcats": "Villanova",
  "Virginia Cavaliers": "Virginia",
  "Virginia Tech Hokies": "Virginia Tech",
  "VMI Keydets": "VMI",
  "Wagner Seahawks": "Wagner",
  "Wake Forest Demon Deacons": "Wake Forest",
  "Washington Huskies": "Washington",
  "Washington St Cougars": "Washington St.",
  "Weber State Wildcats": "Weber St.",
  "West Virginia Mountaineers": "West Virginia",
  "Western Carolina Catamounts": "Western Carolina",
  "Western Illinois Leathernecks": "Western Illinois",
  "Western Kentucky Hilltoppers": "Western Kentucky",
  "Western Michigan Broncos": "Western Michigan",
  "Wichita St Shockers": "Wichita St.",
  "William & Mary Tribe": "William & Mary",
  "Winthrop Eagles": "Winthrop",
  "Wisconsin Badgers": "Wisconsin",
  "Wofford Terriers": "Wofford",
  "Wright St Raiders": "Wright St.",
  "Wyoming Cowboys": "Wyoming",
  "Xavier Musketeers": "Xavier",
  "Yale Bulldogs": "Yale",
  "Youngstown St Penguins": "Youngstown St.",
  "Le Moyne Dolphins": "Le Moyne",
};

async function getGameDataForDay() {
  const currenttime = tzmoment().tz("EST").format("YYYYMMDD");
  const sport = "basketball_ncaab";

  const result = await fetch(
    "https://api.the-odds-api.com/v4/sports/" +
      sport +
      `/odds/?regions=us&markets=h2h&oddsFormat=american&${process.env.ODDS_API_KEY}`
  );
  const res = (await result.json()) as Game[];

  const toInsert = res
    .flatMap((game) => handleGame(game))
    .filter((game) => game.gameday === currenttime);

  return toInsert;
}

async function getGameDataHistorical(queryiso: string, gameday: string) {
  const sport = "basketball_ncaab";

  const result = await fetch(
    "https://api.the-odds-api.com/v4/sports/" +
      sport +
      `/odds-history/?apiKey=${process.env.ODDS_API_KEY}&regions=us&markets=h2h&oddsFormat=american&date=` +
      queryiso
  );
  const res = (await result.json())?.data as Game[];

  const toInsert = res
    .flatMap((game) => handleGame(game))
    .filter((game) => game.gameday === gameday);

  return toInsert;
}

function handleGame(game: Game) {
  const gametime = tzmoment(game.commence_time).tz("EST").format("YYYYMMDD");

  const btHomeTeam: string = oddsApiToBartorvikNames[game.home_team];
  const btAwayTeam: string = oddsApiToBartorvikNames[game.away_team];

  const teamsSortedAlphabetically = [btHomeTeam, btAwayTeam].sort((a, b) =>
    a.localeCompare(b)
  );
  const btid = calculateSHA256Hash(
    gametime + teamsSortedAlphabetically[0] + teamsSortedAlphabetically[1]
  );

  const bookentries = game.bookmakers.map((book) => {
    const homeIndex =
      oddsApiToBartorvikNames[book.markets?.[0].outcomes[0].name] === btHomeTeam
        ? 0
        : 1;
    const awayIndex = (homeIndex + 1) % 2;

    return {
      bookmaker: book.key,
      gameday: gametime,
      home_americanodds: book.markets?.[0].outcomes[homeIndex].price,
      away_americanodds: book.markets?.[0].outcomes[awayIndex].price,
    };
  });

  const gameEntry = {
    bt_id: btid,
    home: btHomeTeam,
    away: btAwayTeam,
    gameday: gametime,
    bookentries,
    gametime: game.commence_time,
  };

  return gameEntry;
}

export { getGameDataForDay, getGameDataHistorical };
