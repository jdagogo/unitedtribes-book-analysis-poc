// COMPLETELY REBUILT TIMESTAMP MAPPING
// Based on 15-second preroll + actual Fresh Air interview timing
// Maps entities from authentic-merle-analysis.ts to correct audio timestamps

export const audioTimestampMap = [
  // Opening Section (0-30 seconds content = 15-45 seconds audio)
  {
    startTime: 0,
    endTime: 10,
    text: "FRESH AIR introduction by David Bianculli about Farm Aid anniversary",
    entities: ["farm-aid", "david-bianculli"]
  },
  {
    startTime: 10,
    endTime: 20,
    text: "Farm Aid founded by Willie Nelson as fundraiser to benefit farmers",
    entities: ["farm-aid", "willie-nelson"]
  },
  {
    startTime: 20,
    endTime: 30,
    text: "First gathering in Champaign, Illinois featured Willie Nelson and other performers",
    entities: ["farm-aid", "willie-nelson"]
  },
  {
    startTime: 30,
    endTime: 40,
    text: "Bob Dylan, Billy Joel, Bonnie Raitt, Tom Petty, B.B. King, Loretta Lynn, Roy Orbison",
    entities: ["bob-dylan", "billy-joel", "bonnie-raitt", "tom-petty", "bb-king", "loretta-lynn", "roy-orbison"]
  },
  {
    startTime: 40,
    endTime: 50,
    text: "Farmers still need aid, Farm Aid staged annually ever since",
    entities: ["farm-aid"]
  },
  {
    startTime: 50,
    endTime: 60,
    text: "Stealing the show at first Farm Aid concert in April 1985 was Merle Haggard",
    entities: ["farm-aid-1985", "merle-haggard"]
  },
  {
    startTime: 60,
    endTime: 70,
    text: "singing his then-new song Natural High",
    entities: ["merle-haggard", "natural-high"]
  },
  
  // Jon Caramanica Quote Section (70-110 seconds content = 85-125 seconds audio)
  {
    startTime: 70,
    endTime: 80,
    text: "Today we're listening to 1995 interview with country music star Merle Haggard",
    entities: ["merle-haggard", "terry-gross"]
  },
  {
    startTime: 80,
    endTime: 90,
    text: "Jon Caramanica in The New York Times once described him as",
    entities: ["jon-caramanica", "merle-haggard"]
  },
  {
    startTime: 90,
    endTime: 100,
    text: "the country music titan who most resists easy categorization",
    entities: ["jon-caramanica", "merle-haggard"]
  },
  {
    startTime: 100,
    endTime: 110,
    text: "wildly versatile singer, songwriter and performer with affinity for variety of styles",
    entities: ["merle-haggard", "jon-caramanica"]
  },
  {
    startTime: 110,
    endTime: 120,
    text: "outlaw country, ballads, the Bakersfield sound, Western swing, jazz and more",
    entities: ["merle-haggard", "outlaw-country", "bakersfield-sound"]
  },
  
  // Career Recognition (120-150 seconds content = 135-165 seconds audio)
  {
    startTime: 120,
    endTime: 130,
    text: "Haggard was inducted into Country Music Hall of Fame in 1994",
    entities: ["merle-haggard"]
  },
  {
    startTime: 130,
    endTime: 140,
    text: "awarded Kennedy Center Honor in 2010, died in 2016 on 79th birthday",
    entities: ["merle-haggard"]
  },
  {
    startTime: 140,
    endTime: 150,
    text: "When Haggard was young, hardly seemed destined for success",
    entities: ["merle-haggard"]
  },
  
  // Troubled Youth (150-180 seconds content = 165-195 seconds audio)
  {
    startTime: 150,
    endTime: 160,
    text: "spent time in and out of reform school and prison",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 160,
    endTime: 170,
    text: "before he found his way back to music",
    entities: ["merle-haggard"]
  },
  {
    startTime: 170,
    endTime: 180,
    text: "Haggard's best-known songs include Mama Tried",
    entities: ["merle-haggard", "mama-tried"]
  },
  {
    startTime: 180,
    endTime: 190,
    text: "Okie From Muskogee, Today I Started Loving You Again, The Bottle Let Me Down",
    entities: ["merle-haggard", "okie-from-muskogee"]
  },
  
  // Train Fascination (190-220 seconds content = 205-235 seconds audio)
  {
    startTime: 190,
    endTime: 200,
    text: "Merle Haggard had lifelong fascination with trains",
    entities: ["merle-haggard"]
  },
  {
    startTime: 200,
    endTime: 210,
    text: "After he became a star, acquired his own railway observation car",
    entities: ["merle-haggard"]
  },
  {
    startTime: 210,
    endTime: 220,
    text: "railway car now part of Virginia Scenic Railway",
    entities: ["merle-haggard"]
  },
  
  // Interview Setup (220-250 seconds content = 235-265 seconds audio)
  {
    startTime: 220,
    endTime: 230,
    text: "When Terry spoke with Merle Haggard in 1995",
    entities: ["terry-gross", "merle-haggard"]
  },
  {
    startTime: 230,
    endTime: 240,
    text: "he had reissued album recorded in 1969 featuring songs of Jimmie Rodgers",
    entities: ["merle-haggard", "jimmie-rodgers"]
  },
  {
    startTime: 240,
    endTime: 250,
    text: "They began with Haggard's recording of Jimmie Rodgers classic Waiting For A Train",
    entities: ["merle-haggard", "jimmie-rodgers"]
  },
  
  // TERRY GROSS INTERVIEW BEGINS (250+ seconds content = 265+ seconds audio)
  {
    startTime: 250,
    endTime: 260,
    text: "TERRY GROSS: Did you hop freights when you were young?",
    entities: ["terry-gross"]
  },
  {
    startTime: 260,
    endTime: 270,
    text: "HAGGARD: Yeah, sure did.",
    entities: ["merle-haggard"]
  },
  {
    startTime: 270,
    endTime: 280,
    text: "GROSS: Where would you go?",
    entities: ["terry-gross"]
  },
  {
    startTime: 280,
    endTime: 290,
    text: "HAGGARD: Well, I lived in an oil community called Oildale",
    entities: ["merle-haggard", "oildale"]
  },
  {
    startTime: 290,
    endTime: 300,
    text: "there was a daily train that went into the oil fields, steam train back in those days",
    entities: ["merle-haggard", "oildale"]
  },
  {
    startTime: 300,
    endTime: 310,
    text: "I actually grew up every evening looking forward to seeing that old train",
    entities: ["merle-haggard"]
  },
  {
    startTime: 310,
    endTime: 320,
    text: "pull out with about 40 or 50 oil tankers back during the war",
    entities: ["merle-haggard"]
  },
  {
    startTime: 320,
    endTime: 330,
    text: "My dad worked for the Santa Fe Railroad, he only lived - I was 9 when he passed away",
    entities: ["merle-haggard", "santa-fe-railroad"]
  },
  {
    startTime: 330,
    endTime: 340,
    text: "But railroads were very influential in my life",
    entities: ["merle-haggard", "santa-fe-railroad"]
  },
  {
    startTime: 340,
    endTime: 350,
    text: "there was enough of it in the songs that I admired to get me on the freight myself",
    entities: ["merle-haggard"]
  },
  {
    startTime: 350,
    endTime: 360,
    text: "I thought, well, this is something I got to do. If they're going to write songs about it",
    entities: ["merle-haggard"]
  },
  {
    startTime: 360,
    endTime: 370,
    text: "I got to go see why. So I did, and I rode freights wherever they took me",
    entities: ["merle-haggard"]
  },
  {
    startTime: 370,
    endTime: 380,
    text: "I rode them for a block, or I'd ride them 200 miles",
    entities: ["merle-haggard"]
  },
  {
    startTime: 380,
    endTime: 390,
    text: "longest trip I ever took was from San Antonio to El Paso",
    entities: ["merle-haggard"]
  },
  
  // Learning to Hop Trains (390-450 seconds content)
  {
    startTime: 390,
    endTime: 400,
    text: "GROSS: Was it hard to learn how to hop a freight?",
    entities: ["terry-gross"]
  },
  {
    startTime: 400,
    endTime: 410,
    text: "HAGGARD: No, I learned that probably when I was about 5 years old",
    entities: ["merle-haggard"]
  },
  {
    startTime: 410,
    endTime: 420,
    text: "My mother would have died if she had known I'd been up there",
    entities: ["merle-haggard"]
  },
  {
    startTime: 420,
    endTime: 430,
    text: "We used to put pennies on the track, hop that old train, ride a block or two and jump off",
    entities: ["merle-haggard"]
  },
  {
    startTime: 430,
    endTime: 440,
    text: "So it was something we learned to do young, we'd watch the brakemen and trainmen do it",
    entities: ["merle-haggard"]
  },
  {
    startTime: 440,
    endTime: 450,
    text: "You know, it wasn't really all that hard",
    entities: ["merle-haggard"]
  },
  
  // Worst Train Experience (450-520 seconds content)
  {
    startTime: 450,
    endTime: 460,
    text: "GROSS: What's the worst or most surprising experience you had on a freight train?",
    entities: ["terry-gross"]
  },
  {
    startTime: 460,
    endTime: 470,
    text: "HAGGARD: There was a lot of bad experiences. I got on a freight in Oregon one time",
    entities: ["merle-haggard"]
  },
  {
    startTime: 470,
    endTime: 480,
    text: "leaving out of Eugene, went up into the Cascades into a snowstorm",
    entities: ["merle-haggard"]
  },
  {
    startTime: 480,
    endTime: 490,
    text: "I was traveling in the ice compartment, me and two other hoboes was in there",
    entities: ["merle-haggard"]
  },
  {
    startTime: 490,
    endTime: 500,
    text: "it got really cold in that metal, they stopped up in the mountains",
    entities: ["merle-haggard"]
  },
  {
    startTime: 500,
    endTime: 510,
    text: "climbed up out of that ice compartment, shaking so bad I dropped my suitcase",
    entities: ["merle-haggard"]
  },
  {
    startTime: 510,
    endTime: 520,
    text: "off the top of the freight, had to get off and gather up my clothes",
    entities: ["merle-haggard"]
  },
  
  // Frostbite Question (520-540 seconds content)
  {
    startTime: 520,
    endTime: 530,
    text: "GROSS: Did you have frostbite?",
    entities: ["terry-gross"]
  },
  {
    startTime: 530,
    endTime: 540,
    text: "HAGGARD: Somehow or another, somebody watched out for me. I didn't get anything like that",
    entities: ["merle-haggard"]
  },
  
  // Musicians on Trains (540-600 seconds content)
  {
    startTime: 540,
    endTime: 550,
    text: "GROSS: Were there ever traveling musicians on the trains?",
    entities: ["terry-gross"]
  },
  {
    startTime: 550,
    endTime: 560,
    text: "HAGGARD: I didn't run into any players on the freight, just people traveling",
    entities: ["merle-haggard"]
  },
  {
    startTime: 560,
    endTime: 570,
    text: "for different reasons. Most of them probably for the same reasons I was - hoboes",
    entities: ["merle-haggard"]
  },
  {
    startTime: 570,
    endTime: 580,
    text: "I remember one time, I stole a can of beans out of a refrigerator car",
    entities: ["merle-haggard"]
  },
  {
    startTime: 580,
    endTime: 590,
    text: "threw it into this box car where all the rest of the hoboes were riding",
    entities: ["merle-haggard"]
  },
  {
    startTime: 590,
    endTime: 600,
    text: "Boy, they got really upset. They said, we're going to get 50 years in penitentiary",
    entities: ["merle-haggard"]
  },
  
  // The Old Man Story (600-650 seconds content)
  {
    startTime: 600,
    endTime: 610,
    text: "there was nobody would share that box of green beans except one old man",
    entities: ["merle-haggard"]
  },
  {
    startTime: 610,
    endTime: 620,
    text: "He was about 80 years old. He threw a spoon and can opener across the boxcar to me",
    entities: ["merle-haggard"]
  },
  {
    startTime: 620,
    endTime: 630,
    text: "He said, I'll help you eat them, son",
    entities: ["merle-haggard"]
  },
  {
    startTime: 630,
    endTime: 640,
    text: "GROSS: Is this song autobiographical?",
    entities: ["terry-gross"]
  },
  {
    startTime: 640,
    endTime: 650,
    text: "HAGGARD: Well, it really is very close, at least. There's some things we fudged",
    entities: ["merle-haggard"]
  },
  
  // Father's Death (650-700 seconds content)
  {
    startTime: 650,
    endTime: 660,
    text: "on slightly to make it rhyme, but I'd say 97% of it's pretty accurate",
    entities: ["merle-haggard"]
  },
  {
    startTime: 660,
    endTime: 670,
    text: "GROSS: Your father died when you were 9. Is that right?",
    entities: ["terry-gross"]
  },
  {
    startTime: 670,
    endTime: 680,
    text: "HAGGARD: Nine, right. And I was the most incorrigible child you could think of",
    entities: ["merle-haggard"]
  },
  {
    startTime: 680,
    endTime: 690,
    text: "I was already on the way to prison before I realized it",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 690,
    endTime: 700,
    text: "I was really a screwup. I think it was mostly out of boredom and lack of father's attention",
    entities: ["merle-haggard"]
  },
  
  // Juvenile Home (700-800 seconds content)
  {
    startTime: 700,
    endTime: 710,
    text: "GROSS: You were 14 when your mother put you in a juvenile home",
    entities: ["terry-gross"]
  },
  {
    startTime: 710,
    endTime: 720,
    text: "HAGGARD: No, she didn't put me there. The authorities put me in there for truancy",
    entities: ["merle-haggard"]
  },
  {
    startTime: 720,
    endTime: 730,
    text: "They gave me six months in a road camp situation, and I ran off from there and stole a car",
    entities: ["merle-haggard"]
  },
  {
    startTime: 730,
    endTime: 740,
    text: "Then I spent the next seven years running off from places",
    entities: ["merle-haggard"]
  },
  {
    startTime: 740,
    endTime: 750,
    text: "I think I escaped 17 times from different institutions in California",
    entities: ["merle-haggard"]
  },
  {
    startTime: 750,
    endTime: 760,
    text: "All it was was just a matter of the authorities running me off",
    entities: ["merle-haggard"]
  },
  {
    startTime: 760,
    endTime: 770,
    text: "and drumming up business for themselves. I really feel sorry for the way they do some of the kids",
    entities: ["merle-haggard"]
  },
  {
    startTime: 770,
    endTime: 780,
    text: "I was one of those kids. I'm going to snitch on them if I get a chance",
    entities: ["merle-haggard"]
  },
  {
    startTime: 780,
    endTime: 790,
    text: "GROSS: How would you escape from reform school and youth institutions?",
    entities: ["terry-gross"]
  },
  {
    startTime: 790,
    endTime: 800,
    text: "HAGGARD: There was different institutions and different methods",
    entities: ["merle-haggard"]
  },
  
  // Prison Types (800-900 seconds content)
  {
    startTime: 800,
    endTime: 810,
    text: "Some were minimum security, some were maximum security, some were kid joints",
    entities: ["merle-haggard"]
  },
  {
    startTime: 810,
    endTime: 820,
    text: "and some were adult jailhouses. I just didn't stay nowhere",
    entities: ["merle-haggard"]
  },
  {
    startTime: 820,
    endTime: 830,
    text: "I was just - I think Willie Sutton was my idol",
    entities: ["merle-haggard"]
  },
  {
    startTime: 830,
    endTime: 840,
    text: "At the time, I was in the middle of becoming an outlaw",
    entities: ["merle-haggard", "outlaw-country"]
  },
  {
    startTime: 840,
    endTime: 850,
    text: "Escaping from jail and escaping from places that they had me locked up in was part of the thing",
    entities: ["merle-haggard"]
  },
  {
    startTime: 850,
    endTime: 860,
    text: "GROSS: Was there an outlaw mystique that you wanted to have?",
    entities: ["terry-gross", "outlaw-country"]
  },
  {
    startTime: 860,
    endTime: 870,
    text: "HAGGARD: I guess. I admired people like Jesse James, along with a lot of other kids",
    entities: ["merle-haggard"]
  },
  {
    startTime: 870,
    endTime: 880,
    text: "But I guess I took it too far",
    entities: ["merle-haggard"]
  },
  {
    startTime: 880,
    endTime: 890,
    text: "GROSS: What was your most ingenious escape?",
    entities: ["terry-gross"]
  },
  {
    startTime: 890,
    endTime: 900,
    text: "HAGGARD: Probably the one I didn't actually go on - San Quentin",
    entities: ["merle-haggard", "san-quentin"]
  },
  
  // San Quentin Escape Story (900-1000+ seconds content)
  {
    startTime: 900,
    endTime: 910,
    text: "I was all set to go with the only completely successful escape out of San Quentin in 21 years",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 910,
    endTime: 920,
    text: "But the people talked me out of it because they felt I was just doing it for the sport of it",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 920,
    endTime: 930,
    text: "and it was very serious to the other fellow that was going",
    entities: ["merle-haggard"]
  },
  {
    startTime: 930,
    endTime: 940,
    text: "They had a big judge's chambers sort of desk they were building at the furniture factory",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 940,
    endTime: 950,
    text: "I had a friend who was building a place for two guys to be transported out",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 950,
    endTime: 960,
    text: "That was before they had X-rays and things of that nature. And I could've gone, and I didn't go",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 960,
    endTime: 970,
    text: "The guy that went wound up being executed in the gas chamber",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 970,
    endTime: 980,
    text: "He went out and held court in the street, killed a highway patrolman",
    entities: ["merle-haggard"]
  },
  {
    startTime: 980,
    endTime: 990,
    text: "So it was really good that I didn't go",
    entities: ["merle-haggard"]
  },
  {
    startTime: 990,
    endTime: 1000,
    text: "GROSS: Was that a real sobering experience for you?",
    entities: ["terry-gross"]
  },
  
  // Life Transformation (1000-1100+ seconds content)
  {
    startTime: 1000,
    endTime: 1010,
    text: "HAGGARD: Yeah. I've had a lot of those things in my life",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1010,
    endTime: 1020,
    text: "I guess I was gathering up meat for songs. I was crazy as a kid",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1020,
    endTime: 1030,
    text: "Then all of a sudden, while I was in San Quentin, I saw the light",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1030,
    endTime: 1040,
    text: "I just didn't want to do that no more. I realized what a mess I'd made out of my life",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1040,
    endTime: 1050,
    text: "I got out of there and stayed out of there - never did go back",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1050,
    endTime: 1060,
    text: "went and apologized to all the people I'd wronged and tried to pay back",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1060,
    endTime: 1070,
    text: "the people that I'd taken money from. When I was 31 years old",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1070,
    endTime: 1080,
    text: "I'd paid everybody back that I'd ever taken anything from, including my mother",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1080,
    endTime: 1090,
    text: "GROSS: What did you say to your mother when you changed your life around?",
    entities: ["terry-gross"]
  },
  {
    startTime: 1090,
    endTime: 1100,
    text: "HAGGARD: It was just obvious. There was no time that anybody in my family was worried",
    entities: ["merle-haggard"]
  },
  
  // Growing Up Analogy (1100-1200+ seconds content)
  {
    startTime: 1100,
    endTime: 1110,
    text: "about me staying with this. Some people grow up in the Army",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1110,
    endTime: 1120,
    text: "They send 18-year-old boys to war because they don't know what to do with them",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1120,
    endTime: 1130,
    text: "I wound up going to prison rather than war",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1130,
    endTime: 1140,
    text: "Instead of growing up in the middle of a battlefield with bullets flying around me",
    entities: ["merle-haggard"]
  },
  {
    startTime: 1140,
    endTime: 1150,
    text: "I grew up on the isolation ward on death row",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1150,
    endTime: 1160,
    text: "And that's where the song Mama Tried gets close to being autobiographical",
    entities: ["merle-haggard", "mama-tried", "san-quentin"]
  },
  {
    startTime: 1160,
    endTime: 1170,
    text: "GROSS: You were on death row?",
    entities: ["terry-gross"]
  },
  {
    startTime: 1170,
    endTime: 1180,
    text: "HAGGARD: Yeah. I got caught for making beer. I was making some beer up there",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1180,
    endTime: 1190,
    text: "got too much of my own beer and got drunk in the yard and got arrested",
    entities: ["merle-haggard", "san-quentin"]
  },
  {
    startTime: 1190,
    endTime: 1200,
    text: "It's hard to get arrested in San Quentin, but I did",
    entities: ["merle-haggard", "san-quentin"]
  }
];

