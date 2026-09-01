export const overviewSpecs = [
  { label: "PATTY WEIGHT", value: "500 G" },
  { label: "DRY AGED", value: "28 DAYS" },
  { label: "GRILL TEMP", value: "260 °C" },
  { label: "FAT RATIO", value: "80 / 20" },
  { label: "LAYERS", value: "07" },
  { label: "ORIGIN", value: "WAGYU A5" },
] as const;

export type Stat = {
  index: string;
  to: number;
  suffix: string;
  unit: string;
  label: string;
  copy: string;
};

export const stats: Stat[] = [
  {
    index: "01",
    to: 500,
    suffix: "G",
    unit: "WAGYU A5",
    label: "PATTY WEIGHT",
    copy: "One grind, formed by hand, BMS 10–12 marbling. It never sees a freezer.",
  },
  {
    index: "02",
    to: 28,
    suffix: "",
    unit: "DAYS",
    label: "DRY-AGED",
    copy: "Aged in our own room at 2°C. Enzymes do the work; the flavour tightens up.",
  },
  {
    index: "03",
    to: 260,
    suffix: "",
    unit: "CELSIUS",
    label: "SEAR TEMPERATURE",
    copy: "Charcoal iron. The Maillard reaction starts within a second of contact.",
  },
  {
    index: "04",
    to: 7,
    suffix: "",
    unit: "LAYERS",
    label: "IN THE STACK",
    copy: "Each layer earns its place. Nothing goes on the bun for decoration.",
  },
];
