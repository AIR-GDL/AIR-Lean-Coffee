# Lean Coffee Board Application

A modern, interactive Lean Coffee Board built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

### User Management
- **User Registration**: Simple registration form with name and email validation
- **Local Storage**: User data persists across sessions using browser's local storage
- **Logout**: Secure logout with data preservation

### Board System
- **Four-Column Kanban Layout**:
  1. **To Discuss**: Add and vote on topics
  2. **Discussing**: Active discussion with timer
  3. **Discussed**: Completed topics
  4. **Settings**: Timer configuration (1-20 minutes)

### Voting System
- Each user receives **3 votes** at registration
- Vote on topics in the "To Discuss" column
- Visual feedback for voted topics
- "To Discuss" column intelligently separates:
  - **Top Voted**: Topics with votes (sorted by vote count)
  - **New Topics**: Topics with zero votes

### Drag & Drop
- Intuitive drag-and-drop interface powered by `@dnd-kit`
- Topics can be moved between columns with smart restrictions
- Only "Top Voted" topics can be moved to "Discussing"
- Smooth animations and visual feedback

### Discussion Timer
- **Configurable Duration**: Set timer from 1-20 minutes via slider
- **Real-time Countdown**: Large, visible timer at the top of the page
- **Visual Warnings**:
  - Normal state (blue) for most of the duration
  - Warning state (yellow) at 30 seconds remaining
  - Critical state (red, pulsing) at 10 seconds remaining
- **Confirmation Modal**: Confirms before starting a discussion

### Voting Flow
- **Automatic Trigger**: Voting modal appears when timer reaches zero
- **Two Options**:
  - **Finish Topic**: Moves topic to "Discussed" with confetti celebration 🎉
  - **Continue Discussion**: Resets timer to configured duration
- **Visual Feedback**: Shows which option the user voted for

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Icons**: lucide-react
- **Animations**: canvas-confetti

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 How to Use

### First Time Setup
1. Enter your name and email on the registration screen
2. Click "Get Started" to access the board

### Adding Topics
1. Click the "Add Topic" button in the "To Discuss" column
2. Enter a topic title (required) and optional description
3. The topic appears in the "New Topics" section

### Voting on Topics
1. Click the vote button (👍) on any topic in "To Discuss"
2. The topic moves to "Top Voted" section when it receives votes
3. You have 3 votes total - use them wisely!

### Starting a Discussion
1. Drag a topic from "Top Voted" to "Discussing" column
2. Confirm the action in the modal
3. Timer automatically starts

### Managing the Timer
1. Adjust the discussion duration using the slider in "Settings"
2. Range: 1-20 minutes
3. Timer cannot be changed during an active discussion

### Completing Discussions
1. When timer expires, voting modal appears
2. Vote to either finish the topic or continue
3. If finishing: enjoy the confetti and topic moves to "Discussed"
4. If continuing: timer resets and discussion continues

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and animations
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main entry point
├── components/
│   ├── Board.tsx             # Main board component
│   ├── Column.tsx            # Kanban column component
│   ├── Modal.tsx             # Reusable modal component
│   ├── Timer.tsx             # Countdown timer display
│   ├── TopicCard.tsx         # Individual topic card
│   └── UserRegistration.tsx  # Registration form
├── hooks/
│   └── useLocalStorage.ts    # Local storage hook
└── types/
    └── index.ts              # TypeScript interfaces
```

## 🎨 Key Components

### Board Component
- Orchestrates all board functionality
- Manages drag-and-drop context
- Handles timer state and voting logic
- Triggers confetti celebrations

### Column Component
- Displays topics in organized sections
- Separates "Top Voted" vs "New Topics" in "To Discuss"
- Provides droppable zones for drag-and-drop

### TopicCard Component
- Displays topic information
- Handles voting interactions
- Shows vote counts and user participation

### Timer Component
- Real-time countdown display
- Color-coded warning states
- Automatic trigger on completion

## 🔧 Configuration

### Local Storage Keys
- `lean-coffee-user`: User profile and voting data
- `lean-coffee-topics`: All board topics
- `lean-coffee-timer`: Timer settings and state

### Default Settings
- Initial votes per user: 3
- Timer range: 1-20 minutes
- Default timer duration: 5 minutes

## 🎯 Future Enhancements

- Multi-user real-time collaboration (WebSockets)
- Topic categories and tags
- Export discussion summaries
- Activity history and analytics
- Custom vote allocation per session
- Mobile app version

## 📝 License

This project is open source and available under the MIT License.

---
Made with good vibes 😎 and tacos 🌮 by [Carlos Diaz | @cardiadev](https://github.com/cardiadev)
Built with ❤️ using Next.js 15 and TypeScript
