
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, DollarSign, Calendar } from 'lucide-react';

interface DashboardChartsProps {
  data: DataRow[];
  columns: string[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1', '#EC4899', '#14B8A6'];

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data, columns }) => {
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

    return {
      businessMetrics: metrics,
      chartConfigurations: configs
    };
  }, [data, columns]);

  const generateComparisonChart = (config: any) => {
    const chartData = data.map(row => {
      const entry: any = { [config.xAxis]: row[config.xAxis] };
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
      const entry: any = { [config.xAxis]: row[config.xAxis] };
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
      const entry: any = { [config.xAxis]: row[config.xAxis] };
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
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default DashboardCharts;
