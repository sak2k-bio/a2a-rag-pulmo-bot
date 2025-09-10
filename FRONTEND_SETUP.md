# Frontend Next.js Setup Guide - Google Gemini & Qdrant Cloud

## Overview

This guide explains how to set up the Next.js frontend with Google Gemini 1.5 Flash and Qdrant Cloud integration for the RAG A2A Superbot.

## Features

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

## Quick Start

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

## Configuration

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

## Architecture

### Frontend Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          # API route for chat
│   │   ├── page.tsx                  # Main page
│   │   └── layout.tsx                # App layout
│   └── lib/
│       ├── agents.ts                 # AI agents with Gemini integration
│       ├── vectorstore.ts            # Vector store with Qdrant Cloud
│       └── pipelines.ts              # RAG pipelines
├── config.env                        # Configuration template
├── test-gemini-qdrant.mjs           # Integration test script
└── package.json                      # Dependencies
```

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

## API Routes

### Chat API (`/api/chat`)

**POST** `/api/chat`

**Request Body:**
```json
{
  "message": "Your question here",
  "pipelineMode": "meta"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Generated answer",
  "thinkingSteps": [...],
  "pipelineInfo": "Pipeline used",
  "sources": [...],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Pipeline Modes:**
- `phase1`: Basic A2A pipeline
- `phase2`: Smart A2A pipeline with critique
- `phase3`: Self-refinement pipeline
- `auto`: Automatic pipeline selection
- `meta`: Intelligent pipeline selection (default)

## Testing

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

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run integration tests
```

### Development Workflow

1. **Start Ollama** (for local fallback):
   ```bash
   ollama serve
   ollama pull nomic-embed-text
   ollama pull gemma3:1b
   ```

2. **Configure environment**:
   ```bash
   cp config.env .env.local
   # Edit .env.local with your API keys
   ```

3. **Test integration**:
   ```bash
   npm test
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

5. **Visit application**:
   Open `http://localhost:3000`

## Production Deployment

### Environment Variables

For production, ensure all environment variables are set:

```bash
# Required
NEXT_PUBLIC_GOOGLE_API_KEY=your_production_key
NEXT_PUBLIC_VECTOR_STORE=qdrant
NEXT_PUBLIC_COLLECTION_NAME=your_collection

# Optional (for cloud features)
NEXT_PUBLIC_QDRANT_CLOUD_URL=your_cloud_url
NEXT_PUBLIC_QDRANT_CLOUD_API_KEY=your_cloud_key
```

### Build and Deploy

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Deployment Platforms

#### Vercel
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically

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

## Troubleshooting

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

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

### Logs

Check the browser console and terminal for detailed error messages.

## Performance

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

## Security

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

## Support

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
