"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MarketSlug, MarketConfig, MARKET_SLUGS, MARKET_CONFIGS } from "@/shared/market";
import { clsx } from "../formats";

export default function MarketSwitcher({ current } : { current :MarketSlug}){
    const router = useRouter();
    const sp = useSearchParams();
    const params = new URLSearchParams(sp); // 현재 쿼리 보존

    const buildHref = (slug: MarketSlug) =>
    `/markets/${slug}/returns${params.toString() ? `?${params}` : ""}`;

    return (
        <div className="flex items-center gap-3">
          {/* 데스크탑: 세그먼트 탭 */}
          <nav className="hidden sm:flex rounded-xl bg-zinc-100 p-1">
            {MARKET_SLUGS.map((slug) => {
              const active = slug === current;
              return (
                <Link
                  key={slug}
                  href={buildHref(slug)}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "px-3 py-1.5 text-sm rounded-lg transition",
                    active
                      ? "bg-white shadow text-zinc-900"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  {MARKET_CONFIGS[slug].label}
                </Link>
              );
            })}
          </nav>
    
          {/* 모바일: 셀렉트 */}
          <select
            className="sm:hidden rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            value={current}
            onChange={(e) => router.push(buildHref(e.target.value as MarketSlug))}
          >
            {MARKET_SLUGS.map((slug) => (
              <option key={slug} value={slug}>
                {MARKET_CONFIGS[slug].label}
              </option>
            ))}
          </select>
        </div>
      );
}