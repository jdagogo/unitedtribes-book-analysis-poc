// Demo showing what proper Justin Bieber analysis should look like
export const justinBieberDemoAnalysis = {
  podcastTitle: "Justin Bieber's Experimental 'Swag' Resurgence",
  totalNavigationTriggers: 127,
  categories: {
    "Music Entities": {
      count: 45,
      examples: [
        { name: "Purpose", type: "album", confidence: 0.98, context: "Career-defining comeback album" },
        { name: "Sorry", type: "song", confidence: 0.95, context: "Breakthrough apology anthem" },
        { name: "What Do You Mean", type: "song", confidence: 0.92, context: "First single from Purpose era" },
        { name: "Love Yourself", type: "song", confidence: 0.94, context: "Ed Sheeran collaboration" },
        { name: "Despacito Remix", type: "collaboration", confidence: 0.89, context: "Latin crossover moment" }
      ]
    },
    "Career Moments": {
      count: 18,
      examples: [
        { name: "Purpose Era", type: "career_phase", confidence: 0.97, context: "Artistic maturity and comeback" },
        { name: "Apology Tour", type: "cultural_moment", confidence: 0.91, context: "Public redemption arc" },
        { name: "Disney Transition", type: "career_shift", confidence: 0.88, context: "From teen pop to mature artist" },
        { name: "Stadium Tours", type: "performance_scale", confidence: 0.85, context: "Evolution to arena-level performer" }
      ]
    },
    "Collaborations & Relationships": {
      count: 22,
      examples: [
        { name: "Usher Mentorship", type: "relationship", confidence: 0.96, context: "R&B guidance and career development" },
        { name: "Scooter Braun", type: "management", confidence: 0.93, context: "Industry relationship and development" },
        { name: "Ed Sheeran", type: "collaboration", confidence: 0.90, context: "Songwriting partnership" },
        { name: "Chance the Rapper", type: "feature", confidence: 0.87, context: "Gospel and faith influences" }
      ]
    },
    "Cultural Phenomena": {
      count: 25,
      examples: [
        { name: "Beliebers", type: "fandom", confidence: 0.98, context: "Dedicated fan community" },
        { name: "Canadian Pop Export", type: "cultural_identity", confidence: 0.92, context: "National music representation" },
        { name: "Teen Heartthrob Evolution", type: "pop_culture", confidence: 0.89, context: "Maturation in public eye" },
        { name: "Social Media Presence", type: "digital_influence", confidence: 0.94, context: "Fan engagement and cultural impact" }
      ]
    },
    "Musical Style & Production": {
      count: 17,
      examples: [
        { name: "Acoustic Versions", type: "musical_style", confidence: 0.91, context: "Intimate, stripped-down performances" },
        { name: "R&B Influences", type: "genre_blend", confidence: 0.88, context: "Usher mentorship impact" },
        { name: "Dance-Pop", type: "genre", confidence: 0.85, context: "Club-friendly anthems" },
        { name: "Vocal Falsetto", type: "technique", confidence: 0.83, context: "Signature vocal approach" }
      ]
    }
  },
  
  crossMediaConnections: {
    "Purpose → Johnny Cash": {
      pathway: "Redemption stories in music → Prison concerts → Authenticity journeys",
      partnerBooks: ["Cash: The Autobiography"],
      dataSources: ["Reddit discussions on authenticity", "Last.fm similar artist patterns"]
    },
    "Usher Mentorship → Atlanta Scene": {
      pathway: "R&B mentorship → Atlanta music culture → Southern hip-hop influences",
      partnerBooks: ["Hip-hop memoirs", "R&B history books"],
      dataSources: ["TikTok Atlanta music content", "Reddit r/rnb discussions"]
    },
    "Canadian Identity → Drake Connection": {
      pathway: "Toronto music scene → Canadian rap → National pride in music",
      partnerBooks: ["Canadian music history"],
      dataSources: ["Last.fm Canadian artist networks", "TikTok Canadian music pride"]
    },
    "Acoustic Versions → Intimate Concerts": {
      pathway: "Stripped performances → Coffee house culture → Singer-songwriter tradition",
      partnerBooks: ["Acoustic guitar memoirs", "Folk music histories"],
      dataSources: ["Rate Your Music acoustic rankings", "Reddit acoustic music communities"]
    }
  },

  partnerDataIntegration: {
    "Last.fm Connections": [
      "Similar to: Drake, The Weeknd, Shawn Mendes, Ed Sheeran",
      "Listeners also play: Purpose album tracks, acoustic versions",
      "Genre tags: pop, R&B, dance-pop, acoustic, teen pop"
    ],
    "TikTok Cultural Moments": [
      "#JustinBieber 15.2B views",
      "#Purpose era viral dance trends",
      "#BelieberCheck fan content",
      "Sorry acoustic covers trending"
    ],
    "Reddit Community Analysis": [
      "r/popheads: Purpose album retrospectives",
      "r/canada: Pride in Canadian music exports",
      "r/rnb: Usher mentorship discussions",
      "r/Music: Comeback story analyses"
    ]
  }
};

export const improvedNavigationPathways = [
  {
    trigger: "Purpose Era",
    description: "Justin Bieber's career-defining comeback phase",
    connections: [
      "Other pop comeback stories (Britney, Christina Aguilera)",
      "Redemption arcs in music (Johnny Cash prison concerts)",
      "Artistic maturity transitions (Miley Cyrus, Selena Gomez)",
      "Stadium tour documentaries and behind-the-scenes content",
      "Apology songs across genres and decades"
    ]
  },
  {
    trigger: "Usher Mentorship",
    description: "R&B guidance and industry development relationship",
    connections: [
      "Other mentor-protégé relationships (Jay-Z & Rihanna, Dr. Dre & Eminem)",
      "Atlanta R&B scene and its influence on pop",
      "Vocal coaching and technique development",
      "Industry relationship documentaries",
      "R&B evolution and crossover success stories"
    ]
  },
  {
    trigger: "Beliebers",
    description: "Dedicated global fan community",
    connections: [
      "Fan culture evolution (Beatles to BTS)",
      "Social media fan armies and stan culture",
      "Concert experiences and fan testimonials",
      "Celebrity-fan relationship dynamics",
      "Pop culture fandom documentaries"
    ]
  }
];

export default justinBieberDemoAnalysis;