"use client";

import { useId } from "react";

/**
 * Labelled input in the brutalist system: hairline box, tracked uppercase
 * label, and an error that is wired to the input via `aria-describedby` so
 * screen readers announce it rather than just colouring the border.
 */
export default function OrderField({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  inputMode,
  autoComplete,
  maxLength,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  autoComplete?: string;
  maxLength?: number;
  multiline?: boolean;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  const shared = {
    id,
    value,
    placeholder,
    maxLength,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(e.target.value),
    className: `w-full border bg-transparent px-3 py-2.5 font-display text-sm text-text outline-none transition-colors placeholder:text-muted/60 focus:border-text ${
      error ? "border-text" : "border-stroke"
    }`,
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-display text-[9px] font-700 tracking-[0.3em] text-muted uppercase"
      >
        {label}
      </label>

      <div className="mt-2">
        {multiline ? (
          <textarea {...shared} rows={2} />
        ) : (
          <input {...shared} type={type} inputMode={inputMode} />
        )}
      </div>

      {error && (
        <p
          id={errorId}
          className="mt-1.5 font-display text-[9px] font-600 tracking-[0.2em] text-text uppercase"
        >
          ↳ {error}
        </p>
      )}
    </div>
  );
}
