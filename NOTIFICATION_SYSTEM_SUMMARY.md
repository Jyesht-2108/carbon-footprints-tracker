# 🔔 Notification System - Visual Summary

## 🎯 What Was Implemented

A complete real-time notification system that alerts users when emissions problems are detected.

---

## 📊 Visual Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION SYSTEM FLOW                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  Scheduler   │  Runs every 30 minutes
│  (Backend)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Hotspot    │  Detects emissions anomalies
│   Engine     │  (e.g., 47.9% above baseline)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Database   │  Stores hotspot + alert
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  WebSocket   │  Emits events:
│   Manager    │  - 'new_hotspot'
└──────┬───────┘  - 'new_alert'
       │
       │ Real-time
       │ WebSocket
       │ Connection
       ▼
┌──────────────┐
│   Frontend   │  Receives events
│   (React)    │
└──────┬───────┘
       │
       ├─────────────────┬─────────────────┬──────────────────┐
       ▼                 ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Popup Toast  │  │ Bell Badge   │  │ Bell Color   │  │  Browser     │
│ Notification │  │ Increments   │  │ Turns Yellow │  │ Notification │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
       │                 │                 │                  │
       ▼                 ▼                 ▼                  ▼
   Shows for        Shows count       Visual alert      OS-level
   5-10 sec         (1, 2, 3...)      indicator         notification
```

---

## 🎨 UI Components

### Before Alert
```
┌─────────────────────────────────────────────────────────────┐
│  Carbon Nexus                                    🔔 ⚙️ 👤   │
│  Emissions Intelligence Platform                            │
└─────────────────────────────────────────────────────────────┘
                                                    ↑
                                            Gray bell (no alerts)
```

### After Alert Detected
```
┌─────────────────────────────────────────────────────────────┐
│  Carbon Nexus                                   🟡🔴3 ⚙️ 👤  │
│  Emissions Intelligence Platform                            │
└─────────────────────────────────────────────────────────────┘
                                                   ↑  ↑
                                          Yellow bell │
                                                Red badge (count: 3)

                                        ┌──────────────────────┐
                                        │ 🚨 CRITICAL          │
                                        │ Heavy_Load_Supplier  │
                                        │ emissions spike:     │
                                        │ 88.7 kg CO₂         │
                                        │ (47.9% above)       │
                                        │                  [X] │
                                        │ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░  │
                                        └──────────────────────┘
                                                ↑
                                        Popup notification
                                        (auto-dismisses)
```

### After Clicking Bell
```
┌─────────────────────────────────────────────────────────────┐
│  Carbon Nexus                                    🔔 ⚙️ 👤   │
│  Emissions Intelligence Platform                            │
└─────────────────────────────────────────────────────────────┘
                                                    ↑
                                            Badge cleared
                                            Navigated to /alerts
```

---

## 🎭 Notification Types

### 1. Critical Alert (Red)
```
┌──────────────────────────┐
│ 🚨 CRITICAL              │
│ Emissions spike detected │
│ Immediate action needed  │
│                      [X] │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░    │ ← 10 second timer
└──────────────────────────┘
```

### 2. Warning Alert (Yellow)
```
┌──────────────────────────┐
│ ⚠️ WARNING               │
│ Approaching threshold    │
│ Monitor closely          │
│                      [X] │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░    │ ← 5 second timer
└──────────────────────────┘
```

### 3. Info Alert (Blue)
```
┌──────────────────────────┐
│ ℹ️ INFO                  │
│ Baseline recalculated    │
│ System updated           │
│                      [X] │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░    │ ← 5 second timer
└──────────────────────────┘
```

### 4. Hotspot Alert (Orange)
```
┌──────────────────────────┐
│ 🔥 WARNING Hotspot       │
│ Heavy_Load_Supplier      │
│ 70.1 kg CO₂ (16.8%)     │
│                      [X] │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░    │ ← 7 second timer
└──────────────────────────┘
```

---

## 🔔 Bell Badge States

### State 1: No Alerts
```
┌────┐
│ 🔔 │  Gray bell
└────┘  No badge
```

### State 2: 1 Alert
```
┌────┐
│ 🟡 │  Yellow bell
└─┬──┘
  │🔴1  Red badge (pulsing)
```

### State 3: 5 Alerts
```
┌────┐
│ 🟡 │  Yellow bell
└─┬──┘
  │🔴5  Red badge (pulsing)
```

### State 4: 10+ Alerts
```
┌────┐
│ 🟡 │  Yellow bell
└─┬──┘
  │🔴9+ Red badge (pulsing)
```

---

## 🔄 User Interaction Flow

```
User opens app
    ↓
WebSocket connects automatically
    ↓
User continues working
    ↓
[30 minutes pass]
    ↓
Scheduler detects hotspot
    ↓
🎉 POPUP APPEARS!
    ↓
User sees notification
    ↓
User notices yellow bell with badge
    ↓
User clicks bell
    ↓
Navigates to /alerts page
    ↓
Badge clears
    ↓
User reviews alerts
    ↓
