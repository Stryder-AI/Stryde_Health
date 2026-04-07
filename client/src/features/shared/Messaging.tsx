import { useState } from 'react';
import {
  MessageSquare, Send, Search, Users, Hash, Circle, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  text: string;
  time: string;
  isOwn?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  type: 'channel' | 'direct';
  department?: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  avatar?: string;
}

const demoConversations: Conversation[] = [
  { id: 'ch-reception', name: 'Reception', type: 'channel', department: 'Reception', lastMessage: 'New patient registered — MR-2026-00009', lastTime: '10:42 AM', unread: 2 },
  { id: 'ch-opd', name: 'OPD', type: 'channel', department: 'OPD', lastMessage: 'Token #15 is ready for consultation', lastTime: '10:38 AM', unread: 0 },
  { id: 'ch-lab', name: 'Laboratory', type: 'channel', department: 'Laboratory', lastMessage: 'CBC results ready for Ahmad Khan', lastTime: '10:35 AM', unread: 3 },
  { id: 'ch-pharmacy', name: 'Pharmacy', type: 'channel', department: 'Pharmacy', lastMessage: 'Prescription #RX-1042 dispensed', lastTime: '10:25 AM', unread: 0 },
  { id: 'ch-admin', name: 'Admin', type: 'channel', department: 'Admin', lastMessage: 'Updated consultation fees for Cardiology', lastTime: '10:15 AM', unread: 1 },
  { id: 'dm-tariq', name: 'Dr. Tariq Ahmed', type: 'direct', lastMessage: 'Please send the lab reports', lastTime: '10:30 AM', unread: 1 },
  { id: 'dm-ayesha', name: 'Ayesha Khan', type: 'direct', lastMessage: 'Patient is on the way', lastTime: '10:20 AM', unread: 0 },
  { id: 'dm-hamza', name: 'Hamza Ali', type: 'direct', lastMessage: 'Thyroid profile template updated', lastTime: '9:50 AM', unread: 0 },
];

const demoMessages: Record<string, Message[]> = {
  'ch-reception': [
    { id: '1', sender: 'Ayesha Khan', senderRole: 'Receptionist', text: 'Good morning everyone! Reception is open.', time: '09:25 AM' },
    { id: '2', sender: 'Admin User', senderRole: 'Admin', text: 'Good morning. Reminder: please verify insurance details for all new registrations.', time: '09:28 AM' },
    { id: '3', sender: 'Ayesha Khan', senderRole: 'Receptionist', text: 'Noted. First patient of the day has arrived — Ahmed Raza for Cardiology.', time: '09:32 AM' },
    { id: '4', sender: 'Dr. Tariq Ahmed', senderRole: 'Doctor', text: 'I am ready in OPD Room 3. Please send the first token.', time: '09:35 AM' },
    { id: '5', sender: 'Ayesha Khan', senderRole: 'Receptionist', text: 'Token T-001 issued for Ahmed Raza. Sending him to OPD now.', time: '09:38 AM' },
    { id: '6', sender: 'Hamza Ali', senderRole: 'Lab Tech', text: 'Lab is operational. Ready for samples.', time: '09:40 AM' },
    { id: '7', sender: 'Bilal Shah', senderRole: 'Pharmacist', text: 'Pharmacy counter open. Stock verified this morning.', time: '09:42 AM' },
    { id: '8', sender: 'Ayesha Khan', senderRole: 'Receptionist', text: 'We have 5 walk-ins so far. 33 appointments scheduled for today.', time: '10:00 AM' },
    { id: '9', sender: 'Admin User', senderRole: 'Admin', text: 'Great start. Keep me posted on any issues.', time: '10:05 AM' },
    { id: '10', sender: 'Ayesha Khan', senderRole: 'Receptionist', text: 'New patient registered — Hassan Mahmood (MR-2026-00009)', time: '10:42 AM' },
  ],
  'ch-lab': [
    { id: '1', sender: 'Hamza Ali', senderRole: 'Lab Tech', text: 'Sample received for Ahmad Khan — CBC ordered.', time: '09:45 AM' },
    { id: '2', sender: 'Hamza Ali', senderRole: 'Lab Tech', text: 'Processing CBC. Results expected in 45 minutes.', time: '10:00 AM' },
    { id: '3', sender: 'Dr. Tariq Ahmed', senderRole: 'Doctor', text: 'Thanks Hamza. Please flag if anything critical.', time: '10:05 AM' },
    { id: '4', sender: 'Hamza Ali', senderRole: 'Lab Tech', text: 'CBC results ready for Ahmad Khan. All values within normal range.', time: '10:35 AM' },
    { id: '5', sender: 'Dr. Tariq Ahmed', senderRole: 'Doctor', text: 'Received. Will review now.', time: '10:37 AM' },
  ],
  'dm-tariq': [
    { id: '1', sender: 'Dr. Tariq Ahmed', senderRole: 'Doctor', text: 'Hi, can you check if CBC results are ready for Token #12?', time: '10:25 AM' },
    { id: '2', sender: 'You', senderRole: '', text: 'Let me check with the lab.', time: '10:27 AM', isOwn: true },
    { id: '3', sender: 'Dr. Tariq Ahmed', senderRole: 'Doctor', text: 'Please send the lab reports as soon as available.', time: '10:30 AM' },
  ],
};

