import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User, ShoppingCart, Package, BarChart3, History, Settings, Boxes, Heart, ClipboardCheck, RotateCcw, Bell, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const posNavItems = [
  { label: 'POS', path: '/pharmacy/pos', icon: ShoppingCart },
  { label: 'Products', path: '/pharmacy/products', icon: Package },
  { label: 'Stock', path: '/pharmacy/stock', icon: Boxes },
  { label: 'Stock Alerts', path: '/pharmacy/stock-alerts', icon: Bell },
  { label: 'Expiry Alerts', path: '/pharmacy/expiry', icon: ShieldAlert },
  { label: 'Verify Rx', path: '/pharmacy/verify', icon: ClipboardCheck },
  { label: 'Returns', path: '/pharmacy/returns', icon: RotateCcw },
  { label: 'Sales History', path: '/pharmacy/sales', icon: History },
  { label: 'Reports', path: '/pharmacy/reports', icon: BarChart3 },
  { label: 'Settings', path: '/pharmacy/settings', icon: Settings },
];

export function POSLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? Unsaved changes will be lost.')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="pos-theme flex">
      {/* Sidebar */}
      <aside className="w-56 h-screen flex flex-col bg-[var(--pos-surface)] border-r border-[var(--pos-border)] shrink-0">
        <div className="px-5 py-4 border-b border-[var(--pos-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--pos-accent)] flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[var(--pos-accent)]">Stryde Pharmacy</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">ePOS System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {posNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-250 group',
                  isActive
                    ? 'bg-[var(--pos-accent)] text-white shadow-[0_2px_12px_rgba(13,148,136,0.3)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <item.icon className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-3 border-t border-[var(--pos-border)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--pos-accent)] to-teal-400 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--pos-text)] truncate">{user?.fullName}</p>
            <p className="text-[11px] text-gray-500">{ROLE_LABELS[user?.role || ''] || 'Pharmacist'}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 hover:bg-white/5 rounded transition-colors" title="Logout">
            <LogOut className="w-4 h-4 text-gray-500 hover:text-red-400 transition-colors" />
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
