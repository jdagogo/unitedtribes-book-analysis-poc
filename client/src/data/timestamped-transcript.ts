// Direct timestamp mapping for the Merle Haggard Fresh Air transcript
// Audio time is content time (audio time minus 15-second preroll)

export interface TimestampedSegment {
  startTime: number;  // Content time in seconds (audio time - preroll)
  endTime: number;    // End time in seconds
  text: string;       // Exact transcript text
  entities: string[]; // Entity IDs mentioned in this segment
}

// Direct mapping from transcript text to content timing
export const timestampedTranscript: TimestampedSegment[] = [
  {
    startTime: 0,
    endTime: 8,
    text: "DAVID BIANCULLI, HOST: This is FRESH AIR. I'm David Bianculli.",
    entities: ["david-bianculli", "fresh-air"]
  },
  {
    startTime: 8,
    endTime: 20,
    text: "This week marks the 40th anniversary of Farm Aid, the country music concert founded by Willie Nelson",
    entities: ["farm-aid", "willie-nelson", "country-music"]
  },
  {
    startTime: 20,
    endTime: 40,
    text: "as a fundraiser to benefit farmers. Held in Champaign, Illinois, this first gathering featured not only Willie Nelson, but such other supportive performers as Bob Dylan, Billy Joel, Bonnie Raitt, Tom Petty, B.B. King, Loretta Lynn and Roy Orbison.",
    entities: ["farm-aid", "willie-nelson", "bob-dylan", "billy-joel", "bonnie-raitt", "tom-petty", "bb-king", "loretta-lynn", "roy-orbison"]
  },
  {
    startTime: 40,
    endTime: 60,
    text: "Farmers still need aid, and Farm Aid has been staged annually ever since. Stealing the show at that very first Farm Aid concert in April 1985 was Merle Haggard, singing his then-new song \"Natural High.\"",
    entities: ["farm-aid", "merle-haggard", "natural-high", "farm-aid-1985"]
  },
  {
    startTime: 60,
    endTime: 75,
    text: "Today, we're going to listen to our 1995 interview with country music star Merle Haggard. Jon Caramanica, in The New York Times, once described him as",
    entities: ["merle-haggard", "jon-caramanica", "new-york-times", "country-music"]
  },
  {
    startTime: 75,
    endTime: 95,
    text: "quote, \"the country music titan who most resists easy categorization. He was a wildly versatile singer, songwriter and performer with an affinity for a variety of styles - outlaw country, ballads, the Bakersfield sound, Western swing, jazz and more,\" unquote.",
    entities: ["merle-haggard", "outlaw-country", "ballads", "bakersfield-sound", "western-swing", "jazz-influences"]
  },
  {
    startTime: 95,
    endTime: 105,
    text: "Haggard was inducted into the Country Music Hall of Fame in 1994",
    entities: ["merle-haggard", "country-music-hall-of-fame"]
  },
  {
    startTime: 105,
    endTime: 115,
    text: "and was awarded the Kennedy Center Honor in 2010. He died in 2016 on his 79th birthday.",
    entities: ["merle-haggard", "kennedy-center-honor"]
  },
  {
    startTime: 115,
    endTime: 130,
    text: "When Haggard was young, he hardly seemed destined for success. He spent time in and out of reform school and prison before he found his way back to music.",
    entities: ["merle-haggard", "reform-school", "prison"]
  },
  {
    startTime: 130,
    endTime: 145,
    text: "Haggard's best-known songs include \"Mama Tried,\" \"Okie From Muskogee,\" \"Today I Started Loving You Again\" and \"The Bottle Let Me Down.\"",
    entities: ["merle-haggard", "mama-tried", "okie-from-muskogee", "today-i-started-loving-you-again", "the-bottle-let-me-down"]
  },
  {
    startTime: 145,
    endTime: 160,
    text: "Merle Haggard had a lifelong fascination with trains. After he became a star, he acquired his own railway observation car.",
    entities: ["merle-haggard", "trains", "railway-car"]
  },
  {
    startTime: 160,
    endTime: 170,
    text: "And that railway car, on which you can book passage, is now part of the Virginia Scenic Railway.",
    entities: ["virginia-scenic-railway", "railway-car"]
  },
  {
    startTime: 170,
    endTime: 185,
    text: "When Terry spoke with Merle Haggard in 1995, he had reissued an album he recorded in 1969 featuring the songs of Jimmie Rodgers.",
    entities: ["terry-gross", "merle-haggard", "jimmie-rodgers"]
  },
  {
    startTime: 185,
    endTime: 200,
    text: "They began with Haggard's recording of the Jimmie Rodgers classic \"Waiting For A Train.\"",
    entities: ["merle-haggard", "jimmie-rodgers", "waiting-for-a-train"]
  },
  {
    startTime: 200,
    endTime: 205,
    text: "TERRY GROSS: Did you hop freights when you were young?",
    entities: ["terry-gross", "freight-trains"]
  },
  {
    startTime: 205,
    endTime: 208,
    text: "HAGGARD: Yeah, sure did.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 208,
    endTime: 210,
    text: "GROSS: Where would you go?",
    entities: ["terry-gross"]
  },
  {
    startTime: 210,
    endTime: 220,
    text: "HAGGARD: Well, I lived in an oil community called Oildale, which is north of Bakersfield.",
    entities: ["merle-haggard", "oildale", "bakersfield"]
  },
  {
    startTime: 220,
    endTime: 240,
    text: "And the Southern Pacific went right through there. And I'd catch the freight trains going out of there and go to Los Angeles or Fresno or wherever they were going.",
    entities: ["merle-haggard", "southern-pacific", "freight-trains", "los-angeles", "fresno"]
  }
];

// Simple function to get entities at specific content time
export function getEntitiesAtContentTime(contentTime: number): string[] {
  const activeSegments = timestampedTranscript.filter(segment => 
    contentTime >= segment.startTime && contentTime < segment.endTime
  );
  
  const entities = new Set<string>();
  activeSegments.forEach(segment => {
    segment.entities.forEach(entityId => entities.add(entityId));
  });
  
  return Array.from(entities);
}

// Get transcript text at specific content time
export function getTranscriptAtContentTime(contentTime: number): string {
  const activeSegment = timestampedTranscript.find(segment => 
    contentTime >= segment.startTime && contentTime < segment.endTime
  );
  
  return activeSegment?.text || "";
}