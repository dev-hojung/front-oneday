// ============================================================================
// 타입 서술어(Type Predicate) 기반 사용자 정의 타입 가드
// ----------------------------------------------------------------------------
// 핵심 주제: 반환 타입을 `value is User`로 선언하면, 이 함수가 true를 반환할 때
//            컴파일러가 인자를 User로 "좁혀준다(narrowing)".
//            반환 타입을 그냥 boolean으로 두면 이런 좁힘이 일어나지 않는다.
// ============================================================================

type User = {
  id: string;
  name: string;
  role: "admin" | "member" | "guest";
};

// isUser: value가 User 형태인지 런타임에 검사하는 사용자 정의 타입 가드.
//   - 반환 타입 `value is User`가 타입 서술어(type predicate).
//   - 런타임 동작은 boolean 반환과 동일하지만, TS에게 "true면 value는 User"라고 알린다.
//   - 주의: 함수 본문의 정확성은 컴파일러가 검증하지 않는다. 로직이 틀려도
//           타입 안전성이 "거짓으로" 보장될 수 있으므로 본문을 신중히 작성해야 한다.
function isUser(value: unknown): value is User {
  // 1) 객체이면서 null이 아닌지 먼저 확인 (typeof null === "object" 이므로 별도 체크 필요)
  if (typeof value !== "object" || value === null) return false;

  // 2) 인덱싱 가능한 형태로 임시 단언하여 각 필드를 검사한다.
  const candidate = value as Record<string, unknown>;

  // 3) 각 필드의 런타임 타입을 확인한다.
  //    ⚠️ role 검사에 "guest"가 빠져 있다. User.role은 "guest"도 허용하지만
  //       여기서는 admin/member만 통과시키므로, 실제 guest 유저는 false가 된다.
  //       (타입 가드 본문 오류의 대표적 예시 — 컴파일러는 잡아주지 않는다.)
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    (candidate.role === "admin" || candidate.role === "member")
  );
}

// 외부에서 들어온 값은 신뢰할 수 없으므로 unknown으로 받는다.
const raw: unknown = JSON.parse(
  '{"id":"u_1","name":"Hojeong","role":"member"}',
);

// isUser로 좁히면, if 블록 안에서 raw는 User로 취급된다.
if (isUser(raw)) {
  // raw: User → 프로퍼티 접근이 타입 안전
  console.log(raw.name.toUpperCase());
  console.log(raw.role);
} else {
  // 여기서 raw는 User가 아님이 확정된 분기
  console.error("Invalid user payload");
}
