# RAG Chatbot Capabilities Explained 🤖

## Your Questions Answered

### **Q1: How does the AI answer questions about the database?**
### **Q2: Does the RAG chatbot accept Excel, CSV, MD, and TXT files?**

---

## 🧠 **How the AI Knows Your Data**

The RAG (Retrieval-Augmented Generation) chatbot has **TWO sources of knowledge**:

### **1. Database Access** ✅

**YES, the AI can access your database!**

The RAG service connects to **Supabase** (your database) and can query:
- ✅ Emissions data (`events_normalized` table)
- ✅ Hotspots (`hotspots` table)
- ✅ Recommendations (`recommendations` table)
- ✅ Alerts (`alerts` table)
- ✅ Predictions (`predictions` table)
- ✅ Data quality metrics (`data_quality` table)

**How it works**:
```typescript
// RAG service has database client
import { createClient } from '@supabase/supabase-js'

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// When you ask: "Which supplier has highest CO₂?"
// AI queries database:
const { data } = await db
  .from('events_normalized')
  .select('supplier_id, co2_kg')
  .order('co2_kg', { ascending: false })
  .limit(1)

// AI responds: "Supplier X has 138.8 kg CO₂"
```

### **2. Uploaded Documents** ✅

The AI also learns from documents you upload:
- PDF reports
- Text files
- Markdown docs
- (Currently being expanded to support more formats)

---

## 📁 **What File Types Does RAG Accept?**

### **Current Status** (As of now):

| File Type | Supported? | Status |
|-----------|------------|--------|
| **PDF** | ✅ YES | Fully working |
| **TXT** | ⚠️ PARTIAL | Backend ready, needs frontend update |
| **MD** | ⚠️ PARTIAL | Backend ready, needs frontend update |
| **CSV** | ❌ NO | Not for RAG (use Data Upload instead) |
| **XLSX** | ❌ NO | Not for RAG (use Data Upload instead) |
| **DOC/DOCX** | ⚠️ PARTIAL | Backend ready, needs frontend update |

### **Why CSV/XLSX are NOT for RAG**:

CSV and Excel files contain **structured data** (rows and columns), not text documents. They should go to the **Data Upload page** for processing, not the RAG chatbot.

**Correct usage**:
- ✅ CSV/XLSX → Data Upload page → Database → Dashboard
- ✅ PDF/TXT/MD → AI Assistant → RAG knowledge base → Chat answers

---

## 🔄 **How the AI Answers Your Questions**

### **Example 1: "Why are my emissions high today?"**

**Step 1**: AI receives your question

**Step 2**: AI queries database:
```sql
SELECT supplier_id, co2_kg, timestamp
FROM events_normalized
WHERE DATE(timestamp) = CURRENT_DATE
ORDER BY co2_kg DESC
```

**Step 3**: AI analyzes results:
- Finds: Supplier X has 138.8 kg CO₂ (45% above baseline)
- Finds: Heavy_Load_Supplier has 120.2 kg CO₂

**Step 4**: AI searches uploaded documents:
- Checks if you uploaded any carbon policies
- Checks for best practices documents

**Step 5**: AI generates response:
```
"Your emissions are high today primarily due to:

1. Supplier X (138.8 kg CO₂) - 45% above baseline
   - Likely due to increased load factor
   - Suboptimal routing detected

2. Heavy_Load_Supplier (120.2 kg CO₂) - 13% above baseline
   - Heavy loads with diesel fleet
   - No route optimization

Recommendations:
- Implement route optimization for Supplier X
- Consider load consolidation
- Evaluate electric vehicle options

[Based on your database data from today]"
```

---

### **Example 2: "Which supplier has the highest CO₂?"**

**AI Process**:
```typescript
// 1. Query database
const result = await db
  .from('events_normalized')
  .select('supplier_id, SUM(co2_kg) as total')
  .group('supplier_id')
  .order('total', { ascending: false })
  .limit(1)

// 2. Get additional context
const hotspots = await db
  .from('hotspots')
  .select('*')
  .eq('entity', result.supplier_id)

// 3. Generate response
return `Hotspot_CRITICAL has the highest CO₂ emissions at 138.8 kg, 
which is 45.1% above their baseline. This is flagged as a critical 
hotspot requiring immediate attention.`
```

---

### **Example 3: "How can I reduce emissions by 20%?"**

**AI Process**:
```typescript
// 1. Calculate current total
const current = await db
  .from('events_normalized')
  .select('SUM(co2_kg)')

// 2. Search uploaded documents for strategies
const strategies = await vectorSearch("carbon reduction strategies")

// 3. Get AI recommendations from database
const recommendations = await db
  .from('recommendations')
  .select('*')
  .eq('status', 'pending')

// 4. Generate personalized response
return `To reduce emissions by 20% (91 kg CO₂):

Based on your data and uploaded policies:

