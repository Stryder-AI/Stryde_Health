import { useState } from 'react';
import {
  Settings, Printer, Package, Receipt, AlertTriangle,
  Monitor, Save, CheckCircle, Trash2, RotateCcw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SettingsState {
  // General
  pharmacyName: string;
  receiptHeader: string;
  receiptFooter: string;
  currencySymbol: string;
  taxRate: number;
  showTaxOnReceipt: boolean;

  // POS
  defaultPaymentMethod: string;
  autoPrintReceipt: boolean;
  soundOnScan: boolean;
  quickSaleMode: boolean;
  barcodeFormat: string;

  // Stock
  defaultReorderLevel: number;
  lowStockThreshold: number;
  showOutOfStock: boolean;
  allowNegativeStock: boolean;
  expiryWarningDays: number;

  // Receipt Printer
  printerType: string;
  autoCutPaper: boolean;
  printCopies: number;

  // Display
  productsPerPage: number;
  gridView: boolean;
  showGenericName: boolean;
  showBarcodeOnCard: boolean;
}

const defaultSettings: SettingsState = {
  pharmacyName: 'Stryde Pharmacy',
  receiptHeader: 'Stryde Pharmacy\n123 Health Street, Islamabad\nPh: 051-1234567',
  receiptFooter: 'Thank you for your purchase!\nGet well soon.',
  currencySymbol: 'Rs.',
  taxRate: 16,
  showTaxOnReceipt: true,

  defaultPaymentMethod: 'cash',
  autoPrintReceipt: true,
  soundOnScan: true,
  quickSaleMode: false,
  barcodeFormat: 'Code-128',

  defaultReorderLevel: 50,
  lowStockThreshold: 20,
  showOutOfStock: false,
  allowNegativeStock: false,
  expiryWarningDays: 30,

  printerType: 'thermal-80',
  autoCutPaper: true,
  printCopies: 1,

  productsPerPage: 24,
  gridView: true,
  showGenericName: true,
  showBarcodeOnCard: false,
};

/* ------------------------------------------------------------------ */
/*  Shared styling                                                     */
/* ------------------------------------------------------------------ */

const card = 'bg-[var(--pos-surface)]/80 backdrop-blur-md border border-[var(--pos-border)] rounded-xl p-6';
const inputCls =
  'w-full bg-[var(--pos-surface)] border border-[var(--pos-border)] text-[var(--pos-text)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--pos-accent)] transition-colors';
const selectCls =
  'w-full bg-[var(--pos-surface)] border border-[var(--pos-border)] text-[var(--pos-text)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--pos-accent)] transition-colors appearance-none cursor-pointer';
const labelCls = 'block text-sm text-[var(--pos-text)] font-medium mb-1.5';
const hintCls = 'text-xs text-gray-500 mt-1';

/* ------------------------------------------------------------------ */
/*  Toggle Switch                                                      */
/* ------------------------------------------------------------------ */

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[var(--pos-accent)]' : 'bg-white/10'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle Row                                                         */
/* ------------------------------------------------------------------ */

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="text-sm text-[var(--pos-text)]">{label}</p>
        {hint && <p className={hintCls}>{hint}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Header                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-[var(--pos-accent)]/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4.5 h-4.5 text-[var(--pos-accent)]" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-[var(--pos-text)]">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const SETTINGS_STORAGE_KEY = 'stryde-pharmacy-settings';

function loadPersistedSettings(): SettingsState {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch { /* ignore */ }
  return { ...defaultSettings };
}

export function PharmacySettings() {
  const [s, setS] = useState<SettingsState>(loadPersistedSettings);
  const [toastVisible, setToastVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const upd = <K extends keyof SettingsState>(key: K, val: SettingsState[K]) =>
    setS((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s));
    } catch { /* storage full */ }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleDanger = (action: string) => {
    if (confirmAction === action) {
      // "Confirmed" — just reset the confirm state (demo)
      setConfirmAction(null);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } else {
      setConfirmAction(action);
      setTimeout(() => setConfirmAction(null), 4000);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--pos-text)] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--pos-accent)]" />
            Pharmacy Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure your pharmacy ePOS preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-[var(--pos-accent)] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:brightness-110 hover:shadow-[0_4px_20px_rgba(13,148,136,0.3)] transition-all duration-300 active:scale-[0.97]"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>

      {/* ---- General Settings ---- */}
      <div className={card}>
        <SectionHeader icon={Settings} title="General Settings" description="Basic pharmacy information and tax configuration" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Pharmacy Name</label>
            <input
              className={inputCls}
              value={s.pharmacyName}
              onChange={(e) => upd('pharmacyName', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Currency Symbol</label>
              <input
                className={inputCls}
                value={s.currencySymbol}
                onChange={(e) => upd('currencySymbol', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                className={inputCls}
                value={s.taxRate}
                onChange={(e) => upd('taxRate', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div>
            <label className={labelCls}>Receipt Header Text</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={s.receiptHeader}
              onChange={(e) => upd('receiptHeader', e.target.value)}
            />
            <p className={hintCls}>Shown at the top of printed receipts</p>
          </div>
          <div>
            <label className={labelCls}>Receipt Footer Text</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={s.receiptFooter}
              onChange={(e) => upd('receiptFooter', e.target.value)}
            />
            <p className={hintCls}>Shown at the bottom of printed receipts</p>
          </div>
        </div>

        <div className="mt-4 border-t border-[var(--pos-border)] pt-4">
          <ToggleRow
            label="Show tax on receipt"
            hint="Display tax breakdown on customer receipts"
            checked={s.showTaxOnReceipt}
            onChange={(v) => upd('showTaxOnReceipt', v)}
          />
        </div>
      </div>

      {/* ---- POS Settings ---- */}
      <div className={card}>
        <SectionHeader icon={Receipt} title="POS Settings" description="Point of sale behavior and barcode preferences" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Default Payment Method</label>
            <select
              className={selectCls}
              value={s.defaultPaymentMethod}
              onChange={(e) => upd('defaultPaymentMethod', e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="credit">Credit Card</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Barcode Format</label>
            <select
              className={selectCls}
              value={s.barcodeFormat}
              onChange={(e) => upd('barcodeFormat', e.target.value)}
            >
              <option value="Code-128">Code-128</option>
              <option value="EAN-13">EAN-13</option>
              <option value="UPC-A">UPC-A</option>
            </select>
          </div>
        </div>

        <div className="mt-4 border-t border-[var(--pos-border)] pt-4 space-y-1">
          <ToggleRow
            label="Auto-print receipt on sale"
            hint="Automatically send receipt to printer after completing a sale"
            checked={s.autoPrintReceipt}
            onChange={(v) => upd('autoPrintReceipt', v)}
          />
          <ToggleRow
            label="Sound on scan"
            hint="Play a beep sound when a barcode is scanned"
            checked={s.soundOnScan}
            onChange={(v) => upd('soundOnScan', v)}
          />
          <ToggleRow
            label="Quick sale mode"
            hint="Skip payment screen for cash transactions"
            checked={s.quickSaleMode}
            onChange={(v) => upd('quickSaleMode', v)}
          />
        </div>
      </div>

      {/* ---- Stock Settings ---- */}
      <div className={card}>
        <SectionHeader icon={Package} title="Stock Settings" description="Inventory thresholds and stock management rules" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelCls}>Default Reorder Level</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={s.defaultReorderLevel}
              onChange={(e) => upd('defaultReorderLevel', Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelCls}>Low Stock Threshold</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={s.lowStockThreshold}
              onChange={(e) => upd('lowStockThreshold', Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelCls}>Expiry Warning (days)</label>
            <input
              type="number"
              min={1}
              className={inputCls}
              value={s.expiryWarningDays}
              onChange={(e) => upd('expiryWarningDays', Number(e.target.value))}
            />
            <p className={hintCls}>Alert before product expires</p>
          </div>
        </div>

        <div className="mt-4 border-t border-[var(--pos-border)] pt-4 space-y-1">
          <ToggleRow
            label="Show out-of-stock products"
            hint="Display products with zero stock in the POS product list"
            checked={s.showOutOfStock}
            onChange={(v) => upd('showOutOfStock', v)}
          />
          <ToggleRow
            label="Allow negative stock"
            checked={s.allowNegativeStock}
            onChange={(v) => upd('allowNegativeStock', v)}
          />
          {s.allowNegativeStock && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 ml-0 mt-1">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400">
                Allowing negative stock can lead to inventory discrepancies. Use with caution and reconcile regularly.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ---- Receipt Printer ---- */}
      <div className={card}>
        <SectionHeader icon={Printer} title="Receipt Printer" description="Printer hardware and output configuration" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelCls}>Printer Type</label>
            <select
              className={selectCls}
              value={s.printerType}
              onChange={(e) => upd('printerType', e.target.value)}
            >
              <option value="thermal-80">Thermal 80mm</option>
              <option value="thermal-58">Thermal 58mm</option>
              <option value="a4">A4</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Print Copies</label>
            <input
              type="number"
              min={1}
              max={3}
              className={inputCls}
              value={s.printCopies}
              onChange={(e) => upd('printCopies', Math.min(3, Math.max(1, Number(e.target.value))))}
            />
            <p className={hintCls}>1 to 3 copies per sale</p>
          </div>
          <div className="flex flex-col justify-between">
            <ToggleRow
              label="Auto-cut paper"
              hint="Send cut command after printing"
              checked={s.autoCutPaper}
              onChange={(v) => upd('autoCutPaper', v)}
            />
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={() => {
              setToast(true);
              setTimeout(() => setToast(false), 3000);
            }}
            className="inline-flex items-center gap-2 bg-white/[0.05] border border-[var(--pos-border)] text-[var(--pos-text)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/[0.08] hover:border-[var(--pos-accent)]/30 transition-all duration-200"
          >
            <Printer className="w-4 h-4 text-[var(--pos-accent)]" />
            Test Print
          </button>
        </div>
      </div>

      {/* ---- Display ---- */}
      <div className={card}>
        <SectionHeader icon={Monitor} title="Display" description="Product grid and visual preferences" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Products Per Page</label>
            <select
              className={selectCls}
              value={s.productsPerPage}
              onChange={(e) => upd('productsPerPage', Number(e.target.value))}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={36}>36</option>
              <option value={48}>48</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Default View</label>
            <div className="flex gap-2 mt-0.5">
              <button
                onClick={() => upd('gridView', true)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                  s.gridView
                    ? 'bg-[var(--pos-accent)]/15 border-[var(--pos-accent)]/40 text-[var(--pos-accent)]'
                    : 'bg-white/[0.03] border-[var(--pos-border)] text-gray-400 hover:text-[var(--pos-text)]'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => upd('gridView', false)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                  !s.gridView
                    ? 'bg-[var(--pos-accent)]/15 border-[var(--pos-accent)]/40 text-[var(--pos-accent)]'
                    : 'bg-white/[0.03] border-[var(--pos-border)] text-gray-400 hover:text-[var(--pos-text)]'
                }`}
              >
                List View
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-[var(--pos-border)] pt-4 space-y-1">
          <ToggleRow
            label="Show generic name"
            hint="Display the generic/chemical name under the brand name"
            checked={s.showGenericName}
            onChange={(v) => upd('showGenericName', v)}
          />
          <ToggleRow
            label="Show barcode on product card"
            hint="Render barcode text on each product tile"
            checked={s.showBarcodeOnCard}
            onChange={(v) => upd('showBarcodeOnCard', v)}
          />
        </div>
      </div>

      {/* ---- Danger Zone ---- */}
      <div className="bg-[var(--pos-surface)]/80 backdrop-blur-md border border-red-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
            <p className="text-xs text-gray-500 mt-0.5">Irreversible actions — proceed with caution</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-red-500/10 bg-red-500/[0.03]">
            <div>
              <p className="text-sm font-medium text-[var(--pos-text)]">Clear Today's Sales</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Remove all sales records from today. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => handleDanger('clear-sales')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shrink-0 ${
                confirmAction === 'clear-sales'
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {confirmAction === 'clear-sales' ? 'Click again to confirm' : 'Clear Sales'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-red-500/10 bg-red-500/[0.03]">
            <div>
              <p className="text-sm font-medium text-[var(--pos-text)]">Reset Stock Count</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Set all product stock quantities to zero. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => handleDanger('reset-stock')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shrink-0 ${
                confirmAction === 'reset-stock'
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              {confirmAction === 'reset-stock' ? 'Click again to confirm' : 'Reset Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-[var(--pos-accent)] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:brightness-110 hover:shadow-[0_4px_20px_rgba(13,148,136,0.3)] transition-all duration-300 active:scale-[0.97]"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>

      {/* Success Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-500/90 backdrop-blur-md text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 animate-[slideUp_0.3s_ease-out]">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Settings saved successfully</span>
        </div>
      )}
    </div>
  );
}
