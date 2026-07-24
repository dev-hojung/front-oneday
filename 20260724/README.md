# 브라우저 크리티컬 렌더링 패스와 FOUC

## 한 줄 정리

브라우저는 화면을 그리기 전에 중요한 CSS와 일부 리소스를 먼저 확보해야 하므로, 스타일이 늦게 확정되면 FOUC가 보일 수 있고 `@import`나 초반 JS는 첫 페인트를 늦추는 원인이 된다.

## 핵심 원리

브라우저는 HTML을 파싱해서 DOM을 만들고, CSS를 모아 CSSOM을 만든 뒤에야 실제 화면을 그릴 수 있다. 그래서 첫 화면에 필요한 스타일이 아직 준비되지 않으면, 브라우저는 아예 그리기를 늦추거나 나중에 다시 그리게 된다. 이 과정에서 잠깐 기본 스타일이 보였다가, CSS가 도착한 뒤 갑자기 바뀌는 현상을 FOUC라고 이해하면 된다. 문제의 본질은 “예쁘지 않게 보인다”가 아니라, 스타일 확정 전에 사용자에게 중간 상태를 노출했다는 점이다.

`@import`는 다른 스타일시트를 추가로 불러오는데, 그 의존성이 CSS 안에서 다시 이어지기 때문에 스타일 발견과 적용이 순차적으로 길어지기 쉽다. MDN도 `@import`를 stylesheet 상단에만 두도록 제한하고 있는데, 이 규칙 자체가 import 체인을 일찍 결정해야 한다는 뜻이다. 반면 `<link rel="stylesheet">`는 HTML 단계에서 바로 발견되므로, 중요한 CSS를 더 빠르게 확보하기 좋다. JS도 비슷한데, 동기 스크립트는 HTML 파싱을 멈춰서 뒤쪽 DOM과 리소스 발견을 늦출 수 있다. `defer`는 HTML 파싱을 막지 않고, 문서 파싱이 끝난 뒤 실행되므로 초기 렌더를 덜 방해하는 쪽에 속한다. 다만 `defer`가 “렌더를 보장”하는 건 아니고, 단지 파싱을 덜 막는다는 뜻이다.

시니어 관점에서는 “이 리소스가 첫 페인트 전에 꼭 필요한가”를 먼저 묻는다. 필요하다면 critical CSS로 줄이고, 필요하지 않다면 뒤로 미룬다. 그 판단이 없으면 FOUC를 임시로 덮거나, 첫 화면을 위해 너무 많은 것을 앞단에 실어 보내는 실수가 반복된다.

## 코드 예시

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- 첫 화면에 꼭 필요한 스타일만 먼저 로드 -->
    <link rel="stylesheet" href="./critical.css" />

    <!-- 파싱을 막지 않도록 뒤로 미룸 -->
    <script defer src="./app.js"></script>
  </head>
  <body>
    <main class="hero">
      <h1>첫 화면</h1>
      <p>스타일과 스크립트의 우선순위를 분리한다.</p>
    </main>
  </body>
</html>
```

## 실무 관점

운영 환경에서는 `@import`를 습관처럼 쓰는 순간, CSS가 체인처럼 이어지면서 첫 렌더 지점이 뒤로 밀릴 수 있다. 그래서 중요한 스타일은 번들 단계에서 합치거나, 최소한 `link` 기반으로 일찍 발견되게 만든다. 스크립트는 기본적으로 `defer`나 모듈 방식으로 파싱 경합을 줄이고, 정말 초기 실행이 필요한 경우만 예외로 둔다. 성능 지표를 볼 때도 “JS가 느린가”와 “첫 페인트가 늦는가”는 같은 문제가 아닐 수 있다.

## 확인 질문

1. `@import`가 첫 화면에 불리한 이유를 “의존성 발견 시점” 관점으로 설명할 수 있나?
2. `defer`가 DOMContentLoaded와 어떤 관계인지, 그리고 왜 동기 script보다 덜 방해적인지 말할 수 있나?

## 오늘 해볼 실습

1. 프로젝트 안에서 `@import`가 사용된 CSS를 찾아서 `link` 기반 구조로 바꿀 수 있는지 검토하기.
2. `head` 안의 동기 `script`를 `defer`로 바꾼 뒤, 첫 화면 표시와 `DOMContentLoaded` 시점 차이를 비교하기.
3. DevTools Network에서 CSS와 JS의 다운로드 순서, 그리고 첫 페인트보다 앞서야 하는 리소스가 무엇인지 체크하기.

## 참고

- [MDN: `@import`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40import)
- [MDN: `<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script)
- [MDN: Critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)
- [web.dev: Understand the critical path](https://web.dev/learn/performance/understanding-the-critical-path)
