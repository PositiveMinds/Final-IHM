// Smart Pattern Matching Engine
// Feels like AI without AI - uses semantic matching, context, and learning

class SmartChatbotEngine {
  constructor() {
    this.initKnowledgeBase();
    this.initSemanticGraph();
  }

  // ============================================================
  // KNOWLEDGE BASE - Healthcare concepts & synonyms
  // ============================================================
  initKnowledgeBase() {
    this.knowledgeBase = {
      // HIV Management
      'hiv': {
        synonyms: ['hiv', 'hiv/aids', 'aids', 'hiv positive', 'positive status'],
        relatedTopics: ['art', 'antiretroviral', 'cd4', 'viral load', 'treatment']
      },
      'art': {
        synonyms: ['art', 'antiretroviral', 'arv', 'medication', 'treatment', 'therapy'],
        relatedTopics: ['hiv', 'regimen', 'adherence', 'viral load', 'suppression']
      },
      'viral_load': {
        synonyms: ['viral load', 'vl', 'viral', 'rna', 'copies', 'viremia'],
        relatedTopics: ['suppression', 'undetectable', 'treatment failure', 'adherence']
      },
      'cd4': {
        synonyms: ['cd4', 'cd4 count', 'immune', 'cells', 't-cells'],
        relatedTopics: ['recovery', 'immune reconstitution', 'treatment']
      },
      
      // NCDs
      'diabetes': {
        synonyms: ['diabetes', 'dm', 'glucose', 'blood sugar', 'hyperglycemia'],
        relatedTopics: ['insulin', 'hba1c', 'glucose monitoring', 'complications']
      },
      'hypertension': {
        synonyms: ['hypertension', 'htn', 'high bp', 'blood pressure', 'elevated bp'],
        relatedTopics: ['cardiovascular', 'stroke', 'medication']
      },
      
      // Appointments
      'appointment': {
        synonyms: ['appointment', 'clinic', 'visit', 'follow-up', 'schedule', 'meeting'],
        relatedTopics: ['defaulter', 'adherence', 'attendance']
      },
      
      // Testing
      'test': {
        synonyms: ['test', 'lab', 'examination', 'screening', 'check', 'investigation'],
        relatedTopics: ['results', 'monitoring', 'baseline']
      }
    };
  }

  // ============================================================
  // SEMANTIC GRAPH - Relationships between concepts
  // ============================================================
  initSemanticGraph() {
    this.semanticGraph = {
      'high viral load': {
        implications: ['treatment failure', 'adherence issue', 'drug resistance possible'],
        suggestedActions: ['check adherence', 'assess barriers', 'consider switch'],
        relatedQueries: ['patients with poor adherence', 'virological failure']
      },
      'low cd4': {
        implications: ['immunosuppressed', 'oi risk', 'need prophylaxis'],
        suggestedActions: ['start prophylaxis', 'monitor closely', 'assess oi signs'],
        relatedQueries: ['patients on prophylaxis', 'oi patients']
      },
      'missed appointment': {
        implications: ['adherence issue', 'ltfu risk', 'treatment interruption'],
        suggestedActions: ['followup call', 'assess barriers', 'counseling'],
        relatedQueries: ['poor adherence patients', 'defaulter tracking']
      },
      'uncontrolled diabetes': {
        implications: ['complications risk', 'hba1c elevated', 'needs intensification'],
        suggestedActions: ['medication review', 'lifestyle counseling', 'hba1c testing'],
        relatedQueries: ['patients on insulin', 'diabetes monitoring']
      }
    };
  }

  // ============================================================
  // CORE ALGORITHM: Semantic Similarity Matching
  // ============================================================

  findBestMatch(userQuery) {
    const cleanQuery = userQuery.toLowerCase().trim();
    
    // Step 1: Exact pattern match (fastest)
    const exactMatch = this.findExactPattern(cleanQuery);
    if (exactMatch) {
      return {
        type: 'exact',
        pattern: exactMatch,
        confidence: 1.0
      };
    }
    
    // Step 2: Semantic similarity matching
    const semanticMatch = this.findSemanticMatch(cleanQuery);
    if (semanticMatch.confidence > 0.7) {
      return {
        type: 'semantic',
        pattern: semanticMatch.pattern,
        confidence: semanticMatch.confidence,
        suggestion: semanticMatch.suggestion
      };
    }
    
    // Step 3: Concept-based matching (understand relationships)
    const conceptMatch = this.findConceptualMatch(cleanQuery);
    if (conceptMatch) {
      return {
        type: 'conceptual',
        pattern: conceptMatch.pattern,
        confidence: conceptMatch.confidence,
        context: conceptMatch.context
      };
    }
    
    // Step 4: Learning from similar past queries
    const learnedMatch = this.findLearnedMatch(cleanQuery);
    if (learnedMatch) {
      return {
        type: 'learned',
        pattern: learnedMatch.pattern,
        confidence: learnedMatch.confidence
      };
    }
    
    // No match found
    return {
      type: 'unmatched',
      confidence: 0,
      suggestion: this.generateSmartSuggestion(cleanQuery)
    };
  }

