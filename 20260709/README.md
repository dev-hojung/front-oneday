# 2026-07-09 학습 기록

## 오늘의 개념

TypeScript의 `never`를 이용한 exhaustive checking.

판별 유니온을 `switch`로 처리할 때 모든 분기를 빠짐없이 다뤘는지 컴파일 단계에서 확인하는 패턴이다. 단순히 `default`에서 `"알 수 없음"` 같은 기본값을 반환하면 런타임 에러는 피할 수 있지만, 새로운 유니온 케이스가 추가됐을 때 분기 누락을 알아차리기 어렵다. 이 경우 화면에는 fallback 값이 나오기 때문에, 의도된 기본 처리인지 실제 버그인지 구분이 흐려진다.

반대로 `const exhaustiveCheck: never = state`를 사용하면 "이 지점에는 절대 도달하면 안 된다"는 의도를 타입으로 표현할 수 있다. 모든 케이스가 처리된 상태라면 `default` 안의 `state`는 남은 타입이 없으므로 `never`가 된다. 하지만 새로운 유니온 값이 추가되고 `case`가 누락되면 `state`는 더 이상 `never`가 아니기 때문에 TypeScript가 컴파일 에러로 알려준다.

## 예제

```tsx
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string }
  | { status: "empty" };

function renderMessage(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "대기 중";
    case "loading":
      return "불러오는 중";
    case "success":
      return `${state.data.length}개를 불러왔습니다`;
    case "error":
      return `에러: ${state.message}`;
    case "empty":
      return "데이터가 없습니다";
    default: {
      const exhaustiveCheck: never = state;
      return exhaustiveCheck;
    }
  }
}
```

## 핵심 정리

- `never`는 값이 존재할 수 없는 타입이다.
- exhaustive checking은 모든 유니온 케이스를 처리했는지 확인하는 방식이다.
- `default`에서 fallback 문자열을 반환하면 분기 누락 버그가 조용히 숨을 수 있다.
- `const exhaustiveCheck: never = state`는 누락된 분기를 컴파일 에러로 드러낸다.
- UI 상태, API 응답 상태, 권한 상태처럼 케이스가 늘어날 수 있는 도메인에서 특히 유용하다.

## 실무 관점

시니어는 단순히 "에러가 안 나게" 코드를 작성하지 않고, 나중에 요구사항이 바뀌었을 때 누락을 빨리 발견할 수 있는 구조를 만든다. exhaustive checking은 타입 시스템을 테스트 보조 장치처럼 활용하는 대표적인 예다. 상태가 늘어나는 순간 컴파일러가 처리 누락을 알려주기 때문에, 리뷰나 QA에서 뒤늦게 발견될 버그를 앞단에서 줄일 수 있다.

## 확인 질문

1. `default`에서 `"알 수 없음"`을 반환하는 방식은 왜 분기 누락 버그를 숨길 수 있을까?
2. 모든 `case`가 처리됐을 때 `default` 안의 `state` 타입이 `never`가 되는 이유는 무엇일까?

## 오늘 해볼 실습

1. `RequestState`에 `{ status: "retrying" }`을 추가하고 `case`를 작성하지 않았을 때 TypeScript 에러가 나는지 확인한다.
2. `default`에서 `"알 수 없음"`을 반환하는 방식으로 바꿔보고, 같은 누락 상황에서 에러가 사라지는지 비교한다.
3. 실제 프로젝트의 로딩/성공/실패 UI 상태 중 하나를 판별 유니온으로 바꿔 exhaustive checking을 적용해본다.
