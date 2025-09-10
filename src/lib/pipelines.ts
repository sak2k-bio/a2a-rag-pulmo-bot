import { QueryAgent, RetrievalAgent, AnswerAgent, CriticAgent, RefineAgent, ThinkingStep } from './agents';
import { getVectorStore } from './vectorstore';

// Pipeline interface
export interface Pipeline {
  name: string;
  process(query: string): Promise<{
    answer: string;
    thinkingSteps: ThinkingStep[];
    pipelineInfo: string;
    sources?: any[];
  }>;
}

// Phase 1: Basic A2A Pipeline
export class Phase1Pipeline implements Pipeline {
  name = 'Phase 1: Basic A2A';

  async process(query: string): Promise<{
    answer: string;
    thinkingSteps: ThinkingStep[];
    pipelineInfo: string;
    sources?: any[];
  }> {
    const allThinkingSteps: ThinkingStep[] = [];
    
    try {
      // Step 1: Query Processing
      const queryAgent = new QueryAgent();
      const queryResult = await queryAgent.process({ query });
      allThinkingSteps.push(...queryResult.thinkingSteps);

      let answer = "I'm not sure how to answer that.";
      let documents: any[] = [];

      // Step 2: Retrieval (if needed)
      if (queryResult.needsRetrieval) {
        const retrievalAgent = new RetrievalAgent();
        const retrievalResult = await retrievalAgent.process({ 
          query: queryResult.processedQuery, 
          k: 3 
        });
        allThinkingSteps.push(...retrievalResult.thinkingSteps);
        documents = retrievalResult.documents;
      }

      // Step 3: Answer Generation
      const answerAgent = new AnswerAgent();
      const answerResult = await answerAgent.process({ 
        query: queryResult.processedQuery, 
        documents 
      });
      allThinkingSteps.push(...answerResult.thinkingSteps);
      answer = answerResult.answer;

      return {
        answer,
        thinkingSteps: allThinkingSteps,
        pipelineInfo: this.name,
        sources: documents
      };
    } catch (error) {
      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Error Handling',
        status: 'error',
        message: `Pipeline error: ${error}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return {
        answer: "I encountered an error while processing your request. Please try again.",
        thinkingSteps: allThinkingSteps,
        pipelineInfo: this.name,
        sources: []
      };
    }
  }
}

// Phase 2: Smart A2A Pipeline
export class Phase2Pipeline implements Pipeline {
  name = 'Phase 2: Smart A2A';

  async process(query: string): Promise<{
    answer: string;
    thinkingSteps: ThinkingStep[];
    pipelineInfo: string;
    sources?: any[];
  }> {
    const allThinkingSteps: ThinkingStep[] = [];
    
    try {
      // Step 1: Query Processing
      const queryAgent = new QueryAgent();
      const queryResult = await queryAgent.process({ query });
      allThinkingSteps.push(...queryResult.thinkingSteps);

      let answer = "I'm not sure how to answer that.";
      let documents: any[] = [];

      // Step 2: Retrieval (if needed)
      if (queryResult.needsRetrieval) {
        const retrievalAgent = new RetrievalAgent();
        const retrievalResult = await retrievalAgent.process({ 
          query: queryResult.processedQuery, 
          k: 5 
        });
        allThinkingSteps.push(...retrievalResult.thinkingSteps);
        documents = retrievalResult.documents;
      }

      // Step 3: Answer Generation
      const answerAgent = new AnswerAgent();
      const answerResult = await answerAgent.process({ 
        query: queryResult.processedQuery, 
        documents 
      });
      allThinkingSteps.push(...answerResult.thinkingSteps);
      answer = answerResult.answer;

      // Step 4: Answer Evaluation
      const criticAgent = new CriticAgent();
      const critiqueResult = await criticAgent.process({ 
        query: queryResult.processedQuery, 
        answer, 
        documents 
      });
      allThinkingSteps.push(...critiqueResult.thinkingSteps);

      // If score is low, try to improve
      if (critiqueResult.score < 7) {
        const refineAgent = new RefineAgent();
        const refineResult = await refineAgent.process({ 
          query: queryResult.processedQuery, 
          answer, 
          critique: critiqueResult.critique, 
          documents 
        });
        allThinkingSteps.push(...refineResult.thinkingSteps);
        answer = refineResult.refinedAnswer;
      }

      return {
        answer,
        thinkingSteps: allThinkingSteps,
        pipelineInfo: this.name,
        sources: documents
      };
    } catch (error) {
      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Error Handling',
        status: 'error',
        message: `Pipeline error: ${error}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return {
        answer: "I encountered an error while processing your request. Please try again.",
        thinkingSteps: allThinkingSteps,
        pipelineInfo: this.name,
        sources: []
      };
    }
  }
}

