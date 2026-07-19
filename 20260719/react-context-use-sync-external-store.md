# React Context와 useSyncExternalStore

## 한 줄 정리

Context는 React 트리 안에서 값을 전달하는 도구이고, `useSyncExternalStore`는 React 바깥에서 변하는 값을 React 렌더링 모델과 일관되게 연결하는 도구다.

## 핵심 원리

Context는 Provider가 가진 `value`를 하위 컴포넌트에서 직접 props로 전달하지 않고 읽게 해준다. 그래서 테마, 로그인 사용자, 언어 설정처럼 여러 컴포넌트가 공통으로 알아야 하는 값을 내려줄 때 유용하다.

하지만 Context 자체가 외부 store는 아니다. Context의 핵심 역할은 "값 전달"이다. Provider의 `value`가 바뀌면 그 Context를 읽는 컴포넌트들이 다시 렌더링될 수 있지만, React 바깥의 mutable 값이 바뀌었다는 사실을 자동으로 추적해주지는 않는다.

`useSyncExternalStore`는 이 지점에서 필요하다. React 외부에 있는 store, 브라우저 API, 커스텀 이벤트 기반 상태처럼 React state가 아닌 값은 React가 스스로 변경 시점을 알 수 없다. 그래서 외부 store는 `subscribe`로 "값이 바뀌었다"는 신호를 React에 알려주고, React는 `getSnapshot`으로 현재 값을 읽는다.

중요한 점은 외부 store가 변경될 때마다 무조건 화면이 다시 그려진다고 말하면 부정확하다는 것이다. React는 변경 알림을 받은 뒤 `getSnapshot()`을 다시 호출하고, 이전 snapshot과 새 snapshot을 `Object.is` 기준으로 비교한다. snapshot이 달라졌다고 판단될 때 해당 Hook을 사용하는 컴포넌트가 리렌더링된다.

따라서 Context와 `useSyncExternalStore`는 경쟁 관계가 아니다. 실무에서는 Context로 store 객체 자체를 전달하고, 실제 store 값 구독은 `useSyncExternalStore`로 처리하는 조합이 자주 나온다. 시니어는 "전역으로 내려야 하는가"와 "변경을 구독해야 하는가"를 분리해서 판단한다.

## 코드 예시

```tsx
import { createContext, useContext, useState, useSyncExternalStore } from "react";

type CounterStore = {
  getSnapshot: () => number;
  subscribe: (listener: () => void) => () => void;
  increment: () => void;
};

function createCounterStore(): CounterStore {
  let count = 0;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => count,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    increment() {
      count += 1;
      listeners.forEach((listener) => listener());
    },
  };
}

const CounterStoreContext = createContext<CounterStore | null>(null);

function Counter() {
  const store = useContext(CounterStoreContext);

  if (store === null) {
    throw new Error("CounterStoreContext가 필요합니다.");
  }

  const count = useSyncExternalStore(store.subscribe, store.getSnapshot);

  return <button onClick={store.increment}>count: {count}</button>;
}

export default function App() {
  const [store] = useState(createCounterStore);

  return (
    <CounterStoreContext value={store}>
      <Counter />
    </CounterStoreContext>
  );
}
```

## 실무 관점

Context에 자주 바뀌는 값을 직접 넣으면 그 값을 읽는 컴포넌트 범위 전체가 렌더링 영향권에 들어간다. 반대로 외부 store 객체는 안정적으로 Context로 내려주고, 필요한 컴포넌트만 `useSyncExternalStore`로 snapshot을 구독하면 렌더링 범위를 더 명확하게 제어할 수 있다.

상태관리 라이브러리들이 selector, subscription, snapshot 같은 개념을 중요하게 다루는 이유도 여기에 있다. 단순히 "전역 상태니까 Context"가 아니라, 값의 변경 빈도와 읽는 컴포넌트의 범위를 같이 봐야 한다. 코드리뷰에서는 `Provider value`의 참조 안정성, store의 unsubscribe 처리, snapshot이 매번 새 객체를 반환하지 않는지까지 확인해야 한다.

## 확인 질문

1. Context는 값을 전달할 수 있는데, 왜 외부 store 변경을 다룰 때 `useSyncExternalStore`가 따로 필요할까?
2. `getSnapshot()`이 매번 새 객체를 반환하면 어떤 렌더링 문제가 생길 수 있을까?

## 오늘 해볼 실습

1. `index.tsx`를 실행한 뒤 `local state +1`과 `external store +1`을 눌러 어떤 컴포넌트가 렌더링되는지 콘솔로 비교하기.
2. `getSnapshot()`이 `{ count }`처럼 매번 새 객체를 반환하도록 바꿔보고 React가 어떻게 반응하는지 확인하기.
3. Context에 `count`를 직접 넣는 버전과 store 객체만 넣는 버전을 나누어 렌더링 범위를 비교하기.
