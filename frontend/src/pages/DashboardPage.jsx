import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Col, Row, Typography, Button, Skeleton, Card, DatePicker, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { PDFDownloadLink } from '@react-pdf/renderer';
import dayjs from 'dayjs';

import TodiGauge from '../components/Dashboard/TodiGauge';
import KeyIndicators from '../components/Dashboard/KeyIndicators';
import DistributionGraph from '../components/Dashboard/DistributionGraph';
import DetailedDayModal from '../components/Dashboard/DetailedDayModal';
import { useSettings } from '../context/settings';
import ReportPDF from '../components/Dashboard/ReportPDF'; // New PDF component

const { Title, Text } = Typography;

function DashboardPage() {
  const [searchParams] = useSearchParams();
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDayForModal, setSelectedDayForModal] = useState(null);

  const { thresholds } = useSettings(); // Thresholds from context

  // Fetch climate data
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const [dailyRes, climatologyRes] = await Promise.all([
          fetch('http://localhost:8000/api/real/risk'),
          fetch('http://localhost:8000/api/climatology'),
        ]);
        if (!dailyRes.ok || !climatologyRes.ok) throw new Error('Failed to fetch climate data');

        const dailyData = await dailyRes.json();
        const climatologyData = await climatologyRes.json();
        setRiskData({ daily: dailyData, climatology: climatologyData });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [lat, lon]);

  // Handle click on a day
  const handleDayClick = (dayData) => {
    setSelectedDayForModal(dayData);
    setIsModalVisible(true);
    setSelectedDate(new Date(dayData.date));
  };

  // Safety fallback for first date
  const firstDate =
    riskData?.daily?.daily_summary?.timestamps?.[0]
      ? new Date(riskData.daily.daily_summary.timestamps[0])
      : new Date();

  const displayIndex =
    selectedDate && riskData?.daily?.daily_summary?.timestamps
      ? riskData.daily.daily_summary.timestamps.findIndex((ts) =>
          dayjs(ts).isSame(selectedDate, 'day')
        )
      : -1;

  const selectedDayData =
    displayIndex !== -1
      ? {
          todiScore: riskData.daily.daily_summary.todi_score?.[displayIndex] ?? 0,
          forecastTemp: riskData.daily.daily_summary.max_temp_celsius?.[displayIndex] ?? null,
        }
      : { todiScore: 0, forecastTemp: null };

  // Loading state
  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={4} style={{ margin: 0 }}>
            <Skeleton.Input active size="small" style={{ width: '400px' }} />
          </Title>
          <Skeleton.Button active />
        </div>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card><Skeleton active paragraph={{ rows: 8 }} /></Card>
            <Card style={{ marginTop: '24px' }}><Skeleton.Image active style={{ width: '100%', height: '200px' }} /></Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card><Skeleton active paragraph={{ rows: 12 }} /></Card>
          </Col>
        </Row>
      </div>
    );
  }

  // Error state
  if (error) return <Text type="danger">{error}</Text>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <Title level={4} style={{ margin: 0 }}>
          Climate Risk Analysis for Lat: {lat}, Lon: {lon}
        </Title>
        <Space>
          <DatePicker
            value={selectedDate ? dayjs(selectedDate) : null}
            onChange={(date) => setSelectedDate(date ? date.toDate() : null)}
            placeholder="Select date"
            disabledDate={(current) => current && current.year() !== 2023}
          />
          <Button onClick={() => setSelectedDate(null)} disabled={!selectedDate}>
            Show All Days
          </Button>
          {riskData && (
            <PDFDownloadLink
              document={
                <ReportPDF
                  data={riskData}
                  selectedDate={selectedDate || firstDate}
                  thresholds={thresholds}
                />
              }
              fileName="ClimaRisk_Report.pdf"
            >
              {({ loading }) => (
                <Button type="primary" icon={<DownloadOutlined />}>
                  {loading ? 'Generating PDF...' : 'Download Report (PDF)'}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </Space>
      </div>

      {/* Main Dashboard */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <TodiGauge score={selectedDayData.todiScore} />
        </Col>
        <Col xs={24} lg={16}>
          <KeyIndicators
            data={riskData}
            loading={loading}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <DistributionGraph
            data={riskData}
            thresholds={thresholds}
            selectedDate={selectedDate || firstDate}
          />
        </Col>
      </Row>

      {/* Detailed day modal */}
      <DetailedDayModal
        isVisible={isModalVisible}
        dayData={selectedDayForModal}
        onCancel={() => setIsModalVisible(false)}
      />
    </div>
  );
}

export default DashboardPage;
