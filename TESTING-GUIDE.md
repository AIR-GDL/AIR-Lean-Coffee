# Testing Guide - Phase 2 Backend Integration

## Pre-Testing Setup

### 1. Verify Environment Variables
Ensure `.env.local` exists with your MongoDB connection string:
```bash
cat .env.local
# Should show: MONGODB_URI=mongodb+srv://...
```

### 2. Start the Development Server
```bash
npm run dev
```

Wait for the server to start, then open: **http://localhost:3000**

---

## Test Scenarios

### Test 1: User Registration & MongoDB Integration
**Goal**: Verify user creation in MongoDB

1. Open the application in your browser
2. Fill in the registration form:
   - Name: `Test User`
   - Email: `test@example.com`
3. Click "Get Started"
4. **Expected**: Should redirect to the board
5. **Verify in MongoDB**: Check your database for a new user document

**Test Database Connection**:
- If you see "Failed to register", check MongoDB connection
- Open browser DevTools Console for error messages
- Check terminal for MongoDB connection logs

---

### Test 2: Topic Creation
**Goal**: Verify topics are saved to MongoDB

1. On the board, click "Add Topic" button
2. Enter a topic: `"Discuss new features"`
3. Click "Add Topic"
4. **Expected**: Topic appears in "To Discuss" column under "New Topics"
5. **Verify**: Refresh the page - topic should still be there

**Check**:
- [ ] Topic displays author name below content
- [ ] Topic appears without page refresh
- [ ] Topic persists after page refresh

---

### Test 3: Voting System
**Goal**: Verify voting updates both topic and user in database

1. Click the vote button (👍) on a topic
2. **Expected**: 
   - Topic vote count increases
   - "Votes Remaining" in header decreases from 3 to 2
   - Topic moves from "New Topics" to "Top Voted" section
3. Vote on 2 more topics
4. Try voting a 4th time
5. **Expected**: Alert "No votes remaining!"
6. Refresh the page
7. **Expected**: Vote counts persist, still showing 0 votes remaining

**Check**:
- [ ] Votes increment correctly
- [ ] User votes remaining decrements
- [ ] Cannot vote with 0 remaining votes
- [ ] Votes persist after refresh

---

### Test 4: Drag & Drop Status Updates
**Goal**: Verify drag-and-drop updates topic status in MongoDB

