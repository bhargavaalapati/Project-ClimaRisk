import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Col, Row, Typography, Button, Skeleton, Card, DatePicker, Space } from 'antd';
import { toast } from 'sonner';
import { DownloadOutlined } from '@ant-design/icons';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Tooltip } from 'antd';
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const { Title, Text } = Typography;

dayjs.extend(utc);
dayjs.extend(timezone);

function DashboardPage() {
  const [searchParams] = useSearchParams();
  //const navigate = useNavigate();
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
  
  // ✅ 1. Add new state to store the initial, overall best day recommendation
  const [overallBestDay, setOverallBestDay] = useState(null);

  const { thresholds } = useSettings();

  useEffect(() => {
    async function fetchPlaceName() {
      if (!lat || !lon) return;
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        const data = await res.json();
        const shortName =
          data.city || data.locality || data.principalSubdivision || `Lat: ${lat}, Lon: ${lon}`;
        const parts = [data.locality, data.city, data.principalSubdivision, data.countryName]
          .filter(Boolean)
          .filter((item, idx, arr) => arr.indexOf(item) === idx)
          .filter((item) => item !== shortName);
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
          fetch(`${API_BASE_URL}/api/real/risk`),
          fetch(`${API_BASE_URL}/api/climatology`),
        ]);
        if (!dailyRes.ok || !climatologyRes.ok) throw new Error('Failed to fetch climate data');

        const dailyData = await dailyRes.json();
        const climatologyData = await climatologyRes.json();
        setRiskData({ daily: dailyData, climatology: climatologyData });

        // --- Initial Recommendation Logic ---
        const todiScores = dailyData.daily_summary.todi_score;
        const timestamps = dailyData.daily_summary.timestamps;

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

        if (bestDay.improvement <= 0) bestDay.improvement = 0;
        
        // ✅ 2. Set BOTH the main recommendation and the fallback "overall best day"
        setRecommendation(bestDay);
        setOverallBestDay(bestDay);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [lat, lon]);

  // ✅ 3. NEW useEffect to dynamically update recommendation when a date is selected
  useEffect(() => {
    // If no date is selected or data isn't loaded yet, show the overall best day recommendation
    if (!selectedDate || !riskData) {
      setRecommendation(overallBestDay);
      return;
    }

    const { timestamps, todi_score } = riskData.daily.daily_summary;
    
    // Find the data for the currently selected date
    const selectedIndex = timestamps.findIndex(ts => dayjs(ts).isSame(dayjs(selectedDate), 'day'));
    if (selectedIndex === -1) return;
    
    const selectedDayTodi = todi_score[selectedIndex];

    // Search for a better day *after* the selected date
    let saferDayFound = null;
    for (let i = selectedIndex + 1; i < timestamps.length; i++) {
      if (todi_score[i] < selectedDayTodi) {
        saferDayFound = {
          date: timestamps[i],
          todi: todi_score[i],
          improvement: Math.round(((selectedDayTodi - todi_score[i]) / selectedDayTodi) * 100),
          notes: `Based on your selection, this upcoming day is safer.`
        };
        break; // Stop at the first better day found
      }
    }

    // Update the recommendation state. If no safer day is found, this will be null, hiding the card.
    setRecommendation(saferDayFound);

  }, [selectedDate, riskData, overallBestDay]);


  // ... (the rest of your component remains exactly the same)
  // Handle click on a day
  const handleDayClick = (dayData) => {
    setSelectedDayForModal(dayData);
    setIsModalVisible(true);
    setSelectedDate(new Date(dayData.date));
  };

  const downloadJSON = (data) => {
    const fileName = `ClimaRisk_Report_${dayjs().format('YYYYMMDD_HHmmss')}.json`;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredRiskData = () => {
    if (!riskData) return null;
    if (selectedDate) {
      const index = riskData.daily.daily_summary.timestamps.findIndex(ts =>
        dayjs(ts).isSame(dayjs(selectedDate), 'day')
      );
      if (index === -1) return null;
      return {
        location: locationName || `Lat: ${lat}, Lon: ${lon}`,
        date: dayjs(selectedDate).format('YYYY-MM-DD'),
        max_temp_celsius: riskData.daily.daily_summary.max_temp_celsius[index],
        max_wind_speed_ms: riskData.daily.daily_summary.max_wind_speed_ms[index],
        todi_score: riskData.daily.daily_summary.todi_score[index],
      };
    } else {
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
    setLiveData(null);
    setLiveLog([]);
    const dateToFetch = dayjs(selectedDate || riskData.daily.daily_summary.timestamps[0]).format('YYYY-MM-DD');
    const eventSource = new EventSource(
      `${API_BASE_URL}/api/live-risk?lat=${lat}&lon=${lon}&date=${dateToFetch}`
    );
    toast.info('Starting live NASA analysis... See progress below.');
    eventSource.onmessage = (event) => {
      const logMessage = event.data;
      try {
        const parsed = JSON.parse(logMessage);
        if (parsed.error) {
          toast.error(parsed.error);
          eventSource.close();
          setIsFetchingLive(false);
          return;
        }
      } catch {
        // Not JSON, just a log line
      }
      setLiveLog(prevLogs => [...prevLogs, logMessage]);
    };
    eventSource.addEventListener('result', (event) => {
      const resultData = JSON.parse(event.data);
      setLiveData(resultData.liveData);
      setRecommendation(resultData.recommendation);
      toast.success("Live NASA data processed successfully!");
      eventSource.close();
      setIsFetchingLive(false);
    });
    eventSource.onerror = () => {
      toast.error("Connection to live analysis server failed.");
      eventSource.close();
      setIsFetchingLive(false);
    };
  };

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
            <Card>
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
            <Card style={{ marginTop: '24px' }}>
              <Skeleton.Image active style={{ width: '100%', height: '200px' }} />
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card>
              <Skeleton active paragraph={{ rows: 12 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (error) return <Text type="danger">{error}</Text>;

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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <Title level={4} style={{ margin: 0 }}>
          Climate Risk Analysis for {locationName || `Lat: ${lat || 'N/A'}, Lon: ${lon || 'N/A'}`}
        </Title>
        {fullAddress && (
          <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.55)', marginTop: '4px' }}>
            {fullAddress}
          </p>
        )}
        <Space>
          <DatePicker
            value={selectedDate ? dayjs(selectedDate) : null}
            onChange={(date) => setSelectedDate(date ? date.toDate() : null)}
            placeholder="Select date"
            disabledDate={(current) => {
              if (!riskData || !current) return true;
              const timestamps = riskData.daily.daily_summary.timestamps;
              const minDate = dayjs(timestamps[0]).startOf('year');
              const maxDate = dayjs(timestamps[timestamps.length - 1]).endOf('year');
              return current < minDate || current > maxDate;
            }}
          />
          <Button
            onClick={() => {
              setSelectedDate(null);
              setSelectedDayForModal(null);
              setLiveData(null);
            }}
            disabled={!selectedDate && !liveData}
          >
            Show All
          </Button>
          <Button onClick={handleFetchLive} loading={isFetchingLive} style={{ marginRight: '16px' }}>
            Perform Live NASA Analysis
          </Button>
          <Space size="middle">
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
                  >
                    {loading ? 'Generating PDF...' : 'Download PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
              ) : (
                <Button type="primary" icon={<DownloadOutlined />} disabled>
                  Data Unavailable
                </Button>
              )}
            </Tooltip>
            <Tooltip title="Download the report as a JSON file for further analysis">
              <Button
                type="default"
                icon={<DownloadOutlined />}
                disabled={!riskData}
                onClick={() => {
                  const filteredData = getFilteredRiskData();
                  if (!filteredData) return toast.error("No data to download for this day");
                  downloadJSON(filteredData);
                }}
              >
                Download JSON
              </Button>
            </Tooltip>
          </Space>
        </Space>
      </div>
      {isFetchingLive && (
      <Card title="Live Analysis Progress" style={{marginTop: '24px'}}>
        <div style={{backgroundColor: '#001529', color: 'rgba(255,255,255,0.65)', padding: '16px', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace'}}>
          {liveLog.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </Card>
      )}
      {liveData && (
        <>
          <LiveRiskTiles liveData={liveData} /> 
          <LiveRiskCard liveData={liveData} /> 
        </>
      )}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <TodiGauge score={selectedDayData.todiScore} />
        </Col>
        <Col xs={24} lg={16}>
          <KeyIndicators data={riskData} loading={loading} selectedDate={selectedDate} onDayClick={handleDayClick} />
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <RecommendationCard recommendation={recommendation} onSelect={setSelectedDate} /> 
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <DistributionGraph data={riskData} thresholds={thresholds} selectedDate={selectedDate || (riskData ? new Date(riskData.daily.daily_summary.timestamps[0]) : null)} />
        </Col>
      </Row>
      <DetailedDayModal isVisible={isModalVisible} dayData={selectedDayForModal} onCancel={() => setIsModalVisible(false)} />
    </div>
  );
}

export default DashboardPage;