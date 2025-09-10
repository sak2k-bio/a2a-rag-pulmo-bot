// Test script for RAG A2A Superbot integration
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing RAG A2A Superbot Integration...\n');

  try {
    // Test 1: Status check
    console.log('1️⃣ Testing status endpoint...');
    const statusResponse = await axios.get(`${BASE_URL}/api/status`);
    console.log('✅ Status:', statusResponse.data.status);
    console.log('   Services:', statusResponse.data.status.services);
    console.log('');

    // Test 2: Load sample documents
    console.log('2️⃣ Loading sample documents...');
    const docsResponse = await axios.post(`${BASE_URL}/api/sample-documents`);
    console.log('✅ Documents loaded:', docsResponse.data.message);
    console.log('   Document count:', docsResponse.data.documentCount);
    console.log('');

    // Test 3: Test chat with different pipeline modes
    const testQueries = [
      { query: 'What is artificial intelligence?', mode: 'phase1' },
      { query: 'Explain the difference between machine learning and deep learning', mode: 'phase2' },
      { query: 'How does RAG work and why is it important?', mode: 'phase3' },
      { query: 'Compare vector databases', mode: 'auto' },
      { query: 'What are the benefits of agent-to-agent architecture?', mode: 'meta' }
    ];

    for (let i = 0; i < testQueries.length; i++) {
      const { query, mode } = testQueries[i];
      console.log(`${i + 3}️⃣ Testing chat with ${mode} pipeline...`);
      console.log(`   Query: "${query}"`);
      
      const chatResponse = await axios.post(`${BASE_URL}/api/chat`, {
        message: query,
        pipelineMode: mode
      });
      
      if (chatResponse.data.success) {
        console.log('✅ Response received');
        console.log(`   Answer: ${chatResponse.data.answer.substring(0, 100)}...`);
        console.log(`   Pipeline: ${chatResponse.data.pipelineInfo}`);
        console.log(`   Thinking steps: ${chatResponse.data.thinkingSteps.length}`);
      } else {
        console.log('❌ Chat failed:', chatResponse.data.error);
      }
      console.log('');
    }

    // Test 4: Test document upload
    console.log('9️⃣ Testing document upload...');
    const uploadResponse = await axios.post(`${BASE_URL}/api/documents`, {
      documents: [
        {
          content: 'This is a test document for the RAG system.',
          metadata: { title: 'Test Document', category: 'Test' }
        }
      ]
    });
    
    if (uploadResponse.data.success) {
      console.log('✅ Document uploaded successfully');
    } else {
      console.log('❌ Document upload failed:', uploadResponse.data.error);
    }
    console.log('');

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run tests
testAPI();
