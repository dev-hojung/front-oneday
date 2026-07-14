// ============================================================================
// 단언 함수(Assertion Function) — asserts value is User
// ----------------------------------------------------------------------------
// 핵심 주제: 반환값 대신 "예외를 던지지 않고 통과하면 그 값은 User다"라고
//            컴파일러에게 알리는 단언 서술어(assertion predicate).
//            호출 이후 코드부터는 별도 if 없이 값이 User로 좁혀진다.
// ============================================================================

type UserRole = "admin" | "editor" | "viewer";

type User = {
  id: string;
  role: UserRole;
};

// assertUser: value가 User가 아니면 throw하고, 통과하면 User임을 단언한다.
//   - 반환 타입 `asserts value is User`가 단언 서술어.
//   - 타입 가드(value is User)와의 차이:
//       · 타입 가드 → boolean을 반환, 호출부에서 if로 감싸 좁힘.
//       · 단언 함수 → 반환값 없음(예외로 실패를 표현), 호출 직후부터 좁혀짐.
//   - 주의: 타입 가드와 마찬가지로 본문의 정확성은 컴파일러가 검증하지 않는다.
function assertUser(value: unknown): asserts value is User {
  // 1) 객체이며 필수 키(id, role)를 갖는지 확인
  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) ||
    !("role" in value)
  ) {
    throw new Error("Invalid user");
  }

  // 2) 각 필드 값을 개별 검증 (아직 unknown이므로 임시 단언)
  const user = value as { id: unknown; role: unknown };
  if (typeof user.id !== "string") {
    throw new Error("Invalid user id");
  }

  // 3) role이 UserRole 중 하나인지 확인.
  //    이전에 "editor"를 "editors"로 오타 내면 유효한 값도 여기서 throw됐다.
  //    → 문자열 리터럴 비교 오타는 컴파일러가 잡지 못하는 대표적 함정.
  if (
    user.role !== "admin" &&
    user.role !== "editor" &&
    user.role !== "viewer"
  ) {
    throw new Error("Invalid user role");
  }
}

// 외부/네트워크 응답처럼 신뢰할 수 없는 값은 unknown으로 둔다.
const responseData: unknown = {
  id: "u_123",
  role: "editor",
};

// 단언 함수 호출. 통과하면 예외 없이 다음 줄로 넘어간다.
assertUser(responseData);

// 여기부터 responseData는 User로 좁혀진다. (if 블록으로 감싸지 않아도 됨)
console.log(responseData.id.toUpperCase());
console.log(responseData.role);

export {};
