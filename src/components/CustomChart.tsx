
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { X } from 'lucide-react';
import { DataRow } from '@/pages/Index';
import { ChartConfig } from './ChartControls';

interface CustomChartProps {
  config: ChartConfig;
  data: DataRow[];
  onRemove: (id: string) => void;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

const CustomChart: React.FC<CustomChartProps> = ({ config, data, onRemove }) => {
  const processDataForChart = () => {
    switch (config.type) {
      case 'bar':
        if (!config.category || !config.value) return [];
        
        const aggregatedData = data.reduce((acc: any, row) => {
          const category = String(row[config.category!]);
          const value = Number(row[config.value!]) || 0;
          
          if (!acc[category]) {
            acc[category] = { name: category, value: 0, count: 0 };
          }
          acc[category].value += value;
          acc[category].count += 1;
          
          return acc;
        }, {});

        return Object.values(aggregatedData).slice(0, 10);

      case 'pie':
        if (!config.category) return [];
        
        const categoryCount = data.reduce((acc: any, row) => {
          const category = String(row[config.category!]);
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        return Object.entries(categoryCount)
          .slice(0, 8)
          .map(([name, value]) => ({ name, value }));

      case 'line':
      case 'scatter':
        if (!config.xAxis || !config.yAxis) return [];
        
        return data
          .slice(0, 50)
          .map((row, index) => ({
            [config.xAxis!]: row[config.xAxis!],
            [config.yAxis!]: Number(row[config.yAxis!]) || 0,
            index: index + 1
          }))
          .filter(item => item[config.xAxis!] !== undefined && item[config.xAxis!] !== null);

      default:
        return [];
    }
  };

  const chartData = processDataForChart();

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={config.xAxis} tick={{ fontSize: 12 }} stroke="#64748B" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={config.yAxis} 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={config.xAxis} type="number" tick={{ fontSize: 12 }} stroke="#64748B" />
              <YAxis dataKey={config.yAxis} type="number" tick={{ fontSize: 12 }} stroke="#64748B" />
              <Tooltip />
              <Scatter fill="#F59E0B" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">{config.title}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(config.id)}
          className="h-8 w-8 p-0 hover:bg-red-100"
        >
          <X className="h-4 w-4 text-red-500" />
        </Button>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? renderChart() : (
          <div className="text-center text-gray-500 py-12">
            No data available for this chart configuration
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomChart;
