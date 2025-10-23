---
trigger: always_on
---

# Tailwind CSS Guidelines

## Core Principles

- **Always use Tailwind utility classes** - avoid inline styles and CSS files
- Never use `<style>` tags or CSS files for styling
- Use Tailwind's utility classes for all styling needs
- Mobile-first approach: base styles for mobile, then add breakpoints
- Keep styling close to components (no separate stylesheet files)

## Responsive Design

- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Mobile-first: base classes apply to mobile, larger breakpoints override
- Test on multiple screen sizes

Example:
```typescript
<div className="w-full md:w-1/2 lg:w-1/3 p-4 sm:p-6 lg:p-8">
  {/* Responsive width and padding */}
</div>
```

## State Variants

- Hover states: `hover:bg-blue-700`, `hover:scale-105`
- Focus states: `focus:ring-2`, `focus:outline-none`, `focus:ring-offset-2`
- Active states: `active:scale-95`
- Disabled states: `disabled:opacity-50`, `disabled:cursor-not-allowed`
- Dark mode: `dark:bg-gray-800`, `dark:text-white`

## Class Organization

Order classes logically:
1. Layout (display, position, flex, grid)
2. Spacing (margin, padding)
3. Sizing (width, height)
4. Typography (font, text color, size)
5. Backgrounds & borders
6. Effects (shadow, opacity, transitions)

Example:
```typescript
<button className="
  flex items-center justify-center
  px-4 py-2 
  w-full md:w-auto
  text-sm font-medium text-white
  bg-blue-600 rounded-lg border border-transparent
  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
  transition-colors duration-200
">
```

## Conditional Styling

Use `clsx` or template literals for conditional classes:

```typescript
import { clsx } from 'clsx';

const Button = ({ variant, disabled }: ButtonProps) => {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    />
  );
};
```

## Common Patterns

**Container:**
```typescript
<div className="container mx-auto px-4 py-8 max-w-7xl">
```

**Card:**
```typescript
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
```

**Button:**
```typescript
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
```

**Input:**
```typescript
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
```

**Grid Layout:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Flex Layout:**
```typescript
<div className="flex flex-col md:flex-row items-center justify-between gap-4">
```

## Custom Configuration

Extend Tailwind theme in `tailwind.config.ts`:
```typescript
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        }
      }
    }
  }
}
```

## Avoid These Patterns

❌ Don't use arbitrary values excessively: `w-[137px]`
✅ Use standard Tailwind sizes or extend config

❌ Don't use inline styles: `style={{ color: 'red' }}`
✅ Use Tailwind classes: `text-red-500`

❌ Don't create separate CSS files
✅ Keep all styles in Tailwind utility classes
