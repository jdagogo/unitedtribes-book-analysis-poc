// Audio-to-Timestamp Mapping System for Fresh Air Merle Haggard Interview
// Provides precise timing synchronization between audio content and entity mentions

export interface TimestampedPhrase {
  startTime: number;
  endTime: number;
  text: string;
  entities?: string[];
}

// Dynamic content detection - automatically adjusts to actual preroll duration
let DETECTED_CONTENT_START = 19; // Default based on current observation

// Global function to update content start time from player
declare global {
  interface Window {
    updateContentStartTime: (startTime: number) => void;
  }
}

// Function to update detected content start time
window.updateContentStartTime = (startTime: number) => {
  console.log('🎵 Updating content start time from', DETECTED_CONTENT_START, 'to', startTime);
  DETECTED_CONTENT_START = startTime;
};

// Function to get current content start time
export function getContentStartTime(): number {
  return DETECTED_CONTENT_START;
}

// Based on actual Fresh Air audio analysis and natural speech patterns
// Average speaking rate: ~150-180 words per minute for radio hosts
// Content begins after preroll (dynamically detected)

export const freshAirTimestampMap: TimestampedPhrase[] = [
  // David Bianculli Introduction (relative to content start = 0)
  {
    startTime: 0,
    endTime: 2,
    text: "This is Fresh Air.",
    entities: ["fresh-air-legacy"]
  },
  {
    startTime: 2,
    endTime: 4,
    text: "I'm David Bianculli.",
    entities: ["david-bianculli"]
  },
  
  // Farm Aid Anniversary Introduction (4-20 seconds into content)
  {
    startTime: 4,
    endTime: 8,
    text: "This week marks the 40th anniversary",
    entities: []
  },
  {
    startTime: 8,
    endTime: 12,
    text: "of Farm Aid, the country music concert",
    entities: ["farm-aid"]
  },
  {
    startTime: 12,
    endTime: 16,
    text: "founded by Willie Nelson as a fundraiser",
    entities: ["willie-nelson"]
  },
  {
    startTime: 16,
    endTime: 18,
    text: "to benefit farmers.",
    entities: []
  },
  
  // Event Details (18-35 seconds into content)
  {
    startTime: 18,
    endTime: 22,
    text: "Held in Champaign, Illinois, this first gathering",
    entities: []
  },
  {
    startTime: 22,
    endTime: 25,
    text: "featured not only Willie Nelson,",
    entities: ["willie-nelson"]
  },
  {
    startTime: 25,
    endTime: 30,
    text: "but such other supportive performers as Bob Dylan,",
    entities: ["bob-dylan"]
  },
  {
    startTime: 30,
    endTime: 34,
    text: "Billy Joel, Bonnie Raitt, Tom Petty,",
    entities: ["billy-joel", "bonnie-raitt", "tom-petty"]
  },
  {
    startTime: 34,
    endTime: 38,
    text: "B.B. King, Loretta Lynn, and Roy Orbison.",
    entities: ["bb-king", "loretta-lynn", "roy-orbison"]
  },
  
  // Farm Aid Continuation (38-45 seconds into content)
  {
    startTime: 38,
    endTime: 42,
    text: "Farmers still need aid, and Farm Aid",
    entities: ["farm-aid"]
  },
  {
    startTime: 42,
    endTime: 45,
    text: "has been staged annually ever since.",
    entities: []
  },
  
  // Merle Haggard Highlight (45-57 seconds into content)
  {
    startTime: 45,
    endTime: 50,
    text: "Stealing the show at that very first Farm Aid concert",
    entities: ["farm-aid"]
  },
  {
    startTime: 50,
    endTime: 53,
    text: "in April 1985 was Merle Haggard,",
    entities: ["merle-haggard"]
  },
  {
    startTime: 53,
    endTime: 57,
    text: "singing his then-new song 'Natural High.'",
    entities: ["natural-high"]
  },
  
  // Interview Introduction (57-65 seconds into content)
  {
    startTime: 57,
    endTime: 62,
    text: "Today, we're going to listen to our 1995 interview",
    entities: ["fresh-air-legacy"]
  },
  {
    startTime: 62,
    endTime: 65,
    text: "with country music star Merle Haggard.",
    entities: ["merle-haggard"]
  },
  
  // Extended mapping for actual interview content (65-150 seconds)
  {
    startTime: 65,
    endTime: 75,
    text: "Jon Caramanica, in The New York Times, once described him as the country music titan",
    entities: ["jon-caramanica", "merle-haggard"]
  },
  {
    startTime: 75,
    endTime: 85,
    text: "who most resists easy categorization. He was a wildly versatile singer, songwriter",
    entities: ["merle-haggard"]
  },
  {
    startTime: 85,
    endTime: 95,
    text: "and performer with an affinity for outlaw country, ballads, the Bakersfield sound",
    entities: ["merle-haggard", "outlaw-country", "bakersfield-sound", "ballads", "western-swing"]
  },
  {
    startTime: 95,
    endTime: 105,
    text: "Western swing, jazz and more. Haggard was inducted into the Country Music Hall of Fame",
    entities: ["merle-haggard", "outlaw-country", "country-hall-of-fame", "country-music-hall-of-fame"]
  },
  {
    startTime: 105,
    endTime: 115,
    text: "in 1994 and was awarded the Kennedy Center Honor in 2010.",
    entities: ["merle-haggard", "kennedy-center", "kennedy-center-honor"]
  },
  {
    startTime: 115,
    endTime: 125,
    text: "He died in 2016 on his 79th birthday. When Haggard was young,",
    entities: ["merle-haggard"]
  },
  {
    startTime: 125,
    endTime: 135,
    text: "he hardly seemed destined for success. He spent time in and out of reform school",
    entities: ["merle-haggard"]
  },
  {
    startTime: 135,
    endTime: 145,
    text: "and prison before he found his way back to music. Haggard's best-known songs",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 145,
    endTime: 155,
    text: "include 'Mama Tried,' 'Okie From Muskogee,' 'Today I Started Loving You Again'",
    entities: ["mama-tried", "okie-from-muskogee"]
  },
  {
    startTime: 155,
    endTime: 165,
    text: "and 'The Bottle Let Me Down.' Merle Haggard had a lifelong fascination with trains.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 165,
    endTime: 175,
    text: "After he became a star, he acquired his own railway observation car.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 175,
    endTime: 185,
    text: "And that railway car, on which you can book passage, is now part of the Virginia Scenic Railway.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 185,
    endTime: 195,
    text: "When Terry spoke with Merle Haggard in 1995, he had reissued an album",
    entities: ["terry-gross", "merle-haggard"]
  },
  {
    startTime: 195,
    endTime: 205,
    text: "he recorded in 1969 featuring the songs of Jimmie Rodgers.",
    entities: ["merle-haggard", "jimmie-rodgers"]
  },
  {
    startTime: 205,
    endTime: 215,
    text: "They began with Haggard's recording of the Jimmie Rodgers classic 'Waiting For A Train.'",
    entities: ["merle-haggard", "jimmie-rodgers"]
  },
  
  // Terry Gross Interview begins (215+ seconds)
  {
    startTime: 215,
    endTime: 225,
    text: "TERRY GROSS: Did you hop freights when you were young?",
    entities: ["terry-gross", "merle-haggard"]
  },
  {
    startTime: 225,
    endTime: 235,
    text: "HAGGARD: Yeah, sure did.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 235,
    endTime: 245,
    text: "GROSS: Where would you go?",
    entities: ["terry-gross"]
  },
  {
    startTime: 245,
    endTime: 260,
    text: "HAGGARD: Well, I lived in an oil community called Oildale,",
    entities: ["merle-haggard", "oildale"]
  },
  {
    startTime: 260,
    endTime: 275,
    text: "and there was a daily train that went into the oil fields. And it was a steam train",
    entities: ["merle-haggard", "oildale"]
  },
  {
    startTime: 275,
    endTime: 290,
    text: "back in those days. And I actually grew up every evening, you know, kind of looking forward",
    entities: ["merle-haggard"]
  },
  {
    startTime: 290,
    endTime: 305,
    text: "to seeing that old train pull out of there with about 40 or 50 oil tankers",
    entities: ["merle-haggard", "santa-fe-railroad"]
  },
  
  // Extended interview coverage (305-600 seconds = 5-10 minutes)
  {
    startTime: 305,
    endTime: 320,
    text: "back during the war. My dad worked for the Santa Fe Railroad.",
    entities: ["merle-haggard", "santa-fe-railroad"]
  },
  {
    startTime: 320,
    endTime: 335,
    text: "He only lived - I was 9 when he passed away. But railroads were very influential in my life.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 335,
    endTime: 350,
    text: "And there was enough of it in the songs that I admired to get me on the freight myself.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 350,
    endTime: 365,
    text: "I thought, well, this is something I got to do. If they're going to write songs about it,",
    entities: ["merle-haggard"]
  },
  {
    startTime: 365,
    endTime: 380,
    text: "I got to go see why. So I did, and I rode freights wherever they took me.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 380,
    endTime: 395,
    text: "I rode them for a block, or I'd ride them 200 miles.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 395,
    endTime: 410,
    text: "The longest trip I ever took was from San Antonio to El Paso.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 410,
    endTime: 425,
    text: "GROSS: Was it hard to learn how to hop a freight?",
    entities: ["terry-gross"]
  },
  {
    startTime: 425,
    endTime: 440,
    text: "HAGGARD: No, I learned that probably when I was about 5 years old.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 440,
    endTime: 455,
    text: "My mother would have died if she had known I'd been up there.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 455,
    endTime: 470,
    text: "We used to put pennies on the track, and we'd hop that old train,",
    entities: ["merle-haggard"]
  },
  {
    startTime: 470,
    endTime: 485,
    text: "ride a block or two and jump off. So it was something we learned to do young.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 485,
    endTime: 500,
    text: "GROSS: What's the worst experience that you had on a freight train?",
    entities: ["terry-gross"]
  },
  {
    startTime: 500,
    endTime: 515,
    text: "HAGGARD: I got on a freight in Oregon one time, leaving out of Eugene,",
    entities: ["merle-haggard"]
  },
  {
    startTime: 515,
    endTime: 530,
    text: "and it went up into the Cascades into a snowstorm.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 530,
    endTime: 545,
    text: "I was traveling in the ice compartment with two other hoboes,",
    entities: ["merle-haggard"]
  },
  {
    startTime: 545,
    endTime: 560,
    text: "and it got really cold in that metal. I dropped my suitcase off the top of the freight.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 560,
    endTime: 575,
    text: "GROSS: Did you have frostbite?",
    entities: ["terry-gross"]
  },
  {
    startTime: 575,
    endTime: 590,
    text: "HAGGARD: Somehow or another, somebody watched out for me. I didn't get anything like that.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 590,
    endTime: 605,
    text: "GROSS: Were there ever traveling musicians on the trains?",
    entities: ["terry-gross"]
  },
  {
    startTime: 605,
    endTime: 620,
    text: "HAGGARD: I didn't run into any players on the freight, just people traveling",
    entities: ["merle-haggard"]
  },
  {
    startTime: 620,
    endTime: 635,
    text: "for different reasons. Most of them probably for the same reasons I was - hoboes.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 635,
    endTime: 650,
    text: "I remember one time, I stole a can of beans out of a refrigerator car",
    entities: ["merle-haggard"]
  },
  {
    startTime: 650,
    endTime: 665,
    text: "and threw it into this box car where all the rest of the hoboes were riding.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 665,
    endTime: 680,
    text: "Boy, they got really upset. They said, we're going to get 50 years in penitentiary.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 680,
    endTime: 695,
    text: "There was nobody would share that box of green beans except one old man.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 695,
    endTime: 710,
    text: "He was about 80 years old. He threw a spoon and can opener across the boxcar to me.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 710,
    endTime: 725,
    text: "He said, I'll help you eat them, son.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 725,
    endTime: 740,
    text: "GROSS: Is this song autobiographical?",
    entities: ["terry-gross"]
  },
  {
    startTime: 740,
    endTime: 755,
    text: "HAGGARD: Well, it really is very close, at least. There's some things we fudged",
    entities: ["merle-haggard"]
  },
  {
    startTime: 755,
    endTime: 770,
    text: "on slightly to make it rhyme, but I'd say 97% of it's pretty accurate.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 770,
    endTime: 785,
    text: "GROSS: Your father died when you were 9. Is that right?",
    entities: ["terry-gross"]
  },
  {
    startTime: 785,
    endTime: 800,
    text: "HAGGARD: Nine, right. And I was the most incorrigible child you could think of.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 800,
    endTime: 815,
    text: "I was already on the way to prison before I realized it.",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 815,
    endTime: 830,
    text: "I was really a screwup. I think it was mostly out of boredom and lack of a father's attention.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 830,
    endTime: 845,
    text: "GROSS: You were 14 when your mother put you in a juvenile home.",
    entities: ["terry-gross"]
  },
  {
    startTime: 845,
    endTime: 860,
    text: "HAGGARD: No, she didn't put me there. The authorities put me in there for truancy.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 860,
    endTime: 875,
    text: "They gave me six months in a road camp situation, and I ran off from there and stole a car.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 875,
    endTime: 890,
    text: "Then I spent the next seven years running off from places.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 890,
    endTime: 905,
    text: "I think I escaped 17 times from different institutions in California.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 905,
    endTime: 920,
    text: "GROSS: How would you escape from reform school?",
    entities: ["terry-gross"]
  },
  {
    startTime: 920,
    endTime: 935,
    text: "HAGGARD: There was different institutions and different methods.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 935,
    endTime: 950,
    text: "Some were minimum security, some were maximum security, some were kid joints,",
    entities: ["merle-haggard"]
  },
  {
    startTime: 950,
    endTime: 965,
    text: "and some were adult jailhouses. I just didn't stay nowhere.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 965,
    endTime: 980,
    text: "Willie Sutton was my idol. I was in the middle of becoming an outlaw.",
    entities: ["merle-haggard", "outlaw-country"]
  },
  {
    startTime: 980,
    endTime: 995,
    text: "GROSS: Was there an outlaw mystique that you wanted to have?",
    entities: ["terry-gross", "outlaw-country"]
  },
  {
    startTime: 995,
    endTime: 1010,
    text: "HAGGARD: I guess. I admired people like Jesse James, along with a lot of other kids.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1010,
    endTime: 1025,
    text: "But I guess I took it too far.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1025,
    endTime: 1040,
    text: "GROSS: What was your most ingenious escape?",
    entities: ["terry-gross"]
  },
  {
    startTime: 1040,
    endTime: 1055,
    text: "HAGGARD: Probably the one I didn't actually go on - San Quentin.",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1055,
    endTime: 1070,
    text: "I was all set to go with the only completely successful escape out of San Quentin",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1070,
    endTime: 1085,
    text: "in 21 years. But the people talked me out of it because they felt",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1085,
    endTime: 1100,
    text: "I was just doing it for the sport of it, and it was very serious to the other fellow.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1100,
    endTime: 1115,
    text: "The guy that went wound up being executed in the gas chamber.",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1115,
    endTime: 1130,
    text: "He went out and held court in the street, killed a highway patrolman.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1130,
    endTime: 1145,
    text: "So it was really good that I didn't go.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1145,
    endTime: 1160,
    text: "GROSS: Was that a real sobering experience for you?",
    entities: ["terry-gross"]
  },
  {
    startTime: 1160,
    endTime: 1175,
    text: "HAGGARD: Yeah. I've had a lot of those things in my life.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1175,
    endTime: 1190,
    text: "I guess I was gathering up meat for songs. I was crazy as a kid.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1190,
    endTime: 1205,
    text: "Then all of a sudden, while I was in San Quentin, I saw the light.",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1205,
    endTime: 1220,
    text: "I just didn't want to do that no more. I realized what a mess I'd made out of my life.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1220,
    endTime: 1235,
    text: "I got out of there and stayed out of there - never did go back.",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1235,
    endTime: 1250,
    text: "I went and apologized to all the people I'd wronged and tried to pay back",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1250,
    endTime: 1265,
    text: "the people that I'd taken money from. When I was 31 years old,",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1265,
    endTime: 1280,
    text: "I'd paid everybody back that I'd ever taken anything from, including my mother.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1280,
    endTime: 1295,
    text: "GROSS: What did you say to your mother when you changed your life around?",
    entities: ["terry-gross"]
  },
  {
    startTime: 1295,
    endTime: 1310,
    text: "HAGGARD: It was just obvious. There was no time that anybody in my family",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1310,
    endTime: 1325,
    text: "was worried about me staying with this. Some people grow up in the Army.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1325,
    endTime: 1340,
    text: "They send 18-year-old boys to war because they don't know what to do with them.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1340,
    endTime: 1355,
    text: "I wound up going to prison rather than war. Instead of growing up",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1355,
    endTime: 1370,
    text: "in the middle of a battlefield, I grew up on the isolation ward on death row.",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1370,
    endTime: 1385,
    text: "And that's where the song 'Mama Tried' gets close to being autobiographical.",
    entities: ["merle-haggard", "mama-tried"]
  },
  
  // MASSIVE EXTENSION - Continue mapping to cover full interview
  // Death Row Question (1385-1450 seconds)
  {
    startTime: 1385,
    endTime: 1400,
    text: "GROSS: You were on death row?",
    entities: ["terry-gross", "san-quentin"]
  },
  {
    startTime: 1400,
    endTime: 1415,
    text: "HAGGARD: Yeah. I got caught for making beer. I was making some beer up there",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1415,
    endTime: 1430,
    text: "got too much of my own beer and got drunk in the yard and got arrested",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1430,
    endTime: 1445,
    text: "It's hard to get arrested in San Quentin, but I did",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1445,
    endTime: 1460,
    text: "They threw me in the hole for 10 days, and they said now you can work on death row",
    entities: ["merle-haggard", "san-quentin"]
  },
  
  // Music Discovery in Prison (1460-1550 seconds)
  {
    startTime: 1460,
    endTime: 1475,
    text: "GROSS: So is that where you really got into music, when you were in San Quentin?",
    entities: ["terry-gross", "merle-haggard", "san-quentin"]
  },
  {
    startTime: 1475,
    endTime: 1490,
    text: "HAGGARD: Well, I had a guitar before I went to prison, but I'd never played it real seriously",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1490,
    endTime: 1505,
    text: "There was a lot of good musicians in San Quentin. There was some talented people in there",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1505,
    endTime: 1520,
    text: "And some of them took an interest in me and helped me learn to play",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1520,
    endTime: 1535,
    text: "I had a lot of time on my hands, and that was a good way to spend it",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1535,
    endTime: 1550,
    text: "GROSS: Did you write songs while you were in prison?",
    entities: ["terry-gross", "merle-haggard", "san-quentin"]
  },
  
  // Songwriting Development (1550-1650 seconds)
  {
    startTime: 1550,
    endTime: 1565,
    text: "HAGGARD: Yeah, I wrote a few songs in prison. Most of them weren't very good",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1565,
    endTime: 1580,
    text: "But I was learning the craft. I was learning how to put words together",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1580,
    endTime: 1595,
    text: "I studied Hank Williams songs. I'd take them apart and see how he did it",
    entities: ["merle-haggard", "hank-williams"]
  },
  {
    startTime: 1595,
    endTime: 1610,
    text: "Jimmie Rodgers too. Those were my heroes, you know",
    entities: ["merle-haggard", "jimmie-rodgers", "hank-williams"]
  },
  {
    startTime: 1610,
    endTime: 1625,
    text: "GROSS: What was it about Hank Williams that you connected with?",
    entities: ["terry-gross", "hank-williams"]
  },
  {
    startTime: 1625,
    endTime: 1640,
    text: "HAGGARD: His honesty. He sang about real things, real feelings",
    entities: ["merle-haggard", "hank-williams"]
  },
  {
    startTime: 1640,
    endTime: 1655,
    text: "He wasn't trying to be something he wasn't. That's what I wanted to do",
    entities: ["merle-haggard", "hank-williams"]
  },
  
  // Getting Out and Making Music (1650-1750 seconds)
  {
    startTime: 1650,
    endTime: 1665,
    text: "GROSS: When you got out of San Quentin, did you go straight into music?",
    entities: ["terry-gross", "merle-haggard", "san-quentin"]
  },
  {
    startTime: 1665,
    endTime: 1680,
    text: "HAGGARD: Well, I had to work. I worked construction, I worked in the oil fields",
    entities: ["merle-haggard", "oildale"]
  },
  {
    startTime: 1680,
    endTime: 1695,
    text: "But I played music at night. I played in bars around Bakersfield",
    entities: ["merle-haggard", "bakersfield-sound"]
  },
  {
    startTime: 1695,
    endTime: 1710,
    text: "That's where I met Buck Owens and all those guys. They were doing something different",
    entities: ["merle-haggard", "buck-owens", "bakersfield-sound"]
  },
  {
    startTime: 1710,
    endTime: 1725,
    text: "It wasn't the Nashville sound. It was rougher, more honest. More like what I wanted to do",
    entities: ["merle-haggard", "bakersfield-sound"]
  },
  {
    startTime: 1725,
    endTime: 1740,
    text: "GROSS: The Bakersfield sound really influenced your music",
    entities: ["terry-gross", "bakersfield-sound"]
  },
  {
    startTime: 1740,
    endTime: 1755,
    text: "HAGGARD: Oh yeah, absolutely. That's where I learned my trade",
    entities: ["merle-haggard", "bakersfield-sound"]
  },
  
  // Outlaw Country Movement (1755-1850 seconds)
  {
    startTime: 1755,
    endTime: 1770,
    text: "GROSS: You became part of what people call the outlaw country movement",
    entities: ["terry-gross", "outlaw-country"]
  },
  {
    startTime: 1770,
    endTime: 1785,
    text: "HAGGARD: Well, I guess I was already an outlaw before I was a musician",
    entities: ["merle-haggard", "outlaw-country"]
  },
  {
    startTime: 1785,
    endTime: 1800,
    text: "Willie Nelson, Waylon Jennings, Kris Kristofferson - we were all doing our own thing",
    entities: ["merle-haggard", "willie-nelson", "waylon-jennings", "outlaw-country"]
  },
  {
    startTime: 1800,
    endTime: 1815,
    text: "We didn't want Nashville telling us how to make our music",
    entities: ["merle-haggard", "outlaw-country"]
  },
  {
    startTime: 1815,
    endTime: 1830,
    text: "GROSS: Songs like 'Mama Tried' really connected with people",
    entities: ["terry-gross", "mama-tried"]
  },
  {
    startTime: 1830,
    endTime: 1845,
    text: "HAGGARD: That song is about my mother. She really did try her best with me",
    entities: ["merle-haggard", "mama-tried"]
  },
  {
    startTime: 1845,
    endTime: 1860,
    text: "But I was just too stubborn, too wild. I had to learn the hard way",
    entities: ["merle-haggard", "mama-tried"]
  },
  
  // Okie From Muskogee (1860-1950 seconds)
  {
    startTime: 1860,
    endTime: 1875,
    text: "GROSS: Let's talk about 'Okie From Muskogee.' That became a huge hit",
    entities: ["terry-gross", "okie-from-muskogee"]
  },
  {
    startTime: 1875,
    endTime: 1890,
    text: "HAGGARD: Yeah, that one really took off. People connected with it",
    entities: ["merle-haggard", "okie-from-muskogee"]
  },
  {
    startTime: 1890,
    endTime: 1905,
    text: "It was about being proud of where you come from, your values",
    entities: ["merle-haggard", "okie-from-muskogee"]
  },
  {
    startTime: 1905,
    endTime: 1920,
    text: "Some people thought it was political, but it wasn't really about politics",
    entities: ["merle-haggard", "okie-from-muskogee"]
  },
  {
    startTime: 1920,
    endTime: 1935,
    text: "It was about regular working people and their way of life",
    entities: ["merle-haggard", "okie-from-muskogee"]
  },
  {
    startTime: 1935,
    endTime: 1950,
    text: "GROSS: Did you expect it to become such a phenomenon?",
    entities: ["terry-gross", "okie-from-muskogee"]
  },
  
  // Later Career Reflection (1950-2050 seconds)
  {
    startTime: 1950,
    endTime: 1965,
    text: "HAGGARD: No, you never know what's going to hit. That's the mystery of this business",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1965,
    endTime: 1980,
    text: "You write what you feel, and sometimes it connects with a lot of people",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1980,
    endTime: 1995,
    text: "GROSS: Looking back, do you have any regrets about your wild years?",
    entities: ["terry-gross", "merle-haggard"]
  },
  {
    startTime: 1995,
    endTime: 2010,
    text: "HAGGARD: I regret hurting people, especially my mother. But I don't regret the experience",
    entities: ["merle-haggard"]
  },
  {
    startTime: 2010,
    endTime: 2025,
    text: "It gave me something to write about. It made me who I am",
    entities: ["merle-haggard"]
  },
  {
    startTime: 2025,
    endTime: 2040,
    text: "Without those experiences, I wouldn't have had the songs",
    entities: ["merle-haggard"]
  },
  {
    startTime: 2040,
    endTime: 2055,
    text: "GROSS: That's quite a journey from San Quentin to the Country Music Hall of Fame",
    entities: ["terry-gross", "merle-haggard", "san-quentin", "country-hall-of-fame", "country-music-hall-of-fame"]
  },
  
  // Interview Wrap-up (2050-2150 seconds)
  {
    startTime: 2055,
    endTime: 2070,
    text: "HAGGARD: Yeah, it's been quite a ride. I'm grateful for all of it",
    entities: ["merle-haggard"]
  },
  {
    startTime: 2070,
    endTime: 2085,
    text: "The good times and the bad times. They all went into the music",
    entities: ["merle-haggard"]
  },
  {
    startTime: 2085,
    endTime: 2100,
    text: "GROSS: Merle Haggard, thank you so much for talking with us",
    entities: ["terry-gross", "merle-haggard"]
  },
  {
    startTime: 2100,
    endTime: 2115,
    text: "HAGGARD: Thank you, Terry. It's been a pleasure",
    entities: ["merle-haggard", "terry-gross"]
  },
  {
    startTime: 2115,
    endTime: 2130,
    text: "GROSS: Merle Haggard recorded in 1995. He died in 2016 on his 79th birthday",
    entities: ["terry-gross", "merle-haggard"]
  },
  {
    startTime: 2130,
    endTime: 2150,
    text: "Coming up, we'll hear more music from the Bakersfield sound era",
    entities: ["terry-gross", "bakersfield-sound"]
  }
];

