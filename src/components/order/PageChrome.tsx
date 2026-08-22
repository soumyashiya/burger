import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

/**
 * Header for the standalone order routes. The marketing header is scroll-spied
 * and full of in-page anchors that mean nothing off the home page, so those
 * routes get this stripped-back bar instead.
 */
export default function PageChrome({ action }: { action?: React.ReactNode }) {
  return (
    <header className="border-b border-text/25">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-5 md:px-10">
        <Link href="/" aria-label="PRIME — back to the menu">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          {action}
          <Link
            href="/"
            className="btn-brut flex items-center gap-2 px-4 py-2.5 font-display text-[10px] font-700 tracking-[0.22em] uppercase"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Back to menu</span>
            <span className="sm:hidden">Menu</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
