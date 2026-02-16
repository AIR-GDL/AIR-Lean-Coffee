# Phase 3 Testing Quick Start Guide

## 🚀 Quick Start

```bash
# Ensure MongoDB connection is configured
cat .env.local

# Start the development server
npm run dev

# Open browser
open http://localhost:3000
```

---

## ✅ Feature Testing Scenarios

### 1. Blue Theme Verification (2 minutes)
**What to Check:**
- [ ] Registration page has blue "Get Started" button
- [ ] Board header shows blue vote count
- [ ] "Add Topic" button is blue
- [ ] Slider accent color is blue
- [ ] Vote buttons turn blue on hover
- [ ] Modal confirm buttons are blue
- [ ] All hover effects show darker blue

**Quick Test:**
1. Look at registration page → blue button? ✓
2. Register and check board → blue elements? ✓
3. Hover over interactive elements → cursor pointer? ✓

---

### 2. Topic Editing (3 minutes)
**How to Test:**

1. **Create a topic:**
   - Click "Add Topic"
   - Enter: "Test editable topic"
   - Click "Add Topic"

2. **Edit the topic:**
   - Hover over the topic card in "To Discuss"
   - See edit icon (✏️) appear?
   - Click edit icon
   - Change text to: "Edited topic content"
   - Click "Save"
   - Verify text updated

3. **Try editing in other columns:**
   - Vote on topic, drag to "Discussing"
   - Hover → no edit icon should appear ✓
   - Topics in "Discussing" and "Discussed" are read-only

**Expected:**
- ✅ Edit icon appears only in "To Discuss"
- ✅ Textarea appears with current content
- ✅ Save updates the text
- ✅ Cancel reverts changes
- ✅ Cannot drag while editing

---

### 3. Controls & Info Column (2 minutes)
**What to Check:**

1. **Column renamed:**
   - 4th column says "Controls & Info" (not "Settings")

2. **Participants section:**
   - Below the duration slider
   - Shows "Participants" header with user icon
   - Lists all registered users
   - Shows vote counts (e.g., "John Doe: 3 votes")

3. **History button:**
   - Blue button at bottom
   - Says "View Discussion History"
   - Has history icon

**Quick Test:**
```
1. Look at 4th column → "Controls & Info"? ✓
2. See participants list → your name with 3 votes? ✓
3. See history button → blue with icon? ✓
```

---

### 4. Vote Return Logic (5 minutes)
**Critical Test - Verify votes come back!**

**Step-by-Step:**

1. **Initial state:**
   - Check your votes: Should show "3/3"
   - Check participants list: You have 3 votes

2. **Create and vote on topic:**
   - Create topic: "Vote return test"
   - Click vote button
   - Your votes: Now "2/3"
   - Participants list: Now "2 votes"

3. **Move to discussed:**
   - Drag topic to "Discussing"
   - Confirm the modal
   - Let timer run OR click "Finish Early"
   - Vote "Finish Topic"
   - Watch confetti 🎉

4. **Verify vote returned:**
   - Check your votes: Should be "3/3" again ✓
   - Check participants list: Should show "3 votes" ✓
   - Topic now in "Discussed" column

**Expected Result:**
- ✅ Vote count: 3 → 2 → 3
- ✅ Participants list updates in real-time
- ✅ All voters get their votes back

---

### 5. Discussion History (3 minutes)
**How to Test:**

1. **Complete a few topics:**
   - Create 2-3 topics
   - Vote on them
   - Move to Discussing
   - Finish them (they go to "Discussed")

2. **Open history page:**
   - Click "View Discussion History" in Controls & Info
   - Page loads with blue theme

3. **Verify content:**
   - All discussed topics shown
   - Each shows: content, author, votes, date/time
   - Formatted nicely with cards
   - Blue left border on cards

4. **Navigate back:**
   - Click "Back to Board"
   - Returns to main board

**Expected:**
- ✅ History page shows all discussed topics
- ✅ Topics sorted by completion time (newest first)
- ✅ Readable date format
- ✅ Blue theme consistent
- ✅ Navigation works

---

### 6. Timer Bug Fix (4 minutes)
**Testing Continue Discussion:**

1. **Start a discussion:**
   - Set timer to 1 minute (for quick test)
   - Drag a voted topic to "Discussing"
   - Confirm modal
   - Timer starts counting down

2. **Let timer expire:**
   - Wait for timer to hit 0:00
   - Voting modal appears

3. **Vote to continue:**
   - Click "Continue Discussion"
   - **CRITICAL:** Timer should restart immediately ✓
   - Timer shows full duration (1:00)
   - Timer is counting down again

4. **Verify bug is fixed:**
   - Before fix: Timer stayed at 0:00
   - After fix: Timer restarts and counts down ✓

