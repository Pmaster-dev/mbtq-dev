import { AgentStateEvent } from './types';

// Event Bus for state changes
export class StateEventBus {
  private listeners: Array<(event: AgentStateEvent) => void> = [];

  emit(event: AgentStateEvent): void {
    // ⚡ Bolt Optimization: Add stable unique identifiers to events
    // 💡 What: Generate a UUID for each event if it doesn't have one.
    // 🎯 Why: This allows components consuming the event stream (like ActionLog) to use a stable key for rendering, avoiding O(n) re-renders when prepending items.
    const eventWithMeta = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      id: event.id || crypto.randomUUID()
    };
    this.listeners.forEach(listener => listener(eventWithMeta));
  }

  subscribe(callback: (event: AgentStateEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
}

// Singleton instance for global state event bus
export const eventBus = new StateEventBus();
