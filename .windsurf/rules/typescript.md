---
trigger: always_on
---

# TypeScript Guidelines

## Type Safety

- Enable strict mode in `tsconfig.json`
- Define explicit types for all function parameters and return values
- Use interfaces for object shapes
- Use types for unions and intersections
- Avoid `any` - use `unknown` if type is truly unknown
- Create custom types in `/src/types/index.ts`
- Use generics for reusable components and functions

## Type Definitions

**Interfaces for object shapes:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
```

**Types for unions/intersections:**
```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';
type UserWithRole = User & { role: 'admin' | 'user' };
```

**Generic functions:**
```typescript
const fetchData = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Fetch failed');
  return response.json();
};
```

## Component Props

- Always define prop types using TypeScript interfaces or types
- Use `React.FC` sparingly; prefer explicit typing
- Destructure props in function parameters with type annotation
- Use optional properties with `?` for non-required props
- Provide default values for optional props

Example:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}

const Button = ({ 
  label, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = ''
}: ButtonProps) => {
  return <button onClick={onClick} disabled={disabled} className={className}>{label}</button>;
};
```

## Custom Hooks Typing

```typescript
const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  // Implementation
  return debouncedValue;
};
```

## API Response Typing

Always type API responses:
```typescript
interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

const fetchUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await fetch('/api/users');
  return response.json();
};
```

## Event Handlers

Type event handlers properly:
```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // Handle click
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;
  // Handle change
};

const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter') {
    // Handle enter
  }
};
```

## Type Guards

Use type guards for runtime type checking:
```typescript
const isUser = (obj: unknown): obj is User => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
};
```
