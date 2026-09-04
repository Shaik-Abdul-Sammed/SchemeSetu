import React, { useRef, useState } from 'react';
import { PenTool, RotateCcw, CheckCircle, Save } from 'lucide-react';

export default function AgentSignatureCanvas({ onSaveSignature }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [saved, setSaved] = useState(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#38bdf8'; // Sky blue
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsDrawing(true);
    setHasContent(true);
    setSaved(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    setSaved(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSaved(true);
    if (onSaveSignature) onSaveSignature(dataUrl);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 my-3 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-slate-100">Digital Touchscreen Signature / Thumbprint</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Sign inside box</span>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden relative mb-3">
        <canvas
          ref={canvasRef}
          width={400}
          height={140}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-36 touch-none cursor-crosshair"
        />
        {!hasContent && (
          <span className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs pointer-events-none select-none">
            Draw Signature or Thumbprint Here
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handleClear}
          disabled={!hasContent}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs border border-slate-700 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear
        </button>

        <button
          onClick={handleSave}
          disabled={!hasContent || saved}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all"
        >
          {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Signature Captured' : 'Save Signature'}</span>
        </button>
      </div>
    </div>
  );
}
