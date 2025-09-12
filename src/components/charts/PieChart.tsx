import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer } from './ChartContainer';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
  subtitle?: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const value = data?.value || 0;
    // Calcular o total de todos os dados do gráfico, não apenas do payload
    const total = data?.payload?.total || 0;
    const percent = total > 0 ? (value / total) * 100 : 0;
    
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '8px' 
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '2px',
            backgroundColor: data?.payload?.color || '#3B82F6',
            marginRight: '8px'
          }} />
          <p style={{ 
            margin: 0, 
            fontWeight: 600, 
            color: '#111827',
            fontSize: '14px'
          }}>
            {data?.name || 'N/A'}
          </p>
        </div>
        <div style={{ marginLeft: '20px' }}>
          <p style={{ 
            margin: '0 0 4px 0', 
            color: '#374151',
            fontSize: '13px'
          }}>
            <strong>R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </p>
          <p style={{ 
            margin: 0, 
            color: '#6B7280',
            fontSize: '12px'
          }}>
            {percent.toFixed(1)}% do total
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  subtitle,
  height = 350,
  showLegend = true,
  showTooltip = true
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

  // Calcular o total de todos os valores
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Adicionar o total a cada item para o tooltip
  const dataWithTotal = data.map(item => ({
    ...item,
    total
  }));

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithTotal.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="rect"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '13px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
              formatter={(value, entry: any) => (
                <span style={{ 
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {value}
                </span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
