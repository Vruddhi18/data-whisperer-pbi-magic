
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
  ScatterChart,
  Scatter
} from 'recharts';
import { DataRow } from '@/pages/Index';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';

interface DashboardChartsProps {
  data: DataRow[];
  columns: string[];
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data, columns }) => {
  const { numericColumns, categoricalColumns, chartData } = useMemo(() => {
    // Identify numeric and categorical columns
    const numeric: string[] = [];
    const categorical: string[] = [];

    columns.forEach(col => {
      const sampleValues = data.slice(0, 10).map(row => row[col]);
      const numericValues = sampleValues.filter(val => typeof val === 'number' || !isNaN(Number(val)));
      
      if (numericValues.length > sampleValues.length * 0.7) {
        numeric.push(col);
      } else {
        categorical.push(col);
      }
    });

    // Prepare chart data
    const processedData = data.slice(0, 50); // Limit for performance

    return {
      numericColumns: numeric,
      categoricalColumns: categorical,
      chartData: processedData
    };
  }, [data, columns]);

  const generateBarChart = () => {
    if (categoricalColumns.length === 0 || numericColumns.length === 0) return null;

    const categoryCol = categoricalColumns[0];
    const valueCol = numericColumns[0];

    const aggregatedData = data.reduce((acc: any, row) => {
      const category = String(row[categoryCol]);
      const value = Number(row[valueCol]) || 0;
      
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0 };
      }
      acc[category].value += value;
      acc[category].count += 1;
      
      return acc;
    }, {});

    const barData = Object.values(aggregatedData).slice(0, 10);

    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-lg">{valueCol} by {categoryCol}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
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
              <Bar 
                dataKey="value" 
                fill="url(#blueGradient)" 
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const generatePieChart = () => {
    if (categoricalColumns.length === 0) return null;

    const categoryCol = categoricalColumns[0];
    const categoryCount = data.reduce((acc: any, row) => {
      const category = String(row[categoryCol]);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.entries(categoryCount)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChartIcon className="h-4 w-4 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Distribution of {categoryCol}</CardTitle>
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
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

  const generateLineChart = () => {
    if (numericColumns.length < 2) return null;

    const xCol = numericColumns[0];
    const yCol = numericColumns[1];

    const lineData = data
      .slice(0, 20)
      .map((row, index) => ({
        index: index + 1,
        [xCol]: Number(row[xCol]) || 0,
        [yCol]: Number(row[yCol]) || 0
      }))
      .sort((a, b) => a[xCol] - b[xCol]);

    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-lg">{yCol} vs {xCol}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey={xCol}
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
              <Line 
                type="monotone" 
                dataKey={yCol} 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const generateSummaryStats = () => {
    const stats = numericColumns.slice(0, 4).map(col => {
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

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
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
                <CardTitle className="text-sm font-medium truncate">{stat.column}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{stat.average.toFixed(2)}</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Max: {stat.max.toFixed(2)}</div>
                <div>Min: {stat.min.toFixed(2)}</div>
                <div>Count: {stat.count}</div>
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
      {numericColumns.length > 0 && generateSummaryStats()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {generateBarChart()}
        {generatePieChart()}
        {generateLineChart()}
        
        {numericColumns.length >= 2 && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="h-4 w-4 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Correlation Plot</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey={numericColumns[0]}
                    type="number"
                    tick={{ fontSize: 12 }}
                    stroke="#64748B"
                  />
                  <YAxis 
                    dataKey={numericColumns[1]}
                    type="number"
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
                  <Scatter fill="#F59E0B" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;
