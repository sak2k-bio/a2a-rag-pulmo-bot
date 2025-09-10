# RAG A2A Superbot - Frontend

A Next.js frontend application that integrates the RAG A2A Superbot backend directly into API routes, providing a seamless chat interface with intelligent agent-based responses powered by Google Gemini 1.5 Flash and Qdrant Cloud.

## 🚀 Features

### ✅ Google Gemini 1.5 Flash Integration
- **Model**: `gemini-1.5-flash` (configurable)
- **Temperature**: 0.7 (configurable)
- **Max Tokens**: 2048 (configurable)
- **Fallback**: Automatic fallback to Ollama if Gemini fails
- **Error Handling**: Comprehensive error handling and logging

### ✅ Qdrant Cloud Database Support
- **Cloud Support**: Full Qdrant Cloud integration with API key authentication
- **Local Support**: Maintains compatibility with local Qdrant instances
- **Auto-Detection**: Automatically detects and uses cloud vs local based on configuration
- **Security**: Secure API key management through environment variables

### ✅ Advanced RAG Capabilities
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

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
# Copy the configuration template
cp config.env .env.local

# Edit .env.local with your API keys
nano .env.local
```

### 3. Test Integration

```bash
# Run the integration test
npm test
```

### 4. Start Development Server

```bash
# Start the Next.js development server
npm run dev
```

Visit `http://localhost:3000` to see your RAG application.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```bash
# Google Gemini Configuration
NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_GEMINI_TEMPERATURE=0.7
NEXT_PUBLIC_GEMINI_MAX_TOKENS=2048

# Qdrant Cloud Configuration
NEXT_PUBLIC_QDRANT_CLOUD_URL=https://your-cluster-id.eu-central.aws.cloud.qdrant.io
NEXT_PUBLIC_QDRANT_CLOUD_API_KEY=your_qdrant_cloud_api_key_here

# Vector Store Configuration
NEXT_PUBLIC_VECTOR_STORE=qdrant
NEXT_PUBLIC_COLLECTION_NAME=rag_a2a_collection

# Fallback Configuration (for local development)
NEXT_PUBLIC_QDRANT_HOST=localhost
NEXT_PUBLIC_QDRANT_PORT=6333
NEXT_PUBLIC_OLLAMA_HOST=http://localhost:11434

# Chroma Configuration (if using Chroma)
NEXT_PUBLIC_CHROMA_PATH=./chroma_db
```

### Getting API Keys

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file as `NEXT_PUBLIC_GOOGLE_API_KEY`

#### Qdrant Cloud API Key
1. Go to [Qdrant Cloud](https://cloud.qdrant.io/)
2. Sign up or sign in to your account
3. Create a new cluster
4. Go to your cluster dashboard
5. Copy the cluster URL and API key
6. Add them to your `.env.local` file as `NEXT_PUBLIC_QDRANT_CLOUD_URL` and `NEXT_PUBLIC_QDRANT_CLOUD_API_KEY`

## 🧪 Testing

### Run Integration Tests

```bash
# Test all components
npm test

