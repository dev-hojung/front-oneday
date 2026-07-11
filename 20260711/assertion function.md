# 2026-07-11 학습 정리

## 주제

TypeScript assertion function: `asserts value is User`

## 오늘 이해한 내용

`value is User`를 반환하는 함수는 사용자 정의 타입 가드다. 이 함수는 `boolean`을 반환하므로, 사용부에서 `if` 같은 분기 처리를 해야 TypeScript가 해당 블록 안에서 값을 `User`로 좁힌다.

```ts
if (isUser(value)) {
  value.id;
}
```

반면 `asserts value is User`를 사용하는 함수는 assertion function이다. 이 함수는 "정상적으로 끝났다면 value는 User라고 봐도 된다"는 계약을 TypeScript에게 알려준다. 그래서 사용부에서는 별도의 `if` 분기 없이 함수 호출 이후의 코드에서 값이 `User`로 좁혀진다.

```ts
assertUser(value);
value.id;
```

중요한 점은 assertion function 내부에서 검증 실패 시 반드시 이후 흐름을 끊어야 한다는 것이다. 보통 `throw new Error(...)`를 사용한다. 실패했는데도 함수가 정상 종료되면 TypeScript는 값을 `User`로 믿기 때문에 런타임 버그가 발생할 수 있다.

## 타입 가드와 assertion function 비교

### `value is User`

- 반환값은 `boolean`이다.
- 사용부에서 `if`, `filter`, 조건식 등으로 분기해야 타입이 좁혀진다.
- "true이면 User다"라는 의미다.

```ts
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "id" in value;
}
```

### `asserts value is User`

- 반환값을 직접 사용하지 않는다.
- 함수가 정상 종료되면 이후 코드에서 타입이 좁혀진다.
- "이 함수가 통과하면 User다"라는 의미다.

```ts
function assertUser(value: unknown): asserts value is User {
  if (typeof value !== "object" || value === null || !("id" in value)) {
    throw new Error("Invalid user");
  }
}
```

## TypeScript가 보장하지 못하는 것

TypeScript는 assertion function의 선언을 신뢰하지만, 내부 검증 로직이 정말 완전한지는 증명하지 못한다.

```ts
function assertUser(value: unknown): asserts value is User {
  // 잘못된 구현이어도 TypeScript는 이 선언을 믿는다.
}
```

이 함수는 아무 검증도 하지 않지만, TypeScript는 호출 이후의 `value`를 `User`로 좁힌다. 즉, assertion function은 타입 시스템과 런타임 검증 사이의 계약이다. 계약을 잘못 작성하면 컴파일러는 통과하지만 런타임 안정성은 깨진다.

## 실무 관점

API 응답, `localStorage`, URL query, form 입력처럼 외부에서 들어오는 값은 처음에는 `unknown`에 가깝게 봐야 한다. 이 값들을 애플리케이션 내부 타입으로 들여보낼 때 타입 가드나 assertion function을 사용하면 경계가 명확해진다.

단, assertion function은 호출 이후 코드 흐름 전체에 영향을 주기 때문에 타입 가드보다 더 강한 계약이다. 그래서 시니어는 이런 함수를 볼 때 함수 이름보다 내부 검증의 완성도를 먼저 본다. 특히 필수 필드, 리터럴 유니온, 중첩 객체, 배열 구조를 충분히 확인하는지 코드 리뷰에서 확인해야 한다.

## 오늘 예제

예제 코드는 같은 폴더의 `index.ts`에 있다.

핵심 흐름은 다음과 같다.

1. 외부 데이터인 `responseData`를 `unknown`으로 둔다.
2. `assertUser(responseData)`로 런타임 검증을 수행한다.
3. 검증이 통과하면 이후 코드에서 `responseData`를 `User`로 사용한다.

```ts
assertUser(responseData);

console.log(responseData.id.toUpperCase());
console.log(responseData.role);
```

## 확인 질문

1. `value is User`와 `asserts value is User`의 가장 큰 사용부 차이는 무엇인가?
2. assertion function 내부 구현이 잘못되어도 TypeScript가 컴파일 에러를 내지 못하는 이유는 무엇인가?

## 다음 실습

1. `isUser(value): value is User` 버전을 직접 만들고 `assertUser`와 사용부 코드를 비교한다.
2. `role` 검증을 제거한 나쁜 assertion function을 만들어 보고 TypeScript가 잡지 못하는 지점을 확인한다.
3. `User` 타입에 `profile: { nickname: string }` 같은 중첩 객체를 추가하고 검증 로직을 확장한다.
