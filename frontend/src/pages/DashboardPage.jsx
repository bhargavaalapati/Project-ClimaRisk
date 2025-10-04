import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Col, Row, Typography, Button, Skeleton, Card, DatePicker, Space, Divider, Alert } from 'antd';
import { toast } from 'sonner';
import { DownloadOutlined, EnvironmentOutlined, ReloadOutlined, CalendarOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Tooltip } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import TodiGauge from '../components/Dashboard/TodiGauge';
import KeyIndicators from '../components/Dashboard/KeyIndicators';
import DistributionGraph from '../components/Dashboard/DistributionGraph';
import DetailedDayModal from '../components/Dashboard/DetailedDayModal';
import { useSettings } from '../context/settings';
import ReportPDF from '../components/Dashboard/ReportPDF';
import LiveRiskCard from '../components/Dashboard/LiveRiskCard';
import LiveRiskTiles from "../components/Dashboard/LiveRiskTiles";
import RecommendationCard from '../components/Dashboard/RecommendationCard';

const { Title, Text } = Typography;

dayjs.extend(utc);
dayjs.extend(timezone);

function DashboardPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDayForModal, setSelectedDayForModal] = useState(null);
  const [liveLog, setLiveLog] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [locationName, setLocationName] = useState(null);
const [fullAddress, setFullAddress] = useState(null);


  const { thresholds } = useSettings();


useEffect(() => {
  async function fetchPlaceName() {
    if (!lat || !lon) return;
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await res.json();

      // Short name (priority: city > locality > subdivision)
      const shortName =
        data.city || data.locality || data.principalSubdivision || `Lat: ${lat}, Lon: ${lon}`;

      // Build full address, remove duplicates + exclude shortName
      const parts = [data.locality, data.city, data.principalSubdivision, data.countryName]
        .filter(Boolean)
        .filter((item, idx, arr) => arr.indexOf(item) === idx) // remove exact duplicates
        .filter((item) => item !== shortName); // avoid repeating shortName

      const full = parts.join(", ");

      setLocationName(shortName);
      setFullAddress(full || null);
    } catch {
      setLocationName(`Lat: ${lat}, Lon: ${lon}`);
      setFullAddress(null);
    }
  }
  fetchPlaceName();
}, [lat, lon]);
 
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

      // --- UPDATED: Recommendation Logic ---
      const todiScores = dailyData.daily_summary.todi_score;
      const timestamps = dailyData.daily_summary.timestamps;

      // Find the day with the lowest TODI score
      let lowestTodi = todiScores[0];
      let bestDay = { date: timestamps[0], todi: lowestTodi, improvement: 0 };

      todiScores.forEach((score, index) => {
        if (score < lowestTodi) {
          lowestTodi = score;
          bestDay = {
            date: timestamps[index],
            todi: score,
            improvement: Math.round(((todiScores[0] - score) / todiScores[0]) * 100),
          };
        }
      });

      // Only mark improvement if it's positive; otherwise set improvement 0
      if (bestDay.improvement <= 0) bestDay.improvement = 0;

      setRecommendation(bestDay); // Always set a valid recommendation object
      //console.log('Best day recommendation:', bestDay);
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

  const downloadJSON = (data) => {
  const fileName = `ClimaRisk_Report_${dayjs().format('YYYYMMDD_HHmmss')}.json`;
  const jsonStr = JSON.stringify(data, null, 2); // Pretty print
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url); // Clean up
};

