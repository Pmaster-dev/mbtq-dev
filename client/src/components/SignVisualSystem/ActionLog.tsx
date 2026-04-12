import React from 'react';
import { AgentStateEvent } from './types';
import { STATE_SEMANTICS } from './semantics';

interface ActionLogProps {
  events: AgentStateEvent[];
}

export const ActionLog: React.FC<ActionLogProps> = ({ events }) => {
  return (
    <div
      className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto focus-visible:ring-2 focus-visible:ring-purple-500 focus:outline-none"
      tabIndex={0}
      role="region"
      aria-labelledby="action-log-title"
      aria-live="polite"
    >
      <h3 id="action-log-title" className="text-lg font-bold text-white mb-3">Agent Activity</h3>

      {events.length === 0 ? (
        <div className="text-gray-500 text-sm italic text-center py-4">No recent activity</div>
      ) : (
        <div className="space-y-2">
          {events.map((event, idx) => {
          const semantic = STATE_SEMANTICS[event.current];
          return (
            <div key={event.id || idx} className="flex items-start gap-3 text-sm">
              <span className={`${semantic.color} w-2 h-2 rounded-full mt-1.5 flex-shrink-0`} />
              <div className="flex-1">
                <span className="text-gray-300 font-medium">{semantic.visual}</span>
                <span className="text-gray-500 mx-2">·</span>
                <span className="text-gray-400">{semantic.meaning}</span>
                {event.actor && (
                  <span className="text-gray-600 text-xs ml-2">({event.actor})</span>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};
