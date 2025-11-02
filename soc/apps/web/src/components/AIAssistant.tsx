import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAction {
  type: 'analyze' | 'investigate' | 'automate' | 'alert';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your SOC AI Assistant. I can help you analyze threats, investigate incidents, and automate responses. How can I assist you today?',
      timestamp: new Date(),
      suggestions: [
        'Analyze recent alerts',
        'Check system health',
        'Investigate suspicious activity',
        'Create automation rule'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = async (userMessage: string): Promise<{ response: string; actions?: AIAction[] }> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Mock AI responses based on user input
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('alert') || lowerMessage.includes('threat')) {
      return {
        response: 'I\'ve analyzed the recent alerts. Found 3 high-priority threats that require immediate attention. Two are related to suspicious network activity, and one involves potential malware communication.',
        actions: [
          {
            type: 'investigate',
            description: 'Investigate suspicious network connections from IP 192.168.1.100',
            priority: 'high'
          },
          {
            type: 'analyze',
            description: 'Analyze malware sample hash: a1b2c3d4e5f6...',
            priority: 'critical'
          }
        ]
      };
    }

    if (lowerMessage.includes('health') || lowerMessage.includes('system')) {
      return {
        response: 'System health check completed. All critical tools are operational. Some performance degradation detected on the Wazuh indexer - recommend scaling resources.',
        actions: [
          {
            type: 'alert',
            description: 'Monitor Wazuh indexer performance',
            priority: 'medium'
          }
        ]
      };
    }

    if (lowerMessage.includes('investigate') || lowerMessage.includes('activity')) {
      return {
        response: 'Investigation initiated. Found correlated events across multiple tools. Pattern suggests potential lateral movement within the network. Recommend isolating affected systems.',
        actions: [
          {
            type: 'automate',
            description: 'Create automated response for lateral movement detection',
            priority: 'high'
          }
        ]
      };
    }

    return {
      response: 'I understand your request. Let me help you with that. Based on current system data, I recommend checking the recent metrics and alert dashboard for more context.',
      actions: [
        {
          type: 'analyze',
          description: 'Review system metrics and alerts',
          priority: 'low'
        }
      ]
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await simulateAIResponse(input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        suggestions: aiResponse.actions?.map(action => action.description).slice(0, 3)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <Info className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Intelligent SOC assistance and automation
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Bot className="h-3 w-3" />
          <span>Online</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>Chat with your SOC AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map(message => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex space-x-2 mt-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your SOC..."
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>AI-suggested actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Analyze Recent Alerts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Run Health Check
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bot className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Model Status</span>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="text-sm text-gray-600">1.2s avg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Queries Today</span>
                  <span className="text-sm text-gray-600">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Actions Taken</span>
                  <span className="text-sm text-gray-600">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};