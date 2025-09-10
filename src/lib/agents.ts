import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import { getVectorStore } from './vectorstore';

// Configuration - Using Next.js public environment variables
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const OLLAMA_HOST = process.env.NEXT_PUBLIC_OLLAMA_HOST || 'http://localhost:11434';
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_TEMPERATURE = parseFloat(process.env.NEXT_PUBLIC_GEMINI_TEMPERATURE || '0.7');
const GEMINI_MAX_TOKENS = parseInt(process.env.NEXT_PUBLIC_GEMINI_MAX_TOKENS || '2048');

// Initialize Google AI
const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;

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
    // Simple heuristic - retrieve for questions and specific queries
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which'];
    const lowerQuery = query.toLowerCase();
    return questionWords.some(word => lowerQuery.includes(word)) || 
           query.length > 20 || 
           lowerQuery.includes('?');
  }
}

// Retrieval Agent
export class RetrievalAgent implements Agent {
  name = 'RetrievalAgent';

  async process(input: { query: string; k?: number }): Promise<{ documents: any[]; thinkingSteps: ThinkingStep[] }> {
    const thinkingSteps: ThinkingStep[] = [];
    
    try {
      thinkingSteps.push({
        agent: this.name,
        step: 'Vector Search',
        status: 'processing',
        message: 'Searching for relevant documents...'
      });

      const vectorStore = await getVectorStore();
      const documents = await vectorStore.similaritySearch(input.query, input.k || 5);

      thinkingSteps.push({
        agent: this.name,
        step: 'Vector Search',
        status: 'completed',
        message: `Found ${documents.length} relevant documents`,
        details: { query: input.query, documentCount: documents.length }
      });

      return { documents, thinkingSteps };
    } catch (error) {
      thinkingSteps.push({
        agent: this.name,
        step: 'Vector Search',
        status: 'error',
        message: `Error retrieving documents: ${error}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
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
    const prompt = `Based on the following context, please answer the question. If the context doesn't contain enough information to answer the question, please say so.

Context:
${context}

Question: ${query}

Answer:`;

    // Try Google Gemini first, fallback to Ollama
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: GEMINI_MODEL,
          generationConfig: {
            temperature: GEMINI_TEMPERATURE,
            maxOutputTokens: GEMINI_MAX_TOKENS,
          }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.warn("Google Gemini failed, trying Ollama:", error);
      }
    }

    // Fallback to Ollama
    try {
      const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
        model: "gemma3:1b",
        prompt: prompt,
        stream: false
      });
      return response.data.response;
    } catch (error) {
      console.error("Both Google Gemini and Ollama failed:", error);
      return "I apologize, but I'm unable to generate a response at the moment. Please try again later.";
    }
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
    const refinementPrompt = `Please refine the following answer based on the critique provided. Make it more comprehensive and accurate.

Original Query: ${query}
Original Answer: ${answer}
Critique: ${critique}
Supporting Documents: ${documents.map(doc => doc.content).join('\n\n')}

Refined Answer:`;

    // Try Google Gemini first, fallback to Ollama
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: GEMINI_MODEL,
          generationConfig: {
            temperature: GEMINI_TEMPERATURE,
            maxOutputTokens: GEMINI_MAX_TOKENS,
          }
        });
        const result = await model.generateContent(refinementPrompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.warn("Google Gemini failed for refinement, trying Ollama:", error);
      }
    }

    // Fallback to Ollama
    try {
      const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
        model: "gemma3:1b",
        prompt: refinementPrompt,
        stream: false
      });
      return response.data.response;
    } catch (error) {
      console.error("Both Google Gemini and Ollama failed for refinement:", error);
      return answer; // Return original answer if refinement fails
    }
  }
}