// Phase 3: Self-Refinement Pipeline
export class Phase3Pipeline implements Pipeline {
  name = 'Phase 3: Self-Refinement';

  async process(query: string): Promise<{
    answer: string;
    thinkingSteps: ThinkingStep[];
    pipelineInfo: string;
    sources?: any[];
  }> {
    const allThinkingSteps: ThinkingStep[] = [];
    
    try {
      // Step 1: Query Processing
      const queryAgent = new QueryAgent();
      const queryResult = await queryAgent.process({ query });
      allThinkingSteps.push(...queryResult.thinkingSteps);

      let answer = "I'm not sure how to answer that.";
      let documents: any[] = [];

      // Step 2: Retrieval (if needed)
      if (queryResult.needsRetrieval) {
        const retrievalAgent = new RetrievalAgent();
        const retrievalResult = await retrievalAgent.process({ 
          query: queryResult.processedQuery, 
          k: 7 
        });
        allThinkingSteps.push(...retrievalResult.thinkingSteps);
        documents = retrievalResult.documents;
      }

      // Step 3: Answer Generation
      const answerAgent = new AnswerAgent();
      const answerResult = await answerAgent.process({ 
        query: queryResult.processedQuery, 
        documents 
      });
      allThinkingSteps.push(...answerResult.thinkingSteps);
      answer = answerResult.answer;

      // Step 4: Iterative Refinement (up to 3 iterations)
      let currentAnswer = answer;
      let iteration = 0;
      const maxIterations = 3;

      while (iteration < maxIterations) {
        const criticAgent = new CriticAgent();
        const critiqueResult = await criticAgent.process({ 
          query: queryResult.processedQuery, 
          answer: currentAnswer, 
          documents 
        });
        allThinkingSteps.push(...critiqueResult.thinkingSteps);

        if (critiqueResult.score >= 8) {
          break; // Good enough score, stop refining
        }

        const refineAgent = new RefineAgent();
        const refineResult = await refineAgent.process({ 
          query: queryResult.processedQuery, 
          answer: currentAnswer, 
          critique: critiqueResult.critique, 
          documents 
        });
        allThinkingSteps.push(...refineResult.thinkingSteps);
        currentAnswer = refineResult.refinedAnswer;
        iteration++;
      }

      answer = currentAnswer;

      return {
        answer,
        thinkingSteps: allThinkingSteps,
        pipelineInfo: this.name,
        sources: documents
      };
    } catch (error) {
      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Error Handling',
        status: 'error',
        message: `Pipeline error: ${error}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return {
        answer: "I encountered an error while processing your request. Please try again.",
        thinkingSteps: allThinkingSteps,
        pipelineInfo: this.name,
        sources: []
      };
    }
  }
}

// Auto Pipeline (AI selects optimal)
export class AutoPipeline implements Pipeline {
  name = 'AUTO: AI Selects Optimal';

  async process(query: string): Promise<{
    answer: string;
    thinkingSteps: ThinkingStep[];
    pipelineInfo: string;
    sources?: any[];
  }> {
    const allThinkingSteps: ThinkingStep[] = [];
    
    try {
      // Analyze query complexity to select pipeline
      const queryComplexity = this.analyzeQueryComplexity(query);
      
      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Pipeline Selection',
        status: 'processing',
        message: `Analyzing query complexity: ${queryComplexity}`,
        details: { query, complexity: queryComplexity }
      });

      let selectedPipeline: Pipeline;
      
      if (queryComplexity === 'simple') {
        selectedPipeline = new Phase1Pipeline();
      } else if (queryComplexity === 'medium') {
        selectedPipeline = new Phase2Pipeline();
      } else {
        selectedPipeline = new Phase3Pipeline();
      }

      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Pipeline Selection',
        status: 'completed',
        message: `Selected pipeline: ${selectedPipeline.name}`,
        details: { selectedPipeline: selectedPipeline.name }
      });

      // Add a step showing we're executing the selected pipeline
      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Pipeline Execution',
        status: 'processing',
        message: `Executing ${selectedPipeline.name}...`,
        details: { selectedPipeline: selectedPipeline.name }
      });

      // Execute selected pipeline
      const result = await selectedPipeline.process(query);
      allThinkingSteps.push(...result.thinkingSteps);

      // Mark pipeline execution as completed
      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Pipeline Execution',
        status: 'completed',
        message: `${selectedPipeline.name} completed successfully`,
        details: { 
          selectedPipeline: selectedPipeline.name,
          answerLength: result.answer.length,
          sourcesCount: result.sources?.length || 0
        }
      });

      return {
        answer: result.answer,
        thinkingSteps: allThinkingSteps,
        pipelineInfo: `${this.name} → ${selectedPipeline.name}`,
        sources: result.sources || []
      };
    } catch (error) {
      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Error Handling',
        status: 'error',
        message: `Pipeline error: ${error}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return {
        answer: "I encountered an error while processing your request. Please try again.",
        thinkingSteps: allThinkingSteps,
        pipelineInfo: this.name,
        sources: []
      };
    }
  }

