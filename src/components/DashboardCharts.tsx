
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { DataRow } from '@/pages/Index';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, DollarSign, Calendar, Filter, Plus, CreditCard, BarChart2 } from 'lucide-react';

interface DashboardChartsProps {
  data: DataRow[];
  columns: string[];
  onGenerateChart?: (config: any) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1', '#EC4899', '#14B8A6'];

// Month mapping to convert numbers to proper month names
const MONTH_NAMES = {
  '1': 'January', '2': 'February', '3': 'March', '4': 'April',
  '5': 'May', '6': 'June', '7': 'July', '8': 'August',
  '9': 'September', '10': 'October', '11': 'November', '12': 'December',
  'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April',
  'may': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August',
  'sep': 'September', 'oct': 'October', 'nov': 'November', 'dec': 'December'
};

const formatMonthValue = (value: any): string => {
  if (!value) return 'Unknown';
  
  const strValue = String(value).toLowerCase().trim();
  
  // Check if it's a direct month mapping
  if (MONTH_NAMES[strValue as keyof typeof MONTH_NAMES]) {
    return MONTH_NAMES[strValue as keyof typeof MONTH_NAMES];
  }
  
  // Check if it contains a month name
  for (const [key, monthName] of Object.entries(MONTH_NAMES)) {
    if (strValue.includes(key) || strValue.includes(monthName.toLowerCase())) {
      return monthName;
    }
  }
  
  // If it's a date string, try to parse it
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toLocaleString('default', { month: 'long' });
  }
  
