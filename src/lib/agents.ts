import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import { getVectorStore } from './vectorstore';

// Configuration - Using Next.js public environment variables
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const OLLAMA_HOST = process.env.NEXT_PUBLIC_OLLAMA_HOST || 'http://localhost:11434';
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_TEMPERATURE = parseFloat(process.env.NEXT_PUBLIC_GEMINI_TEMPERATURE || '0.7');
const GEMINI_MAX_TOKENS = parseInt(process.env.NEXT_PUBLIC_GEMINI_MAX_TOKENS || '2048');

// Initialize Google AI - Lazy initialization to ensure env vars are available
function getGoogleAI() {
  if (!GOOGLE_API_KEY) {
    console.warn("⚠️ Google API key not found");
    return null;
  }
  try {
    return new GoogleGenerativeAI(GOOGLE_API_KEY);
  } catch (error) {
    console.error("❌ Failed to initialize Google AI:", error);
    return null;
  }
}

// Base Agent interface
export interface Agent {
  name: string;
  process(input: any): Promise<any>;
}

// Thinking step interface
export interface ThinkingStep {
  agent: string;
  step: string;
  status: 'processing' | 'completed' | 'error';
  message: string;
  details?: any;
}

// Query Agent
export class QueryAgent implements Agent {
  name = 'QueryAgent';

