import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Col, Row, Typography, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import TodiGauge from '../components/Dashboard/TodiGauge';
import KeyIndicators from '../components/Dashboard/KeyIndicators';
import DistributionGraph from '../components/Dashboard/DistributionGraph';
import ReportComponent from '../components/Dashboard/ReportComponent'; // Import the new component

// Import the PDF libraries
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;

function DashboardPage() {
  const [searchParams] = useSearchParams();
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(); // Create a ref to reference the report component

  useEffect(() => {
    // Data fetching logic is unchanged
    const getData = async () => {
      try {
        setLoading(true);
        const [dailyRes, climatologyRes] = await Promise.all([
          fetch('http://localhost:8000/api/real/risk'),
          fetch('http://localhost:8000/api/climatology')
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

  // NEW: PDF Download Handler
  const handleDownloadPdf = () => {
    const input = reportRef.current;
    if (!input) return;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ClimaRisk_Report.pdf');
    });
  };

  if (error) return <Text type="danger">Error: {error}</Text>;
  
  const todiScore = riskData ? riskData.daily.daily_summary.todi_score[0] : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={4} style={{ margin: 0 }}>
          Climate Risk Analysis for Lat: {lat}, Lon: {lon}
        </Title>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />} 
          onClick={handleDownloadPdf} // Connect to the new PDF handler
          disabled={loading || !riskData}
        >
          Download Report (PDF)
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <TodiGauge score={todiScore} loading={loading} />
          <DistributionGraph loading={loading} />
        </Col>
        <Col xs={24} md={16}>
          <KeyIndicators data={riskData} loading={loading} />
        </Col>
      </Row>

      {/* A hidden component used only for generating the PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
        <ReportComponent ref={reportRef} data={riskData} />
      </div>
    </div>
  );
}

export default DashboardPage;