**Expected:**
- ✅ Timer restarts to full duration
- ✅ Timer is actively counting down
- ✅ Can continue multiple times

---

### 7. Finish Early Feature (3 minutes)
**How to Test:**

1. **Start a discussion:**
   - Set timer to 5 minutes
   - Move topic to "Discussing"
   - Confirm modal
   - Timer starts

2. **Use Finish Early:**
   - See "Finish Early" button below timer
   - Blue border, stop icon
   - Click "Finish Early"
   - Timer pauses
   - Voting modal appears

3. **Test both options:**
   
   **Option A - Continue:**
   - Vote "Continue Discussion"
   - Timer resumes from where it paused
   - Discussion continues
   
   **Option B - Finish:**
   - Click "Finish Early" again
   - Vote "Finish Topic"
   - Confetti appears
   - Topic moves to "Discussed"
   - Votes returned

**Expected:**
- ✅ Button appears when timer is running
- ✅ Button disappears when timer not running
- ✅ Clicking triggers voting modal
- ✅ Both Continue and Finish work correctly

---

## 🔍 Visual Checklist

### Color Verification
Open each page and verify blue theme:

**Registration Page:**
- [ ] Blue "Get Started" button (#005596)
- [ ] Blue-sky gradient background

**Main Board:**
- [ ] Blue vote count in header
- [ ] Blue "Add Topic" button
- [ ] Blue slider accent
- [ ] Blue "View Discussion History" button
- [ ] Blue voted topic indicators
- [ ] Blue "Finish Early" button (when timer running)

**History Page:**
- [ ] Blue "Discussion History" title
- [ ] Blue left border on topic cards
- [ ] Blue vote counts

**Interactive Elements:**
- [ ] Cursor changes to pointer on all buttons
- [ ] Cursor changes to pointer on topic cards (for drag)
- [ ] Cursor changes to pointer on vote buttons

---

## 🐛 Known Issues to Watch For

### If Vote Return Doesn't Work:
1. Check MongoDB - does Topic have `votedBy` array?
2. Check browser console for errors
3. Verify `mutateUsers()` is called after finishing topic
4. Check participants list - does it refresh?

### If Editing Doesn't Work:
1. Only works in "To Discuss" column
2. Check if `content` field is being sent to API
3. Verify API endpoint accepts `content` parameter
4. Check browser console for errors

### If Timer Doesn't Restart:
1. Check `isRunning: true` is set when continuing
2. Verify `startTime` is updated to `Date.now()`
3. Check `remainingSeconds` is reset to full duration

---

## 📊 Success Criteria

Phase 3 is successful if:

- ✅ All buttons and accents are blue (#005596)
- ✅ Topics can be edited in "To Discuss" column only
- ✅ Participants list shows all users with vote counts
- ✅ Votes return when topics are discussed
- ✅ History page displays completed discussions
- ✅ Timer restarts on "Continue Discussion"
- ✅ "Finish Early" button works correctly
- ✅ All interactive elements have cursor pointer
- ✅ No TypeScript errors (`npx tsc --noEmit`)
- ✅ All features work across page refreshes

---

## 🎯 Quick 10-Minute Full Test

**Complete Phase 3 feature test:**

1. **Register** (30 sec)
   - Blue button, blue theme ✓

2. **Create & Edit** (1 min)
   - Create topic, edit it, save ✓

3. **Check Participants** (30 sec)
   - See yourself in list with 3 votes ✓

4. **Vote & Return** (2 min)
   - Vote on topic, finish discussion, get vote back ✓

5. **Timer Features** (3 min)
   - Start discussion, try "Finish Early" ✓
   - Continue discussion, verify timer restarts ✓

6. **History** (2 min)
   - Open history page, see discussed topics ✓
   - Navigate back to board ✓

7. **Multi-tab** (1 min)
   - Open second tab, see same data ✓
   - Create topic in one, see in other ✓

**Total time: ~10 minutes**
**If all ✓ → Phase 3 complete!** 🎉

---

## 💡 Tips

- **Use short timer durations** (1-2 minutes) for testing
- **Open browser DevTools** to see API calls and errors
- **Check MongoDB Atlas** to verify data is being saved
- **Test in incognito** to verify multi-user scenarios
- **Refresh page often** to test persistence

---

## 📝 Reporting Issues

If you find a bug:

1. Note which feature is broken
2. Check browser console for errors
3. Check Network tab for failed API calls
4. Note steps to reproduce
5. Check if it persists after page refresh

Common places to check:
- Browser Console (F12)
- Network Tab (see API responses)
- MongoDB Atlas (check data)
- Terminal (see server errors)

---

**Happy Testing!** 🚀

All Phase 3 features are ready to test. The application is now a polished, production-ready Lean Coffee Board tool!
