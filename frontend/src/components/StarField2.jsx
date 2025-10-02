import React, { useEffect, useRef } from 'react';

const StarField2 = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const wavesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      initParticles();
      initWaves();
    };

    const initParticles = () => {
      particlesRef.current = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 25000);

      for (let i = 0; i < numParticles; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.3,
          hue: Math.random() > 0.5 ? 200 : 280, // Blue or purple
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const initWaves = () => {
      wavesRef.current = [];
      const numWaves = 3;

      for (let i = 0; i < numWaves; i++) {
        wavesRef.current.push({
          y: (canvas.height / numWaves) * i + canvas.height / (numWaves * 2),
          amplitude: 30 + Math.random() * 20,
          frequency: 0.005 + Math.random() * 0.003,
          speed: 0.5 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          opacity: 0.1 + Math.random() * 0.1,
          hue: 200 + Math.random() * 80,
        });
      }
    };

    const drawWave = (wave, time) => {
      ctx.beginPath();
      ctx.moveTo(0, wave.y);

      for (let x = 0; x <= canvas.width; x += 5) {
        const y = wave.y + Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `hsla(${wave.hue}, 70%, 60%, ${wave.opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add glow effect
      ctx.strokeStyle = `hsla(${wave.hue}, 70%, 60%, ${wave.opacity * 0.3})`;
      ctx.lineWidth = 6;
      ctx.stroke();
    };

    const animate = (time) => {
      ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waves
      wavesRef.current.forEach(wave => drawWave(wave, time * 0.001));

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Pulse effect
        const pulse = Math.sin(time * particle.pulseSpeed + particle.pulsePhase) * 0.3 + 0.7;
        const currentOpacity = particle.opacity * pulse;

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 70%, ${currentOpacity})`);
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 80%, 60%, ${currentOpacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 80%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 90%, 80%, ${currentOpacity})`;
        ctx.fill();
      });

      // Draw connections between nearby particles
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

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

export default StarField2;