import React from 'react';

// A simple helper to format the title and text for the PDF
const styles = {
  page: { width: '210mm', padding: '20mm', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#003a8c' },
  subtitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', marginTop: '24px', borderBottom: '1px solid #eee', paddingBottom: '8px' },
  paragraph: { fontSize: '12px', lineHeight: '1.6' },
};

const ReportComponent = React.forwardRef(({ data }, ref) => {
  if (!data) return null;

  const { daily, climatology } = data;
  const firstDay = daily.daily_summary;
  const dayOfYear = new Date(firstDay.timestamps[0]).getDay() + 151; // Simplified for June
  const clime = climatology.daily_climatology[dayOfYear];

  return (
    <div ref={ref} style={styles.page}>
      <p style={styles.title}>🚀 ClimaRisk Report</p>
      <div style={styles.paragraph}>
        <p><strong>Location:</strong> {daily.location}</p>
        <p><strong>Date Analyzed:</strong> {new Date(firstDay.timestamps[0]).toLocaleDateString()}</p>
      </div>

      <p style={styles.subtitle}>Daily Summary</p>
      <div style={styles.paragraph}>
        <p><strong>Max Temperature:</strong> {firstDay.max_temp_celsius[0].toFixed(1)}°C</p>
        <p><strong>Max Wind Speed:</strong> {firstDay.max_wind_speed_ms[0].toFixed(1)} m/s</p>
        <p><strong>Total Outdoor Discomfort Index (TODI):</strong> {firstDay.todi_score[0]}/100</p>
      </div>

      <p style={styles.subtitle}>Historical Context (based on 30-year data)</p>
      <div style={styles.paragraph}>
        <p><strong>95th Percentile "Very Hot" Threshold:</strong> {clime?.p95_temp_celsius}°C</p>
        <p><strong>Historical Probability of Rain:</strong> {clime?.rain_probability_percent}%</p>
      </div>
    </div>
  );
});

export default ReportComponent;