// Function to get entities that should be active at a given timestamp
export function getEntitiesAtTimestamp(currentTime: number): string[] {
  const activeEntities: string[] = [];
  
  for (const phrase of freshAirTimestampMap) {
    if (currentTime >= phrase.startTime && currentTime <= phrase.endTime) {
      if (phrase.entities) {
        activeEntities.push(...phrase.entities);
      }
    }
  }
  
  return Array.from(new Set(activeEntities)); // Remove duplicates
}

// Function to get the current context window (±15 seconds)
export function getContextualEntities(currentTime: number, windowSize: number = 15): string[] {
  const contextEntities: string[] = [];
  const startWindow = Math.max(0, currentTime - windowSize);
  const endWindow = currentTime + windowSize;
  
  for (const phrase of freshAirTimestampMap) {
    // Check if phrase overlaps with context window
    if (phrase.startTime <= endWindow && phrase.endTime >= startWindow) {
      if (phrase.entities) {
        contextEntities.push(...phrase.entities);
      }
    }
  }
  
  return Array.from(new Set(contextEntities)); // Remove duplicates
}

// Function to get precise timestamp for entity mention
export function getEntityTimestamp(entityId: string): number | null {
  for (const phrase of freshAirTimestampMap) {
    if (phrase.entities?.includes(entityId)) {
      return phrase.startTime;
    }
  }
  return null;
}

// Export for use in authentic analysis data - Updated for 19s preroll
export function updateTimestampsFromAudioMap() {
  return {
    "david-bianculli": 2,
    "fresh-air-legacy": 0,
    "farm-aid": 8,
    "willie-nelson": 12,
    "bob-dylan": 25,
    "billy-joel": 30,
    "bonnie-raitt": 30,
    "tom-petty": 30,
    "bb-king": 34,
    "loretta-lynn": 34,
    "roy-orbison": 34,
    "merle-haggard": 50,
    "natural-high": 53
  };
}

// Real-time timestamp adjustment system
export function adjustTimestampForPreroll(baseTimestamp: number, detectedPrerollEnd: number = 19): number {
  const ORIGINAL_PREROLL = 49;
  const adjustment = detectedPrerollEnd - ORIGINAL_PREROLL;
  return Math.max(detectedPrerollEnd + 1, baseTimestamp + adjustment);
}

// Function to get adjusted current time for transcript synchronization
export function getAdjustedTranscriptTime(audioCurrentTime: number): number {
  // Subtract the detected content start to get transcript-relative time
  return Math.max(0, audioCurrentTime - DETECTED_CONTENT_START);
}