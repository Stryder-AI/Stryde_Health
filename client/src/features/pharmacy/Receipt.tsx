import { forwardRef } from 'react';
import { QRCode } from '@/components/ui/QRCode';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  discount?: number;
  amount: number;
}

export interface ReceiptData {
  saleNumber: string;
  date: string;
  time: string;
  cashier: string;
  customer?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  amountReceived: number;
  change: number;
  prescriptionRef?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Receipt = forwardRef<HTMLDivElement, { data: ReceiptData }>(({ data }, ref) => {
  return (
    <div ref={ref} className="receipt-print" style={receiptStyle}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: 12, marginBottom: 12 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: 1 }}>STRYDE HEALTH</h1>
        <p style={{ fontSize: 11, margin: '2px 0 0', color: '#444' }}>Hospital & Medical Centre</p>
        <p style={{ fontSize: 10, margin: '2px 0 0', color: '#666' }}>123 Medical Drive, Lahore, Pakistan</p>
        <p style={{ fontSize: 10, margin: '1px 0 0', color: '#666' }}>Tel: 042-3456-7890</p>
      </div>

      {/* Sale Info */}
      <div style={{ fontSize: 11, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Sale#: <strong>{data.saleNumber}</strong></span>
          <span>{data.date}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Cashier: {data.cashier}</span>
          <span>{data.time}</span>
        </div>
        {data.customer && (
          <div>Customer: {data.customer}</div>
        )}
        {data.prescriptionRef && (
          <div>Rx Ref: {data.prescriptionRef}</div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

      {/* Items Header */}
      <div style={{ display: 'flex', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#444', marginBottom: 4 }}>
        <span style={{ flex: 1 }}>Item</span>
        <span style={{ width: 35, textAlign: 'center' }}>Qty</span>
        <span style={{ width: 55, textAlign: 'right' }}>Price</span>
        <span style={{ width: 60, textAlign: 'right' }}>Amount</span>
      </div>

      <div style={{ borderTop: '1px solid #ccc', marginBottom: 4 }} />

      {/* Items */}
      {data.items.map((item, i) => (
        <div key={i} style={{ display: 'flex', fontSize: 11, marginBottom: 3, alignItems: 'flex-start' }}>
          <span style={{ flex: 1, lineHeight: 1.3 }}>
            {item.name}
            {item.discount ? (
              <span style={{ display: 'block', fontSize: 9, color: '#888' }}>
                Disc: -{item.discount.toFixed(2)}
              </span>
            ) : null}
          </span>
          <span style={{ width: 35, textAlign: 'center' }}>{item.qty}</span>
          <span style={{ width: 55, textAlign: 'right' }}>{item.price.toFixed(2)}</span>
          <span style={{ width: 60, textAlign: 'right', fontWeight: 600 }}>{item.amount.toFixed(2)}</span>
        </div>
      ))}

      {/* Divider */}
      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

      {/* Totals */}
      <div style={{ fontSize: 11 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span>Subtotal</span>
          <span>Rs. {data.subtotal.toFixed(2)}</span>
        </div>
        {data.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, color: '#888' }}>
            <span>Discount</span>
            <span>-Rs. {data.discount.toFixed(2)}</span>
          </div>
        )}
        {data.tax > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span>Tax</span>
            <span>Rs. {data.tax.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '2px solid #000', margin: '6px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
        <span>TOTAL</span>
        <span>Rs. {data.total.toFixed(2)}</span>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* Payment */}
      <div style={{ fontSize: 11 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span>Payment Method</span>
          <span style={{ fontWeight: 600 }}>{data.paymentMethod}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span>Amount Received</span>
          <span>Rs. {data.amountReceived.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Change</span>
          <span>Rs. {data.change.toFixed(2)}</span>
        </div>
      </div>

      {/* QR Code */}
      <div style={{ borderTop: '1px dashed #ccc', marginTop: 10, paddingTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <QRCode
          data={`SHIFA:receipt:${data.saleNumber}:${data.customer ?? 'WALK-IN'}:${data.total}:${data.date}`}
          size={64}
          showLabel={false}
        />
        <p style={{ fontSize: 9, color: '#888', margin: 0 }}>Scan to verify receipt</p>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px dashed #000', marginTop: 12, paddingTop: 10, textAlign: 'center' }}>
        <p style={{ fontSize: 10, margin: 0, color: '#666' }}>Thank you for choosing Stryde Health!</p>
        <p style={{ fontSize: 9, margin: '4px 0 0', color: '#888' }}>This is a computer-generated receipt.</p>
        <p style={{ fontSize: 9, margin: '2px 0 0', color: '#888' }}>No exchange/refund after 7 days.</p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

/* ------------------------------------------------------------------ */
/*  Inline Styles (for print isolation)                                */
/* ------------------------------------------------------------------ */

const receiptStyle: React.CSSProperties = {
  width: 300,
  fontFamily: "'Courier New', Courier, monospace",
  color: '#000',
  background: '#fff',
  padding: 16,
  lineHeight: 1.4,
};
