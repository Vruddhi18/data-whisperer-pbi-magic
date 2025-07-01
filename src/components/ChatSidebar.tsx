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
    // Enhanced welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      text: `Hey there! 👋 I'm your AI data analyst, and I'm excited to help you explore "${fileName}"! 

I can answer questions like:
• "Which month had the maximum revenue?" 📈
• "When did we cross our planned revenue?" 🎯
• "What's the trend in our sales data?" 📊
• "Compare actual vs planned performance" ⚖️
• "Show me insights about [specific metric]" 💡

I've analyzed your data and I'm ready to dive deep into any patterns or insights you're curious about. What would you like to discover first?`,
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

  const findBestMatchingColumn = (keywords: string[]): string | null => {
    const lowerColumns = columns.map(col => col.toLowerCase());
    
    for (const keyword of keywords) {
      const match = lowerColumns.find(col => col.includes(keyword.toLowerCase()));
      if (match) {
        return columns[lowerColumns.indexOf(match)];
      }
    }
    return null;
  };

  const getMonthFromRow = (row: DataRow): string | null => {
    // Look for month/date columns and extract month
    const monthColumns = columns.filter(col => 
      col.toLowerCase().includes('month') || 
      col.toLowerCase().includes('date') ||
      col.toLowerCase().includes('time') ||
      col.toLowerCase().includes('period')
    );
    
    for (const col of monthColumns) {
      const value = String(row[col]);
      if (value) {
        // Handle various month formats
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                          'july', 'august', 'september', 'october', 'november', 'december'];
        const monthAbbrev = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                           'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        
        const lowerValue = value.toLowerCase();
        
        // Check for full month names
        for (let i = 0; i < monthNames.length; i++) {
          if (lowerValue.includes(monthNames[i]) || lowerValue.includes(monthAbbrev[i])) {
            return monthNames[i].charAt(0).toUpperCase() + monthNames[i].slice(1);
          }
        }
        
        // If it's a date, try to parse it
        if (value.includes('/') || value.includes('-')) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleString('default', { month: 'long' });
          }
        }
        
        // Return the original value if it seems to be a month identifier
        return value;
      }
    }
    return null;
  };

  const analyzeData = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Calculate basic statistics
    const numericColumns = columns.filter(col => {
      const values = data.slice(0, 10).map(row => row[col]);
      return values.every(val => typeof val === 'number' || !isNaN(Number(val)));
    });

    // Enhanced query handling with friendlier responses
    
    // Maximum revenue analysis
    if (lowerQuery.includes('max') && (lowerQuery.includes('revenue') || lowerQuery.includes('sales'))) {
      const revenueCol = findBestMatchingColumn(['revenue', 'sales', 'income', 'earnings']);
      
      if (revenueCol) {
        let maxRevenue = -Infinity;
        let maxMonth = '';
        let maxRow: DataRow | null = null;
        
        data.forEach(row => {
          const revenue = Number(row[revenueCol]);
          if (!isNaN(revenue) && revenue > maxRevenue) {
            maxRevenue = revenue;
            maxMonth = getMonthFromRow(row) || 'Unknown';
            maxRow = row;
          }
        });
        
        return `🎉 Great question! The highest revenue of **${maxRevenue.toLocaleString()}** was achieved in **${maxMonth}**! 

That's quite impressive! Would you like me to analyze what might have contributed to this peak performance? 📈`;
      }
    }

    // Plan vs actual revenue crossing analysis
    if ((lowerQuery.includes('cross') || lowerQuery.includes('exceed') || lowerQuery.includes('beat')) && 
        (lowerQuery.includes('plan') || lowerQuery.includes('target') || lowerQuery.includes('goal'))) {
      
      const actualCol = findBestMatchingColumn(['actual', 'real', 'achieved', 'revenue', 'sales']);
      const planCol = findBestMatchingColumn(['plan', 'planned', 'target', 'goal', 'budget']);
      
      if (actualCol && planCol) {
        const crossingMonths: string[] = [];
        
        data.forEach(row => {
          const actual = Number(row[actualCol]);
          const planned = Number(row[planCol]);
          const month = getMonthFromRow(row);
          
          if (!isNaN(actual) && !isNaN(planned) && actual > planned && month) {
            crossingMonths.push(`${month} (${actual.toLocaleString()} vs ${planned.toLocaleString()})`);
          }
        });
        
        if (crossingMonths.length > 0) {
          return `🎯 Excellent performance! You exceeded your planned revenue in these months:

${crossingMonths.map(month => `✅ ${month}`).join('\n')}

That's ${crossingMonths.length} month${crossingMonths.length > 1 ? 's' : ''} of beating your targets! Keep up the great work! 🚀`;
        } else {
          return `🎯 Based on my analysis, it looks like the planned targets haven't been exceeded yet in the data I can see. But don't worry - this gives us great insight into areas for improvement! 

Would you like me to analyze how close you came to your targets in different months? 📊`;
        }
      }
    }

    // Revenue trend analysis
    if ((lowerQuery.includes('trend') || lowerQuery.includes('pattern') || lowerQuery.includes('over time')) && 
        (lowerQuery.includes('revenue') || lowerQuery.includes('sales'))) {
      
      const revenueCol = findBestMatchingColumn(['revenue', 'sales', 'income']);
      
      if (revenueCol) {
        const monthlyData: { month: string; revenue: number }[] = [];
        
        data.forEach(row => {
          const revenue = Number(row[revenueCol]);
          const month = getMonthFromRow(row);
          
          if (!isNaN(revenue) && month) {
            monthlyData.push({ month, revenue });
          }
        });
        
        if (monthlyData.length > 1) {
          const isIncreasing = monthlyData[monthlyData.length - 1].revenue > monthlyData[0].revenue;
          const avgRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0) / monthlyData.length;
          
          return `📈 Here's what I found about your revenue trend:

**Overall Direction:** ${isIncreasing ? '📈 Upward trend - great job!' : '📉 Needs attention'}
**Average Revenue:** ${avgRevenue.toFixed(0).toLocaleString()}
**Best Month:** ${monthlyData.reduce((max, current) => current.revenue > max.revenue ? current : max).month}
**Total Months Analyzed:** ${monthlyData.length}

${isIncreasing ? 'Your revenue is growing - keep up the momentum! 🚀' : 'There are opportunities to boost performance. Would you like me to analyze potential improvement areas? 💡'}`;
        }
      }
    }

    // Handle comparison questions
    if (lowerQuery.includes('compare') && (lowerQuery.includes('actual') || lowerQuery.includes('plan'))) {
      const actualCol = findBestMatchingColumn(['actual', 'real', 'achieved']);
      const planCol = findBestMatchingColumn(['plan', 'planned', 'target']);
      
      if (actualCol && planCol) {
        const totalActual = data.reduce((sum, row) => sum + (Number(row[actualCol]) || 0), 0);
        const totalPlanned = data.reduce((sum, row) => sum + (Number(row[planCol]) || 0), 0);
        const variance = totalActual - totalPlanned;
        const variancePercent = ((variance / totalPlanned) * 100).toFixed(1);
        
        return `⚖️ Here's your Plan vs Actual comparison:

**Total Planned:** ${totalPlanned.toLocaleString()}
**Total Actual:** ${totalActual.toLocaleString()}
**Variance:** ${variance.toLocaleString()} (${variancePercent}%)

${variance > 0 ? 
  `🎉 Fantastic! You're ${variancePercent}% ahead of plan!` : 
  `📊 You're ${Math.abs(Number(variancePercent))}% below plan - let's find opportunities to close this gap!`}

Would you like me to break this down by month to see where the biggest opportunities are? 🔍`;
      }
    }

    // Handle specific queries
    if (lowerQuery.includes('total') || lowerQuery.includes('sum')) {
      const results = numericColumns.slice(0, 3).map(col => {
        const sum = data.reduce((acc, row) => acc + (Number(row[col]) || 0), 0);
        return `**${col}:** ${sum.toLocaleString()}`;
      });
      return `💰 Here are your totals:\n\n${results.join('\n')}\n\nThese numbers tell an interesting story! Want me to dive deeper into any specific metric? 🤔`;
    }

    if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
      const results = numericColumns.slice(0, 3).map(col => {
        const values = data.map(row => Number(row[col])).filter(val => !isNaN(val));
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return `**${col}:** ${avg.toFixed(2)}`;
      });
      return `📊 Here are your averages:\n\n${results.join('\n')}\n\nAverages give us a great baseline - would you like to see which months performed above or below these averages? 📈`;
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
      const revenueCol = findBestMatchingColumn(['revenue', 'sales', 'income']);
      const planCol = findBestMatchingColumn(['plan', 'planned', 'target']);
      
      let summary = `🎯 **Smart Analysis for ${fileName}**\n\n`;
      summary += `📈 **Quick Stats:**\n`;
      summary += `• ${data.length} records analyzed\n`;
      summary += `• ${numericColumns.length} key metrics tracked\n\n`;

      if (revenueCol) {
        const totalRevenue = data.reduce((sum, row) => sum + (Number(row[revenueCol]) || 0), 0);
        const avgRevenue = totalRevenue / data.length;
        summary += `💰 **Revenue Insights:**\n`;
        summary += `• Total Revenue: ${totalRevenue.toLocaleString()}\n`;
        summary += `• Average per Period: ${avgRevenue.toFixed(0)}\n\n`;
      }

      if (planCol && revenueCol) {
        const totalPlan = data.reduce((sum, row) => sum + (Number(row[planCol]) || 0), 0);
        const totalRevenue = data.reduce((sum, row) => sum + (Number(row[revenueCol]) || 0), 0);
        const performanceRatio = ((totalRevenue / totalPlan) * 100).toFixed(1);
        summary += `🎯 **Performance vs Plan:** ${performanceRatio}%\n\n`;
      }

      summary += `💡 **What would you like to explore next?**\n`;
      summary += `• Monthly performance trends\n`;
      summary += `• Best and worst performing periods\n`;
      summary += `• Opportunities for improvement\n`;

      return summary;
    }

    // Enhanced default response
    return `🤔 That's an interesting question! I have access to your data from "${fileName}" with ${data.length} records. 

I'm especially good at analyzing:
• 📈 **Revenue patterns** - "Which month had the highest sales?"
• 🎯 **Performance vs targets** - "When did we exceed our goals?"
• 📊 **Trends and comparisons** - "How are we trending over time?"
• 💡 **Business insights** - "What patterns do you see?"

Could you rephrase your question or try one of these examples? I'm here to help you uncover valuable insights! ✨`;
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

    // Simulate AI processing delay with more realistic timing
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
    }, 800 + Math.random() * 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Which month had the maximum revenue?",
    "When did we cross our planned targets?",
    "What's the revenue trend over time?",
    "Compare actual vs planned performance",
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur-md border-l border-gray-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Data Analyst
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
          Your smart data companion 🚀
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
                    <span className="text-sm text-gray-600">Analyzing your data... 🧠</span>
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
          <p className="text-sm font-medium text-gray-700 mb-2">🚀 Try these smart questions:</p>
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
            placeholder="Ask me anything about your data... 💬"
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
