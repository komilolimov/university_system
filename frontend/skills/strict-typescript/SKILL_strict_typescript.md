---
name: strict-typescript
description: Enforces strict TypeScript rules, zero tolerance for the 'any' type, robust error handling with 'unknown', strict typing for generics and component props, and safe object casting. Use this skill whenever generating or modifying TypeScript or React code in this project to ensure maximum type safety.
---

# Strict TypeScript Code Generation Rules

This project enforces 100% strict TypeScript. The following directives must be strictly adhered to when generating or modifying any code.

## 1. ZERO Tolerance for `any`

The `any` keyword is **strictly forbidden** in this project. It defeats the purpose of using TypeScript. If the shape of the data is truly unknown, you must use the `unknown` type instead.

**❌ Bad (`any`)**
```typescript
// Bypasses all type checking
const handleData = (data: any) => {
  console.log(data.id);
};
```

**✅ Good (`unknown`)**
```typescript
// Enforces type checking before access
const handleData = (data: unknown) => {
  if (typeof data === 'object' && data !== null && 'id' in data) {
    console.log(data.id);
  }
};
```

## 2. Handling Errors and Unknown Data

All `catch` blocks must type the error as `unknown`. Explicit type narrowing (Type Guards) must be used before accessing properties of unknown variables (e.g., using `if (error instanceof Error)` or custom parser utilities).

**❌ Bad (Implicit or `any` error)**
```typescript
try {
  await apiCall();
} catch (error: any) {
  console.error(error.message); // Dangerous: error might not have a message
}
```

**✅ Good (Explicit `unknown` and narrowing)**
```typescript
try {
  await apiCall();
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message); // Safe
  } else {
    console.error("An unexpected error occurred:", String(error));
  }
}
```

## 3. Generics and Default Types

Never default a generic type parameter to `any` (e.g., `<T = any>` is forbidden). Use `<T = unknown>` or define a more specific base interface. Additionally, React component props, state (`useState`), and context must be explicitly typed.

**❌ Bad (Defaulting to `any` and missing React types)**
```typescript
// Generic defaulting to any
interface ApiResponse<T = any> {
  data: T;
}

// Untyped state
const [user, setUser] = useState();
```

**✅ Good (Specific constraints, `unknown`, and strict React types)**
```typescript
// Generic defaulting to unknown
interface ApiResponse<T = unknown> {
  data: T;
}

// Explicitly typed state
const [user, setUser] = useState<User | null>(null);

// Explicitly typed props
interface ButtonProps {
  label: string;
  onClick: () => void;
}
const Button = ({ label, onClick }: ButtonProps) => <button onClick={onClick}>{label}</button>;
```

## 4. Explicit Return Types

All functions—especially API calls, Server Actions, and React hooks—must have explicit return types (e.g., `Promise<Employee[]>`, `void`). Do not rely solely on type inference for critical boundaries.

**❌ Bad (Missing return type)**
```typescript
export const fetchUsers = async () => {
  const res = await fetch('/api/users');
  return res.json();
}
```

**✅ Good (Explicit return type)**
```typescript
export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch('/api/users');
  const data = await res.json();
  return data as User[]; // Assuming runtime validation or trusted endpoint
}
```

## 5. Object Casting

Avoid reckless `as Type` casting unless absolutely necessary. Instead, prefer structural validation (like Zod) or safe type casting after explicitly checking the object's properties at runtime.

**❌ Bad (Reckless casting)**
```typescript
const processEvent = (event: unknown) => {
  const e = event as CustomEvent; // May crash if event is missing properties
  console.log(e.detail.id);
};
```

**✅ Good (Safe validation before casting)**
```typescript
interface CustomEvent {
  detail: { id: string };
}

const isCustomEvent = (e: unknown): e is CustomEvent => {
  return typeof e === 'object' && e !== null && 'detail' in e;
};

const processEvent = (event: unknown) => {
  if (isCustomEvent(event)) {
    console.log(event.detail.id); // Safe and validated
  }
};
```
