# Vercel Deployment Guide

This guide will help you deploy the RAG A2A Superbot frontend to Vercel.

## Prerequisites

1. **Google Gemini API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Qdrant Cloud Account**: Sign up at [Qdrant Cloud](https://cloud.qdrant.io/) and create a cluster
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verify Files**: Ensure these files are in your repository:
   - `vercel.json`
   - `next.config.ts`
   - `package.json`
   - `src/` directory with all source code

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (if your frontend is in a subdirectory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set root directory (if needed)
   - Configure environment variables

## Step 3: Configure Environment Variables

In your Vercel dashboard, go to **Settings > Environment Variables** and add:

### Required Variables

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

# App Configuration
NEXT_PUBLIC_APP_NAME=RAG A2A Superbot
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Environment-Specific Settings

- **Production**: Set all variables for production environment
- **Preview**: Set all variables for preview environment
- **Development**: Set all variables for development environment

## Step 4: Deploy and Test

1. **Trigger Deployment**:
   - If using dashboard: Click "Deploy"
   - If using CLI: `vercel --prod`

2. **Monitor Build**:
   - Check the build logs for any errors
   - Ensure all dependencies are installed correctly

3. **Test Your Application**:
   - Visit your deployed URL
   - Test the chat functionality
   - Verify environment variables are loaded

## Step 5: Post-Deployment Setup

### 1. Load Sample Documents

1. Visit your deployed application
2. Click "Load Sample Docs" to populate the knowledge base
3. Verify documents are loaded successfully

### 2. Test Different Pipeline Modes

1. Try different pipeline modes:
   - Phase 1: Basic A2A
   - Phase 2: Smart A2A
   - Phase 3: Self-Refinement
   - AUTO: AI Selects Optimal
   - META: Intelligent Selection

### 3. Monitor Performance

1. Check Vercel Analytics for performance metrics
2. Monitor API response times
3. Check for any errors in the logs

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Error**: `Module not found` or `Build failed`
**Solution**: 
- Check that all dependencies are in `package.json`
- Ensure TypeScript compilation passes locally
- Check for any missing imports

#### 2. Environment Variables Not Loading

**Error**: `NEXT_PUBLIC_GOOGLE_API_KEY not found`
**Solution**:
- Ensure variables start with `NEXT_PUBLIC_`
- Check that variables are set in Vercel dashboard
- Redeploy after adding variables

#### 3. API Route Errors

**Error**: `500 Internal Server Error`
**Solution**:
- Check Vercel function logs
- Verify API key permissions
- Ensure Qdrant Cloud credentials are correct

#### 4. Vector Store Issues

**Error**: `Qdrant connection failed`
**Solution**:
- Verify Qdrant Cloud URL and API key
- Check collection name is correct
- Ensure Qdrant cluster is active

### Debug Steps

1. **Check Build Logs**:
   ```bash
   vercel logs [deployment-url]
   ```

2. **Test Locally**:
   ```bash
   npm run build
   npm run start
   ```

3. **Verify Environment Variables**:
   - Check Vercel dashboard
   - Test with a simple API endpoint

## Performance Optimization

### 1. Enable Vercel Analytics

1. Go to your project dashboard
2. Navigate to Analytics
3. Enable Web Analytics and Speed Insights

### 2. Optimize Bundle Size

1. Use dynamic imports for heavy components
2. Optimize images with Next.js Image component
3. Remove unused dependencies

### 3. Configure Caching

1. Set appropriate cache headers
2. Use Vercel's Edge Network
3. Implement response caching where appropriate

## Security Considerations

### 1. API Key Security

- Never expose API keys in client-side code
- Use environment variables for all sensitive data
- Rotate API keys regularly

### 2. CORS Configuration

- Configure CORS headers appropriately
- Restrict origins in production
- Use HTTPS for all communications

### 3. Rate Limiting

- Implement rate limiting for API routes
- Monitor for unusual traffic patterns
- Set appropriate limits

## Monitoring and Maintenance

### 1. Set Up Monitoring

1. **Vercel Analytics**: Monitor performance and errors
2. **External Monitoring**: Use services like Sentry for error tracking
3. **Uptime Monitoring**: Monitor application availability

### 2. Regular Maintenance

1. **Update Dependencies**: Keep packages up to date
2. **Monitor API Usage**: Track Google Gemini and Qdrant usage
3. **Review Logs**: Regularly check for errors or issues

### 3. Scaling Considerations

1. **Function Limits**: Be aware of Vercel function limits
2. **Database Scaling**: Consider Qdrant Cloud scaling options
3. **CDN Usage**: Optimize static asset delivery

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel documentation
3. Check the application logs
4. Verify all environment variables are set correctly

---

Your RAG A2A Superbot should now be successfully deployed on Vercel! 🚀
