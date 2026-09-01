/**
 * Contact routes. Deliberately not bookings — a table is taken in the
 * reservation section, and repeating that here would just split the flow.
 */
export type Channel = {
  label: string;
  address: string;
  note: string;
};

export const channels: Channel[] = [
  {
    label: "GENERAL",
    address: "hello@brennburger.co",
    note: "Anything at all. We answer within a working day.",
  },
  {
    label: "PRIVATE HIRE",
    address: "events@brennburger.co",
    note: "The back room seats 24, or 40 standing.",
  },
  {
    label: "PRESS",
    address: "press@brennburger.co",
    note: "Images, interviews and the brand kit.",
  },
  {
    label: "CAREERS",
    address: "jobs@brennburger.co",
    note: "Kitchen and floor, every level.",
  },
];

export const topics = [
  "General",
  "Private hire",
  "Press",
  "Careers",
  "Feedback",
] as const;

export const openingHours = [
  { days: "MON — THU", time: "12:00 — 22:00" },
  { days: "FRI — SAT", time: "12:00 — 23:30" },
  { days: "SUNDAY", time: "12:00 — 21:00" },
];
