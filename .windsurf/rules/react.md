---
trigger: always_on
---

# React Best Practices

## Component Structure

- Use functional components with hooks exclusively
- Define components as `const` arrow functions
- Keep components small and focused on a single responsibility
- Extract complex logic into custom hooks
- Place components in `/src/components` directory
- Group related components together

## Hooks Rules

- Follow Rules of Hooks (only call at top level, only in React functions)
- Use `useState` for component-local state
- Use `useEffect` for side effects (always cleanup when necessary)
- Use `useMemo` for expensive computations only
- Use `useCallback` for memoized callbacks passed to child components
- Create custom hooks to encapsulate reusable logic

## State Management

- Use local state (`useState`) for component-specific data
- Lift state up when multiple components need shared access
- Use Context API for global state (theme, auth, user preferences)
- Consider Zustand or Redux only for complex global state
- Avoid prop drilling - use composition or context instead

## Early Returns Pattern

Use early returns to improve readability:
```typescript
const UserProfile = ({ user }: { user: User | null }) => {
  if (!user) return <div>No user found</div>;
  if (!user.isActive) return <InactiveMessage />;
  if (user.role !== 'admin') return <AccessDenied />;
  
  return <AdminPanel user={user} />;
};
```

## Async/Await in Components

Always use async/await with proper error handling:
```typescript
const fetchUserData = async (userId: string) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};
```

## Performance Optimization

- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback` when passing to optimized children
- Use `React.memo` for components that render often with same props
- Avoid unnecessary re-renders by keeping state local and specific
- Lazy load heavy components with `React.lazy` and `Suspense`

Example:
```typescript
const MemoizedChild = React.memo(({ data, onClick }: Props) => {
  // Component that re-renders only when props change
});

const Parent = () => {
  const handleClick = useCallback(() => {
    // Memoized callback
  }, []);
  
  return <MemoizedChild data={data} onClick={handleClick} />;
};
```

## Custom Hooks

Extract reusable logic into custom hooks:
```typescript
const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
};
```

## Component Composition

Prefer composition over prop drilling:
```typescript
// Good: Composition
const UserDashboard = () => (
  <Layout>
    <Header user={user} />
    <MainContent>
      <Sidebar />
      <UserContent user={user} />
    </MainContent>
  </Layout>
);

// Avoid: Deep prop drilling
const DeepComponent = ({ user }) => (
  <A user={user}>
    <B user={user}>
      <C user={user}>
        <D user={user} />
      </C>
    </B>
  </A>
);
```

## Error Boundaries

Implement error boundaries for graceful error handling:
- Use `error.tsx` files in Next.js App Router
- Provide fallback UI for error states
- Never expose sensitive error details to users
