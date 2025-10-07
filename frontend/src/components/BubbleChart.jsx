import React, { useState, useEffect } from 'react';

export default function BubbleChart({ data }) {
  const [bubbles, setBubbles] = useState([]);
  const [hoveredBubble, setHoveredBubble] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const customColors = [
    'rgba(99, 179, 237, 0.75)',
    'rgba(129, 212, 250, 0.75)',
    'rgba(102, 187, 106, 0.75)',
    'rgba(129, 199, 132, 0.75)',
    'rgba(156, 204, 101, 0.75)',
    'rgba(171, 71, 188, 0.75)',
    'rgba(186, 104, 200, 0.75)',
    'rgba(236, 64, 122, 0.75)',
    'rgba(240, 98, 146, 0.75)',
    'rgba(77, 182, 172, 0.75)',
    'rgba(38, 198, 218, 0.75)',
    'rgba(121, 134, 203, 0.75)',
    'rgba(255, 183, 77, 0.75)',
    'rgba(255, 167, 38, 0.75)',
    'rgba(92, 107, 192, 0.75)',
  ];

  useEffect(() => {
    if (!data || data.length === 0) return;

    console.log('[BubbleChart] Received topics:', data.length);
    console.log('[BubbleChart] Data:', data);

    const maxCount = Math.max(...data.map(d => d.count));

    let minRadius, maxRadius;
    if (data.length <= 5) {
      minRadius = 75;
      maxRadius = 100;
    } else if (data.length <= 10) {
      minRadius = 55;
      maxRadius = 85;
    } else if (data.length <= 20) {
      minRadius = 45;
      maxRadius = 80;
    } else {
      minRadius = 20;
      maxRadius = 45;
    }

    const sortedData = [...data].sort((a, b) => b.count - a.count);

    const generatedBubbles = sortedData.map((item, index) => {
      const normalizedSize = item.count / maxCount;
      const radius = minRadius + (maxRadius - minRadius) * normalizedSize;

      return {
        topic: item.topic,
        count: item.count,
        x: 0,
        y: 0,
        radius,
        color: customColors[index % customColors.length],
      };
    });

    const width = 600;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const padding = 8;

    generatedBubbles.sort((a, b) => b.radius - a.radius);

    for (let i = 0; i < generatedBubbles.length; i++) {
      const bubble = generatedBubbles[i];
      let placed = false;
      let attempts = 0;
      const maxAttempts = 200;

      while (!placed && attempts < maxAttempts) {
        let x, y;

        if (i === 0) {
          x = centerX;
          y = centerY;
        } else if (attempts < 100) {
          const angle = (Math.random() * 2 * Math.PI);
          const distance = Math.random() * Math.min(centerX, centerY) * 0.75;
          x = centerX + distance * Math.cos(angle);
          y = centerY + distance * Math.sin(angle);
        } else {
          const spiralAngle = (attempts / maxAttempts) * 6 * Math.PI;
          const spiralRadius = (attempts / maxAttempts) * Math.min(centerX, centerY) * 0.8;
          x = centerX + spiralRadius * Math.cos(spiralAngle);
          y = centerY + spiralRadius * Math.sin(spiralAngle);
        }

        let overlaps = false;
        for (let j = 0; j < i; j++) {
          const other = generatedBubbles[j];
          const dx = x - other.x;
          const dy = y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = bubble.radius + other.radius + padding;

          if (dist < minDist) {
            overlaps = true;
            break;
          }
        }

        const margin = 5;
        if (!overlaps &&
            x - bubble.radius > margin &&
            x + bubble.radius < width - margin &&
            y - bubble.radius > margin &&
            y + bubble.radius < height - margin) {
          bubble.x = x;
          bubble.y = y;
          placed = true;
        }
        attempts++;
      }

      if (!placed) {
        const fallbackAngle = (i / generatedBubbles.length) * 2 * Math.PI;
        const fallbackRadius = Math.min(centerX, centerY) * 0.5;
        bubble.x = centerX + fallbackRadius * Math.cos(fallbackAngle);
        bubble.y = centerY + fallbackRadius * Math.sin(fallbackAngle);
      }
    }

    const pushApart = () => {
      let moved = true;
      let iterations = 0;
      const maxIterations = 50;

      while (moved && iterations < maxIterations) {
        moved = false;
        iterations++;

        for (let i = 0; i < generatedBubbles.length; i++) {
          for (let j = i + 1; j < generatedBubbles.length; j++) {
            const bubble1 = generatedBubbles[i];
            const bubble2 = generatedBubbles[j];

            const dx = bubble2.x - bubble1.x;
            const dy = bubble2.y - bubble1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = bubble1.radius + bubble2.radius + padding;

            if (dist < minDist && dist > 0) {
              moved = true;
              const angle = Math.atan2(dy, dx);
              const overlap = (minDist - dist) / 2;

              bubble1.x -= overlap * Math.cos(angle);
              bubble1.y -= overlap * Math.sin(angle);
              bubble2.x += overlap * Math.cos(angle);
              bubble2.y += overlap * Math.sin(angle);

              const margin = 5;
              bubble1.x = Math.max(bubble1.radius + margin, Math.min(width - bubble1.radius - margin, bubble1.x));
              bubble1.y = Math.max(bubble1.radius + margin, Math.min(height - bubble1.radius - margin, bubble1.y));
              bubble2.x = Math.max(bubble2.radius + margin, Math.min(width - bubble2.radius - margin, bubble2.x));
              bubble2.y = Math.max(bubble2.radius + margin, Math.min(height - bubble2.radius - margin, bubble2.y));
            }
          }
        }
      }
    };

    pushApart();

    setBubbles(generatedBubbles);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center">
        No topic data available
      </p>
    );
  }

  const handleMouseMove = (e, bubble) => {
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setHoveredBubble(bubble);
  };

  const handleMouseLeave = () => {
    setHoveredBubble(null);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
        {bubbles.map((bubble, index) => {
          const isHovered = hoveredBubble?.topic === bubble.topic;
          const fontSize = Math.max(9, Math.min(14, bubble.radius / 3.5));
          const maxChars = Math.floor(bubble.radius / 4);
          const displayText = bubble.topic.length > maxChars
            ? bubble.topic.substring(0, maxChars - 1) + '.'
            : bubble.topic;

          return (
            <g key={index}>
              <circle
                cx={bubble.x}
                cy={bubble.y}
                r={bubble.radius}
                fill={bubble.color}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="2"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: `${bubble.x}px ${bubble.y}px`,
                  filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
                }}
                onMouseMove={(e) => handleMouseMove(e, bubble)}
                onMouseLeave={handleMouseLeave}
              />
              <text
                x={bubble.x}
                y={bubble.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={fontSize}
                fontWeight="700"
                style={{
                  pointerEvents: 'none',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  userSelect: 'none',
                }}
              >
                {displayText}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredBubble && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 10}px`,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(30, 41, 59, 0.98)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '12px',
            border: `2px solid ${hoveredBubble.color}`,
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'none',
            zIndex: 1000,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{
            marginBottom: '6px',
            color: hoveredBubble.color,
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '0.5px',
          }}>
            {hoveredBubble.topic}
          </div>
          <div style={{
            fontSize: '18px',
            color: '#a5f3fc',
            fontWeight: '700',
          }}>
            {hoveredBubble.count} {hoveredBubble.count === 1 ? 'problem' : 'problems'}
          </div>
        </div>
      )}
    </div>
  );
}
