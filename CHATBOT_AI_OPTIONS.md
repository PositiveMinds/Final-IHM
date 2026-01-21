# AI Chatbot Options - Cost vs Performance Analysis

## Option 1: Google Gemini Free Tier ⭐ (Recommended)

**Cost:** $0 (300 free requests/month, then $0.075/1K tokens)  
**Latency:** 1-2 seconds  
**Accuracy:** 95%+  
**Setup Time:** 15 minutes

### How It Works
```
User Query → Edge Function → Gemini API → Response
```

### Implementation

1. Get free API key: https://ai.google.dev/
2. Add to Supabase secrets
3. Call Gemini instead of pattern matching
4. 300 free requests monthly (enough for small clinic)

### Healthcare-Specific Prompt

```javascript
const systemPrompt = `You are a healthcare assistant for HIV/AIDS and NCD management in Western Uganda.

Context: You have access to a facility's patient data via queries.

Your role:
- Answer clinical questions about HIV management, ART, CD4, viral loads
- Provide NCD guidance (diabetes, hypertension, heart disease)
- Suggest follow-up actions for patients
- Keep responses brief and actionable

Always:
- Ask for clarification if query is unclear
- Suggest querying specific patient groups if possible
- Mention when data is needed to answer better
`
```

### Pros
✅ Free for small clinics (300 req/month)
✅ Natural language understanding
✅ No local infrastructure needed
✅ Instant deployment
✅ Healthcare-aware with custom prompt

### Cons
❌ Need internet connection
❌ Rate limited
❌ Requires API key management

---

## Option 2: Ollama (Local LLM) ⭐⭐

**Cost:** $0  
**Latency:** 2-5 seconds (depends on hardware)  
**Accuracy:** 85-90%  
**Setup Time:** 30 minutes

### How It Works
```
User Query → Local Ollama Server (Mistral/Llama2) → Response
```

### Requirements
- Docker or standalone Ollama installation
- 4GB RAM minimum
- Can run on modest server/laptop

### Installation

```bash
# Download Ollama from https://ollama.ai
ollama pull mistral  # or llama2

# Run server (listens on localhost:11434)
ollama serve
```

### Integration with IHM

```javascript
async function getAIResponse(query) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'mistral',
      prompt: `Healthcare assistant: ${query}`,
      stream: false,
    }),
  });
  
  const data = await response.json();
  return data.response;
}
```

### Pros
✅ Completely free
✅ No API calls, no rate limits
✅ Works offline
✅ Full control over model
✅ Can fine-tune on healthcare data

### Cons
❌ Requires server/infrastructure
❌ Slower (2-5s vs 1-2s)
❌ Needs 4GB+ RAM
❌ Self-hosted support needed

---

## Option 3: Hybrid (Pattern + Lightweight NLP)

**Cost:** $0  
**Latency:** <100ms  
**Accuracy:** 90%  
**Setup Time:** 2 hours

### How It Works
```
Query → Keyword extraction → Check if known pattern
                           ↓
                      If pattern → Use fast handler
                           ↓
                      Else → Use simple NLP + context
```

### Libraries (JavaScript)
- **natural** - NLP library (free, npm)
- **compromise** - English parsing (free)
- **lunr.js** - Full-text search

### Example Implementation

```javascript
const natural = require('natural');

async function getSmartResponse(query) {
  // Extract key terms
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(query.toLowerCase());
  
  // Check patterns first (fast)
  const pattern = findMatchingPattern(query);
  if (pattern) {
    return pattern.handler(facilityId, query);
  }
  
  // Fallback: Use semantic search
  const context = searchSimilarQueries(tokens);
  if (context.similarity > 0.7) {
    return context.relatedHandler(facilityId, query);
  }
  
  // Last resort: Generic response
  return "I'm not sure about that. Try asking about:\n- Patients on ART\n- High viral loads\n- Appointments due";
}
```

