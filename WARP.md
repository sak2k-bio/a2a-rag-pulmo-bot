# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

This is a Next.js 15 frontend for a RAG (Retrieval-Augmented Generation) A2A (Agent-to-Agent) Superbot system. The application integrates Google Gemini 1.5 Flash with Qdrant Cloud vector database to provide intelligent, multi-agent responses through a sophisticated pipeline architecture.

## Key Architecture Components

### Agent-to-Agent (A2A) System
The application implements a multi-agent architecture with specialized agents:
- **QueryAgent**: Analyzes queries and determines retrieval needs
- **RetrievalAgent**: Performs vector similarity searches in knowledge base
- **AnswerAgent**: Generates responses using retrieved context
- **CriticAgent**: Evaluates answer quality and assigns scores
- **RefineAgent**: Improves answers based on critique feedback

### Pipeline Architecture
Five distinct processing pipelines with increasing sophistication:
1. **Phase 1**: Basic query → retrieval → answer flow
2. **Phase 2**: Adds answer evaluation and single refinement cycle
3. **Phase 3**: Iterative self-refinement with up to 3 improvement cycles
4. **AUTO**: Heuristic-based pipeline selection
5. **META**: AI-driven intelligent pipeline selection with confidence scoring

### Vector Store Integration
- **Primary**: Qdrant Cloud with API key authentication
- **Local Fallback**: Self-hosted Qdrant instances
- **Legacy Support**: ChromaDB for development environments
- **Embeddings**: Google text-embedding models with 3072-dimensional vectors

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Testing Commands
```bash
# Run integration tests (Gemini + Qdrant)
npm test

# Test Google embedding functionality
npm run test-embedding

# Alternative integration test
npm run test-integration
```

### Deployment
```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

## Environment Configuration

### Required Environment Variables (.env.local)
```bash
# Google Gemini (Primary LLM)
NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_GEMINI_TEMPERATURE=0.7
NEXT_PUBLIC_GEMINI_MAX_TOKENS=2048

# Qdrant Cloud (Primary Vector Store)
NEXT_PUBLIC_QDRANT_CLOUD_URL=https://your-cluster.qdrant.io
NEXT_PUBLIC_QDRANT_CLOUD_API_KEY=your_qdrant_key
NEXT_PUBLIC_VECTOR_STORE=qdrant
NEXT_PUBLIC_COLLECTION_NAME=rag_a2a_collection

# Local Development Fallbacks
NEXT_PUBLIC_QDRANT_HOST=localhost
NEXT_PUBLIC_QDRANT_PORT=6333
NEXT_PUBLIC_OLLAMA_HOST=http://localhost:11434
NEXT_PUBLIC_CHROMA_PATH=./chroma_db
```

### Configuration Template
Use `config.env` as a template for setting up environment variables.

## API Routes Structure

### Core Endpoints
- `POST /api/chat` - Main chat endpoint supporting all pipeline modes
- `POST /api/documents` - Upload documents to knowledge base
- `DELETE /api/documents` - Clear entire knowledge base
- `POST /api/sample-documents` - Load predefined sample documents
- `GET /api/status` - System health check and configuration status

### Request/Response Patterns
All API routes follow consistent patterns:
- Success responses include `success: true`, data, and `timestamp`
- Error responses include `success: false`, `error` message, and `timestamp`
- Chat responses include `answer`, `thinkingSteps`, `pipelineInfo`, and `sources`

## File Structure Significance

### Core Application (`src/app/`)
- `page.tsx` - Main chat interface with real-time thinking steps visualization
- `layout.tsx` - Root layout with metadata and font configuration
- `globals.css` - Global styles with CSS custom properties and dark mode support

### Library Layer (`src/lib/`)
- `agents.ts` - All agent implementations with Google Gemini integration and Ollama fallback
- `pipelines.ts` - Pipeline orchestration and intelligent selection logic
- `vectorstore.ts` - Vector database abstraction with Qdrant Cloud support

### API Layer (`src/app/api/`)
- Follows Next.js App Router conventions
- Each route exports HTTP method handlers (`GET`, `POST`, `DELETE`)
- Comprehensive error handling and logging

## Development Patterns

### Agent Implementation
When adding new agents:
1. Implement the `Agent` interface from `src/lib/agents.ts`
2. Include `ThinkingStep` generation for UI visualization
3. Handle errors gracefully with status tracking
4. Support both Google Gemini and Ollama fallback patterns

### Pipeline Development
When creating new pipelines:
1. Extend the `Pipeline` interface from `src/lib/pipelines.ts`
2. Aggregate thinking steps from all constituent agents
3. Include pipeline-specific logic in factory function
4. Update frontend dropdown options in `page.tsx`

### Vector Store Extensions
The vector store abstraction supports:
- Automatic cloud vs local detection based on environment variables
- Embedding dimension validation against collection configuration
- Consistent error handling across different vector database implementations

## Environment-Specific Behavior

### Vercel Deployment
- Automatically disables Ollama fallback (sets `isVercel = process.env.VERCEL === '1'`)
- Requires Google Gemini API key for functionality
- Optimized build configuration in `next.config.ts`

### Local Development
- Supports both Google Gemini and Ollama as LLM backends
- Can use local Qdrant or ChromaDB for vector storage
- Comprehensive fallback chain for maximum development flexibility

## UI Architecture

### Real-time Thinking Steps
The interface provides live visualization of agent processing:
- Expandable thinking steps with status indicators (processing/completed/error)
- Agent-specific icons and color coding
- Detailed step information with collapsible details

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for different screen sizes
- Consistent spacing and typography scaling

### State Management
- React hooks for local state management
- Real-time message updates with automatic scrolling
- Pipeline mode persistence across interactions

## Integration Points

### Google Gemini Integration
- Uses `@google/generative-ai` SDK
- Configurable model, temperature, and token limits
- Automatic error handling with fallback mechanisms

### Qdrant Cloud Integration
- Uses `@qdrant/js-client-rest` for API communication
- Supports both cloud and self-hosted instances
- Vector dimension validation and collection management

### Styling and UI
- Tailwind CSS with custom color schemes
- Lucide React icons for consistent iconography
- Dark mode support with CSS custom properties

## Testing Strategy

### Integration Tests
- `test-google-embedding.mjs` - Tests Google embedding functionality
- Built-in similarity testing for embedding quality validation
- Comprehensive error handling and environment validation

### Manual Testing Flow
1. Load sample documents via API
2. Test different pipeline modes with various query complexities
3. Verify thinking step visualization and agent coordination
4. Validate fallback mechanisms under error conditions

## Performance Considerations

### Vector Search Optimization
- Configurable result limits per pipeline phase (3-7 documents)
- Efficient embedding caching through singleton pattern
- Dimension validation to prevent API errors

### LLM Request Optimization
- Configurable temperature and token limits
- Automatic fallback chain to minimize failures
- Context length optimization for better responses

## Common Development Tasks

### Adding Sample Documents
Modify the `sampleDocuments` array in `src/app/api/sample-documents/route.ts` with appropriate metadata structure.

### Customizing Pipeline Logic
Update pipeline selection algorithms in `AutoPipeline` and `MetaPipeline` classes for improved query routing.

### Extending Agent Capabilities
Add new agent types by implementing the `Agent` interface and integrating with existing pipeline workflows.

### Environment Debugging
Use the `/api/status` endpoint to verify service connectivity and configuration status during development.
