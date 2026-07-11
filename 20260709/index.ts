// ============================================================================
// 판별 유니온(Discriminated Union) + 완전성 검사(Exhaustiveness Check)
// ----------------------------------------------------------------------------
// 핵심 주제: 여러 상태를 하나의 타입으로 표현하고, switch 문에서 모든 경우를
//            "빠짐없이" 처리했는지 컴파일러가 강제하도록 만드는 패턴.
// ============================================================================

// RequestState: 요청의 상태를 나타내는 판별 유니온 타입.
//   - 각 멤버가 공통 필드 `status`를 가지며, 이 필드가 "판별자(discriminant)" 역할.
//   - status 리터럴 값에 따라 함께 존재하는 필드가 달라진다.
//     (예: "success"일 때만 data, "error"일 때만 message)
//   - 덕분에 status를 좁히면(narrowing) TS가 나머지 필드 존재 여부를 정확히 안다.
type RequestState =
  | { status: "idle" } // 초기 대기 상태 (추가 데이터 없음)
  | { status: "loading" } // 로딩 중 (추가 데이터 없음)
  | { status: "success"; data: string[] } // 성공: 결과 배열을 함께 보유
  | { status: "error"; message: string } // 실패: 에러 메시지를 함께 보유
  | { status: "empty" }; // 성공했지만 결과가 비어 있는 상태

// renderMessage: 상태를 사람이 읽을 문자열로 변환한다.
function renderMessage(state: RequestState): string {
  // status(판별자)를 기준으로 분기. 각 case 안에서는 해당 멤버로 타입이 좁혀진다.
  switch (state.status) {
    case "idle":
      return "대기 중";
    case "loading":
      return "불러오는 중";
    case "success":
      // 여기서 state는 { status: "success"; data: string[] }로 좁혀졌으므로
      // state.data에 안전하게 접근할 수 있다.
      return `${state.data.length}개를 불러왔습니다`;
    case "error":
      // 여기서 state는 { status: "error"; message: string }로 좁혀진다.
      return `에러: ${state.message}`;
    case "empty":
      return "데이터가 없습니다";
    default: {
      // 완전성 검사(Exhaustiveness Check):
      //   위에서 모든 status를 처리했다면, 이 지점에 도달하는 state의 타입은
      //   `never`(도달 불가능)가 된다. 그래서 never 변수에 할당이 성공한다.
      //
      //   만약 나중에 RequestState에 새 멤버(예: "cancelled")를 추가하고
      //   위 switch에 case를 빠뜨리면, state가 그 멤버 타입으로 남아
      //   `never`에 할당할 수 없다는 컴파일 에러가 발생한다.
      //   → 즉, "처리 누락"을 런타임이 아니라 컴파일 타임에 잡아준다.
      const exhaustiveCheck: never = state;
      return exhaustiveCheck;
    }
  }
}
