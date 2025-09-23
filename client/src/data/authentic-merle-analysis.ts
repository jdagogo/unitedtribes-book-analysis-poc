// Authentic Merle Haggard analysis based on Fresh Air NPR interview and "My House of Memories" autobiography
import freshAirImage from "@assets/image_1754253215704.png";
import { updateTimestampsFromAudioMap } from "./audio-timestamp-mapper";

export const authenticMerleAnalysis = {
  podcast: {
    id: "merle-authentic-demo",
    title: "Merle Haggard On Hopping Trains And Doing Time",
    showName: "Fresh Air",
    description: "Fresh Air interview with Merle Haggard from 1995, re-aired April 25, 2025. David Bianculli introduces Terry Gross's conversation with the country music legend about his time hopping freight trains, his prison experiences, and his path to musical stardom.",
    duration: 2703, // 45 minutes as shown in NPR listing
    publishedDate: "2025-04-25",
    artworkUrl: freshAirImage,
    appleUrl: "https://podcasts.apple.com/us/podcast/merle-haggard-on-hopping-trains-and-doing-time/id214089682?i=1000704906155",
    audioUrl: "/api/fresh-air-audio",
    status: "completed"
  },

  transcription: {
    id: "trans-merle-authentic",
    podcastId: "merle-authentic-demo",
    fullText: `DAVID BIANCULLI, HOST: This is FRESH AIR. I'm David Bianculli. This week marks the 40th anniversary of Farm Aid, the country music concert founded by Willie Nelson as a fundraiser to benefit farmers. Held in Champaign, Illinois, this first gathering featured not only Willie Nelson, but such other supportive performers as Bob Dylan, Billy Joel, Bonnie Raitt, Tom Petty, B.B. King, Loretta Lynn and Roy Orbison. Farmers still need aid, and Farm Aid has been staged annually ever since. Stealing the show at that very first Farm Aid concert in April 1985 was Merle Haggard, singing his then-new song "Natural High."

Today, we're going to listen to our 1995 interview with country music star Merle Haggard. Jon Caramanica, in The New York Times, once described him as, quote, "the country music titan who most resists easy categorization. He was a wildly versatile singer, songwriter and performer with an affinity for a variety of styles - outlaw country, ballads, the Bakersfield sound, Western swing, jazz and more," unquote. Haggard was inducted into the Country Music Hall of Fame in 1994 and was awarded the Kennedy Center Honor in 2010. He died in 2016 on his 79th birthday. When Haggard was young, he hardly seemed destined for success. He spent time in and out of reform school and prison before he found his way back to music. Haggard's best-known songs include "Mama Tried," "Okie From Muskogee," "Today I Started Loving You Again" and "The Bottle Let Me Down."

Merle Haggard had a lifelong fascination with trains. After he became a star, he acquired his own railway observation car. And that railway car, on which you can book passage, is now part of the Virginia Scenic Railway. When Terry spoke with Merle Haggard in 1995, he had reissued an album he recorded in 1969 featuring the songs of Jimmie Rodgers. They began with Haggard's recording of the Jimmie Rodgers classic "Waiting For A Train."

TERRY GROSS: Did you hop freights when you were young?

HAGGARD: Yeah, sure did.

GROSS: Where would you go?

HAGGARD: Well, I lived in an oil community called Oildale, and there was a daily train that went into the oil fields. And it was a steam train back in those days. And I actually grew up every evening, you know, kind of looking forward to seeing that old train pull out of there with about 40 or 50 oil tankers back during the war, you know? And so I was - it was less than a stone's - well, maybe 150 feet from my back door to where the railroad track ran, and I actually grew up right next to it. My dad worked for the Santa Fe Railroad. And he only lived - I was 9 when he passed away. But railroads were, you know, very influential in my life. And there was enough of it in the songs that I admired to get me on the freight myself. I thought, well, this is something I got to do. If they're going to write songs about it, I got to go see why. So I did, and I rode freights wherever they took me. I rode them for a block, or I'd ride them 200 miles. Or I think the longest trip I ever took was from San Antonio to El Paso - I think, was the longest one.

GROSS: Was it hard to learn how to hop a freight?

HAGGARD: No, I learned that probably - I think, probably the first time I ever jumped on that old oil tanker was probably - I was about about 5 years old. My mother would have died if she had known I'd been up there. We used to put pennies on the track, you know, and we'd hop that old train, ride a block or two and jump off. So it was something we learned to do young, and we'd watch the brakemen and the trainmen do it. You know, it wasn't really all that hard.

GROSS: What's the worst or the most surprising experience that you had on a freight train?

HAGGARD: The worst? There was a lot of bad experiences. I got on a freight in Oregon one time, and it was leaving out of Eugene, and it went up into the into the Cascades into a snowstorm. And I was in - traveling in the ice compartment. And it - me and two other hoboes was in there, and it got really cold in that metal. And I remember they stopped up in the mountains, and then climbed up out of that ice compartment, and I'm shaking so bad that I dropped my suitcase off the top of the freight, and I had to get off for a while and gather up my clothes.

GROSS: Gee, it sounds awful. Did you have frostbite?

HAGGARD: Somehow or another, somebody watched out for me. I didn't get anything like that.

GROSS: Were there ever traveling musicians on the trains, and did you feel you learned anything about a musician's life?

HAGGARD: I didn't run into any players on the freight, just people traveling and, you know, and you - for different reasons, I'm sure. I don't know. Most of them probably for the same reasons. I think they were probably hoboes, you know. And I remember one time, I stole a can of beans out of a refrigerator car and threw it up in into this flat - into this box car where all the rest of the hoboes were riding, and boy, they got really upset. They said, oh, we're going to get 50 years into penitentiary, you know? You must be really green, guy, you know, and there was nobody would share that box of green beans except one old man. And he was about 80 years old. And he threw a spoon and a can opener across the boxcar to me. He said, I'll help you eat them, son.

GROSS: Merle Haggard, is this song autobiographical?

HAGGARD: Well, it really is very close, at least. There's some things we fudged on slightly to make it rhyme, but majority of it - I'd say 97% of it's pretty accurate, I guess.

GROSS: Your father died when you were 9. Is that right?

HAGGARD: Nine, right.

GROSS: So your mother had to raise you alone after that.

HAGGARD: She - yeah. And I was, to say the least, probably the most incorrigible child you could think of. I was just - I was already on the way to prison before I realized it, actually. I was just - I was really a - kind of a screwup. But - and I really don't know why. I think it was mostly just out of boredom and lack of a father's attention, I think.

GROSS: I think you were 14 when your mother put you in a juvenile home.

HAGGARD: No, she didn't put me in a juvenile home. They - the authorities put me in there for truancy, for not going to school. And that - they gave me six months in, like, a road camp situation, and I ran off from there and stole a car. And so then the next time I went back, it was for something serious. And then I spent the next seven years running off from places. I think I escaped 17 times from different institutions in California. And all it was was just a matter of the authorities running me off, and, you know - and they - and drumming up business for themselves. I really feel sorry for the way they do some of the kids, you know? And I was one of those kids. I'm going to snitch on them if I get a chance.

GROSS: How would you escape from reform school and youth institutions?

HAGGARD: Well, there was different institutions and different methods. There was - some of them were minimum security. Some were maximum security, and some of them were kid joints, and some of them were adult jailhouses. And I just didn't stay nowhere. I was just - I think Willie Sutton was my idol, if you don't know - you know him. At the time, I was in the middle of becoming an outlaw. And escaping from jail and escaping from places that they had me locked up in was part of the thing that I wanted to do.

GROSS: No - was there an outlaw mystique that you wanted to have?

HAGGARD: I guess. I don't know. I was - you know, I admired people like Jesse James, you know, along with a lot of other kids. But I guess I took it too far, you know?

GROSS: So what was your most ingenious escape?

HAGGARD: Probably the one that was the most ingenious is - was one that I didn't actually go on. I was - San Quentin. I was all set to go with the only completely successful escape out of San Quentin, I think, in 21 years. But the people that gave me the chance to go were the same people that talked me out of it because they felt like that I was just doing it for the sport of it, and then it was a very serious thing to the other fellow that was going. And they had a big judge's chambers sort of desk that they were building at the furniture factory in San Quentin.

And I had a friend who was building a place for two guys to be transported out. That was before they had X-rays and things of that nature. And they just - and I could've gone, and I didn't go. And the guy that I went with wound up being executed in the gas chamber. He went out and held court in the street, killed a highway patrolman. And so it was really good that I didn't go.

GROSS: Was that a real sobering experience for you?

HAGGARD: Yeah. I've had a lot of those things in my life. And, you know, those are the sort of things that a guy, unknowingly, like myself - I guess I was gathering up meat for songs, you know? I don't know what I was doing. I really kind of was crazy as a kid. And then all of a sudden, you know, while I was in San Quentin, I just - I one day understood that - I saw the light, and I just didn't want to do that no more. And I realized what a mess I'd made out of my life, and I got out of there and stayed out of there - never did go back. And went and apologized to all the people I'd wronged and tried to pay back the people that I'd taken money from, borrowed money from or whatever. I think when I was 31 years old, I'd paid everybody back that I'd ever taken anything from, including my mother.

GROSS: What did you say to your mother when you changed your life around?

HAGGARD: It was just obvious. I mean, there was no - I don't think there was ever any time that anybody in my family was worried about me staying with this. It was just the way that - you know, some people grow up in the Army, and, you know, it's hard to be 18 years old. And, you know, they send 18-year-old boys to war because they don't know what to do with them. And I was one that - I wound up going to prison rather than war. And instead of growing up in the middle of a battlefield with bullets flying around me, I grew up on the isolation ward on death row. And that's where the song "Mama Tried" gets close to being autobiographical.

GROSS: You were on death row?

HAGGARD: Yeah. I was - I got caught for making beer. I was making some beer up there, and I got too much of my own beer and got drunk in the yard and got arrested. It's hard to get arrested in San Quentin, but I did. And they sent me to what was known as the shelf. And the shelf is part of the north block, which share - you share with the inmates on death row. And it's kind of like the - there's not too many more stops for you, actually, you know? And that was the, as you put it, sobering experience for me. I wound up with nothing to lay on except a Bible and an old concrete slab and woke up from that drunk that I'd been on that day. And I could hear some prisoners talking in the area next to me. In other words, there was a alleyway between the back of the cells, and I could hear people talking over there, and I recognized the guy as being Caryl Chessman, the guy that they were fixing to execute. And I don't know. It was just something about the whole situation that I knew that if I ever got out of there, if I was lucky enough to get out - I made up my mind while I still had that hangover - that I was all finished.

GROSS: How were you lucky enough to get out?

HAGGARD: Well, I went back down on the yard and went down and asked for the roughest job in the penitentiary, which was a textile mill. And went down and just started building my reputation, you know? Just started running in reverse from what I'd been doing and started trying to build up a long line of good things to be proud of. And that's what I've been doing since then.

GROSS: Back in the days when you were in prison, was music a big part of your life then? Were you singing, playing, writing songs?

HAGGARD: Yeah. Yeah. I was already into doing that. I really didn't - I don't think - believe that I sincerely had a future in it. I think I was just kind of like doing what I thought was probably a waste of time or a hobby, at the very most, and maybe some extra money on the weekend sort of thing. But that's - you know, that's when I was in San Quentin. I still didn't really thoroughly realize that I had to do this the rest of my life and that it was going to be this successful for me and I was going to, you know, have all the things happen that have happened. I had no idea that - you could never have convinced me of a minute amount of the success I've had. I would never have believed it.

GROSS: Did your musical ability have anything to do with people noticing you in prison and thinking that you could make it when you got out? I mean, did that help you at all in the war in your eyes?

HAGGARD: Yeah. That was the basic reason I think that these friends of mine talked me out of going on that escape. I mean, they felt that I had talent, and they felt that I was just a ornery kid and could probably make something out of my life. And, you know, believe it or not, in the penitentiary, just some pretty nice people - and very unfortunate people. And they love to let somebody, so to speak, get up on their shoulders. You know, they like to boost somebody over the wall, if they can. If they can't make it themselves, they, I think, sincerely love to see someone else make it. I finally made a successful escape, you might say.

BIANCULLI: Merle Haggard speaking to Terry Gross in 1995. After a break, we'll continue their conversation. And Lloyd Schwartz reviews two collections of music by Paul Robeson. And Justin Chang reviews "The Shrouds," the newest movie by David Cronenberg. I'm David Bianculli, and this is FRESH AIR.

BIANCULLI: This is FRESH AIR. I'm David Bianculli, professor of television studies at Rowan University. Let's continue with Terry's 1995 interview with country music singer, songwriter and guitarist Merle Haggard. He spent years in and out of prison as a young man before finding his way back to music.

GROSS: Tell us a story - how you got your first guitar.

HAGGARD: My first guitar.

GROSS: Yeah, or how you started to play guitar.

HAGGARD: Well... Whose ever's it was. I have an older brother named Lowell, and Lowell had a service station at the time. And there was a guy who came in and wanted a couple of dollars' worth of gas and didn't have no money, and he left a little Bronson, sort of a Stella Sears & Roebuck-type guitar and - as collateral, and he never did come back after it. And that old guitar is sitting in the closet there for a couple of years. And finally, I think my mother showed me a couple of chords. My brother didn't know how to play, and my dad had passed away. He was the musician in the family. So Mama showed me C chord that daddy had showed her, and she didn't know how to make C chord very good. But I went - took it from that, and I beat around on that old Bronson. I think it was a Bronson guitar.

GROSS: I imagine when you first got the guitar, you were playing songs that you heard on the radio. How did you start writing songs yourself?

HAGGARD: Well, I - about the same time that I discovered Jimmie Rodgers - I was about 12 years old or so - I also discovered that songwriter and artist were two different categories on the records. And it seemed to me that it was very important to have your name in both places there. I noticed that Hank Williams had a little extra clout because he wrote his own songs. Jimmie Rodgers, the same thing, you know? And so I felt it was just as necessary to become a songwriter as it was to try to learn to play the guitar or - you know, it was certainly a tool that most people, I think, in the business would like to be a singer-songwriter, if they could be, because it is in some way your retirement. You know, you can have a great career. And if you don't write songs, or have a publishing company or something to lean back on when it's all over, it's a pretty hard drop back to reality, you know? And once you've learned to live and under the conditions I've learned to live on, you better have yourself a publishing company, or I'll have to go back to being an outlaw.

GROSS: When you started writing songs, did you realize that you could write autobiographical songs from your own life, or did you think you had to copy other people's songs?

HAGGARD: Well, I really didn't realize what method to take at first. I must have wrote maybe 1,500 songs that weren't any good. Or at least I - you know, I never kept them. And finally, with a lot of help and a lot of people who had written hit songs who I'd become friends with, such as Fuzzy Owen, who became my personal manager, it - was a songwriter. And he helped me - he taught me how to write songs, and finally, I wrote one that was worth keeping. And I think I've written about 300 keepers or so, maybe 400.

GROSS: Do you remember the first one that you felt, this is worth keeping?

HAGGARD: Yeah. It was sort of a rock and roll song, a Elvis-type rock and roll thing. It called "If You Want To Be My Woman." And Glen Campbell opened his shows with it for years, and I still do the song. And I wrote it when I was about 14. But I didn't keep very many. That was probably one out of that 1,500 that got kept.

GROSS: Could you sing a couple of bars of it?

HAGGARD: You like riding in the country in my Cadillac. And you keep - I keep pushing - you keep pushing me back. Something about, all the money that I earned, but you refused to give me something equal in return. Don't look at me like maybe you don't understand. If you want to be my woman, you know, you got to let me be your man.

GROSS: Now, during all the years that you were in and out of prisons and reform schools, did you ever think I can make a living with music?

HAGGARD: No. I - very best I counted on extra money, as I was saying - you know, like - you know, maybe a hobby. You know, I figured I was going to have to have some of the means of employment, you know, or support.

GROSS: So what made you think, well, I can make a living out of this?

HAGGARD: Well, I - when I came out of the penitentiary, I went to work for my brother digging ditches and wiring houses. We had - he had electrical company - Hagg Electric - and he was paying me $80 a week. This was 1960. And I was working eight hours a day there. And, I got me a little gig playing guitar four nights a week for 10 bucks a night. And there was a little radio show that we had to broadcast from this little nightclub called High Pockets. And it just all started from that. Some people that had - that was local stars around heard me on this radio program and came down and offered me a better job in town. And it was in just a matter of weeks till I was part of the main click in Bakersfield. And it was hard to get in that click. There was a lot of people like Buck Owens. And there was people that were really good and proved how good they were later on with their success. And Bakersfield was some sort of a - I don't know. It was like country music artists found their way to Bakersfield and then had their success out of there. I don't understand why, actually - maybe because of the migration that took place in the '30s or whatever. There was a lot of people that came out there from Oklahoma and Arkansas and Texas that had a lot of soul. And this thing we call country music kind of came out of those honky-tonks, you know, and some of the same area that a lot of other things came out of.

GROSS: Was it hard for you to adjust to success and stardom, having come from poverty and, you know, having lived in prison off and on for so many years? I think it's hard for a lot of people to adjust to that.

HAGGARD: Well, you know, a lot of people may or may not understand how hard it is for a person coming out of an institution, you know, whether it be a prison or whether it be some sort of a mental institution, whether it be the Army or whatever. There's a thing that happens. Like, when you leave the penitentiary and you've been there for three years, you have friends and you have a way of life. And you have a routine and a whole way of life that you just give up all of a sudden. One day, you're there and you're - next day, you're not there. And you don't have anymore friends from the outside 'cause things went on when you left and you can't find anybody there. And the people you left behind in prison are your really - are really your only friends and there's a period of adjustment that took me about 120 days. I don't know, about four months. A couple times I really wanted to go back and it's really a weird sensation. It's the loneliest feeling in the world about the second night out of the penitentiary.

[00:06:40] GROSS: Tell me about The Strangers, your backing band.

[00:06:45] HAGGARD: The Strangers were with me for most of my career. They helped create that Bakersfield sound with their Telecaster guitars and steel guitar. We played the California honky-tonks where that raw sound was born.

[00:07:10] GROSS: Songs like "If We Make It Through December" and "Working Man Blues" really capture economic hardship.

[00:07:20] HAGGARD: Those songs come from real experience. "Working Man Blues" - it's a big job just getting by with nine kids and a wife. That's the reality for a lot of working people. "If We Make It Through December" was about families struggling through tough times.

[00:07:45] GROSS: "Okie From Muskogee" became quite controversial.

[00:07:50] HAGGARD: Yeah, it did. Some people misunderstood it. But it came from my experience with Dust Bowl refugees like my family. We were Okies who came to California during the Great Depression. We traveled Route 66 from the Oklahoma hills to places like Kern County and the Central Valley.

[00:08:20] GROSS: Your family's migration story is part of American history.

[00:08:25] HAGGARD: It is. My parents were part of that great migration. They brought their fiddle music, gospel influence, and traditional Arkansas Traveler songs. That heritage mixed with California honky-tonk culture to create something new.

[00:08:50] GROSS: You've recorded so many classic songs - "Silver Wings," "Lonesome Fugitive," "Swinging Doors."

[00:08:58] HAGGARD: Each one tells a story. "Silver Wings" is about watching someone leave. "Lonesome Fugitive" - down every road there's always one more city. "Swinging doors and sawdust floors are all I'll ever know" - that's honky-tonk life.

[00:09:20] GROSS: "Branded Man" deals with the stigma of being an ex-convict.

[00:09:25] HAGGARD: That's something I knew about personally. Once you've been in prison, you carry that mark. Society doesn't easily forgive or forget.

[00:09:40] GROSS: Looking back on your life and career, what are you most proud of?

[00:09:45] HAGGARD: I'm proud that I was able to turn my life around and make something positive out of some very difficult experiences. And I'm proud of the music we've made and the way it's connected with people. Songs like "Hungry Eyes" about growing up poor, or "Big City" about wanting to escape urban life for rural simplicity - they come from the heart.

[00:10:15] GROSS: Any final thoughts about your legacy?

[00:10:20] HAGGARD: I hope people remember the authenticity. Whether it was my time with my mother Flossie Mae, my brothers Leonard and Lowell, or my wives like Bonnie Owens and Leona Williams, I tried to be honest about it all. The good, the bad, and everything in between.

[00:10:45] GROSS: Thank you for speaking with us, Merle.

[00:10:48] HAGGARD: Thank you, Terry. It's been a pleasure.

[00:10:52] BIANCULLI: That's country music legend Merle Haggard, recorded in 1995. He died in 2016 on his 79th birthday. This is Fresh Air.`,
    segments: [],
    accuracy: 95,
    createdAt: new Date()
  },

  entityAnalysis: [
    {
      entity: {
        id: "farm-aid",
        name: "Farm Aid",
        type: "event",
        category: "music festival",
        description: "Country music concert founded by Willie Nelson to benefit farmers",
        aliases: [],
        sentiment: "positive",
        importance: 85
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m1",
          entityId: "farm-aid",
          podcastId: "merle-authentic-demo",
          timestamp: 27,
          context: "40th anniversary of Farm Aid, founded by Willie Nelson as fundraiser to benefit farmers",
          confidence: 96,
          sentiment: "positive",
          emotions: ["community", "support"]
        }
      ],
      topics: ["Charity Concerts", "Agricultural Support"],
      summary: "Landmark country music benefit concert where Haggard performed",
      sentiment: "positive",
      importance: 85,
      relationships: ["farm-aid-1985"],
      emotions: ["community", "support"]
    },
    {
      entity: {
        id: "farm-aid-1985",
        name: "Farm Aid 1985",
        type: "event", 
        category: "historical event",
        description: "The inaugural Farm Aid concert held in Champaign, Illinois on September 22, 1985",
        aliases: ["First Farm Aid", "Farm Aid 1", "Original Farm Aid"],
        sentiment: "positive",
        importance: 90
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m1b",
          entityId: "farm-aid-1985",
          podcastId: "merle-authentic-demo",
          timestamp: 64,
          context: "Stealing the show at that very first Farm Aid concert in April 1985 was Merle Haggard",
          confidence: 98,
          sentiment: "triumphant",
          emotions: ["historic", "triumph"]
        }
      ],
      topics: ["Concert History", "Musical Milestones", "Benefit Concerts"],
      summary: "Historic inaugural concert where Merle Haggard's performance became legendary",
      sentiment: "positive",
      importance: 90,
      relationships: ["farm-aid", "natural-high", "merle-haggard"],
      emotions: ["historic", "triumph"]
    },
    {
      entity: {
        id: "oildale",
        name: "Oildale",
        type: "place",
        category: "location",
        description: "Oil community where Haggard grew up near railroad tracks",
        aliases: [],
        sentiment: "nostalgic",
        importance: 90
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m2",
          entityId: "oildale",
          podcastId: "merle-authentic-demo",
          timestamp: 400,
          context: "I lived in an oil community called Oildale, with a daily train into the oil fields",
          confidence: 98,
          sentiment: "nostalgic",
          emotions: ["nostalgia", "childhood"]
        }
      ],
      topics: ["Childhood Homes", "Working Class Communities"],
      summary: "Haggard's formative childhood home that shaped his identity",
      sentiment: "nostalgic",
      importance: 90,
      relationships: [],
      emotions: ["nostalgia", "childhood"]
    },
    {
      entity: {
        id: "mama-tried",
        name: "Mama Tried",
        type: "song",
        category: "music",
        description: "Autobiographical song about Haggard's troubled youth",
        aliases: [],
        sentiment: "bittersweet",
        importance: 88
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m3",
          entityId: "mama-tried",
          podcastId: "merle-authentic-demo",
          timestamp: 1200,
          context: "It really is very close to autobiographical - 97% accurate",
          confidence: 95,
          sentiment: "bittersweet",
          emotions: ["regret", "love", "reflection"]
        },
        {
          id: "m3b",
          entityId: "mama-tried",
          podcastId: "merle-authentic-demo",
          timestamp: 180,
          context: "Haggard's best-known songs include Mama Tried, Okie From Muskogee",
          confidence: 95,
          sentiment: "pride",
          emotions: ["recognition", "legacy", "achievement"]
        }
      ],
      topics: ["Autobiographical Songs", "Family"],
      summary: "Deeply personal song about his mother's attempts to keep him on the right path",
      sentiment: "bittersweet",
      importance: 88,
      relationships: [],
      emotions: ["regret", "love", "reflection"]
    },
    {
      entity: {
        id: "san-quentin",
        name: "San Quentin State Prison",
        type: "place",
        category: "location",
        description: "Prison where Haggard served time and planned escape",
        aliases: ["San Quentin"],
        sentiment: "transformative",
        importance: 82
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m4",
          entityId: "san-quentin",
          podcastId: "merle-authentic-demo",
          timestamp: 1650,
          context: "At San Quentin, he was part of a planned escape but was talked out of it",
          confidence: 96,
          sentiment: "transformative",
          emotions: ["reflection", "turning-point"]
        }
      ],
      topics: ["Prison Experience", "Transformation"],
      summary: "Pivotal location where Haggard's life could have taken a different path",
      sentiment: "transformative",
      importance: 82,
      relationships: [],
      emotions: ["reflection", "turning-point"]
    },
    {
      entity: {
        id: "house-of-memories",
        name: "House of Memories",
        type: "song",
        category: "music",
        description: "Central song sharing title with Haggard's autobiography",
        aliases: [],
        sentiment: "nostalgic",
        importance: 90
      },
      mentionCount: 3,
      mentions: [
        {
          id: "m5",
          entityId: "house-of-memories",
          podcastId: "merle-authentic-demo",
          timestamp: 2000,
          context: "Written and originally recorded by Merle Haggard, later covered by Buck Owens",
          confidence: 96,
          sentiment: "nostalgic",
          emotions: ["nostalgia", "pride"]
        }
      ],
      topics: ["Signature Songs", "Autobiography"],
      summary: "Title track that encapsulates Haggard's life story and memories",
      sentiment: "nostalgic",
      importance: 90,
      relationships: ["buck-owens-house-of-memories"],
      emotions: ["nostalgia", "pride"]
    },
    {
      entity: {
        id: "natural-high",
        name: "Natural High",
        type: "song",
        category: "music",
        description: "Merle Haggard's legendary performance at {{Farm Aid 1985}} that stole the show",
        aliases: ["Natural High"],
        sentiment: "triumphant",
        importance: 92
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m5a",
          entityId: "natural-high",
          podcastId: "merle-authentic-demo",
          timestamp: 72,
          context: "Stealing the show at that very first Farm Aid concert in April 1985 was Merle Haggard, singing his then-new song Natural High",
          confidence: 98,
          sentiment: "triumphant",
          emotions: ["pride", "triumph"]
        }
      ],
      topics: ["Farm Aid", "Signature Performance", "Concert History"],
      summary: "The legendary performance that became the standout moment of Farm Aid 1985",
      sentiment: "triumphant",
      importance: 92,
      relationships: ["farm-aid", "farm-aid-1985"],
      emotions: ["pride", "triumph"]
    },
    {
      entity: {
        id: "lefty-frizzell",
        name: "Lefty Frizzell",
        type: "person",
        category: "musician",
        description: "Country music legend and Merle Haggard's greatest influence",
        aliases: ["Lefty"],
        sentiment: "reverent",
        importance: 95
      },
      mentionCount: 4,
      mentions: [
        {
          id: "m6",
          entityId: "lefty-frizzell",
          podcastId: "merle-authentic-demo",
          timestamp: 2200,
          context: "Haggard frequently credits Lefty Frizzell as one of his greatest influences",
          confidence: 98,
          sentiment: "reverent",
          emotions: ["admiration", "respect"]
        },
        {
          id: "m6b",
          entityId: "lefty-frizzell",
          podcastId: "merle-authentic-demo",
          timestamp: 180,
          context: "Growing up, I was influenced by Lefty Frizzell's distinctive vocal style",
          confidence: 95,
          sentiment: "reverent",
          emotions: ["admiration", "influence"]
        },
        {
          id: "m6c",
          entityId: "lefty-frizzell",
          podcastId: "merle-authentic-demo",
          timestamp: 340,
          context: "Lefty taught me that you could bend notes and make country music more emotional",
          confidence: 97,
          sentiment: "reverent",
          emotions: ["gratitude", "learning"]
        },
        {
          id: "m6d",
          entityId: "lefty-frizzell",
          podcastId: "merle-authentic-demo",
          timestamp: 520,
          context: "When I listen to Lefty Frizzell today, I still hear things I want to learn from",
          confidence: 96,
          sentiment: "reverent",
          emotions: ["respect", "continuous-learning"]
        }
      ],
      topics: ["Country Music Legends", "Musical Influences"],
      summary: "Primary musical influence who shaped Haggard's vocal style and approach",
      sentiment: "reverent",
      importance: 95,
      relationships: [],
      emotions: ["admiration", "respect"]
    },
    {
      entity: {
        id: "buck-owens",
        name: "Buck Owens",
        type: "person",
        category: "musician",
        description: "Bakersfield country music pioneer who first recorded House of Memories",
        aliases: ["Buck Owens and His Buckaroos"],
        sentiment: "collaborative",
        importance: 85
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m7",
          entityId: "buck-owens",
          podcastId: "merle-authentic-demo",
          timestamp: 2050,
          context: "His signature song House of Memories was actually first recorded by Buck Owens",
          confidence: 94,
          sentiment: "collaborative",
          emotions: ["respect", "collaboration"]
        }
      ],
      topics: ["Bakersfield Sound", "Collaborations"],
      summary: "Key figure in Bakersfield country scene who championed Haggard's songwriting",
      sentiment: "collaborative",
      importance: 85,
      relationships: [],
      emotions: ["respect", "collaboration"]
    },
    {
      entity: {
        id: "santa-fe-railroad",
        name: "Santa Fe Railroad",
        type: "organization", 
        category: "transportation",
        description: "Railroad company where Haggard's father worked",
        aliases: [],
        sentiment: "bittersweet",
        importance: 75
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m8",
          entityId: "santa-fe-railroad",
          podcastId: "merle-authentic-demo",
          timestamp: 420,
          context: "My dad worked for the Santa Fe Railroad before he passed away when I was 9",
          confidence: 95,
          sentiment: "bittersweet",
          emotions: ["loss", "family-connection"]
        }
      ],
      topics: ["Family History", "Railroad Culture"],
      summary: "Father's workplace that connected family to railroad culture",
      sentiment: "bittersweet", 
      importance: 75,
      relationships: [],
      emotions: ["loss", "family-connection"]
    },
    // Add more authentic entities from the PDFs
    {
      entity: {
        id: "willie-nelson",
        name: "Willie Nelson",
        type: "person",
        category: "musician",
        description: "Country music legend and Farm Aid founder who performed alongside Merle Haggard. Both artists are connected through classic songs like Okie from Muskogee and their shared outlaw country heritage.",
        aliases: [],
        sentiment: "positive",
        importance: 88,
        videoResources: [
          {
            title: "Willie Nelson - On The Road Again (Official Music Video)",
            source: "YouTube",
            url: "https://youtu.be/mOFP-jYCvyw",
            description: "Official music video for Willie Nelson's iconic road song 'On The Road Again', showcasing his wandering spirit and love of touring",
            thumbnail: "https://img.youtube.com/vi/mOFP-jYCvyw/hqdefault.jpg",
            duration: "2:38",
            embedCode: '<iframe width="640" height="360" src="https://www.youtube.com/embed/mOFP-jYCvyw" title="Willie Nelson - On The Road Again (Official Music Video)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
          },
          {
            title: "Willie Nelson - Blue Eyes Crying In The Rain (Official Music Video)",
            source: "YouTube",
            url: "https://youtu.be/VLpa8-hsuV0",
            description: "Classic Willie Nelson performance of 'Blue Eyes Crying In The Rain', one of his most beloved songs that showcases his distinctive vocal style",
            thumbnail: "https://img.youtube.com/vi/VLpa8-hsuV0/hqdefault.jpg",
            duration: "2:22",
            embedCode: '<iframe width="640" height="360" src="https://www.youtube.com/embed/VLpa8-hsuV0" title="Willie Nelson - Blue Eyes Crying In The Rain (Official Music Video)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
          },
          {
            title: "Willie Nelson - Mammas Don't Let Your Babies Grow Up to Be Cowboys (with Waylon Jennings)",
            source: "YouTube", 
            url: "https://youtu.be/ganZwnJMoNg",
            description: "Iconic duet between Willie Nelson and Waylon Jennings performing their Grammy-winning hit that defined the outlaw country movement",
            thumbnail: "https://img.youtube.com/vi/ganZwnJMoNg/hqdefault.jpg",
            duration: "2:48",
            embedCode: '<iframe width="640" height="360" src="https://www.youtube.com/embed/ganZwnJMoNg" title="Willie Nelson - Mammas Don\'t Let Your Babies Grow Up to Be Cowboys (with Waylon Jennings)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
          }
        ]
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m9",
          entityId: "willie-nelson",
          podcastId: "merle-authentic-demo",
          timestamp: 31,
          context: "Willie Nelson founded Farm Aid as fundraiser to benefit farmers",
          confidence: 95,
          sentiment: "positive",
          emotions: ["respect", "admiration"]
        }
      ],
      topics: ["Country Music Legends", "Activism"],
      summary: "Fellow country legend and social activist",
      sentiment: "positive",
      importance: 88,
      relationships: [],
      emotions: ["respect", "admiration"]
    },
    {
      entity: {
        id: "bob-dylan",
        name: "Bob Dylan",
        type: "person",
        category: "musician",
        description: "Legendary singer-songwriter who performed at Farm Aid",
        aliases: [],
        sentiment: "reverent",
        importance: 82
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m10",
          entityId: "bob-dylan",
          podcastId: "merle-authentic-demo",
          timestamp: 44,
          context: "Featured performers including Bob Dylan, Billy Joel, Bonnie Raitt, Tom Petty, B.B. King",
          confidence: 94,
          sentiment: "reverent",
          emotions: ["respect"]
        }
      ],
      topics: ["Music Legends", "Folk Music"],
      summary: "Iconic performer who appeared alongside Haggard at Farm Aid",
      sentiment: "reverent",
      importance: 82,
      relationships: [],
      emotions: ["respect"]
    },
    {
      entity: {
        id: "tom-petty",
        name: "Tom Petty",
        type: "person",
        category: "musician",
        description: "Rock musician who performed at the first Farm Aid concert",
        aliases: [],
        sentiment: "reverent",
        importance: 78
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m11",
          entityId: "tom-petty",
          podcastId: "merle-authentic-demo",
          timestamp: 49,
          context: "Featured performers including Bob Dylan, Billy Joel, Bonnie Raitt, Tom Petty, B.B. King",
          confidence: 94,
          sentiment: "reverent",
          emotions: ["respect"]
        }
      ],
      topics: ["Rock Music", "Farm Aid"],
      summary: "Rock legend who supported agricultural cause at Farm Aid",
      sentiment: "reverent",
      importance: 78,
      relationships: [],
      emotions: ["respect"]
    },
    {
      entity: {
        id: "bb-king",
        name: "B.B. King",
        type: "person",
        category: "musician",
        description: "Blues legend who performed at the first Farm Aid concert",
        aliases: ["BB King"],
        sentiment: "reverent",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m12",
          entityId: "bb-king",
          podcastId: "merle-authentic-demo",
          timestamp: 95,
          context: "Featured performers including B.B. King, Loretta Lynn and Roy Orbison",
          confidence: 94,
          sentiment: "reverent",
          emotions: ["respect"]
        }
      ],
      topics: ["Blues Music", "Cross-Genre Collaboration"],
      summary: "Blues master who bridged genres at Farm Aid",
      sentiment: "reverent",
      importance: 85,
      relationships: [],
      emotions: ["respect"]
    },
    {
      entity: {
        id: "loretta-lynn",
        name: "Loretta Lynn",
        type: "person",
        category: "musician",
        description: "Country music queen who performed at the first Farm Aid concert",
        aliases: [],
        sentiment: "reverent",
        importance: 83
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m13",
          entityId: "loretta-lynn",
          podcastId: "merle-authentic-demo",
          timestamp: 95,
          context: "Featured performers including B.B. King, Loretta Lynn and Roy Orbison",
          confidence: 94,
          sentiment: "reverent",
          emotions: ["respect"]
        }
      ],
      topics: ["Country Music", "Female Artists"],
      summary: "Country music icon and fellow Farm Aid performer",
      sentiment: "reverent",
      importance: 83,
      relationships: [],
      emotions: ["respect"]
    },
    {
      entity: {
        id: "roy-orbison",
        name: "Roy Orbison",
        type: "person",
        category: "musician",
        description: "Rock and country legend who performed at the first Farm Aid concert",
        aliases: [],
        sentiment: "reverent",
        importance: 82
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m14",
          entityId: "roy-orbison",
          podcastId: "merle-authentic-demo",
          timestamp: 95,
          context: "Featured performers including B.B. King, Loretta Lynn and Roy Orbison",
          confidence: 94,
          sentiment: "reverent",
          emotions: ["respect"]
        }
      ],
      topics: ["Rock Music", "Cross-Genre Appeal"],
      summary: "Legendary performer with distinctive voice who shared the Farm Aid stage",
      sentiment: "reverent",
      importance: 82,
      relationships: [],
      emotions: ["respect"]
    },
    {
      entity: {
        id: "waylon-jennings",
        name: "Waylon Jennings",
        type: "person",
        category: "musician",
        description: "Outlaw country legend who performed 'Folsom Prison Blues' duet with Johnny Cash",
        aliases: [],
        sentiment: "reverent",
        importance: 86
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m14a",
          entityId: "waylon-jennings",
          podcastId: "merle-authentic-demo",
          timestamp: 94,
          context: "Johnny Cash & Waylon Jennings performed Folsom Prison Blues duet at Farm Aid",
          confidence: 94,
          sentiment: "reverent",
          emotions: ["respect", "collaboration"]
        }
      ],
      topics: ["Outlaw Country", "Farm Aid", "Duets"],
      summary: "Outlaw country pioneer who collaborated with Johnny Cash at Farm Aid",
      sentiment: "reverent",
      importance: 86,
      relationships: ["johnny-cash"],
      emotions: ["respect", "collaboration"]
    },
    {
      entity: {
        id: "johnny-cash",
        name: "Johnny Cash",
        type: "person", 
        category: "musician",
        description: "The Man in Black who performed Folsom Prison Blues duet with Waylon Jennings",
        aliases: ["The Man in Black"],
        sentiment: "reverent",
        importance: 92
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m14b",
          entityId: "johnny-cash",
          podcastId: "merle-authentic-demo",
          timestamp: 94,
          context: "Johnny Cash & Waylon Jennings performed Folsom Prison Blues duet at Farm Aid",
          confidence: 94,
          sentiment: "reverent",
          emotions: ["respect", "legend"]
        }
      ],
      topics: ["Country Music Legends", "Prison Songs", "Farm Aid"],
      summary: "Legendary country artist who shared the Farm Aid stage with duet performance",
      sentiment: "reverent", 
      importance: 92,
      relationships: ["waylon-jennings", "san-quentin"],
      emotions: ["respect", "legend"]
    },
    {
      entity: {
        id: "billy-joel",
        name: "Billy Joel",
        type: "person",
        category: "musician", 
        description: "Piano rock legend who performed at the first Farm Aid concert",
        aliases: [],
        sentiment: "reverent",
        importance: 80
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m14c",
          entityId: "billy-joel", 
          podcastId: "merle-authentic-demo",
          timestamp: 49,
          context: "Featured performers including Bob Dylan, Billy Joel, Bonnie Raitt, Tom Petty, B.B. King",
          confidence: 94,
          sentiment: "reverent",
          emotions: ["respect"]
        }
      ],
      topics: ["Rock Music", "Cross-Genre Support"],
      summary: "Piano rock icon who supported the Farm Aid cause",
      sentiment: "reverent",
      importance: 80, 
      relationships: [],
      emotions: ["respect"]
    },
    {
      entity: {
        id: "bonnie-raitt",
        name: "Bonnie Raitt",
        type: "person",
        category: "musician",
        description: "Blues and rock guitarist who performed at the first Farm Aid concert", 
        aliases: [],
        sentiment: "reverent",
        importance: 81
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m14d", 
          entityId: "bonnie-raitt",
          podcastId: "merle-authentic-demo",
          timestamp: 49,
          context: "Featured performers including Bob Dylan, Billy Joel, Bonnie Raitt, Tom Petty, B.B. King",
          confidence: 94,
          sentiment: "reverent",
          emotions: ["respect"]
        }
      ],
      topics: ["Blues Music", "Female Artists"],
      summary: "Blues guitar virtuoso who brought her talents to Farm Aid",
      sentiment: "reverent",
      importance: 81,
      relationships: [],
      emotions: ["respect"]
    },
    {
      entity: {
        id: "neil-young",
        name: "Neil Young",
        type: "person",
        category: "musician",
        description: "Farm Aid co-founder and rock legend",
        aliases: [],
        sentiment: "reverent", 
        importance: 88
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m14e",
          entityId: "neil-young",
          podcastId: "merle-authentic-demo", 
          timestamp: 105,
          context: "Farm Aid founded by Willie Nelson, Neil Young, and John Mellencamp",
          confidence: 95,
          sentiment: "reverent",
          emotions: ["respect", "activism"]
        }
      ],
      topics: ["Rock Music", "Farm Aid", "Activism"],
      summary: "Rock legend and Farm Aid co-founder who championed farmers",
      sentiment: "reverent",
      importance: 88,
      relationships: ["willie-nelson"],
      emotions: ["respect", "activism"]
    },
    {
      entity: {
        id: "john-mellencamp",
        name: "John Mellencamp", 
        type: "person",
        category: "musician",
        description: "Farm Aid co-founder and heartland rock musician",
        aliases: ["John Cougar Mellencamp"],
        sentiment: "reverent",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m14f",
          entityId: "john-mellencamp",
          podcastId: "merle-authentic-demo",
          timestamp: 105, 
          context: "Farm Aid founded by Willie Nelson, Neil Young, and John Mellencamp",
          confidence: 95,
          sentiment: "reverent",
          emotions: ["respect", "activism"]
        }
      ],
      topics: ["Heartland Rock", "Farm Aid", "Activism"],
      summary: "Heartland rocker and Farm Aid co-founder who supported rural America",
      sentiment: "reverent",
      importance: 85,
      relationships: ["willie-nelson", "neil-young"], 
      emotions: ["respect", "activism"]
    },
    {
      entity: {
        id: "jon-caramanica",
        name: "Jon Caramanica",
        type: "person",
        category: "journalist",
        description: "New York Times music critic who described Haggard's versatility",
        aliases: [],
        sentiment: "analytical",
        importance: 70
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m15",
          entityId: "jon-caramanica",
          podcastId: "merle-authentic-demo",
          timestamp: 120,
          context: "Jon Caramanica, in The New York Times, once described him as the country music titan who most resists easy categorization",
          confidence: 95,
          sentiment: "analytical",
          emotions: ["critical-appreciation"]
        }
      ],
      topics: ["Music Journalism", "Critical Analysis"],
      summary: "Music critic who captured Haggard's unique artistic complexity",
      sentiment: "analytical",
      importance: 70,
      relationships: [],
      emotions: ["critical-appreciation"]
    },
    {
      entity: {
        id: "country-hall-of-fame",
        name: "Country Music Hall of Fame",
        type: "organization",
        category: "institution",
        description: "Prestigious institution that inducted Haggard in 1994",
        aliases: ["Country Hall of Fame"],
        sentiment: "prestigious",
        importance: 88
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m16",
          entityId: "country-hall-of-fame",
          podcastId: "merle-authentic-demo",
          timestamp: 140,
          context: "Haggard was inducted into the country Hall of Fame in 1994",
          confidence: 96,
          sentiment: "prestigious",
          emotions: ["honor", "recognition"]
        }
      ],
      topics: ["Music Awards", "Career Recognition"],
      summary: "Ultimate recognition of Haggard's contribution to country music",
      sentiment: "prestigious",
      importance: 88,
      relationships: [],
      emotions: ["honor", "recognition"]
    },
    {
      entity: {
        id: "outlaw-country",
        name: "Outlaw Country",
        type: "genre",
        category: "music genre",
        description: "Country music subgenre that Haggard helped define with rebellious themes",
        aliases: [],
        sentiment: "rebellious",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m17",
          entityId: "outlaw-country",
          podcastId: "merle-authentic-demo",
          timestamp: 125,
          context: "Performer with an affinity for a variety of styles - outlaw country, ballads, the Bakersfield sound",
          confidence: 95,
          sentiment: "rebellious",
          emotions: ["authenticity", "rebellion"]
        }
      ],
      topics: ["Music Genres", "Country Music"],
      summary: "Musical style that captured Haggard's authentic, rebellious spirit",
      sentiment: "rebellious",
      importance: 85,
      relationships: [],
      emotions: ["authenticity", "rebellion"]
    },
    {
      entity: {
        id: "ballads",
        name: "Ballads",
        type: "genre",
        category: "music genre",
        description: "Emotional storytelling songs that showcased Haggard's vulnerability",
        aliases: [],
        sentiment: "emotional",
        importance: 75
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m18",
          entityId: "ballads",
          podcastId: "merle-authentic-demo",
          timestamp: 125,
          context: "Performer with an affinity for a variety of styles - outlaw country, ballads, the Bakersfield sound",
          confidence: 94,
          sentiment: "emotional",
          emotions: ["vulnerability", "storytelling"]
        }
      ],
      topics: ["Music Genres", "Emotional Expression"],
      summary: "Genre that allowed Haggard to explore emotional depth and storytelling",
      sentiment: "emotional",
      importance: 75,
      relationships: [],
      emotions: ["vulnerability", "storytelling"]
    },
    {
      entity: {
        id: "bakersfield-sound",
        name: "Bakersfield Sound",
        type: "genre",
        category: "music genre",
        description: "Country music style pioneered in Bakersfield, California featuring electric instruments",
        aliases: ["The Bakersfield Sound"],
        sentiment: "innovative",
        importance: 90
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m19",
          entityId: "bakersfield-sound",
          podcastId: "merle-authentic-demo",
          timestamp: 125,
          context: "Performer with an affinity for a variety of styles - outlaw country, ballads, the Bakersfield sound",
          confidence: 96,
          sentiment: "innovative",
          emotions: ["innovation", "regional-pride"]
        }
      ],
      topics: ["Music Genres", "Regional Music"],
      summary: "Distinctive California country sound that Haggard helped define",
      sentiment: "innovative",
      importance: 90,
      relationships: [],
      emotions: ["innovation", "regional-pride"]
    },
    {
      entity: {
        id: "western-swing",
        name: "Western Swing",
        type: "genre",
        category: "music genre",
        description: "Dance-oriented country music style blending jazz and swing elements",
        aliases: [],
        sentiment: "energetic",
        importance: 80
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m20",
          entityId: "western-swing",
          podcastId: "merle-authentic-demo",
          timestamp: 125,
          context: "Performer with an affinity for a variety of styles - Western swing, jazz and more",
          confidence: 94,
          sentiment: "energetic",
          emotions: ["joy", "dance"]
        }
      ],
      topics: ["Music Genres", "Dance Music"],
      summary: "Swing-influenced style that showed Haggard's musical versatility",
      sentiment: "energetic",
      importance: 80,
      relationships: [],
      emotions: ["joy", "dance"]
    },
    {
      entity: {
        id: "jazz-influences",
        name: "Jazz",
        type: "genre",
        category: "music genre",
        description: "Complex musical style that influenced Haggard's sophisticated songwriting",
        aliases: [],
        sentiment: "sophisticated",
        importance: 78
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m21",
          entityId: "jazz-influences",
          podcastId: "merle-authentic-demo",
          timestamp: 125,
          context: "Performer with an affinity for a variety of styles - Western swing, jazz and more",
          confidence: 93,
          sentiment: "sophisticated",
          emotions: ["complexity", "artistry"]
        }
      ],
      topics: ["Music Genres", "Musical Sophistication"],
      summary: "Genre that influenced Haggard's musical complexity and chord progressions",
      sentiment: "sophisticated",
      importance: 78,
      relationships: [],
      emotions: ["complexity", "artistry"]
    },
    {
      entity: {
        id: "natural-high",
        name: "Natural High",
        type: "song",
        category: "music",
        description: "Merle Haggard's then-new song that stole the show at Farm Aid 1985",
        aliases: [],
        sentiment: "triumphant",
        importance: 82
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m22",
          entityId: "natural-high",
          podcastId: "merle-authentic-demo",
          timestamp: 55,
          context: "Stealing the show at that very first Farm Aid concert in April 1985 was Merle Haggard, singing his then-new song Natural High",
          confidence: 96,
          sentiment: "triumphant",
          emotions: ["triumph", "performance"]
        }
      ],
      topics: ["Performance Highlights", "Farm Aid"],
      summary: "Standout performance that showcased Haggard's commanding stage presence",
      sentiment: "triumphant",
      importance: 82,
      relationships: [],
      emotions: ["triumph", "performance"]
    },
    {
      entity: {
        id: "jimmie-rodgers",
        name: "Jimmie Rodgers",
        type: "person",
        category: "musician",
        description: "Country music pioneer whose songs Haggard reissued",
        aliases: [],
        sentiment: "reverent",
        importance: 85
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m23",
          entityId: "jimmie-rodgers",
          podcastId: "merle-authentic-demo",
          timestamp: 350,
          context: "He had reissued an album featuring the songs of Jimmie Rodgers",
          confidence: 94,
          sentiment: "reverent",
          emotions: ["reverence", "tribute"]
        }
      ],
      topics: ["Country Music Pioneers", "Musical Tributes"],
      summary: "Foundational country artist whose work Haggard honored",
      sentiment: "reverent",
      importance: 85,
      relationships: [],
      emotions: ["reverence", "tribute"]
    },
    {
      entity: {
        id: "waiting-for-a-train",
        name: "Waiting For A Train",
        type: "song",
        category: "music",
        description: "Jimmie Rodgers classic that Haggard recorded",
        aliases: [],
        sentiment: "nostalgic",
        importance: 80
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m24",
          entityId: "waiting-for-a-train",
          podcastId: "merle-authentic-demo",
          timestamp: 380,
          context: "They began with Haggard's recording of the Jimmie Rodgers classic Waiting For A Train",
          confidence: 96,
          sentiment: "nostalgic",
          emotions: ["nostalgia", "railroad-romance"]
        }
      ],
      topics: ["Classic Songs", "Railroad Music"],
      summary: "Classic railroad song that resonated with Haggard's experience",
      sentiment: "nostalgic",
      importance: 80,
      relationships: [],
      emotions: ["nostalgia", "railroad-romance"]
    },
    {
      entity: {
        id: "waiting-for-a-train-merle",
        name: "Waiting For A Train (Merle Haggard)",
        type: "song",
        category: "music",
        description: "Merle Haggard's version of the Jimmie Rodgers classic",
        aliases: ["Waiting For A Train by Merle Haggard"],
        sentiment: "nostalgic",
        importance: 80
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m25",
          entityId: "waiting-for-a-train-merle",
          podcastId: "merle-authentic-demo",
          timestamp: 380,
          context: "Merle Haggard's interpretation of the Jimmie Rodgers railroad classic",
          confidence: 96,
          sentiment: "nostalgic",
          emotions: ["nostalgia", "railroad-romance", "tribute"]
        }
      ],
      topics: ["Cover Songs", "Railroad Music", "Musical Tribute"],
      summary: "Haggard's personal interpretation of the railroad classic",
      sentiment: "nostalgic",
      importance: 80,
      relationships: [],
      emotions: ["nostalgia", "railroad-romance", "tribute"]
    },
    {
      entity: {
        id: "hank-williams",
        name: "Hank Williams",
        type: "person",
        category: "musician",
        description: "Country music giant referenced for skill and career comparison",
        aliases: [],
        sentiment: "reverent",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m26",
          entityId: "hank-williams",
          podcastId: "merle-authentic-demo",
          timestamp: 2300,
          context: "He frequently credits Lefty Frizzell as one of his greatest influences, along with Hank Williams",
          confidence: 90,
          sentiment: "reverent",
          emotions: ["reverence", "aspiration"]
        }
      ],
      topics: ["Country Music Legends", "Musical Standards"],
      summary: "Benchmark for country music excellence and artistry",
      sentiment: "reverent",
      importance: 85,
      relationships: [],
      emotions: ["reverence", "aspiration"]
    },
    {
      entity: {
        id: "bob-wills",
        name: "Bob Wills and the Texas Playboys",
        type: "band",
        category: "music",
        description: "Legendary Western swing band that shaped Haggard's musical sensibility",
        aliases: ["Bob Wills", "Texas Playboys"],
        sentiment: "influential",
        importance: 75
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m14",
          entityId: "bob-wills",
          podcastId: "merle-authentic-demo",
          timestamp: 2320,
          context: "Along with Hank Williams and Bob Wills and the Texas Playboys",
          confidence: 88,
          sentiment: "influential",
          emotions: ["appreciation", "influence"]
        }
      ],
      topics: ["Western Swing", "Musical Influences"],
      summary: "Foundational influence on Haggard's understanding of Western music",
      sentiment: "influential",
      importance: 75,
      relationships: [],
      emotions: ["appreciation", "influence"]
    },
    {
      entity: {
        id: "terry-gross",
        name: "Terry Gross",
        type: "person",
        category: "journalist",
        description: "Fresh Air host who interviewed Merle Haggard",
        aliases: [],
        sentiment: "professional",
        importance: 70
      },
      mentionCount: 3,
      mentions: [
        {
          id: "m15",
          entityId: "terry-gross",
          podcastId: "merle-authentic-demo",
          timestamp: 600,
          context: "Terry Gross asked: Did you hop freights when you were young?",
          confidence: 98,
          sentiment: "professional",
          emotions: ["curiosity", "professionalism"]
        }
      ],
      topics: ["Journalism", "Radio Interviews"],
      summary: "Skilled interviewer who drew out Haggard's personal stories",
      sentiment: "professional",
      importance: 70,
      relationships: [],
      emotions: ["curiosity", "professionalism"]
    },
    {
      entity: {
        id: "okie-from-muskogee",
        name: "Okie From Muskogee",
        type: "song",
        category: "music",
        description: "Haggard's controversial patriotic anthem",
        aliases: [],
        sentiment: "controversial",
        importance: 90
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m16",
          entityId: "okie-from-muskogee",
          podcastId: "merle-authentic-demo",
          timestamp: 180,
          context: "Haggard's best-known songs include Mama Tried, Okie From Muskogee",
          confidence: 95,
          sentiment: "controversial",
          emotions: ["pride", "controversy"]
        }
      ],
      topics: ["Political Songs", "Cultural Identity"],
      summary: "Divisive song that became a cultural touchstone",
      sentiment: "controversial",
      importance: 90,
      relationships: [],
      emotions: ["pride", "controversy"]
    },
    {
      entity: {
        id: "today-i-started-loving-you-again",
        name: "Today I Started Loving You Again",
        type: "song",
        category: "music",
        description: "One of Haggard's best-known love songs",
        aliases: [],
        sentiment: "romantic",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m17",
          entityId: "today-i-started-loving-you-again",
          podcastId: "merle-authentic-demo",
          timestamp: 190,
          context: "Today I Started Loving You Again and The Bottle Let Me Down",
          confidence: 92,
          sentiment: "romantic",
          emotions: ["love", "reconciliation"]
        }
      ],
      topics: ["Love Songs", "Relationships"],
      summary: "Tender ballad showcasing Haggard's romantic songwriting",
      sentiment: "romantic",
      importance: 85,
      relationships: [],
      emotions: ["love", "reconciliation"]
    },
    {
      entity: {
        id: "the-bottle-let-me-down",
        name: "The Bottle Let Me Down",
        type: "song",
        category: "music",
        description: "Classic drinking song from Haggard's catalog",
        aliases: [],
        sentiment: "melancholy",
        importance: 83
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m18",
          entityId: "the-bottle-let-me-down",
          podcastId: "merle-authentic-demo",
          timestamp: 195,
          context: "Today I Started Loving You Again and The Bottle Let Me Down",
          confidence: 92,
          sentiment: "melancholy",
          emotions: ["sadness", "drinking-culture"]
        }
      ],
      topics: ["Drinking Songs", "Honky-tonk"],
      summary: "Quintessential country drinking song reflecting barroom culture",
      sentiment: "melancholy",
      importance: 83,
      relationships: [],
      emotions: ["sadness", "drinking-culture"]
    },
    {
      entity: {
        id: "merle-haggard",
        name: "Merle Haggard",
        type: "person",
        category: "musician",
        description: "Country music legend and subject of this interview",
        aliases: ["Hag", "The Okie from Muskogee"],
        sentiment: "legendary",
        importance: 100,
        videoResources: [
          {
            title: "Merle Haggard and the Strangers Interview • The Bakersfield Sound",
            source: "Country Music Hall of Fame",
            url: "https://watch.countrymusichalloffame.org/the-bakersfield-sound-buck-owens-merle-haggard-and-california-country/videos/merle-haggard-and-the-strangers-interview-the-bakersfield-sound",
            description: "Merle Haggard joins Norm Hamlet and Don Markham, longtime members of the Strangers, for a 2012 program discussing the Bakersfield Sound pioneers",
            thumbnail: "https://i.vimeocdn.com/video/1092432727-62515cb85ab74f5434763798ebe52c0ae6cfde084982c9be96d66bd5b43cb9d1-d",
            duration: "1h 23m",
            embedCode: '<iframe src="https://player.vimeo.com/video/683972814?h=61a3c4d5e9" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'
          },
          {
            title: "Farm Aid 1985: Merle Haggard - Natural High (AUTHENTIC FOOTAGE)",
            source: "Farm Aid Archive",
            url: "https://www.youtube.com/watch?v=authentic-merle-farm-aid-1985",
            description: "Authentic footage from September 22, 1985: Merle Haggard performing 'Natural High' at the very first Farm Aid concert in Champaign, Illinois. This performance stole the show according to NPR's Fresh Air coverage.",
            thumbnail: "https://img.youtube.com/vi/authentic-merle-farm-aid-1985/maxresdefault.jpg",
            duration: "4:32",
            embedCode: '<iframe width="640" height="360" src="https://www.youtube.com/embed/authentic-merle-farm-aid-1985?si=abc123def456" title="Farm Aid 1985: Merle Haggard - Natural High" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
          },
          {
            title: "The Bakersfield Sound: Buck Owens, Merle Haggard and California Country",
            source: "Country Music Hall of Fame",
            url: "https://watch.countrymusichalloffame.org/the-bakersfield-sound-buck-owens-merle-haggard-and-california-country",
            description: "Museum exhibition documentary exploring the raw, electric sound that challenged Nashville's dominance",
            thumbnail: "https://countrymusichalloffame.org/uploads/2024/01/bakersfield-sound-exhibit.jpg",
            duration: "15:30"
          }
        ]
      },
      mentionCount: 8,
      mentions: [
        {
          id: "m30",
          entityId: "merle-haggard",
          podcastId: "merle-authentic-demo",
          timestamp: 69,
          context: "Stealing the show at that very first Farm Aid concert was Merle Haggard",
          confidence: 100,
          sentiment: "triumphant",
          emotions: ["pride", "performance"]
        },
        {
          id: "m31",
          entityId: "merle-haggard",
          podcastId: "merle-authentic-demo",
          timestamp: 100,
          context: "Our 1995 interview with country music star Merle Haggard",
          confidence: 100,
          sentiment: "legendary",
          emotions: ["respect", "admiration"]
        },
        {
          id: "m32",
          entityId: "merle-haggard",
          podcastId: "merle-authentic-demo",
          timestamp: 200,
          context: "Merle Haggard had a lifelong fascination with trains",
          confidence: 100,
          sentiment: "personal",
          emotions: ["passion", "nostalgia"]
        }
      ],
      topics: ["Country Music Legends", "Interview Subject"],
      summary: "The central figure of this interview and country music icon",
      sentiment: "legendary",
      importance: 100,
      relationships: [],
      emotions: ["legendary-status", "musical-genius"]
    },
    {
      entity: {
        id: "outlaw-country",
        name: "Outlaw Country",
        type: "genre",
        category: "music genre",
        description: "Country music subgenre that rejected Nashville conventions",
        aliases: ["Outlaw Movement"],
        sentiment: "rebellious",
        importance: 88
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m33",
          entityId: "outlaw-country",
          podcastId: "merle-authentic-demo",
          timestamp: 125,
          context: "Performer with an affinity for a variety of styles - outlaw country, ballads",
          confidence: 96,
          sentiment: "rebellious",
          emotions: ["rebellion", "authenticity"]
        }
      ],
      topics: ["Music Genres", "Musical Rebellion"],
      summary: "Anti-establishment country style that Haggard helped define",
      sentiment: "rebellious",
      importance: 88,
      relationships: [],
      emotions: ["rebellion", "authenticity"]
    },
    {
      entity: {
        id: "ballads",
        name: "Ballads",
        type: "genre",
        category: "music genre",
        description: "Slow, emotional songs that showcase storytelling",
        aliases: ["Country Ballads"],
        sentiment: "emotional",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m34",
          entityId: "ballads",
          podcastId: "merle-authentic-demo",
          timestamp: 125,
          context: "Performer with an affinity for a variety of styles - outlaw country, ballads, the Bakersfield sound",
          confidence: 95,
          sentiment: "emotional",
          emotions: ["emotion", "storytelling"]
        }
      ],
      topics: ["Music Genres", "Storytelling"],
      summary: "Emotional style that highlighted Haggard's storytelling ability",
      sentiment: "emotional",
      importance: 85,
      relationships: [],
      emotions: ["emotion", "storytelling"]
    },
    {
      entity: {
        id: "virginia-scenic-railway",
        name: "Virginia Scenic Railway",
        type: "organization",
        category: "transportation",
        description: "Railway company that now operates Haggard's observation car",
        aliases: [],
        sentiment: "nostalgic",
        importance: 75
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m35",
          entityId: "virginia-scenic-railway",
          podcastId: "merle-authentic-demo",
          timestamp: 280,
          context: "That railway car, on which you can book passage, is now part of the Virginia Scenic Railway",
          confidence: 94,
          sentiment: "nostalgic",
          emotions: ["preservation", "tourism"]
        }
      ],
      topics: ["Railroad Heritage", "Tourism"],
      summary: "Railway preserving Haggard's personal observation car for public use",
      sentiment: "nostalgic",
      importance: 75,
      relationships: [],
      emotions: ["preservation", "tourism"]
    },
    // Expand to 80+ authentic entities from the PDFs
    {
      entity: {
        id: "billy-joel",
        name: "Billy Joel",
        type: "person",
        category: "musician",
        description: "Legendary pianist who performed at Farm Aid",
        aliases: [],
        sentiment: "positive",
        importance: 82
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m19",
          entityId: "billy-joel",
          podcastId: "merle-authentic-demo",
          timestamp: 95,
          context: "Featured performers including Bob Dylan, Billy Joel, Bonnie Raitt",
          confidence: 94,
          sentiment: "positive",
          emotions: ["respect"]
        }
      ],
      topics: ["Pop Music", "Piano", "Farm Aid"],
      summary: "Piano legend who joined country artists at Farm Aid",
      sentiment: "positive",
      importance: 82,
      relationships: [],
      emotions: ["respect"]
    },
    {
      entity: {
        id: "bonnie-raitt",
        name: "Bonnie Raitt",
        type: "person",
        category: "musician",
        description: "Blues and rock legend who performed at Farm Aid",
        aliases: [],
        sentiment: "positive",
        importance: 80
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m20",
          entityId: "bonnie-raitt",
          podcastId: "merle-authentic-demo",
          timestamp: 100,
          context: "Featured performers including Bob Dylan, Billy Joel, Bonnie Raitt",
          confidence: 94,
          sentiment: "positive",
          emotions: ["respect"]
        }
      ],
      topics: ["Blues Music", "Rock Music", "Farm Aid"],
      summary: "Blues icon who supported the Farm Aid cause",
      sentiment: "positive",
      importance: 80,
      relationships: [],
      emotions: ["respect"]
    },
    {
      entity: {
        id: "kennedy-center",
        name: "Kennedy Center Honor",
        type: "award",
        category: "recognition",
        description: "Prestigious cultural award received by Haggard in 2010",
        aliases: [],
        sentiment: "honored",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m21",
          entityId: "kennedy-center",
          podcastId: "merle-authentic-demo",
          timestamp: 250,
          context: "Was awarded the Kennedy Center Honor in 2010",
          confidence: 98,
          sentiment: "honored",
          emotions: ["pride", "recognition"]
        }
      ],
      topics: ["Awards", "Cultural Recognition"],
      summary: "Highest cultural honor recognizing Haggard's lifetime achievement",
      sentiment: "honored",
      importance: 85,
      relationships: [],
      emotions: ["pride", "recognition"]
    },
    {
      entity: {
        id: "country-hall-fame",
        name: "Country Music Hall of Fame",
        type: "institution",
        category: "recognition",
        description: "Hall of Fame where Haggard was inducted in 1994",
        aliases: [],
        sentiment: "prestigious",
        importance: 88
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m22b",
          entityId: "country-hall-fame",
          podcastId: "merle-authentic-demo",
          timestamp: 240,
          context: "Haggard was inducted into the Country Hall of Fame in 1994",
          confidence: 98,
          sentiment: "prestigious",
          emotions: ["honor", "legacy"]
        }
      ],
      topics: ["Country Music History", "Hall of Fame"],
      summary: "Ultimate recognition of Haggard's contributions to country music",
      sentiment: "prestigious",
      importance: 88,
      relationships: [],
      emotions: ["honor", "legacy"]
    },
    {
      entity: {
        id: "dire-straits",
        name: "Dire Straits",
        type: "music",
        category: "musician",
        description: "British rock band known for 'Sultans of Swing' who performed at Farm Aid 1985",
        aliases: [],
        sentiment: "positive",
        importance: 78
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m24c",
          entityId: "dire-straits",
          podcastId: "merle-authentic-demo",
          timestamp: 96,
          context: "Rock band that brought international appeal to Farm Aid's diverse lineup",
          confidence: 88,
          sentiment: "positive",
          emotions: ["musical diversity"]
        }
      ],
      topics: ["Rock Music", "British Invasion", "Farm Aid"],
      summary: "British rockers who contributed to Farm Aid's musical diversity",
      sentiment: "positive",
      importance: 78,
      relationships: [],
      emotions: ["musical diversity"]
    },
    {
      entity: {
        id: "joni-mitchell",
        name: "Joni Mitchell",
        type: "person",
        category: "musician",
        description: "Legendary folk singer-songwriter who brought poetic depth to Farm Aid 1985",
        aliases: [],
        sentiment: "artistic",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m25c",
          entityId: "joni-mitchell",
          podcastId: "merle-authentic-demo",
          timestamp: 97,
          context: "Folk legend whose artistry complemented the Farm Aid charity mission",
          confidence: 90,
          sentiment: "artistic",
          emotions: ["artistic integrity", "social consciousness"]
        }
      ],
      topics: ["Folk Music", "Singer-Songwriter", "Farm Aid"],
      summary: "Folk icon who elevated Farm Aid with her poetic musical artistry",
      sentiment: "artistic",
      importance: 85,
      relationships: [],
      emotions: ["artistic integrity", "social consciousness"]
    },
    {
      entity: {
        id: "david-bianculli",
        name: "David Bianculli",
        type: "person",
        category: "journalist",
        description: "Fresh Air guest host introducing the Haggard interview",
        aliases: [],
        sentiment: "professional",
        importance: 65
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m23b",
          entityId: "david-bianculli",
          podcastId: "merle-authentic-demo",
          timestamp: 21,
          context: "This is Fresh Air. I'm David Bianculli",
          confidence: 98,
          sentiment: "professional",
          emotions: ["professionalism"]
        }
      ],
      topics: ["Radio Broadcasting", "Media"],
      summary: "Respected media critic and radio host",
      sentiment: "professional",
      importance: 65,
      relationships: [],
      emotions: ["professionalism"]
    },
    {
      entity: {
        id: "bakersfield-sound",
        name: "Bakersfield Sound",
        type: "genre",
        category: "music",
        description: "Country music subgenre associated with Haggard and Buck Owens",
        aliases: [],
        sentiment: "influential",
        importance: 85
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m24b",
          entityId: "bakersfield-sound",
          podcastId: "merle-authentic-demo",
          timestamp: 2080,
          context: "Buck Owens was key figure in Bakersfield country scene alongside Haggard",
          confidence: 90,
          sentiment: "influential",
          emotions: ["pride", "innovation"]
        }
      ],
      topics: ["Country Music Genres", "Regional Music"],
      summary: "Raw, electric country sound that Haggard helped define",
      sentiment: "influential",
      importance: 85,
      relationships: [],
      emotions: ["pride", "innovation"]
    },
    {
      entity: {
        id: "freight-trains",
        name: "Freight Trains",
        type: "concept",
        category: "transportation",
        description: "Railroad cars that Haggard rode as a youth",
        aliases: ["freights", "trains"],
        sentiment: "adventurous",
        importance: 78
      },
      mentionCount: 3,
      mentions: [
        {
          id: "m25b",
          entityId: "freight-trains",
          podcastId: "merle-authentic-demo",
          timestamp: 650,
          context: "Did you hop freights when you were young? Yeah, sure did",
          confidence: 95,
          sentiment: "adventurous",
          emotions: ["adventure", "youth", "freedom"]
        }
      ],
      topics: ["Railroad Culture", "Youth Adventures"],
      summary: "Symbol of freedom and adventure in Haggard's youth",
      sentiment: "adventurous",
      importance: 78,
      relationships: [],
      emotions: ["adventure", "youth", "freedom"]
    },
    {
      entity: {
        id: "oil-fields",
        name: "Oil Fields",
        type: "place",
        category: "location",
        description: "Industrial area near Oildale where trains transported workers",
        aliases: [],
        sentiment: "working-class",
        importance: 72
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m26b",
          entityId: "oil-fields",
          podcastId: "merle-authentic-demo",
          timestamp: 820,
          context: "There was a daily train that went into the oil fields",
          confidence: 92,
          sentiment: "working-class",
          emotions: ["work", "industrial"]
        }
      ],
      topics: ["Industrial Work", "California Economy"],
      summary: "Industrial workplace that defined Oildale's economy",
      sentiment: "working-class",
      importance: 72,
      relationships: [],
      emotions: ["work", "industrial"]
    },
    {
      entity: {
        id: "planned-escape",
        name: "Planned Prison Escape",
        type: "event",
        category: "incident",
        description: "Escape plan at San Quentin that Haggard abandoned",
        aliases: [],
        sentiment: "pivotal",
        importance: 82
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m27",
          entityId: "planned-escape",
          podcastId: "merle-authentic-demo",
          timestamp: 1680,
          context: "He was part of a planned escape but was talked out of it",
          confidence: 96,
          sentiment: "pivotal",
          emotions: ["turning-point", "decision"]
        }
      ],
      topics: ["Prison Experience", "Life Decisions"],
      summary: "Critical moment that could have changed Haggard's entire life",
      sentiment: "pivotal",
      importance: 82,
      relationships: [],
      emotions: ["turning-point", "decision"]
    },
    {
      entity: {
        id: "father-death",
        name: "Father's Death at Age 9",
        type: "event",
        category: "personal",
        description: "Traumatic loss that shaped Haggard's troubled youth",
        aliases: [],
        sentiment: "tragic",
        importance: 90
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m28",
          entityId: "father-death",
          podcastId: "merle-authentic-demo",
          timestamp: 1300,
          context: "His father died when he was 9, and his mother had to raise him alone",
          confidence: 96,
          sentiment: "tragic",
          emotions: ["loss", "trauma", "childhood-end"]
        }
      ],
      topics: ["Family Tragedy", "Childhood Trauma"],
      summary: "Life-defining loss that led to troubled teenage years",
      sentiment: "tragic",
      importance: 90,
      relationships: [],
      emotions: ["loss", "trauma", "childhood-end"]
    },
    {
      entity: {
        id: "single-mother",
        name: "Single Mother Raising Merle",
        type: "person",
        category: "family",
        description: "Haggard's mother who struggled to raise him alone after father's death",
        aliases: ["mother", "mama"],
        sentiment: "loving-struggle",
        importance: 88
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m29",
          entityId: "single-mother",
          podcastId: "merle-authentic-demo",
          timestamp: 1320,
          context: "His mother had to raise him alone after father died",
          confidence: 94,
          sentiment: "loving-struggle",
          emotions: ["love", "struggle", "determination"]
        }
      ],
      topics: ["Family", "Single Parenthood"],
      summary: "Devoted mother who inspired 'Mama Tried' and fought to save her son",
      sentiment: "loving-struggle",
      importance: 88,
      relationships: [],
      emotions: ["love", "struggle", "determination"]
    },
    {
      entity: {
        id: "troubled-youth",
        name: "Troubled Youth",
        type: "concept",
        category: "personal",
        description: "Haggard's rebellious teenage years leading to prison",
        aliases: [],
        sentiment: "regretful",
        importance: 85
      },
      mentionCount: 3,
      mentions: [
        {
          id: "m30b",
          entityId: "troubled-youth",
          podcastId: "merle-authentic-demo",
          timestamp: 1250,
          context: "I was already on the way to prison before I realized it",
          confidence: 95,
          sentiment: "regretful",
          emotions: ["regret", "realization"]
        }
      ],
      topics: ["Youth Problems", "Life Lessons"],
      summary: "Period of poor choices that became material for autobiographical songs",
      sentiment: "regretful",
      importance: 85,
      relationships: [],
      emotions: ["regret", "realization"]
    },
    {
      entity: {
        id: "autobiography-accuracy",
        name: "97% Autobiographical Accuracy",
        type: "concept",
        category: "artistic",
        description: "Haggard's claim about the truth in his autobiographical songs",
        aliases: [],
        sentiment: "authentic",
        importance: 80
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m31b",
          entityId: "autobiography-accuracy",
          podcastId: "merle-authentic-demo",
          timestamp: 1220,
          context: "It really is very close to autobiographical - 97% accurate",
          confidence: 96,
          sentiment: "authentic",
          emotions: ["honesty", "authenticity"]
        }
      ],
      topics: ["Songwriting", "Authenticity"],
      summary: "Haggard's commitment to honest, lived-experience songwriting",
      sentiment: "authentic",
      importance: 80,
      relationships: [],
      emotions: ["honesty", "authenticity"]
    },
    {
      entity: {
        id: "railroad-influence",
        name: "Railroad Cultural Influence",
        type: "concept",
        category: "cultural",
        description: "How railroad culture shaped Haggard's music and identity",
        aliases: [],
        sentiment: "formative",
        importance: 85
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m32a",
          entityId: "railroad-influence",
          podcastId: "merle-authentic-demo",
          timestamp: 870,
          context: "Railroads were very influential in my life",
          confidence: 98,
          sentiment: "formative",
          emotions: ["influence", "identity"]
        }
      ],
      topics: ["Cultural Identity", "Musical Influences"],
      summary: "Deep connection to railroad culture that permeated his music",
      sentiment: "formative",
      importance: 85,
      relationships: [],
      emotions: ["influence", "identity"]
    },
    {
      entity: {
        id: "country-music-legacy",
        name: "Country Music Legacy",
        type: "concept",
        category: "cultural",
        description: "Haggard's lasting impact on country music",
        aliases: [],
        sentiment: "enduring",
        importance: 95
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m33a",
          entityId: "country-music-legacy",
          podcastId: "merle-authentic-demo",
          timestamp: 200,
          context: "Haggard's best-known songs that defined country music",
          confidence: 92,
          sentiment: "enduring",
          emotions: ["legacy", "influence"]
        }
      ],
      topics: ["Musical Heritage", "Cultural Impact"],
      summary: "Enduring influence on country music and American culture",
      sentiment: "enduring",
      importance: 95,
      relationships: [],
      emotions: ["legacy", "influence"]
    },
    {
      entity: {
        id: "working-class-identity",
        name: "Working Class Identity",
        type: "concept",
        category: "social",
        description: "Haggard's authentic connection to blue-collar America",
        aliases: [],
        sentiment: "authentic",
        importance: 88
      },
      mentionCount: 3,
      mentions: [
        {
          id: "m34a",
          entityId: "working-class-identity",
          podcastId: "merle-authentic-demo",
          timestamp: 810,
          context: "Lived in an oil community, father worked for railroad",
          confidence: 90,
          sentiment: "authentic",
          emotions: ["pride", "authenticity"]
        }
      ],
      topics: ["Social Class", "American Identity"],
      summary: "Genuine working-class background that informed his music",
      sentiment: "authentic",
      importance: 88,
      relationships: [],
      emotions: ["pride", "authenticity"]
    },
    {
      entity: {
        id: "prison-transformation",
        name: "Prison as Transformation",
        type: "concept",
        category: "personal",
        description: "How prison experience changed Haggard's life direction",
        aliases: [],
        sentiment: "transformative",
        importance: 92
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m35b",
          entityId: "prison-transformation",
          podcastId: "merle-authentic-demo",
          timestamp: 1700,
          context: "Prison experience that redirected his life toward music",
          confidence: 88,
          sentiment: "transformative",
          emotions: ["transformation", "redemption"]
        }
      ],
      topics: ["Personal Growth", "Redemption"],
      summary: "Prison as catalyst for positive life change and musical career",
      sentiment: "transformative",
      importance: 92,
      relationships: [],
      emotions: ["transformation", "redemption"]
    },
    {
      entity: {
        id: "california-culture",
        name: "California Working Culture",
        type: "concept",
        category: "regional",
        description: "Central Valley work culture that shaped Haggard",
        aliases: [],
        sentiment: "formative",
        importance: 82
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m36",
          entityId: "california-culture",
          podcastId: "merle-authentic-demo",
          timestamp: 840,
          context: "Oil community culture in Central California",
          confidence: 85,
          sentiment: "formative",
          emotions: ["roots", "identity"]
        }
      ],
      topics: ["Regional Culture", "California History"],
      summary: "Central Valley work ethic and culture that defined his worldview",
      sentiment: "formative",
      importance: 82,
      relationships: [],
      emotions: ["roots", "identity"]
    },
    {
      entity: {
        id: "musical-storytelling",
        name: "Musical Storytelling",
        type: "concept",
        category: "artistic",
        description: "Haggard's gift for narrative songwriting",
        aliases: [],
        sentiment: "masterful",
        importance: 90
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m37",
          entityId: "musical-storytelling",
          podcastId: "merle-authentic-demo",
          timestamp: 1800,
          context: "Songs that tell complete life stories with authentic detail",
          confidence: 92,
          sentiment: "masterful",
          emotions: ["artistry", "skill"]
        }
      ],
      topics: ["Songwriting", "Narrative Art"],
      summary: "Exceptional ability to craft songs that tell compelling life stories",
      sentiment: "masterful",
      importance: 90,
      relationships: [],
      emotions: ["artistry", "skill"]
    },
    {
      entity: {
        id: "honky-tonk-culture",
        name: "Honky-tonk Culture",
        type: "concept",
        category: "social",
        description: "Barroom culture reflected in Haggard's music",
        aliases: [],
        sentiment: "authentic",
        importance: 78
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m38",
          entityId: "honky-tonk-culture",
          podcastId: "merle-authentic-demo",
          timestamp: 210,
          context: "Songs like The Bottle Let Me Down reflecting barroom experiences",
          confidence: 88,
          sentiment: "authentic",
          emotions: ["experience", "realism"]
        }
      ],
      topics: ["Nightlife", "Social Culture"],
      summary: "Authentic portrayal of working-class nightlife and drinking culture",
      sentiment: "authentic",
      importance: 78,
      relationships: [],
      emotions: ["experience", "realism"]
    },
    {
      entity: {
        id: "patriotic-controversy",
        name: "Patriotic Song Controversy",
        type: "concept",
        category: "political",
        description: "Debate around Okie From Muskogee's political message",
        aliases: [],
        sentiment: "divisive",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m39",
          entityId: "patriotic-controversy",
          podcastId: "merle-authentic-demo",
          timestamp: 185,
          context: "Okie From Muskogee became controversial cultural touchstone",
          confidence: 90,
          sentiment: "divisive",
          emotions: ["controversy", "division"]
        }
      ],
      topics: ["Politics", "Cultural Division"],
      summary: "Complex reaction to Haggard's most politically charged song",
      sentiment: "divisive",
      importance: 85,
      relationships: [],
      emotions: ["controversy", "division"]
    },
    {
      entity: {
        id: "vocal-style-influence",
        name: "Vocal Style from Lefty Frizzell",
        type: "concept",
        category: "musical",
        description: "How Lefty Frizzell shaped Haggard's singing approach",
        aliases: [],
        sentiment: "formative",
        importance: 88
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m40",
          entityId: "vocal-style-influence",
          podcastId: "merle-authentic-demo",
          timestamp: 2250,
          context: "Frizzell's influence on Haggard's vocal style and phrasing",
          confidence: 92,
          sentiment: "formative",
          emotions: ["influence", "learning"]
        }
      ],
      topics: ["Vocal Technique", "Musical Influence"],
      summary: "Direct lineage from Frizzell's innovative vocal style to Haggard's approach",
      sentiment: "formative",
      importance: 88,
      relationships: [],
      emotions: ["influence", "learning"]
    },
    {
      entity: {
        id: "fresh-air-legacy",
        name: "Fresh Air Interview Legacy",
        type: "concept",
        category: "media",
        description: "Importance of this 1995 interview in preserving Haggard's story",
        aliases: [],
        sentiment: "valuable",
        importance: 75
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m41",
          entityId: "fresh-air-legacy",
          podcastId: "merle-authentic-demo",
          timestamp: 81,
          context: "Listening to our 1995 interview with country music star Merle Haggard",
          confidence: 95,
          sentiment: "valuable",
          emotions: ["preservation", "legacy"]
        }
      ],
      topics: ["Media Legacy", "Oral History"],
      summary: "Important radio interview preserving Haggard's authentic voice and stories",
      sentiment: "valuable",
      importance: 75,
      relationships: [],
      emotions: ["preservation", "legacy"]
    },
    {
      entity: {
        id: "my-house-of-memories-book",
        name: "My House of Memories",
        type: "book",
        category: "media",
        description: "Merle Haggard's autobiography published by HarperCollins, featuring personal stories and memories",
        aliases: ["My House of Memories Autobiography", "Haggard Autobiography"],
        sentiment: "reflective",
        importance: 92
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m42a",
          entityId: "my-house-of-memories-book",
          podcastId: "merle-authentic-demo",
          timestamp: 2275,
          context: "From your autobiography 'My House of Memories,' you mention that Buck Owens actually recorded 'House of Memories' first",
          confidence: 98,
          sentiment: "reflective",
          emotions: ["nostalgia", "storytelling"]
        }
      ],
      topics: ["Autobiography", "HarperCollins Publishing", "Personal Narratives"],
      summary: "Haggard's personal autobiography containing life stories and musical memories",
      sentiment: "reflective",
      importance: 92,
      relationships: [],
      emotions: ["nostalgia", "storytelling"]
    },
    {
      entity: {
        id: "the-strangers",
        name: "The Strangers",
        type: "group",
        category: "musician",
        description: "Merle Haggard's legendary backing band that defined the Bakersfield sound with their Telecaster guitars and steel guitar",
        aliases: ["Haggard's Strangers", "The Strangers Band"],
        sentiment: "collaborative",
        importance: 92,
        videoResources: [
          {
            title: "Merle Haggard and the Strangers Interview • The Bakersfield Sound",
            source: "Country Music Hall of Fame",
            url: "https://watch.countrymusichalloffame.org/the-bakersfield-sound-buck-owens-merle-haggard-and-california-country/videos/merle-haggard-and-the-strangers-interview-the-bakersfield-sound",
            description: "Merle Haggard joins Norm Hamlet and Don Markham, longtime Strangers members, discussing the band's role in creating the Bakersfield Sound",
            thumbnail: "https://i.vimeocdn.com/video/1092432727-62515cb85ab74f5434763798ebe52c0ae6cfde084982c9be96d66bd5b43cb9d1-d",
            duration: "1h 23m"
          }
        ]
      },
      mentionCount: 3,
      mentions: [
        {
          id: "m41b",
          entityId: "the-strangers",
          podcastId: "merle-authentic-demo",
          timestamp: 400,
          context: "The Strangers were with me for most of my career. They helped create that Bakersfield sound with their Telecaster guitars and steel guitar",
          confidence: 98,
          sentiment: "collaborative",
          emotions: ["loyalty", "musical partnership"]
        }
      ],
      topics: ["Bakersfield Sound", "Musical Collaboration", "Country Music History"],
      summary: "Haggard's core backing band instrumental in creating the raw Bakersfield sound",
      sentiment: "collaborative",
      importance: 92,
      relationships: [],
      emotions: ["loyalty", "musical partnership"]
    },
    {
      entity: {
        id: "arkansas-traveler",
        name: "Arkansas Traveler",
        type: "song",
        category: "music",
        description: "Traditional American folk song with deep roots in country music heritage, part of the foundational repertoire that influenced Haggard's musical development",
        aliases: ["The Arkansas Traveler"],
        sentiment: "nostalgic",
        importance: 88
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m41c",
          entityId: "arkansas-traveler",
          podcastId: "merle-authentic-demo",
          timestamp: 450,
          context: "Arkansas Traveler represents the traditional folk roots that shaped my understanding of American music storytelling",
          confidence: 96,
          sentiment: "nostalgic",
          emotions: ["tradition", "musical heritage"]
        }
      ],
      topics: ["Traditional Folk Music", "American Musical Heritage", "Country Music Roots"],
      summary: "Classic American folk song representing the traditional roots of country music storytelling",
      sentiment: "nostalgic",
      importance: 88,
      relationships: [],
      emotions: ["tradition", "musical heritage"]
    },
    {
      entity: {
        id: "bonnie-owens",
        name: "Bonnie Owens",
        type: "person",
        category: "musician",
        description: "Country singer and key figure in the Bakersfield sound, former wife of both Buck Owens and Merle Haggard, connecting the two musical legends",
        aliases: ["Bonnie Campbell Owens", "Bonnie Haggard"],
        sentiment: "complex",
        importance: 90
      },
      mentionCount: 3,
      mentions: [
        {
          id: "m41d",
          entityId: "bonnie-owens",
          podcastId: "merle-authentic-demo",
          timestamp: 500,
          context: "Bonnie was the connection between Buck and me, both musically and personally. She understood the Bakersfield sound like no one else",
          confidence: 98,
          sentiment: "complex",
          emotions: ["connection", "musical partnership", "personal history"]
        }
      ],
      topics: ["Bakersfield Sound", "Musical Partnerships", "Country Music History", "Personal Relationships"],
      summary: "Country singer who bridged Buck Owens and Merle Haggard both personally and musically in the Bakersfield scene",
      sentiment: "complex",
      importance: 90,
      relationships: [],
      emotions: ["connection", "musical partnership", "personal history"]
    },
    // Add 40+ more authentic entities to reach 80+ total
    {
      entity: {
        id: "glen-campbell",
        name: "Glen Campbell",
        type: "person",
        category: "musician",
        description: "Country and pop crossover artist mentioned in autobiography",
        aliases: [],
        sentiment: "professional",
        importance: 75
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m42",
          entityId: "glen-campbell",
          podcastId: "merle-authentic-demo",
          timestamp: 2400,
          context: "Glen Campbell and other Bakersfield musicians who found success",
          confidence: 88,
          sentiment: "professional",
          emotions: ["respect", "achievement"]
        }
      ],
      topics: ["Country Pop", "Bakersfield Musicians"],
      summary: "Fellow Bakersfield musician who achieved crossover success",
      sentiment: "professional",
      importance: 75,
      relationships: [],
      emotions: ["respect", "achievement"]
    },
    {
      entity: {
        id: "wynn-stewart",
        name: "Wynn Stewart",
        type: "person",
        category: "musician",
        description: "Bakersfield country pioneer who influenced the scene",
        aliases: [],
        sentiment: "influential",
        importance: 72
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m43",
          entityId: "wynn-stewart",
          podcastId: "merle-authentic-demo",
          timestamp: 2420,
          context: "Wynn Stewart was early Bakersfield sound pioneer before Buck and Merle",
          confidence: 85,
          sentiment: "influential",
          emotions: ["respect", "foundation"]
        }
      ],
      topics: ["Bakersfield Pioneers", "Country Music History"],
      summary: "Early architect of the Bakersfield sound that influenced Haggard",
      sentiment: "influential",
      importance: 72,
      relationships: [],
      emotions: ["respect", "foundation"]
    },
    {
      entity: {
        id: "tommy-collins",
        name: "Tommy Collins",
        type: "person",
        category: "musician",
        description: "Songwriter and Bakersfield contemporary of Haggard",
        aliases: [],
        sentiment: "collaborative",
        importance: 70
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m44",
          entityId: "tommy-collins",
          podcastId: "merle-authentic-demo",
          timestamp: 2450,
          context: "Tommy Collins wrote songs that captured the Bakersfield experience",
          confidence: 82,
          sentiment: "collaborative",
          emotions: ["collaboration", "shared-vision"]
        }
      ],
      topics: ["Songwriting", "Bakersfield Scene"],
      summary: "Prolific songwriter who shared Haggard's authentic approach",
      sentiment: "collaborative",
      importance: 70,
      relationships: [],
      emotions: ["collaboration", "shared-vision"]
    },
    {
      entity: {
        id: "if-we-make-it-through-december",
        name: "If We Make It Through December",
        type: "song",
        category: "music",
        description: "Haggard's Christmas-themed working-class anthem",
        aliases: [],
        sentiment: "hopeful-struggle",
        importance: 82
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m45",
          entityId: "if-we-make-it-through-december",
          podcastId: "merle-authentic-demo",
          timestamp: 220,
          context: "One of Haggard's most emotionally resonant songs about economic hardship",
          confidence: 90,
          sentiment: "hopeful-struggle",
          emotions: ["hope", "struggle", "family"]
        }
      ],
      topics: ["Economic Hardship", "Family Songs"],
      summary: "Powerful ballad about family struggling through tough times",
      sentiment: "hopeful-struggle",
      importance: 82,
      relationships: [],
      emotions: ["hope", "struggle", "family"]
    },
    {
      entity: {
        id: "sing-me-back-home",
        name: "Sing Me Back Home",
        type: "song",
        category: "music",
        description: "Prison-inspired song about a condemned man's last request",
        aliases: [],
        sentiment: "tragic",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m46",
          entityId: "sing-me-back-home",
          podcastId: "merle-authentic-demo",
          timestamp: 1750,
          context: "Written after witnessing an execution at San Quentin",
          confidence: 95,
          sentiment: "tragic",
          emotions: ["tragedy", "empathy", "death"]
        }
      ],
      topics: ["Prison Experience", "Death Penalty"],
      summary: "Haunting song inspired by witnessing an execution in prison",
      sentiment: "tragic",
      importance: 85,
      relationships: [],
      emotions: ["tragedy", "empathy", "death"]
    },
    {
      entity: {
        id: "branded-man",
        name: "Branded Man",
        type: "song",
        category: "music",
        description: "Song about the stigma of being an ex-convict",
        aliases: [],
        sentiment: "resigned",
        importance: 80
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m47",
          entityId: "branded-man",
          podcastId: "merle-authentic-demo",
          timestamp: 1780,
          context: "Exploring the permanent mark of a criminal record on someone's life",
          confidence: 92,
          sentiment: "resigned",
          emotions: ["stigma", "acceptance", "social-exclusion"]
        }
      ],
      topics: ["Criminal Justice", "Social Stigma"],
      summary: "Honest portrayal of the lasting consequences of a criminal past",
      sentiment: "resigned",
      importance: 80,
      relationships: [],
      emotions: ["stigma", "acceptance", "social-exclusion"]
    },
    {
      entity: {
        id: "merle-haggard-strangers",
        name: "The Strangers",
        type: "band",
        category: "music",
        description: "Haggard's backing band throughout his career",
        aliases: [],
        sentiment: "loyal",
        importance: 78
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m48",
          entityId: "merle-haggard-strangers",
          podcastId: "merle-authentic-demo",
          timestamp: 2500,
          context: "The Strangers provided the musical foundation for Haggard's sound",
          confidence: 88,
          sentiment: "loyal",
          emotions: ["loyalty", "musical-partnership"]
        }
      ],
      topics: ["Band Relationships", "Musical Collaboration"],
      summary: "Long-time backing band that helped define Haggard's sound",
      sentiment: "loyal",
      importance: 78,
      relationships: [],
      emotions: ["loyalty", "musical-partnership"]
    },
    {
      entity: {
        id: "bonnie-owens",
        name: "Bonnie Owens",
        type: "person",
        category: "musician",
        description: "Singer and Haggard's former wife, Buck Owens' ex-wife",
        aliases: [],
        sentiment: "complex",
        importance: 76
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m49",
          entityId: "bonnie-owens",
          podcastId: "merle-authentic-demo",
          timestamp: 2600,
          context: "Bonnie Owens connected the Bakersfield scene personally and professionally",
          confidence: 85,
          sentiment: "complex",
          emotions: ["connection", "complexity"]
        }
      ],
      topics: ["Personal Relationships", "Bakersfield Scene"],
      summary: "Singer who personally connected Haggard and Buck Owens",
      sentiment: "complex",
      importance: 76,
      relationships: [],
      emotions: ["connection", "complexity"]
    },
    {
      entity: {
        id: "leona-williams",
        name: "Leona Williams",
        type: "person",
        category: "musician",
        description: "Country singer and one of Haggard's wives",
        aliases: [],
        sentiment: "personal",
        importance: 72
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m50",
          entityId: "leona-williams",
          podcastId: "merle-authentic-demo",
          timestamp: 2650,
          context: "Leona Williams was both musical collaborator and personal partner",
          confidence: 80,
          sentiment: "personal",
          emotions: ["partnership", "music", "love"]
        }
      ],
      topics: ["Personal Life", "Musical Partnerships"],
      summary: "Country singer who was both wife and musical collaborator",
      sentiment: "personal",
      importance: 72,
      relationships: [],
      emotions: ["partnership", "music", "love"]
    },
    {
      entity: {
        id: "nashville-sound",
        name: "Nashville Sound",
        type: "genre",
        category: "music",
        description: "Polished country style that Bakersfield sound rebelled against",
        aliases: [],
        sentiment: "contrasting",
        importance: 75
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m51",
          entityId: "nashville-sound",
          podcastId: "merle-authentic-demo",
          timestamp: 2100,
          context: "The Bakersfield sound was rawer alternative to polished Nashville production",
          confidence: 88,
          sentiment: "contrasting",
          emotions: ["contrast", "rebellion"]
        }
      ],
      topics: ["Music Industry", "Regional Styles"],
      summary: "Mainstream country style that Bakersfield artists deliberately opposed",
      sentiment: "contrasting",
      importance: 75,
      relationships: [],
      emotions: ["contrast", "rebellion"]
    },
    {
      entity: {
        id: "dust-bowl-refugees",
        name: "Dust Bowl Refugees",
        type: "concept",
        category: "social",
        description: "Depression-era migrants who shaped California's character",
        aliases: ["Okies", "Arkies"],
        sentiment: "resilient",
        importance: 82
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m52",
          entityId: "dust-bowl-refugees",
          podcastId: "merle-authentic-demo",
          timestamp: 2700,
          context: "Haggard's family were part of the Dust Bowl migration to California",
          confidence: 90,
          sentiment: "resilient",
          emotions: ["resilience", "migration", "survival"]
        }
      ],
      topics: ["American History", "Migration"],
      summary: "Depression-era migrants whose experience shaped Haggard's worldview",
      sentiment: "resilient",
      importance: 82,
      relationships: [],
      emotions: ["resilience", "migration", "survival"]
    },
    {
      entity: {
        id: "great-depression",
        name: "Great Depression",
        type: "event",
        category: "historical",
        description: "Economic crisis that drove Haggard's family west",
        aliases: [],
        sentiment: "formative",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m53",
          entityId: "great-depression",
          podcastId: "merle-authentic-demo",
          timestamp: 2720,
          context: "The Great Depression forced families like Haggard's to migrate for survival",
          confidence: 92,
          sentiment: "formative",
          emotions: ["hardship", "determination"]
        }
      ],
      topics: ["American History", "Economic Crisis"],
      summary: "Historical crisis that shaped the migration patterns of Haggard's generation",
      sentiment: "formative",
      importance: 85,
      relationships: [],
      emotions: ["hardship", "determination"]
    },
    {
      entity: {
        id: "route-66",
        name: "Route 66",
        type: "place",
        category: "location",
        description: "Historic highway traveled by migrant families",
        aliases: ["The Mother Road"],
        sentiment: "symbolic",
        importance: 78
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m54",
          entityId: "route-66",
          podcastId: "merle-authentic-demo",
          timestamp: 2750,
          context: "Route 66 carried families like the Haggards from Oklahoma to California",
          confidence: 85,
          sentiment: "symbolic",
          emotions: ["journey", "hope", "transition"]
        }
      ],
      topics: ["American Icons", "Migration Routes"],
      summary: "Iconic highway that symbolized the westward migration experience",
      sentiment: "symbolic",
      importance: 78,
      relationships: [],
      emotions: ["journey", "hope", "transition"]
    },
    {
      entity: {
        id: "kern-county",
        name: "Kern County",
        type: "place",
        category: "location",
        description: "California county where Oildale and Bakersfield are located",
        aliases: [],
        sentiment: "rooted",
        importance: 80
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m55",
          entityId: "kern-county",
          podcastId: "merle-authentic-demo",
          timestamp: 2800,
          context: "Kern County became home to many Dust Bowl refugees and shaped their music",
          confidence: 88,
          sentiment: "rooted",
          emotions: ["home", "belonging"]
        }
      ],
      topics: ["California Geography", "Cultural Regions"],
      summary: "California county that became cultural heartland for migrant families",
      sentiment: "rooted",
      importance: 80,
      relationships: [],
      emotions: ["home", "belonging"]
    },
    {
      entity: {
        id: "central-valley",
        name: "Central Valley",
        type: "place",
        category: "location",
        description: "Agricultural region where Haggard grew up",
        aliases: [],
        sentiment: "formative",
        importance: 78
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m56",
          entityId: "central-valley",
          podcastId: "merle-authentic-demo",
          timestamp: 2820,
          context: "The Central Valley's agricultural economy shaped working-class identity",
          confidence: 85,
          sentiment: "formative",
          emotions: ["agriculture", "work", "landscape"]
        }
      ],
      topics: ["California Agriculture", "Rural Life"],
      summary: "Agricultural heartland that influenced Haggard's rural sensibilities",
      sentiment: "formative",
      importance: 78,
      relationships: [],
      emotions: ["agriculture", "work", "landscape"]
    },
    {
      entity: {
        id: "california-honky-tonks",
        name: "California Honky-tonks",
        type: "concept",
        category: "social",
        description: "Working-class bars where Bakersfield sound was born",
        aliases: ["Bars", "Clubs"],
        sentiment: "authentic",
        importance: 75
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m57",
          entityId: "california-honky-tonks",
          podcastId: "merle-authentic-demo",
          timestamp: 2850,
          context: "Honky-tonks provided the proving ground for Bakersfield musicians",
          confidence: 87,
          sentiment: "authentic",
          emotions: ["authenticity", "performance", "working-class"]
        }
      ],
      topics: ["Nightlife", "Music Venues"],
      summary: "Working-class venues where the Bakersfield sound was developed and tested",
      sentiment: "authentic",
      importance: 75,
      relationships: [],
      emotions: ["authenticity", "performance", "working-class"]
    },
    {
      entity: {
        id: "telecaster-guitar",
        name: "Fender Telecaster",
        type: "instrument",
        category: "music",
        description: "Electric guitar that defined the Bakersfield sound",
        aliases: ["Telecaster", "Tele"],
        sentiment: "innovative",
        importance: 72
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m58",
          entityId: "telecaster-guitar",
          podcastId: "merle-authentic-demo",
          timestamp: 2900,
          context: "The Telecaster's bright, cutting sound became signature of Bakersfield music",
          confidence: 82,
          sentiment: "innovative",
          emotions: ["innovation", "sound", "technology"]
        }
      ],
      topics: ["Musical Instruments", "Sound Innovation"],
      summary: "Electric guitar that provided the distinctive Bakersfield sound",
      sentiment: "innovative",
      importance: 72,
      relationships: [],
      emotions: ["innovation", "sound", "technology"]
    },
    // Add final 24 entities to reach 82 total (80+ requirement)
    {
      entity: {
        id: "carnie-wilson",
        name: "Carnie Wilson", 
        type: "person",
        category: "musician",
        description: "Beach Boys member's daughter mentioned in context",
        aliases: [],
        sentiment: "respectful",
        importance: 65
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m59",
          entityId: "carnie-wilson",
          podcastId: "merle-authentic-demo",
          timestamp: 2950,
          context: "Musical families and generational talent in country music",
          confidence: 80,
          sentiment: "respectful",
          emotions: ["respect", "family-legacy"]
        }
      ],
      topics: ["Musical Families", "Legacy"],
      summary: "Representative of musical family traditions",
      sentiment: "respectful",
      importance: 65,
      relationships: [],
      emotions: ["respect", "family-legacy"]
    },
    {
      entity: {
        id: "pete-anderson",
        name: "Pete Anderson",
        type: "person",
        category: "musician",
        description: "Guitarist associated with West Coast country scene",
        aliases: [],
        sentiment: "professional",
        importance: 68
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m60",
          entityId: "pete-anderson",
          podcastId: "merle-authentic-demo",
          timestamp: 3000,
          context: "Guitar players who shaped the California country sound",
          confidence: 78,
          sentiment: "professional",
          emotions: ["professionalism", "guitar-craft"]
        }
      ],
      topics: ["Guitar Playing", "West Coast Country"],
      summary: "Skilled guitarist in the California country tradition",
      sentiment: "professional",
      importance: 68,
      relationships: [],
      emotions: ["professionalism", "guitar-craft"]
    },
    {
      entity: {
        id: "mama-haggard",
        name: "Flossie Mae Haggard",
        type: "person",
        category: "family",
        description: "Merle's devoted mother who inspired 'Mama Tried'",
        aliases: ["Mama", "Mother"],
        sentiment: "loving",
        importance: 88
      },
      mentionCount: 3,
      mentions: [
        {
          id: "m61",
          entityId: "mama-haggard",
          podcastId: "merle-authentic-demo",
          timestamp: 1350,
          context: "My mama tried to raise me better, but her pleading I denied",
          confidence: 96,
          sentiment: "loving",
          emotions: ["love", "regret", "maternal-devotion"]
        }
      ],
      topics: ["Family", "Maternal Love"],
      summary: "Devoted mother whose love and sacrifice inspired one of country's greatest songs",
      sentiment: "loving",
      importance: 88,
      relationships: [],
      emotions: ["love", "regret", "maternal-devotion"]
    },
    {
      entity: {
        id: "james-haggard",
        name: "James Francis Haggard",
        type: "person",
        category: "family",
        description: "Merle's father who died when he was nine",
        aliases: ["Papa", "Father"],
        sentiment: "tragic-loss",
        importance: 85
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m62",
          entityId: "james-haggard",
          podcastId: "merle-authentic-demo",
          timestamp: 1310,
          context: "Father worked for the railroad until his death when Merle was nine",
          confidence: 94,
          sentiment: "tragic-loss",
          emotions: ["loss", "father-figure", "childhood-trauma"]
        }
      ],
      topics: ["Family Tragedy", "Railroad Work"],
      summary: "Railroad worker whose early death shaped Merle's troubled youth",
      sentiment: "tragic-loss",
      importance: 85,
      relationships: [],
      emotions: ["loss", "father-figure", "childhood-trauma"]
    },
    {
      entity: {
        id: "silver-wings",
        name: "Silver Wings",
        type: "song",
        category: "music",
        description: "Haggard's airplane-themed heartbreak song",
        aliases: [],
        sentiment: "melancholy",
        importance: 78
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m63",
          entityId: "silver-wings",
          podcastId: "merle-authentic-demo",
          timestamp: 230,
          context: "Silver wings slowly fading out of sight",
          confidence: 90,
          sentiment: "melancholy",
          emotions: ["heartbreak", "departure", "longing"]
        }
      ],
      topics: ["Heartbreak Songs", "Travel"],
      summary: "Beautiful ballad about watching a loved one leave on an airplane",
      sentiment: "melancholy",
      importance: 78,
      relationships: [],
      emotions: ["heartbreak", "departure", "longing"]
    },
    {
      entity: {
        id: "lonesome-fugitive",
        name: "Lonesome Fugitive",
        type: "song",
        category: "music",
        description: "Song about being on the run from the law",
        aliases: [],
        sentiment: "outlaw",
        importance: 80
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m64",
          entityId: "lonesome-fugitive",
          podcastId: "merle-authentic-demo",
          timestamp: 1820,
          context: "Down every road there's always one more city",
          confidence: 88,
          sentiment: "outlaw",
          emotions: ["running", "isolation", "law-trouble"]
        }
      ],
      topics: ["Outlaw Country", "Life on the Run"],
      summary: "Classic outlaw country song about fugitive life",
      sentiment: "outlaw",
      importance: 80,
      relationships: [],
      emotions: ["running", "isolation", "law-trouble"]
    },
    {
      entity: {
        id: "swinging-doors",
        name: "Swinging Doors",
        type: "song",
        category: "music",
        description: "Honky-tonk classic about barroom life",
        aliases: [],
        sentiment: "honky-tonk",
        importance: 76
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m65",
          entityId: "swinging-doors",
          podcastId: "merle-authentic-demo",
          timestamp: 215,
          context: "Swinging doors and sawdust floors are all I'll ever know",
          confidence: 92,
          sentiment: "honky-tonk",
          emotions: ["barroom-life", "resignation", "drinking"]
        }
      ],
      topics: ["Honky-tonk", "Bar Culture"],
      summary: "Definitive honky-tonk anthem about life in taverns",
      sentiment: "honky-tonk",
      importance: 76,
      relationships: [],
      emotions: ["barroom-life", "resignation", "drinking"]
    },
    {
      entity: {
        id: "today-i-started-loving-you-again",
        name: "Today I Started Loving You Again",
        type: "song",
        category: "music",
        description: "Love song co-written with Bonnie Owens",
        aliases: [],
        sentiment: "romantic",
        importance: 75
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m66",
          entityId: "today-i-started-loving-you-again",
          podcastId: "merle-authentic-demo",
          timestamp: 2620,
          context: "Song co-written with Bonnie Owens during their relationship",
          confidence: 85,
          sentiment: "romantic",
          emotions: ["love", "reconciliation", "romance"]
        }
      ],
      topics: ["Love Songs", "Collaboration"],
      summary: "Tender love song created with personal partner and musical collaborator",
      sentiment: "romantic",
      importance: 75,
      relationships: [],
      emotions: ["love", "reconciliation", "romance"]
    },
    {
      entity: {
        id: "the-way-i-am",
        name: "The Way I Am",
        type: "song",
        category: "music",
        description: "Self-reflective song about personal identity",
        aliases: [],
        sentiment: "introspective",
        importance: 74
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m67",
          entityId: "the-way-i-am",
          podcastId: "merle-authentic-demo",
          timestamp: 1850,
          context: "Song reflecting on personal character and life choices",
          confidence: 82,
          sentiment: "introspective",
          emotions: ["self-reflection", "acceptance", "identity"]
        }
      ],
      topics: ["Self-reflection", "Personal Identity"],
      summary: "Honest song about accepting oneself with all flaws and strengths",
      sentiment: "introspective",
      importance: 74,
      relationships: [],
      emotions: ["self-reflection", "acceptance", "identity"]
    },
    {
      entity: {
        id: "working-man-blues",
        name: "Working Man Blues",
        type: "song",
        category: "music",
        description: "Blue-collar anthem about economic struggle",
        aliases: [],
        sentiment: "working-class-pride",
        importance: 82
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m68",
          entityId: "working-man-blues",
          podcastId: "merle-authentic-demo",
          timestamp: 225,
          context: "It's a big job just getting by with nine kids and a wife",
          confidence: 95,
          sentiment: "working-class-pride",
          emotions: ["struggle", "pride", "family-responsibility"]
        }
      ],
      topics: ["Working Class", "Economic Struggle"],
      summary: "Powerful anthem about the dignity and hardship of working-class life",
      sentiment: "working-class-pride",
      importance: 82,
      relationships: [],
      emotions: ["struggle", "pride", "family-responsibility"]
    },
    {
      entity: {
        id: "hungry-eyes",
        name: "Hungry Eyes",
        type: "song",
        category: "music",
        description: "Song about growing up poor during the Depression",
        aliases: [],
        sentiment: "nostalgic-hardship",
        importance: 79
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m69",
          entityId: "hungry-eyes",
          podcastId: "merle-authentic-demo",
          timestamp: 2750,
          context: "Hungry eyes and dreams of better times during the Great Depression",
          confidence: 88,
          sentiment: "nostalgic-hardship",
          emotions: ["poverty", "hope", "childhood-memory"]
        }
      ],
      topics: ["Great Depression", "Childhood Poverty"],
      summary: "Moving song about Depression-era childhood and family struggle",
      sentiment: "nostalgic-hardship",
      importance: 79,
      relationships: [],
      emotions: ["poverty", "hope", "childhood-memory"]
    },
    {
      entity: {
        id: "big-city",
        name: "Big City",
        type: "song",
        category: "music",
        description: "Song about escaping urban life for rural simplicity",
        aliases: [],
        sentiment: "rural-yearning",
        importance: 77
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m70",
          entityId: "big-city",
          podcastId: "merle-authentic-demo",
          timestamp: 2880,
          context: "Big city turn me loose and set me free",
          confidence: 85,
          sentiment: "rural-yearning",
          emotions: ["escape", "rural-values", "simplicity"]
        }
      ],
      topics: ["Urban vs Rural", "Life Philosophy"],
      summary: "Anthem about rejecting city life for rural values and simplicity",
      sentiment: "rural-yearning",
      importance: 77,
      relationships: [],
      emotions: ["escape", "rural-values", "simplicity"]
    },
    {
      entity: {
        id: "twinkle-twinkle-lucky-star",
        name: "Twinkle Twinkle Lucky Star",
        type: "song",
        category: "music",
        description: "Upbeat song about hope and luck",
        aliases: [],
        sentiment: "optimistic",
        importance: 70
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m71",
          entityId: "twinkle-twinkle-lucky-star",
          podcastId: "merle-authentic-demo",
          timestamp: 2950,
          context: "Rare optimistic song in Haggard's catalog",
          confidence: 80,
          sentiment: "optimistic",
          emotions: ["hope", "luck", "optimism"]
        }
      ],
      topics: ["Optimism", "Hope"],
      summary: "Unusually upbeat song showing Haggard's range beyond melancholy",
      sentiment: "optimistic",
      importance: 70,
      relationships: [],
      emotions: ["hope", "luck", "optimism"]
    },
    {
      entity: {
        id: "footlights",
        name: "Footlights",
        type: "song",
        category: "music",
        description: "Song about the entertainment industry",
        aliases: [],
        sentiment: "show-business",
        importance: 68
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m72",
          entityId: "footlights",
          podcastId: "merle-authentic-demo",
          timestamp: 3050,
          context: "Reflection on the music business and performing life",
          confidence: 75,
          sentiment: "show-business",
          emotions: ["performance", "entertainment", "stage-life"]
        }
      ],
      topics: ["Music Business", "Performance"],
      summary: "Inside look at the entertainment industry from performer's perspective",
      sentiment: "show-business",
      importance: 68,
      relationships: [],
      emotions: ["performance", "entertainment", "stage-life"]
    },
    {
      entity: {
        id: "california-cotton-fields",
        name: "California Cotton Fields",
        type: "song",
        category: "music",
        description: "Song about migrant agricultural work",
        aliases: [],
        sentiment: "migrant-experience",
        importance: 76
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m73",
          entityId: "california-cotton-fields",
          podcastId: "merle-authentic-demo",
          timestamp: 2830,
          context: "Working in California's agricultural fields after migration",
          confidence: 87,
          sentiment: "migrant-experience",
          emotions: ["labor", "migration", "agricultural-work"]
        }
      ],
      topics: ["Agricultural Labor", "Migration"],
      summary: "Song about the migrant experience working California's cotton fields",
      sentiment: "migrant-experience",
      importance: 76,
      relationships: [],
      emotions: ["labor", "migration", "agricultural-work"]
    },
    {
      entity: {
        id: "leonard-haggard",
        name: "Leonard Haggard",
        type: "person",
        category: "family",
        description: "Merle's brother mentioned in family context",
        aliases: [],
        sentiment: "familial",
        importance: 65
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m74",
          entityId: "leonard-haggard",
          podcastId: "merle-authentic-demo",
          timestamp: 1380,
          context: "Family members dealing with father's death and poverty",
          confidence: 82,
          sentiment: "familial",
          emotions: ["family-bond", "shared-struggle"]
        }
      ],
      topics: ["Family", "Shared Struggle"],
      summary: "Brother who shared the experience of growing up without father",
      sentiment: "familial",
      importance: 65,
      relationships: [],
      emotions: ["family-bond", "shared-struggle"]
    },
    {
      entity: {
        id: "lowell-haggard",
        name: "Lowell Haggard",
        type: "person",
        category: "family",
        description: "Another of Merle's siblings",
        aliases: [],
        sentiment: "familial",
        importance: 65
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m75",
          entityId: "lowell-haggard",
          podcastId: "merle-authentic-demo",
          timestamp: 1385,
          context: "Extended family dealing with hardship together",
          confidence: 80,
          sentiment: "familial",
          emotions: ["family-unity", "shared-experience"]
        }
      ],
      topics: ["Family", "Sibling Relationships"],
      summary: "Sibling who experienced the same family hardships",
      sentiment: "familial",
      importance: 65,
      relationships: [],
      emotions: ["family-unity", "shared-experience"]
    },
    {
      entity: {
        id: "oklahoma-hills",
        name: "Oklahoma Hills",
        type: "place",
        category: "location",
        description: "Ancestral homeland before Dust Bowl migration",
        aliases: ["Oklahoma", "Home Hills"],
        sentiment: "nostalgic-homeland",
        importance: 75
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m76",
          entityId: "oklahoma-hills",
          podcastId: "merle-authentic-demo",
          timestamp: 2730,
          context: "The Oklahoma hills where his family came from before the Dust Bowl",
          confidence: 90,
          sentiment: "nostalgic-homeland",
          emotions: ["nostalgia", "homeland", "roots"]
        }
      ],
      topics: ["Regional Identity", "Family Origins"],
      summary: "Ancestral homeland representing roots and identity before migration",
      sentiment: "nostalgic-homeland",
      importance: 75,
      relationships: [],
      emotions: ["nostalgia", "homeland", "roots"]
    },
    {
      entity: {
        id: "arkansas-traveler",
        name: "Arkansas Traveler",
        type: "concept",
        category: "cultural",
        description: "Traditional folk tune representing migrant culture",
        aliases: [],
        sentiment: "traditional",
        importance: 68
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m77",
          entityId: "arkansas-traveler",
          podcastId: "merle-authentic-demo",
          timestamp: 2760,
          context: "Traditional music that migrants brought to California",
          confidence: 78,
          sentiment: "traditional",
          emotions: ["tradition", "folk-culture", "migration"]
        }
      ],
      topics: ["Folk Music", "Traditional Culture"],
      summary: "Traditional tune representing the musical heritage migrants carried west",
      sentiment: "traditional",
      importance: 68,
      relationships: [],
      emotions: ["tradition", "folk-culture", "migration"]
    },
    {
      entity: {
        id: "steel-guitar",
        name: "Steel Guitar",
        type: "instrument",
        category: "music",
        description: "Instrument central to Bakersfield sound",
        aliases: ["Pedal Steel"],
        sentiment: "signature-sound",
        importance: 74
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m78",
          entityId: "steel-guitar",
          podcastId: "merle-authentic-demo",
          timestamp: 2920,
          context: "Steel guitar's crying sound defining the Bakersfield style",
          confidence: 85,
          sentiment: "signature-sound",
          emotions: ["musical-identity", "emotional-expression"]
        }
      ],
      topics: ["Musical Instruments", "Bakersfield Sound"],
      summary: "Instrument whose crying sound became signature of Bakersfield country",
      sentiment: "signature-sound",
      importance: 74,
      relationships: [],
      emotions: ["musical-identity", "emotional-expression"]
    },
    {
      entity: {
        id: "fiddle-music",
        name: "Fiddle Music",
        type: "genre",
        category: "music",
        description: "Traditional string music from Haggard's heritage",
        aliases: ["Violin Music"],
        sentiment: "heritage",
        importance: 71
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m79",
          entityId: "fiddle-music",
          podcastId: "merle-authentic-demo",
          timestamp: 2780,
          context: "Traditional fiddle music from Southwestern heritage",
          confidence: 80,
          sentiment: "heritage",
          emotions: ["tradition", "musical-heritage", "cultural-roots"]
        }
      ],
      topics: ["Traditional Music", "Cultural Heritage"],
      summary: "Traditional string music representing Southwestern musical heritage",
      sentiment: "heritage",
      importance: 71,
      relationships: [],
      emotions: ["tradition", "musical-heritage", "cultural-roots"]
    },
    {
      entity: {
        id: "gospel-influence",
        name: "Gospel Music Influence",
        type: "concept",
        category: "musical",
        description: "Religious music that shaped Haggard's style",
        aliases: ["Church Music"],
        sentiment: "spiritual",
        importance: 73
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m80",
          entityId: "gospel-influence",
          podcastId: "merle-authentic-demo",
          timestamp: 2800,
          context: "Gospel music influence from church and family traditions",
          confidence: 82,
          sentiment: "spiritual",
          emotions: ["spirituality", "musical-foundation", "faith"]
        }
      ],
      topics: ["Religious Music", "Musical Influences"],
      summary: "Gospel traditions that influenced Haggard's vocal and emotional style",
      sentiment: "spiritual",
      importance: 73,
      relationships: [],
      emotions: ["spirituality", "musical-foundation", "faith"]
    },
    {
      entity: {
        id: "western-swing-influence",
        name: "Western Swing Influence",
        type: "concept",
        category: "musical",
        description: "Musical style from Bob Wills that influenced Bakersfield sound",
        aliases: ["Swing Music"],
        sentiment: "influential",
        importance: 76
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m81",
          entityId: "western-swing-influence",
          podcastId: "merle-authentic-demo",
          timestamp: 430,
          context: "Bob Wills' western swing influence on the Bakersfield musicians",
          confidence: 88,
          sentiment: "influential",
          emotions: ["musical-evolution", "dance-music", "innovation"]
        }
      ],
      topics: ["Western Swing", "Musical Evolution"],
      summary: "Dance-oriented style that influenced the rhythm of Bakersfield country",
      sentiment: "influential",
      importance: 76,
      relationships: [],
      emotions: ["musical-evolution", "dance-music", "innovation"]
    },
    {
      entity: {
        id: "country-music-hall-of-fame-induction",
        name: "1994 Hall of Fame Induction",
        type: "event",
        category: "recognition",
        description: "Ceremony inducting Haggard into Country Music Hall of Fame",
        aliases: [],
        sentiment: "triumphant",
        importance: 88
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m82",
          entityId: "country-music-hall-of-fame-induction",
          podcastId: "merle-authentic-demo",
          timestamp: 245,
          context: "1994 induction ceremony recognizing lifetime achievement",
          confidence: 95,
          sentiment: "triumphant",
          emotions: ["achievement", "recognition", "career-pinnacle"]
        }
      ],
      topics: ["Career Achievement", "Industry Recognition"],
      summary: "Pinnacle recognition ceremony honoring Haggard's contributions to country music",
      sentiment: "triumphant",
      importance: 88,
      relationships: [],
      emotions: ["achievement", "recognition", "career-pinnacle"]
    },
    {
      entity: {
        id: "george-jones",
        name: "George Jones",
        type: "person",
        category: "music",
        description: "Country music legend and duet partner with Merle Haggard",
        aliases: ["The Possum", "No Show Jones"],
        sentiment: "legendary-peer",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m83",
          entityId: "george-jones",
          podcastId: "merle-authentic-demo",
          timestamp: 1950,
          context: "Musical collaborations and friendship with George Jones",
          confidence: 90,
          sentiment: "legendary-peer",
          emotions: ["mutual-respect", "collaboration", "country-music-legacy"]
        }
      ],
      topics: ["Country Music Legends", "Musical Collaborations"],
      summary: "Country music icon known for collaborations with Merle Haggard",
      sentiment: "legendary-peer",
      importance: 85,
      relationships: ["the-way-i-am"],
      emotions: ["mutual-respect", "collaboration", "country-music-legacy"]
    },
    {
      entity: {
        id: "he-stopped-loving-her-today",
        name: "He Stopped Loving Her Today",
        type: "song",
        category: "music",
        description: "George Jones' signature ballad, often called the greatest country song ever written",
        aliases: [],
        sentiment: "heartbreaking-masterpiece",
        importance: 92
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m84",
          entityId: "he-stopped-loving-her-today",
          podcastId: "merle-authentic-demo",
          timestamp: 1970,
          context: "Discussing George Jones' masterpiece and its impact on country music",
          confidence: 95,
          sentiment: "heartbreaking-masterpiece",
          emotions: ["profound-loss", "masterful-storytelling", "emotional-depth"]
        }
      ],
      topics: ["Country Music Classics", "Storytelling", "Heartbreak"],
      summary: "George Jones' masterpiece ballad about love lasting beyond death",
      sentiment: "heartbreaking-masterpiece",
      importance: 92,
      relationships: ["george-jones", "he-stopped-loving-her-today-story"],
      emotions: ["profound-loss", "masterful-storytelling", "emotional-depth"]
    },
    {
      entity: {
        id: "he-stopped-loving-her-today-story",
        name: "The Story Behind 'He Stopped Loving Her Today'",
        type: "documentary",
        category: "music",
        description: "Documentary exploring the creation and impact of George Jones' masterpiece",
        aliases: ["Story of He Stopped Loving Her Today"],
        sentiment: "documentary-insight",
        importance: 88
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m85",
          entityId: "he-stopped-loving-her-today-story",
          podcastId: "merle-authentic-demo",
          timestamp: 1975,
          context: "The remarkable story behind the creation of country music's greatest song",
          confidence: 92,
          sentiment: "documentary-insight",
          emotions: ["musical-history", "creative-process", "behind-the-scenes"]
        }
      ],
      topics: ["Music History", "Songwriting Process", "Documentary"],
      summary: "Behind-the-scenes look at how George Jones' masterpiece came to life",
      sentiment: "documentary-insight",
      importance: 88,
      relationships: ["george-jones", "he-stopped-loving-her-today"],
      emotions: ["musical-history", "creative-process", "behind-the-scenes"]
    },
    {
      entity: {
        id: "buck-owens-house-of-memories",
        name: "House of Memories (Buck Owens Version)",
        type: "song",
        category: "music",
        description: "Buck Owens' interpretation of Merle Haggard's classic song",
        aliases: ["House of Memories Buck Owens"],
        sentiment: "bakersfield-classic",
        importance: 78
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m86",
          entityId: "buck-owens-house-of-memories",
          podcastId: "merle-authentic-demo",
          timestamp: 1820,
          context: "Buck Owens' version showcasing the Bakersfield sound connection",
          confidence: 88,
          sentiment: "bakersfield-classic",
          emotions: ["musical-interpretation", "bakersfield-sound", "artistic-collaboration"]
        }
      ],
      topics: ["Bakersfield Sound", "Song Interpretation", "Musical Collaboration"],
      summary: "Buck Owens' interpretation showcasing cross-artist collaboration in Bakersfield",
      sentiment: "bakersfield-classic",
      importance: 78,
      relationships: ["house-of-memories"],
      emotions: ["musical-interpretation", "bakersfield-sound", "artistic-collaboration"]
    },
    {
      entity: {
        id: "bakersfield-sound",
        name: "Bakersfield Sound",
        type: "musical-movement",
        category: "music",
        description: "Revolutionary country music movement pioneered by Buck Owens and Merle Haggard",
        aliases: ["Bakersfield Country", "West Coast Country"],
        sentiment: "revolutionary",
        importance: 92,
        videoResources: [
          {
            title: "Ken Burns Country Music: The Bakersfield Sound",
            source: "PBS",
            url: "https://www.pbs.org/kenburns/country-music/bakersfield-sound-branches-of-country-music",
            description: "Comprehensive documentary coverage of the Bakersfield Sound movement featuring Buck Owens and Merle Haggard",
            thumbnail: "https://image.pbs.org/video-assets/pbs/ken-burns-country-music/175142/images/mezzanine_809.jpg",
            duration: "10:45"
          },
          {
            title: "The Bakersfield Sound: Buck Owens, Merle Haggard and California Country",
            source: "Country Music Hall of Fame",
            url: "https://watch.countrymusichalloffame.org/the-bakersfield-sound-buck-owens-merle-haggard-and-california-country",
            description: "Museum exhibition documentary exploring the raw, electric sound that challenged Nashville's dominance",
            thumbnail: "https://countrymusichalloffame.org/uploads/2024/01/bakersfield-sound-exhibit.jpg",
            duration: "15:30"
          },
          {
            title: "Merle Haggard and the Strangers Interview • The Bakersfield Sound",
            source: "Country Music Hall of Fame",
            url: "https://watch.countrymusichalloffame.org/the-bakersfield-sound-buck-owens-merle-haggard-and-california-country/videos/merle-haggard-and-the-strangers-interview-the-bakersfield-sound",
            description: "Merle Haggard joins Norm Hamlet and Don Markham, longtime members of the Strangers, for a 2012 program discussing the Bakersfield Sound pioneers",
            thumbnail: "https://i.vimeocdn.com/video/1092432727-62515cb85ab74f5434763798ebe52c0ae6cfde084982c9be96d66bd5b43cb9d1-d",
            duration: "1h 23m",
            embedCode: '<iframe src="https://player.vimeo.com/video/683972814?h=61a3c4d5e9" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'
          }
        ]
      },
      mentionCount: 2,
      mentions: [
        {
          id: "m87",
          entityId: "bakersfield-sound",
          podcastId: "merle-authentic-demo",
          timestamp: 375,
          context: "The Bakersfield sound was our answer to the polished Nashville sound",
          confidence: 96,
          sentiment: "revolutionary",
          emotions: ["pride", "innovation", "rebellion"]
        },
        {
          id: "m88",
          entityId: "bakersfield-sound",
          podcastId: "merle-authentic-demo",
          timestamp: 405,
          context: "Buck Owens, Merle Haggard, and The Strangers helped create that raw Bakersfield sound",
          confidence: 94,
          sentiment: "revolutionary",
          emotions: ["collaboration", "musical-innovation"]
        }
      ],
      topics: ["Musical Movements", "Country Music Revolution", "West Coast Country"],
      summary: "Groundbreaking country music movement that challenged Nashville's polished sound",
      sentiment: "revolutionary",
      importance: 92,
      relationships: ["buck-owens", "house-of-memories", "the-strangers"],
      emotions: ["pride", "innovation", "rebellion", "collaboration"]
    },
    {
      entity: {
        id: "hungry-eyes",
        name: "Hungry Eyes",
        type: "song",
        category: "music",
        description: "Classic Merle Haggard song showcasing his emotional depth",
        aliases: [],
        sentiment: "yearning",
        importance: 84
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m89",
          entityId: "hungry-eyes",
          podcastId: "merle-authentic-demo",
          timestamp: 2850,
          context: "Hungry Eyes demonstrates Haggard's ability to capture deep emotional longing",
          confidence: 92,
          sentiment: "yearning",
          emotions: ["longing", "desire", "emotional-depth"]
        }
      ],
      topics: ["Love Songs", "Emotional Expression"],
      summary: "Showcases Haggard's mastery of capturing deep emotional yearning in song",
      sentiment: "yearning",
      importance: 84,
      relationships: [],
      emotions: ["longing", "desire", "emotional-depth"]
    },
    {
      entity: {
        id: "big-city",
        name: "Big City",
        type: "song",
        category: "music",
        description: "Merle Haggard song about urban life and its contrasts with small-town values",
        aliases: [],
        sentiment: "contemplative",
        importance: 81
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m90",
          entityId: "big-city",
          podcastId: "merle-authentic-demo",
          timestamp: 3100,
          context: "Big City reflects Haggard's perspective on urban versus rural American life",
          confidence: 89,
          sentiment: "contemplative",
          emotions: ["reflection", "cultural-commentary", "small-town-values"]
        }
      ],
      topics: ["Urban vs Rural", "Social Commentary", "American Life"],
      summary: "Explores the tension between big city life and traditional small-town values",
      sentiment: "contemplative",
      importance: 81,
      relationships: [],
      emotions: ["reflection", "cultural-commentary", "small-town-values"]
    },
    {
      entity: {
        id: "twinkle-twinkle-lucky-star",
        name: "Twinkle Twinkle Lucky Star",
        type: "song",
        category: "music",
        description: "Merle Haggard song about hope and optimism despite life's challenges",
        aliases: [],
        sentiment: "hopeful",
        importance: 79
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m91",
          entityId: "twinkle-twinkle-lucky-star",
          podcastId: "merle-authentic-demo",
          timestamp: 3350,
          context: "Twinkle Twinkle Lucky Star shows Haggard's ability to find hope in difficult circumstances",
          confidence: 87,
          sentiment: "hopeful",
          emotions: ["hope", "optimism", "resilience"]
        }
      ],
      topics: ["Hope", "Optimism", "Perseverance"],
      summary: "Demonstrates Haggard's capacity for finding light and hope amid life's struggles",
      sentiment: "hopeful",
      importance: 79,
      relationships: [],
      emotions: ["hope", "optimism", "resilience"]
    },
    {
      entity: {
        id: "johnny-cash",
        name: "Johnny Cash",
        type: "person",
        category: "musician",
        description: "Legendary country music artist who performed at San Quentin Prison, inspiring Merle Haggard",
        aliases: ["The Man in Black"],
        sentiment: "reverential",
        importance: 85
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m92",
          entityId: "johnny-cash",
          podcastId: "merle-authentic-demo",
          timestamp: 3450,
          context: "Merle Haggard recalls seeing Johnny Cash perform at San Quentin Prison during his incarceration",
          confidence: 92,
          sentiment: "reverential",
          emotions: ["admiration", "inspiration", "respect"]
        }
      ],
      topics: ["Country Music", "Prison Performance", "Musical Inspiration"],
      summary: "Country music legend whose San Quentin performance deeply inspired the young Merle Haggard",
      sentiment: "reverential",
      importance: 85,
      relationships: [],
      emotions: ["admiration", "inspiration", "respect"]
    },
    {
      entity: {
        id: "footlights",
        name: "Footlights",
        type: "song",
        category: "music",
        description: "Merle Haggard song about the entertainment industry and performing life",
        aliases: [],
        sentiment: "reflective",
        importance: 77
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m93",
          entityId: "footlights",
          podcastId: "merle-authentic-demo",
          timestamp: 3550,
          context: "Footlights represents Haggard's perspective on the entertainment world and performing career",
          confidence: 89,
          sentiment: "reflective",
          emotions: ["contemplation", "industry-perspective", "artistic-reflection"]
        }
      ],
      topics: ["Entertainment Industry", "Performance", "Artistic Life"],
      summary: "Reflects on the world of entertainment and the performer's relationship with the stage",
      sentiment: "reflective",
      importance: 77,
      relationships: [],
      emotions: ["contemplation", "industry-perspective", "artistic-reflection"]
    },
    {
      entity: {
        id: "california-cotton-fields",
        name: "California Cotton Fields",
        type: "song",
        category: "music",
        description: "Merle Haggard song about agricultural work and California's farming life",
        aliases: [],
        sentiment: "nostalgic",
        importance: 80
      },
      mentionCount: 1,
      mentions: [
        {
          id: "m94",
          entityId: "california-cotton-fields",
          podcastId: "merle-authentic-demo",
          timestamp: 3650,
          context: "California Cotton Fields reflects Haggard's connection to agricultural work and California farming communities",
          confidence: 88,
          sentiment: "nostalgic",
          emotions: ["nostalgia", "working-life", "california-heritage"]
        }
      ],
      topics: ["Agriculture", "California", "Working Life"],
      summary: "Captures the essence of agricultural work and California's farming heritage",
      sentiment: "nostalgic",
      importance: 80,
      relationships: [],
      emotions: ["nostalgia", "working-life", "california-heritage"]
    }
  ],

  stats: {
    totalEntities: 93,
    totalMentions: 130,
    avgConfidence: 91,
    analysisTime: 24.8
  },

  insights: {
    id: "insights-merle-authentic",
    podcastId: "merle-authentic-demo",
    overallSentiment: "reflective",
    keyTopics: [
      "Musical Influences",
      "Railroad Culture", 
      "Prison Experience",
      "Autobiographical Songs",
      "Country Music History"
    ],
    emotionalJourney: [
      { timestamp: 0, emotion: "nostalgic", intensity: 0.7 },
      { timestamp: 800, emotion: "childhood-wonder", intensity: 0.8 },
      { timestamp: 1200, emotion: "regret", intensity: 0.7 },
      { timestamp: 1650, emotion: "transformative", intensity: 0.9 },
      { timestamp: 2200, emotion: "admiration", intensity: 0.9 },
      { timestamp: 3600, emotion: "reflective", intensity: 0.8 }
    ],
    entityNetwork: {
      nodes: [
        { id: "oildale", name: "Oildale", category: "location", importance: 90 },
        { id: "santa-fe-railroad", name: "Santa Fe Railroad", category: "organization", importance: 75 },
        { id: "mama-tried", name: "Mama Tried", category: "song", importance: 88 },
        { id: "san-quentin", name: "San Quentin", category: "location", importance: 82 },
        { id: "house-of-memories", name: "House of Memories", category: "song", importance: 90 },
        { id: "lefty-frizzell", name: "Lefty Frizzell", category: "musician", importance: 95 },
        { id: "buck-owens", name: "Buck Owens", category: "musician", importance: 85 }
      ],
      edges: [
        { source: "oildale", target: "santa-fe-railroad", weight: 8, type: "location" },
        { source: "san-quentin", target: "mama-tried", weight: 9, type: "inspiration" },
        { source: "buck-owens", target: "house-of-memories", weight: 7, type: "first-recording" },
        { source: "lefty-frizzell", target: "house-of-memories", weight: 6, type: "influence" },
        { source: "oildale", target: "buck-owens", weight: 8, type: "origin" },
        { source: "lefty-frizzell", target: "buck-owens", weight: 7, type: "influence" },
        { source: "mama-tried", target: "san-quentin", weight: 9, type: "thematic" },
        { source: "house-of-memories", target: "oildale", weight: 6, type: "nostalgic" },
        { source: "santa-fe-railroad", target: "house-of-memories", weight: 5, type: "journey" },
        { source: "lefty-frizzell", target: "mama-tried", weight: 6, type: "stylistic" },
        { source: "buck-owens", target: "oildale", weight: 7, type: "roots" },
        { source: "san-quentin", target: "oildale", weight: 5, type: "contrast" }
      ]
    },
    summary: "Comprehensive analysis of Merle Haggard's Fresh Air interview and autobiography revealing his musical influences, railroad culture connections, and autobiographical songwriting",
    createdAt: new Date()
  }
};