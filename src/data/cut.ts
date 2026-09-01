export type CutCard = {
  index: string;
  kicker: string;
  title: string;
  copy: string;
  image: string;
};

export const cutCards: CutCard[] = [
  {
    index: "01",
    kicker: "THE CUT",
    title: "WAGYU A5 BEEF",
    copy: "BMS 10–12 marbling, aged 28 days in our own room, then minced by hand to an 80/20 ratio. Single origin, Kagoshima.",
    image: "/ingredients/wagyu.webp",
  },
  {
    index: "02",
    kicker: "THE BREAD",
    title: "BRIOCHE BUN",
    copy: "Baked every morning downstairs. Enriched with butter and egg, glazed and toasted so it holds together to the last bite.",
    image: "/ingredients/brioche.webp",
  },
  {
    index: "03",
    kicker: "THE MELT",
    title: "AGED CHEDDAR",
    copy: "Eighteen months in the cave. Two slices go on while the patty is still on the iron, so the melt finishes exactly when the sear does.",
    image: "/ingredients/cheddar.webp",
  },
  {
    index: "04",
    kicker: "THE SAUCE",
    title: "TRUFFLE MAYO",
    copy: "An aioli we make in-house and leave to infuse with black truffle for 72 hours. It goes on cold and meets the heat of the patty.",
    image: "/ingredients/truffle-mayo.webp",
  },
  {
    index: "05",
    kicker: "THE BITE",
    title: "HOUSE PICKLES",
    copy: "Cucumbers fermented 48 hours in dill brine. Sharp enough to cut straight through the fat and reset the palate.",
    image: "/ingredients/pickle.webp",
  },
  {
    index: "06",
    kicker: "THE SMOKE",
    title: "APPLEWOOD BACON",
    copy: "Cured for a week, smoked slow over applewood and cut thick. It stays chewy rather than shattering.",
    image: "/ingredients/bacon.webp",
  },
  {
    index: "07",
    kicker: "THE SWEET",
    title: "CARAMEL ONIONS",
    copy: "Four hours on low heat with nothing but butter and patience, until the sugars have gone dark and jammy.",
    image: "/ingredients/onions.webp",
  },
];
