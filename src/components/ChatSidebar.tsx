
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2,
  BarChart3,
  Calculator,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { DataRow } from '@/pages/Index';

interface ChatSidebarProps {
  data: DataRow[];
  columns: string[];
  fileName: string;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  data, 
  columns, 
  fileName, 
  onClose 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      text: `Hi! I'm your AI assistant. I can help you analyze the data from "${fileName}". You can ask me questions like:

• "What's the average value of [column name]?"
• "Show me the top 5 records"
• "What patterns do you see in the data?"
• "Summarize the key insights"

What would you like to know about your data?`,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [fileName]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const analyzeData = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Calculate basic statistics
    const numericColumns = columns.filter(col => {
      const values = data.slice(0, 10).map(row => row[col]);
      return values.every(val => typeof val === 'number' || !isNaN(Number(val)));
    });

    // Handle specific queries
    if (lowerQuery.includes('total') || lowerQuery.includes('sum')) {
      const results = numericColumns.map(col => {
        const sum = data.reduce((acc, row) => acc + (Number(row[col]) || 0), 0);
        return `${col}: ${sum.toLocaleString()}`;
      });
      return `Here are the totals:\n${results.join('\n')}`;
    }

    if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
      const results = numericColumns.map(col => {
        const values = data.map(row => Number(row[col])).filter(val => !isNaN(val));
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return `${col}: ${avg.toFixed(2)}`;
      });
      return `Here are the averages:\n${results.join('\n')}`;
    }

    if (lowerQuery.includes('maximum') || lowerQuery.includes('max') || lowerQuery.includes('highest')) {
      const results = numericColumns.map(col => {
        const values = data.map(row => Number(row[col])).filter(val => !isNaN(val));
        const max = Math.max(...values);
        return `${col}: ${max.toLocaleString()}`;
      });
      return `Here are the maximum values:\n${results.join('\n')}`;
    }

    if (lowerQuery.includes('minimum') || lowerQuery.includes('min') || lowerQuery.includes('lowest')) {
      const results = numericColumns.map(col => {
        const values = data.map(row => Number(row[col])).filter(val => !isNaN(val));
        const min = Math.min(...values);
        return `${col}: ${min.toLocaleString()}`;
      });
      return `Here are the minimum values:\n${results.join('\n')}`;
    }

    if (lowerQuery.includes('count') || lowerQuery.includes('how many')) {
      return `Your dataset contains ${data.length} records with ${columns.length} columns.`;
    }

    if (lowerQuery.includes('columns') || lowerQuery.includes('fields')) {
      return `Your data has ${columns.length} columns:\n${columns.join(', ')}`;
    }

    if (lowerQuery.includes('top') || lowerQuery.includes('first')) {
      const num = parseInt(lowerQuery.match(/\d+/)?.[0] || '5');
      const topRecords = data.slice(0, num);
      const summary = topRecords.map((row, i) => 
        `Record ${i + 1}: ${columns.slice(0, 3).map(col => `${col}: ${row[col]}`).join(', ')}`
      ).join('\n');
      return `Here are the top ${num} records:\n${summary}`;
    }

    if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('insights')) {
      const categoricalColumns = columns.filter(col => 
        !numericColumns.includes(col)
      );

      let summary = `📊 **Data Summary for ${fileName}**\n\n`;
      summary += `📈 **Dataset Overview:**\n`;
      summary += `• Total records: ${data.length}\n`;
      summary += `• Total columns: ${columns.length}\n`;
      summary += `• Numeric columns: ${numericColumns.length}\n`;
      summary += `• Categorical columns: ${categoricalColumns.length}\n\n`;

      if (numericColumns.length > 0) {
        summary += `🔢 **Numeric Analysis:**\n`;
        numericColumns.slice(0, 3).forEach(col => {
          const values = data.map(row => Number(row[col])).filter(val => !isNaN(val));
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const max = Math.max(...values);
          const min = Math.min(...values);
          summary += `• ${col}: Avg ${avg.toFixed(2)}, Range ${min}-${max}\n`;
        });
      }

      return summary;
    }

    // Default response
    return `I can help you analyze your data from "${fileName}" which contains ${data.length} records and ${columns.length} columns. Try asking me about:

• Statistical summaries (average, total, max, min)
• Data counts and distributions  
• Top records or specific values
• Column information
• Data insights and patterns

What specific aspect would you like to explore?`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse = analyzeData(inputText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What's the summary of this data?",
    "Show me the averages",
    "What are the column names?",
    "How many records are there?",
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur-md border-l border-gray-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-blue-100 text-sm">
          Ask questions about your data
        </p>
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.text}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Analyzing data...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick questions:</p>
          <div className="space-y-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputText(question)}
                className="w-full text-left text-sm p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your data..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
