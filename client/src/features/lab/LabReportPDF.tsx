/* ------------------------------------------------------------------ */
/*  Lab Report PDF Generator                                           */
/*  Opens a print-optimized HTML document in a new window             */
/* ------------------------------------------------------------------ */

interface ReportResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'H' | 'L' | null;
}

interface LabReport {
  id: string;
  patient: string;
  mrn: string;
  age: string;
  gender: string;
  testName: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  status: string;
  sampleType: string;
  technician: string;
  verifiedBy: string;
  results: ReportResult[];
}

interface PatientInfo {
  name: string;
  mrn: string;
  age: string;
  gender: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getResultRowHTML(r: ReportResult, index: number): string {
  const isAbnormal = !!r.flag;
  const rowBg = isAbnormal
    ? index % 2 === 0
      ? '#fff5f5'
      : '#fff0f0'
    : index % 2 === 0
      ? '#ffffff'
      : '#f9fafb';

  const valueColor = r.flag === 'H' ? '#dc2626' : r.flag === 'L' ? '#2563eb' : '#111827';
  const flagHtml = r.flag
    ? `<span style="
        display:inline-flex;align-items:center;justify-content:center;
        width:20px;height:20px;border-radius:50%;font-size:10px;font-weight:700;
        background:${r.flag === 'H' ? '#fee2e2' : '#dbeafe'};
        color:${r.flag === 'H' ? '#dc2626' : '#2563eb'};
        margin-left:6px;
      ">${r.flag}</span>
      <span style="font-size:11px;color:${r.flag === 'H' ? '#dc2626' : '#2563eb'};margin-left:2px">${r.flag === 'H' ? '↑' : '↓'}</span>`
    : '';

  return `
    <tr style="background:${rowBg}; border-bottom: 1px solid #e5e7eb;">
      <td style="padding:8px 12px; font-size:13px; color:#374151; ${isAbnormal ? 'font-weight:500' : ''}">${r.parameter}</td>
      <td style="padding:8px 12px; font-size:13px; color:${valueColor}; font-weight:${isAbnormal ? '700' : '600'};">
        ${r.value}${flagHtml}
      </td>
      <td style="padding:8px 12px; font-size:12px; color:#6b7280;">${r.unit}</td>
      <td style="padding:8px 12px; font-size:12px; color:#6b7280; font-family: monospace;">${r.referenceRange}</td>
    </tr>`;
}

export function generateLabReportPDF(
  report: LabReport,
  hospitalName: string,
  patientInfo: PatientInfo,
): void {
  const flaggedCount = report.results.filter((r) => r.flag).length;
  const abnormalBannerHTML =
    flaggedCount > 0
      ? `<div style="
          display:inline-flex;align-items:center;gap:6px;
          background:#fef2f2;border:1px solid #fca5a5;
          color:#dc2626;font-size:12px;font-weight:600;
          padding:4px 10px;border-radius:4px;
        ">
          ⚠ ${flaggedCount} ABNORMAL VALUE${flaggedCount > 1 ? 'S' : ''}
        </div>`
      : `<div style="
          display:inline-flex;align-items:center;gap:6px;
          background:#f0fdf4;border:1px solid #86efac;
          color:#16a34a;font-size:12px;font-weight:600;
          padding:4px 10px;border-radius:4px;
        ">✓ ALL VALUES NORMAL</div>`;

  const resultsRowsHTML = report.results
    .map((r, i) => getResultRowHTML(r, i))
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lab Report — ${report.id}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 20mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #111827;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── HEADER ──────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 14px;
      border-bottom: 3px solid #0d9488;
      margin-bottom: 14px;
    }
    .hospital-logo {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0d9488, #14b8a6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 22px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .hospital-info { margin-left: 12px; flex: 1; }
    .hospital-name { font-size: 20px; font-weight: 800; color: #0d9488; letter-spacing: 0.5px; }
    .hospital-sub { font-size: 11px; color: #6b7280; margin-top: 1px; }
    .report-badge {
      background: #0d9488;
      color: white;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 4px;
      white-space: nowrap;
      align-self: flex-start;
    }
    .report-meta { font-size: 11px; color: #6b7280; margin-top: 4px; text-align: right; }

    /* ── INFO GRID ───────────────────────────────────────── */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .info-cell {
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
      border-right: 1px solid #e5e7eb;
    }
    .info-cell:nth-child(even) { border-right: none; }
    .info-cell:nth-last-child(-n+2) { border-bottom: none; }
    .info-label {
      font-size: 10px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .info-value { font-size: 13px; font-weight: 600; color: #111827; }

    /* ── TEST SECTION ────────────────────────────────────── */
    .test-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 6px 6px 0 0;
      padding: 10px 14px;
    }
    .test-name { font-size: 15px; font-weight: 700; color: #0d9488; }

    /* ── RESULTS TABLE ───────────────────────────────────── */
    .results-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 6px 6px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .results-table thead tr {
      background: #f3f4f6;
    }
    .results-table thead th {
      padding: 9px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
    }

    /* ── LEGEND ─────────────────────────────────────────── */
    .legend {
      display: flex;
      gap: 20px;
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 16px;
    }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .legend-badge {
      display: inline-flex;align-items:center;justify-content:center;
      width: 18px; height: 18px; border-radius: 50%;
      font-size: 10px; font-weight: 700;
    }

    /* ── REMARKS ─────────────────────────────────────────── */
    .remarks-box {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 16px;
      background: #fffbeb;
    }
    .remarks-title { font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; margin-bottom: 4px; }
    .remarks-text { font-size: 12px; color: #78350f; }

    /* ── SIGNATURES ──────────────────────────────────────── */
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
    .sig-block { text-align: center; }
    .sig-line { width: 140px; border-top: 1px solid #9ca3af; margin: 0 auto 6px; padding-top: 4px; }
    .sig-name { font-size: 13px; font-weight: 600; color: #111827; }
    .sig-role { font-size: 11px; color: #6b7280; }

    /* ── FOOTER ─────────────────────────────────────────── */
    .footer {
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
      border-top: 1px dashed #d1d5db;
      padding-top: 8px;
      font-style: italic;
    }

    @media print {
      body { background: white !important; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- PRINT BUTTON (hidden on print) -->
  <div class="no-print" style="
    position: fixed; top: 12px; right: 12px; z-index: 9999;
    display: flex; gap: 8px;
  ">
    <button onclick="window.print()" style="
      padding: 8px 18px; background: #0d9488; color: white; border: none;
      border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;
    ">Print / Save as PDF</button>
    <button onclick="window.close()" style="
      padding: 8px 14px; background: #f3f4f6; color: #374151; border: none;
      border-radius: 6px; font-size: 14px; cursor: pointer;
    ">Close</button>
  </div>
  <div class="no-print" style="height: 52px;"></div>

  <!-- HEADER -->
  <div class="header">
    <div style="display:flex;align-items:center;">
      <div class="hospital-logo">SH</div>
      <div class="hospital-info">
        <div class="hospital-name">${hospitalName}</div>
        <div class="hospital-sub">123 Medical Boulevard · Lahore, Pakistan · Tel: 042-3456-7890</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div class="report-badge">Laboratory Report</div>
      <div class="report-meta">Report No: ${report.id}</div>
      <div class="report-meta">Date: ${formatDate(report.date)}</div>
    </div>
  </div>

  <!-- PATIENT INFO GRID -->
  <div class="info-grid">
    <div class="info-cell">
      <div class="info-label">Patient Name</div>
      <div class="info-value">${patientInfo.name}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Referring Doctor</div>
      <div class="info-value">${report.doctor}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">MR Number</div>
      <div class="info-value" style="color:#0d9488;font-family:monospace;">${patientInfo.mrn}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Department</div>
      <div class="info-value">${report.department}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Age / Gender</div>
      <div class="info-value">${patientInfo.age} yrs / ${patientInfo.gender}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Sample Type</div>
      <div class="info-value">${report.sampleType}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Sample Date</div>
      <div class="info-value">${formatDate(report.date)}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Report Time</div>
      <div class="info-value">${report.time}</div>
    </div>
  </div>

  <!-- TEST SECTION -->
  <div class="test-header">
    <div class="test-name">${report.testName.toUpperCase()}</div>
    ${abnormalBannerHTML}
  </div>
  <table class="results-table">
    <thead>
      <tr>
        <th style="width:35%">Parameter</th>
        <th style="width:20%">Result</th>
        <th style="width:15%">Unit</th>
        <th style="width:30%">Reference Range</th>
      </tr>
    </thead>
    <tbody>
      ${resultsRowsHTML}
    </tbody>
  </table>

  <!-- LEGEND -->
  <div class="legend">
    <div class="legend-item">
      <span class="legend-badge" style="background:#fee2e2;color:#dc2626">H</span>
      High (above normal range)
    </div>
    <div class="legend-item">
      <span class="legend-badge" style="background:#dbeafe;color:#2563eb">L</span>
      Low (below normal range)
    </div>
    <div class="legend-item">↑ Above range &nbsp; ↓ Below range</div>
  </div>

  ${flaggedCount > 0 ? `
  <div class="remarks-box">
    <div class="remarks-title">Clinical Remarks</div>
    <div class="remarks-text">
      ${flaggedCount} parameter${flaggedCount > 1 ? 's' : ''} outside reference range.
      Please correlate clinically. Follow-up as per physician's discretion.
    </div>
  </div>` : ''}

  <!-- SIGNATURES -->
  <div class="signatures">
    <div class="sig-block">
      <div style="height:36px;"></div>
      <div class="sig-line"></div>
      <div class="sig-name">${report.technician}</div>
      <div class="sig-role">Lab Technician</div>
    </div>
    <div class="sig-block">
      <div style="height:36px;"></div>
      <div class="sig-line"></div>
      <div class="sig-name">${report.verifiedBy}</div>
      <div class="sig-role">Pathologist (Verified By)</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    This is a computer-generated report. Results should be correlated clinically.
    For queries, contact the laboratory at ext. 234 or lab@strydehealth.com
  </div>

</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Pop-up blocked. Please allow pop-ups to generate the PDF report.');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
}
