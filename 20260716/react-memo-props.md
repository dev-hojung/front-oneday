# React.memo와 props 참조 안정성

## 오늘의 핵심

`React.memo`는 컴포넌트의 이전 props와 다음 props를 비교해서, props가 같다고 판단되면 해당 컴포넌트의 렌더링을 건너뛰게 해주는 최적화 도구다. 하지만 `memo`는 렌더링을 무조건 줄여주는 장치가 아니라, props 비교 비용과 참조 안정성까지 함께 고려해야 하는 도구다.

## 1. 함수, 객체, 배열 props를 의심한다

`React.memo`의 기본 비교는 얕은 비교다. 숫자, 문자열, boolean 같은 원시값은 값 자체를 비교하기 쉽지만, 함수, 객체, 배열은 참조값이다.

즉, 내용이 같아 보여도 렌더링 때마다 새로 만들어지면 React 입장에서는 다른 props로 본다.

```tsx
const ProductCard = memo(function ProductCard({
  product,
  onAdd,
}: {
  product: { id: number; name: string; price: number };
  onAdd: (id: number) => void;
}) {
  console.log("ProductCard render");

  return (
    <article>
      <h2>{product.name}</h2>
      <p>{product.price.toLocaleString()}원</p>
      <button onClick={() => onAdd(product.id)}>담기</button>
    </article>
  );
});

export default function ProductPage() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <button onClick={() => setCount((value) => value + 1)}>
        부모 상태 변경: {count}
      </button>

      {/* 매 렌더링마다 product 객체와 onAdd 함수가 새로 만들어진다. */}
      <ProductCard
        product={{ id: 1, name: "기계식 키보드", price: 129000 }}
        onAdd={(id) => console.log(`${id}번 상품을 담았습니다.`)}
      />
    </main>
  );
}
```

위 코드에서는 `ProductCard`에 `memo`를 걸어도 부모가 렌더링될 때마다 `product`와 `onAdd`의 참조가 바뀐다. 그래서 `ProductCard`는 props가 바뀌었다고 판단하고 다시 렌더링된다.

이때 선택지는 크게 두 가지다.

- `useMemo`, `useCallback`으로 참조를 안정화한다.
- props 구조를 더 단순하게 바꿔 원시값 중심으로 전달한다.

```tsx
export default function ProductPage() {
  const [count, setCount] = useState(0);

  const product = useMemo(
    () => ({
      id: 1,
      name: "기계식 키보드",
      price: 129000,
    }),
    []
  );

  const handleAdd = useCallback((id: number) => {
    console.log(`${id}번 상품을 담았습니다.`);
  }, []);

  return (
    <main>
      <button onClick={() => setCount((value) => value + 1)}>
        부모 상태 변경: {count}
      </button>

      <ProductCard product={product} onAdd={handleAdd} />
    </main>
  );
}
```

## 2. 비교 자체도 비용이다

`memo`는 렌더링 전에 이전 props와 다음 props를 비교한다. 이 비교 비용은 공짜가 아니다.

컴포넌트 렌더링이 매우 가볍거나 props가 거의 매번 바뀐다면, `memo`는 성능 최적화가 아니라 불필요한 복잡도일 수 있다. 특히 모든 컴포넌트에 습관적으로 `memo`를 붙이면, 이 컴포넌트가 정말 렌더링 비용이 큰지, props 안정성이 보장되는지 코드만 보고 판단하기 어려워진다.

`memo`는 "이 컴포넌트는 부모가 자주 렌더링되어도 같은 props라면 다시 렌더링하지 않아도 된다"는 의도를 드러낼 때 의미가 있다.

## 실무 판단 기준

`memo`를 고려할 만한 경우는 다음과 같다.

- 자식 컴포넌트 렌더링 비용이 실제로 크다.
- 부모는 자주 렌더링되지만 자식 props는 자주 바뀌지 않는다.
- 리스트 아이템처럼 같은 구조의 컴포넌트가 많이 반복된다.
- React DevTools Profiler로 불필요한 렌더링이 확인됐다.

반대로 다음 경우에는 보통 `memo`를 붙이지 않는 편이 낫다.

- 단순한 텍스트, 버튼, 작은 presentational component다.
- props가 매번 새 객체, 새 배열, 새 함수로 바뀐다.
- "혹시 모르니까" 붙이는 수준이다.
- 커스텀 비교 함수가 렌더링보다 더 복잡하다.

시니어는 `memo`를 먼저 붙이지 않는다. 먼저 렌더링이 실제 병목인지 확인하고, props 설계와 참조 안정성을 본 뒤, 마지막에 필요한 곳에만 최적화를 적용한다.

## 확인 질문

1. `React.memo`를 사용했는데도 자식 컴포넌트가 계속 렌더링된다면, 가장 먼저 어떤 props를 의심해야 할까?
2. 모든 컴포넌트에 `memo`를 붙이는 방식이 왜 좋은 최적화 전략이 아닐까?

## 오늘 해볼 실습

1. `index.tsx` 예제에서 `useMemo`, `useCallback`을 제거하고 `console.log`로 렌더링 차이를 확인해본다.
2. `ProductCard`의 props를 `product` 객체 하나가 아니라 `id`, `name`, `price` 원시값으로 나눠 전달해본다.
3. React DevTools Profiler를 켜고 부모 상태 변경 시 `ProductCard`가 렌더링되는지 비교해본다.
