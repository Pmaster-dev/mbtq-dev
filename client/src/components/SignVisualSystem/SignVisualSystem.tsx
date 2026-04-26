import { useState, useEffect, useCallback } from 'react';
import { AGENT_STATES } from './types';
import { eventBus } from './StateEventBus';
import { SignerPanel } from './SignerPanel';
import { ConfidenceCue } from './ConfidenceCue';
import { ActionLog } from './ActionLog';
import type { AgentStateData, AgentStateEvent } from './types';

// Main App - Sign Visual System Demo
export default function SignVisualSystem() {
  const [agentState, setAgentState] = useState<AgentStateData>({
    current: AGENT_STATES.IDLE,
    actor: null,
    confidence: 1.0,
    requiresUser: false
  });

  const [eventLog, setEventLog] = useState<AgentStateEvent[]>([]);
  const [panelSize, setPanelSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [panelPosition, setPosition] = useState<'left' | 'center' | 'right'>('right');

  // Subscribe to state events
  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event) => {
      setAgentState(event);
      setEventLog(prev => [event, ...prev].slice(0, 20));
    });

    return unsubscribe;
  }, []);

  // Simulate agent workflow
  const simulateAgentFlow = useCallback(() => {
    const flow: AgentStateData[] = [
      { current: AGENT_STATES.LISTENING, actor: 'MagicianCore', confidence: 1.0, requiresUser: false },
      { current: AGENT_STATES.PROCESSING, actor: 'MagicianCore', confidence: 0.85, requiresUser: false },
      { current: AGENT_STATES.VALIDATING, actor: 'Validator', confidence: 0.92, requiresUser: false },
      { current: AGENT_STATES.EXECUTING, actor: 'PinkSync', confidence: 0.95, requiresUser: false },
      { current: AGENT_STATES.COMPLETED, actor: 'MagicianCore', confidence: 1.0, requiresUser: false }
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step >= flow.length) {
        clearInterval(interval);
        setTimeout(() => {
          eventBus.emit({ current: AGENT_STATES.IDLE, actor: null, confidence: 1.0, requiresUser: false });
        }, 1500);
        return;
      }
      eventBus.emit(flow[step]);
      step++;
    }, 1800);
  }, []);

  const simulateError = () => {
    eventBus.emit({
      current: AGENT_STATES.ERROR,
      actor: 'Validator',
      confidence: 0.0,
      requiresUser: true
    });
  };

  const simulateNeedsInput = () => {
    eventBus.emit({
      current: AGENT_STATES.NEEDS_INPUT,
      actor: 'MagicianCore',
      confidence: 0.7,
      requiresUser: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      {/* Signer Panel - Always visible, persistent */}
      <SignerPanel state={agentState} size={panelSize} position={panelPosition} />

      {/* Control Panel */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-2">Sign Visual System</h1>
          <p className="text-gray-400 mb-6">
            Agent state as first-class visual channel. Sign leads. Text follows.
          </p>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={simulateAgentFlow}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-blue-500"
            >
              Simulate Agent Flow
            </button>
            <button
              onClick={simulateError}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-red-500"
            >
              Simulate Error State
            </button>
            <button
              onClick={simulateNeedsInput}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-indigo-500"
            >
              Simulate Needs Input
            </button>
            <button
              onClick={() => eventBus.emit({ current: AGENT_STATES.IDLE, actor: null, confidence: 1.0, requiresUser: false })}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-gray-500"
            >
              Reset to Idle
            </button>
          </div>

          {/* Panel Configuration */}
          <div className="border-t border-gray-700 pt-6 space-y-4">
            <div>
              <label id="panel-size-label" className="block text-sm font-medium text-gray-400 mb-2">Panel Size</label>
              <div className="flex gap-2" role="group" aria-labelledby="panel-size-label">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => setPanelSize(size)}
                    className={`px-4 py-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-purple-500 ${panelSize === size ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    aria-pressed={panelSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label id="panel-position-label" className="block text-sm font-medium text-gray-400 mb-2">Panel Position</label>
              <div className="flex gap-2" role="group" aria-labelledby="panel-position-label">
                {(['left', 'center', 'right'] as const).map(pos => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`px-4 py-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-purple-500 ${panelPosition === pos ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    aria-pressed={panelPosition === pos}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current State Details */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Current State</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">State:</span>
              <span className="text-white font-mono">{agentState.current}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Actor:</span>
              <span className="text-white font-mono">{agentState.actor || 'None'}</span>
            </div>
            <ConfidenceCue confidence={agentState.confidence} />
            <div className="flex justify-between">
              <span className="text-gray-400">Requires User:</span>
              <span className={agentState.requiresUser ? 'text-yellow-400' : 'text-gray-500'}>
                {agentState.requiresUser ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <ActionLog events={eventLog} />

        {/* Philosophy */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-3">Design Philosophy</h2>
          <div className="space-y-2 text-gray-300">
            <p>• Sign visuals reflect system state, not text output</p>
            <p>• Every agent action emits a visible state change</p>
            <p>• No silent processing, no hidden waits</p>
            <p>• Confidence and uncertainty are first-class signals</p>
            <p>• If the system thinks, it signs. If it cannot sign, it should not act.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
