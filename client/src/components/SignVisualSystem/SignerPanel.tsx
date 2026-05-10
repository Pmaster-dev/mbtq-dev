import React from 'react';
import { AgentStateData } from './types';
import { STATE_SEMANTICS } from './semantics';

interface SignerPanelProps {
  state: AgentStateData;
  position?: 'right' | 'left' | 'center';
  size?: 'small' | 'medium' | 'large';
}

// ⚡ Bolt Optimization: Added React.memo to prevent unnecessary re-renders when parent state updates.
export const SignerPanel: React.FC<SignerPanelProps> = React.memo(({
  state, 
  position = 'right', 
  size = 'medium' 
}) => {
  const semantic = STATE_SEMANTICS[state.current];
  const Icon = semantic.icon;

  const sizeClasses = {
    small: 'w-48 h-48',
    medium: 'w-64 h-64',
    large: 'w-80 h-80'
  };

  const positionClasses = {
    right: 'right-4',
    left: 'left-4',
    center: 'left-1/2 -translate-x-1/2'
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} top-4 ${sizeClasses[size]} bg-gray-900 rounded-2xl shadow-2xl border-2 ${semantic.color.replace('bg-', 'border-')} flex flex-col overflow-hidden z-50`}
    >
      {/* State Indicator Header */}
      <div className={`${semantic.color} px-4 py-3 flex items-center justify-between`}>
        <span className="font-bold text-white text-lg">{semantic.visual}</span>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Visual Sign Area */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Primary Visual Cue */}
        <div className={`relative ${semantic.motion === 'spin' ? 'animate-spin' : ''} 
                        ${semantic.motion === 'pulse' ? 'animate-pulse' : ''}
                        ${semantic.motion === 'pulse-fast' ? 'animate-pulse' : ''}
                        ${semantic.motion === 'bounce' ? 'animate-bounce' : ''}`}>
          <Icon className={`w-32 h-32 ${semantic.color.replace('bg-', 'text-')}`} />
        </div>

        {/* Confidence Indicator */}
        {state.confidence !== undefined && (
          <div
            className="absolute bottom-4 left-4 right-4"
            role="progressbar"
            aria-valuenow={Math.round(state.confidence * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Agent confidence"
          >
            <div className="bg-gray-800 rounded-full h-2 overflow-hidden" aria-hidden="true">
              <div 
                className={`h-full ${semantic.color} transition-all duration-500`}
                style={{ width: `${state.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 mt-1 block" aria-hidden="true">
              Confidence: {Math.round(state.confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Semantic Meaning */}
      <div className="bg-gray-800 px-4 py-3 border-t border-gray-700">
        <p className="text-sm text-gray-300 font-medium">{semantic.meaning}</p>
        {state.actor && (
          <p className="text-xs text-gray-500 mt-1">Agent: {state.actor}</p>
        )}
        {state.requiresUser && (
          <p className="text-xs text-yellow-400 mt-1 font-bold">⚠ Action Required</p>
        )}
      </div>
    </div>
  );
});
