import React from 'react';

interface ConfidenceCueProps {
  confidence: number;
  type?: 'bar';
}

export const ConfidenceCue: React.FC<ConfidenceCueProps> = ({ confidence }) => {
  const getColor = () => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const percent = Math.round(confidence * 100);

  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Agent certainty"
    >
      <span className="text-sm text-gray-400" aria-hidden="true">Certainty:</span>
      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden" aria-hidden="true">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-sm font-mono text-gray-300" aria-hidden="true">
        {percent}%
      </span>
    </div>
  );
};