  // Return original value if no conversion possible
  return String(value);
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data, columns, onGenerateChart }) => {
  const { businessMetrics, chartConfigurations } = useMemo(() => {
    // Identify business-relevant columns
    const timeColumns = columns.filter(col => 
      col.toLowerCase().includes('month') || 
      col.toLowerCase().includes('date') || 
      col.toLowerCase().includes('time') ||
      col.toLowerCase().includes('year') ||
      col.toLowerCase().includes('period')
    );

    const salesColumns = columns.filter(col => 
      col.toLowerCase().includes('sales') ||
      col.toLowerCase().includes('revenue') ||
      col.toLowerCase().includes('actual') ||
      col.toLowerCase().includes('plan') ||
      col.toLowerCase().includes('budget') ||
      col.toLowerCase().includes('scrap') ||
      col.toLowerCase().includes('net')
    );

    const quantityColumns = columns.filter(col => 
      col.toLowerCase().includes('qty') ||
      col.toLowerCase().includes('quantity') ||
      col.toLowerCase().includes('volume')
    );

    const priceColumns = columns.filter(col => 
      col.toLowerCase().includes('price') ||
      col.toLowerCase().includes('rate') ||
      col.toLowerCase().includes('alang') ||
      col.toLowerCase().includes('mmr') ||
      col.toLowerCase().includes('jpc')
    );

    // Calculate summary metrics
    const metrics = salesColumns.slice(0, 4).map(col => {
      const values = data.map(row => Number(row[col])).filter(val => !isNaN(val));
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      return {
        column: col,
        sum,
        average: avg,
        max,
        min,
        count: values.length
      };
    });

    // Generate intelligent chart configurations
    const configs = [];

    // 1. Plan vs Actual Sales by Month
    const actualSales = salesColumns.find(col => col.toLowerCase().includes('actual') && col.toLowerCase().includes('sales'));
    const planSales = salesColumns.find(col => col.toLowerCase().includes('plan') && !col.toLowerCase().includes('qty'));
    const monthCol = timeColumns.find(col => col.toLowerCase().includes('month'));

    if (actualSales && planSales && monthCol) {
      configs.push({
        type: 'comparison',
        title: 'Plan vs Actual Sales by Month',
        xAxis: monthCol,
        metrics: [actualSales, planSales],
        icon: TrendingUp,
        color: 'blue'
      });
    }

    // 2. Revenue Breakdown
    if (salesColumns.length >= 2) {
      configs.push({
        type: 'pie',
        title: 'Revenue Distribution',
        columns: salesColumns.slice(0, 5),
        icon: PieChartIcon,
        color: 'purple'
      });
    }

    // 3. Price Comparison
    if (priceColumns.length >= 2 && monthCol) {
      configs.push({
        type: 'line',
        title: 'Price Trends Over Time',
        xAxis: monthCol,
        metrics: priceColumns.slice(0, 3),
        icon: DollarSign,
        color: 'green'
      });
    }

    // 4. Quantity Analysis
    const actualQty = quantityColumns.find(col => col.toLowerCase().includes('actual'));
    const planQty = quantityColumns.find(col => col.toLowerCase().includes('plan'));
    
    if (actualQty && planQty && monthCol) {
      configs.push({
        type: 'bar',
        title: 'Planned vs Actual Quantity',
        xAxis: monthCol,
        metrics: [planQty, actualQty],
        icon: BarChart3,
        color: 'orange'
      });
    }

    // 5. Additional comprehensive analysis charts
    // Top performers analysis
    if (salesColumns.length > 0) {
      configs.push({
        type: 'card',
        title: 'Sales Performance Summary',
        field: salesColumns[0],
        icon: DollarSign,
        color: 'indigo'
      });
    }

    // Data distribution analysis
    if (salesColumns.length > 1) {
      configs.push({
        type: 'histogram',
        title: `${salesColumns[1]} Distribution Analysis`,
        field: salesColumns[1],
        bins: 10,
        icon: Activity,
        color: 'pink'
      });
    }

    // Interactive slicer for filtering
    const categoryCol = columns.find(col => 
      col.toLowerCase().includes('category') ||
      col.toLowerCase().includes('type') ||
      col.toLowerCase().includes('region') ||
      col.toLowerCase().includes('product')
    );
    
    if (categoryCol) {
      configs.push({
        type: 'slicer',
        title: `${categoryCol} Filter`,
        field: categoryCol,
        icon: BarChart3,
        color: 'cyan'
      });
    }

    return {
      businessMetrics: metrics,
      chartConfigurations: configs
    };
  }, [data, columns]);

  const generateComparisonChart = (config: any) => {
    const chartData = data.map(row => {
      const entry: any = { 
        [config.xAxis]: formatMonthValue(row[config.xAxis]),
        originalMonth: row[config.xAxis]
      };
      config.metrics.forEach((metric: string) => {
        entry[metric] = Number(row[metric]) || 0;
      });
      return entry;
    });

    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
              <config.icon className={`h-4 w-4 text-${config.color}-600`} />
            </div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey={config.xAxis}
                tick={{ fontSize: 12 }}
                stroke="#64748B"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748B"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value) => `Month: ${value}`}
              />
              <Legend />
              {config.metrics.map((metric: string, index: number) => (
                <Bar 
                  key={metric}
                  dataKey={metric} 
                  fill={COLORS[index]} 
                  radius={[4, 4, 0, 0]}
                  name={metric.replace(/[._]/g, ' ')}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const generatePieChart = (config: any) => {
    // Calculate totals for each revenue stream
    const pieData = config.columns.map((col: string) => {
      const total = data.reduce((sum, row) => sum + (Number(row[col]) || 0), 0);
      return {
        name: col.replace(/[._]/g, ' '),
        value: total
      };
    }).filter((item: any) => item.value > 0);

    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
              <config.icon className={`h-4 w-4 text-${config.color}-600`} />
            </div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [value.toLocaleString(), 'Value']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const generateLineChart = (config: any) => {
    const chartData = data.map(row => {
      const entry: any = { 
        [config.xAxis]: formatMonthValue(row[config.xAxis]),
        originalMonth: row[config.xAxis]
      };
      config.metrics.forEach((metric: string) => {
        entry[metric] = Number(row[metric]) || 0;
      });
      return entry;
    });

    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
              <config.icon className={`h-4 w-4 text-${config.color}-600`} />
            </div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey={config.xAxis}
                tick={{ fontSize: 12 }}
                stroke="#64748B"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748B"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value) => `Month: ${value}`}
              />
              <Legend />
              {config.metrics.map((metric: string, index: number) => (
                <Line 
                  key={metric}
                  type="monotone" 
                  dataKey={metric} 
                  stroke={COLORS[index]} 
                  strokeWidth={3}
                  dot={{ fill: COLORS[index], strokeWidth: 2, r: 4 }}
                  name={metric.replace(/[._]/g, ' ')}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const generateBarChart = (config: any) => {
    const chartData = data.map(row => {
      const entry: any = { 
        [config.xAxis]: formatMonthValue(row[config.xAxis]),
        originalMonth: row[config.xAxis]
      };
      config.metrics.forEach((metric: string) => {
        entry[metric] = Number(row[metric]) || 0;
      });
      return entry;
    });

    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
              <config.icon className={`h-4 w-4 text-${config.color}-600`} />
            </div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey={config.xAxis}
                tick={{ fontSize: 12 }}
                stroke="#64748B"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748B"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value) => `Month: ${value}`}
              />
              <Legend />
              {config.metrics.map((metric: string, index: number) => (
                <Bar 
                  key={metric}
                  dataKey={metric} 
                  fill={COLORS[index]} 
                  radius={[4, 4, 0, 0]}
                  name={metric.replace(/[._]/g, ' ')}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const generateSummaryStats = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {businessMetrics.map((stat, index) => (
          <Card key={stat.column} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  index === 0 ? 'bg-blue-100' :
                  index === 1 ? 'bg-purple-100' :
                  index === 2 ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <Activity className={`h-4 w-4 ${
                    index === 0 ? 'text-blue-600' :
                    index === 1 ? 'text-purple-600' :
                    index === 2 ? 'text-green-600' : 'text-orange-600'
                  }`} />
                </div>
                <CardTitle className="text-sm font-medium truncate">
                  {stat.column.replace(/[._]/g, ' ')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{stat.sum.toLocaleString()}</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Avg: {stat.average.toFixed(0)}</div>
                <div>Max: {stat.max.toLocaleString()}</div>
                <div>Min: {stat.min.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const generateCardChart = (config: any) => {
    const fieldValues = data.map(row => Number(row[config.field])).filter(val => !isNaN(val));
    const sum = fieldValues.reduce((a, b) => a + b, 0);
    const avg = sum / fieldValues.length;
    const max = Math.max(...fieldValues);
    const min = Math.min(...fieldValues);
    
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
              <config.icon className={`h-4 w-4 text-${config.color}-600`} />
            </div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>
          {onGenerateChart && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGenerateChart({
                id: `from-dashboard-${Date.now()}`,
                type: 'bar',
                title: `${config.field} Analysis`,
                field: config.field
              })}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{sum.toLocaleString()}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{avg.toFixed(2)}</div>
                <div className="text-sm text-green-600">Average</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{max.toLocaleString()}</div>
                <div className="text-sm text-purple-600">Maximum</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{min.toLocaleString()}</div>
                <div className="text-sm text-orange-600">Minimum</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{fieldValues.length} Records</div>
              <div className="text-sm text-gray-500">Total count</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const generateHistogramChart = (config: any) => {
    const values = data.map(row => Number(row[config.field])).filter(val => !isNaN(val));
    if (values.length === 0) return null;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / (config.bins || 10);
    
    const bins = Array.from({ length: config.bins || 10 }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(1)} - ${(min + (i + 1) * binSize).toFixed(1)}`,
      count: 0
    }));
    
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins.length - 1);
      if (binIndex >= 0 && binIndex < bins.length) {
        bins[binIndex].count++;
      }
    });

    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
              <config.icon className={`h-4 w-4 text-${config.color}-600`} />
            </div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bins}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 10 }} 
                stroke="#64748B" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const generateSlicerChart = (config: any) => {
    const uniqueValues = [...new Set(data.map(row => String(row[config.field])))].slice(0, 20);
    
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
              <config.icon className={`h-4 w-4 text-${config.color}-600`} />
            </div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-3">
              Filter by {config.field}:
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {uniqueValues.map((value, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => onGenerateChart && onGenerateChart({
                    id: `slicer-chart-${Date.now()}`,
                    type: 'bar',
                    title: `Analysis for ${value}`,
                    category: config.field,
                    value: columns.find(col => col.toLowerCase().includes('sales') || col.toLowerCase().includes('amount')) || columns[1]
                  })}
                >
                  {value}
                  <Plus className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {uniqueValues.length} unique values • Click to create charts
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        No data available to display charts
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {businessMetrics.length > 0 && generateSummaryStats()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartConfigurations.map((config, index) => {
          switch (config.type) {
            case 'comparison':
              return <div key={index}>{generateComparisonChart(config)}</div>;
            case 'pie':
              return <div key={index}>{generatePieChart(config)}</div>;
            case 'line':
              return <div key={index}>{generateLineChart(config)}</div>;
            case 'bar':
              return <div key={index}>{generateBarChart(config)}</div>;
            case 'card':
              return <div key={index}>{generateCardChart(config)}</div>;
            case 'histogram':
              return <div key={index}>{generateHistogramChart(config)}</div>;
            case 'slicer':
              return <div key={index}>{generateSlicerChart(config)}</div>;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default DashboardCharts;
