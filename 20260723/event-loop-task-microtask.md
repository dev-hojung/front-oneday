# 브라우저 이벤트 루프에서 task와 microtask, 그리고 rAF

## 한 줄 정리

`task`는 큰 작업 단위, `microtask`는 현재 task가 끝난 직후 비워지는 우선 대기열, `requestAnimationFrame`은 다음 paint 직전에 실행되는 시각적 예약 지점이다.

## 핵심 원리

브라우저는 JS를 실행할 때 단순히 코드 순서만 따르지 않고, task를 하나 처리한 뒤 microtask를 먼저 비우고, 그 다음 렌더링 기회를 검토한다. 그래서 `click`, `setTimeout`, 네트워크 이벤트 같은 콜백은 task로 들어가고, `Promise.then`과 `queueMicrotask`는 microtask로 들어간다. 이 차이가 중요한 이유는 microtask가 같은 task 안에서 연쇄적으로 실행되며, 길어지면 다음 paint 자체를 늦출 수 있기 때문이다.

즉 `Promise.then`이 "더 빨리 실행된다"는 말은 절반만 맞다. 정확히는 현재 task가 끝난 뒤, 렌더링보다 먼저 실행되기 때문에 코드 순서상 빠르게 보일 뿐이다. 반대로 `setTimeout(fn, 0)`은 최소 지연 후 새로운 task로 들어가므로, 현재 task와 microtask가 끝난 뒤에야 실행 기회를 얻는다. 하지만 메인 스레드가 바쁘면 그 "다음"도 얼마든지 밀릴 수 있다.

`requestAnimationFrame`은 task도 microtask도 아니다. 브라우저가 다음 프레임을 그리기 직전에 콜백을 호출하므로, DOM 변경을 화면에 반영하는 타이밍을 맞추는 데 유리하다. 그래서 상태 계산은 task나 microtask에서 끝내고, 시각적 반영은 rAF로 보내는 식의 분리가 실무에서 자주 쓰인다. 시니어 관점에서는 "무엇을 먼저 실행할까"보다 "언제 화면이 실제로 갱신될까"를 기준으로 코드를 판단해야 한다.

## 코드 예시

```html
<button id="btn">Run</button>
<pre id="log"></pre>

<script>
  const log = (msg) => {
    document.querySelector("#log").textContent += msg + "\n";
  };

  document.querySelector("#btn").addEventListener("click", () => {
    log("task: click start");

    queueMicrotask(() => log("microtask: queueMicrotask"));
    Promise.resolve().then(() => log("microtask: promise"));
    requestAnimationFrame(() => log("rAF: before paint"));
    setTimeout(() => log("task: setTimeout(0)"), 0);

    log("task: click end");
  });
</script>
```

## 실무 관점

입력 반응이 느리거나, 클릭 직후 UI가 예상보다 늦게 바뀌는 버그는 보통 task가 길거나 microtask가 과도하게 쌓인 경우가 많다. 특히 microtask 안에서 다시 microtask를 만드는 패턴은 코드가 짧아 보여도 렌더링 기회를 빼앗기 쉬워서 조심해야 한다.

반대로 화면에 보여줄 최종 상태를 한 번에 반영해야 하는 경우에는 microtask로 정리한 뒤 rAF에서 DOM을 쓰는 편이 안정적이다. 정리 기준은 단순하다. 계산과 정리는 task/microtask, 시각적 반영은 rAF, 다음 턴으로 미루는 완충은 setTimeout이다.

## 확인 질문

1. `Promise.then`과 `queueMicrotask`는 왜 `setTimeout`보다 먼저 실행되는 것처럼 보일까?
2. `microtask`를 많이 쌓으면 왜 화면 갱신이 늦어질 수 있을까?

## 오늘 해볼 실습

1. `index.html`에서 `Promise.then` 안에 다시 `Promise.then`을 넣고, 로그 순서가 어떻게 바뀌는지 확인하기.
2. `setTimeout(0)`과 `requestAnimationFrame`의 로그 위치를 바꿔 보면서, 실제 화면 갱신 타이밍과 비교하기.
3. 클릭 한 번에 여러 상태를 바꾸는 예제를 만들고, 최종 DOM 반영만 rAF로 몰아보는 구조로 리팩터링하기.
