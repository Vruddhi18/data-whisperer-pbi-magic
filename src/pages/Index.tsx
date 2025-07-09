
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExcelUploader from '@/components/ExcelUploader';
import DashboardCharts from '@/components/DashboardCharts';
import DataTable from '@/components/DataTable';
import ChatSidebar from '@/components/ChatSidebar';
import ChartControls, { ChartConfig } from '@/components/ChartControls';
import CustomChart from '@/components/CustomChart';
import { MessageSquare, Upload, BarChart3, Table, Settings } from 'lucide-react';

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
    setCustomCharts([]); // Reset custom charts when new data is loaded
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Power BI Dashboard
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Upload Excel files and explore your data with AI-powered insights
            </p>
          </div>
          
          {data.length > 0 && (
            <button
              onClick={toggleChat}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <MessageSquare className="h-5 w-5" />
              AI Assistant
            </button>
          )}
        </div>

        {/* Main Content */}
        {data.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center border-2 border-dashed border-blue-200 bg-white/50 backdrop-blur-sm">
              <Upload className="h-16 w-16 mx-auto mb-4 text-blue-400" />
              <ExcelUploader onDataProcessed={handleDataProcessed} />
            </Card>
          </div>
        ) : (
          <div className={`transition-all duration-300 ${isChatOpen ? 'mr-96' : ''}`}>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium">File:</span>
                <span className="bg-blue-100 px-2 py-1 rounded">{fileName}</span>
                <span className="font-medium ml-4">Records:</span>
                <span className="bg-green-100 px-2 py-1 rounded">{data.length}</span>
              </div>
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Custom Charts
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  Data View
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="mt-6">
                <DashboardCharts data={data} columns={columns} />
              </TabsContent>

              <TabsContent value="custom" className="mt-6">
                <div className="space-y-6">
                  <ChartControls 
                    data={data} 
                    columns={columns} 
                    onGenerateChart={handleGenerateChart}
                  />
                  
                  {customCharts.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {customCharts.map((chart) => (
                        <CustomChart
                          key={chart.id}
                          config={chart}
                          data={data}
                          onRemove={handleRemoveChart}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="mt-6">
                <DataTable data={data} columns={columns} />
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
