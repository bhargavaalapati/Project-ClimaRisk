import React from 'react';
import DailyStat from './DailyStat'; // Import the new component

function KeyIndicators({ data }) {
  if (!data || !data.daily_summary) return null;

  const { timestamps, max_temp_celsius, max_wind_speed_ms, total_precip_mm } = data.daily_summary;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Daily Climate Summary</h3>
      <div className="space-y-3">
        {timestamps.map((ts, index) => (
          <DailyStat
            key={ts}
            date={ts}
            temp={max_temp_celsius[index]}
            wind={max_wind_speed_ms[index]}
            precip={total_precip_mm[index]}
          />
        ))}
      </div>
    </div>
  );
}

export default KeyIndicators;