const getFilteredRiskData = () => {
  if (!riskData) return null;

  if (selectedDate) {
    const index = riskData.daily.daily_summary.timestamps.findIndex(ts =>
      dayjs(ts).isSame(dayjs(selectedDate), 'day')
    );

    if (index === -1) return null;

    // Only include selected day
    return {
      location: locationName || `Lat: ${lat}, Lon: ${lon}`,
      date: dayjs(selectedDate).format('YYYY-MM-DD'),
      max_temp_celsius: riskData.daily.daily_summary.max_temp_celsius[index],
      max_wind_speed_ms: riskData.daily.daily_summary.max_wind_speed_ms[index],
      todi_score: riskData.daily.daily_summary.todi_score[index],
    };
  } else {
    // fallback: maybe return first day or last 7 days
    return {
      location: locationName || `Lat: ${lat}, Lon: ${lon}`,
      data_summary: riskData.daily.daily_summary.timestamps.map((ts, idx) => ({
        date: ts,
        max_temp_celsius: riskData.daily.daily_summary.max_temp_celsius[idx],
        max_wind_speed_ms: riskData.daily.daily_summary.max_wind_speed_ms[idx],
        todi_score: riskData.daily.daily_summary.todi_score[idx],
      })),
    };
  }
};

  const handleFetchLive = () => {
  if (!riskData) return;
  setIsFetchingLive(true);
  setLiveData(null); // Clear old results
  setLiveLog([]); // Clear old logs

  const dateToFetch = dayjs(selectedDate || riskData.daily.daily_summary.timestamps[0]).format('YYYY-MM-DD');
  
  // Use EventSource to connect to the streaming endpoint
  const eventSource = new EventSource(`http://localhost:8000/api/live-risk?lat=${lat}&lon=${lon}&date=${dateToFetch}`);

  toast.info('Starting live NASA analysis... See progress below.');

  // Listen for standard log messages
  eventSource.onmessage = (event) => {
    const logMessage = event.data;
    // Check for error messages from the stream
    try {
        const parsed = JSON.parse(logMessage);
        if (parsed.error) {
            toast.error(parsed.error);
            eventSource.close();
            setIsFetchingLive(false);
            return;
        }
    } catch {
        // It's a normal log message, not a JSON error
    }
    setLiveLog(prevLogs => [...prevLogs, logMessage]);
  };

  // Listen for the special 'result' event with the final JSON
  eventSource.addEventListener('result', (event) => {
    const resultData = JSON.parse(event.data);
    setLiveData(resultData.liveData);
    setRecommendation(resultData.recommendation);
    toast.success("Live NASA data processed successfully!");
    eventSource.close(); // We're done, close the connection
    setIsFetchingLive(false);
  });

  // Handle any connection errors
  eventSource.onerror = () => {
    toast.error("Connection to live analysis server failed.");
    eventSource.close();
    setIsFetchingLive(false);
  };
};

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <Card className="mb-6 shadow-sm" styles={{ body: { padding: '24px 32px' } }}>
          <Skeleton active paragraph={{ rows: 2 }} />
        </Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card className="shadow-sm">
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card className="shadow-sm">
              <Skeleton active paragraph={{ rows: 10 }} />
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 24]} className="mt-6">
          <Col xs={24}>
            <Card className="shadow-sm">
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 24]} className="mt-6">
          <Col xs={24}>
            <Card className="shadow-sm">
              <Skeleton.Image active style={{ width: '100%', height: '300px' }} />
            </Card>
          </Col>
        </Row>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto mt-12"
      >
        <Alert
          message="Error Loading Climate Data"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </motion.div>
    );
  }

  const displayIndex = (() => {
    if (!riskData) return -1;
    if (!selectedDate) return 0;
    return riskData.daily.daily_summary.timestamps.findIndex((ts) =>
      dayjs(ts).utc().isSame(dayjs(selectedDate).utc(), 'minute')
    );
  })();

  const selectedDayData = (() => {
    if (!riskData || displayIndex === -1) return { todiScore: 0, forecastTemp: null };
    const { todi_score, max_temp_celsius } = riskData.daily.daily_summary;
    return {
      todiScore: todi_score[displayIndex],
      forecastTemp: max_temp_celsius[displayIndex],
    };
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <Card className="mb-6 shadow-sm border-0" styles={{ body: { padding: '24px 32px' } }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={12}>
            <Space direction="vertical" size={0}>
              <Title level={3} className="mb-1">
                <EnvironmentOutlined className="mr-2 text-blue-600" />
                {locationName || `Lat: ${lat || 'N/A'}, Lon: ${lon || 'N/A'}`}
              </Title>
              {fullAddress && (
                <Text type="secondary" className="text-base">
                  {fullAddress}
                </Text>
              )}
            </Space>
          </Col>
          <Col xs={24} lg={12} className="text-right">
            <Space wrap>
              <DatePicker
                value={selectedDate ? dayjs(selectedDate) : null}
                onChange={(date) => setSelectedDate(date ? date.toDate() : null)}
                placeholder="Filter by date"
                suffixIcon={<CalendarOutlined />}
                size="large"
                disabledDate={(current) => {
                  if (!riskData || !current) return true;
                  const timestamps = riskData.daily.daily_summary.timestamps;
                  const minDate = dayjs(timestamps[0]).startOf('year');
                  const maxDate = dayjs(timestamps[timestamps.length - 1]).endOf('year');
                  return current < minDate || current > maxDate;
                }}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedDayForModal(null);
                  setLiveData(null);
                  navigate(0);
                }}
                disabled={!selectedDate && !liveData}
                size="large"
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider className="my-4" />

        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={12}>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleFetchLive}
              loading={isFetchingLive}
              size="large"
            >
              Perform Live NASA Analysis
            </Button>
          </Col>
          <Col xs={24} md={12} className="text-right">
            <Space wrap>
              <Tooltip title="Download the full report as a PDF document">
                {riskData ? (
                  <PDFDownloadLink
                    document={<ReportPDF data={riskData} selectedDate={selectedDate} thresholds={thresholds} locationName={locationName} />}
                    fileName={`ClimaRisk_Report_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        disabled={loading || !riskData}
                        size="large"
                      >
                        {loading ? 'Generating...' : 'PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                ) : (
                  <Button type="primary" icon={<DownloadOutlined />} disabled size="large">
                    PDF
                  </Button>
                )}
              </Tooltip>

              <Tooltip title="Download the report as a JSON file for further analysis">
                <Button
                  icon={<DownloadOutlined />}
                  disabled={!riskData}
                  onClick={() => {
                    const filteredData = getFilteredRiskData();
                    if (!filteredData) return toast.error("No data to download for this day");
                    downloadJSON(filteredData);
                  }}
                  size="large"
                >
                  JSON
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {isFetchingLive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card
            title={<><ThunderboltOutlined className="mr-2" />Live Analysis Progress</>}
            className="mb-6 shadow-sm"
            styles={{ body: { padding: '0' } }}
          >
            <div className="bg-gray-900 text-gray-300 p-4 font-mono text-sm overflow-y-auto" style={{ maxHeight: '250px' }}>
              {liveLog.length === 0 ? (
                <Text type="secondary">Initializing analysis...</Text>
              ) : (
                liveLog.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="py-1"
                  >
                    {log}
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {liveData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Alert
            message="Live NASA Data Available"
            description="The analysis below uses real-time NASA satellite data for enhanced accuracy."
            type="success"
            showIcon
            className="mb-6"
          />
          <LiveRiskTiles liveData={liveData} />
          <LiveRiskCard liveData={liveData} />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <TodiGauge score={selectedDayData.todiScore} />
          </Col>
          <Col xs={24} lg={16}>
            <KeyIndicators data={riskData} loading={loading} selectedDate={selectedDate} onDayClick={handleDayClick} />
          </Col>
        </Row>

        <Row gutter={[24, 24]} className="mt-6">
          <Col xs={24}>
            <RecommendationCard recommendation={recommendation} onSelect={setSelectedDate} />
          </Col>
        </Row>

        <Row gutter={[24, 24]} className="mt-6">
          <Col xs={24}>
            <DistributionGraph data={riskData} thresholds={thresholds} selectedDate={selectedDate || (riskData ? new Date(riskData.daily.daily_summary.timestamps[0]) : null)} />
          </Col>
        </Row>
      </motion.div>

      {/* Detailed day modal */}
      <DetailedDayModal isVisible={isModalVisible} dayData={selectedDayForModal} onCancel={() => setIsModalVisible(false)} />
    </div>
  );
}

export default DashboardPage;
