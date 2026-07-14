// ============================================================================
// keyof, T[K], 매핑 타입(Mapped Type)
// ----------------------------------------------------------------------------
// 핵심 주제: 객체 타입의 키를 타입으로 꺼내고, 그 키에 해당하는 value 타입을
//            다시 조회해서 안전한 파생 타입을 만든다.
// ============================================================================

export {};

type User = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  profile: {
    nickname: string;
    avatarUrl?: string;
  };
};

// 1) keyof T: 객체 타입 T의 키들을 유니온 타입으로 만든다.
type UserKey = keyof User;
// "id" | "name" | "email" | "isAdmin" | "profile"

const userKey: UserKey = "email";
console.log("userKey:", userKey);

// 2) T[K]: T 타입에서 K 키가 가리키는 value의 타입을 꺼낸다.
type UserName = User["name"];
type UserProfile = User["profile"];
type UserPrimitiveField = User["id" | "name" | "email" | "isAdmin"];
// number | string | boolean

const userName: UserName = "Hojeong";
const profile: UserProfile = {
  nickname: "front-one-day",
};

console.log(userName.toUpperCase());
console.log(profile.nickname);

// 3) K extends keyof T: K를 T의 실제 키로 제한한다.
//    이 제약이 있어야 T[K]가 안전하다.
function getValue<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}

const user: User = {
  id: 1,
  name: "Kim",
  email: "kim@example.com",
  isAdmin: false,
  profile: {
    nickname: "hojeong",
  },
};

const userEmail = getValue(user, "email");
// userEmail: string

const userProfile = getValue(user, "profile");
// userProfile: { nickname: string; avatarUrl?: string }

console.log(userEmail.toLowerCase());
console.log(userProfile.nickname);

// 4) 매핑 타입: 선택된 키를 하나씩 순회해 새 객체 타입을 만든다.
//    TypeScript 내장 Pick<T, K>의 핵심 구조와 같다.
type PickFields<T, K extends keyof T> = {
  [P in K]: T[P];
};

type UserSummary = PickFields<User, "id" | "name">;

const summary: UserSummary = {
  id: user.id,
  name: user.name,
};

console.log(summary);

// 5) 실무 예시: 특정 필드만 수정 가능한 payload 타입 만들기.
//    원본 User 타입에서 name, email, profile만 고르고, 그 필드들을 선택 입력으로 만든다.
type EditableUserProfile = Partial<PickFields<User, "name" | "email" | "profile">>;

const updatePayload: EditableUserProfile = {
  name: "Kim Hojeong",
  profile: {
    nickname: "senior-in-progress",
  },
};

console.log(updatePayload);
