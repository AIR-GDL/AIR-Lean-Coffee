---
trigger: always_on
---

# Accessibility (a11y) Guidelines

## Core Principles

- Build for everyone - accessibility is not optional
- Use semantic HTML elements first
- Provide keyboard navigation for all interactive elements
- Ensure sufficient color contrast (WCAG AA minimum)
- Support screen readers with proper ARIA attributes
- Test with keyboard-only navigation

## Semantic HTML

Always use appropriate HTML elements:
- `<button>` for clickable actions
- `<a>` for navigation links
- `<nav>` for navigation menus
- `<main>` for main content
- `<article>` for independent content
- `<section>` for thematic grouping
- `<header>` and `<footer>` for page regions
- `<form>` for forms with proper labels

## Heading Hierarchy

Maintain proper heading structure:
```typescript
<main>
  <h1>Page Title</h1>
  <section>
    <h2>Section Title</h2>
    <h3>Subsection</h3>
  </section>
  <section>
    <h2>Another Section</h2>
  </section>
</main>
```

## ARIA Attributes

Use ARIA when HTML semantics are insufficient:
- `aria-label`: Provide accessible name for elements
- `aria-labelledby`: Reference another element for labeling
- `aria-describedby`: Provide additional description
- `aria-live`: Announce dynamic content changes
- `aria-hidden`: Hide decorative elements from screen readers
- `aria-expanded`: Indicate collapsible state
- `aria-modal`: Indicate modal dialogs

Example:
```typescript
<button
  onClick={handleClick}
  aria-label="Close dialog"
  aria-expanded={isOpen}
  className="..."
>
  <CloseIcon aria-hidden="true" />
</button>
```

## Keyboard Navigation

All interactive elements must be keyboard accessible:
- Use `tabIndex={0}` to include in tab order
- Use `tabIndex={-1}` to exclude from tab order but allow focus programmatically
- Handle `onKeyDown` for custom interactions
- Support Enter and Space for buttons
- Support Escape to close modals/dialogs
- Support Arrow keys for navigation lists

Example:
```typescript
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  aria-label="Custom button"
  className="cursor-pointer"
>
  Click me
</div>
```

## Form Accessibility

Always label form inputs:
```typescript
<div>
  <label htmlFor="email" className="block text-sm font-medium mb-2">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    name="email"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
    className="w-full px-3 py-2 border rounded-lg"
  />
  {hasError && (
    <p id="email-error" className="text-red-600 text-sm mt-1" role="alert">
      Please enter a valid email address
    </p>
  )}
</div>
```

## Images

Always provide alt text:
```typescript
// Informative images
<img src="/logo.png" alt="Company Logo" />

// Decorative images
<img src="/decoration.png" alt="" aria-hidden="true" />

// Using Next.js Image
import Image from 'next/image';
<Image src="/photo.jpg" alt="Description of the photo" width={300} height={200} />
```

## Focus Management

- Visible focus indicators (never `outline: none` without replacement)
- Manage focus for modals and dynamic content
- Return focus after modal closes

```typescript
const Modal = ({ isOpen, onClose }: ModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="..."
    >
      <h2 id="modal-title">Modal Title</h2>
      <button
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close modal"
        className="focus:ring-2 focus:ring-blue-500"
      >
        Close
      </button>
    </div>
  );
};
```

## Color Contrast

Ensure sufficient contrast ratios:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

Use Tailwind's color system for accessible combinations:
```typescript
// Good contrast
<p className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900">

// Avoid low contrast
❌ <p className="text-gray-400 bg-gray-300">
```

## Skip Links

Provide skip navigation for keyboard users:
```typescript
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white"
>
  Skip to main content
</a>
```

## Screen Reader Only Content

Use Tailwind's `sr-only` utility for screen reader only text:
```typescript
<button className="...">
  <TrashIcon aria-hidden="true" />
  <span className="sr-only">Delete item</span>
</button>
```

## Live Regions

Announce dynamic content to screen readers:
```typescript
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {statusMessage}
</div>
```
