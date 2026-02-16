# Phase 6: Advanced Timer Logic, UI Refinements, and Core Functionality

## Status: Partially Complete (5/8 features done)

---

## ✅ **Completed Features**

### 1. **Layout & CSS Fixes** ✅
**Problem:** Footer not sticking, unnecessary scrollbar

**Solution Implemented:**
- Removed `min-h-screen` from Board component root div
- Changed to `bg-gradient-to-br from-blue-50 to-sky-50 pb-8`
- Layout.tsx already has correct flexbox structure:
  ```tsx
  <body className="antialiased flex flex-col min-h-screen">
    <main className="flex-1">{children}</main>
    <Footer />
  </body>
  ```

**Files Modified:**
- `/src/components/Board.tsx` - Removed min-h-screen from Board wrapper

**Result:** Footer now truly sticky, no extra scrollbar

---

### 2. **Header UI/UX Refinement** ✅
**Objective:** Group user info cohesively

**Solution Implemented:**
```tsx
<div className="flex items-center gap-6 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
  <div>
    <p className="text-xs text-gray-500 uppercase tracking-wide">User</p>
    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
  </div>
  <div className="border-l border-gray-300 pl-6">
    <p className="text-xs text-gray-500 uppercase tracking-wide">Votes Remaining</p>
    <p className="text-2xl font-bold" style={{ color: '#005596' }}>{user.votesRemaining}/3</p>
  </div>
</div>
```

**Files Modified:**
- `/src/components/Board.tsx` - Header section redesigned

**Result:** Clean, professional grouped info card with divider

---

### 3. **Topic Schema - totalTimeDiscussed** ✅
**Objective:** Track discussion durations

**Schema Update:**
```typescript
// src/models/Topic.ts
export interface ITopic extends Document {
  // ... existing fields
  totalTimeDiscussed: number; // Total discussion time in seconds
}

const TopicSchema = new Schema<ITopic>({
  // ... existing fields
  totalTimeDiscussed: {
    type: Number,
    default: 0,
  },
});
```

**TypeScript Interface:**
```typescript
// src/types/index.ts
export interface Topic {
  // ... existing fields
  totalTimeDiscussed: number;
}
```

**Files Modified:**
- `/src/models/Topic.ts` - Added field to schema
- `/src/types/index.ts` - Added to Topic interface

**Result:** Database ready to track discussion time

---

### 4. **Topic Deletion Feature** ✅
**Objective:** Allow users to delete their topics

**Implementation:**

**Created:**
- `/src/components/icons/DeleteIcon.tsx` - Trash can icon

**Updated TopicCard:**
```typescript
// Added state
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

// Added handler
const handleDelete = async (e: React.MouseEvent) => {
  e.stopPropagation();
  if (onDelete) {
    onDelete(topic._id);
    setShowDeleteConfirm(false);
    setIsEditing(false);
  }
};

// UI in edit mode
{!showDeleteConfirm ? (
  <button onClick={() => setShowDeleteConfirm(true)}>
    <DeleteIcon size={14} />
    Delete
  </button>
) : (
  <button onClick={handleDelete}>
    Confirm Delete?
  </button>
)}
```

**Added to Board:**
```typescript
const handleDeleteTopic = async (topicId: string) => {
  try {
    await deleteTopic(topicId);
    await mutate(); // Refresh topics
  } catch (error) {
    console.error('Failed to delete topic:', error);
    alert('Failed to delete topic. Please try again.');
  }
};
```

**Files Modified:**
- `/src/components/TopicCard.tsx` - Delete button & confirmation
- `/src/components/Board.tsx` - Delete handler, import deleteTopic
- `/src/components/Column.tsx` - Pass onDelete prop
- All Column instances in Board - Added `onDelete={handleDeleteTopic}`

**Result:** Click Edit → Click Delete → Confirm → Topic deleted

---

### 5. **Card Description Truncation** ✅
**Objective:** Reduce preview from 3 lines to 2

**Change:**
```tsx
// Before: line-clamp-3
// After:  line-clamp-2
<p className="text-sm text-gray-600 line-clamp-2">
  {topic.description}
</p>
```

**Files Modified:**
- `/src/components/TopicCard.tsx` - Changed line-clamp-3 to line-clamp-2

**Result:** Description shows max 2 lines with ellipsis

---

## 🚧 **Remaining Features**

### 6. **Resume Timer on "Finish Early" Flow** ⏳
**Current Behavior:** Timer resets when continuing
**Required Behavior:** Timer resumes from paused point

**Implementation Needed:**

