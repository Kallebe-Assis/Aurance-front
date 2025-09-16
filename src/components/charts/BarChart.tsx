import React, { useMemo } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer } from './ChartContainer';

interface BarChartData {
  name: string;
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartData[];
  title: string;
  subtitle?: string;
  height?: number;
  dataKeys: string[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisKey?: string;
}

const DEFAULT_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '10px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontSize: '10px'
      }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: 500, color: '#374151', fontSize: '11px' }}>
          {label || 'N/A'}
        </p>
        {payload.map((entry: any, index: number) => {
          const value = entry?.value || 0;
          return (
            <p key={index} style={{ margin: '2px 0', color: entry?.color || '#000', fontSize: '10px' }}>
              {entry?.dataKey || 'N/A'}: R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export const BarChart: React.FC<BarChartProps> = React.memo(({
  data,
  title,
  subtitle,
  height = 350,
  dataKeys,
  colors = DEFAULT_COLORS,
  showLegend = true,
  showGrid = true,
  xAxisKey = 'name'
}) => {
  // Validar e limpar dados com useMemo para otimização
  const cleanData = useMemo(() => {
    return data?.filter(item => {
      if (!item || !item.name || item.name === 'Invalid Date') return false;
      
      // Verificar se pelo menos um dos valores de dataKeys é válido
      const hasValidValue = dataKeys.some(key => {
        const value = item[key];
        return typeof value === 'number' && !isNaN(value) && value >= 0;
      });
      
      return hasValidValue;
    }) || [];
  }, [data, dataKeys]);
  
  
  if (!cleanData || cleanData.length === 0) {
    return (
      <ChartContainer title={title} subtitle={subtitle} height={height}>
        <div style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
          <p>Nenhum dado disponível</p>
          <p style={{ fontSize: '12px', marginTop: '0.5rem' }}>
            Adicione receitas e despesas para ver o gráfico
          </p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={cleanData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 10 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value) => {
              return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Bar 
              key={key}
              dataKey={key} 
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
});
