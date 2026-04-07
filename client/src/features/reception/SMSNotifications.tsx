import { useState } from 'react';
import {
  MessageCircle, Settings, History, CheckCircle2, XCircle,
  Clock, Phone, ChevronDown, ChevronUp, AlertTriangle, Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SMSEvent {
  id: string;
  enabled: boolean;
  label: string;
  description: string;
  template: string;
}

type SMSStatus = 'sent' | 'failed' | 'pending';

interface SMSHistoryEntry {
  id: string;
  date: string;
  time: string;
  patient: string;
  phone: string;
  type: string;
  preview: string;
  status: SMSStatus;
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
        enabled ? 'bg-[var(--primary)]' : 'bg-[var(--surface-border)]'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
          enabled ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const initialEvents: SMSEvent[] = [
  {
    id: 'appt_confirmed',
    enabled: true,
    label: 'Appointment Confirmed',
    description: 'Sent when a scheduled appointment is confirmed by the receptionist.',
    template: 'Dear {{patient_name}}, your appointment with {{doctor}} on {{date}} at {{time}} has been confirmed. Token: {{token}}. Stryde Health.',
  },
  {
    id: 'token_generated',
    enabled: true,
    label: 'Token Generated',
    description: 'Sent when a token is issued to a walk-in or scheduled patient.',
    template: 'Dear {{patient_name}}, your token number is {{token}}. Current queue position: {{position}}. Estimated wait: {{wait_time}} min. Stryde Health.',
  },
  {
    id: 'doctor_ready',
    enabled: true,
    label: 'Doctor Ready (Position ≤ 3)',
    description: 'Sent when the patient reaches position 3 or less in the queue.',
    template: 'Dear {{patient_name}}, you are next! Please be ready. Your token {{token}} will be called shortly. Room: {{room}}. Stryde Health.',
  },
  {
    id: 'lab_results',
    enabled: true,
    label: 'Lab Results Ready',
    description: 'Sent when lab test results are finalized and ready to view.',
    template: 'Dear {{patient_name}}, your lab results ({{test_name}}) are now ready. Please visit or contact {{doctor}} for your report. Stryde Health.',
  },
  {
    id: 'prescription_ready',
    enabled: true,
    label: 'Prescription at Pharmacy',
    description: 'Sent when a prescription is verified and ready at the pharmacy counter.',
    template: 'Dear {{patient_name}}, your prescription is ready for collection at our pharmacy counter. Please bring your token {{token}}. Stryde Health.',
  },
  {
    id: 'followup_reminder',
    enabled: false,
    label: 'Follow-up Reminder (1 day before)',
    description: 'Sent one day before a scheduled follow-up appointment.',
    template: 'Dear {{patient_name}}, this is a reminder of your follow-up with {{doctor}} tomorrow at {{time}}. Please bring your reports. Stryde Health.',
  },
];

const demoHistory: SMSHistoryEntry[] = [
  { id: 'h1', date: '07 Apr 2026', time: '09:02 AM', patient: 'Ahmad Khan', phone: '0300-1234567', type: 'Token Generated', preview: 'Dear Ahmad Khan, your token number is T-001. Queue pos: 4...', status: 'sent' },
  { id: 'h2', date: '07 Apr 2026', time: '09:15 AM', patient: 'Fatima Bibi', phone: '0321-2345678', type: 'Appointment Confirmed', preview: 'Dear Fatima Bibi, your appointment with Dr. Saira Khan...', status: 'sent' },
  { id: 'h3', date: '07 Apr 2026', time: '09:47 AM', patient: 'Rashid Mehmood', phone: '0333-5678901', type: 'Doctor Ready', preview: 'Dear Rashid Mehmood, you are next! Please be ready. Token T-003...', status: 'sent' },
  { id: 'h4', date: '07 Apr 2026', time: '10:30 AM', patient: 'Sadia Parveen', phone: '0312-4567890', type: 'Lab Results Ready', preview: 'Dear Sadia Parveen, your lab results (CBC) are now ready...', status: 'failed' },
  { id: 'h5', date: '07 Apr 2026', time: '11:05 AM', patient: 'Zainab Fatima', phone: '0345-6789012', type: 'Prescription at Pharmacy', preview: 'Dear Zainab Fatima, your prescription is ready for collection...', status: 'sent' },
  { id: 'h6', date: '06 Apr 2026', time: '02:15 PM', patient: 'Hassan Raza', phone: '0300-7890123', type: 'Follow-up Reminder', preview: 'Dear Hassan Raza, this is a reminder of your follow-up...', status: 'sent' },
  { id: 'h7', date: '06 Apr 2026', time: '03:30 PM', patient: 'Amna Bibi', phone: '0321-8901234', type: 'Appointment Confirmed', preview: 'Dear Amna Bibi, your appointment with Dr. Farhan Sheikh...', status: 'pending' },
  { id: 'h8', date: '06 Apr 2026', time: '04:00 PM', patient: 'Tariq Hussain', phone: '0333-0123456', type: 'Token Generated', preview: 'Dear Tariq Hussain, your token number is T-008. Queue pos: 6...', status: 'sent' },
  { id: 'h9', date: '05 Apr 2026', time: '09:45 AM', patient: 'Nasreen Bano', phone: '0312-1234567', type: 'Doctor Ready', preview: 'Dear Nasreen Bano, you are next! Token T-016 will be called...', status: 'failed' },
  { id: 'h10', date: '05 Apr 2026', time: '11:20 AM', patient: 'Khalid Mahmood', phone: '0345-2345678', type: 'Lab Results Ready', preview: 'Dear Khalid Mahmood, your lab results (LFTs) are now ready...', status: 'sent' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SMSNotifications() {
  const [events, setEvents] = useState<SMSEvent[]>(initialEvents);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggleEvent(id: string, val: boolean) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, enabled: val } : e)));
  }

  function updateTemplate(id: string, template: string) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, template } : e)));
  }

  function handleSave() {
    setSaved(true);
    toast.success('SMS notification settings saved.', 'Settings Saved');
    setTimeout(() => setSaved(false), 3000);
  }

  const enabledCount = events.filter((e) => e.enabled).length;
  const sentCount = demoHistory.filter((h) => h.status === 'sent').length;
  const failedCount = demoHistory.filter((h) => h.status === 'failed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">SMS Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Configure automated SMS alerts for patients</p>
        </div>
        <Button variant="glow" size="sm" onClick={handleSave}>
          <CheckCircle2 className="w-4 h-4" />
          Save Settings
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card-static p-4 rounded-[var(--radius-md)]">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Active Triggers</p>
          <p className="text-2xl font-black text-[var(--primary)] mt-1">{enabledCount}/{events.length}</p>
        </div>
        <div className="glass-card-static p-4 rounded-[var(--radius-md)]">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Sent Today</p>
          <p className="text-2xl font-black text-[var(--text-primary)] mt-1">{sentCount}</p>
        </div>
        <div className="glass-card-static p-4 rounded-[var(--radius-md)]">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Failed</p>
          <p className="text-2xl font-black text-red-500 mt-1">{failedCount}</p>
        </div>
        <div className="glass-card-static p-4 rounded-[var(--radius-md)]">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Success Rate</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {Math.round((sentCount / demoHistory.length) * 100)}%
          </p>
        </div>
      </div>

      {/* Gateway warning */}
      <div className="flex items-start gap-3 p-4 rounded-[var(--radius-sm)] bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">SMS Gateway Not Configured</p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
            SMS gateway integration is required. Contact IT department to configure Twilio / EasyPaisa SMS gateway.
          </p>
        </div>
      </div>

      {/* Event configuration */}
      <Card hover={false} className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--surface-border)]">
          <Settings className="w-4 h-4 text-[var(--primary)]" />
          <CardTitle>Notification Triggers</CardTitle>
        </div>
        <div className="divide-y divide-[var(--surface-border)]">
          {events.map((event) => {
            const isExpanded = expandedEvent === event.id;
            return (
              <div key={event.id} className="transition-colors hover:bg-[var(--surface-hover)]/30">
                {/* Row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <Toggle enabled={event.enabled} onChange={(v) => toggleEvent(event.id, v)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-semibold',
                      event.enabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                    )}>
                      {event.label}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">{event.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={event.enabled ? 'success' : 'cancelled'}
                      dot
                      className="text-[10px] hidden sm:flex"
                    >
                      {event.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                    <button
                      onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors text-[var(--text-tertiary)]"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded template editor */}
                {isExpanded && (
                  <div className="px-5 pb-4 animate-fade-in">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Message Template</label>
                        <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                          <Info className="w-3 h-3" />
                          <span>Variables: {'{{patient_name}}, {{token}}, {{doctor}}, {{date}}, {{time}}, {{room}}'}</span>
                        </div>
                      </div>
                      <textarea
                        value={event.template}
                        onChange={(e) => updateTemplate(event.id, e.target.value)}
                        rows={3}
                        className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] resize-none transition-all font-mono"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {event.template.length} characters
                          {event.template.length > 160 && (
                            <span className="text-amber-500 ml-2">(SMS will be split: {Math.ceil(event.template.length / 160)} parts)</span>
                          )}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toast.info(`Test SMS simulated for "${event.label}"`, 'Test Sent')}
                        >
                          Send Test
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* History */}
      <Card hover={false} className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--surface-border)]">
          <History className="w-4 h-4 text-[var(--primary)]" />
          <CardTitle>SMS History</CardTitle>
          <span className="ml-auto text-xs text-[var(--text-tertiary)]">Last {demoHistory.length} messages</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--surface-border)] bg-[var(--surface)]/50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider whitespace-nowrap">Date / Time</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider whitespace-nowrap">Patient</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Message Preview</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {demoHistory.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-[var(--surface-border)]/50 hover:bg-[var(--surface-hover)]/30 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{entry.date}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{entry.time}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{entry.patient}</p>
                    <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
                      <Phone className="w-3 h-3" />
                      {entry.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-[var(--text-secondary)]">{entry.type}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell max-w-xs">
                    <p className="text-xs text-[var(--text-tertiary)] truncate">{entry.preview}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {entry.status === 'sent' && (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Sent</span>
                      </div>
                    )}
                    {entry.status === 'failed' && (
                      <div className="flex items-center gap-1.5 text-red-500">
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Failed</span>
                      </div>
                    )}
                    {entry.status === 'pending' && (
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Pending</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Gateway note */}
      <div className="flex items-start gap-3 p-4 rounded-[var(--radius-sm)] glass-card-static">
        <MessageCircle className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
        <p className="text-sm text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">SMS Gateway Integration Required.</span>{' '}
          Contact the IT department to configure a Twilio or EasyPaisa SMS gateway. Once configured, all enabled triggers above will fire automatically.
        </p>
      </div>
    </div>
  );
}
