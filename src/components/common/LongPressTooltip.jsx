import { useState, useRef } from 'react';
import './LongPressTooltip.css';

export default function LongPressTooltip({ children, content, ...props }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const longPressTimer = useRef(null);
  const tooltipTimer = useRef(null);

  const handleTouchStart = (e) => {
    longPressTimer.current = setTimeout(() => {
      setShowTooltip(true);
      // Auto-hide after 4 seconds
      tooltipTimer.current = setTimeout(() => {
        setShowTooltip(false);
      }, 4000);
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchMove = () => {
    // Cancel long press if user moves finger
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleClick = () => {
    // Toggle tooltip on click for desktop
    if (!showTooltip) {
      setShowTooltip(true);
      tooltipTimer.current = setTimeout(() => {
        setShowTooltip(false);
      }, 4000);
    } else {
      setShowTooltip(false);
      if (tooltipTimer.current) {
        clearTimeout(tooltipTimer.current);
      }
    }
  };

  const handleMouseEnter = () => {
    // Show tooltip on hover for desktop
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    // Hide tooltip on mouse leave for desktop
    setShowTooltip(false);
  };

  return (
    <span
      className="long-press-tooltip-wrapper"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      {showTooltip && content && (
        <span className="long-press-tooltip">{content}</span>
      )}
    </span>
  );
}
