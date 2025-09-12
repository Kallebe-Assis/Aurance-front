import React from 'react';
import styled from 'styled-components';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
  className?: string;
}

const Container = styled.div<{ height?: number }>`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  height: ${props => props.height ? `${props.height}px` : 'auto'};
  min-height: 300px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
`;

const Subtitle = styled.p`
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
`;

const ChartContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  height,
  className
}) => {
  return (
    <Container height={height} className={className}>
      <Header>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </Header>
      <ChartContent>
        {children}
      </ChartContent>
    </Container>
  );
};
