# 🧪 Testing Popup Notifications - Quick Guide

## Prerequisites

1. **Backend Running**: Orchestration engine must be running
   ```bash
   cd plugins/orchestration-engine
   python -m uvicorn src.main:app --reload --port 8000
   ```

2. **Frontend Running**: React app must be running
   ```bash
   cd frontend-ui
   npm run dev
   ```

3. **Browser Open**: Frontend must be open in browser at `http://localhost:5173`

---

## Method 1: Automated Test Script (Recommended)

### Step 1: Run the test script
```bash
python test_notifications.py
```

### Step 2: Choose test option
```
Choose test:
1. Test single alert notification
2. Test single hotspot notification
3. Test multiple notifications (recommended) ← Choose this
4. Exit
```

### Step 3: Watch the magic happen!
You should see:
- ✅ 4 popup notifications appear in top-right corner
- ✅ Notification bell turns yellow
- ✅ Red badge shows count: 4
- ✅ Pulsing animation on badge

### Step 4: Test bell click
- Click the notification bell
- Should navigate to `/alerts` page
- Badge should disappear

---

## Method 2: Wait for Scheduler (Real-World Test)

### Step 1: Upload test data
```bash
# Upload CSV with high-emission data
# Use the Ingest page in the UI
```

### Step 2: Wait for scheduler
The scheduler runs every 30 minutes and will:
1. Detect hotspots
2. Generate alerts
3. Emit WebSocket events
4. Trigger popup notifications

### Step 3: Watch for notifications
When the scheduler runs, you'll see:
- Popup notifications for detected hotspots
- Popup notifications for generated alerts
- Bell badge incrementing

---

## Method 3: Manual WebSocket Test

### Step 1: Open browser console
```javascript
// In browser console (F12)
```

### Step 2: Check WebSocket connection
```javascript
// You should see in console:
"✅ WebSocket connected"
```

### Step 3: Manually emit event (from backend)
```python
# In Python shell or script
from plugins.orchestration_engine.src.services.websocket_manager import ws_manager
import asyncio

async def test():
    await ws_manager.emit_alert({
        'id': 999,
        'level': 'critical',
        'message': 'Manual test alert',
        'created_at': '2025-11-29T12:00:00'
    })

asyncio.run(test())
```

---

## What to Verify

### ✅ Popup Notifications
- [ ] Notifications appear in top-right corner
- [ ] Different colors for different types (red, yellow, blue)
- [ ] Auto-dismiss after duration
- [ ] Can manually close with X button
- [ ] Multiple notifications stack vertically

### ✅ Notification Bell
- [ ] Bell icon visible in top-right header
- [ ] Bell turns yellow when alerts exist
- [ ] Red badge appears with count
- [ ] Badge shows "9+" for 10+ alerts
- [ ] Pulsing animation on badge
- [ ] Clicking bell navigates to /alerts
- [ ] Badge clears after clicking bell

### ✅ Browser Notifications
- [ ] Permission requested on first load
- [ ] OS notification appears for critical alerts
- [ ] Notification shows correct title and message
- [ ] Clicking notification focuses browser

### ✅ WebSocket Connection
- [ ] Console shows "✅ WebSocket connected"
- [ ] Console shows "🚨 New alert received: {...}" when alert occurs
- [ ] Console shows "🔥 New hotspot detected: {...}" when hotspot occurs
- [ ] No connection errors in console

---

## Expected Behavior

### Scenario 1: Single Alert
```
1. Alert detected by backend
2. WebSocket event emitted
3. Frontend receives event
4. Popup appears: "🚨 CRITICAL - Test alert message"
5. Bell turns yellow
6. Badge shows: 1
7. After 10 seconds, popup auto-dismisses
8. Badge remains until bell clicked
```

### Scenario 2: Multiple Alerts
```
1. Multiple alerts detected
2. Multiple popups appear (stacked)
3. Badge shows total count: 3
4. Popups auto-dismiss one by one
5. Badge remains: 3
6. Click bell → Navigate to /alerts
7. Badge clears: 0
```

