# 🔔 Notifications - Quick Reference Card

## 🎯 What It Does
Real-time popup notifications when emissions problems are detected (every 30 minutes).

---

## 🚀 Quick Start

### 1. Start Services
```bash
# Backend
cd plugins/orchestration-engine
python -m uvicorn src.main:app --reload --port 8000

# Frontend
cd frontend-ui
npm run dev
```

### 2. Test Notifications
```bash
python test_notifications.py
# Choose option 3: "Test multiple notifications"
```

### 3. Verify
- ✅ Popups appear in top-right
- ✅ Bell badge shows count
- ✅ Clicking bell goes to /alerts
- ✅ Badge clears after click

---

## 🎨 Notification Types

| Type | Icon | Color | Duration | Trigger |
|------|------|-------|----------|---------|
| Critical | 🚨 | Red | 10 sec | Critical emissions spike |
| Warning | ⚠️ | Yellow | 5 sec | Warning threshold |
| Info | ℹ️ | Blue | 5 sec | System updates |
| Hotspot | 🔥 | Orange | 7 sec | Hotspot detected |

---

## 🔔 Bell States

| State | Icon | Badge | Meaning |
|-------|------|-------|---------|
| No alerts | 🔔 Gray | None | All clear |
| 1 alert | 🟡 Yellow | 🔴1 | 1 unread alert |
| 5 alerts | 🟡 Yellow | 🔴5 | 5 unread alerts |
| 10+ alerts | 🟡 Yellow | 🔴9+ | 10+ unread alerts |

---

## 🔄 User Flow

```
Alert detected → Popup appears → Bell badge updates → User clicks bell → Navigate to /alerts → Badge clears
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `frontend-ui/src/components/layout/Layout.tsx` | WebSocket listener, toast management |
| `frontend-ui/src/components/layout/Topbar.tsx` | Bell icon, badge, click handler |
| `frontend-ui/src/hooks/useToast.ts` | Toast state management |
| `frontend-ui/src/components/notifications/ToastNotification.tsx` | Toast UI component |
| `plugins/orchestration-engine/src/services/websocket_manager.py` | WebSocket event emitter |
| `plugins/orchestration-engine/src/services/hotspot_engine.py` | Hotspot detection, alert generation |

---

## 🧪 Testing Commands

```bash
# Test notifications
python test_notifications.py

# Check WebSocket connection (in browser console)
console.log('WebSocket connected:', wsService.isConnected())

# Manually trigger notification (in browser console)
addToast({
  id: Date.now().toString(),
  type: 'error',
  title: 'Test',
  message: 'Test notification',
  duration: 5000
})
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No popups | Check WebSocket connection in console |
| Bell not clickable | Verify React Router installed |
| Badge not updating | Check state management in Layout.tsx |
| No browser notifications | Check permission in browser settings |

---

## 📊 WebSocket Events

### Listening For:
- `new_alert` - New alert generated
- `new_hotspot` - New hotspot detected

### Event Data:
```typescript
// new_alert
{ id, level, message, hotspot_id, created_at }

// new_hotspot
{ id, entity, severity, predicted_co2, baseline_co2, percent_above, created_at }
```

---

## ⚙️ Configuration

### Notification Duration
```typescript
// In Layout.tsx
duration: alertData.level === 'critical' ? 10000 : 5000
```

### Badge Limit
```typescript
// In Topbar.tsx
{unreadAlerts > 9 ? '9+' : unreadAlerts}
```

### WebSocket URL
```typescript
// In websocket.ts
const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
```

---

## 📝 Code Snippets

### Emit Alert (Backend)
```python
from services.websocket_manager import ws_manager

await ws_manager.emit_alert({
    'level': 'critical',
    'message': 'Emissions spike detected'
})
```

### Listen for Alert (Frontend)
```typescript
wsService.on('new_alert', (data) => {
  console.log('Alert:', data)
  addToast({ type: 'error', title: 'Alert', message: data.message })
})
```

### Show Toast Manually
```typescript
addToast({
  id: Date.now().toString(),
  type: 'error',
  title: 'Critical Alert',
  message: 'Emissions spike detected',
  duration: 10000
})
```

---

## ✅ Success Criteria

- [x] Popups appear on new alerts
- [x] Bell badge shows count
- [x] Bell is clickable
- [x] Badge clears on click
- [x] WebSocket stable
- [x] No console errors

---

## 📚 Documentation

- **Full Guide**: `POPUP_NOTIFICATIONS_COMPLETE.md`
- **Test Guide**: `TEST_NOTIFICATIONS_GUIDE.md`
- **Visual Summary**: `NOTIFICATION_SYSTEM_SUMMARY.md`
- **This Card**: `NOTIFICATIONS_QUICK_REFERENCE.md`

---

## 🎉 Status

**✅ FULLY IMPLEMENTED AND WORKING**

Test it now:
```bash
python test_notifications.py
```

Enjoy your real-time emissions monitoring! 🌍💚
