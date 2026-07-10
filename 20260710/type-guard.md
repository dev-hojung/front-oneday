# 2026-07-10 학습 노트: TypeScript 타입 가드와 Type Predicate

## 오늘의 개념

TypeScript의 사용자 정의 타입 가드는 런타임 검사 결과를 컴파일러의 타입 좁히기와 연결하는 함수다.

핵심은 반환 타입이 단순 `boolean`이면 타입이 좁혀지지 않고, `value is SomeType` 형태의 type predicate를 써야 한다는 점이다.

## 핵심 정리

TypeScript는 `typeof`, `instanceof`, `in`, 동등 비교 같은 일부 런타임 조건을 보고 제어 흐름 분석(control flow analysis)을 수행한다. 그래서 `if (typeof value === "string")` 내부에서는 `value`를 `string`으로 좁혀준다.

하지만 이 검사를 함수로 분리하면 이야기가 달라진다. 함수의 반환 타입이 `boolean`이면 TypeScript는 그 함수가 어떤 값을 어떤 타입으로 검증했는지 알 수 없다. 컴파일러 입장에서는 그냥 참이나 거짓을 돌려주는 함수일 뿐이다.

이때 필요한 것이 type predicate다. 반환 타입을 `value is string`처럼 선언하면, TypeScript는 이 함수가 `true`를 반환하는 분기에서 `value`를 `string`으로 취급한다.

단, type predicate는 강력하지만 구현의 정확성을 TypeScript가 완전히 검증하지는 못한다. 개발자가 잘못된 조건을 작성해도 컴파일러는 predicate 선언을 믿는다. 따라서 타입 가드는 런타임 체크와 타입 선언이 반드시 같은 의미를 갖도록 단순하고 명확하게 작성해야 한다.

## boolean 반환은 타입을 좁히지 못한다

```ts
function isString(value: unknown): boolean {
  return typeof value === "string";
}

function printUpper(value: unknown) {
  if (isString(value)) {
    value.toUpperCase();
    // Error:
    // 'value' is of type 'unknown'.
  }
}
```

`isString(value)`가 `true`여도 TypeScript는 `value`가 `string`인지 모른다. 반환 타입이 `boolean`이기 때문이다.

## type predicate를 쓰면 타입이 좁혀진다

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function printUpper(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase());
  }
}

printUpper("hello"); // HELLO
```

`value is string`은 "`true`가 반환되는 분기에서는 `value`를 `string`으로 봐도 된다"는 정보를 컴파일러에게 전달한다.

## 주의할 점: 타입가드는 컴파일러를 속일 수 있다

```ts
function isString(value: unknown): value is string {
  return typeof value === "number";
}

function printUpper(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase());
  }
}

printUpper(123);
```

이 코드는 컴파일될 수 있지만 런타임에서는 문제가 생긴다. `isString`의 선언은 `string`이라고 말하지만, 실제 구현은 `number`를 통과시키기 때문이다.

그래서 실무에서는 타입 가드를 "타입 안정성을 올리는 장치"로 보되, 복잡한 데이터 검증 책임까지 전부 맡기지는 않는 편이 좋다. API 응답, 폼 입력, 외부 JSON처럼 신뢰할 수 없는 데이터는 `zod` 같은 런타임 스키마 검증 도구를 함께 쓰는 판단이 더 안전하다.

## 실무 판단 기준

- `unknown`을 받은 뒤 내부 값에 접근해야 한다면 타입 가드나 스키마 검증이 필요하다.
- 함수로 분리한 타입 체크가 타입 좁히기에 영향을 줘야 한다면 반환 타입은 `boolean`이 아니라 type predicate여야 한다.
- 타입 가드 구현은 복잡하게 만들수록 타입 선언과 런타임 조건이 어긋날 위험이 커진다.
- 객체 타입 검증은 필수 필드와 필드 타입을 함께 확인해야 한다.
- 외부 데이터 검증은 타입 가드보다 스키마 검증 라이브러리가 더 유지보수하기 쉽다.

## 확인 질문

1. `function isUser(value: unknown): boolean`과 `function isUser(value: unknown): value is User`의 차이를 설명할 수 있는가?
2. TypeScript가 type predicate 함수의 내부 구현이 올바른지 완전히 보장하지 못하는 이유는 무엇인가?

## 오늘 해볼 실습

1. `unknown` 타입의 값을 받아 `string[]`인지 검사하는 `isStringArray` 타입 가드를 작성한다.
2. 일부러 잘못된 타입 가드를 만들어 컴파일은 통과하지만 런타임에서 터지는 사례를 확인한다.
3. 간단한 `User` 객체 타입 가드를 작성하고, 필드 존재 여부만 확인했을 때와 필드 타입까지 확인했을 때의 차이를 비교한다.
