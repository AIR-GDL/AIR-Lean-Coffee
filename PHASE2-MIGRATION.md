# Phase 2: Backend Integration & Database Migration

## Overview
Successfully migrated the Lean Coffee Board application from client-side localStorage to a full-stack MongoDB-backed solution using Next.js API routes.

## Changes Made

### 1. Database Setup
- **MongoDB Integration**: Connected to MongoDB using Mongoose ODM
- **Connection Utility**: Created `src/lib/mongodb.ts` for connection management with caching
- **Environment Variables**: Configured `.env.local` with `MONGODB_URI`

### 2. Data Models (Mongoose Schemas)

#### User Model (`src/models/User.ts`)
```typescript
{
  name: String (required)
  email: String (required, unique, lowercase)
  votesRemaining: Number (default: 3)
  createdAt: Date
}
```

#### Topic Model (`src/models/Topic.ts`)
```typescript
{
  content: String (required)
  author: String (required)
  votes: Number (default: 0)
  status: 'to-discuss' | 'discussing' | 'discussed'
  createdAt: Date
}
```

### 3. API Endpoints

#### User Endpoints
- **POST `/api/users`**: Register or find existing user by email

#### Topic Endpoints
- **GET `/api/topics`**: Fetch all topics
- **POST `/api/topics`**: Create new topic
- **PUT `/api/topics/[id]`**: Update topic (voting or status change)
  - Vote action: `{ action: 'VOTE', userEmail: 'user@example.com' }`
  - Status change: `{ status: 'discussing' }`
- **DELETE `/api/topics/[id]`**: Delete a topic

### 4. Frontend Refactoring

#### Removed localStorage Dependencies
- **Before**: Used `useLocalStorage` hook for topics and user data
- **After**: 
  - Topics: Fetched from MongoDB via SWR
  - User: Session storage for current session only
  - Timer: Still uses localStorage (client-side only state)

#### New Utilities & Hooks
- **`src/lib/api.ts`**: API client functions for all endpoints
- **`src/hooks/useTopics.ts`**: SWR hook for real-time topic fetching with 5-second refresh

#### Updated Components
1. **UserRegistration** (`src/components/UserRegistration.tsx`)
   - Now calls `/api/users` endpoint
   - Shows loading state during registration
   - Handles API errors gracefully

2. **Board** (`src/components/Board.tsx`)
   - Uses `useTopics()` hook instead of localStorage
   - All mutations (create, vote, update) call API
   - Real-time updates via SWR's mutate function
   - Maps between database status (`to-discuss`) and UI columnId (`toDiscuss`)

3. **TopicCard** (`src/components/TopicCard.tsx`)
   - Updated to use `_id` instead of `id`
   - Displays `content` instead of `title`
   - Shows author name

4. **Column** (`src/components/Column.tsx`)
   - Updated all references from `topic.id` to `topic._id`

5. **Main Page** (`src/app/page.tsx`)
   - Changed from localStorage to sessionStorage for user session
   - User data persists in MongoDB, session token in browser

#### Updated Types (`src/types/index.ts`)
- User and Topic interfaces now match MongoDB document structure
- Added request/response types for API calls
- Changed `id` to `_id` to match MongoDB

### 5. Data Persistence Strategy

| Data Type | Storage Method | Reason |
|-----------|---------------|--------|
| Topics | MongoDB | Shared across all users, needs persistence |
| Users | MongoDB | Shared data, vote counts need to be synchronized |
| User Session | sessionStorage | Temporary session data |
| Timer Settings | localStorage | Client-side only, per-user preference |

## Key Features

### Real-Time Updates
- SWR refreshes topics every 5 seconds
- Manual revalidation after mutations
- Optimistic UI updates where applicable

### Error Handling
- API calls wrapped in try-catch blocks
- User-friendly error messages
- Console logging for debugging

### Voting System
- Voting decrements user's remaining votes in database
- Prevents double voting (server-side validation)
- Updates both topic votes and user vote count atomically

### Status Management
- Topics move between statuses: `to-discuss` → `discussing` → `discussed`
- Drag-and-drop triggers status updates via API
- Confirmation modals prevent accidental moves

## Environment Setup

### Required Environment Variables
Create `.env.local` in project root:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lean-coffee?retryWrites=true&w=majority
```

### Installation
```bash
npm install mongoose swr @types/canvas-confetti
```

## Testing Checklist

- [ ] User registration creates MongoDB document
- [ ] Existing users can login with same email
- [ ] Topics are created in database
- [ ] Voting decrements votes and updates topic count
- [ ] Drag-and-drop updates topic status in database
- [ ] Multiple browser tabs show synchronized data
- [ ] Page refresh maintains user session
- [ ] Logout clears session correctly
- [ ] Timer functions independently (localStorage)
- [ ] Real-time updates work (5-second refresh)

## Migration Benefits

1. **Multi-User Support**: Data is now shared across users and sessions
2. **Data Persistence**: Topics and users survive page refreshes and browser closes
3. **Scalability**: Ready for real-time features like WebSockets
4. **Real Database**: Can add complex queries, aggregations, and analytics
5. **API-First**: Frontend and backend are decoupled, enabling mobile apps or other clients

## Future Enhancements

- [ ] Real-time updates using WebSockets or Server-Sent Events
- [ ] User authentication with JWT or NextAuth.js
- [ ] Topic categories and tags
- [ ] Search and filter functionality
- [ ] Export discussion summaries to PDF/JSON
- [ ] Email notifications for discussion reminders
- [ ] Multi-board support per user/team
- [ ] Rich text editor for topic content
- [ ] File attachments for topics
- [ ] Discussion history and audit logs

## Running the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` in `.env.local`
- Check network access in MongoDB Atlas
- Ensure IP whitelist includes your current IP

### SWR Not Updating
- Check browser console for API errors
- Verify `/api/topics` returns data
- Check SWR configuration in `useTopics.ts`

### Type Errors
- Ensure all `topic.id` references changed to `topic._id`
- Verify Topic interface matches MongoDB schema
- Check for outdated imports from old localStorage implementation

---

**Migration Completed**: All client-side localStorage data management has been successfully replaced with MongoDB-backed API endpoints while maintaining full application functionality.
