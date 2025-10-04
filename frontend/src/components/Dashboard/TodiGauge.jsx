import React from 'react';
import { Card, Progress, Statistic, Typography, Space } from 'antd';
import { motion } from 'framer-motion';
import { ThunderboltOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

function TodiGauge({ score, loading }) {
  let status = 'success', description = 'Low Discomfort', color = '#52c41a', icon = null;
  if (score > 40) { status = 'normal'; description = 'Moderate Discomfort'; color = '#1890ff'; }
  if (score > 70) { status = 'warning'; description = 'High Discomfort'; color = '#faad14'; }
  if (score > 85) { status = 'exception'; description = 'Extreme Discomfort'; color = '#ff4d4f'; icon = <ThunderboltOutlined />; }

  return (
    <Card
      loading={loading}
      className="shadow-sm h-full"
      styles={{ body: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' } }}
    >
      <div>
        <Text type="secondary" className="text-sm uppercase tracking-wide">
          Total Outdoor Discomfort Index
        </Text>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="my-4"
        >
          <Title level={1} className="mb-0" style={{ fontSize: '48px', color }}>
            {score}
            {icon && <span className="ml-2">{icon}</span>}
          </Title>
        </motion.div>
      </div>

      <div className="text-center mt-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Progress
            type="dashboard"
            percent={score}
            status={status}
            format={() => ''}
            strokeWidth={12}
            size={180}
          />
        </motion.div>
        <Space direction="vertical" size={4} className="mt-4">
          <Text strong className="text-base" style={{ color }}>
            {description}
          </Text>
          <Text type="secondary" className="text-xs">
            Based on temperature, wind, and precipitation
          </Text>
        </Space>
      </div>
    </Card>
  );
}

export default TodiGauge;