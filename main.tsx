import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// 미리보기할 컴포넌트를 여기서 교체하세요. (default export 컴포넌트를 가리키면 됩니다)
import Demo from "./20260716/index";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("#root 엘리먼트를 찾을 수 없습니다.");
}

createRoot(rootElement).render(
  <StrictMode>
    <Demo />
  </StrictMode>
);
