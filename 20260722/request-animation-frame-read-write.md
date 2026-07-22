# requestAnimationFrame과 DOM 읽기/쓰기 분리

## 한 줄 정리

`requestAnimationFrame`은 다음 페인트 직전에 실행되어 시각적 DOM 쓰기를 예약하는 도구이고, DOM을 바꾼 직후 레이아웃 값을 읽는 패턴은 강제 동기 레이아웃을 유발할 수 있다.

## 핵심 원리

브라우저는 JS를 한 줄씩 실행하는 동안에도 렌더링 비용을 무한정 밀어두지 않는다. 내부적으로 스타일 계산, 레이아웃, 페인트, 컴포지팅은 서로 다른 단계로 나뉘고, 어떤 단계는 이전 변경이 반영되기 전까지 미뤄질 수 있다.

`requestAnimationFrame`은 이 흐름에서 "다음 화면을 그리기 직전"에 콜백을 실행하도록 브라우저에 맡기는 API다. 그래서 애니메이션처럼 눈에 보이는 변경을 다음 프레임에 맞추는 데 적합하다. 단, `setTimeout(fn, 16)`처럼 시간을 대충 맞추는 것과는 다르다. 실제로는 디스플레이 주사율과 브라우저의 프레임 스케줄링에 맞춰 호출되며, 백그라운드 탭에서는 더 느리게 동작할 수 있다.

문제는 DOM을 쓴 직후 곧바로 `getBoundingClientRect()`, `offsetHeight`, `scrollTop` 같은 값을 읽는 경우다. 브라우저는 아직 미뤄둔 스타일/레이아웃 계산을 지금 당장 끝내야 하므로 강제 동기 레이아웃이 발생할 수 있다. 이 비용이 한 번이면 덜 아프지만, 읽기와 쓰기가 반복해서 섞이면 layout thrashing으로 커진다.

그래서 실무에서는 "읽기 먼저, 쓰기 나중" 또는 "측정 단계와 반영 단계를 분리"하는 식으로 구조를 잡는다. 시니어 관점에서 중요한 건 `rAF` 자체가 아니라, 브라우저가 레이아웃을 언제 계산해야 하는지 예측 가능하게 만드는 것이다.

## 코드 예시

```html
<div id="box" style="width: 80px; height: 80px; background: tomato;"></div>
<button id="move">move</button>

<script>
  const box = document.querySelector("#box");
  const button = document.querySelector("#move");

  button.addEventListener("click", () => {
    // 읽기: 먼저 현재 레이아웃 값을 측정한다.
    const currentLeft = box.getBoundingClientRect().left;

    // 쓰기: 화면 반영은 다음 프레임 직전에 예약한다.
    requestAnimationFrame(() => {
      box.style.transform = `translateX(${currentLeft + 100}px)`;
    });
  });
</script>
```

## 실무 관점

스크롤 핸들러, 드래그 UI, 리스트 가상화 같은 영역에서는 이 패턴이 바로 성능 차이로 이어진다. `rAF`를 썼다고 자동으로 빨라지는 게 아니라, 같은 이벤트 흐름 안에서 측정과 반영을 분리했을 때 효과가 난다.

애니메이션은 보통 `transform`과 `opacity`가 유리하고, 레이아웃을 건드리는 속성은 비용이 커지기 쉽다. 그래서 "무슨 속성을 바꾸는가"와 "바꾸기 전에 무엇을 읽는가"를 같이 봐야 한다. 코드리뷰에서는 `style.xxx`와 레이아웃 읽기가 같은 루프 안에서 섞이는지 먼저 확인하는 게 좋다.

## 확인 질문

1. `requestAnimationFrame`이 `setTimeout(fn, 16)`보다 프레임 작업에 더 적합한 이유는 뭐야?
2. DOM을 수정한 뒤 바로 `getBoundingClientRect()`를 읽으면 왜 비용이 커질 수 있을까?

## 오늘 해볼 실습

1. `index.html`에서 DOM 읽기와 쓰기를 의도적으로 섞은 버전을 만들고, Performance 패널에서 Layout 이벤트가 어떻게 늘어나는지 확인하기.
2. 같은 UI를 `읽기 먼저 / 쓰기 나중` 구조로 바꿔서 코드 구조가 어떻게 단순해지는지 비교하기.
3. `transform` 기반 이동과 `left` 변경 기반 이동을 각각 만들어 보고, 체감되는 렌더링 차이를 기록하기.
