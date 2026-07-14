# 2026-07-13 학습 정리

## 주제

TypeScript `keyof`, `T[K]`, 매핑 타입으로 객체 타입을 안전하게 재구성하기

## 오늘 이해한 내용

`keyof T`는 객체 타입 `T`가 가진 키들의 유니온 타입을 만든다.

```ts
type User = {
  id: number;
  name: string;
  isAdmin: boolean;
};

type UserKey = keyof User;
// "id" | "name" | "isAdmin"
```

`K extends keyof T`는 제네릭 타입 `K`가 아무 문자열이나 받을 수 없고, 반드시 `T`의 키 중 하나 또는 일부여야 한다는 제약이다. 이 제약이 있어야 `T[K]`처럼 타입 레벨에서 안전하게 value 타입을 조회할 수 있다.

```ts
type NameType = User["name"];
// string

type IdOrNameType = User["id" | "name"];
// number | string
```

여기서 `T[K]`는 실제 객체 값을 읽는 문법이 아니다. 런타임의 값 조회가 아니라, 타입 시스템 안에서 "이 키가 가리키는 값의 타입이 무엇인가"를 꺼내는 인덱스 접근 타입이다.

## 매핑 타입과 연결

매핑 타입은 키 유니온을 하나씩 순회하면서 새 객체 타입을 만든다.

```ts
type PickFields<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

이 코드는 TypeScript 내장 유틸리티 타입인 `Pick<T, K>`의 핵심 구조와 같다.

- `K extends keyof T`: 고를 수 있는 키를 `T`의 실제 키로 제한한다.
- `[P in K]`: 선택된 키들을 하나씩 순회한다.
- `T[P]`: 원본 객체 타입에서 해당 키의 value 타입을 그대로 가져온다.

즉, `keyof`, `T[K]`, 매핑 타입은 따로 외우는 문법이 아니라 객체 타입을 안전하게 변환하기 위한 한 세트다.

## 실무 관점

실무에서는 DTO, form value, API 응답, 컴포넌트 props처럼 객체 타입의 일부만 고르거나 변형해야 하는 일이 많다. 이때 비슷한 타입을 손으로 다시 작성하면 원본 타입이 바뀌었을 때 파생 타입이 따라오지 못하고, 오래된 타입이 코드베이스에 남는다.

시니어는 이런 중복 타입을 보면 "이 타입은 원본 모델에서 파생될 수 있는가?"를 먼저 본다. 파생될 수 있다면 `Pick`, `Omit`, `Partial`, `Record`, 매핑 타입을 사용해 원본 타입과의 연결을 유지하는 편이 리팩터링에 강하다.

단, 유틸리티 타입을 과하게 중첩하면 읽는 사람이 의도를 파악하기 어려워진다. 타입 안정성만큼 중요한 것은 타입의 의도가 코드 리뷰에서 바로 드러나는 것이다.

## 오늘 예제

예제 코드는 같은 폴더의 `index.ts`에 있다.

핵심 흐름은 다음과 같다.

1. `keyof User`로 `User` 타입의 키 유니온을 만든다.
2. `T[K]`로 특정 키의 value 타입을 꺼낸다.
3. 매핑 타입으로 `Pick`과 비슷한 유틸리티 타입을 직접 만든다.
4. 특정 필드만 수정 가능한 타입을 만들어 실무적인 사용 예를 확인한다.

```ts
type PickFields<T, K extends keyof T> = {
  [P in K]: T[P];
};

type UserSummary = PickFields<User, "id" | "name">;
```

## 확인 질문

1. `K extends keyof T` 없이 `T[K]`를 안전하게 사용할 수 없는 이유는 무엇인가?
2. `[P in K]: T[P]`에서 `P`와 `K`는 각각 어떤 역할을 하는가?

## 다음 실습

1. `PickFields<T, K>`를 직접 작성한 뒤 TypeScript 내장 `Pick<T, K>`와 결과 타입을 비교한다.
2. `ReadonlyFields<T, K>`를 만들어 특정 키만 `readonly`가 되게 해본다.
3. `EditableUserProfile`처럼 실제 화면에서 수정 가능한 필드만 따로 고르는 타입을 만들어본다.
