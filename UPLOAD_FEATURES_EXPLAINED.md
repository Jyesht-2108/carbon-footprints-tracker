# Upload Features Explained 📁

## Two Different Upload Features

Carbon Nexus has **TWO separate upload features** for different purposes:

---

## 1️⃣ **Data Upload Page** (Emissions Data)

### **Location**: 
- Sidebar: "Data Upload" 
- Route: `/ingest`

### **Purpose**:
Upload **CSV/XLSX files** containing **emissions data** from your logistics operations.

### **What to Upload**:
```csv
supplier_id,timestamp,distance_km,load_kg,vehicle_type,fuel_type
Supplier_A,2025-11-28 10:00:00,150,5000,truck,diesel
Supplier_B,2025-11-28 11:00:00,200,3000,van,electric
```

### **Required Columns**:
- `supplier_id` - Supplier identifier
- `timestamp` - When the event occurred
- `distance_km` - Distance traveled
- `load_kg` - Weight of cargo
- `vehicle_type` - Type of vehicle

### **Optional Columns**:
- `fuel_type` - diesel, electric, hybrid, etc.
- `speed` - Average speed
- `route_id` - Route identifier

### **What Happens**:
1. File is uploaded to **Data Core** service (port 8002)
2. Data is validated and cleaned
3. CO₂ emissions are calculated
4. Data is stored in database
5. Dashboard updates with new data
6. ML models generate predictions
7. Hotspots are detected
8. Recommendations are generated

### **Backend Service**: Data Core (port 8002)

### **Use Case**:
"I have a CSV file with 1,000 delivery records from last month. I want to analyze the emissions."

---

## 2️⃣ **AI Assistant File Upload** (Knowledge Base Documents)

### **Location**:
- Sidebar: "AI Assistant"
- Route: `/chat`
- Click the 📎 paperclip icon

### **Purpose**:
Upload **documents** (PDF, TXT, MD, DOC) to add to the **RAG chatbot's knowledge base**.

### **What to Upload**:
- 📄 **PDF reports** - Sustainability reports, emission studies
- 📝 **Text files** - Best practices, guidelines
- 📋 **Markdown docs** - Technical documentation
- 📄 **Word docs** - Policies, procedures

### **Examples**:
- "Carbon Reduction Best Practices.pdf"
- "Company Sustainability Policy.docx"
- "Industry Emission Standards.txt"
- "Supplier Guidelines.md"

### **What Happens**:
1. File is uploaded to **RAG service** (port 4000)
2. Document is processed and indexed
3. Content is added to AI's knowledge base
4. You can now ask questions about the document
5. AI uses document content in responses

### **Backend Service**: RAG Chatbot (port 4000)

### **Use Case**:
"I have a PDF with carbon reduction strategies. I want the AI to reference it when giving recommendations."

---

## 🔄 **Key Differences**

| Feature | Data Upload | AI Assistant Upload |
|---------|-------------|---------------------|
| **Location** | `/ingest` page | `/chat` page |
| **File Types** | CSV, XLSX | PDF, TXT, MD, DOC |
| **Purpose** | Emissions data | Knowledge documents |
| **Backend** | Data Core (8002) | RAG Service (4000) |
| **Result** | Dashboard updates | AI learns from docs |
| **Use For** | Logistics data | Reference materials |

---

## 📊 **Data Upload (CSV/XLSX)**

### **When to Use**:
- ✅ You have logistics/delivery data
- ✅ You want to track emissions
- ✅ You need dashboard analytics
- ✅ You want ML predictions
- ✅ You need hotspot detection

### **Example Workflow**:
```
1. Export data from your logistics system
2. Go to "Data Upload" page
3. Drag & drop CSV file
4. Wait for processing
5. View results on Dashboard
6. Get AI recommendations
```

---

## 📚 **AI Assistant Upload (Documents)**

### **When to Use**:
- ✅ You have reference documents
- ✅ You want AI to learn from them
- ✅ You need context-aware answers
- ✅ You have company policies
- ✅ You have industry standards

### **Example Workflow**:
```
1. Have a PDF with carbon strategies
2. Go to "AI Assistant" page
3. Click 📎 paperclip icon
4. Select PDF file
5. AI confirms upload
6. Ask questions about the document
7. AI references it in answers
```

---

## 💡 **Real-World Examples**

### **Scenario 1: Analyzing Logistics Data**
```
Goal: Analyze last month's deliveries
Action: Use Data Upload
File: november_deliveries.csv
Result: Dashboard shows emissions, hotspots, trends
```

### **Scenario 2: Learning Company Policy**
```
Goal: AI should know company carbon policy
Action: Use AI Assistant Upload
File: carbon_reduction_policy.pdf
Result: AI references policy in recommendations
```

### **Scenario 3: Both Together**
```
Step 1: Upload logistics data (Data Upload)
Step 2: Upload best practices PDF (AI Assistant)
Step 3: Ask AI: "Based on our policy, how can we reduce emissions?"
Result: AI gives recommendations using both data and policy
```

---

## 🎯 **Quick Decision Guide**

### **Upload to Data Upload if**:
- File is CSV or XLSX
- Contains: supplier, distance, load, vehicle data
- Want to see: charts, graphs, predictions
- Need: emissions calculations

### **Upload to AI Assistant if**:
- File is PDF, TXT, MD, DOC
- Contains: text, policies, guidelines, reports
- Want to: ask questions about content
- Need: AI to reference in answers

---

## 🔧 **Technical Details**

### **Data Upload (CSV/XLSX)**:
```
Frontend: IngestPage.tsx
API Endpoint: POST http://localhost:8002/api/v1/ingest/csv
Backend: Data Core service
Database: Supabase (events_normalized table)
Processing: Validation → Cleaning → CO₂ Calculation → Storage
```

### **AI Assistant Upload (Documents)**:
```
Frontend: ChatbotPage.tsx
API Endpoint: POST http://localhost:4000/api/upload
Backend: RAG service
Database: Vector database (embeddings)
Processing: Text Extraction → Chunking → Embedding → Indexing
```

---

## ✅ **What's New**

I just added **file upload to the AI Assistant**! Now you can:

1. Click the 📎 **paperclip icon** in the chat
2. Select a document (PDF, TXT, MD, DOC)
3. See a preview of the attached file
4. Click Send to upload
5. AI confirms successful upload
6. Ask questions about the document

---

## 🎉 **Summary**

**Two Upload Features, Two Purposes**:

1. **Data Upload** = Emissions data (CSV) → Dashboard analytics
2. **AI Assistant** = Knowledge docs (PDF) → Smarter AI responses

Both work together to give you a complete Carbon Intelligence platform! 🚀
