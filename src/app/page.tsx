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
      case 'processing': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'completed': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'error': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <div className="flex items-center justify-center mb-2 sm:mb-4">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mr-2 sm:mr-3" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">Pulmo RAG Superbot</h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 px-2">
            Intelligent Agent-to-Agent Architecture with Real-time Thinking Process
          </p>
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Pipeline Mode:</label>
              <select
                value={pipelineMode}
                onChange={(e) => setPipelineMode(e.target.value)}
                className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Messages */}
          <div className="h-[70vh] sm:h-[600px] md:h-[700px] lg:h-[800px] xl:h-[900px] overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {/* Message */}
                <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-3xl ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                        : 'bg-purple-500 dark:bg-purple-600 text-white'
                    }`}>
                      {message.type === 'user' ? <User className="w-3 h-3 sm:w-4 sm:h-4" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </div>
                    <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
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
                  <div className="ml-6 sm:ml-11 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-700">
                    <div 
                      className="flex items-center justify-between mb-2 sm:mb-3 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-800/30 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => toggleThinkingSteps(message.id)}
                    >
                      <div className="flex items-center">
                        <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 mr-1 sm:mr-2" />
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Agent Thinking Process</h3>
                        <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">({message.thinkingSteps.length} steps)</span>
                      </div>
                      {expandedThinkingSteps[message.id] ? (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    {expandedThinkingSteps[message.id] && (
                      <div className="space-y-2 sm:space-y-3">
                        {message.thinkingSteps.map((step, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                {agentIcons[step.agent] || <Brain className="w-3 h-3 sm:w-4 sm:h-4" />}
                                <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300">{step.agent}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{step.step}</span>
                              </div>
                              <div className={`flex items-center space-x-1 px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                                {getStatusIcon(step.status)}
                                <span className="capitalize hidden sm:inline">{step.status}</span>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1 sm:mb-2">{step.message}</p>
                            {step.details && (
                              <details className="text-xs text-gray-500 dark:text-gray-400">
                                <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Show Details</summary>
                                <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs overflow-x-auto">
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
                  <div className="ml-6 sm:ml-11">
                    <div className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs sm:text-sm rounded-full">
                      <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {message.pipelineInfo}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="ml-6 sm:ml-11 mt-2 sm:mt-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-700">
                      <div className="flex items-center mb-2 sm:mb-3">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mr-1 sm:mr-2" />
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Sources ({message.sources.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {message.sources.map((source, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                                  {source.content ? source.content.substring(0, 150) + (source.content.length > 150 ? '...' : '') : 'No content available'}
                                </p>
                                {source.metadata && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-1">
                                    {source.metadata.source && (
                                      <span className="inline-block bg-gray-100 dark:bg-gray-700 px-1 sm:px-2 py-1 rounded text-xs">
                                        Source: {source.metadata.source}
                                      </span>
                                    )}
                                    {source.metadata.page && (
                                      <span className="inline-block bg-gray-100 dark:bg-gray-700 px-1 sm:px-2 py-1 rounded text-xs">
                                        Page: {source.metadata.page}
                                      </span>
                                    )}
                                    {source.metadata.chunk_id && (
                                      <span className="inline-block bg-gray-100 dark:bg-gray-700 px-1 sm:px-2 py-1 rounded text-xs">
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
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-500 dark:bg-purple-600 text-white flex items-center justify-center">
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-purple-500"></div>
                      <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-600 p-3 sm:p-4">
            <div className="flex space-x-2 sm:space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 sm:px-6 sm:py-3 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 sm:space-x-2"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}