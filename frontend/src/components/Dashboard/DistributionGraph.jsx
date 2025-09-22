import React from 'react';
import { Card, Typography } from 'antd';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, ReferenceLine } from 'recharts';

const { Title, Text } = Typography;

// Mock data to create a bell-curve shape for the UI
const mockDistributionData = [
  { temp: 25, probability: 5 },
  { temp: 27, probability: 15 },
  { temp: 29, probability: 40 },
  { temp: 31, probability: 80 },
  { temp: 33, probability: 100 }, // The historical average
  { temp: 35, probability: 80 },
  { temp: 37, probability: 40 },
  { temp: 39, probability: 15 },
  { temp: 41, probability: 5 },
];

// A mock "forecast" temperature to show the red line
const forecastTemp = 38; 

function DistributionGraph({ loading }) {
  return (
    <Card loading={loading} style={{ marginTop: '24px' }}>
      <Title level={5}>Historical Temperature Distribution</Title>
      <Text type="secondary">Likelihood of temperatures for this day based on 30 years of data.</Text>
      <div style={{ height: '200px', width: '100%', marginTop: '24px' }}>
        <ResponsiveContainer>
          <AreaChart
            data={mockDistributionData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="temp" unit="°C" />
            <YAxis unit="%" hide={true} />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Likelihood']}
              labelFormatter={(label) => `Temp: ${label}°C`}
            />
            <Area type="monotone" dataKey="probability" stroke="#1890ff" fill="#1890ff" fillOpacity={0.3} />
            
            {/* This red line indicates the forecast temperature */}
            <ReferenceLine x={forecastTemp} stroke="red" strokeWidth={2} />
            
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default DistributionGraph;