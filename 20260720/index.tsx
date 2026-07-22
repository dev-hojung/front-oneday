const reactTools = [
  {
    name: "React.memo",
    description: "props가 바뀌지 않은 컴포넌트의 재렌더를 건너뛴다.",
  },
  {
    name: "useMemo",
    description: "비싼 계산 결과를 의존성 기준으로 캐싱한다.",
  },
  {
    name: "useCallback",
    description: "함수 참조를 안정화해 memoized child의 불필요한 렌더를 줄인다.",
  },
  {
    name: "useDeferredValue / startTransition",
    description: "급하지 않은 UI 업데이트의 우선순위를 낮춘다.",
  },
  {
    name: "리스트 가상화",
    description: "react-window처럼 보이는 행만 렌더링해 긴 목록 비용을 줄인다.",
  },
  {
    name: "React DevTools Profiler",
    description: "어떤 컴포넌트가 왜, 얼마나 오래 렌더링됐는지 측정한다.",
  },
];

const browserTools = [
  {
    name: "content-visibility: auto",
    description: "화면 밖 콘텐츠의 렌더링 작업을 필요할 때까지 미룬다.",
  },
  {
    name: "contain",
    description: "요소 내부 변화가 바깥 레이아웃과 페인트에 미치는 영향을 제한한다.",
  },
  {
    name: "contain-intrinsic-size",
    description: "아직 렌더링하지 않은 콘텐츠의 예상 크기를 예약해 스크롤 흔들림을 줄인다.",
  },
  {
    name: "transform / opacity",
    description: "레이아웃 재계산 없이 컴포지팅 중심으로 처리하기 쉬운 애니메이션 속성이다.",
  },
  {
    name: "will-change",
    description: "곧 바뀔 속성을 브라우저에 힌트로 알려 최적화 준비를 돕는다.",
  },
  {
    name: "Chrome DevTools Performance",
    description: "레이아웃, 페인트, 스크립트 비용이 어디서 발생하는지 추적한다.",
  },
];

function ToolList({
  title,
  items,
}: {
  title: string;
  items: Array<{ name: string; description: string }>;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.name} className="rounded-lg border border-slate-200 bg-white p-4">
            <strong className="block text-sm font-semibold text-slate-950">{item.name}</strong>
            <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function RenderingCostConceptPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-10 px-5 py-10 text-slate-900">
      <header className="space-y-3">
        <p className="text-sm font-medium text-blue-700">오늘의 개념</p>
        <h1 className="text-3xl font-bold tracking-normal text-slate-950">
          React 렌더링 비용과 브라우저 렌더링 비용은 다르다
        </h1>
        <p className="text-base leading-7 text-slate-700">
          React 최적화는 컴포넌트 트리 안의 불필요한 계산을 줄이는 일이고, 브라우저 최적화는
          DOM이 실제 픽셀로 바뀌는 과정의 비용을 줄이는 일이다.
        </p>
      </header>

      <ToolList title="React 렌더링 비용을 줄이는 도구" items={reactTools} />
      <ToolList title="브라우저 렌더링 비용을 줄이는 도구" items={browserTools} />

      <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-xl font-semibold text-slate-950">
          화면 밖 콘텐츠의 크기를 모를 때 생기는 문제
        </h2>
        <p className="leading-7 text-slate-700">
          <code className="rounded bg-white px-1.5 py-0.5 text-sm">content-visibility: auto</code>
          를 쓰면 브라우저는 화면 밖 콘텐츠의 렌더링을 미룰 수 있다. 하지만 아직 실제 높이를
          계산하지 않았다면 전체 스크롤 길이를 정확히 알 수 없어, 요소가 보이는 순간 스크롤바
          위치나 레이아웃이 흔들릴 수 있다.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-50">
          <code>{`.article-card-list {
  content-visibility: auto;
  contain-intrinsic-size: 320px;
}`}</code>
        </pre>
        <p className="leading-7 text-slate-700">
          <code className="rounded bg-white px-1.5 py-0.5 text-sm">contain-intrinsic-size</code>
          는 아직 렌더링하지 않은 콘텐츠가 대략 어느 정도 크기인지 브라우저에 알려주는 예약
          공간이다. 시니어는 최적화 도구를 쓰기 전에 병목이 React 렌더링인지, 브라우저의
          레이아웃/페인트인지 먼저 측정한다.
        </p>
      </section>
    </main>
  );
}