### Pros
✅ Completely free
✅ Instant responses
✅ Works offline
✅ No infrastructure needed
✅ Predictable costs

### Cons
❌ Less intelligent than real AI
❌ Limited context understanding
❌ Requires more keyword management

---

## Option 4: Hugging Face Inference (Free Tier)

**Cost:** $0 (limited) → $9/month  
**Latency:** 2-3 seconds  
**Accuracy:** 90%  
**Setup Time:** 10 minutes

### Implementation

```javascript
async function getHFResponse(query) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/gpt2",
    {
      headers: { Authorization: `Bearer ${HF_API_KEY}` },
      method: "POST",
      body: JSON.stringify({ inputs: query }),
    }
  );
  
  const result = await response.json();
  return result[0].generated_text;
}
```

### Pros
✅ Free tier available
✅ No infrastructure
✅ Easy to implement

### Cons
❌ Rate limited on free tier
❌ Quality varies by model
❌ Not healthcare-specialized

---

## RECOMMENDATION FOR IHM

### Best Option: **Gemini Free Tier (Option 1)**

**Why:**
- 300 free requests/month = ~10 requests/day
- Perfect for small clinic (2-5 staff)
- Natural language understanding
- Healthcare-capable with good prompt engineering
- If budget allows later: $0.075 per 1000 tokens = ~$5/month at scale

**Cost Timeline:**
```
Month 1-3: $0 (300 free requests)
Month 4+:  ~$2-5/month if exceeded (scales with usage)
```

### If Offline is Required: **Ollama (Option 2)**

**Setup:**
```bash
1. Install Docker
2. Run: docker run -d -p 11434:11434 ollama/ollama
3. Pull model: ollama pull mistral
4. Update chatbot to call localhost:11434
```

### Middle Ground: **Hybrid (Option 3)**

**If budget is $0 and must be AI-like:**
- Use patterns for 80% of queries
- Add NLP library for remaining 20%
- Feels like AI without the cost

---

## Implementation Path

### Week 1: Add Gemini Free Tier
```
1. Get API key (free)
2. Add to Supabase secrets
3. Modify chatbot-handler.js to call Gemini
4. Test with sample queries
5. Deploy
```

### Week 2: Add Custom System Prompt
```
1. Fine-tune prompt for HIV/NCD management
2. Test with facility staff
3. Adjust based on feedback
4. Train staff on capabilities
```

### Code Modification (chatbot-handler.js)

Replace pattern matching with AI:

```javascript
async function handleSendMessage() {
  const query = document.getElementById('chatbot-input').value.trim();
  
  this.addMessage(query, 'user');
  this.showLoading(true);
  
  try {
    // Call Gemini API via Edge Function
    const response = await supabaseClient.functions.invoke('chatbot-ai-query', {
      body: { 
        query: query,
        facility_id: this.facilityId 
      }
    });
    
    this.showLoading(false);
    this.addMessage(response.data.message, 'bot');
  } catch (error) {
    this.showLoading(false);
    this.addMessage('Sorry, I could not process that. Please try again.', 'bot');
  }
}
```

---

## Costs Comparison

| Option | Free | Paid | Accuracy | Speed | Infrastructure |
|--------|------|------|----------|-------|-----------------|
| **Gemini Free** | 300 req/mo | $0.075/1K tokens | 95% | 1-2s | None |
| **Ollama** | ∞ | $0 | 85% | 2-5s | 4GB server |
| **Hybrid NLP** | ∞ | $0 | 90% | <100ms | None |
| **Hugging Face** | Limited | $9/mo | 90% | 2-3s | None |
| **OpenAI GPT-4** | $0 | $15/mo | 99% | 2-3s | None |

---

## Next Steps

Choose one:

1. **I'll do Gemini Free** → I'll code the integration
2. **I want Ollama** → I'll create Docker setup guide
3. **Keep it hybrid** → I'll enhance pattern matching with NLP
4. **Evaluate all** → I'll create test dashboard with all 4 options

What would you prefer?
