# Settings & Profile - Visual Guide 🎨

## Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         TOPBAR                               │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────────┐ │
│  │ 🔔   │  │ 🌙   │  │ ⚙️   │  │ 👤    │  │ Admin User   │ │
│  │Alerts│  │Theme │  │Settings│ │Profile│  │Sys Manager   │ │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────────────┘ │
│                          ↓          ↓            ↓           │
│                    /settings   /profile      /profile        │
└─────────────────────────────────────────────────────────────┘
```

## Settings Page Layout

```
┌────────────────────────────────────────────────────────────────┐
│  ⚙️  Settings                                                  │
│  Manage your account and application preferences               │
├──────────────┬─────────────────────────────────────────────────┤
│              │                                                  │
│  📋 General  │  GENERAL SETTINGS                               │
│              │  ┌─────────────────┬─────────────────┐          │
│  🔔 Notif.   │  │ Company Name    │ Industry        │          │
│              │  │ [Input Field]   │ [Dropdown]      │          │
│  🗄️ Data     │  └─────────────────┴─────────────────┘          │
│              │  ┌─────────────────┬─────────────────┐          │
│  🔒 Security │  │ Location        │ Timezone        │          │
│              │  │ [Input Field]   │ [Dropdown]      │          │
│              │  └─────────────────┴─────────────────┘          │
│              │                                                  │
│              │                      [💾 Save Changes]          │
└──────────────┴─────────────────────────────────────────────────┘
```

### Settings Tabs

#### 1. General Settings
```
┌─────────────────────────────────────────────────┐
│ Company Name:     [Carbon Nexus Corp        ]  │
│ Industry:         [Manufacturing ▼          ]  │
│ Location:         [United States            ]  │
│ Timezone:         [America/New_York ▼       ]  │
│ Language:         [English ▼                ]  │
└─────────────────────────────────────────────────┘
```

#### 2. Notification Settings
```
┌─────────────────────────────────────────────────┐
│ ✅ Email Notifications          [ON  ●──]      │
│    Receive alerts via email                     │
│                                                  │
│ ✅ Push Notifications           [ON  ●──]      │
│    Browser push notifications                   │
│                                                  │
│ ✅ Weekly Reports               [ON  ●──]      │
│    Receive weekly emissions summary             │
│                                                  │
│ ✅ Monthly Reports              [ON  ●──]      │
│    Receive monthly analytics report             │
│                                                  │
│ ✅ Anomaly Alerts               [ON  ●──]      │
│    Get notified of unusual patterns             │
│                                                  │
│ Alert Threshold:  [Medium - Important only ▼]  │
└─────────────────────────────────────────────────┘
```

#### 3. Data & Privacy
```
┌─────────────────────────────────────────────────┐
│ Data Retention:   [12 months ▼              ]  │
│ Export Format:    [CSV ▼                    ]  │
│                                                  │
│ ✅ Automatic Backups            [ON  ●──]      │
│    Daily automated data backups                 │
│                                                  │
│ ✅ API Access                   [ON  ●──]      │
│    Enable API access for integrations           │
└─────────────────────────────────────────────────┘
```

#### 4. Security Settings
```
┌─────────────────────────────────────────────────┐
│ ⚠️ Two-Factor Authentication    [OFF ──●]      │
│    Add an extra layer of security               │
│                                                  │
│ ⚠️ IP Whitelist                 [OFF ──●]      │
│    Restrict access to specific IP addresses     │
│                                                  │
│ ✅ Audit Logging                [ON  ●──]      │
│    Track all system activities                  │
│                                                  │
│ Session Timeout:  [30 minutes ▼             ]  │
└─────────────────────────────────────────────────┘
```

## Profile Page Layout

```
┌────────────────────────────────────────────────────────────────┐
│  👤 Profile                                                     │
│  Manage your personal information and preferences              │
├──────────────────┬─────────────────────────────────────────────┤
│                  │                                              │
│   ┌────────┐    │  PERSONAL INFORMATION                       │
│   │   AU   │    │  ┌──────────────┬──────────────┐            │
│   │ Avatar │    │  │ 👤 Full Name │ ✉️ Email     │            │
│   └────────┘    │  │ [Input]      │ [Input]      │            │
│   📷 Upload     │  └──────────────┴──────────────┘            │
│                  │  ┌──────────────┬──────────────┐            │
│  Admin User      │  │ 📞 Phone     │ 📍 Location  │            │
│  System Manager  │  │ [Input]      │ [Input]      │            │
│                  │  └──────────────┴──────────────┘            │
│  [✏️ Edit]       │                                              │
│                  │  Bio:                                        │
│  ┌────────────┐ │  [Passionate about sustainability...]       │
│  │📊 Reports  │ │                                              │
│  │   127      │ │  RECENT ACTIVITY                            │
│  └────────────┘ │  • Generated emissions forecast  2h ago     │
│  ┌────────────┐ │  • Uploaded new data file       5h ago     │
│  │🎯 Reduced  │ │  • Approved recommendation      1d ago     │
│  │   2.5T     │ │  • Viewed anomaly alert         2d ago     │
│  └────────────┘ │  • Ran What-If simulation       3d ago     │
│                  │                                              │
└──────────────────┴─────────────────────────────────────────────┘
```

### Profile Statistics

```
┌─────────────────────────────────────┐
│  📊  Reports Generated      127     │
├─────────────────────────────────────┤
│  🎯  Emissions Reduced      2.5T    │
├─────────────────────────────────────┤
│  🏆  Recommendations        43      │
├─────────────────────────────────────┤
│  📅  Days Active             328     │
└─────────────────────────────────────┘
```

### Recent Activity Timeline

```
┌─────────────────────────────────────────────┐
│  🔵  Generated emissions forecast  2h ago   │
│  🟢  Uploaded new data file       5h ago   │
│  🟣  Approved recommendation      1d ago   │
│  🔴  Viewed anomaly alert         2d ago   │
│  🟡  Ran What-If simulation       3d ago   │
└─────────────────────────────────────────────┘
```

## Color Coding

### Settings Page
- **General Tab**: Purple gradient (from-purple-500 to-pink-600)
- **Notifications**: Bell icon with yellow for active alerts
- **Data & Privacy**: Database icon with blue tones
- **Security**: Shield icon with red/orange for warnings

### Profile Page
- **Avatar**: Cyan to blue gradient (from-cyan-500 to-blue-600)
- **Stats Cards**: 
  - Reports: Cyan to blue
  - Emissions: Green to emerald
  - Recommendations: Purple to pink
  - Days Active: Amber to orange

### Activity Types
- 🔴 **Alert** - Red indicator
- 🔵 **Forecast** - Blue indicator
- 🟢 **Upload** - Green indicator
- 🟣 **Recommendation** - Purple indicator
- 🟡 **Simulation** - Amber indicator

## Interaction States

### Buttons
```
Normal:     [Save Changes]
Hover:      [Save Changes] ← Brighter gradient
Active:     [Save Changes] ← Slightly smaller (scale: 0.95)
Success:    [✓ Settings saved!] ← Green checkmark animation
```

### Toggle Switches
```
OFF:  [──●]  Gray background
ON:   [●──]  Purple background (peer-checked:bg-purple-600)
```

### Input Fields
```
Normal:     [Input text here]
Focus:      [Input text here] ← Purple border + ring
Disabled:   [Input text here] ← Grayed out, no cursor
```

## Responsive Behavior

### Desktop (lg+)
- Settings: Sidebar + content (4-column grid)
- Profile: 3-column layout (profile card + details)
- Full navigation visible

### Tablet (md)
- Settings: Stacked tabs + content
- Profile: 2-column layout
- Condensed navigation

### Mobile (sm)
- Settings: Full-width tabs + content
- Profile: Single column
- Hamburger menu for navigation

## Theme Support

### Dark Mode
- Background: `bg-white/5` with `border-white/10`
- Text: `text-white` with opacity variants
- Inputs: `bg-white/5` with white text
- Gradients: Darker, more subtle

### Light Mode
- Background: `bg-white` with `border-gray-200`
- Text: `text-gray-900` with gray variants
- Inputs: `bg-gray-50` with dark text
- Gradients: Brighter, more vibrant

## Animations

### Page Entry
```typescript
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
```

### Button Hover
```typescript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

### Success Message
```typescript
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
// Auto-hide after 3 seconds
```

## Accessibility Features

- ✅ Keyboard navigation support
- ✅ Focus indicators on all interactive elements
- ✅ ARIA labels on buttons (title attributes)
- ✅ Semantic HTML structure
- ✅ Color contrast meets WCAG standards
- ✅ Screen reader friendly labels

## User Flow Examples

### Changing Settings
1. Click ⚙️ Settings icon in topbar
2. Navigate to desired tab (e.g., Notifications)
3. Toggle switches or modify inputs
4. Click "Save Changes" button
5. See success confirmation
6. Settings are persisted

### Editing Profile
1. Click profile button in topbar
2. Click "Edit Profile" button
3. Modify any fields (name, email, etc.)
4. Click "Save Profile" button
5. Profile updates and exits edit mode
6. Changes are reflected immediately

---

**Visual Design:** Modern, clean, professional  
**Color Scheme:** Gradient-based with theme support  
**Animation:** Smooth, subtle, performant  
**Responsiveness:** Mobile-first, adaptive layout
