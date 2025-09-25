import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

function DistributionGraph({ data, thresholds, selectedDate }) {
  if (!data || !data.daily || !data.climatology) return null;

  // Utility: get day of year
  const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  let chartData = data.daily.daily_summary.timestamps.map((ts, i) => {
    const dayOfYear = getDayOfYear(new Date(ts));
    const climeData = data.climatology.daily_climatology[String(dayOfYear)];

    const temp = Number(data.daily.daily_summary.max_temp_celsius[i].toFixed(1));
    const wind = Number(data.daily.daily_summary.max_wind_speed_ms[i].toFixed(1));
    const rain = Number((climeData?.rain_probability_percent ?? 0).toFixed(1));

    // Determine risk flags
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
    const isRainy = thresholds.rainProbability != null ? rain >= thresholds.rainProbability : rain >= 50;

    // Assign a color for bar based on priority: Hot > Cold > Windy > Rainy
    let color = 'gray';
    if (isHot) color = 'red';
    else if (isCold) color = 'blue';
    else if (isWindy) color = 'purple';
    else if (isRainy) color = 'cyan';

    return {
      date: ts,
      temp,
      wind,
      rain,
      color,
      isHot,
      isCold,
      isWindy,
      isRainy,
    };
  });

  // Filter if user picked a specific date
  if (selectedDate) {
    const selDay = getDayOfYear(selectedDate);
    chartData = chartData.filter((entry) => getDayOfYear(new Date(entry.date)) === selDay);
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(val) =>
            new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          }
        />
        <YAxis />
        <Tooltip
          formatter={(value, name, props) => {
            const { payload } = props;
            if (name === 'temp') return [`${value}°C`, payload.isHot ? 'Very Hot' : payload.isCold ? 'Very Cold' : 'Normal'];
            if (name === 'wind') return [`${value} m/s`, payload.isWindy ? 'Very Windy' : 'Normal'];
            if (name === 'rain') return [`${value}%`, payload.isRainy ? 'Rainy' : 'Normal'];
            return value;
          }}
        />
        <Legend />
        <Bar dataKey="temp" isAnimationActive={false}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default DistributionGraph;