  async process(input: { query: string }): Promise<{ processedQuery: string; needsRetrieval: boolean; thinkingSteps: ThinkingStep[] }> {
    const thinkingSteps: ThinkingStep[] = [];
    
    try {
      thinkingSteps.push({
        agent: this.name,
        step: 'Query Analysis',
        status: 'processing',
        message: 'Analyzing query structure and intent...'
      });

      // Simple query analysis
      const processedQuery = input.query.trim();
      const needsRetrieval = this.shouldRetrieve(processedQuery);

      thinkingSteps.push({
        agent: this.name,
        step: 'Query Analysis',
        status: 'completed',
        message: `Query processed. Needs retrieval: ${needsRetrieval}`,
        details: { originalQuery: input.query, processedQuery, needsRetrieval }
      });

      return { processedQuery, needsRetrieval, thinkingSteps };
    } catch (error) {
      thinkingSteps.push({
        agent: this.name,
        step: 'Query Analysis',
        status: 'error',
        message: `Error processing query: ${error}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  private shouldRetrieve(query: string): boolean {
    // Enhanced heuristic - retrieve for medical terms, questions, and specific queries
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which'];
    const medicalTerms = ['effusion', 'pneumonia', 'asthma', 'cancer', 'disease', 'syndrome', 'disorder', 'condition', 'symptom', 'treatment', 'diagnosis', 'therapy'];
    const lowerQuery = query.toLowerCase();
    
    const hasQuestionWords = questionWords.some(word => lowerQuery.includes(word));
    const hasMedicalTerms = medicalTerms.some(term => lowerQuery.includes(term));
    const isLongQuery = query.length > 15;
    const hasQuestionMark = lowerQuery.includes('?');
    
    const shouldRetrieve = hasQuestionWords || hasMedicalTerms || isLongQuery || hasQuestionMark;
    
    console.log(`🔍 QueryAgent shouldRetrieve analysis:`, {
      query,
      hasQuestionWords,
      hasMedicalTerms,
      isLongQuery,
      hasQuestionMark,
      shouldRetrieve
    });
    
    return shouldRetrieve;
  }
}

// Retrieval Agent
export class RetrievalAgent implements Agent {
  name = 'RetrievalAgent';

  async process(input: { query: string; k?: number }): Promise<{ documents: any[]; thinkingSteps: ThinkingStep[] }> {
    const thinkingSteps: ThinkingStep[] = [];
    
    try {
      console.log(`🔍 RetrievalAgent: Searching for documents with query: "${input.query}"`);
      console.log(`📊 Requested documents: ${input.k || 5}`);
      
      thinkingSteps.push({
        agent: this.name,
        step: 'Vector Search',
        status: 'processing',
        message: 'Searching for relevant documents...'
      });

      const vectorStore = await getVectorStore();
      console.log(`🗄️ Vector store initialized: ${vectorStore.constructor.name}`);
      
      const documents = await vectorStore.similaritySearch(input.query, input.k || 5);
      console.log(`📚 Retrieved ${documents.length} documents`);
      
      // Log document details for debugging
      documents.forEach((doc, index) => {
        console.log(`📄 Document ${index + 1}: ${doc.content.substring(0, 100)}...`);
        console.log(`   Distance: ${doc.distance}, Metadata:`, doc.metadata);
      });

      thinkingSteps.push({
        agent: this.name,
        step: 'Vector Search',
        status: 'completed',
        message: `Found ${documents.length} relevant documents`,
        details: { 
          query: input.query, 
          documentCount: documents.length,
          documents: documents.map(doc => ({
            contentLength: doc.content.length,
            distance: doc.distance,
            hasMetadata: !!doc.metadata
          }))
        }
      });

      return { documents, thinkingSteps };
    } catch (error) {
      console.error(`❌ RetrievalAgent error:`, error);
      thinkingSteps.push({
        agent: this.name,
        step: 'Vector Search',
        status: 'error',
        message: `Error retrieving documents: ${error}`,
        details: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          query: input.query,
          k: input.k || 5
        }
      });
      throw error;
    }
  }
}

// Answer Agent
export class AnswerAgent implements Agent {
  name = 'AnswerAgent';

  async process(input: { query: string; documents: any[] }): Promise<{ answer: string; thinkingSteps: ThinkingStep[] }> {
    const thinkingSteps: ThinkingStep[] = [];
    
    try {
      thinkingSteps.push({
        agent: this.name,
        step: 'Response Generation',
        status: 'processing',
        message: 'Generating response using retrieved context...'
      });

      const context = input.documents.map(doc => doc.content).join('\n\n');
      const answer = await this.generateAnswer(input.query, context);

      thinkingSteps.push({
        agent: this.name,
        step: 'Response Generation',
        status: 'completed',
        message: 'Response generated successfully',
        details: { 
          query: input.query, 
          contextLength: context.length,
          documentCount: input.documents.length 
        }
      });

      return { answer, thinkingSteps };
    } catch (error) {
      thinkingSteps.push({
        agent: this.name,
        step: 'Response Generation',
        status: 'error',
        message: `Error generating answer: ${error}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  private async generateAnswer(query: string, context: string): Promise<string> {
    console.log(`🤖 AnswerAgent: Generating answer for query: "${query}"`);
    console.log(`📄 Context length: ${context.length} characters`);
    console.log(`🔑 Google API Key available: ${!!GOOGLE_API_KEY}`);
    
    const prompt = `Based on the following context, please answer the question. If the context doesn't contain enough information to answer the question, please say so.

Context:
${context}

Question: ${query}

Answer:`;

    // Check if we're in a Vercel environment
    const isVercel = process.env.VERCEL === '1';
    console.log(`🌐 Environment: ${isVercel ? 'Vercel' : 'Local'}`);

    // Try Google Gemini first
    const genAI = getGoogleAI();
    if (genAI) {
      try {
        console.log("🚀 Attempting to use Google Gemini...");
        const model = genAI.getGenerativeModel({ 
          model: GEMINI_MODEL,
          generationConfig: {
            temperature: GEMINI_TEMPERATURE,
            maxOutputTokens: GEMINI_MAX_TOKENS,
          }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();
        console.log(`✅ Google Gemini response received: ${answer.length} characters`);
        return answer;
      } catch (error) {
        console.error("❌ Google Gemini failed:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          apiKey: GOOGLE_API_KEY ? 'Present' : 'Missing'
        });
        
        if (isVercel) {
          // On Vercel, we can't use Ollama, so try to provide a basic answer from context
          return this.generateBasicAnswer(query, context);
        }
      }
    } else {
      console.warn("⚠️ Google AI not available, trying fallback methods");
    }

    // Fallback to Ollama (only for local development)
    if (!isVercel) {
      try {
        console.log("🦙 Attempting to use Ollama...");
        const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
          model: "gemma3:1b",
          prompt: prompt,
          stream: false
        });
        const answer = response.data.response;
        console.log(`✅ Ollama response received: ${answer.length} characters`);
        return answer;
      } catch (error) {
        console.error("❌ Ollama failed:", error);
      }
    }

    // Final fallback - try to provide basic answer from context
    console.log("🔄 Using basic context-based fallback");
    return this.generateBasicAnswer(query, context);
  }

  private generateBasicAnswer(query: string, context: string): string {
    console.log("🔍 Generating basic answer from context...");
    console.log(`📝 Query: "${query}"`);
    console.log(`📄 Context length: ${context.length} characters`);
    
    if (!context || context.trim().length === 0) {
      return "I don't have any relevant information to answer your question. Please ensure documents are loaded in the knowledge base.";
    }

    // Enhanced keyword matching with medical term expansion
    const queryWords = query.toLowerCase().split(/\s+/);
    const contextLower = context.toLowerCase();
    
    // Expand medical terms for better matching
    const medicalExpansions: { [key: string]: string[] } = {
      'effusion': ['pleural', 'fluid', 'accumulation', 'collection', 'space'],
      'pneumonia': ['infection', 'lung', 'respiratory', 'pulmonary'],
      'asthma': ['bronchial', 'airway', 'breathing', 'respiratory'],
      'cancer': ['tumor', 'neoplasm', 'malignancy', 'carcinoma'],
      'disease': ['disorder', 'condition', 'syndrome', 'pathology']
    };
    
    // Get expanded terms for better matching
    const expandedTerms = [...queryWords];
    queryWords.forEach(word => {
      if (medicalExpansions[word]) {
        expandedTerms.push(...medicalExpansions[word]);
      }
    });
    
    // Check if any query words or expanded terms appear in context
    const matchingWords = expandedTerms.filter(term => 
      term.length > 2 && contextLower.includes(term)
    );
    
    console.log(`🔍 Matching terms found: ${matchingWords.join(', ')}`);
    
    if (matchingWords.length > 0) {
      // Extract relevant sentences containing query words
      const sentences = context.split(/[.!?]+/).filter(sentence => 
        sentence.trim().length > 10 && 
        matchingWords.some(word => sentence.toLowerCase().includes(word))
      );
      
      console.log(`📝 Found ${sentences.length} relevant sentences`);
      
      if (sentences.length > 0) {
        const relevantText = sentences.slice(0, 3).join('. ').trim();
        return `Based on the available information: ${relevantText}. (Note: This is a basic response. For more detailed answers, please ensure your Google Gemini API key is properly configured.)`;
      }
    }
    
    // If no direct matches, provide a more helpful response
    console.log("⚠️ No matching terms found in context");
    return `I found some medical information in the knowledge base, but it doesn't specifically mention "${query}". The available information covers topics like respiratory conditions, blood gas transport, and lung diseases. For more specific information about "${query}", please try rephrasing your question or ensure more relevant documents are loaded.`;
  }
}

// Critic Agent
export class CriticAgent implements Agent {
  name = 'CriticAgent';

  async process(input: { query: string; answer: string; documents: any[] }): Promise<{ critique: string; score: number; thinkingSteps: ThinkingStep[] }> {
    const thinkingSteps: ThinkingStep[] = [];
    
    try {
      thinkingSteps.push({
        agent: this.name,
        step: 'Answer Evaluation',
        status: 'processing',
        message: 'Evaluating answer quality and relevance...'
      });

      const critique = this.evaluateAnswer(input.query, input.answer, input.documents);
      const score = this.calculateScore(input.query, input.answer, input.documents);

      thinkingSteps.push({
        agent: this.name,
        step: 'Answer Evaluation',
        status: 'completed',
        message: `Answer evaluated with score: ${score}/10`,
        details: { critique, score, query: input.query }
      });

      return { critique, score, thinkingSteps };
    } catch (error) {
      thinkingSteps.push({
        agent: this.name,
        step: 'Answer Evaluation',
        status: 'error',
        message: `Error evaluating answer: ${error}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  private evaluateAnswer(query: string, answer: string, documents: any[]): string {
    const critiques = [];
    
    if (answer.length < 50) {
      critiques.push("Answer is too brief");
    }
    
    if (answer.includes("I don't know") || answer.includes("I can't")) {
      critiques.push("Answer indicates uncertainty");
    }
    
    if (documents.length === 0) {
      critiques.push("No supporting documents found");
    }
    
    if (critiques.length === 0) {
      return "Answer appears comprehensive and well-supported";
    }
    
    return critiques.join("; ");
  }

  private calculateScore(query: string, answer: string, documents: any[]): number {
    let score = 5; // Base score
    
    if (answer.length > 100) score += 1;
    if (documents.length > 0) score += 2;
    if (!answer.includes("I don't know")) score += 1;
    if (answer.includes(query.toLowerCase())) score += 1;
    
    return Math.min(10, score);
  }
}

// Refine Agent
export class RefineAgent implements Agent {
  name = 'RefineAgent';

  async process(input: { query: string; answer: string; critique: string; documents: any[] }): Promise<{ refinedAnswer: string; thinkingSteps: ThinkingStep[] }> {
    const thinkingSteps: ThinkingStep[] = [];
    
    try {
      thinkingSteps.push({
        agent: this.name,
        step: 'Answer Refinement',
        status: 'processing',
        message: 'Refining answer based on critique...'
      });

      const refinedAnswer = await this.refineAnswer(input.query, input.answer, input.critique, input.documents);

      thinkingSteps.push({
        agent: this.name,
        step: 'Answer Refinement',
        status: 'completed',
        message: 'Answer refined successfully',
        details: { 
          originalLength: input.answer.length,
          refinedLength: refinedAnswer.length,
          critique: input.critique
        }
      });

      return { refinedAnswer, thinkingSteps };
    } catch (error) {
      thinkingSteps.push({
        agent: this.name,
        step: 'Answer Refinement',
        status: 'error',
        message: `Error refining answer: ${error}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  private async refineAnswer(query: string, answer: string, critique: string, documents: any[]): Promise<string> {
    console.log(`🔧 RefineAgent: Refining answer for query: "${query}"`);
    
    const refinementPrompt = `Please refine the following answer based on the critique provided. Make it more comprehensive and accurate.

Original Query: ${query}
Original Answer: ${answer}
Critique: ${critique}
Supporting Documents: ${documents.map(doc => doc.content).join('\n\n')}

Refined Answer:`;

    // Check if we're in a Vercel environment
    const isVercel = process.env.VERCEL === '1';

    // Try Google Gemini first
    const genAI = getGoogleAI();
    if (genAI) {
      try {
        console.log("🚀 Attempting to use Google Gemini for refinement...");
        const model = genAI.getGenerativeModel({ 
          model: GEMINI_MODEL,
          generationConfig: {
            temperature: GEMINI_TEMPERATURE,
            maxOutputTokens: GEMINI_MAX_TOKENS,
          }
        });
        const result = await model.generateContent(refinementPrompt);
        const response = await result.response;
        const refinedAnswer = response.text();
        console.log(`✅ Refinement completed: ${refinedAnswer.length} characters`);
        return refinedAnswer;
      } catch (error) {
        console.warn("❌ Google Gemini failed for refinement:", error);
        if (isVercel) {
          // On Vercel, we can't use Ollama, so return original answer
          console.log("🔄 Returning original answer due to Vercel environment");
          return answer;
        }
      }
    }

    // Fallback to Ollama (only for local development)
    if (!isVercel) {
      try {
        console.log("🦙 Attempting to use Ollama for refinement...");
        const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
          model: "gemma3:1b",
          prompt: refinementPrompt,
          stream: false
        });
        const refinedAnswer = response.data.response;
        console.log(`✅ Ollama refinement completed: ${refinedAnswer.length} characters`);
        return refinedAnswer;
      } catch (error) {
        console.error("❌ Ollama failed for refinement:", error);
      }
    }

    // Return original answer if refinement fails
    console.log("🔄 Returning original answer due to refinement failure");
    return answer;
  }
}
