# React Context와 memo 렌더링 관계

## 한 줄 정리

`React.memo`는 props 비교로 렌더링을 건너뛰는 도구이고, `useContext`로 읽는 Context 값이 바뀌면 `memo`와 별개로 컴포넌트는 다시 렌더링된다.

## 핵심 원리

`React.memo`는 부모 컴포넌트가 다시 렌더링될 때 자식 컴포넌트의 props가 이전과 같은지 비교한다. props가 같으면 React는 해당 컴포넌트의 렌더링을 건너뛸 수 있다.

하지만 컴포넌트 내부에서 `useContext()`를 사용하고 있다면 이야기가 달라진다. Context consumer는 Provider의 `value` 변경에 구독되어 있기 때문에, Context 값이 바뀌면 props가 같아도 다시 렌더링된다.

Provider에 객체를 직접 넣는 패턴은 특히 주의해야 한다.

```tsx
const value = { user, logout };

return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);
```

위 코드에서 부모가 렌더링될 때마다 `{ user, logout }`는 새 객체로 만들어진다. 객체의 내용이 같아 보여도 참조가 달라지기 때문에 React는 Context 값이 바뀐 것으로 판단할 수 있다. 그 결과 Context를 읽는 하위 컴포넌트들이 불필요하게 다시 렌더링될 수 있다.

이 문제는 `useMemo`와 `useCallback`으로 Provider 값을 안정화해서 줄일 수 있다.

```tsx
const logout = useCallback(() => {
  // logout logic
}, []);

const value = useMemo(() => {
  return { user, logout };
}, [user, logout]);

return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);
```

## memo가 막지 못하는 경우

아래 컴포넌트는 `memo`로 감싸져 있어도 Context 값이 바뀌면 다시 렌더링된다.

```tsx
const Profile = memo(function Profile() {
  const { user } = useContext(AuthContext);

  return <div>{user.name}</div>;
});
```

`memo`는 props 비교를 최적화하는 도구이지, Context 구독 자체를 막는 도구가 아니다.

## 실무적인 분리 패턴

Context를 읽는 컴포넌트와 실제 UI를 그리는 컴포넌트를 분리하면 렌더링 범위를 줄일 수 있다.

```tsx
function ProfileContainer() {
  const { user } = useContext(AuthContext);

  return <ProfileView name={user.name} />;
}

const ProfileView = memo(function ProfileView({ name }: { name: string }) {
  return <div>{name}</div>;
});
```

이 구조에서는 `ProfileContainer`는 Context 변경에 반응하지만, `ProfileView`는 `name` prop이 같으면 렌더링을 건너뛸 수 있다.

## 실무 관점

Context는 편하지만, 값의 변경 범위가 넓으면 렌더링 영향도 넓어진다. 그래서 인증 정보, 테마, 언어처럼 앱 전역에서 필요한 값에는 적합하지만, 자주 바뀌는 입력값이나 화면 단위 상태를 큰 Context 하나에 넣는 것은 조심해야 한다.

시니어는 `memo`를 먼저 붙이기보다 다음 질문을 먼저 한다.

- 이 Context 값은 얼마나 자주 바뀌는가?
- 이 값을 읽는 컴포넌트는 얼마나 많은가?
- 하나의 Context에 너무 많은 상태가 섞여 있지는 않은가?
- state와 action을 분리할 수 있는가?
- Context를 읽는 컴포넌트와 무거운 UI 컴포넌트를 분리할 수 있는가?

## 확인 질문

1. `memo`로 감싼 컴포넌트가 `useContext`를 사용하고 있을 때, Provider의 `value`가 바뀌면 왜 다시 렌더링될까?
2. Provider의 `value={{ user, logout }}` 같은 코드가 렌더링 최적화 관점에서 위험할 수 있는 이유는 무엇일까?

## 오늘 해볼 실습

1. `AuthContext.Provider`에 객체를 직접 전달한 뒤, 부모 컴포넌트의 state를 변경하면서 consumer 렌더링 횟수를 `console.log`로 확인해보기.
2. Provider의 `value`를 `useMemo`로 감싼 뒤 렌더링 횟수가 어떻게 달라지는지 비교하기.
3. Context를 읽는 container 컴포넌트와 `memo`로 감싼 view 컴포넌트를 분리해서, 어떤 컴포넌트가 다시 렌더링되는지 확인해보기.

