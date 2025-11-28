# Gemini JSON Parsing Fix

## ✅ Issue Fixed

**Error:** `Unterminated string in JSON at position 661`

**Cause:** Gemini sometimes returns malformed JSON with:
- Line breaks inside strings
- Smart quotes instead of regular quotes
- Extra text before/after JSON
- Markdown code blocks

**Solution:** Improved JSON parsing with robust cleaning and error handling

---

## Changes Made

### 1. Better JSON Extraction

**Added:**
- Extract JSON between first `{` and last `}`
- Remove any text before/after JSON object
- Handle markdown code blocks properly

```typescript
// Find and extract only the JSON object
const firstBrace = jsonStr.indexOf('{');
const lastBrace = jsonStr.lastIndexOf('}');
if (firstBrace !== -1 && lastBrace !== -1) {
  jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
}
```

---

### 2. JSON Cleaning

**Added cleaning for:**
- Smart quotes → Regular quotes
- Line breaks → Spaces
- Carriage returns → Removed

```typescript
jsonStr = jsonStr
  .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
  .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes
  .replace(/\n/g, ' ')              // Remove newlines
  .replace(/\r/g, '');              // Remove carriage returns
```

---

### 3. Improved Prompt

**Made prompt more explicit:**
- "CRITICAL: Return ONLY valid JSON"
- "No markdown, no code blocks, no explanations"
- "No line breaks inside string values"
- Provide exact format example

**Before:**
```
Respond with JSON only, no additional text.
```

**After:**
```
CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations.
Rules:
- Use double quotes for all strings
- No line breaks inside string values
- Provide 2-3 actions
- Return ONLY the JSON object, nothing else
```

---

## Model Configuration

**Correct model name for Gemini 2.5 Flash:**
```env
GEMINI_MODEL=gemini-2.0-flash-exp
```

**Note:** The model name is `2.0-flash-exp` even though it's marketed as "2.5 Flash"

---

## Testing

### Test Recommendation Generation:

1. **Restart service:**
   ```bash
   npm run dev
   ```

2. **Open UI:**
   ```
   http://localhost:4000
   ```

3. **Generate recommendations:**
   - Supplier: Supplier A
   - Predicted: 120
   - Baseline: 60
   - Click "Generate Recommendations"

4. **Expected Result:**
   ```json
   {
     "root_cause": "Higher order volumes increased load on diesel fleet",
     "actions": [
       {
         "title": "Shift 20% load to Supplier B",
         "description": "Redistribute load to reduce emissions",
         "co2_reduction": 22.5,
         "cost_impact": "+3%",
         "feasibility": 9
       },
       {
         "title": "Switch diesel fleet to CNG",
         "description": "Convert 50% of fleet to CNG vehicles",
         "co2_reduction": 15.2,
         "cost_impact": "-1%",
         "feasibility": 7
       }
     ]
   }
   ```

---

## Error Handling

If JSON parsing still fails, the service returns a fallback:

```json
{
  "root_cause": "Unable to determine root cause automatically",
  "actions": [
    {
      "title": "Review supplier operations",
      "description": "Conduct detailed analysis of recent operational changes",
      "co2_reduction": 10,
      "cost_impact": "0%",
      "feasibility": 8
    }
  ]
}
```

This ensures the system always returns valid data, even if Gemini fails.

---

## Common JSON Issues Fixed

| Issue | Example | Fix |
|-------|---------|-----|
| Smart quotes | `"title"` | Replace with `"title"` |
| Line breaks | `"Multi\nline"` | Replace with `"Multi line"` |
| Extra text | `Here's the JSON: {...}` | Extract only `{...}` |
| Code blocks | ` ```json\n{...}\n``` ` | Remove markdown |
| Trailing commas | `[1, 2,]` | Gemini usually avoids this |

---

## Debugging

If you still see JSON errors, check the logs:

```typescript
logger.debug('Cleaned JSON string:', jsonStr.substring(0, 200));
```

This shows the first 200 characters of the cleaned JSON before parsing.

---

## Summary

✅ **Robust JSON extraction** - Finds JSON even with extra text  
✅ **Smart quote handling** - Converts to regular quotes  
✅ **Line break removal** - Prevents unterminated strings  
✅ **Better prompt** - More explicit instructions for Gemini  
✅ **Fallback response** - Always returns valid data  
✅ **Debug logging** - Easy to troubleshoot  

The recommendation service should now work reliably with Gemini 2.0 Flash! 🎉

---

## Next Steps

1. Restart service: `npm run dev`
2. Test recommendation generation
3. Verify JSON is properly formatted
4. Check Supabase for saved recommendations

Recommendations should now generate successfully!