**1. Update handleFinishEarly:**
```typescript
const handleFinishEarly = () => {
  // Pause the timer and store current remaining time
  setTimerSettings({
    ...timerSettings,
    isRunning: false,
    isPaused: true,
    pausedRemainingSeconds: timerSettings.remainingSeconds,
  });
  setShowVotingModal(true);
  setUserVote(null);
};
```

**2. Update handleVoteSubmit - Continue case:**
```typescript
if (vote === 'continue') {
  if (timerSettings.isPaused && timerSettings.pausedRemainingSeconds) {
    // Resume from paused time
    setTimerSettings({
      ...timerSettings,
      isRunning: true,
      isPaused: false,
      startTime: Date.now(),
      remainingSeconds: timerSettings.pausedRemainingSeconds,
      pausedRemainingSeconds: null,
    });
  }
}
```

**File to Modify:**
- `/src/components/Board.tsx`

---

### 7. **Add Time Slider When Timer Expires** ⏳
**Required Behavior:** Show slider to add 1-10 minutes

**Implementation Needed:**

**1. Add state:**
```typescript
const [showAddTimeSlider, setShowAddTimeSlider] = useState(false);
const [additionalMinutes, setAdditionalMinutes] = useState(5);
```

**2. Update handleTimerComplete:**
```typescript
const handleTimerComplete = () => {
  setTimerSettings({
    ...timerSettings,
    isRunning: false,
    isPaused: true,
    pausedRemainingSeconds: 0,
  });
  setShowVotingModal(true);
  setUserVote(null);
};
```

**3. Update voting modal to show slider when timer expired:**
```tsx
{showVotingModal && (
  <Modal>
    {userVote === null ? (
      // Initial choice: Finish or Continue
      <>
        <button onClick={() => handleVoteSubmit('finish')}>
          Finish Topic
        </button>
        <button onClick={() => {
          if (timerSettings.pausedRemainingSeconds === 0) {
            // Timer expired, show slider
            setShowAddTimeSlider(true);
          } else {
            // Timer was paused early, just resume
            handleVoteSubmit('continue');
          }
        }}>
          Continue Discussion
        </button>
      </>
    ) : showAddTimeSlider ? (
      // Show slider to add time
      <>
        <h3>Add More Time</h3>
        <input
          type="range"
          min="1"
          max="10"
          value={additionalMinutes}
          onChange={(e) => setAdditionalMinutes(parseInt(e.target.value))}
        />
        <p>{additionalMinutes} minutes</p>
        <button onClick={() => {
          setTimerSettings({
            ...timerSettings,
            isRunning: true,
            isPaused: false,
            startTime: Date.now(),
            remainingSeconds: additionalMinutes * 60,
          });
          setShowAddTimeSlider(false);
          setShowVotingModal(false);
          setUserVote(null);
        }}>
          Add Time & Continue
        </button>
      </>
    ) : (
      // Processing vote...
      <p>Processing...</p>
    )}
  </Modal>
)}
```

**File to Modify:**
- `/src/components/Board.tsx`

---

### 8. **Track and Save Discussion Duration** ⏳
**Objective:** Save total time discussed to database

**Implementation Needed:**

**1. Track discussion start time:**
```typescript
// When starting discussion
const handleConfirmDiscussClick = async () => {
  // ... existing code
  setTimerSettings({
    durationMinutes: timerSettings.durationMinutes,
    isRunning: true,
    startTime: Date.now(), // Track when discussion started
    remainingSeconds: timerSettings.durationMinutes * 60,
    currentTopicId: pendingTopicMove.topicId,
    isPaused: false,
    pausedRemainingSeconds: null,
  });
};
```

**2. Calculate and save duration when finishing:**
```typescript
const handleVoteSubmit = async (vote: 'finish' | 'continue') => {
  if (vote === 'finish') {
    const currentTopicId = timerSettings.currentTopicId;
    if (currentTopicId && timerSettings.startTime) {
      try {
        // Calculate elapsed time
        const elapsedSeconds = Math.floor((Date.now() - timerSettings.startTime) / 1000);
        
        // Get current topic to add to existing time
        const currentTopic = topics.find(t => t._id === currentTopicId);
        const totalTime = (currentTopic?.totalTimeDiscussed || 0) + elapsedSeconds;
        
        // Update topic with total time
        await updateTopic(currentTopicId, {
          status: 'discussed',
          totalTimeDiscussed: totalTime,
        });
        
        await mutate();
        await mutateUsers();
      } catch (error) {
        console.error('Failed to finish topic:', error);
      }
    }
    
    // Reset timer
    setTimerSettings({
      ...timerSettings,
      isRunning: false,
      startTime: null,
      remainingSeconds: null,
      currentTopicId: null,
      isPaused: false,
      pausedRemainingSeconds: null,
    });
  }
};
```

