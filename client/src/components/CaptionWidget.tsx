import { useState } from 'react';

interface CaptionConfig {
  fontSize: 'small' | 'medium' | 'large';
  backgroundColor: 'black' | 'white' | 'transparent';
  position: 'top' | 'bottom';
}

interface CaptionWidgetProps {
  videoElement?: HTMLVideoElement | null;
  captions?: string[];
}

/**
 * CaptionWidget - Real-time caption display for deaf accessibility
 * Supports both video captions and live transcription
 * Props are currently unused but kept for future implementation
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CaptionWidget(_props: CaptionWidgetProps) {
  const [config, setConfig] = useState<CaptionConfig>({
    fontSize: 'medium',
    backgroundColor: 'black',
    position: 'bottom',
  });
  const [isVisible, setIsVisible] = useState(true);
  const [currentCaption] = useState('');

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl',
  };

  const backgroundClasses = {
    black: 'bg-black/90 text-white',
    white: 'bg-white/90 text-black',
    transparent: 'bg-transparent text-white drop-shadow-lg',
  };

  const positionClasses = {
    top: 'top-4',
    bottom: 'bottom-4',
  };

  return (
    <>
      {/* Caption Display */}
      {isVisible && currentCaption && (
        <div
          className={`fixed left-1/2 transform -translate-x-1/2 ${positionClasses[config.position]} 
            ${backgroundClasses[config.backgroundColor]} ${fontSizeClasses[config.fontSize]}
            px-6 py-3 rounded-lg max-w-4xl text-center z-40`}
          role="region"
          aria-live="polite"
          aria-label="Video captions"
        >
          {currentCaption}
        </div>
      )}

      {/* Caption Controls */}
      <div className="fixed bottom-20 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 z-40">
        <h3 className="font-bold text-gray-800 mb-3">Caption Settings</h3>
        
        <div className="space-y-3">
          {/* Visibility Toggle */}
          <div className="flex items-center gap-2">
            <input
              id="caption-visibility"
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="w-5 h-5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <label htmlFor="caption-visibility" className="text-sm font-medium cursor-pointer">
              Show Captions
            </label>
          </div>

          {/* Font Size */}
          <div>
            <label htmlFor="caption-font-size" className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <select
              id="caption-font-size"
              value={config.fontSize}
              onChange={(e) => setConfig({ ...config, fontSize: e.target.value as any })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Background */}
          <div>
            <label htmlFor="caption-background" className="block text-sm font-medium text-gray-700 mb-1">
              Background
            </label>
            <select
              id="caption-background"
              value={config.backgroundColor}
              onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value as any })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>

          {/* Position */}
          <div>
            <label htmlFor="caption-position" className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              id="caption-position"
              value={config.position}
              onChange={(e) => setConfig({ ...config, position: e.target.value as any })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Helper function to update captions
 * Usage: updateCaption('New caption text')
 */
export function updateCaption(text: string) {
  window.dispatchEvent(
    new CustomEvent('update-caption', {
      detail: { text },
    })
  );
}
