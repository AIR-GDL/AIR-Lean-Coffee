# Toast Notification Usage Guide

This project uses [Sonner](https://sonner.emilkowal.ski/) for toast notifications with a centralized, minimal configuration.

## Configuration

The Toaster is configured in `src/app/layout.tsx`:

```tsx
<Toaster position="bottom-center" richColors closeButton />
```

- **Position**: `bottom-center` - Toasts appear at the bottom center of the screen
- **Rich Colors**: Enabled for colored backgrounds (green for success, red for error, etc.)
- **Close Button**: Enabled for manual dismissal
- **Styling**: Uses Sonner's default minimalist styles (no custom styling)

## Usage

Import the toast utility from the centralized wrapper:

```tsx
import { toast } from '@/lib/toast';
```

### Basic Toast Types

```tsx
// Success toast
toast.success('Event has been created');

// Error toast
toast.error('Failed to save changes');

// Info toast
toast.info('New update available');

// Warning toast
toast.warning('Your session will expire soon');

// Default toast
toast('Something happened');
```

### Toast with Description

```tsx
toast.success('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
});

toast.error('Failed to save', {
  description: 'Please check your internet connection',
});
```

### Custom Duration

```tsx
// Show for 5 seconds (default is 3-4 seconds)
toast.success('Saved!', {
  duration: 5000,
});

// Show indefinitely (user must dismiss)
toast.error('Critical error', {
  duration: Infinity,
});
```

## Examples from Codebase

### Bug Report Success
```tsx
toast.success('Bug report submitted successfully!');
```

### Settings Save
```tsx
toast.success('Settings saved automatically');
toast.error('Failed to save settings');
```

### Delete Confirmation
```tsx
toast.success('Bug report deleted successfully');
```

## Best Practices

1. **Use Appropriate Types**: Choose the correct toast type (success, error, info, warning) based on the context
2. **Keep Messages Short**: Keep primary messages concise, use description for additional details
3. **Error Context**: For errors, provide actionable information when possible
4. **Success Feedback**: Always provide feedback for successful user actions
5. **Avoid Duplicates**: Don't spam multiple toasts for the same action

## Why Centralized?

The centralized toast import (`@/lib/toast`) allows for:
- Consistent toast behavior across the entire app
- Easy future customization if needed
- Single source of truth for toast configuration
- Type safety and autocomplete support

## Sonner Documentation

For advanced features and options, refer to the [official Sonner documentation](https://sonner.emilkowal.ski/).
