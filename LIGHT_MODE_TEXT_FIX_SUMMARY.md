# Light Mode Text Color Fix Summary

## Problem
Text colors were hardcoded to `text-white` throughout the application, causing white text to appear in light mode (making it invisible or hard to read against light backgrounds).

## Solution Applied
Replaced hardcoded `text-white` classes with theme-aware classes that adapt to both light and dark modes:

### Text Color Patterns Fixed

1. **Primary Text (Headings, Titles)**
   - Before: `text-white`
   - After: `text-gray-900 dark:text-white`

2. **Secondary Text (Descriptions, Labels)**
   - Before: `text-white/60` or `text-white/70`
   - After: `text-gray-600 dark:text-white/60` or `text-gray-700 dark:text-white/70`

3. **Tertiary Text (Hints, Placeholders)**
   - Before: `text-white/40` or `text-white/50`
   - After: `text-gray-500 dark:text-white/40` or `text-gray-600 dark:text-white/50`

4. **Empty State Text**
   - Before: `text-white/20`
   - After: `text-gray-300 dark:text-white/20`

## Files Fixed

### Cards
- ✅ `EmissionsCard.tsx` - Card titles and labels
- ✅ `HotspotsCard.tsx` - Hotspot titles, descriptions, empty states
- ✅ `AlertsCard.tsx` - Alert card title
- ✅ `DataQualityCard.tsx` - Quality metrics text
- ✅ `RecommendationsCard.tsx` - Recommendation titles and empty states

### Charts
- ✅ `ForecastChart.tsx` - Empty state messages
- ✅ `EmissionsPieChart.tsx` - Empty state messages
- ✅ `EmissionsBarChart.tsx` - Empty state messages
- ✅ `EmissionsHeatmap.tsx` - Empty state messages and legends

### Pages
- ✅ `DashboardPage.tsx` - Page title, descriptions, timestamps

### Additional Files Needing Fixes
The following files still contain hardcoded `text-white` and should be updated:
- `SimulatorPage.tsx` - Scenario labels, input labels, result displays
- `IngestPage.tsx` - Upload instructions, file requirements
- `ChatbotPage.tsx` - Chat messages, input placeholders
- `AlertsPage.tsx` - Alert details
- `Sidebar.tsx` - Navigation labels
- `Topbar.tsx` - User info, notifications
- `UploadHistory.tsx` - File names, status text
- `HotspotDetailPanel.tsx` - Detail labels and values
- `RecommendationDetailModal.tsx` - Modal content

## CSS Classes Reference

Use these utility classes from `index.css`:

```css
/* Theme-aware text colors */
.text-theme-primary {
  @apply text-gray-900 dark:text-white;
}

.text-theme-secondary {
  @apply text-gray-600 dark:text-white/70;
}

.text-theme-tertiary {
  @apply text-gray-500 dark:text-white/50;
}
```

## Testing
After applying fixes:
1. Toggle between light and dark modes using the theme toggle
2. Verify all text is readable in both modes
3. Check that contrast ratios meet accessibility standards
4. Test on all pages: Dashboard, Simulator, Ingest, Chatbot, Alerts

## Next Steps
Continue fixing remaining components systematically, prioritizing:
1. High-traffic pages (Simulator, Ingest)
2. Navigation components (Sidebar, Topbar)
3. Modal and panel components
4. Form inputs and labels
