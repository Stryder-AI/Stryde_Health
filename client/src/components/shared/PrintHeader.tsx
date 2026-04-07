/**
 * PrintHeader — visible only when printing.
 * Renders hospital name, address, contact, and print timestamp.
 * Hidden on screen via .print-only class.
 */

interface PrintHeaderProps {
  reportType?: string;
}

export function PrintHeader({ reportType }: PrintHeaderProps) {
  const now = new Date();
  const printDate = now.toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const printTime = now.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="print-only print-header">
      <div>
        <div className="print-hospital-name">Shifa Eye Hospital</div>
        <div className="print-report-type">
          123 Medical Complex, Gulberg III, Lahore, Pakistan
        </div>
        <div className="print-report-type" style={{ fontSize: '10pt', color: '#555' }}>
          Tel: +92-42-35761999 &nbsp;|&nbsp; Email: info@shifaeye.com.pk
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        {reportType && (
          <div className="print-report-type" style={{ fontWeight: 'bold' }}>
            {reportType}
          </div>
        )}
        <div style={{ fontSize: '10pt', color: '#555', marginTop: '4px' }}>
          Printed: {printDate}, {printTime}
        </div>
      </div>
    </div>
  );
}
