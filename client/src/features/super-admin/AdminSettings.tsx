import { useState } from 'react';
import { Building2, Settings, Bell, Printer, AlertTriangle, Save, Check, Upload, Palette, Eye } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { ThemePreview } from '@/components/ui/ThemePreview';
import { useThemeStore } from '@/stores/themeStore';

function Toggle({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${enabled ? 'bg-[var(--primary)]' : 'bg-[var(--surface-border)]'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] transition-all duration-300 ease-out hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const { colorBlindMode, toggleColorBlindMode } = useThemeStore();

  // Hospital Information
  const [hospitalName, setHospitalName] = useState('Stryde Health Hospital');
  const [address, setAddress] = useState('45-B, Main Boulevard, Gulberg III, Lahore');
  const [phone, setPhone] = useState('+92-42-35761234');
  const [email, setEmail] = useState('info@strydehealth.pk');
  const [website, setWebsite] = useState('www.strydehealth.pk');
  const [taxReg, setTaxReg] = useState('NTN-4521897-3');

  // System Preferences
  const [consultationFee, setConsultationFee] = useState('2000');
  const [tokenResetTime, setTokenResetTime] = useState('midnight');
  const [fiscalYearStart, setFiscalYearStart] = useState('july');
  const [currencySymbol, setCurrencySymbol] = useState('Rs.');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [autoBackup, setAutoBackup] = useState(true);

  // Notification Settings
  const [lowStockThreshold, setLowStockThreshold] = useState('20');
  const [labResultNotif, setLabResultNotif] = useState(true);
  const [appointmentReminder, setAppointmentReminder] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  // Printing
  const [receiptPrinter, setReceiptPrinter] = useState('thermal');
  const [autoPrintReceipts, setAutoPrintReceipts] = useState(true);
  const [printLabHeader, setPrintLabHeader] = useState(true);
  const [prescriptionFormat, setPrescriptionFormat] = useState('A5');

  const [resetLoading, setResetLoading] = useState(false);
  const [clearSessionsLoading, setClearSessionsLoading] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success('All settings have been saved successfully.', 'Settings Saved');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetDemoData = () => {
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      toast.success('Demo data has been reset to original state.', 'Data Reset');
    }, 1500);
  };

  const handleClearSessions = () => {
    setClearSessionsLoading(true);
    setTimeout(() => {
      setClearSessionsLoading(false);
      toast.success('All active sessions have been cleared.', 'Sessions Cleared');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Configure hospital system preferences.</p>
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in flex items-center gap-2 px-5 py-3 rounded-[var(--radius-sm)] bg-emerald-500 text-white shadow-xl">
          <Check className="w-4 h-4" />
          <span className="text-sm font-semibold">Settings saved successfully!</span>
        </div>
      )}

      {/* ── Hospital Information ──────────────────────────── */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-5 h-5 text-[var(--primary)]" />
          <CardTitle>Hospital Information</CardTitle>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Hospital Name" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
          <Input label="Tax Registration (NTN)" value={taxReg} onChange={(e) => setTaxReg(e.target.value)} />
          <div className="md:col-span-2">
            <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Hospital Logo</label>
            <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-[var(--surface-border)] rounded-[var(--radius-sm)] bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)] transition-all duration-200 cursor-pointer">
              <div className="flex flex-col items-center gap-1 text-[var(--text-tertiary)]">
                <Upload className="w-5 h-5" />
                <span className="text-xs font-medium">Click to upload logo</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── System Preferences ────────────────────────────── */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-[var(--primary)]" />
          <CardTitle>System Preferences</CardTitle>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Input
            label="Default Consultation Fee (Rs.)"
            type="number"
            value={consultationFee}
            onChange={(e) => setConsultationFee(e.target.value)}
          />
          <SelectField
            label="Token Reset Time"
            value={tokenResetTime}
            onChange={setTokenResetTime}
            options={[
              { value: 'midnight', label: 'Midnight (12:00 AM)' },
              { value: '6am', label: '6:00 AM' },
              { value: '8am', label: '8:00 AM' },
            ]}
          />
          <SelectField
            label="Fiscal Year Start"
            value={fiscalYearStart}
            onChange={setFiscalYearStart}
            options={[
              { value: 'january', label: 'January' },
              { value: 'april', label: 'April' },
              { value: 'july', label: 'July' },
              { value: 'october', label: 'October' },
            ]}
          />
          <Input
            label="Currency Symbol"
            value={currencySymbol}
            onChange={(e) => setCurrencySymbol(e.target.value)}
          />
          <SelectField
            label="Date Format"
            value={dateFormat}
            onChange={setDateFormat}
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            ]}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Auto-Backup</label>
            <div className="flex items-center gap-3 pt-1.5">
              <Toggle enabled={autoBackup} onChange={setAutoBackup} />
              <span className="text-sm text-[var(--text-primary)]">{autoBackup ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Notification Settings ─────────────────────────── */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-[var(--primary)]" />
          <CardTitle>Notification Settings</CardTitle>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Low Stock Threshold"
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Lab Result Notification</label>
            <div className="flex items-center gap-3 pt-1.5">
              <Toggle enabled={labResultNotif} onChange={setLabResultNotif} />
              <span className="text-sm text-[var(--text-primary)]">{labResultNotif ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Appointment Reminder</label>
            <div className="flex items-center gap-3 pt-1.5">
              <Toggle enabled={appointmentReminder} onChange={setAppointmentReminder} />
              <span className="text-sm text-[var(--text-primary)]">{appointmentReminder ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">SMS Notifications</label>
            <div className="flex items-center gap-3 pt-1.5">
              <Toggle enabled={smsNotif} onChange={setSmsNotif} disabled />
              <span className="text-sm text-[var(--text-tertiary)]">Coming in Phase 2</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Appearance & Theme ─────────────────────────────── */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-[var(--primary)]" />
          <CardTitle>Appearance</CardTitle>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Choose your preferred color theme. Your selection is saved and applied across all sessions.
          </p>
          <div className="flex items-center gap-6">
            <ThemePreview />
            <div className="text-sm text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)] mb-1">Current Theme</p>
              <p className="capitalize text-[var(--primary)] font-semibold">
                {/* Displayed at runtime via ThemePreview */}
                System-synced unless manually overridden
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Printing ──────────────────────────────────────── */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Printer className="w-5 h-5 text-[var(--primary)]" />
          <CardTitle>Printing</CardTitle>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Receipt Printer"
            value={receiptPrinter}
            onChange={setReceiptPrinter}
            options={[
              { value: 'default', label: 'Default System Printer' },
              { value: 'thermal', label: 'Thermal Printer (80mm)' },
              { value: 'a4', label: 'A4 Printer' },
            ]}
          />
          <SelectField
            label="Prescription Format"
            value={prescriptionFormat}
            onChange={setPrescriptionFormat}
            options={[
              { value: 'A5', label: 'A5 (Half Page)' },
              { value: 'A4', label: 'A4 (Full Page)' },
            ]}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Auto-Print Receipts</label>
            <div className="flex items-center gap-3 pt-1.5">
              <Toggle enabled={autoPrintReceipts} onChange={setAutoPrintReceipts} />
              <span className="text-sm text-[var(--text-primary)]">{autoPrintReceipts ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Print Lab Header</label>
            <div className="flex items-center gap-3 pt-1.5">
              <Toggle enabled={printLabHeader} onChange={setPrintLabHeader} />
              <span className="text-sm text-[var(--text-primary)]">{printLabHeader ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Accessibility ─────────────────────────────────── */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="w-5 h-5 text-[var(--primary)]" />
          <CardTitle>Accessibility</CardTitle>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4 p-4 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)]">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Color-Blind Friendly Mode</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 max-w-md">
                Replaces red/green color indicators with shapes and blue/orange colors for better accessibility. Follows the Wong color-blind-safe palette.
              </p>
              {colorBlindMode && (
                <p className="text-xs text-[var(--primary)] mt-1.5 font-medium">
                  Active — All danger/success colors replaced with blue/orange variants
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm text-[var(--text-primary)]">
                {colorBlindMode ? 'Enabled' : 'Disabled'}
              </span>
              <Toggle enabled={colorBlindMode} onChange={() => toggleColorBlindMode()} />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Danger Zone ───────────────────────────────────── */}
      <Card hover={false} className="p-6 border-red-200 dark:border-red-900/30">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <CardTitle>Danger Zone</CardTitle>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[var(--radius-sm)] border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Reset Demo Data</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Restore all data to the original demo state. This cannot be undone.</p>
            </div>
            <Button variant="danger" size="sm" loading={resetLoading} onClick={handleResetDemoData}>Reset Demo Data</Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[var(--radius-sm)] border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Clear All Sessions</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Log out all active users and clear session data.</p>
            </div>
            <Button variant="danger" size="sm" loading={clearSessionsLoading} onClick={handleClearSessions}>Clear All Sessions</Button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="glow" size="lg" onClick={handleSave}>
          <Save className="w-5 h-5" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
