import React from 'react';
import { Card, Progress, Statistic, Typography } from 'antd';

const { Text } = Typography;

function TodiGauge({ score, loading }) {
  // Determine color and description based on the score
  let status = 'success'; // Green for low scores
  let description = 'Low Discomfort';
  if (score > 40) {
    status = 'normal'; // Blue for moderate scores
    description = 'Moderate Discomfort';
  }
  if (score > 70) {
    status = 'warning'; // Orange for high scores
    description = 'High Discomfort';
  }
  if (score > 85) {
    status = 'exception'; // Red for very high scores
    description = 'Extreme Discomfort';
  }

  return (
    <Card loading={loading}>
      <Statistic title="Total Outdoor Discomfort Index (TODI)" value={score} />
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Progress
          type="dashboard"
          percent={score}
          status={status}
          format={(percent) => `${percent}`}
          strokeWidth={10}
        />
        <Text style={{ display: 'block', marginTop: '16px' }} type="secondary">
          {description}
        </Text>
      </div>
    </Card>
  );
}

export default TodiGauge;