# Test specific components
node test-gemini-qdrant.mjs
```

### Test Results

The test script will verify:
- ✅ Google Gemini API connectivity
- ✅ Qdrant Cloud/Local connectivity
- ✅ Ollama fallback functionality
- ✅ Embedding generation
- ✅ Environment variable configuration
- ✅ End-to-end integration

### Manual Testing

1. **Load Sample Documents**: Click the "Load Sample Docs" button to populate the knowledge base
2. **Test Different Pipelines**: Try different pipeline modes with various queries
3. **Observe Thinking Process**: Watch the real-time agent thinking steps

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

## 🏗️ Architecture Details

### Vector Store Selection Logic

```typescript
// Automatic detection based on environment variables
if (QDRANT_CLOUD_URL && QDRANT_CLOUD_API_KEY) {
  // Use Qdrant Cloud
  client = new QdrantClient({
    url: QDRANT_CLOUD_URL,
    apiKey: QDRANT_CLOUD_API_KEY
  });
} else {
  // Use local Qdrant
  client = new QdrantClient({
    host: QDRANT_HOST,
    port: QDRANT_PORT
  });
}
```

### LLM Selection Logic

```typescript
// Try Google Gemini first
if (genAI) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: GEMINI_TEMPERATURE,
        maxOutputTokens: GEMINI_MAX_TOKENS,
      }
    });
    return await model.generateContent(prompt);
  } catch (error) {
    // Fallback to Ollama
    return await ollamaGenerate(prompt);
  }
}
```

### Vector Store Options

**Qdrant Cloud (Recommended)**:
- High-performance vector search
- Scalable cloud infrastructure
- Enterprise-grade security
- Automatic backups and monitoring

**Qdrant Local**:
- Local processing
- Good for development
- Requires separate Qdrant server

**Chroma (Fallback)**:
- Lightweight and easy to use
- Good for development and testing
- Stores data locally

### LLM Configuration

**Google Gemini 1.5 Flash** (Primary):
- High-quality responses
- Fast processing
- Configurable parameters
- Automatic fallback to Ollama

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
│       ├── agents.ts                  # AI agents with Gemini integration
│       ├── pipelines.ts               # RAG pipelines
│       └── vectorstore.ts             # Vector store with Qdrant Cloud
├── config.env                         # Configuration template
├── test-gemini-qdrant.mjs            # Integration test script
├── test-integration.js                # Legacy integration test
└── README.md                          # This file
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
```
Error: NEXT_PUBLIC_GOOGLE_API_KEY not found
```
**Solution**: Ensure variables start with `NEXT_PUBLIC_` and are in `.env.local`

#### 2. CORS Issues
```
Error: CORS policy blocked
```
**Solution**: Check that Ollama is running and accessible

#### 3. Qdrant Connection Issues
```
Error: Qdrant connection failed
```
**Solution**: Verify your Qdrant Cloud credentials or local Qdrant instance

#### 4. Gemini API Issues
```
Error: Google Gemini API failed
```
**Solution**: Check your API key and quota limits

#### 5. Ollama Connection Failed
```
Error: Ollama connection failed
```
**Solution**: Ensure Ollama is running: `ollama serve`

#### 6. Vector Store Initialization Failed
```
Error: Vector store initialization failed
```
**Solution**: Check vector store configuration and permissions

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

### Logs

Check the browser console and terminal for detailed error messages.

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

1. **Caching**: Implement response caching for repeated queries
2. **Streaming**: Use streaming for long responses
3. **CDN**: Use a CDN for static assets
4. **Database**: Optimize vector database queries

### Monitoring

Monitor key metrics:
- API response times
- Error rates
- Token usage (Gemini)
- Vector search performance

Check system status at `/api/status` to monitor:
- Vector store connectivity
- Ollama service status
- Google AI configuration
- Overall system health

## 🚀 Vercel Deployment (Recommended)

### Quick Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `frontend` (if needed)

3. **Configure Environment Variables**:
   ```bash
   # Required for Vercel
   NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_QDRANT_CLOUD_URL=your_qdrant_cloud_url
   NEXT_PUBLIC_QDRANT_CLOUD_API_KEY=your_qdrant_cloud_key
   NEXT_PUBLIC_VECTOR_STORE=qdrant
   NEXT_PUBLIC_COLLECTION_NAME=rag_a2a_collection
   ```

4. **Deploy**: Click "Deploy" and wait for completion

### Vercel CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel

# Deploy to production
vercel --prod
```

### Environment Variables for Vercel

For production, ensure all environment variables are set in Vercel dashboard:

```bash
# Google Gemini Configuration
NEXT_PUBLIC_GOOGLE_API_KEY=your_production_key
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_GEMINI_TEMPERATURE=0.7
NEXT_PUBLIC_GEMINI_MAX_TOKENS=2048

# Qdrant Cloud Configuration (Required for Vercel)
NEXT_PUBLIC_QDRANT_CLOUD_URL=your_cloud_url
NEXT_PUBLIC_QDRANT_CLOUD_API_KEY=your_cloud_key

# Vector Store Configuration
NEXT_PUBLIC_VECTOR_STORE=qdrant
NEXT_PUBLIC_COLLECTION_NAME=your_collection

# App Configuration
NEXT_PUBLIC_APP_NAME=RAG A2A Superbot
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Build and Deploy Locally

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Other Deployment Platforms

#### Netlify
1. Connect your GitHub repository
2. Set environment variables in Netlify dashboard
3. Deploy automatically

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 📋 Vercel Deployment Checklist

- [ ] Google Gemini API key configured
- [ ] Qdrant Cloud account and cluster created
- [ ] All environment variables set in Vercel dashboard
- [ ] Repository pushed to GitHub
- [ ] Vercel project connected to GitHub repository
- [ ] Build completed successfully
- [ ] Application tested on deployed URL

## 🔒 Security

### API Key Management
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Monitor API usage

### Network Security
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs
- Monitor for unusual activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

### Getting Help

1. Check the troubleshooting section
2. Review the test results
3. Check browser console for errors
4. Verify environment configuration

### Common Solutions

- **API Key Issues**: Verify keys are correct and have proper permissions
- **Connection Issues**: Check network connectivity and service availability
- **Configuration Issues**: Ensure all required environment variables are set

---

This setup provides a robust, scalable frontend for your RAG A2A Superbot with enterprise-grade LLM and vector database capabilities.

**Happy chatting with your RAG A2A Superbot!** 🤖✨