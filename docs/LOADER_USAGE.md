# Global Loading System with Lottie

This project includes a global loading system with Lottie animation that displays centered in the viewport during asynchronous operations.

## Features

- ✅ Customizable Lottie animation
- ✅ Centered in the entire viewport
- ✅ Semi-transparent backdrop with blur
- ✅ Customizable contextual messages
- ✅ CSS spinner fallback if animation fails to load
- ✅ Automatic dark mode
- ✅ High z-index (z-50) to appear above all content

## File Structure

```
src/
├── components/
│   └── LottieLoader.tsx          # Loader component
├── context/
│   └── LoaderContext.tsx         # Context and Provider
├── hooks/
│   └── useLoader.ts              # Optional convenience hook
└── app/
    └── layout.tsx                # LoaderProvider integrated here

public/
└── animations/
    └── loading.json              # Lottie animation
```

## Basic Usage

### 1. Use the hook directly

```typescript
import { useGlobalLoader } from '@/context/LoaderContext';

function MyComponent() {
  const { showLoader, hideLoader } = useGlobalLoader();

  const handleAction = async () => {
    showLoader('Processing...');
    try {
      await someAsyncOperation();
    } finally {
      hideLoader();
    }
  };

  return <button onClick={handleAction}>Execute</button>;
}
```

### 2. Use the convenience hook (recommended)

```typescript
import { useLoader } from '@/hooks/useLoader';

function MyComponent() {
  const { withLoader } = useLoader();

  const handleAction = async () => {
    await withLoader('Processing...', async () => {
      await someAsyncOperation();
    });
  };

  return <button onClick={handleAction}>Execute</button>;
}
```

## Customize the Animation

### Replace the Lottie animation

1. Download an animation from [LottieFiles](https://lottiefiles.com/)
2. Replace the file `/public/animations/loading.json`
3. The animation will load automatically

### Adjust animation size

Edit `/src/components/LottieLoader.tsx`:

```typescript
<Lottie
  animationData={animationData}
  loop={true}
  className="w-48 h-48" // Change these values
/>
```

## Usage Examples in Board.tsx

The `Board.tsx` component already has the loader integrated in all its operations:

- **Initial load**: "Loading board..."
- **Create topic**: "Creating topic..."
- **Vote**: "Voting..."
- **Delete topic**: "Deleting topic..."
- **Start discussion**: "Starting discussion..."
- **Finish topic**: "Finishing topic..."
- **Continue discussion**: "Continuing discussion..."

## LoaderContext API

### `showLoader(message?: string)`
Shows the loader with an optional message.

```typescript
showLoader('Saving data...');
```

### `hideLoader()`
Hides the loader.

```typescript
hideLoader();
```

### `isLoading`
Boolean state indicating if the loader is visible.

```typescript
const { isLoading } = useGlobalLoader();
console.log(isLoading); // true or false
```

## Best Practices

1. **Always use try-finally**: Ensure the loader is hidden even if there are errors
   ```typescript
   showLoader('Processing...');
   try {
     await operation();
   } finally {
     hideLoader();
   }
   ```

2. **Descriptive messages**: Use messages that clearly indicate what is happening
   ```typescript
   showLoader('Saving changes...'); // ✅ Good
   showLoader('Loading...'); // ❌ Generic
   ```

3. **Use the `withLoader` hook**: Simplifies code and guarantees the loader is hidden
   ```typescript
   await withLoader('Processing...', async () => {
     await operation();
   });
   ```

4. **Don't nest loaders**: Avoid calling `showLoader` while one is already active

## Advanced Customization

### Change the backdrop

Edit `/src/components/LottieLoader.tsx`:

```typescript
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  {/* Change bg-black/50 to adjust opacity */}
  {/* Change backdrop-blur-sm to adjust blur */}
</div>
```

### Add entrance/exit animations

You can use Framer Motion or Tailwind transitions:

```typescript
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isLoading && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LottieLoader message={message} />
    </motion.div>
  )}
</AnimatePresence>
```

## Troubleshooting

### Animation is not showing
- Verify that the file `/public/animations/loading.json` exists
- Check the browser console for loading errors
- The component has a CSS spinner fallback if it fails

### Loader doesn't hide
- Make sure to call `hideLoader()` in the `finally` block
- Verify there are no multiple `showLoader()` calls without corresponding `hideLoader()` calls

### Loader appears behind other elements
- The loader uses `z-50`, make sure other elements don't have a higher z-index
- Verify that the `LoaderProvider` is at the correct level in the component tree

## Resources

- [Lottie React Documentation](https://www.npmjs.com/package/lottie-react)
- [LottieFiles - Free Animations](https://lottiefiles.com/)
- [Tailwind CSS - Backdrop Blur](https://tailwindcss.com/docs/backdrop-blur)