### Scenario 3: Hotspot Detection
```
1. Hotspot detected (emissions spike)
2. WebSocket event emitted
3. Popup appears: "⚠️ WARNING Hotspot - Supplier: 70.1 kg CO₂"
4. Bell badge increments
5. After 7 seconds, popup auto-dismisses
```

---

## Troubleshooting

### Problem: No notifications appearing

**Solution 1: Check WebSocket connection**
```javascript
// In browser console
console.log('WebSocket connected:', wsService.isConnected())
```

**Solution 2: Check backend logs**
```bash
# Should see in orchestration engine logs:
"Emitted alert notification: critical - Test message"
"Emitted hotspot notification: Heavy_Load_Supplier - critical"
```

**Solution 3: Restart services**
```bash
# Restart backend
cd plugins/orchestration-engine
python -m uvicorn src.main:app --reload --port 8000

# Restart frontend
cd frontend-ui
npm run dev
```

### Problem: Bell not clickable

**Solution: Check React Router**
```bash
# Ensure react-router-dom is installed
cd frontend-ui
npm install react-router-dom
```

### Problem: Badge not updating

**Solution: Check state management**
```typescript
// Add console.log in Layout.tsx
const handleNewAlert = (alertData: any) => {
  console.log('Alert received, incrementing badge')
  setUnreadAlerts(prev => {
    console.log('Badge count:', prev + 1)
    return prev + 1
  })
}
```

### Problem: Browser notifications not working

**Solution: Check permissions**
```javascript
// In browser console
console.log('Notification permission:', Notification.permission)

// Request permission
Notification.requestPermission().then(permission => {
  console.log('Permission:', permission)
})
```

---

## Quick Verification Checklist

Run through this checklist to verify everything works:

1. [ ] Start backend: `cd plugins/orchestration-engine && python -m uvicorn src.main:app --reload --port 8000`
2. [ ] Start frontend: `cd frontend-ui && npm run dev`
3. [ ] Open browser: `http://localhost:5173`
4. [ ] Check console: Should see "✅ WebSocket connected"
5. [ ] Run test script: `python test_notifications.py`
6. [ ] Choose option 3: "Test multiple notifications"
7. [ ] Verify 4 popups appear
8. [ ] Verify bell badge shows: 4
9. [ ] Click bell
10. [ ] Verify navigation to /alerts
11. [ ] Verify badge clears

**If all steps pass: ✅ Notification system is working perfectly!**

---

## Demo Video Script

Want to record a demo? Follow this script:

1. **Show initial state**
   - "Here's the Carbon Nexus dashboard"
   - "Notice the notification bell in the top-right"
   - "Currently no alerts"

2. **Trigger notifications**
   - "Let me trigger some test notifications"
   - Run test script
   - "Watch the top-right corner"

3. **Show popups**
   - "See the popup notifications appearing"
   - "Different colors for different severity levels"
   - "They auto-dismiss after a few seconds"

4. **Show bell badge**
   - "Notice the bell turned yellow"
   - "The red badge shows we have 4 unread alerts"
   - "See the pulsing animation"

5. **Click bell**
   - "When I click the bell..."
   - Click bell
   - "It navigates to the alerts page"
   - "And the badge clears"

6. **Conclusion**
   - "This provides real-time awareness of emissions issues"
   - "Users are immediately notified when problems occur"
   - "No need to constantly check the dashboard"

---

## Success Criteria

Your notification system is working correctly if:

✅ Popups appear when alerts/hotspots detected  
✅ Bell badge shows correct unread count  
✅ Bell is clickable and navigates to /alerts  
✅ Badge clears when alerts page visited  
✅ WebSocket connection is stable  
✅ No console errors  
✅ Browser notifications work (if permission granted)  
✅ Multiple notifications stack properly  
✅ Animations are smooth  
✅ Colors match severity levels  

**If all criteria met: 🎉 Notification system is production-ready!**