1. Vote on a topic (so it's in "Top Voted")
2. Drag the voted topic to "Discussing" column
3. **Expected**: Confirmation modal appears
4. Click "Confirm"
5. **Expected**: 
   - Topic moves to "Discussing"
   - Timer starts automatically
6. Refresh the page
7. **Expected**: Topic remains in "Discussing" column

**Check**:
- [ ] Only voted topics can be moved to "Discussing"
- [ ] Confirmation modal works
- [ ] Timer starts on confirm
- [ ] Status persists after refresh

---

### Test 5: Timer & Discussion Completion
**Goal**: Verify timer completion workflow

1. Set discussion duration to 1 minute (use slider in Settings)
2. Move a topic to "Discussing"
3. Confirm the modal
4. Wait for timer to reach 0 (or set to 1 minute for quick test)
5. **Expected**: Voting modal appears
6. Click "Finish Topic"
7. **Expected**:
   - Confetti animation appears 🎉
   - Topic moves to "Discussed" column
8. Refresh the page
9. **Expected**: Topic remains in "Discussed"

**Check**:
- [ ] Timer counts down correctly
- [ ] Timer shows warning colors (yellow at 30s, red at 10s)
- [ ] Voting modal appears at 0
- [ ] "Finish Topic" moves topic and shows confetti
- [ ] "Continue Discussion" resets timer
- [ ] Status persists after refresh

---

### Test 6: Multi-Tab Real-Time Updates
**Goal**: Verify SWR real-time synchronization

1. Open the app in two browser tabs (same user)
2. In Tab 1: Create a new topic
3. **Expected**: Within 5 seconds, topic appears in Tab 2
4. In Tab 2: Vote on the topic
5. **Expected**: Within 5 seconds, vote count updates in Tab 1

**Check**:
- [ ] New topics appear in other tabs within 5 seconds
- [ ] Vote updates sync across tabs
- [ ] Both tabs show correct data

---

### Test 7: User Session Management
**Goal**: Verify session storage works correctly

1. Register/login as a user
2. Close the browser tab (not entire browser)
3. Open a new tab to http://localhost:3000
4. **Expected**: Should still be logged in
5. Close entire browser
6. Reopen browser and navigate to http://localhost:3000
7. **Expected**: Should be logged out (sessionStorage cleared)

**Check**:
- [ ] Session persists across tabs
- [ ] Session cleared on browser close
- [ ] Can re-login with same email (finds existing user)

---

### Test 8: Logout Functionality
**Goal**: Verify logout clears session

1. While logged in, click "Logout" button
2. Confirm logout
3. **Expected**: Returns to registration screen
4. Try logging in again with the same email
5. **Expected**: Should login successfully with vote counts preserved

**Check**:
- [ ] Logout clears session
- [ ] Re-login finds existing user
- [ ] Vote counts are preserved from previous session

---

### Test 9: Error Handling
**Goal**: Verify graceful error handling

**Test A: No MongoDB Connection**
1. Temporarily change `MONGODB_URI` in `.env.local` to invalid value
2. Restart the server
3. Try registering
4. **Expected**: Error message in console, user-friendly alert

**Test B: Network Failure**
1. Open DevTools > Network tab
2. Set throttling to "Offline"
3. Try creating a topic
4. **Expected**: Error alert shown

**Check**:
- [ ] API errors are caught and displayed
- [ ] Console shows helpful error messages
- [ ] App doesn't crash on errors

---

### Test 10: Data Persistence Across Users
**Goal**: Verify multiple users see the same data

1. Open app in incognito/private window
2. Register as different user: `user2@example.com`
3. **Expected**: See topics created by first user
4. Create a new topic as user2
5. Switch back to first user's window
6. **Expected**: Within 5 seconds, see user2's topic

**Check**:
- [ ] Topics are shared across all users
- [ ] Each user has independent vote counts
- [ ] Real-time updates work for all users

---

## MongoDB Database Verification

### Check Collections
Access your MongoDB Atlas dashboard or use MongoDB Compass:

**Users Collection**:
```javascript
{
  "_id": ObjectId("..."),
  "name": "Test User",
  "email": "test@example.com",
  "votesRemaining": 0,  // After voting 3 times
  "createdAt": ISODate("...")
}
```

**Topics Collection**:
```javascript
{
  "_id": ObjectId("..."),
  "content": "Discuss new features",
  "author": "Test User",
  "votes": 1,
  "status": "to-discuss",  // or "discussing" or "discussed"
  "createdAt": ISODate("...")
}
```

---

## Common Issues & Solutions

### Issue: "Failed to create topic"
**Solution**:
- Check MongoDB connection in terminal logs
- Verify `MONGODB_URI` in `.env.local`
- Check MongoDB Atlas network access (IP whitelist)

### Issue: Topics don't appear
**Solution**:
- Check browser console for API errors
- Verify `/api/topics` endpoint returns data (visit in browser)
- Check SWR is configured in `useTopics.ts`

### Issue: "No votes remaining" immediately
**Solution**:
- Check user document in MongoDB
- User may have voted in previous session
- `votesRemaining` field should reset to 3 for new users

### Issue: Drag-and-drop not working
**Solution**:
- Ensure topic has votes (only voted topics can be moved)
- Check browser console for errors
- Verify `@dnd-kit` packages are installed

### Issue: Timer not starting
**Solution**:
- Timer is stored in localStorage (not MongoDB)
- Clear browser localStorage and try again
- Check timer settings in "Settings" column

---

## Performance Checks

- [ ] Page loads in < 2 seconds
- [ ] Topics fetch in < 1 second
- [ ] Creating topic feels instant (optimistic UI)
- [ ] Voting updates immediately in UI
- [ ] Real-time updates occur within 5 seconds
- [ ] No memory leaks (check DevTools Performance)

---

## API Endpoint Testing (Optional)

Use browser or tools like Postman:

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"API User","email":"api@test.com"}'
```

### Get All Topics
```bash
curl http://localhost:3000/api/topics
```

### Create Topic
```bash
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{"content":"API created topic","author":"API User"}'
```

### Vote on Topic
```bash
curl -X PUT http://localhost:3000/api/topics/[TOPIC_ID] \
  -H "Content-Type: application/json" \
  -d '{"action":"VOTE","userEmail":"api@test.com"}'
```

---

## Success Criteria

✅ **Phase 2 Migration is successful if**:
- All topics are stored in and loaded from MongoDB
- Users are created/found in MongoDB
- Voting updates both topic and user in database
- Drag-and-drop updates topic status in database
- Multiple tabs show synchronized data
- Page refreshes maintain correct state
- No localStorage used for topics or users
- All TypeScript compiles without errors
- All tests pass without errors

---

## Next Steps After Testing

Once all tests pass:
1. Document any issues found
2. Consider adding WebSockets for true real-time updates
3. Add user authentication (JWT/NextAuth)
4. Implement discussion history/audit logs
5. Add export functionality
6. Deploy to production (Vercel + MongoDB Atlas)

Happy Testing! 🚀
