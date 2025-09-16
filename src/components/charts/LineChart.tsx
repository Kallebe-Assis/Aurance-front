import React, { useMemo } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer } from './ChartContainer';

interface LineChartData {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartData[];
  title: string;
  subtitle?: string;
  height?: number;
  dataKeys: string[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisKey?: string;
  showDots?: boolean;
}

const DEFAULT_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 500, color: '#374151' }}>
          {label || 'N/A'}
        </p>
        {payload.map((entry: any, index: number) => {
          const value = entry?.value || 0;
          return (
            <p key={index} style={{ margin: '2px 0', color: entry?.color || '#000' }}>
              {entry?.dataKey || 'N/A'}: R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export const LineChart: React.FC<LineChartProps> = React.memo(({
  data,
  title,
  subtitle,
  height = 350,
  dataKeys,
  colors = DEFAULT_COLORS,
  showLegend = true,
  showGrid = true,
  xAxisKey = 'name',
  showDots = true
}) => {
  if (!data || data.length === 0) {
    return (
      <ChartContainer title={title} subtitle={subtitle} height={height}>
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          <p>Nenhum dado disponível</p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key} 
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={showDots ? { r: 4 } : false}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
});
