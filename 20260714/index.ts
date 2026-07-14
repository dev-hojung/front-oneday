type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  createdAt: string;
  updatedAt?: string;
};

type UserSummary = Pick<User, "id" | "name" | "role">;

type UpdateUserRequest = Partial<
  Pick<User, "name" | "email" | "role">
>;

type CreateUserRequest = Omit<
  User,
  "id" | "createdAt" | "updatedAt"
>;
type UserStatus = "active" | "invited" | "blocked";

const statusLabel: Record<UserStatus, string> = {
  active: "활성",
  invited: "초대됨",
  blocked: "차단됨",
};

function updateUser(id: User["id"], payload: UpdateUserRequest) {
  return {
    id,
    ...payload,
  };
}
export {};
