import React from 'react';
import { List, Typography, Tag, Card, Space } from 'antd';
import { useSettings } from '../../context/settings';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const { Text } = Typography;

const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Animation variants
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

function KeyIndicators({ data, loading, selectedDate, onDayClick }) {
  const { thresholds } = useSettings();
  if (!data || !data.daily || !data.climatology) return <List loading={loading} />;

  const { daily_summary } = data.daily;
  const { daily_climatology } = data.climatology;

  const allDaysData = daily_summary.timestamps.map((ts, index) => {
    const dayOfYear = getDayOfYear(new Date(ts));
    const climeData = daily_climatology[String(dayOfYear)];

    const temp = daily_summary.max_temp_celsius[index];
    const wind = daily_summary.max_wind_speed_ms[index];
    const rain = climeData?.rain_probability_percent ?? 0;

    return {
      date: ts,
      temp: temp.toFixed(1),
      wind: wind.toFixed(1),
      rain: rain,
      isVeryHot: climeData?.[`p${thresholds.veryHot}_temp_celsius`] != null ? temp > climeData[`p${thresholds.veryHot}_temp_celsius`] : false,
      isVeryCold: climeData?.[`p${thresholds.veryCold}_temp_celsius`] != null ? temp < climeData[`p${thresholds.veryCold}_temp_celsius`] : false,
      isVeryWindy: climeData?.[`p${thresholds.veryWindy}_wind_speed_ms`] != null ? wind > climeData[`p${thresholds.veryWindy}_wind_speed_ms`] : false,
      isRainy: thresholds.rainProbability != null ? rain >= thresholds.rainProbability : rain >= 50,
    };
  });

  const listData = selectedDate ? allDaysData.filter(item => dayjs(item.date).isSame(selectedDate, 'day')) : allDaysData;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card
        title={
          <Space>
            <Text strong>Daily Summary vs. Historical Norms</Text>
            <Text type="secondary" className="font-normal text-sm">(Click for details)</Text>
          </Space>
        }
        className="shadow-sm"
        styles={{ body: { padding: '0' } }}
      >
        <List
          dataSource={listData}
          loading={loading}
          pagination={{ pageSize: 7, align: 'center', hideOnSinglePage: true, style: { padding: '16px' } }}
          renderItem={(item, index) => (
            <motion.div variants={itemVariants} key={item.date}>
              <List.Item
                onClick={() =>
                  onDayClick({
                    ...item,
                    todi: daily_summary.todi_score[index],
                    rainProb: item.rain,
                  })
                }
                className="hover:bg-blue-50 cursor-pointer transition-colors px-6 py-4"
              >
                <List.Item.Meta
                  title={
                    <Text strong className="text-base">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  }
                  description={
                    <div className="flex gap-2 flex-wrap mt-2">
                      {item.isVeryHot && <Tag color="red">Very Hot</Tag>}
                      {item.isVeryCold && <Tag color="blue">Very Cold</Tag>}
                      {item.isVeryWindy && <Tag color="purple">Very Windy</Tag>}
                      {item.isRainy && <Tag color="cyan">Very Wet</Tag>}
                      {!item.isVeryHot && !item.isVeryCold && !item.isVeryWindy && !item.isRainy && (
                        <Tag color="green">Normal</Tag>
                      )}
                    </div>
                  }
                />
                <Space direction="vertical" align="end" size={0}>
                  <Text className="text-sm">
                    <Text type="secondary">Temp:</Text> <Text strong>{item.temp}°C</Text>
                  </Text>
                  <Text className="text-sm">
                    <Text type="secondary">Wind:</Text> <Text strong>{item.wind} m/s</Text>
                  </Text>
                  <Text className="text-sm">
                    <Text type="secondary">Rain:</Text> <Text strong>{item.rain}%</Text>
                  </Text>
                </Space>
              </List.Item>
            </motion.div>
          )}
        />
      </Card>
    </motion.div>
  );
}

export default KeyIndicators;