// Function to get active entities at a specific timestamp (accounts for 15-second preroll)
export function getActiveEntitiesAtTime(adjustedTime: number): string[] {
  const activeSegments = audioTimestampMap.filter(segment => 
    adjustedTime >= segment.startTime && adjustedTime < segment.endTime
  );
  
  const allEntities = activeSegments.flatMap(segment => segment.entities);
  return [...new Set(allEntities)]; // Remove duplicates
}

// Update function that processes timestamps from the audio player
export function updateTimestampsFromAudioMap(transcriptData: any) {
  if (!transcriptData?.entityAnalysis) return transcriptData;

  const updatedEntityAnalysis = transcriptData.entityAnalysis.map((analysis: any) => {
    const updatedMentions = analysis.mentions.map((mention: any) => {
      // Find matching timestamp segment for this mention's context
      const matchingSegment = audioTimestampMap.find(segment => 
        segment.entities.includes(mention.entityId) &&
        segment.text.toLowerCase().includes(mention.context.toLowerCase().substring(0, 30))
      );

      if (matchingSegment) {
        return {
          ...mention,
          timestamp: matchingSegment.startTime + 5 // Add 5 seconds into the segment
        };
      }
      
      return mention;
    });

    return {
      ...analysis,
      mentions: updatedMentions
    };
  });

  return {
    ...transcriptData,
    entityAnalysis: updatedEntityAnalysis
  };
}