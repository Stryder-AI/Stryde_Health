import { useMemo } from 'react';
import { generateQRMatrix } from '@/lib/qrcode';

interface QRCodeProps {
  data: string;
  size?: number;
  color?: string;
  showLabel?: boolean;
}

export function QRCode({
  data,
  size = 80,
  color = '#000000',
  showLabel = true,
}: QRCodeProps) {
  const matrix = useMemo(() => generateQRMatrix(data), [data]);
  const cells = matrix.length; // 21
  const cellSize = size / cells;
  const padding = cellSize * 0.5;
  const totalSize = size + padding * 2;

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <svg
        width={totalSize}
        height={totalSize}
        viewBox={`0 0 ${totalSize} ${totalSize}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
        aria-label={`QR code for: ${data}`}
      >
        {/* White background */}
        <rect width={totalSize} height={totalSize} fill="#ffffff" rx={cellSize * 0.3} />

        {/* QR cells */}
        {matrix.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={padding + c * cellSize}
                y={padding + r * cellSize}
                width={cellSize}
                height={cellSize}
                fill={color}
              />
            ) : null,
          ),
        )}
      </svg>

      {showLabel && (
        <span
          style={{
            fontSize: Math.max(8, size * 0.1),
            color: '#6b7280',
            fontFamily: 'monospace',
            letterSpacing: '0.08em',
            fontWeight: 600,
          }}
        >
          SCAN
        </span>
      )}
    </div>
  );
}
