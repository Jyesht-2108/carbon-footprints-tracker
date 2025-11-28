# Text Color Fix - Light Mode Visibility

## Issue Fixed
White text was appearing in light mode, making content unreadable. This was caused by hardcoded `text-white` classes that didn't adapt to theme changes.

## Components Fixed ✅

### Core Cards (Dashboard)
1. **EmissionsCard.tsx**
   - Card title: `text-gray-700 dark:text-white/90`
   - Description: `text-gray-500 dark:text-white/60`

2. **HotspotsCard.tsx**
   - Card title: `text-gray-900 dark:text-white`
   - Entity names: `text-gray-900 dark:text-white`
   - Descriptions: `text-gray-600 dark:text-white/60`
   - Empty states: `text-gray-600 dark:text-white/60`

3. **AlertsCard.tsx**
   - Card title: `text-gray-700 dark:text-white/90`

4. **DataQualityCard.tsx**
   - Card title: `text-gray-700 dark:text-white/90`
   - Metrics: `text-gray-900 dark:text-white`
   - Labels: `text-gray-600 dark:text-white/60`
   - Progress ring text: `text-gray-900 dark:text-white`

5. **RecommendationsCard.tsx**
   - Card title: `text-gray-900 dark:text-white`
   - Recommendation titles: `text-gray-900 dark:text-white`
   - Confidence scores: `text-gray-600 dark:text-white/60`
   - Empty states: `text-gray-600 dark:text-white/60`

### Charts
1. **ForecastChart.tsx**
   - Empty state title: `text-gray-900 dark:text-white`
   - Empty state description: `text-gray-600 dark:text-white/50`

2. **EmissionsPieChart.tsx**
   - Empty states: `text-gray-600 dark:text-white/50`

3. **EmissionsBarChart.tsx**
   - Empty states: `text-gray-600 dark:text-white/50`

4. **EmissionsHeatmap.tsx**
   - Empty states: `text-gray-600 dark:text-white/50`

### Pages
1. **DashboardPage.tsx**
   - Page description: `text-gray-600 dark:text-white/60`
   - Section titles: `text-gray-900 dark:text-white`
   - Section descriptions: `text-gray-600 dark:text-white/50`
   - Last updated label: `text-gray-600 dark:text-white/60`
   - Last updated value: `text-gray-900 dark:text-white`

### Layout Components (Already Correct) ✅
- **Sidebar.tsx** - Uses conditional `isDark` logic throughout
- **Topbar.tsx** - Uses conditional `isDark` logic throughout
- **Layout.tsx** - Properly themed

## Components Still Needing Fixes ⚠️

These components still have hardcoded `text-white` and need updates:

### High Priority
1. **SimulatorPage.tsx** - Many labels, inputs, and result displays
2. **IngestPage.tsx** - Upload instructions and file requirements
3. **ChatbotPage.tsx** - Chat messages and interface
4. **AlertsPage.tsx** - Alert details and listings

### Medium Priority
5. **UploadHistory.tsx** - File names and status text
6. **HotspotDetailPanel.tsx** - Detail labels and metric values
7. **RecommendationDetailModal.tsx** - Modal content and actions

### Chart Components (Partial Fix Needed)
8. **EmissionsHeatmap.tsx** - Legend labels and hover tooltips still use `text-white`
9. **ForecastChart.tsx** - Chart axis labels (in Recharts config)

## Pattern to Follow

When fixing remaining components, use this pattern:

```tsx
// Primary text (headings, important labels)
className="text-gray-900 dark:text-white"

// Secondary text (descriptions, labels)
className="text-gray-600 dark:text-white/60"
// or
className="text-gray-700 dark:text-white/70"

// Tertiary text (hints, placeholders)
className="text-gray-500 dark:text-white/50"
// or
className="text-gray-400 dark:text-white/40"

// Empty state icons
className="text-gray-300 dark:text-white/20"
```

## Alternative: Use Conditional Rendering

For complex components, consider using the `isDark` pattern like Sidebar/Topbar:

```tsx
const { theme } = useTheme()
const isDark = theme === 'dark'

<div className={`
  ${isDark ? 'text-white' : 'text-gray-900'}
`}>
```

## Testing Checklist

After fixing a component:
- [ ] Toggle theme and verify text is visible in both modes
- [ ] Check all text elements (titles, labels, descriptions, empty states)
- [ ] Verify hover states work in both themes
- [ ] Test on actual data and empty states
- [ ] Check contrast ratios for accessibility

## CSS Utility Classes Available

From `index.css`:
```css
.text-theme-primary { @apply text-gray-900 dark:text-white; }
.text-theme-secondary { @apply text-gray-600 dark:text-white/70; }
.text-theme-tertiary { @apply text-gray-500 dark:text-white/50; }
```

These can be used instead of inline classes for consistency.

## Status
- ✅ Core dashboard cards: FIXED
- ✅ Chart empty states: FIXED  
- ✅ Dashboard page: FIXED
- ✅ Layout components: ALREADY CORRECT
- ⚠️ Other pages: NEED FIXES
- ⚠️ Modal/Panel components: NEED FIXES
- ⚠️ Chart internals (legends, tooltips): NEED FIXES
