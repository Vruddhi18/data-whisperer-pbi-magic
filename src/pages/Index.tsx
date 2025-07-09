import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExcelUploader from '@/components/ExcelUploader';
import DashboardCharts from '@/components/DashboardCharts';
import DataTable from '@/components/DataTable';
import ChatSidebar from '@/components/ChatSidebar';
import ChartControls, { ChartConfig } from '@/components/ChartControls';
import CustomChart from '@/components/CustomChart';
import { MessageSquare, Upload, BarChart3, Table, Settings, Download, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PowerBIEmbed from '@/components/PowerBIEmbed';
import { toast } from 'sonner';

export interface DataRow {
  [key: string]: string | number;
}

const Index = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [customCharts, setCustomCharts] = useState<ChartConfig[]>([]);

  const handleDataProcessed = (processedData: DataRow[], columnNames: string[], file: string) => {
    setData(processedData);
    setColumns(columnNames);
    setFileName(file);
    setCustomCharts([]);
    
    // Log processed data for verification
    console.log('Data processed with proper month formatting:', {
      rows: processedData.length,
      columns: columnNames.length,
      sample: processedData.slice(0, 3)
    });
  };

  const handleExportToPowerBI = () => {
    if (data.length === 0) {
      toast.error('No data available to export');
      return;
    }
    
    try {
      const { powerBIService } = require('@/services/powerBiService');
      powerBIService.exportToPowerBI(data, columns, fileName);
      toast.success('Power BI export completed successfully!');
    } catch (error) {
      console.error('Power BI export error:', error);
      toast.error('Failed to export to Power BI');
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleGenerateChart = (config: ChartConfig) => {
    setCustomCharts(prev => [...prev, config]);
  };

  const handleRemoveChart = (id: string) => {
    setCustomCharts(prev => prev.filter(chart => chart.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.1)_1px,transparent_0)] [background-size:20px_20px] pointer-events-none" />
      
      <div className="container mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Power BI Studio
                </h1>
                <p className="text-xl text-slate-600 font-medium mt-1">
                  Transform Excel data into intelligent dashboards
                </p>
              </div>
            </div>
            
            {data.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="font-medium text-slate-700">Active Dataset:</span>
                  <span className="text-blue-600 font-semibold">{fileName}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200/50 shadow-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-slate-700">Records:</span>
                  <span className="text-green-600 font-semibold">{data.length.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          
          {data.length > 0 && (
            <div className="flex items-center gap-3">
              <Button
                onClick={handleExportToPowerBI}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Power BI
              </Button>
              <button
                onClick={toggleChat}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-blue-700 hover:to-purple-700"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">AI Assistant</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        {data.length === 0 ? (
          <div className="max-w-3xl mx-auto">
            <Card className="p-12 text-center border-2 border-dashed border-blue-200/60 bg-white/60 backdrop-blur-md shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:bg-white/80">
              <CardContent className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-20" />
                  <Upload className="h-20 w-20 mx-auto text-blue-500 relative z-10" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-slate-800">Upload Your Data</h2>
                  <p className="text-slate-600 text-lg max-w-md mx-auto">
                    Drop your Excel file here and watch AI transform it into beautiful, interactive dashboards
                  </p>
                </div>
                <ExcelUploader onDataProcessed={handleDataProcessed} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className={`transition-all duration-500 ${isChatOpen ? 'mr-96' : ''}`}>
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-lg rounded-xl p-1 mb-8">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="powerbi" 
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">Power BI</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="custom" 
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Custom</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
                >
                  <Table className="h-4 w-4" />
                  <span className="font-medium">Raw Data</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="mt-8">
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-xl p-6">
                  <DashboardCharts data={data} columns={columns} />
                </div>
              </TabsContent>

              <TabsContent value="powerbi" className="mt-8">
                <PowerBIEmbed data={data} columns={columns} fileName={fileName} />
              </TabsContent>

              <TabsContent value="custom" className="mt-8">
                <div className="space-y-8">
                  <Card className="bg-white/60 backdrop-blur-md border border-slate-200/50 shadow-xl rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                          <Settings className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">Chart Builder</h3>
                          <p className="text-slate-600">Create custom visualizations from your data</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ChartControls 
                        data={data} 
                        columns={columns} 
                        onGenerateChart={handleGenerateChart}
                      />
                    </CardContent>
                  </Card>
                  
                  {customCharts.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {customCharts.map((chart) => (
                        <div key={chart.id} className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
                          <CustomChart
                            config={chart}
                            data={data}
                            onRemove={handleRemoveChart}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="mt-8">
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
                  <DataTable data={data} columns={columns} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Chat Sidebar */}
        {isChatOpen && (
          <ChatSidebar
            data={data}
            columns={columns}
            fileName={fileName}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
