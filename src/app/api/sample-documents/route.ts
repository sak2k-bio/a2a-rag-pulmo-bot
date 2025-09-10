import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore } from '@/lib/vectorstore';

const sampleDocuments = [
  {
    content: "Artificial Intelligence (AI) is a branch of computer science that aims to create machines capable of intelligent behavior. AI systems can perform tasks that typically require human intelligence, such as visual perception, speech recognition, decision-making, and language translation.",
    metadata: { 
      title: "Introduction to Artificial Intelligence",
      category: "AI Basics",
      source: "Educational Material"
    }
  },
  {
    content: "Machine Learning is a subset of artificial intelligence that focuses on algorithms and statistical models that enable computers to improve their performance on a specific task through experience. It includes supervised learning, unsupervised learning, and reinforcement learning approaches.",
    metadata: { 
      title: "Machine Learning Fundamentals",
      category: "AI Basics",
      source: "Educational Material"
    }
  },
  {
    content: "Retrieval-Augmented Generation (RAG) is an AI technique that combines information retrieval with text generation. It retrieves relevant documents from a knowledge base and uses them as context to generate more accurate and informative responses. This approach helps reduce hallucinations and provides more factual answers.",
    metadata: { 
      title: "Retrieval-Augmented Generation",
      category: "AI Techniques",
      source: "Research Paper"
    }
  },
  {
    content: "Agent-to-Agent (A2A) architecture is a design pattern where multiple specialized AI agents work together to solve complex problems. Each agent has a specific role and can communicate with other agents to share information and coordinate their actions. This approach enables more modular, scalable, and maintainable AI systems.",
    metadata: { 
      title: "Agent-to-Agent Architecture",
      category: "AI Architecture",
      source: "Technical Documentation"
    }
  },
  {
    content: "Vector databases are specialized databases designed to store and search high-dimensional vectors efficiently. They use techniques like approximate nearest neighbor search to find similar vectors quickly. Popular vector databases include Chroma, Qdrant, Pinecone, and Weaviate. They are essential for AI applications that use embeddings for semantic search.",
    metadata: { 
      title: "Vector Databases",
      category: "AI Infrastructure",
      source: "Technical Documentation"
    }
  },
  {
    content: "Embeddings are dense vector representations of text, images, or other data that capture semantic meaning. They enable AI systems to understand relationships between different pieces of information. Popular embedding models include OpenAI's text-embedding-ada-002, Google's Universal Sentence Encoder, and various open-source models like sentence-transformers.",
    metadata: { 
      title: "Embeddings in AI",
      category: "AI Techniques",
      source: "Research Paper"
    }
  },
  {
    content: "Large Language Models (LLMs) are AI models trained on vast amounts of text data to understand and generate human-like text. They can perform various natural language processing tasks including text generation, translation, summarization, and question answering. Examples include GPT, BERT, T5, and more recent models like ChatGPT and Claude.",
    metadata: { 
      title: "Large Language Models",
      category: "AI Models",
      source: "Research Paper"
    }
  },
  {
    content: "Prompt engineering is the practice of designing effective prompts to get desired outputs from AI models. It involves crafting clear, specific instructions and providing relevant context. Good prompt engineering can significantly improve the quality and reliability of AI responses. Techniques include few-shot learning, chain-of-thought prompting, and role-based prompting.",
    metadata: { 
      title: "Prompt Engineering",
      category: "AI Techniques",
      source: "Best Practices Guide"
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const vectorStore = await getVectorStore();
    await vectorStore.addDocuments(sampleDocuments);

    return NextResponse.json({
      success: true,
      message: `Successfully loaded ${sampleDocuments.length} sample documents into the knowledge base`,
      documentCount: sampleDocuments.length,
      documents: sampleDocuments.map(doc => ({
        title: doc.metadata.title,
        category: doc.metadata.category,
        source: doc.metadata.source
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sample documents loading error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
