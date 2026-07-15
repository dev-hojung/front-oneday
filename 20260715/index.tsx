import { useState } from "react";

type Member = {
  id: string;
  name: string;
};

const initialMembers: Member[] = [
  { id: "member-1", name: "Kim" },
  { id: "member-2", name: "Lee" },
  { id: "member-3", name: "Park" },
];

export default function KeyExample() {
  const [members, setMembers] = useState(initialMembers);

  const prependMember = () => {
    const nextNumber = members.length + 1;

    setMembers([
      {
        id: `member-${Date.now()}`,
        name: `New ${nextNumber}`,
      },
      ...members,
    ]);
  };

  return (
    <main style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>React key 예시</h1>
      <button type="button" onClick={prependMember}>
        맨 앞에 추가
      </button>

      <section style={{ display: "flex", gap: 32, marginTop: 24 }}>
        <div>
          <h2>좋은 예: id를 key로 사용</h2>
          <MemberList members={members} keyType="id" />
        </div>

        <div>
          <h2>위험한 예: index를 key로 사용</h2>
          <MemberList members={members} keyType="index" />
        </div>
      </section>
    </main>
  );
}

function MemberList({
  members,
  keyType,
}: {
  members: Member[];
  keyType: "id" | "index";
}) {
  return (
    <ul style={{ display: "grid", gap: 12, paddingLeft: 0 }}>
      {members.map((member, index) => (
        <MemberRow
          key={keyType === "id" ? member.id : index}
          member={member}
        />
      ))}
    </ul>
  );
}

function MemberRow({ member }: { member: Member }) {
  const [memo, setMemo] = useState("");

  return (
    <li
      style={{
        display: "grid",
        gap: 6,
        listStyle: "none",
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <strong>{member.name}</strong>
      <input
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        placeholder={`${member.name}에 대한 메모`}
      />
    </li>
  );
}