const quickPresets = [
  'Lab results ready',
  'Patient en route',
  'Prescription pending',
  'Payment confirmed',
];

export default function Messaging() {
  const { user } = useAuthStore();
  const [activeConvo, setActiveConvo] = useState('ch-reception');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [localMessages, setLocalMessages] = useState(demoMessages);

  const activeConversation = demoConversations.find((c) => c.id === activeConvo);
  const messages = localMessages[activeConvo] || [];

  const filteredConvos = demoConversations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const channels = filteredConvos.filter((c) => c.type === 'channel');
  const directs = filteredConvos.filter((c) => c.type === 'direct');

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: crypto.randomUUID(),
      sender: user?.fullName || 'You',
      senderRole: '',
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };
    setLocalMessages((prev) => ({
      ...prev,
      [activeConvo]: [...(prev[activeConvo] || []), newMsg],
    }));
    setMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(message);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
          Messages
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Inter-department communication</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 h-[calc(100vh-220px)] overflow-hidden rounded-[var(--radius-md)]">
        {/* Left panel — Conversations */}
        <div className="glass-card rounded-none rounded-l-[var(--radius-md)] border-r border-[var(--surface-border)] flex flex-col p-0">
          {/* Search */}
          <div className="p-4 border-b border-[var(--surface-border)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--surface)] border border-[var(--surface-border)] rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {/* Channels */}
            <div className="px-4 pt-4 pb-1">
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-3 h-3" /> Channels
              </p>
            </div>
            {channels.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvo(c.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)]',
                  activeConvo === c.id && 'bg-[var(--primary-light)] border-r-2 border-[var(--primary)]'
                )}
              >
                <div className="w-9 h-9 rounded-[var(--radius-xs)] bg-[var(--primary-light)] flex items-center justify-center shrink-0">
                  <Hash className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{c.name}</p>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 ml-2">{c.lastTime}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold shrink-0">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}

            {/* Direct messages */}
            <div className="px-4 pt-5 pb-1">
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" /> Direct Messages
              </p>
            </div>
            {directs.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvo(c.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)]',
                  activeConvo === c.id && 'bg-[var(--primary-light)] border-r-2 border-[var(--primary)]'
                )}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{c.name}</p>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 ml-2">{c.lastTime}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold shrink-0">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel — Messages */}
        <div className="glass-card rounded-none rounded-r-[var(--radius-md)] flex flex-col p-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--surface-border)] shrink-0">
            {activeConversation?.type === 'channel' ? (
              <div className="w-9 h-9 rounded-[var(--radius-xs)] bg-[var(--primary-light)] flex items-center justify-center">
                <Hash className="w-4 h-4 text-[var(--primary)]" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {activeConversation?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {activeConversation?.type === 'channel' ? '#' : ''}{activeConversation?.name}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {activeConversation?.type === 'channel' ? `${activeConversation.department} department channel` : 'Direct message'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-3', msg.isOwn && 'flex-row-reverse')}>
                {!msg.isOwn && (
                  <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--surface-border)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                      {msg.sender.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className={cn('max-w-[70%]', msg.isOwn && 'text-right')}>
                  {!msg.isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{msg.sender}</span>
                      {msg.senderRole && (
                        <span className="text-[10px] text-[var(--text-tertiary)]">{msg.senderRole}</span>
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      'inline-block px-4 py-2.5 rounded-2xl text-sm',
                      msg.isOwn
                        ? 'bg-[var(--primary)] text-white rounded-br-md'
                        : 'bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-primary)] rounded-bl-md'
                    )}
                  >
                    {msg.text}
                  </div>
                  <p className={cn('text-[10px] text-[var(--text-tertiary)] mt-1', msg.isOwn && 'text-right')}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="px-6 py-2 border-t border-[var(--surface-border)] flex items-center gap-2 flex-wrap shrink-0">
            <Zap className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            {quickPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => sendMessage(preset)}
                className="px-3 py-1 text-xs font-medium bg-[var(--surface)] border border-[var(--surface-border)] rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-[var(--surface-border)] shrink-0">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 text-sm bg-[var(--surface)] border border-[var(--surface-border)] rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <Button type="submit" variant="primary" size="sm" disabled={!message.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
