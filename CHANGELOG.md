# Changelog

All notable changes to AIR Lean Coffee will be documented in this file.

## [1.3.0] - 25 Oct 2025

### Added
- Global loading system with Lottie animation
- Preloaded Lottie animation for instant display
- Loading indicators for all async operations (registration, board load, topic creation, voting, etc.)
- Optimized animation preload with high-priority fetch
- Smooth loading experience with white background and centered animation
- Large, bold loading messages (text-2xl font-bold)

### Improved
- User registration flow with loading feedback
- Board initialization with loading state
- All async operations now show contextual loading messages
- Removed confirmation alert from logout (direct logout)
- Animation preloading at app startup to eliminate loading delays

### Technical
- Implemented LoaderContext with 3-second minimum duration for all operations
- Created LottieLoader component with preload support
- Added PreloadLink component for HTML-level animation preloading
- Optimized animation fetch with AbortController for cleanup

## [1.2.0] - 25 Oct 2025

### Added
- Logo branding with favicon
- Improved UI with responsive logos
- Enhanced version tracking system
- Expanded changelog modal
- Added version display in login

## [1.1.0] - 23 Oct 2025

### Added
- Upgraded to Next.js 16.0.0
- Updated React to 19.2.0
- Added feedback and bug reporting system
- Added changelog tracking
- Improved TypeScript configuration
- Enhanced accessibility features

## [1.0.0] - 20 Oct 2025

### Added
- Initial release of AIR Lean Coffee
- Implemented Lean Coffee board with drag-and-drop
- Added voting system with 3 votes per user
- Integrated timer for discussions
- Added discussion history tracking
- User registration and session management
- Real-time participant list
