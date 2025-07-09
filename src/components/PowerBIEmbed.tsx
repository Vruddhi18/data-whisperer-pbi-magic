
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Settings } from 'lucide-react';
import { DataRow } from '@/pages/Index';
import { powerBIService } from '@/services/powerBiService';
import { toast } from 'sonner';

interface PowerBIEmbedProps {
  data: DataRow[];
  columns: string[];
  fileName: string;
}

const PowerBIEmbed: React.FC<PowerBIEmbedProps> = ({ data, columns, fileName }) => {
  const embedRef = useRef<HTMLDivElement>(null);
  const [isEmbedReady, setIsEmbedReady] = React.useState(false);

  useEffect(() => {
    // Initialize Power BI embed (demo placeholder)
    if (embedRef.current && data.length > 0) {
      // In a real implementation, you would initialize the Power BI JavaScript SDK here
      // For now, we'll show a placeholder with the structure
      setIsEmbedReady(true);
    }
  }, [data]);

  const handleExportToPowerBI = () => {
    try {
      const exportData = powerBIService.exportToPowerBI(data, columns, fileName);
      toast.success('Power BI export file generated successfully!');
      console.log('Power BI Export Data:', exportData);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export to Power BI');
    }
  };

  const handleOpenInPowerBI = () => {
    // In a real implementation, this would open the report in Power BI service
    const embedUrl = powerBIService.generateEmbedUrl('demo-report-id');
    window.open(embedUrl, '_blank');
    toast.info('Opening in Power BI Service...');
  };

  if (data.length === 0) {
    return (
      <Card className="bg-white/60 backdrop-blur-md border border-slate-200/50 shadow-xl rounded-2xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-slate-500">
            <div className="text-lg font-medium mb-2">No Data Available</div>
            <p>Upload an Excel file to see Power BI visualizations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Power BI Controls */}
      <Card className="bg-white/60 backdrop-blur-md border border-slate-200/50 shadow-xl rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Power BI Dashboard</CardTitle>
                <p className="text-slate-600">Interactive embedded analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportToPowerBI}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={handleOpenInPowerBI}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Power BI
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Power BI Embed Container */}
      <Card className="bg-white/60 backdrop-blur-md border border-slate-200/50 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div 
            ref={embedRef}
            className="w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center"
          >
            {!isEmbedReady ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-600 border-t-transparent mx-auto mb-4" />
                <p className="text-slate-600">Loading Power BI Dashboard...</p>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Power BI Embedded Ready</h3>
                <p className="text-slate-600 mb-4">
                  Dashboard configured with {data.length} rows and {columns.length} columns
                </p>
                <div className="bg-white rounded-lg p-4 border border-slate-200 text-left">
                  <h4 className="font-medium text-slate-700 mb-2">Available Visualizations:</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Interactive bar charts with month formatting</li>
                    <li>• Pie charts for distribution analysis</li>
                    <li>• Line charts for trend visualization</li>
                    <li>• Smart filtering and drill-down capabilities</li>
                  </ul>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  * Requires Power BI Pro license and proper authentication for full embedding
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PowerBIEmbed;
