export type SearStep = {
  kicker: string;
  titleTop: string;
  titleBottom: string;
  copy: string;
  temp: number;
};

/** Three states crossfaded across the pinned sear sequence. */
export const searSteps: SearStep[] = [
  {
    kicker: "COLD STORAGE",
    titleTop: "THE WAGYU",
    titleBottom: "RESTS",
    copy: "Four degrees. The ageing is finished and the marbling has set. Nothing happens here — that is the point.",
    temp: 4,
  },
  {
    kicker: "BROWNING REACTION",
    titleTop: "MAILLARD",
    titleBottom: "BEGINS",
    copy: "The patty meets charcoal iron. The surface dries, the sugars and amino acids start rearranging, and the crust begins to build.",
    temp: 150,
  },
  {
    kicker: "FULL SEAR",
    titleTop: "THE CRUST",
    titleBottom: "LOCKS",
    copy: "At 260°C the crust sets hard and holds the juices in. From here it is seconds, not minutes.",
    temp: 260,
  },
];

export const searTicks = ["260°", "200°", "150°", "100°", "0°"] as const;
