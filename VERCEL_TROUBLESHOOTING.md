# Vercel Deployment Troubleshooting Guide

## Problem: "Answers are not received properly" on Vercel

This guide will help you fix the issue where your RAG A2A Superbot works locally but fails to provide proper answers when deployed to Vercel.

## Quick Fix Checklist

### 1. ✅ Environment Variables Setup

**CRITICAL**: You must set these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add these variables for **ALL environments** (Production, Preview, Development):

```bash
# REQUIRED - Google Gemini API
NEXT_PUBLIC_GOOGLE_API_KEY=your_actual_gemini_api_key_here

# REQUIRED - Qdrant Cloud (Vercel can't use local Qdrant)
NEXT_PUBLIC_QDRANT_CLOUD_URL=https://your-cluster-id.eu-central.aws.cloud.qdrant.io
NEXT_PUBLIC_QDRANT_CLOUD_API_KEY=your_actual_qdrant_api_key_here

# REQUIRED - Vector Store Configuration
NEXT_PUBLIC_VECTOR_STORE=qdrant
NEXT_PUBLIC_COLLECTION_NAME=rag_a2a_collection

# OPTIONAL - App Configuration
NEXT_PUBLIC_APP_NAME=RAG A2A Superbot
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_GEMINI_TEMPERATURE=0.7
NEXT_PUBLIC_GEMINI_MAX_TOKENS=2048
```

### 2. ✅ Get Required API Keys

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it as `NEXT_PUBLIC_GOOGLE_API_KEY`

#### Qdrant Cloud Account
1. Go to [Qdrant Cloud](https://cloud.qdrant.io/)
2. Sign up and create a new cluster
3. Get your cluster URL and API key
4. Add them as `NEXT_PUBLIC_QDRANT_CLOUD_URL` and `NEXT_PUBLIC_QDRANT_CLOUD_API_KEY`

### 3. ✅ Redeploy After Setting Variables

After adding environment variables:
1. Go to your Vercel project dashboard
2. Click **"Redeploy"** to apply the new environment variables
3. Wait for deployment to complete

## Step-by-Step Diagnosis

### Step 1: Check Service Status

Visit your deployed app and go to: `https://your-app.vercel.app/api/status`

You should see something like:
```json
{
  "success": true,
  "status": {
    "system": "online",
    "services": {
      "vectorStore": "online",
      "googleAI": "configured"
    },
    "configuration": {
      "hasGoogleAPIKey": true,
      "hasQdrantCloud": true,
      "isVercel": true
    }
  }
}
```

**If you see errors here, that's your problem!**

### Step 2: Test Chat API Directly

Test the chat API directly:
```bash
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test query"}'
```

Look for the `debug` section in the response to see what's configured.

### Step 3: Check Vercel Function Logs

1. Go to your Vercel project dashboard
2. Click on **"Functions"** tab
3. Click on any function to see logs
4. Look for error messages or debug information

## Common Issues and Solutions

### Issue 1: "Google API key not configured"
**Solution**: Set `NEXT_PUBLIC_GOOGLE_API_KEY` in Vercel environment variables

### Issue 2: "Qdrant connection failed"
**Solution**: 
- Set `NEXT_PUBLIC_QDRANT_CLOUD_URL` and `NEXT_PUBLIC_QDRANT_CLOUD_API_KEY`
- Make sure your Qdrant Cloud cluster is active
- Check that the URL format is correct: `https://your-cluster-id.region.aws.cloud.qdrant.io`

### Issue 3: "Vector store offline"
**Solution**: 
- Ensure `NEXT_PUBLIC_VECTOR_STORE=qdrant`
- Verify Qdrant Cloud credentials are correct
- Check that the collection exists

### Issue 4: "I'm unable to generate a response"
**Solution**: 
- Check Google Gemini API key is valid and has quota
- Verify the API key has proper permissions
- Check Vercel function logs for specific errors

### Issue 5: "No documents found" or poor answers
**Solution**: 
- Load sample documents using the "Load Sample Docs" button
- Check that documents were successfully added to Qdrant
- Verify the collection name matches your configuration

## Advanced Troubleshooting

### Check Environment Variables in Code

The app now includes debug information. When you send a message, check the response for a `debug` section:

```json
{
  "success": true,
  "answer": "...",
  "debug": {
    "isVercel": true,
    "hasGoogleAPI": true,
    "hasQdrantCloud": true,
    "vectorStoreType": "qdrant"
  }
}
```

### Test Vector Store Connection

You can test if your Qdrant Cloud is working by checking the `/api/documents` endpoint.

### Check Google Gemini API

Test your Google Gemini API key by making a direct request:
```bash
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY"
```

## Prevention Tips

1. **Always test locally first** with the same environment variables
2. **Use the same collection name** for local and production
3. **Load sample documents** after deployment
4. **Monitor Vercel function logs** regularly
5. **Set up monitoring** for API quotas and errors

## Still Having Issues?

If you're still experiencing problems:

1. **Check the Vercel function logs** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Test each service individually** using the status endpoint
4. **Compare with local setup** to identify differences
5. **Check API quotas** for Google Gemini and Qdrant Cloud

## Success Indicators

Your deployment is working correctly when:
- ✅ `/api/status` shows all services as "online" or "configured"
- ✅ Chat responses include proper answers with sources
- ✅ Agent thinking process shows multiple steps
- ✅ No errors in Vercel function logs
- ✅ Debug information shows all services are properly configured

---

**Remember**: The key difference between local and Vercel is that Vercel can't access local services like Ollama or local Qdrant. You must use cloud services (Google Gemini + Qdrant Cloud) for production deployment.
