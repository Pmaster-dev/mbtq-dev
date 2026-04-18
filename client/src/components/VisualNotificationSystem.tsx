import React, { useEffect, useState, useCallback } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface VisualNotification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface VisualNotificationProps {
  notification: VisualNotification;
  onDismiss: (id: string) => void;
}

const notificationStyles = {
  info: 'bg-blue-500 border-blue-700',
  success: 'bg-green-500 border-green-700',
  warning: 'bg-yellow-500 border-yellow-700',
  error: 'bg-red-500 border-red-700',
};

const notificationIcons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

/**
 * VisualNotificationComponent - Deaf-accessible visual notification
 * Replaces audio alerts with prominent visual indicators
 */
function VisualNotificationComponent({ notification, onDismiss }: VisualNotificationProps) {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  return (
    <div
      className={`${notificationStyles[notification.type]} 
        text-white px-6 py-4 rounded-lg shadow-2xl 
        border-l-4 animate-bounce-in
        flex items-start gap-4 min-w-[300px] max-w-[500px]`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className="text-3xl flex-shrink-0" aria-hidden="true">
        {notificationIcons[notification.type]}
      </span>
      <div className="flex-1">
        <p className="font-bold text-lg">{notification.message}</p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="text-white hover:text-gray-200 text-2xl font-bold flex-shrink-0"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

// ⚡ Bolt Optimization: Memoize the notification component to prevent re-rendering all active notifications when the parent state changes.
const MemoizedVisualNotificationComponent = React.memo(VisualNotificationComponent);

/**
 * VisualNotificationSystem - Container for managing multiple visual notifications
 * Designed for deaf users - all notifications are visual, no audio
 */
export default function VisualNotificationSystem() {
  const [notifications, setNotifications] = useState<VisualNotification[]>([]);

  useEffect(() => {
    // Listen for custom events to show notifications
    const handleShowNotification = (event: CustomEvent<Omit<VisualNotification, 'id'>>) => {
      const notification: VisualNotification = {
        ...event.detail,
        id: `notification-${Date.now()}-${Math.random()}`,
      };
      setNotifications((prev) => [...prev, notification]);
    };

    window.addEventListener('show-visual-notification' as any, handleShowNotification);
    return () => {
      window.removeEventListener('show-visual-notification' as any, handleShowNotification);
    };
  }, []);

  // ⚡ Bolt Optimization: Provide a stable reference for the dismiss handler using useCallback, preventing unnecessary child re-renders.
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <MemoizedVisualNotificationComponent
            notification={notification}
            onDismiss={dismissNotification}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Helper function to trigger visual notifications
 * Usage: showVisualNotification({ type: 'success', message: 'Saved!', duration: 3000 })
 */
export function showVisualNotification(
  notification: Omit<VisualNotification, 'id'>
) {
  window.dispatchEvent(
    new CustomEvent('show-visual-notification', {
      detail: notification,
    })
  );
}
