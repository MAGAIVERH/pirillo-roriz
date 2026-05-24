'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

type StudentQrDisplayProps = {
  qrPayload: string;
  studentName: string;
};

export function StudentQrDisplay({
  qrPayload,
  studentName,
}: StudentQrDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    void QRCode.toCanvas(canvas, qrPayload, {
      width: 240,
      margin: 2,
      color: {
        dark: '#ffffff',
        light: '#09090b',
      },
    });
  }, [qrPayload]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="rounded-2xl border border-white/10 bg-zinc-950 p-3"
        aria-label={`QR Code de presença de ${studentName}`}
      />
      <p className="mt-3 text-center text-xs leading-5 text-zinc-500">
        Apresente este QR Code ao professor no início da aula.
      </p>
    </div>
  );
}
