import { brand } from "@/data/site";

export default function Logo() {
  return (
    <span className="flex flex-col leading-none">
      <span className="font-anton text-xl tracking-[0.14em] text-text uppercase">
        {brand.name}
      </span>
      <span className="mt-1 font-display text-[9px] font-500 tracking-[0.4em] text-muted uppercase">
        {brand.tagline}
      </span>
    </span>
  );
}
