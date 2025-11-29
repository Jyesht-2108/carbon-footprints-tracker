#!/bin/bash
# Start all RAG chatbot services

echo "🚀 Starting RAG Chatbot Services..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start embedding server in background
echo "📊 Starting embedding server on port 8000..."
python3 embedding_server.py &
EMBED_PID=$!
echo "   PID: $EMBED_PID"

# Wait for embedding server to start
sleep 3

# Check if embedding server is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   ✅ Embedding server is running"
else
    echo "   ❌ Embedding server failed to start"
    kill $EMBED_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🤖 Starting RAG chatbot server on port 4000..."
npm run dev

# Cleanup on exit
trap "echo ''; echo '🛑 Stopping services...'; kill $EMBED_PID 2>/dev/null; exit" INT TERM
