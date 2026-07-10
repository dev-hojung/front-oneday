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
