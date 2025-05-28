
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, CheckCircle } from 'lucide-react'; // Changed Save to CheckCircle for visual cue

interface SignaturePadProps {
  onSave: (signature: string, isEmpty: boolean) => void;
  width?: number;
  height?: number;
  backgroundColor?: string;
  penColor?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  width = 300, // Default width
  height = 150, // Default height
  backgroundColor = 'hsl(var(--muted))',
  penColor = 'hsl(var(--foreground))',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const actualWidth = typeof window !== 'undefined' ? Math.min(width, window.innerWidth - 64) : width; // 32px padding on each side

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear rect with background color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set drawing styles
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setIsEmpty(true); // Canvas is empty after clear
      }
    }
  };

  useEffect(() => {
    initializeCanvas();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundColor, penColor, actualWidth, height]); // Rerun if these change

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in event) { 
      if (event.touches.length === 0) return null;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault(); // Prevent scrolling on touch
    const coords = getCoordinates(event);
    if (!coords) return;
    const { x, y } = coords;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      setIsEmpty(false); // Drawing started, no longer empty
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault(); // Prevent scrolling on touch
    if (!isDrawing) return;
    const coords = getCoordinates(event);
    if (!coords) return; // Can happen if touch ends outside
    const { x, y } = coords;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.closePath();
      setIsDrawing(false);
    }
  };

  const handleClear = () => {
    initializeCanvas();
    onSave("", true); // Notify parent that canvas is cleared
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Check if canvas is effectively empty (e.g., all pixels are background color)
      // For simplicity, we'll rely on the isEmpty state which is set when drawing starts.
      // A more robust check would involve getImageData().
      const dataUrl = isEmpty ? "" : canvas.toDataURL('image/png');
      onSave(dataUrl, isEmpty);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3 w-full max-w-xs sm:max-w-sm md:max-w-md">
      <canvas
        ref={canvasRef}
        width={actualWidth} 
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="border border-input rounded-md cursor-crosshair bg-card shadow-inner"
        style={{ touchAction: 'none' }}
      />
      <div className="flex space-x-3 w-full">
        <Button variant="outline" size="default" onClick={handleClear} className="flex-1">
          <Eraser className="mr-2 h-4 w-4" /> Bersihkan
        </Button>
        <Button size="default" onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle className="mr-2 h-4 w-4" /> Simpan TTD
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
