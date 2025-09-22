import React from 'react';
import { List, Typography, Tag } from 'antd';
import { useSettings } from '../../context/settings';

const { Text } = Typography;

// Helper to get the day of the year (1-366)
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

function KeyIndicators({ data, loading }) {
  const { threshold: customThreshold } = useSettings();

  if (!data || !data.daily || !data.climatology) return <List loading={loading} />;

  const { daily_summary } = data.daily;
  const { daily_climatology } = data.climatology;

  const listData = daily_summary.timestamps.map((ts, index) => {
    const dayOfYear = getDayOfYear(new Date(ts));
    
    // FINAL FIX: Convert dayOfYear to a string to match the JSON key
    const threshold = daily_climatology[String(dayOfYear)]?.[`p${customThreshold}_temp_celsius`];
    const rainProb = daily_climatology[String(dayOfYear)]?.rain_probability_percent;
    
    const temp = daily_summary.max_temp_celsius[index];
    const isVeryHot = threshold != null ? temp > threshold : false; // Use != null for a robust check

    return {
      date: new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      temp: (temp || 0).toFixed(1),
      wind: (daily_summary.max_wind_speed_ms[index] || 0).toFixed(1),
      precip: rainProb != null ? `${Math.round(rainProb)}%` : 'N/A',
      isVeryHot,
    };
  });

  return (
    <List
      header={<div style={{fontWeight: 'bold'}}>Daily Summary vs. Historical Norms</div>}
      bordered
      dataSource={listData}
      loading={loading}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={item.date}
            description={
              item.isVeryHot ? 
              <Tag color="red">{`Exceeds ${customThreshold}th Percentile`}</Tag> : 
              <Tag color="blue">Normal Temperature Range</Tag>
            }
          />
          <Text>Temp: {item.temp}°C | Wind: {item.wind} m/s | Rain Prob: {item.precip}</Text>
        </List.Item>
      )}
    />
  );
}

export default KeyIndicators;