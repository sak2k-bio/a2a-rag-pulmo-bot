'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Brain, Search, FileText, MessageSquare, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface ThinkingStep {
  agent: string;
  step: string;
  status: 'processing' | 'completed' | 'error';
  message: string;
  details?: any;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  thinkingSteps?: ThinkingStep[];
  pipelineInfo?: string;
  sources?: any[];
}

const agentIcons: Record<string, React.ReactNode> = {
  'QueryAgent': <Search className="w-4 h-4" />,
  'RetrievalAgent': <FileText className="w-4 h-4" />,
  'AnswerAgent': <MessageSquare className="w-4 h-4" />,
  'CriticAgent': <AlertCircle className="w-4 h-4" />,
  'RefineAgent': <CheckCircle className="w-4 h-4" />,
  'ContextOptimizerAgent': <Brain className="w-4 h-4" />,
  'SelfEvaluationAgent': <CheckCircle className="w-4 h-4" />,
  'DynamicRetrievalAgent': <FileText className="w-4 h-4" />,
  'QueryPreprocessorAgent': <Search className="w-4 h-4" />,
  'Pipeline': <Brain className="w-4 h-4" />
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your RAG A2A Superbot. I can help you with questions using my advanced agent-based architecture. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineMode, setPipelineMode] = useState('meta');
  const [expandedThinkingSteps, setExpandedThinkingSteps] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input.trim(), 
          pipelineMode: pipelineMode 
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: data.answer,
          timestamp: new Date(),
          thinkingSteps: data.thinkingSteps || [],
          pipelineInfo: data.pipelineInfo,
          sources: data.sources || []
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'error': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const toggleThinkingSteps = (messageId: string) => {
    setExpandedThinkingSteps(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Consistent timestamp formatting to prevent hydration errors
  const formatTimestamp = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const displaySeconds = seconds.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes}:${displaySeconds} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Pulmo RAG Superbot</h1>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Intelligent Agent-to-Agent Architecture with Real-time Thinking Process
          </p>
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Pipeline Mode:</label>
              <select
                value={pipelineMode}
                onChange={(e) => setPipelineMode(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="phase1">Phase 1: Basic A2A</option>
                <option value="phase2">Phase 2: Smart A2A</option>
                <option value="phase3">Phase 3: Self-Refinement</option>
                <option value="auto">AUTO: AI Selects Optimal</option>
                <option value="meta">META: Intelligent Selection</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Messages */}
          <div className="h-[1100px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {/* Message */}
                <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-3 max-w-3xl ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }`}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {isClient && (
                        <p className="text-xs opacity-70 mt-1">
                          {formatTimestamp(message.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thinking Steps */}
                {message.thinkingSteps && message.thinkingSteps.length > 0 && (
                  <div className="ml-11 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                    <div 
                      className="flex items-center justify-between mb-3 cursor-pointer hover:bg-purple-100 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => toggleThinkingSteps(message.id)}
                    >
                      <div className="flex items-center">
                        <Brain className="w-5 h-5 text-purple-600 mr-2" />
                        <h3 className="font-semibold text-gray-800">Agent Thinking Process</h3>
                        <span className="ml-2 text-sm text-gray-500">({message.thinkingSteps.length} steps)</span>
                      </div>
                      {expandedThinkingSteps[message.id] ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    {expandedThinkingSteps[message.id] && (
                      <div className="space-y-3">
                        {message.thinkingSteps.map((step, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {agentIcons[step.agent] || <Brain className="w-4 h-4" />}
                                <span className="font-medium text-sm text-gray-700">{step.agent}</span>
                                <span className="text-xs text-gray-500">{step.step}</span>
                              </div>
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                                {getStatusIcon(step.status)}
                                <span className="capitalize">{step.status}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{step.message}</p>
                            {step.details && (
                              <details className="text-xs text-gray-500">
                                <summary className="cursor-pointer hover:text-gray-700">Show Details</summary>
                                <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(step.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pipeline Info */}
                {message.pipelineInfo && (
                  <div className="ml-11">
                    <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      <Brain className="w-4 h-4 mr-1" />
                      {message.pipelineInfo}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="ml-11 mt-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center mb-3">
                        <FileText className="w-5 h-5 text-green-600 mr-2" />
                        <h3 className="font-semibold text-gray-800">Sources ({message.sources.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {message.sources.map((source, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-700 mb-2">
                                  {source.content ? source.content.substring(0, 200) + (source.content.length > 200 ? '...' : '') : 'No content available'}
                                </p>
                                {source.metadata && (
                                  <div className="text-xs text-gray-500">
                                    {source.metadata.source && (
                                      <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                        Source: {source.metadata.source}
                                      </span>
                                    )}
                                    {source.metadata.page && (
                                      <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                        Page: {source.metadata.page}
                                      </span>
                                    )}
                                    {source.metadata.chunk_id && (
                                      <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                                        Chunk: {source.metadata.chunk_id}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                      <span className="text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}