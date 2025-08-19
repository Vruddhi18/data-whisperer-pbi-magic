
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, PieChart, TrendingUp, Activity, Plus, BarChart2, CreditCard, Filter } from 'lucide-react';
import { DataRow } from '@/pages/Index';

interface ChartControlsProps {
  data: DataRow[];
  columns: string[];
  onGenerateChart: (config: ChartConfig) => void;
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'pie' | 'line' | 'scatter' | 'histogram' | 'card' | 'slicer';
  title: string;
  xAxis?: string;
  yAxis?: string;
  category?: string;
  value?: string;
  field?: string; // For cards and slicers
  bins?: number; // For histograms
}

const ChartControls: React.FC<ChartControlsProps> = ({ data, columns, onGenerateChart }) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'scatter' | 'histogram' | 'card' | 'slicer'>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [field, setField] = useState<string>('');
  const [bins, setBins] = useState<number>(10);

  // Identify numeric and categorical columns
  const numericColumns = columns.filter(col => {
    const sampleValues = data.slice(0, 10).map(row => row[col]);
    const numericValues = sampleValues.filter(val => typeof val === 'number' || !isNaN(Number(val)));
    return numericValues.length > sampleValues.length * 0.7;
  });

  const categoricalColumns = columns.filter(col => !numericColumns.includes(col));

  const handleGenerateChart = () => {
    let config: ChartConfig;
    const id = `chart-${Date.now()}`;

    switch (chartType) {
      case 'bar':
        if (!category || !value) {
          alert('Please select both category and value columns for bar chart');
          return;
        }
        config = {
          id,
          type: 'bar',
          title: `${value} by ${category}`,
          category,
          value
        };
        break;
      case 'pie':
        if (!category) {
          alert('Please select a category column for pie chart');
          return;
        }
        config = {
          id,
          type: 'pie',
          title: `Distribution of ${category}`,
          category
        };
        break;
      case 'line':
      case 'scatter':
        if (!xAxis || !yAxis) {
          alert(`Please select both X and Y axis columns for ${chartType} chart`);
          return;
        }
        config = {
          id,
          type: chartType,
          title: `${yAxis} vs ${xAxis}`,
          xAxis,
          yAxis
        };
        break;
      case 'histogram':
        if (!field) {
          alert('Please select a field for histogram');
          return;
        }
        config = {
          id,
          type: 'histogram',
          title: `${field} Distribution`,
          field,
          bins
        };
        break;
      case 'card':
        if (!field) {
          alert('Please select a field for the card');
          return;
        }
        config = {
          id,
          type: 'card',
          title: `${field} Summary`,
          field
        };
        break;
      case 'slicer':
        if (!field) {
          alert('Please select a field for the slicer');
          return;
        }
        config = {
          id,
          type: 'slicer',
          title: `${field} Filter`,
          field
        };
        break;
      default:
        return;
    }

    onGenerateChart(config);
    
    // Reset form
    setXAxis('');
    setYAxis('');
    setCategory('');
    setValue('');
    setField('');
    setBins(10);
  };

  const getQuickChartSuggestions = () => {
    const suggestions = [];
    
    // Sales over time suggestion
    const timeColumns = columns.filter(col => 
      col.toLowerCase().includes('date') || 
      col.toLowerCase().includes('time') ||
      col.toLowerCase().includes('month') ||
      col.toLowerCase().includes('year')
    );
    
    const salesColumns = numericColumns.filter(col => 
      col.toLowerCase().includes('sales') ||
      col.toLowerCase().includes('revenue') ||
      col.toLowerCase().includes('amount')
    );

    if (timeColumns.length > 0 && salesColumns.length > 0) {
      suggestions.push({
        title: `${salesColumns[0]} over ${timeColumns[0]}`,
        config: {
          id: `quick-${Date.now()}-1`,
          type: 'line' as const,
          title: `${salesColumns[0]} over ${timeColumns[0]}`,
          xAxis: timeColumns[0],
          yAxis: salesColumns[0]
        }
      });
    }

    // Category distribution
    if (categoricalColumns.length > 0) {
      suggestions.push({
        title: `Distribution of ${categoricalColumns[0]}`,
        config: {
          id: `quick-${Date.now()}-2`,
          type: 'pie' as const,
          title: `Distribution of ${categoricalColumns[0]}`,
          category: categoricalColumns[0]
        }
      });
    }

    // Performance comparison
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      suggestions.push({
        title: `${numericColumns[0]} by ${categoricalColumns[0]}`,
        config: {
          id: `quick-${Date.now()}-3`,
          type: 'bar' as const,
          title: `${numericColumns[0]} by ${categoricalColumns[0]}`,
          category: categoricalColumns[0],
          value: numericColumns[0]
        }
      });
    }

    // Histogram suggestion
    if (numericColumns.length > 0) {
      suggestions.push({
        title: `${numericColumns[0]} Distribution`,
        config: {
          id: `quick-${Date.now()}-4`,
          type: 'histogram' as const,
          title: `${numericColumns[0]} Distribution`,
          field: numericColumns[0],
          bins: 10
        }
      });
    }

    // Summary card suggestion
    if (numericColumns.length > 0) {
      suggestions.push({
        title: `${numericColumns[0]} Summary Card`,
        config: {
          id: `quick-${Date.now()}-5`,
          type: 'card' as const,
          title: `${numericColumns[0]} Summary`,
          field: numericColumns[0]
        }
      });
    }

    // Slicer suggestion
    if (categoricalColumns.length > 0) {
      suggestions.push({
        title: `${categoricalColumns[0]} Filter`,
        config: {
          id: `quick-${Date.now()}-6`,
          type: 'slicer' as const,
          title: `${categoricalColumns[0]} Filter`,
          field: categoricalColumns[0]
        }
      });
    }

    return suggestions;
  };

  const quickSuggestions = getQuickChartSuggestions();

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Custom Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Suggestions */}
        {quickSuggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Quick Chart Suggestions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onGenerateChart(suggestion.config)}
                  className="justify-start text-left h-auto py-2"
                >
                  <div className="flex items-center gap-2">
                    {suggestion.config.type === 'bar' && <BarChart3 className="h-4 w-4" />}
                    {suggestion.config.type === 'pie' && <PieChart className="h-4 w-4" />}
                    {suggestion.config.type === 'line' && <TrendingUp className="h-4 w-4" />}
                    {suggestion.config.type === 'scatter' && <Activity className="h-4 w-4" />}
                    {suggestion.config.type === 'histogram' && <BarChart2 className="h-4 w-4" />}
                    {suggestion.config.type === 'card' && <CreditCard className="h-4 w-4" />}
                    {suggestion.config.type === 'slicer' && <Filter className="h-4 w-4" />}
                    <span className="text-xs">{suggestion.title}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Chart Builder */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-700 mb-4">Custom Chart Builder</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Chart Type</label>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                  <SelectItem value="histogram">Histogram</SelectItem>
                  <SelectItem value="card">Summary Card</SelectItem>
                  <SelectItem value="slicer">Data Slicer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(chartType === 'bar' || chartType === 'pie') && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category column" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoricalColumns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {chartType === 'bar' && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Value</label>
                <Select value={value} onValueChange={setValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select value column" />
                  </SelectTrigger>
                  <SelectContent>
                    {numericColumns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(chartType === 'line' || chartType === 'scatter') && (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">X-Axis</label>
                  <Select value={xAxis} onValueChange={setXAxis}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select X-axis column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Y-Axis</label>
                  <Select value={yAxis} onValueChange={setYAxis}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Y-axis column" />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {(chartType === 'histogram' || chartType === 'card' || chartType === 'slicer') && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Field</label>
                <Select value={field} onValueChange={setField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {(chartType === 'histogram' || chartType === 'card' ? numericColumns : categoricalColumns).map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {chartType === 'histogram' && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Number of Bins</label>
                <Select value={bins.toString()} onValueChange={(value) => setBins(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 bins</SelectItem>
                    <SelectItem value="10">10 bins</SelectItem>
                    <SelectItem value="15">15 bins</SelectItem>
                    <SelectItem value="20">20 bins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button 
            onClick={handleGenerateChart}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Generate Chart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartControls;
