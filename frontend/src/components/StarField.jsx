import React, { useEffect, useRef } from 'react';

const StarField = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const connectionsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
   canvas.width = canvas.parentElement.offsetWidth;
canvas.height = canvas.parentElement.offsetHeight;

      initStars();
    };

    const initStars = () => {
      starsRef.current = [];
      connectionsRef.current = [];

      // More stars based on screen size (75–150 typical)
      const numStars = Math.floor((canvas.width * canvas.height) / 20000);

      for (let i = 0; i < numStars; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 1.2, // larger stars
          opacity: Math.random() * 0.4 + 0.2,// brighter baseline
          twinkleSpeed: Math.random() * 0.015 + 0.005,
          color:
            Math.random() > 0.5
              ? 'rgba(147, 197, 253, ' // bluish
              : 'rgba(196, 181, 253, ', // purple
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
        });
      }

      createConnections();
    };

  const createConnections = () => {
  connectionsRef.current = [];
  const maxDistance = 150; // reduced range

  for (let i = 0; i < starsRef.current.length; i++) {
    for (let j = i + 1; j < starsRef.current.length; j++) {
      const star1 = starsRef.current[i];
      const star2 = starsRef.current[j];
      const distance = Math.sqrt(
        Math.pow(star2.x - star1.x, 2) + Math.pow(star2.y - star1.y, 2)
      );

      if (distance < maxDistance) {
        connectionsRef.current.push({
          star1: i,
          star2: j,
          opacity: ((maxDistance - distance) / maxDistance) * 0.25, // lighter
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    }
  }
};


    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      connectionsRef.current.forEach((connection) => {
        const star1 = starsRef.current[connection.star1];
        const star2 = starsRef.current[connection.star2];

        if (star1 && star2) {
          const pulseOpacity =
            connection.opacity *
            (0.5 + 0.5 * Math.sin(time * 0.001 + connection.pulseOffset));

          ctx.beginPath();
          ctx.moveTo(star1.x, star1.y);
          ctx.lineTo(star2.x, star2.y);
          ctx.strokeStyle = `rgba(147, 197, 253, ${pulseOpacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      // Update and draw stars
      starsRef.current.forEach((star) => {
        // Movement
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Twinkle effect
        star.opacity += Math.sin(time * star.twinkleSpeed) * 0.005;
star.opacity = Math.max(0.1, Math.min(0.6, star.opacity));

        // Draw main star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color + star.opacity + ')';
        ctx.fill();

        // Glow for brighter stars
        if (star.size > 1.8) {
  ctx.beginPath();
  ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
  ctx.fillStyle = star.color + star.opacity * 0.1 + ')';
  ctx.fill();
}
      });

      // Recalculate connections occasionally
      if (Math.floor(time / 100) % 50 === 0) {
        createConnections();
      }

      animationId = requestAnimationFrame(animate);
    };

    // Init
    resizeCanvas();
    animate(0);

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
   <canvas
  ref={canvasRef}
  className="absolute inset-0 z-0 pointer-events-none"
  style={{ background: 'transparent' }}
/>

  );
};

export default StarField;