**3. Update UpdateTopicRequest type:**
```typescript
// src/types/index.ts
export interface UpdateTopicRequest {
  action?: 'VOTE';
  userEmail?: string;
  status?: 'to-discuss' | 'discussing' | 'discussed';
  title?: string;
  description?: string;
  totalTimeDiscussed?: number; // Add this
}
```

**4. Update API route to handle totalTimeDiscussed:**
```typescript
// src/app/api/topics/[id]/route.ts
// In PUT handler, allow updating totalTimeDiscussed field
if (body.totalTimeDiscussed !== undefined) {
  topic.totalTimeDiscussed = body.totalTimeDiscussed;
}
```

**Files to Modify:**
- `/src/components/Board.tsx` - Track and save discussion time
- `/src/types/index.ts` - Add totalTimeDiscussed to UpdateTopicRequest
- `/src/app/api/topics/[id]/route.ts` - Handle totalTimeDiscussed updates

---

## 📁 Files Modified (So Far)

### Created (1)
1. `/src/components/icons/DeleteIcon.tsx`

### Modified (6)
1. `/src/models/Topic.ts` - Added totalTimeDiscussed field
2. `/src/types/index.ts` - Added totalTimeDiscussed, isPaused, pausedRemainingSeconds
3. `/src/components/Board.tsx` - Layout fix, header design, delete handler, timer state
4. `/src/components/Column.tsx` - Added onDelete prop, pass to TopicCards
5. `/src/components/TopicCard.tsx` - Delete button, line-clamp-2
6. `/src/lib/api.ts` - No changes (deleteTopic already existed)

---

## 🎯 Testing Checklist

### Completed Features
- [x] Footer sticks to bottom (no scrollbar issues)
- [x] Header user info grouped nicely
- [x] Click Edit on topic → Delete button appears
- [x] Click Delete → Shows "Confirm Delete?"
- [x] Click Confirm → Topic deleted from database
- [x] Topic cards show max 2 lines of description
- [x] Database has totalTimeDiscussed field (check with MongoDB)

### Remaining Features
- [ ] Click "Finish Early" → Timer pauses
- [ ] Choose "Continue Discussion" → Timer resumes (not resets)
- [ ] Timer reaches 0 → Modal appears
- [ ] Choose "Continue Discussion" → Slider appears (1-10 min)
- [ ] Select time on slider → Click confirm → Timer restarts with new time
- [ ] Complete discussion → Check totalTimeDiscussed saved to database
- [ ] Start another round on same topic → Time adds to totalTimeDiscussed

---

## 📝 Implementation Order

To complete Phase 6, implement in this order:

1. **Resume Timer (handleFinishEarly + handleVoteSubmit continue case)**
   - Update handleFinishEarly to pause and store time
   - Update handleVoteSubmit continue case to resume from paused time
   - Test: Finish Early → Continue → Timer resumes

2. **Add Time Slider (when timer expires)**
   - Add state for showAddTimeSlider and additionalMinutes
   - Update modal UI to show slider when needed
   - Test: Timer expires → Continue → Slider → Add time

3. **Track & Save Duration**
   - Update handleConfirmDiscussClick to track startTime
   - Calculate elapsed time in handleVoteSubmit
   - Add to existing totalTimeDiscussed
   - Update API types and route
   - Test: Complete discussion → Check database

---

## 🔧 Quick Reference

### Timer State Management
```typescript
interface TimerSettings {
  durationMinutes: number;
  isRunning: boolean;
  startTime: number | null;
  remainingSeconds: number | null;
  currentTopicId: string | null;
  isPaused: boolean;
  pausedRemainingSeconds: number | null;
}
```

### Key Functions to Update
1. `handleFinishEarly()` - Pause timer
2. `handleTimerComplete()` - Mark as paused at 0
3. `handleVoteSubmit('continue')` - Resume or show slider
4. `handleConfirmDiscussClick()` - Track start time
5. `handleVoteSubmit('finish')` - Calculate and save duration

---

## 🚀 Next Steps

1. Implement resume timer logic
2. Implement add time slider
3. Implement duration tracking
4. Test all flows end-to-end
5. Create Phase 6 completion documentation

---

**Phase 6 Status:** 5/8 features complete (62.5%)

**Remaining Work:** Advanced timer logic (resume, add time, track duration)

**Estimated Completion:** 3 more focused sessions
