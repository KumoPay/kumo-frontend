"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";

import { GetTheAppButton } from "@/components/get-app-stores";

type Props = {
  /** On `/`: `#features`. On other pages (`/flow`), use `false` so links go `/#features` etc. */
  anchorsRelativeToHome?: boolean;
};

export default function LandingNav({ anchorsRelativeToHome = true }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hash = (id: string) => (anchorsRelativeToHome ? `#${id}` : `/#${id}`);

  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navLinkInactive =
    "rounded-lg px-1 py-1 text-[15px] font-medium text-slate-500 no-underline outline-none transition-colors duration-200 ease-out hover:bg-violet-50/55 hover:text-[#6d28d9] focus-visible:text-[#6d28d9] focus-visible:ring-2 focus-visible:ring-[#6d28d9] focus-visible:ring-offset-2";
  const navLinkFlowActive =
    "rounded-lg px-1 py-1 text-[15px] font-semibold text-[#6d28d9] no-underline outline-none transition-colors duration-200 ease-out hover:bg-violet-50/55 focus-visible:text-[#6d28d9] focus-visible:ring-2 focus-visible:ring-[#6d28d9] focus-visible:ring-offset-2 bg-violet-50/40";

  const flowHighlighted = pathname === "/flow" || pathname.startsWith("/flow/");

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.92)" : "#fff",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #eef0f8" : "1px solid transparent",
      }}
    >
      <div
        className="flex w-full min-h-[72px] items-center justify-between md:pr-5"
        style={{
          paddingLeft: "max(12px, env(safe-area-inset-left))",
          paddingRight: "max(12px, env(safe-area-inset-right))",
        }}
      >
        <Link
          href="/"
          onClick={goHome}
          className="flex shrink-0 items-center gap-px rounded-xl outline-none ring-offset-2 transition-[opacity,transform,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-violet-50/40 hover:opacity-95 focus-visible:bg-violet-50/50 focus-visible:ring-2 focus-visible:ring-[#6d28d9] active:scale-[0.99]"
          style={{ textDecoration: "none", marginRight: 8 }}
          title="Back to home"
          aria-label="KumoPay — home"
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              border: "1px solid #e5e7eb",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src="/favicon-32.png" alt="" width={44} height={44} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          </span>
          <Image
            src="/logo-sec-02.png"
            alt="KumoPay"
            width={260}
            height={56}
            className="-ml-0.5 sm:-ml-1"
            style={{ height: 48, width: "auto", maxWidth: "min(230px, 48vw)" }}
            priority
          />
        </Link>

        <div className="hidden flex-1 md:flex md:items-center md:justify-center md:gap-6 lg:gap-8">
          <a href={hash("features")} className={navLinkInactive}>
            Features
          </a>
          <Link href="/flow" className={flowHighlighted ? navLinkFlowActive : navLinkInactive}>
            Flow
          </Link>
          <a href={hash("docs")} className={navLinkInactive}>
            Docs
          </a>
          <a href={hash("privacy")} className={navLinkInactive}>
            Privacy
          </a>
          <a href={hash("about")} className={navLinkInactive}>
            About
          </a>
        </div>

        <GetTheAppButton density="compact" />
      </div>
    </nav>
  );
}
