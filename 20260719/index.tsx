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
    getSnapshot() {
      return count;
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    increment() {
      count += 1;
      listeners.forEach((listener) => listener());
    },
  };
}

const CounterStoreContext = createContext<CounterStore | null>(null);

function useCounterStore() {
  const store = useContext(CounterStoreContext);

  if (store === null) {
    throw new Error("useCounterStore must be used inside CounterStoreContext");
  }

  return store;
}

function ExternalCounter() {
  const store = useCounterStore();
  const count = useSyncExternalStore(store.subscribe, store.getSnapshot);

  console.log("ExternalCounter render:", count);

  return (
    <section>
      <h2>외부 store 값</h2>
      <p>count: {count}</p>
      <button onClick={store.increment}>external store +1</button>
    </section>
  );
}

function ContextOnlyReader() {
  const store = useCounterStore();

  console.log("ContextOnlyReader render");

  return (
    <section>
      <h2>Context로 내려받은 값</h2>
      <p>Context는 store 객체를 전달할 뿐, count 변경을 직접 감지하지 않습니다.</p>
      <button onClick={store.increment}>same store +1</button>
    </section>
  );
}

export default function App() {
  const [store] = useState(createCounterStore);
  const [localCount, setLocalCount] = useState(0);

  console.log("App render:", localCount);

  return (
    <CounterStoreContext value={store}>
      <main style={{ display: "grid", gap: 16, maxWidth: 560 }}>
        <h1>Context vs useSyncExternalStore</h1>

        <section>
          <h2>React state</h2>
          <p>local count: {localCount}</p>
          <button onClick={() => setLocalCount((prev) => prev + 1)}>
            local state +1
          </button>
        </section>

        <ExternalCounter />
        <ContextOnlyReader />
      </main>
    </CounterStoreContext>
  );
}
