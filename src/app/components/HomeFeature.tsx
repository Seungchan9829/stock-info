"use client";

import * as React from "react";

// ✅ shadcn/ui 없이도 바로 쓸 수 있는 경량 UI 컴포넌트들
function cn(...cls: Array<string | undefined>) {
  return cls.filter(Boolean).join(" ");
}

type DivProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };

const Card = ({ className, ...props }: DivProps) => (
  <div className={cn("rounded-2xl border bg-white shadow-sm", className)} {...props} />
);
const CardHeader = ({ className, ...props }: DivProps) => (
  <div className={cn("p-5 flex flex-row items-center gap-3", className)} {...props} />
);
const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-xl font-semibold", className)} {...props} />
);
const CardContent = ({ className, ...props }: DivProps) => (
  <div className={cn("px-5 pb-5 space-y-2 text-sm leading-relaxed text-zinc-600", className)} {...props} />
);
const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs", className)} {...props} />
);

// 간단한 아이콘 (이모지 사용) — lucide-react 미설치 환경 호환
const Icon = ({ label }: { label: "down" | "gauge" | "line" }) => (
  <span aria-hidden className="text-lg">
    {label === "down" ? "📉" : label === "gauge" ? "📊" : "📈"}
  </span>
);

// 👇 framer-motion 없이 스크롤 시 부드럽게 나타나는 경량 컴포넌트
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-500 will-change-transform",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function HomeFeatures() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <Reveal className="mb-8 text-center">
        {/* 페이지 상단 안내 */}
        <div className="mb-2 text-xs text-zinc-600">지원종목 : 나스닥100</div>
        <Badge className="mb-3 rounded-full px-3 py-1 text-xs">기능 소개</Badge>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">시장 흐름을 한눈에 읽는 3가지 인사이트</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base">
          급락 탐지, 수익률 대시보드, 신고가 부근 종목으로 리스크와 모멘텀을 균형 있게 살펴보세요.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* 1) 급락 종목 */}
        <Reveal delay={0}>
          <Card className="h-full">
            <CardHeader>
              <div className="rounded-xl border p-2"><Icon label="down" /></div>
              <CardTitle>급락 종목</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                최근 하락폭이 <span className="font-medium text-zinc-900">1년 평균 변동성</span> 대비 이례적으로 큰 종목을 자동 탐지합니다.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>과매도 신호로 <span className="font-medium text-zinc-900">반등 후보</span>를 빠르게 포착</li>
                <li>이상 하락으로 <span className="font-medium text-zinc-900">리스크 점검</span>에 활용</li>
              </ul>
            </CardContent>
          </Card>
        </Reveal>

        {/* 2) 수익률 대시보드 */}
        <Reveal delay={80}>
          <Card className="h-full">
            <CardHeader>
              <div className="rounded-xl border p-2"><Icon label="gauge" /></div>
              <CardTitle>수익률 대시보드</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <span className="font-medium text-zinc-900">1일·1주·1개월·3개월·6개월</span> 수익률을 한눈에 비교합니다.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>강한 흐름의 <span className="font-medium text-zinc-900">주도주</span> 식별</li>
                <li>단기/중기 변화로 <span className="font-medium text-zinc-900">턴어라운드</span> 후보 점검</li>
              </ul>
            </CardContent>
          </Card>
        </Reveal>

        {/* 3) 신고가 부근 종목 */}
        <Reveal delay={160}>
          <Card className="h-full">
            <CardHeader>
              <div className="rounded-xl border p-2"><Icon label="line" /></div>
              <CardTitle>신고가 부근 종목</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                최근 <span className="font-medium text-zinc-900">1년 신고가의 -10%</span> 이내에 위치한 종목을 선별해 추세 강도를 확인합니다.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>상승 추세의 <span className="font-medium text-zinc-900">지속성</span> 점검</li>
                <li>돌파 시나리오 및 <span className="font-medium text-zinc-900">관심 리스트</span> 관리</li>
              </ul>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
