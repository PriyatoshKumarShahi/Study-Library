import React, { useRef, useEffect } from "react";

const ShootingStars = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    const stars = [];
    const shootingStars = [];

    // Resize to cover full page height (not just viewport)
    const resize = () => {
      canvas.width = document.documentElement.scrollWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Background stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2,
        alpha: Math.random(),
        speed: 0.001 + Math.random() * 0.002,
      });
    }

    // Shooting star spawner (random start at top or right edge)
    const spawnShootingStar = () => {
      const startFromTop = Math.random() > 0.5;
      const startX = startFromTop
        ? Math.random() * canvas.width
        : canvas.width + 50; // off-screen right
      const startY = startFromTop ? -50 : Math.random() * canvas.height;

      shootingStars.push({
        x: startX,
        y: startY,
        length: 60 + Math.random() * 50,
        speed: 2 + Math.random() * 1.5, // slow + realistic
        opacity: 1,
      });
    };

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 25, 0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Normal stars
      stars.forEach((s) => {
        s.alpha += s.speed * (Math.random() > 0.5 ? 1 : -1);
        if (s.alpha < 0) s.alpha = 0;
        if (s.alpha > 1) s.alpha = 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.fill();
      });

      // Shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];

        ctx.beginPath();
        const gradient = ctx.createLinearGradient(
          s.x,
          s.y,
          s.x - s.length,
          s.y + s.length
        );
        gradient.addColorStop(0, `rgba(255,255,255,${s.opacity})`);
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.length, s.y + s.length);
        ctx.stroke();

        // Move diagonally down-left
        s.x -= s.speed;
        s.y += s.speed * 0.7;

        // Fade slowly
        s.opacity -= 0.002;

        // Remove if off-screen
        if (s.x < -100 || s.y > canvas.height + 100) {
          shootingStars.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    // Spawn stars every 4–7 seconds
    const interval = setInterval(
      spawnShootingStar,
      2000 + Math.random() * 1000
    );

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
      clearInterval(interval);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "black" }}
    />
  );
};

export default ShootingStars;
