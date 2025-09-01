// Demo showing what proper Merle Haggard analysis should look like
export const merleHaggardDemoAnalysis = {
  podcastTitle: "Fresh Air: Merle Haggard Interview",
  totalNavigationTriggers: 134,
  categories: {
    "Country Music Entities": {
      count: 52,
      examples: [
        { name: "Bakersfield Sound", type: "genre", confidence: 0.98, context: "California country music movement" },
        { name: "Okie from Muskogee", type: "song", confidence: 0.95, context: "Controversial patriotic anthem" },
        { name: "Mama Tried", type: "song", confidence: 0.94, context: "Prison-influenced ballad" },
        { name: "The Strangers", type: "band", confidence: 0.92, context: "Merle's backing band" },
        { name: "Buck Owens", type: "artist", confidence: 0.89, context: "Bakersfield contemporary" }
      ]
    },
    "Places & Geography": {
      count: 28,
      examples: [
        { name: "Bakersfield", type: "place", confidence: 0.97, context: "California country music capital" },
        { name: "San Quentin", type: "place", confidence: 0.94, context: "Prison where he served time" },
        { name: "Nashville", type: "place", confidence: 0.91, context: "Country music establishment" },
        { name: "Muskogee, Oklahoma", type: "place", confidence: 0.88, context: "Song subject and cultural symbol" },
        { name: "Honky-tonks", type: "venue", confidence: 0.85, context: "Working-class music venues" }
      ]
    },
    "Cultural & Social Themes": {
      count: 31,
      examples: [
        { name: "Outlaw Country", type: "movement", confidence: 0.96, context: "Anti-establishment country music" },
        { name: "Working Class", type: "social_theme", confidence: 0.93, context: "Blue-collar identity and values" },
        { name: "Prison Experience", type: "life_experience", confidence: 0.90, context: "Authenticity and credibility" },
        { name: "Patriotism", type: "political_theme", confidence: 0.87, context: "Conservative values expression" },
        { name: "Rebellion", type: "attitude", confidence: 0.84, context: "Anti-authority stance" }
      ]
    },
    "Musical Style & Production": {
      count: 23,
      examples: [
        { name: "Telecaster Guitar", type: "instrument", confidence: 0.91, context: "Signature Bakersfield sound" },
        { name: "Pedal Steel", type: "instrument", confidence: 0.88, context: "Country music staple" },
        { name: "Honky-tonk Style", type: "musical_style", confidence: 0.85, context: "Working-class country sound" },
        { name: "Traditional Arrangements", type: "production", confidence: 0.82, context: "Non-commercial approach" },
        { name: "Raw Vocals", type: "technique", confidence: 0.79, context: "Authentic, unpolished delivery" }
      ]
    }
  },
  
  crossMediaConnections: {
    "Bakersfield Sound → Regional Music Scenes": {
      pathway: "California country → Austin scene → Seattle grunge → Regional authenticity",
      partnerBooks: ["Music geography books", "Regional music histories"],
      dataSources: ["Last.fm regional artist connections", "Reddit music geography discussions"]
    },
    "Prison Experience → Authenticity in Music": {
      pathway: "San Quentin → Johnny Cash prison concerts → Authenticity debates → Credibility in music",
      partnerBooks: ["Cash: The Autobiography", "Prison memoirs"],
      dataSources: ["Reddit authenticity discussions", "Rate Your Music credibility debates"]
    },
    "Outlaw Country → Anti-Establishment Music": {
      pathway: "Country rebellion → Punk attitude → Hip-hop resistance → Musical rebellion across genres",
      partnerBooks: ["Music rebellion histories", "Counter-culture books"],
      dataSources: ["TikTok rebellion music", "Reddit anti-establishment discussions"]
    },
    "Working Class Themes → Blue-Collar Music": {
      pathway: "Country work songs → Bruce Springsteen → Punk working class → Labor movement music",
      partnerBooks: ["Working class music history", "Labor movement books"],
      dataSources: ["Last.fm working class playlists", "Reddit blue-collar music"]
    }
  },

  partnerDataIntegration: {
    "Last.fm Connections": [
      "Similar to: Johnny Cash, Buck Owens, Waylon Jennings, Willie Nelson",
      "Listeners also play: Bakersfield artists, outlaw country classics",
      "Genre tags: country, outlaw country, Bakersfield sound, honky-tonk"
    ],
    "TikTok Cultural Moments": [
      "#OkieFromMuskogee political discussions",
      "#BakersfieldSound music education content",
      "#OutlawCountry rebellion themes",
      "Prison song covers and stories"
    ],
    "Reddit Community Analysis": [
      "r/country: Bakersfield vs Nashville debates",
      "r/outlaw: Authenticity and credibility discussions",
      "r/Music: Prison songs and social themes",
      "r/vintagemusic: Historical context and influence"
    ]
  },

  navigationPathwaysExamples: [
    {
      trigger: "San Quentin",
      connections: [
        "Johnny Cash - At San Quentin album",
        "Prison reform documentaries", 
        "Other artists' prison experiences",
        "Rehabilitation through music programs",
        "California prison system history"
      ]
    },
    {
      trigger: "Bakersfield Sound",
      connections: [
        "Buck Owens and other pioneers",
        "California country vs Nashville",
        "Working-class music scenes",
        "Regional music authenticity",
        "Telecaster guitar culture"
      ]
    },
    {
      trigger: "Okie from Muskogee",
      connections: [
        "Vietnam War era protests",
        "Conservative country music",
        "Political songs across genres",
        "Cultural divide discussions",
        "Patriotism in popular music"
      ]
    }
  ]
};

export default merleHaggardDemoAnalysis;