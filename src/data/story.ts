export type StoryCard = {
  era: string;
  title: string;
  copy: string;
  image: string;
};

export const storyCards: StoryCard[] = [
  {
    era: "1880s · HAMBURG, GERMANY",
    title: "Where it began",
    copy: "In a working Hamburg kitchen, minced beef was seasoned, pressed into a thick patty by hand and seared hard over open flame. Plain food, made properly, meant to carry someone through a day of work.",
    image: "/story/story-hamburg.webp",
  },
  {
    era: "THE CROSSING · ELLIS ISLAND",
    title: "Across the Atlantic",
    copy: "German families brought the recipe with them on the boats. On the New York docks the Hamburg steak was put between two halves of a bun for the first time, and something new started.",
    image: "/story/story-ellisisland.webp",
  },
  {
    era: "1921 · WICHITA, KANSAS",
    title: "Born as an icon",
    copy: "Lunch counters across the Midwest made it quick, cheap and available everywhere. At five cents a patty it stopped being an immigrant dish and became an American one.",
    image: "/story/story-wichita.webp",
  },
  {
    era: "TODAY · EST. 2026",
    title: "Still built by hand",
    copy: "A century later we have taken the shortcuts back out. Dry-aged beef, charcoal iron, every patty formed by hand — the same food, returned to the craft it came from.",
    image: "/story/story-today.webp",
  },
];

export const timeline = {
  fromFlag: "🇩🇪",
  fromLabel: "1880 · GERMANY",
  toFlag: "🇺🇸",
  toLabel: "TODAY · EST. 2026",
  span: "146 YEARS",
  copy: "It started in Hamburg in 1880. A German steak became an American staple, and then a craft again — one patty, worked on for two centuries.",
} as const;
