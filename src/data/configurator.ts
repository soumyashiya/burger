export type Size = {
  key: string;
  letter: string;
  name: string;
  spec: string;
  price: number;
  image: string;
};

export type Topping = {
  key: string;
  name: string;
  price: number;
  image: string;
};

export const sizes: Size[] = [
  {
    key: "s",
    letter: "S",
    name: "SINGLE PATTY",
    spec: "180g · 1 patty",
    price: 18,
    image: "/menu/classic.webp",
  },
  {
    key: "m",
    letter: "M",
    name: "DOUBLE SMASH",
    spec: "360g · 2 patties",
    price: 26,
    image: "/menu/overhead.webp",
  },
  {
    key: "l",
    letter: "L",
    name: "TRIPLE STACK",
    spec: "540g · 3 patties",
    price: 34,
    image: "/menu/prime-stack.webp",
  },
];

export const toppings: Topping[] = [
  { key: "truffle", name: "TRUFFLE MAYO", price: 4, image: "/ingredients/truffle-mayo.webp" },
  { key: "bacon", name: "SMOKED BACON", price: 3, image: "/ingredients/bacon.webp" },
  { key: "onion", name: "CARAMEL ONION", price: 2, image: "/ingredients/onions.webp" },
  { key: "cheddar", name: "EXTRA CHEDDAR", price: 3, image: "/ingredients/cheddar.webp" },
  { key: "pickle", name: "HOUSE PICKLES", price: 0, image: "/ingredients/pickle.webp" },
  { key: "egg", name: "FRIED EGG", price: 3, image: "/ingredients/egg.webp" },
];
