// components/Dashboard/LiveRiskCard.jsx
import React from 'react';
import { Card, Row, Col, Typography, Progress, Tag } from 'antd';
import TodiGauge from './TodiGauge';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function LiveRiskCard({ liveData }) {
  if (!liveData) return null;

  // Extract values safely from daily_summary arrays
  const dailySummary = liveData.daily_summary || {};
  const todi_score = dailySummary.todi_score ? dailySummary.todi_score[0] : null;
  const max_temp_celsius = dailySummary.max_temp_celsius ? dailySummary.max_temp_celsius[0] : null;
  const min_temp_celsius = dailySummary.min_temp_celsius ? dailySummary.min_temp_celsius[0] : null;
  const other_info = liveData.location || '-';
  const fetched_at = liveData.fetched_at || dayjs().toISOString();

  // Determine Todi score color
  const getTodiColor = (score) => {
    if (score == null) return '#d9d9d9'; // gray for missing
    if (score < 3) return '#52c41a'; // green → low risk
    if (score < 7) return '#faad14'; // orange → medium risk
    return '#f5222d'; // red → high risk
  };

  // Determine temp color (blue if cold, orange/red if hot)
  const getTempColor = (temp) => {
    if (temp == null) return '#d9d9d9';
    if (temp <= 20) return '#1890ff'; // blue
    if (temp <= 35) return '#faad14'; // orange
    return '#f5222d'; // red
  };

  const formattedFetchedAt = dayjs(fetched_at).format('YYYY-MM-DD HH:mm:ss');

  return (
    <Card
      style={{ marginBottom: '24px' }}
      title="Live NASA Risk Data"
      extra={<Tag color="blue">Last updated: {formattedFetchedAt}</Tag>}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Text strong>Todi Score</Text>
          <TodiGauge score={todi_score || 0} color={getTodiColor(todi_score)} />
          <div style={{ marginTop: '4px', color: getTodiColor(todi_score) }}>
            {todi_score != null ? `${todi_score} / 10` : '-'}
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Text strong>Max Temp (°C)</Text>
          <Progress
            percent={max_temp_celsius != null ? Math.min(max_temp_celsius * 2, 100) : 0}
            format={() => (max_temp_celsius != null ? `${max_temp_celsius.toFixed(1)}°C` : '-')}
            strokeColor={getTempColor(max_temp_celsius)}
            status="active"
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Text strong>Min Temp (°C)</Text>
          <Progress
            percent={min_temp_celsius != null ? Math.min(min_temp_celsius * 2, 100) : 0}
            format={() => (min_temp_celsius != null ? `${min_temp_celsius.toFixed(1)}°C` : '-')}
            strokeColor={getTempColor(min_temp_celsius)}
            status="active"
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Text strong>Other Info</Text>
          <div style={{ marginTop: '4px', wordBreak: 'break-word' }}>{other_info}</div>
        </Col>
      </Row>
    </Card>
  );
}

export default LiveRiskCard;