User takes action
```

---

## 📱 Multiple Notifications

When multiple alerts occur:

```
                                        ┌──────────────────────┐
                                        │ 🚨 CRITICAL          │
                                        │ Alert 1              │
                                        └──────────────────────┘
                                        
                                        ┌──────────────────────┐
                                        │ ⚠️ WARNING           │
                                        │ Alert 2              │
                                        └──────────────────────┘
                                        
                                        ┌──────────────────────┐
                                        │ 🔥 HOTSPOT           │
                                        │ Alert 3              │
                                        └──────────────────────┘

Notifications stack vertically
Each auto-dismisses independently
Badge shows total count: 3
```

---

## 🎬 Animation Details

### Bell Badge Animation
```
Frame 1:  🔔        (Normal)
Frame 2:  🟡🔴1     (Badge appears)
Frame 3:  🟡🔴1 ✨  (Pulse ring)
Frame 4:  🟡🔴1     (Ring fades)
Frame 5:  🟡🔴1 ✨  (Pulse ring)
[Repeat]
```

### Popup Animation
```
Frame 1:  [Hidden]
Frame 2:  [Slide in from top]
Frame 3:  [Fully visible]
Frame 4:  [Progress bar animates]
Frame 5:  [Slide out to right]
Frame 6:  [Hidden]
```

---

## 🧪 Test Scenarios

### Scenario A: Single Critical Alert
```
1. Run: python test_notifications.py
2. Choose: Option 1 (Single alert)
3. Expect:
   - Red popup appears
   - Bell turns yellow
   - Badge shows: 1
   - Popup stays 10 seconds
   - Badge remains after popup gone
```

### Scenario B: Multiple Alerts
```
1. Run: python test_notifications.py
2. Choose: Option 3 (Multiple notifications)
3. Expect:
   - 4 popups appear (stacked)
   - Bell turns yellow
   - Badge shows: 4
   - Popups dismiss one by one
   - Badge remains: 4
```

### Scenario C: Bell Click
```
1. Wait for alerts (or run test)
2. Click bell icon
3. Expect:
   - Navigate to /alerts page
   - Badge clears to 0
   - Bell returns to gray
```

### Scenario D: Real-World (30 min)
```
1. Upload high-emission CSV
2. Wait 30 minutes
3. Expect:
   - Scheduler runs
   - Hotspots detected
   - Alerts generated
   - Popups appear automatically
   - Badge increments
```

---

## 📊 Technical Details

### WebSocket Events
```javascript
// Event: new_alert
{
  id: 123,
  level: 'critical',
  message: 'Emissions spike detected',
  hotspot_id: 456,
  created_at: '2025-11-29T12:00:00'
}

// Event: new_hotspot
{
  id: 456,
  entity: 'Heavy_Load_Supplier',
  severity: 'critical',
  predicted_co2: 88.7,
  baseline_co2: 60.0,
  percent_above: 47.9,
  created_at: '2025-11-29T12:00:00'
}
```

### State Management
```typescript
// Layout.tsx
const [unreadAlerts, setUnreadAlerts] = useState(0)

// On new alert
setUnreadAlerts(prev => prev + 1)  // Increment

// On bell click
setUnreadAlerts(0)  // Clear
```

### Toast Management
```typescript
// useToast hook
const [toasts, setToasts] = useState<Toast[]>([])

// Add toast
addToast({
  id: Date.now().toString(),
  type: 'error',
  title: 'CRITICAL',
  message: 'Emissions spike',
  duration: 10000
})

// Remove toast (auto or manual)
removeToast(id)
```

---

## ✅ Verification Checklist

Before considering the feature complete, verify:

- [x] Popup notifications appear on new alerts
- [x] Popup notifications appear on new hotspots
- [x] Bell icon is clickable
- [x] Bell navigates to /alerts page
- [x] Badge shows correct count
- [x] Badge shows "9+" for 10+ alerts
- [x] Badge has pulsing animation
- [x] Bell turns yellow when alerts exist
- [x] Badge clears when alerts page visited
- [x] WebSocket connection is stable
- [x] Multiple notifications stack properly
- [x] Notifications auto-dismiss
- [x] Can manually close notifications
- [x] Browser notifications work (if permitted)
- [x] No console errors
- [x] Works in Chrome, Firefox, Safari
- [x] Responsive on mobile devices

---

## 🎉 Success Metrics

The notification system is successful if:

1. **Awareness**: Users are immediately aware of emissions issues
2. **Engagement**: Users click bell to view details
3. **Action**: Users take corrective action on alerts
4. **Reliability**: Notifications always appear when issues occur
5. **Performance**: No lag or delays in notification delivery
6. **UX**: Notifications are helpful, not annoying

---

## 🚀 Ready to Use!

The notification system is now **fully implemented** and **production-ready**!

**To test:**
```bash
python test_notifications.py
```

**To use in production:**
- Just keep the app running
- Notifications appear automatically every 30 minutes
- Users stay informed without checking dashboard constantly

**Enjoy your real-time emissions monitoring! 🌍💚**
