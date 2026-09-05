import React, { useEffect, useRef } from 'react';

export default function AudioWaveform({ isActive = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 16;
      const barWidth = 3;
      const gap = 4;
      const startX = (canvas.width - (bars * (barWidth + gap))) / 2;

      for (let i = 0; i < bars; i++) {
        const x = startX + i * (barWidth + gap);
        let height = 4;
        if (isActive) {
          height = Math.sin(step + i * 0.5) * 12 + 16;
        }

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#10b981'); // Emerald
        gradient.addColorStop(1, '#38bdf8'); // Sky blue

        ctx.fillStyle = isActive ? gradient : '#334155';
        ctx.beginPath();
        ctx.roundRect(x, (canvas.height - height) / 2, barWidth, height, 2);
        ctx.fill();
      }

      step += 0.15;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive]);

  return (
    <div className="flex justify-center items-center">
      <canvas ref={canvasRef} width={160} height={40} className="w-40 h-10" />
    </div>
  );
}
