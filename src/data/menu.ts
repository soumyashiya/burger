export type MenuItem = {
  index: string;
  tier: string;
  name: string;
  price: string;
  copy: string;
  tags: string[];
  image: string;
};

export const menu: MenuItem[] = [
  {
    index: "01",
    tier: "SIGNATURE",
    name: "THE SMOKE",
    price: "$28",
    copy: "Applewood bacon cut thick enough to hold its bite. Cheddar with real age on it, a bun charred on the flat-top, and smoke that is still lifting off the plate when it reaches you.",
    tags: ["SMOKED BACON", "CHARRED BRIOCHE", "AGED CHEDDAR"],
    image: "/menu/smoke.webp",
  },
  {
    index: "02",
    tier: "PREMIUM",
    name: "THE TRUFFLE",
    price: "$48",
    copy: "Black truffle shaved to order over a mayo we infuse for three full days. One Wagyu patty, nothing crowding it, served on cold black marble.",
    tags: ["PÉRIGORD TRUFFLE", "WAGYU PATTY", "TRUFFLE MAYO"],
    image: "/menu/truffle.webp",
  },
  {
    index: "03",
    tier: "ICON",
    name: "THE BRENN",
    price: "$58",
    copy: "The one we are known for. Two patties smashed hard, two slices of cheddar, onions cooked down for hours and truffle mayo through the middle. Everything we do, on one bun.",
    tags: ["DOUBLE SMASH", "CARAMEL ONION", "GOLD STANDARD"],
    image: "/menu/gold-pedestal.webp",
  },
];
