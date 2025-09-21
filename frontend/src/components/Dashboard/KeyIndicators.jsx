import React from 'react';
import DailyStat from './DailyStat';

// A helper function to get the day of the year (1-366) from a date
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

function KeyIndicators({ data }) {
  // Check if we have the data we need before trying to render
  if (!data || !data.daily || !data.climatology) return null;

  const { daily_summary } = data.daily;
  const { daily_thresholds_celsius } = data.climatology;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Daily Climate Summary vs. Historical Norm (95th Percentile)</h3>
      <div className="space-y-3">
        {daily_summary.timestamps.map((ts, index) => {
          // For each day, calculate its "day of year"
          const currentDate = new Date(ts);
          const dayOfYear = getDayOfYear(currentDate);
          
          // Look up the historical threshold for that specific day of the year
          const tempThreshold = daily_thresholds_celsius[dayOfYear];

          return (
            <DailyStat
              key={ts}
              date={ts}
              temp={daily_summary.max_temp_celsius[index]}
              wind={daily_summary.max_wind_speed_ms[index]}
              precip={daily_summary.total_precip_mm[index]}
              // Pass the found threshold down to the DailyStat component
              threshold={tempThreshold}
            />
          );
        })}
      </div>
    </div>
  );
}

export default KeyIndicators;