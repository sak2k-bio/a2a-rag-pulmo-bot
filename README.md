# RAG A2A Superbot - Frontend

A Next.js frontend application that integrates the RAG A2A Superbot backend directly into API routes, providing a seamless chat interface with intelligent agent-based responses.

## 🚀 Features

- **Integrated Backend**: All RAG pipeline logic runs within Next.js API routes
- **Multiple Pipeline Modes**: Choose from 5 different processing pipelines
- **Real-time Thinking Process**: See how agents process your queries step-by-step
- **Document Management**: Load sample documents or upload your own
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Vector Store Support**: Chroma and Qdrant vector database integration
- **LLM Integration**: Google Gemini and Ollama support

## 🏗️ Architecture

### API Routes

- `/api/chat` - Main chat endpoint with RAG pipeline
- `/api/documents` - Document upload and management
- `/api/sample-documents` - Load sample knowledge base
- `/api/status` - System health and configuration status

### Pipeline Modes

1. **Phase 1: Basic A2A** - Simple query → retrieval → answer
2. **Phase 2: Smart A2A** - Adds answer evaluation and refinement
3. **Phase 3: Self-Refinement** - Iterative improvement with multiple refinement cycles
4. **AUTO: AI Selects Optimal** - Automatically chooses the best pipeline
5. **META: Intelligent Selection** - Advanced AI-driven pipeline selection

### Agent Architecture

- **QueryAgent**: Processes and analyzes user queries
- **RetrievalAgent**: Searches vector database for relevant documents
- **AnswerAgent**: Generates responses using retrieved context
- **CriticAgent**: Evaluates answer quality and relevance
- **RefineAgent**: Improves answers based on critique

## 🛠️ Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Ollama** installed and running
3. **Google API Key** (optional, for Gemini integration)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the frontend directory:
   ```env
   # RAG A2A Superbot Configuration
   VECTOR_STORE=chroma
   CHROMA_PATH=./chroma_db
   QDRANT_HOST=localhost
   QDRANT_PORT=6333
   COLLECTION_NAME=rag_a2a_collection
   OLLAMA_HOST=http://localhost:11434
   GOOGLE_API_KEY=your_google_api_key_here

   # Next.js Configuration
   NEXT_PUBLIC_APP_NAME=RAG A2A Superbot
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

3. **Install and start Ollama**:
   ```bash
   # Install Ollama (if not already installed)
   # Visit https://ollama.ai for installation instructions

   # Pull required models
   ollama pull nomic-embed-text
   ollama pull llama3.2
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🧪 Testing

### Manual Testing

1. **Load Sample Documents**: Click the "Load Sample Docs" button to populate the knowledge base
2. **Test Different Pipelines**: Try different pipeline modes with various queries
3. **Observe Thinking Process**: Watch the real-time agent thinking steps

### Automated Testing

Run the integration test script:
```bash
node test-integration.js
```

This will test:
- System status and health checks
- Sample document loading
- Chat functionality with all pipeline modes
- Document upload functionality

## 📚 Usage

### Basic Chat

1. Select a pipeline mode from the dropdown
2. Type your question in the input field
3. Press Enter or click Send
4. Watch the agents process your query in real-time
5. Review the generated response and thinking steps

### Sample Queries

Try these sample queries to test different capabilities:

- **Simple**: "What is AI?"
- **Medium**: "How does machine learning work?"
- **Complex**: "Compare the advantages and disadvantages of different vector databases for RAG systems"
- **Technical**: "Explain the agent-to-agent architecture pattern and its benefits"

### Pipeline Selection Guide

- **Phase 1**: Use for simple, straightforward questions
- **Phase 2**: Use for questions requiring some analysis
- **Phase 3**: Use for complex queries needing thorough processing
- **AUTO**: Let the system choose based on query complexity
- **META**: Use for advanced queries requiring intelligent processing

## 🔧 Configuration

### Vector Store Options

**Chroma (Default)**:
- Lightweight and easy to use
- Good for development and testing
- Stores data locally

**Qdrant**:
- High-performance vector search
- Better for production use
- Requires separate Qdrant server

### LLM Configuration

**Google Gemini** (Primary):
- Requires `GOOGLE_API_KEY` environment variable
- High-quality responses
- Fast processing

**Ollama** (Fallback):
- Local processing
- No API key required
- Requires Ollama server running

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts          # Main chat API
│   │   │   ├── documents/route.ts     # Document management
│   │   │   ├── sample-documents/route.ts # Sample data loading
│   │   │   └── status/route.ts        # System status
│   │   ├── globals.css                # Global styles
│   │   ├── layout.tsx                 # App layout
│   │   └── page.tsx                   # Main chat interface
│   └── lib/
│       ├── agents.ts                  # Agent implementations
│       ├── pipelines.ts               # Pipeline implementations
│       └── vectorstore.ts             # Vector store utilities
├── test-integration.js                # Integration test script
└── README.md                          # This file
```

## 🚨 Troubleshooting

### Common Issues

1. **"Ollama connection failed"**:
   - Ensure Ollama is running: `ollama serve`
   - Check `OLLAMA_HOST` environment variable

2. **"Vector store initialization failed"**:
   - Check vector store configuration
   - Ensure proper permissions for database directory

3. **"No response from chat API"**:
   - Check browser console for errors
   - Verify API routes are working: `curl http://localhost:3000/api/status`

4. **"Google Gemini not working"**:
   - Verify `GOOGLE_API_KEY` is set correctly
   - Check API key permissions and quotas

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 🔄 Development

### Adding New Agents

1. Create a new agent class in `src/lib/agents.ts`
2. Implement the `Agent` interface
3. Add the agent to your pipeline in `src/lib/pipelines.ts`

### Adding New Pipelines

1. Create a new pipeline class in `src/lib/pipelines.ts`
2. Implement the `Pipeline` interface
3. Add the pipeline to the factory function
4. Update the frontend dropdown options

### Customizing UI

The main UI is in `src/app/page.tsx`. Key components:
- Message display and formatting
- Thinking steps visualization
- Pipeline mode selector
- Document loading interface

## 📈 Performance

### Optimization Tips

1. **Vector Store**: Use Qdrant for better performance in production
2. **Embeddings**: Consider caching embeddings for repeated queries
3. **LLM Calls**: Implement response caching for similar queries
4. **Database**: Use connection pooling for vector store connections

### Monitoring

Check system status at `/api/status` to monitor:
- Vector store connectivity
- Ollama service status
- Google AI configuration
- Overall system health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy chatting with your RAG A2A Superbot!** 🤖✨