import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import dayjs from 'dayjs';

function DistributionGraph({ data, thresholds, selectedDate }) {
  if (!data || !data.daily || !data.climatology) return null;

  const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff =
      date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  let chartData = data.daily.daily_summary.timestamps.map((ts, i) => {
    const dayOfYear = getDayOfYear(new Date(ts));
    const climeData = data.climatology.daily_climatology[String(dayOfYear)];

    const temp = Number(data.daily.daily_summary.max_temp_celsius[i].toFixed(1));
    const wind = Number(data.daily.daily_summary.max_wind_speed_ms[i].toFixed(1));
    const rain = Number((climeData?.rain_probability_percent ?? 0).toFixed(1));

    const isHot =
      climeData?.[`p${thresholds.veryHot}_temp_celsius`] != null
        ? temp > climeData[`p${thresholds.veryHot}_temp_celsius`]
        : false;
    const isCold =
      climeData?.[`p${thresholds.veryCold}_temp_celsius`] != null
        ? temp < climeData[`p${thresholds.veryCold}_temp_celsius`]
        : false;
    const isWindy =
      climeData?.[`p${thresholds.veryWindy}_wind_speed_ms`] != null
        ? wind > climeData[`p${thresholds.veryWindy}_wind_speed_ms`]
        : false;
    const isRainy =
      thresholds.rainProbability != null
        ? rain >= thresholds.rainProbability
        : rain >= 50;

    const colorTemp = isHot
      ? 'url(#hotGradient)'
      : isCold
      ? 'url(#coldGradient)'
      : 'url(#tempNormalGradient)';
    const colorWind = isWindy ? 'url(#windGradient)' : 'url(#windNormalGradient)';
    const colorRain = isRainy ? 'url(#rainGradient)' : 'url(#rainNormalGradient)';

    return { date: ts, temp, wind, rain, colorTemp, colorWind, colorRain, isHot, isCold, isWindy, isRainy };
  });

  if (selectedDate) {
    chartData = chartData.filter((entry) =>
      dayjs(entry.date).isSame(selectedDate, 'minute')
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const entry = payload[0].payload;
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: '12px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        minWidth: '200px',
        fontSize: '0.9rem'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
          {new Date(entry.date).toLocaleString()}
        </div>
        <div>🌡 Temp: {entry.temp}°C {entry.isHot ? '🔥 Very Hot' : entry.isCold ? '❄️ Very Cold' : '✅ Normal'}</div>
        <div>💨 Wind: {entry.wind} m/s {entry.isWindy ? '💨 Very Windy' : '✅ Normal'}</div>
        <div>🌧 Rain: {entry.rain}% {entry.isRainy ? '☔ Risk' : '✅ Normal'}</div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={450}>
      <BarChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 5 }} barSize={25}>
        <defs>
          <linearGradient id="hotGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#ff7875" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="coldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1890ff" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#69c0ff" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="tempNormalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a0c4ff" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#d0e7ff" stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#722ed1" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#b37feb" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="windNormalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d3adf7" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#f0e5ff" stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#13c2c2" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#36cfc9" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="rainNormalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#87e8de" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#e6fffb" stopOpacity={0.4} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="date"
          tickFormatter={(val) =>
            new Date(val).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          }
          tick={{ fontSize: 12, fill: '#555' }}
        />
        <YAxis tick={{ fontSize: 12, fill: '#555' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="temp" isAnimationActive animationDuration={1000}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-temp-${index}`} fill={entry.colorTemp} />
          ))}
        </Bar>
        <Bar dataKey="wind" isAnimationActive animationDuration={1000}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-wind-${index}`} fill={entry.colorWind} />
          ))}
        </Bar>
        <Bar dataKey="rain" isAnimationActive animationDuration={1000}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-rain-${index}`} fill={entry.colorRain} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default DistributionGraph;
