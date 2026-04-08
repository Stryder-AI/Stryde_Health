import { useRef, useMemo } from 'react';
import { Printer, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { QRCode } from '@/components/ui/QRCode';

interface TokenPrintProps {
  open: boolean;
  onClose: () => void;
  tokenNumber: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
}

export function TokenPrint({ open, onClose, tokenNumber, patientName, doctorName, department, date }: TokenPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const estimatedWait = useMemo(() => `${Math.floor(Math.random() * 20) + 5} min`, [tokenNumber]);
  const qrData = `SHIFA:token:${tokenNumber}:${patientName}:${department}:${date}`;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=320,height=500');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Token ${tokenNumber}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            padding: 4mm;
            text-align: center;
          }
          .hospital-name { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
          .tagline { font-size: 9px; color: #666; margin-bottom: 8px; }
          .divider { border-top: 1px dashed #999; margin: 8px 0; }
          .token-number { font-size: 42px; font-weight: bold; letter-spacing: 2px; margin: 8px 0; }
          .label { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
          .value { font-size: 12px; font-weight: bold; margin-bottom: 4px; }
          .footer { font-size: 8px; color: #999; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="hospital-name">STRYDE HEALTH</div>
        <div class="tagline">Hospital Information System</div>
        <div class="divider"></div>
        <div class="label">Token Number</div>
        <div class="token-number">${tokenNumber}</div>
        <div class="divider"></div>
        <div class="label">Patient</div>
        <div class="value">${patientName}</div>
        <div class="label">Doctor</div>
        <div class="value">${doctorName}</div>
        <div class="label">Department</div>
        <div class="value">${department}</div>
        <div class="label">Date</div>
        <div class="value">${date}</div>
        <div class="label">Est. Wait Time</div>
        <div class="value">${estimatedWait}</div>
        <div class="divider"></div>
        <div class="footer">Please keep this token with you.<br/>Thank you for visiting Stryde Health.</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md animate-fade-in" style={{ animationDuration: '0.2s' }} />

      <div className="relative w-full max-w-sm glass-elevated p-0 animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-border)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Token Generated</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
          </button>
        </div>

        {/* Token Display */}
        <div ref={printRef} className="px-6 py-8 text-center">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-widest">Stryde Health</p>
          <div className="my-4 border-t border-dashed border-[var(--surface-border)]" />

          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Token Number</p>
          <p className="text-5xl font-bold text-[var(--primary)] tracking-wider my-3">{tokenNumber}</p>

          <div className="my-4 border-t border-dashed border-[var(--surface-border)]" />

          <div className="space-y-3 text-left">
            <div>
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Patient</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{patientName}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Doctor</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{doctorName}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Department</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{department}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Est. Wait</p>
                <p className="text-sm font-semibold text-[var(--primary)]">{estimatedWait}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Date</p>
              <p className="text-sm text-[var(--text-secondary)]">{date}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="mt-5 flex flex-col items-center gap-2">
            <div className="my-4 border-t border-dashed border-[var(--surface-border)] w-full" />
            <QRCode data={qrData} size={80} />
            <p className="text-[10px] text-[var(--text-tertiary)] text-center">
              Scan to verify token authenticity
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--surface-border)]">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" className="flex-1" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print Token
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
