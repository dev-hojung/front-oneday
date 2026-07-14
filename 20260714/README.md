# 2026-07-14 학습 정리 - TypeScript Utility Types

## 오늘의 개념

TypeScript의 `Partial`, `Pick`, `Omit`, `Record`는 기존 타입을 재사용해서 새로운 타입을 만드는 유틸리티 타입이다.

실무에서는 단순히 코드를 짧게 쓰기 위한 도구가 아니라, API 요청/응답, 폼 입력값, 서버 관리 필드처럼 데이터의 경계를 안전하게 나누는 데 사용한다.

## Partial

`Partial<T>`는 타입 `T`의 모든 프로퍼티를 선택적으로 만든다.

```ts
type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  createdAt: string;
};

type UpdateUser = Partial<User>;
```

위 타입은 `name`, `email`뿐 아니라 `id`, `role`, `createdAt`까지 모두 선택적으로 허용한다.

그래서 수정 API 요청 타입에 그대로 쓰면, 클라이언트가 수정하면 안 되는 서버 관리 필드까지 payload에 들어갈 수 있다.

## Pick과 함께 좁히기

수정 가능한 필드가 정해져 있다면 `Partial<User>`보다 `Partial<Pick<User, ...>>`가 더 안전하다.

```ts
type UpdateUserRequest = Partial<Pick<User, "name" | "email">>;

function updateUser(id: User["id"], payload: UpdateUserRequest) {
  return {
    id,
    ...payload,
  };
}
```

이 타입은 `name`, `email`만 허용하면서, 둘 중 일부만 보낼 수 있게 만든다.

즉 `Partial`은 "모든 필드를 선택적으로" 만들고, `Pick`은 "허용할 필드만 고르는" 역할을 한다.

## Pick vs Omit

`Pick`은 allow-list 방식이고, `Omit`은 deny-list 방식에 가깝다.

```ts
type SafeUpdateUserRequest = Partial<Pick<User, "name" | "email">>;

type RiskyUpdateUserRequest = Partial<Omit<User, "id" | "createdAt">>;
```

`Omit`은 현재 제외한 필드만 빠진다.

나중에 `status`, `lastLoginAt`, `updatedAt` 같은 서버 관리 필드가 `User`에 추가되면, 그 필드가 자동으로 요청 타입에 포함될 수 있다.

반면 `Pick`은 허용한 필드만 계속 유지되므로, 외부 입력 타입에서는 보수적이고 안전하다.

## Record

`Record<K, V>`는 특정 key 집합에 대해 value 타입을 강제할 때 사용한다.

```ts
type UserStatus = "active" | "invited" | "blocked";

const statusLabel: Record<UserStatus, string> = {
  active: "활성",
  invited: "초대됨",
  blocked: "차단됨",
};
```

`Record<UserStatus, string>`은 `active`, `invited`, `blocked` 키가 모두 있어야 하고, 각 값은 `string`이어야 한다는 뜻이다.

상태값과 라벨, 권한과 메뉴, 라우트와 설정처럼 "정해진 키 전체를 빠짐없이 매핑"해야 할 때 유용하다.

## 실무 판단 기준

입력 DTO, 수정 폼, API payload처럼 외부에서 들어오는 데이터는 가능한 한 `Pick` 기반 allow-list로 설계하는 편이 안전하다.

`Omit`은 내부적으로 기존 타입에서 몇 개만 제외하고 재사용할 때 편하지만, 도메인 타입이 커질수록 의도하지 않은 필드가 타입에 섞일 수 있다.

시니어는 타입을 "컴파일 에러를 없애는 도구"가 아니라, 변경이 들어와도 잘못된 데이터가 경계를 넘지 못하게 막는 설계 장치로 본다.

## 오늘의 핵심 문장

`Partial<User>`는 편하지만 넓고, `Partial<Pick<User, "name" | "email">>`은 좁고 안전하다.

