// Type definitions for Sign Visual System

export const AGENT_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  VALIDATING: 'validating',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  ERROR: 'error',
  NEEDS_INPUT: 'needs_input'
} as const;

export type AgentState = typeof AGENT_STATES[keyof typeof AGENT_STATES];

export interface AgentStateData {
  current: AgentState;
  actor?: string | null;
  confidence: number;
  requiresUser: boolean;
}

export interface AgentStateEvent extends AgentStateData {
  timestamp?: number;
  id?: string;
}

export interface StateSemantic {
  visual: string;
  color: string;
  icon: any;
  motion: string;
  meaning: string;
}