  private analyzeQueryComplexity(query: string): 'simple' | 'medium' | 'complex' {
    const lowerQuery = query.toLowerCase();
    
    // Simple queries
    if (query.length < 30 && !lowerQuery.includes('?') && !lowerQuery.includes('explain')) {
      return 'simple';
    }
    
    // Complex queries
    if (query.length > 100 || 
        lowerQuery.includes('compare') || 
        lowerQuery.includes('analyze') || 
        lowerQuery.includes('explain') ||
        lowerQuery.includes('multiple') ||
        lowerQuery.split(' ').length > 15) {
      return 'complex';
    }
    
    return 'medium';
  }
}

// Meta Pipeline (Intelligent Selection)
export class MetaPipeline implements Pipeline {
  name = 'META: Intelligent Selection';

  async process(query: string): Promise<{
    answer: string;
    thinkingSteps: ThinkingStep[];
    pipelineInfo: string;
    sources?: any[];
  }> {
    const allThinkingSteps: ThinkingStep[] = [];
    
    try {
      // Use AI to analyze query and select best approach
      const analysis = await this.analyzeQuery(query);
      
      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Meta Analysis',
        status: 'processing',
        message: 'Performing intelligent query analysis...',
        details: { query, analysis }
      });

      let selectedPipeline: Pipeline;
      
      if (analysis.recommendedPipeline === 'phase1') {
        selectedPipeline = new Phase1Pipeline();
      } else if (analysis.recommendedPipeline === 'phase2') {
        selectedPipeline = new Phase2Pipeline();
      } else {
        selectedPipeline = new Phase3Pipeline();
      }

      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Meta Analysis',
        status: 'completed',
        message: `Intelligent selection: ${selectedPipeline.name}`,
        details: { 
          analysis, 
          selectedPipeline: selectedPipeline.name,
          confidence: analysis.confidence 
        }
      });

      // Add a step showing we're executing the selected pipeline
      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Pipeline Execution',
        status: 'processing',
        message: `Executing ${selectedPipeline.name}...`,
        details: { selectedPipeline: selectedPipeline.name }
      });

      // Execute selected pipeline
      const result = await selectedPipeline.process(query);
      allThinkingSteps.push(...result.thinkingSteps);

      // Mark pipeline execution as completed
      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Pipeline Execution',
        status: 'completed',
        message: `${selectedPipeline.name} completed successfully`,
        details: { 
          selectedPipeline: selectedPipeline.name,
          answerLength: result.answer.length,
          sourcesCount: result.sources?.length || 0
        }
      });

      return {
        answer: result.answer,
        thinkingSteps: allThinkingSteps,
        pipelineInfo: `${this.name} → ${selectedPipeline.name} (${analysis.confidence}% confidence)`,
        sources: result.sources || []
      };
    } catch (error) {
      allThinkingSteps.push({
        agent: 'Pipeline',
        step: 'Error Handling',
        status: 'error',
        message: `Pipeline error: ${error}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return {
        answer: "I encountered an error while processing your request. Please try again.",
        thinkingSteps: allThinkingSteps,
        pipelineInfo: this.name,
        sources: []
      };
    }
  }

  private async analyzeQuery(query: string): Promise<{
    recommendedPipeline: 'phase1' | 'phase2' | 'phase3';
    confidence: number;
    reasoning: string;
  }> {
    // Simple heuristic analysis (in a real implementation, this could use AI)
    const lowerQuery = query.toLowerCase();
    
    if (query.length < 50 && !lowerQuery.includes('explain') && !lowerQuery.includes('analyze')) {
      return {
        recommendedPipeline: 'phase1',
        confidence: 85,
        reasoning: 'Simple query, basic pipeline sufficient'
      };
    }
    
    if (lowerQuery.includes('compare') || lowerQuery.includes('analyze') || query.length > 100) {
      return {
        recommendedPipeline: 'phase3',
        confidence: 90,
        reasoning: 'Complex query requiring self-refinement'
      };
    }
    
    return {
      recommendedPipeline: 'phase2',
      confidence: 80,
      reasoning: 'Medium complexity query, smart pipeline recommended'
    };
  }
}

// Pipeline factory
export function createPipeline(mode: string): Pipeline {
  switch (mode) {
    case 'phase1':
      return new Phase1Pipeline();
    case 'phase2':
      return new Phase2Pipeline();
    case 'phase3':
      return new Phase3Pipeline();
    case 'auto':
      return new AutoPipeline();
    case 'meta':
      return new MetaPipeline();
    default:
      return new MetaPipeline(); // Default to meta
  }
}