1. Electric Vehicles (60% reduction potential)
   - Convert 33% of fleet to EVs
   - Estimated savings: 91 kg CO₂
   - Cost: $15,000 | ROI: 8 months

2. Route Optimization (15% reduction potential)
   - Implement AI routing software
   - Estimated savings: 68 kg CO₂
   - Cost: $5,000 | ROI: 4 months

3. Load Consolidation (20% reduction potential)
   - Combine shipments
   - Estimated savings: 91 kg CO₂
   - Cost: $2,000 | ROI: 2 months

[Based on your current emissions of 455.5 kg CO₂]`
```

---

## 🎯 **What the AI Can Do**

### **Database Queries** ✅:
- "What's my total CO₂ today?"
- "Which supplier is worst?"
- "Show me all critical hotspots"
- "What are my pending recommendations?"
- "How many alerts do I have?"
- "What's my data quality score?"

### **Trend Analysis** ✅:
- "Are emissions increasing or decreasing?"
- "Compare this week to last week"
- "What's the forecast for next week?"
- "Which day had highest emissions?"

### **Recommendations** ✅:
- "How can I reduce emissions?"
- "What should I do about Supplier X?"
- "Give me cost-effective solutions"
- "What's the ROI on electric vehicles?"

### **Document-Based** ✅:
- "What does our carbon policy say?"
- "Summarize the uploaded report"
- "What are industry best practices?"
- "Explain the guidelines in the PDF"

---

## 🔧 **Technical Architecture**

### **RAG Service Components**:

```
┌─────────────────────────────────────────┐
│         RAG Chatbot Service             │
│         (Port 4000)                     │
├─────────────────────────────────────────┤
│                                         │
│  1. Database Client (Supabase)          │
│     - Query emissions data              │
│     - Get hotspots, recommendations     │
│     - Access all tables                 │
│                                         │
│  2. Vector Database (Qdrant)            │
│     - Store document embeddings         │
│     - Semantic search                   │
│     - Find relevant context             │
│                                         │
│  3. LLM (OpenAI/Ollama)                 │
│     - Generate responses                │
│     - Combine database + documents      │
│     - Natural language understanding    │
│                                         │
│  4. Document Processing                 │
│     - PDF extraction ✅                 │
│     - Text chunking                     │
│     - Embedding generation              │
│                                         │
└─────────────────────────────────────────┘
```

### **When You Ask a Question**:

```
User Question
     ↓
1. Parse intent
     ↓
2. Query database (if needed)
     ↓
3. Search uploaded docs (if relevant)
     ↓
4. Combine context
     ↓
5. Generate response with LLM
     ↓
6. Return answer
```

---

## 📝 **File Type Support Details**

### **Currently Supported** ✅:

**PDF Files**:
```typescript
// Full pipeline working:
1. Upload PDF
2. Extract text from all pages
3. Chunk into smaller pieces
4. Generate embeddings
5. Store in vector database
6. Search when answering questions
```

### **Needs Implementation** ⚠️:

**TXT, MD, DOC Files**:
```typescript
// Backend is ready, just needs:
1. Text extraction (simpler than PDF)
2. Same chunking/embedding pipeline
3. Frontend already allows these formats!
```

**CSV/XLSX Files**:
```typescript
// Should NOT go to RAG because:
- They're structured data, not documents
- Should go to Data Upload page instead
- Get processed into database
- Then AI can query the database
```

---

## 🎯 **Best Practices**

### **For Questions**:
✅ **DO**: "Which supplier has highest CO₂?"
✅ **DO**: "How can I reduce emissions by 20%?"
✅ **DO**: "Explain the forecast for next week"
✅ **DO**: "What does our policy say about EVs?"

❌ **DON'T**: Upload CSV to chat (use Data Upload page)
❌ **DON'T**: Ask about data that hasn't been uploaded
❌ **DON'T**: Expect real-time data (database updates every 30 min)

### **For Documents**:
✅ **DO**: Upload PDF reports, policies, guidelines
✅ **DO**: Upload text files with best practices
✅ **DO**: Upload markdown documentation
✅ **DO**: Ask questions about uploaded content

❌ **DON'T**: Upload CSV/XLSX (wrong place)
❌ **DON'T**: Upload images (not supported yet)
❌ **DON'T**: Upload very large files (>10MB)

---

## 🚀 **Summary**

### **Q1: Does AI know the database?**
**YES!** ✅ The AI has full access to your Supabase database and can query all emissions data, hotspots, recommendations, and more.

### **Q2: What files does RAG accept?**
**Currently**: PDF ✅  
**Soon**: TXT, MD, DOC ⚠️  
**Never**: CSV, XLSX ❌ (use Data Upload page instead)

### **How AI Answers**:
1. Queries database for real data
2. Searches uploaded documents
3. Combines both sources
4. Generates intelligent response
5. Provides actionable insights

**The AI is smart because it has BOTH your data AND your documents!** 🧠✨
