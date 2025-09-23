import type { BookAnalysis, Book, BookChapter, CrossMediaMention } from '../../../shared/schema';

// This file will contain the parsed authentic book content
// The content will be populated by parsing the full transcript

const AUTHENTIC_TRANSCRIPT = `I've had a blessed life, despite many lows, many of which were of my own doing. There have been times when I simply could not see the light at the end of the economic, romantic, psychological, or emotional tunnel. I've lived through 17 stays in penal institutions, incarceration in state prison, five marriages, bankruptcy, a broken back, brawls, shooting incidents, swindlings, sickness, the death of loved ones, and more.

And I've heard 10,000 chant my name when I couldn't hear the voice of my own soul. And I wondered if God was listening, and I was sure that no one else was. My unhappiness at times was so overwhelming, if anyone had ever told me that I'd be as content as I am today, I would have thought they were talking about someone else.

So I decided to share what has worked for me, knowing it'll work for others. I'm a little embarrassed about some of the stories I'm gonna tell. They're more like confessions than mere reporting of events. And I really can't tell you how high I've been unless I tell you how low I sunk.

Today at times I have peace of mind, the love of God, a good woman, and a family. Today I'm on track, or at least that's what they tell me. Welcome to my world. Enter through the gate of my house of memories.

People milled nervously, fidgeting and looking at their feet the way folks do when embarrassed or angry. They gawked at what they probably thought was a madman in swimming trunks on a mammoth boat in front of them. He was yelling profanities that echoed across northern California's sprawling Lake Shasta for hundreds of yards, as sound does on water.

"Shut up, Grandma. I'm busy," he hollered. "Shut up. I'll be there in a minute. Damn it, shut up." The onlookers stared in disbelief. Perhaps the man was drunk. Perhaps he was high. No matter. No one had the right, the crowd obviously thought, to talk to his grandmother that way. The man on the boat stepped way over the line.

"Screw you, Grandma," he yelled. Suddenly, he noticed the crowd gathering before the boat, tied up at Silverthorne Resort Marina near Jones Valley, and he smiled sheepishly. No one smiled back.

"Oh, no," he said with disgust. "You think I'm talking to my grandmother." The expressionless people continued their silent vigil. Decent people hate people who abuse their elders almost as much as they hate those who abuse children.

"It's not what you think," the man on the boat tried to explain. "Wait till I show you." He dropped below the deck, sounded like a man yelling from inside a cave. The onlookers could still hear him snapping at Grandma.

Eventually, he emerged from the boat with a teacup poodle. "This," he said, holding up the canine, "is Grandma." The people looked at each other and then back at him. "This really is Grandma," he insisted. No one spoke. It was clear they thought he was the vilest man on earth, or at least on Lake Shasta.

The hostile group didn't appear to buy the yarn that he had a dog named Grandma. Still the man stood there holding the hapless dog in the air, its limp tongue hanging out of its toothless mouth. The sight of the pitiful pooch did not bolster the man's credibility.

Everyone in the crowd would later tell friends about the creep at the marina. They had seen Freddy Powers, my long-time songwriting partner who shared a houseboat next to mine, from about 1982 until about 1988. He really was yelling at a little dog that had been abandoned by its owner and had wandered its way into our party.

And we paid substantially to have its teeth pulled and bones repaired. The veterinarian said without dental work, the dog would have died from infection. Freddy saved the dog's life by subsidizing its medical care, but his kindness toward the pooch had backfired on him that day at Silverthorne Resort.

In those days, if I wasn't on tour, I was on my houseboat. It was my home. I had a big house I had bought for my former wife and me, but I lived mostly on the boat. That's where I had the party to end all parties, an exercise in decadence that lasted a full five years.

We partied every day and night when I was aboard. I went to the boat to get over a woman by partying away what I thought would be the last few years of my life. I didn't expect to live to be 60, not the way I had lived and not the way I was living.

It was foolish. It was like the man who consumes alcohol, a depressant because he's depressed. I thought I was going to die young because of my reckless lifestyle, so I accelerated the recklessness.

I was once off the road for 31 days, and for 31 days I never left the water. I had my toothbrush tied to the accelerator on my bass boat and let it dangle in the clear, icy waters of Lake Shasta. I'd pull it from the water when needed and jump in the lake with a bar of soap to bathe.

We put cayenne pepper and lemon in our drinking water and our skin was as clear as a model's. The life was everything Jimmy Buffett sings about. I snorted cocaine, womanized and hid from my personal pain during a binge that almost claimed my life on at least two occasions.`;

// Import the full authentic content parser
import { parseFullAuthenticContent } from './full-authentic-content';

// Authentic book chapters with complete 43,229-word content
export const authenticBookChapters: BookChapter[] = parseFullAuthenticContent();

export const authenticBook: Book = {
  id: "merle-book-house-memories",
  title: "My House of Memories: An Autobiography",
  author: "Merle Haggard with Tom Carter",
  isbn: "9780062001511",
  publisher: "HarperCollins",
  publishedYear: 1999,
  pageCount: 256,
  genre: "Biography/Autobiography",
  description: "The complete autobiography of country music legend Merle Haggard, narrated by the artist himself. A raw, honest journey from poverty and prison to becoming one of America's most influential country artists.",
  textContent: AUTHENTIC_TRANSCRIPT,
  audioUrl: "https://storage.googleapis.com/replit-objstore-845adf3a-0ac1-4c6c-9d54-667ba86aad52/public/merle-audiobook.mp3", // Hosted in object storage
  audioDuration: 14400, // 4 hours estimated (240 minutes)
  coverImageUrl: "https://storage.googleapis.com/replit-objstore-845adf3a-0ac1-4c6c-9d54-667ba86aad52/public/merle-book-cover.jpg",
  status: "completed",
  createdAt: new Date(),
};