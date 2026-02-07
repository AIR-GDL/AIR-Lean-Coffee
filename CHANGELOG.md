# Changelog

All notable changes to Lean Coffee will be documented in this file.

## [2.0.0] - 9 Feb 2026

### 🎉 Major Release - Brand Renaming & UI Overhaul

### Changed
- **Renamed application** from "AIR Lean Coffee" to "Lean Coffee" across all components and documentation
- **Renamed main board** from "Main Board" to "AIR Board" throughout the application
- **Updated project branding** with new logo and simplified naming

### Added
- **Reports SPA route** with D3.js data visualization
  - Discussions per month chart
  - Top contributors visualization
  - Vote distribution analysis
  - KPI cards with key metrics
- **Changelog SPA route** converted from modal to full-page experience
- **Bug History** view integrated into navigation
- **Real-time Pusher integration** for multi-user synchronization
  - Timer synchronization across all users
  - Topic updates in real-time
  - User presence tracking
  - Vote synchronization

### 🎨 UI/UX Improvements
- **Sidebar redesign** with floating dropdown menus
  - Support section now uses DropdownMenu (shadcn style)
  - Settings moved from footer to regular menu item
  - Feedback as standalone menu item
  - Collapsible to icon-only rail (sidebar-07 style)
- **Vote circle styling** - voted topics now show #005596 background with white text
- **Section differentiation** - TOP VOTED section with subtle blue background tint
- **Horizontal scroll fix** - removed SidebarSeparator overflow issues
- **Enhanced accessibility** with proper ARIA labels and keyboard navigation

### 🛠️ Technical Improvements
- **Bun runtime** as default package manager and JavaScript runtime
- **Next.js 16** App Router optimization
- **React 19** with latest hooks and patterns
- **TypeScript strict mode** throughout the application
- **MCP server integration** for enhanced development experience
- **Real-time infrastructure** with Pusher channels
- **Improved error handling** and user feedback
- **Performance optimizations** for large topic lists

### 📊 New Features
- **Advanced voting system** with visual feedback
- **Timer expiration modal** with 3-option voting (Against/Neutral/Favor)
- **Discussion analytics** and reporting
- **Enhanced participant management** with role-based permissions
- **Archive system** for completed discussions

### 🐛 Bug Fixes
- Fixed horizontal scroll in sidebar
- Improved mobile responsiveness
- Enhanced timer synchronization reliability
- Better state management for real-time updates

## [1.4.0] - 25 Oct 2025

### Added
- Topic archiving system for discussed topics
- Archive icon button in discussed column
- Modal confirmation for archiving topics
- User deletion with session cleanup and automatic redirect
- Improved card UI with modal-based editing
- Compact vote button with hover expansion
- Archive button with icon display

### Improved
- Card editing moved to modal interface
- Vote button redesigned with dynamic icons (thumbs up/down)
- Delete confirmation with countdown timer (5 seconds)
- Modal UI consistency with header buttons
- ESC key support for closing all modals
- Responsive button styling with smooth animations
- Better visual feedback for user interactions

### Technical
- Added `archived` property to Topic model
- Implemented user validation on session detection
- Session storage cleanup on user deletion
- Google Material Icons for all buttons (thumbs up/down, archive)
- Smooth 300ms transitions for all button interactions
- Improved modal button styling consistency

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
