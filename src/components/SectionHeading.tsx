import type { ReactNode } from "react";

/**
 * Shared section header: a tracked eyebrow above an Anton headline. With no
 * accent hue in the system the numeric prefix drops back to muted grey instead
 * of being picked out in colour.
 */
export default function SectionHeading({
  eyebrow,
  index,
  title,
  aside,
  align = "left",
  size = "md",
  className = "",
}: {
  eyebrow: string;
  index?: string;
  title: string;
  aside?: ReactNode;
  align?: "left" | "center";
  size?: "md" | "lg";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={`flex items-end ${centered ? "flex-col text-center" : "justify-between"} ${className}`}
    >
      <div className={centered ? "w-full" : ""}>
        <p className="font-display text-[10px] font-600 tracking-[0.35em] text-muted uppercase md:text-[11px]">
          {eyebrow}
        </p>
        <h2
          className={`mt-3 font-anton leading-[0.86] text-text uppercase ${
            size === "lg"
              ? "text-5xl md:text-8xl lg:text-9xl"
              : "text-4xl md:text-7xl"
          }`}
        >
          {index && <span className="text-muted">{index} </span>}
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
