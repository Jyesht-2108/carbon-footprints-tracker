# How to Get a New Gemini API Key

## Quick Steps

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/apikey

2. **Sign in with your Google account**

3. **Create a new API key**
   - Click "Create API Key"
   - Choose "Create API key in new project" or select an existing project
   - Copy the generated key immediately

4. **Update your .env file**
   ```bash
   cd carbon-footprint/rag_chatbot_plugin
   nano .env  # or use your preferred editor
   ```
   
   Replace this line:
   ```
   GEMINI_API_KEY=AIzaSyBOOoZsL2sPGASeAO83OoFsZykMw6clnmc
   ```
   
   With:
   ```
   GEMINI_API_KEY=YOUR_NEW_KEY_HERE
   ```

5. **Save and the server will auto-reload**
   - The RAG chatbot uses `ts-node-dev` which auto-reloads on file changes
   - You should see it restart in your terminal

6. **Test it**
   ```bash
   curl -X POST http://localhost:4000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"Why are my emissions high today?"}'
   ```

## Alternative: Use Gemini API Free Tier

If you don't have access to Google AI Studio, you can also:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Enable the "Generative Language API"
3. Create credentials → API Key
4. Use that key in your .env file

## Important Security Notes

⚠️ **Never commit API keys to git!**

To prevent future leaks:

1. **Check your .gitignore**
   ```bash
   cd carbon-footprint/rag_chatbot_plugin
   cat .gitignore | grep .env
   ```
   
   Should show: `.env`

2. **If .env is already in git, remove it:**
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from git"
   ```

3. **Use .env.example for documentation:**
   ```bash
   cp .env .env.example
   # Edit .env.example and replace real values with placeholders
   git add .env.example
   ```

## Rate Limits

Gemini API Free Tier limits:
- 60 requests per minute
- 1,500 requests per day
- 1 million tokens per day

If you need more, consider upgrading to a paid plan.

## Testing After Update

Run these test queries:
```bash
# Test 1: Simple query
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Test 2: Emissions query
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Which supplier has the highest CO₂?"}'

# Test 3: Reduction query
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How can I reduce emissions by 20%?"}'
```

All three should return JSON responses with helpful answers.