  // ============================================================
  // MATCHING STRATEGIES
  // ============================================================

  findExactPattern(query) {
    // Check all known patterns (from supabase-edge-function.js)
    const patterns = this.getAllPatterns();
    
    for (const [key, pattern] of Object.entries(patterns)) {
      for (const keyword of pattern.keywords) {
        const regex = new RegExp(keyword, 'i');
        if (regex.test(query)) {
          return pattern;
        }
      }
    }
    return null;
  }

  findSemanticMatch(query) {
    const queryTokens = query.split(/\s+/);
    const allPatterns = this.getAllPatterns();
    let bestMatch = null;
    let bestScore = 0;
    let bestSuggestion = null;
    
    for (const [key, pattern] of Object.entries(allPatterns)) {
      for (const keyword of pattern.keywords) {
        const score = this.calculateSimilarity(query, keyword);
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = pattern;
          
          // If close but not exact, generate suggestion
          if (score > 0.6 && score < 1.0) {
            bestSuggestion = `Did you mean: "${keyword}"?`;
          }
        }
      }
    }
    
    return {
      pattern: bestMatch,
      confidence: bestScore,
      suggestion: bestSuggestion
    };
  }

  findConceptualMatch(query) {
    // Understand relationships in semantic graph
    for (const [concept, data] of Object.entries(this.semanticGraph)) {
      const conceptScore = this.calculateSimilarity(query, concept);
      
      if (conceptScore > 0.6) {
        // User is asking about something related to this concept
        const relatedPattern = this.findMatchByKeywords(data.relatedQueries);
        
        if (relatedPattern) {
          return {
            pattern: relatedPattern,
            confidence: conceptScore * 0.9, // Slightly lower confidence
            context: {
              concept: concept,
              implications: data.implications,
              suggestedActions: data.suggestedActions
            }
          };
        }
      }
    }
    
    return null;
  }

  findLearnedMatch(query) {
    // Learn from patterns in facility data
    // In production, this would analyze query logs
    const commonMistakes = {
      'viral load test': 'due viral load',
      'cd4 test': 'due cd4',
      'meds refill': 'overdue refill',
      'hiv check': 'hiv status',
      'art med': 'art patients'
    };
    
    for (const [wrong, correct] of Object.entries(commonMistakes)) {
      if (this.calculateSimilarity(query, wrong) > 0.7) {
        const pattern = this.findExactPattern(correct);
        if (pattern) {
          return {
            pattern: pattern,
            confidence: 0.75
          };
        }
      }
    }
    
    return null;
  }

  // ============================================================
  // SIMILARITY SCORING (0-1)
  // ============================================================

  calculateSimilarity(str1, str2) {
    // Levenshtein distance for fuzzy matching
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(s1, s2) {
    const costs = [];
    
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    
    return costs[s2.length];
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  findMatchByKeywords(searchTerms) {
    for (const term of searchTerms) {
      const match = this.findExactPattern(term);
      if (match) return match;
    }
    return null;
  }

  generateSmartSuggestion(query) {
    // Analyze what user was trying to ask
    const tokens = query.split(/\s+/);
    const suggestions = [];
    
    // Look for healthcare-related keywords
    const healthKeywords = ['patient', 'viral', 'cd4', 'appointment', 'test', 'medication', 'blood', 'pressure', 'diabetes'];
    
    for (const token of tokens) {
      for (const keyword of healthKeywords) {
        if (this.calculateSimilarity(token, keyword) > 0.7) {
          // User mentioned a health topic, suggest related queries
          if (keyword === 'viral') {
            suggestions.push('"viral load"', '"high viral load"');
          } else if (keyword === 'cd4') {
            suggestions.push('"cd4 count"', '"low cd4"');
          } else if (keyword === 'appointment') {
            suggestions.push('"appointments today"', '"overdue appointments"');
          }
        }
      }
    }
    
    if (suggestions.length > 0) {
      return `I'm not sure about that. Try: ${suggestions.slice(0, 2).join(' or ')}`;
    }
    
    return 'I didn\'t understand that. Try asking about:\n- Patients on ART\n- High viral loads\n- Appointments\n- Medications due';
  }

  // ============================================================
  // GET ALL PATTERNS (from main chatbot)
  // ============================================================

  getAllPatterns() {
    // This returns the QUERY_PATTERNS from supabase-edge-function.js
    // In actual implementation, sync from Edge Function
    return {
      'appointments': { keywords: ['appointment', 'appointments', 'scheduled'], handler: 'getAppointments' },
      'appointments_next_week': { keywords: ['appointment.*next week', 'upcoming'], handler: 'getAppointmentsNextWeek' },
      'art_patients': { keywords: ['on art', 'art.*patient'], handler: 'getARTPatients' },
      'high_viral_load': { keywords: ['high.*viral', 'elevated viral'], handler: 'getHighViralLoadPatients' },
      'undetectable_viral': { keywords: ['undetectable', 'u=u'], handler: 'getUndetectablePatients' },
      'new_patients': { keywords: ['new.*patient', 'registered'], handler: 'getNewPatients' },
      'low_cd4': { keywords: ['low cd4', 'cd4.*low'], handler: 'getLowCD4Patients' },
      'diabetes': { keywords: ['diabetes', 'glucose'], handler: 'getDiabetesPatients' },
      'hypertension': { keywords: ['hypertension', 'high.*blood.*pressure'], handler: 'getHypertensionPatients' },
      'missed_appointments': { keywords: ['missed.*appointment', 'defaulter'], handler: 'getMissedAppointments' },
      'total_patients': { keywords: ['total.*patient', 'how many'], handler: 'getTotalPatients' },
      'female_patients': { keywords: ['female', 'women'], handler: 'getFemalePatients' },
      'male_patients': { keywords: ['male', 'men'], handler: 'getMalePatients' }
    };
  }

  // ============================================================
  // CONFIDENCE-BASED RESPONSES
  // ============================================================

  buildResponse(match) {
    if (match.type === 'exact') {
      // High confidence - execute immediately
      return {
        confidence: 'high',
        execute: true,
        handler: match.pattern.handler
      };
    }
    
    if (match.type === 'semantic') {
      // Ask for confirmation
      return {
        confidence: match.confidence.toFixed(2),
        execute: false,
        message: match.suggestion || `Did you mean "${match.pattern.handler}"?`,
        handler: match.pattern.handler
      };
    }
    
    if (match.type === 'conceptual') {
      // Provide context about what we understand
      return {
        confidence: 'medium',
        execute: true,
        handler: match.pattern.handler,
        context: match.context.implications ? 
          `We know: ${match.context.implications[0]}. Suggesting: ${match.pattern.handler}` : 
          null
      };
    }
    
    // No match
    return {
      confidence: 'low',
      execute: false,
      message: match.suggestion
    };
  }
}

// ============================================================
// INTEGRATION WITH CHATBOT
// ============================================================

// Initialize the smart engine
const smartEngine = new SmartChatbotEngine();

// Override handleSendMessage in FacilityChatbot
FacilityChatbot.prototype.handleSendMessageSmartVersion = async function() {
  const input = document.getElementById('chatbot-input');
  const query = input.value.trim();

  if (!query) return;

  this.addMessage(query, 'user');
  input.value = '';
  this.showLoading(true);

  try {
    // Step 1: Smart matching (instant, no API call)
    const match = smartEngine.findBestMatch(query);
    
    // Step 2: Build response based on confidence
    const response = smartEngine.buildResponse(match);
    
    this.showLoading(false);

    // Step 3: Handle confidence
    if (response.confidence === 'low') {
      // Unknown query
      this.addMessage(response.message, 'bot');
      return;
    }

    if (response.confidence !== 'high' && response.confidence !== 'medium') {
      // Ask for confirmation
      const confirmMsg = response.message + '\nReply "yes" to continue or rephrase your question.';
      this.addMessage(confirmMsg, 'bot');
      return;
    }

    // Step 4: Execute query (call Edge Function)
    const apiResponse = await supabaseClient.functions.invoke('chatbot-query', {
      body: {
        query: query,
        facility_id: this.facilityId,
        handler: response.handler
      }
    });

    if (apiResponse.error) {
      throw new Error(apiResponse.error.message);
    }

    const result = apiResponse.data;

    // Step 5: Add context if available
    if (response.context) {
      this.addMessage(`💡 ${response.context}`, 'bot');
    }

    // Step 6: Display results
    if (result.type === 'table') {
      this.addTableMessage(result.data, result.columns);
    } else {
      this.addMessage(result.message, 'bot');
    }

  } catch (error) {
    this.showLoading(false);
    console.error('Chatbot error:', error);
    
    // Even if error, we tried to be smart
    this.addMessage(
      '⚠️ I understood your question but had an error fetching data. Please try again.',
      'bot'
    );
  }
};

// Export for use in chatbot-handler.js
window.SmartChatbotEngine = SmartChatbotEngine;
