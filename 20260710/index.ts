type User = {
  id: string;
  name: string;
  role: "admin" | "member" | "guest";
};

function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    (candidate.role === "admin" || candidate.role === "member")
  );
}

const raw: unknown = JSON.parse(
  '{"id":"u_1","name":"Hojeong","role":"member"}',
);

if (isUser(raw)) {
  console.log(raw.name.toUpperCase());
  console.log(raw.role);
} else {
  console.error("Invalid user payload");
}
