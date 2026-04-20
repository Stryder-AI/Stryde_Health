import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, X, Plus, Minus, Trash2, ShoppingCart, CreditCard,
  Banknote, Smartphone, FileText, Percent, MessageSquare, User,
  Save, DollarSign, Printer, CheckCircle, ClipboardList, ChevronDown,
  ScanBarcode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/ui/Toast';
import { Receipt, type ReceiptData } from './Receipt';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Product {
  id: string;
  code: string;
  name: string;
  genericName: string;
  group: string;
  price: number;
  costPrice: number;
  stock: number;
  unit: string;
  requiresRx: boolean;
  barcode?: string;
}

interface CartItem {
  product: Product;
  qty: number;
  discount: number;
}

interface PrescriptionOrder {
  id: string;
  rxNumber: string;
  patient: string;
  doctor: string;
  date: string;
  items: { name: string; qty: number; dosage: string }[];
  status: 'pending' | 'partial' | 'ready';
}

type PaymentMethod = 'cash' | 'easypaisa' | 'credit' | 'cheque';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const demoProducts: Product[] = [
  { id: 'p1', code: 'TAB-001', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', group: 'Cardiovascular', price: 12.50, costPrice: 7.80, stock: 450, unit: 'Tab', requiresRx: true, barcode: '8901234500001' },
  { id: 'p2', code: 'TAB-002', name: 'Metformin 500mg', genericName: 'Metformin HCl', group: 'Anti-Diabetic', price: 8.00, costPrice: 4.50, stock: 800, unit: 'Tab', requiresRx: true, barcode: '8901234500002' },
  { id: 'p3', code: 'TAB-003', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', group: 'Antibiotics', price: 15.00, costPrice: 9.20, stock: 320, unit: 'Cap', requiresRx: true, barcode: '8901234500003' },
  { id: 'p4', code: 'TAB-004', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', group: 'Analgesics', price: 3.50, costPrice: 1.80, stock: 1500, unit: 'Tab', requiresRx: false, barcode: '8901234567890' },
  { id: 'p5', code: 'TAB-005', name: 'Omeprazole 20mg', genericName: 'Omeprazole', group: 'GI / Antacids', price: 10.00, costPrice: 5.60, stock: 600, unit: 'Cap', requiresRx: true, barcode: '8901234500005' },
  { id: 'p6', code: 'TAB-006', name: 'Atorvastatin 20mg', genericName: 'Atorvastatin Calcium', group: 'Cardiovascular', price: 18.00, costPrice: 11.00, stock: 280, unit: 'Tab', requiresRx: true, barcode: '8901234500006' },
  { id: 'p7', code: 'SYR-001', name: 'Calpol Syrup 120ml', genericName: 'Paracetamol', group: 'Pediatric', price: 85.00, costPrice: 55.00, stock: 95, unit: 'Btl', requiresRx: false, barcode: '8901234500007' },
  { id: 'p8', code: 'TAB-007', name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin HCl', group: 'Antibiotics', price: 12.00, costPrice: 6.80, stock: 400, unit: 'Tab', requiresRx: true, barcode: '8901234500008' },
  { id: 'p9', code: 'INJ-001', name: 'Normal Saline 1000ml', genericName: 'Sodium Chloride 0.9%', group: 'IV Fluids', price: 120.00, costPrice: 75.00, stock: 200, unit: 'Bag', requiresRx: true, barcode: '8901234500009' },
  { id: 'p10', code: 'TAB-008', name: 'Losartan 50mg', genericName: 'Losartan Potassium', group: 'Cardiovascular', price: 14.00, costPrice: 8.50, stock: 350, unit: 'Tab', requiresRx: true, barcode: '8901234500010' },
  { id: 'p11', code: 'CRM-001', name: 'Betnovate Cream 20g', genericName: 'Betamethasone', group: 'Topical', price: 95.00, costPrice: 62.00, stock: 80, unit: 'Tube', requiresRx: false, barcode: '8901234500011' },
  { id: 'p12', code: 'DRP-001', name: 'Ciprofloxacin Eye Drops', genericName: 'Ciprofloxacin 0.3%', group: 'Eye / Ear Drops', price: 65.00, costPrice: 38.00, stock: 120, unit: 'Btl', requiresRx: true, barcode: '8901234500012' },
  { id: 'p13', code: 'TAB-009', name: 'Diclofenac 50mg', genericName: 'Diclofenac Sodium', group: 'Analgesics', price: 5.00, costPrice: 2.80, stock: 900, unit: 'Tab', requiresRx: false, barcode: '8901234500013' },
  { id: 'p14', code: 'SYR-002', name: 'Ambroxol Syrup 100ml', genericName: 'Ambroxol HCl', group: 'Respiratory', price: 75.00, costPrice: 45.00, stock: 110, unit: 'Btl', requiresRx: false, barcode: '8901234500014' },
  { id: 'p15', code: 'TAB-010', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', group: 'OTC / General', price: 4.00, costPrice: 2.00, stock: 700, unit: 'Tab', requiresRx: false, barcode: '8901234500015' },
  { id: 'p16', code: 'INJ-002', name: 'Ceftriaxone 1g Inj', genericName: 'Ceftriaxone Sodium', group: 'Injectables', price: 180.00, costPrice: 120.00, stock: 75, unit: 'Vial', requiresRx: true, barcode: '8901234500016' },
  { id: 'p17', code: 'TAB-011', name: 'Metoprolol 50mg', genericName: 'Metoprolol Tartrate', group: 'Cardiovascular', price: 9.00, costPrice: 5.00, stock: 420, unit: 'Tab', requiresRx: true, barcode: '8901234500017' },
  { id: 'p18', code: 'TAB-012', name: 'Gabapentin 300mg', genericName: 'Gabapentin', group: 'Neurological', price: 16.00, costPrice: 10.00, stock: 260, unit: 'Cap', requiresRx: true, barcode: '8901234500018' },
  { id: 'p19', code: 'BND-001', name: 'Crepe Bandage 6inch', genericName: 'N/A', group: 'Surgical', price: 45.00, costPrice: 28.00, stock: 150, unit: 'Pc', requiresRx: false, barcode: '8901234500019' },
  { id: 'p20', code: 'TAB-013', name: 'Montelukast 10mg', genericName: 'Montelukast Sodium', group: 'Respiratory', price: 22.00, costPrice: 14.00, stock: 310, unit: 'Tab', requiresRx: true, barcode: '8901234500020' },
];

const demoPrescriptions: PrescriptionOrder[] = [
  {
    id: 'rx1', rxNumber: 'RX-20260329-001', patient: 'Ahmed Raza', doctor: 'Dr. Farhan Sheikh', date: '2026-03-29 09:15',
    items: [{ name: 'Amlodipine 5mg', qty: 30, dosage: '1x daily' }, { name: 'Atorvastatin 20mg', qty: 30, dosage: '1x at night' }],
    status: 'pending',
  },
  {
    id: 'rx2', rxNumber: 'RX-20260329-002', patient: 'Fatima Bibi', doctor: 'Dr. Sana Malik', date: '2026-03-29 09:30',
    items: [{ name: 'Amoxicillin 500mg', qty: 21, dosage: '3x daily for 7 days' }, { name: 'Omeprazole 20mg', qty: 14, dosage: '1x before breakfast' }],
    status: 'pending',
  },
  {
    id: 'rx3', rxNumber: 'RX-20260329-003', patient: 'Usman Tariq', doctor: 'Dr. Asif Javed', date: '2026-03-29 10:00',
    items: [{ name: 'Diclofenac 50mg', qty: 14, dosage: '2x daily after meals' }, { name: 'Crepe Bandage 6inch', qty: 2, dosage: 'Apply as needed' }],
    status: 'ready',
  },
  {
    id: 'rx4', rxNumber: 'RX-20260329-004', patient: 'Bilal Hussain', doctor: 'Dr. Nadia Qureshi', date: '2026-03-29 10:20',
    items: [{ name: 'Metformin 500mg', qty: 60, dosage: '2x daily' }, { name: 'Losartan 50mg', qty: 30, dosage: '1x morning' }],
    status: 'pending',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatRs(n: number) {
  return `Rs. ${n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateSaleNumber() {
  return `SL-${Date.now().toString().slice(-8)}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function POS() {
  const user = useAuthStore((s) => s.user);
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Barcode scanner
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const lastKeystrokeRef = useRef<number>(0);
  const keystrokeBufferRef = useRef<string>('');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saleDiscount, setSaleDiscount] = useState(0);
  const [saleComment, setSaleComment] = useState('');
  const [customer, setCustomer] = useState('');

  // Modals
  const [paymentModal, setPaymentModal] = useState(false);
  const [discountModal, setDiscountModal] = useState(false);
  const [commentModal, setCommentModal] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [completedModal, setCompletedModal] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountReceived, setAmountReceived] = useState('');

  // Receipt
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'cart' | 'rx'>('cart');

  // Prescription detail
  const [selectedRx, setSelectedRx] = useState<string | null>(null);

  // ------- Cart Calculations -------
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const itemDiscounts = cart.reduce((sum, item) => sum + item.discount * item.qty, 0);
  const totalDiscount = Math.min(itemDiscounts + saleDiscount, subtotal);
  const taxRate = 0; // Can be configured
  const taxAmount = Math.max(0, subtotal - totalDiscount) * taxRate;
  const total = Math.max(0, subtotal - totalDiscount + taxAmount);

  // ------- Search -------
  useEffect(() => {
    if (searchTerm.length < 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const q = searchTerm.toLowerCase();
    const results = demoProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.genericName.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q))
    ).slice(0, 8);
    setSearchResults(results);
    setShowResults(results.length > 0);
  }, [searchTerm]);

  // ------- Cart Actions -------
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast.warning(`Only ${product.stock} ${product.unit} of ${product.name} in stock`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      if (product.stock <= 0) {
        toast.warning(`${product.name} is out of stock`);
        return prev;
      }
      return [...prev, { product, qty: 1, discount: 0 }];
    });
    setSearchTerm('');
    setShowResults(false);
    setActiveTab('cart');
  }, []);

  // ------- Barcode Scanner Handler -------
  const handleBarcodeScan = useCallback((barcode: string) => {
    const trimmed = barcode.trim();
    if (!trimmed) return;
    const product = demoProducts.find((p) => p.barcode === trimmed || p.code === trimmed);
    if (product) {
      setScannerActive(true);
      setTimeout(() => setScannerActive(false), 600);
      addToCart(product);
      setBarcodeError(null);
    } else {
      setBarcodeError(`Product not found: ${trimmed}`);
      setTimeout(() => setBarcodeError(null), 3000);
    }
    setBarcodeInput('');
  }, [addToCart]);

  const handleBarcodeKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = Date.now();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBarcodeScan(barcodeInput);
      keystrokeBufferRef.current = '';
      return;
    }
    // Detect fast typing (barcode scanners type < 50ms between keystrokes)
    const timeDelta = now - lastKeystrokeRef.current;
    lastKeystrokeRef.current = now;
    if (timeDelta < 80) {
      setScannerActive(true);
    }
  }, [barcodeInput, handleBarcodeScan]);

  // Click outside to close search
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const setItemDiscount = (productId: string, discount: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, discount } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setSaleDiscount(0);
    setSaleComment('');
    setCustomer('');
  };

  // ------- Load Prescription into Cart -------
  const loadPrescription = (rx: PrescriptionOrder) => {
    const newItems: CartItem[] = [];
    for (const rxItem of rx.items) {
      const product = demoProducts.find((p) => p.name === rxItem.name);
      if (product) {
        newItems.push({ product, qty: rxItem.qty, discount: 0 });
      }
    }
    setCart(newItems);
    setCustomer(rx.patient);
    setActiveTab('cart');
  };

  // ------- Payment -------
  const openPayment = () => {
    if (cart.length === 0) return;
    setAmountReceived('');
    setPaymentModal(true);
  };

  const completeSale = () => {
    const received = parseFloat(amountReceived) || 0;
    const change = Math.max(0, received - total);

    const receipt: ReceiptData = {
      saleNumber: generateSaleNumber(),
      date: new Date().toLocaleDateString('en-PK'),
      time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
      cashier: user?.fullName || 'Pharmacist',
      customer: customer || undefined,
      items: cart.map((item) => ({
        name: item.product.name,
        qty: item.qty,
        price: item.product.price,
        discount: item.discount > 0 ? item.discount * item.qty : undefined,
        amount: item.product.price * item.qty - item.discount * item.qty,
      })),
      subtotal,
      discount: totalDiscount,
      tax: taxAmount,
      total,
      paymentMethod: paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'easypaisa' ? 'EasyPaisa' : paymentMethod === 'credit' ? 'Credit Card' : 'Cheque',
      amountReceived: received,
      change,
    };

    setReceiptData(receipt);
    setPaymentModal(false);
    setCompletedModal(true);
  };

  const finishSale = () => {
    setCompletedModal(false);
    setReceiptData(null);
    clearCart();
  };

  const printReceipt = () => {
    if (!receiptRef.current) return;
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Receipt</title><style>body{margin:0;padding:0;}</style></head><body>${receiptRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  // ------- Keyboard Shortcuts -------
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      // Don't trigger if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          (target as HTMLInputElement).blur();
          setShowResults(false);
        }
        return;
      }

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'F2':
          e.preventDefault();
          if (cart.length > 0) setDiscountModal(true);
          break;
        case 'F3':
          e.preventDefault();
          setCommentModal(true);
          break;
        case 'F4':
          e.preventDefault();
          setCustomerModal(true);
          break;
        case 'F9':
          e.preventDefault();
          if (cart.length > 0) { toast.success('Sale saved as draft'); }
          break;
        case 'F10':
          e.preventDefault();
          openPayment();
          break;
        case 'Delete':
          if (e.ctrlKey && cart.length > 0) {
            e.preventDefault();
            if (window.confirm(`Clear all ${cart.length} item(s) from the cart?`)) {
              clearCart();
            }
          }
          break;
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, total]);

  const received = parseFloat(amountReceived) || 0;
  const change = Math.max(0, received - total);

  return (
    <div className="flex h-full overflow-hidden">
      {/* ============ LEFT PANEL ============ */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--pos-border)]">
        {/* Barcode Scanner + Search Bar */}
        <div ref={searchRef} className="relative px-4 pt-4 pb-3 space-y-2">
          {/* Barcode Scanner Input */}
          <div className="relative">
            <ScanBarcode className={cn(
              'absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300',
              scannerActive ? 'text-[var(--pos-accent)] scale-110 animate-pulse' : 'text-gray-500'
            )} />
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              placeholder="Scan barcode or search..."
              autoFocus
              className={cn(
                'w-full h-11 pl-11 pr-10 rounded-xl bg-[var(--pos-card)] border text-[var(--pos-text)] placeholder:text-gray-500 text-sm focus:outline-none transition-all',
                scannerActive
                  ? 'border-[var(--pos-accent)] ring-1 ring-[var(--pos-accent)] shadow-[0_0_15px_rgba(13,148,136,0.15)]'
                  : 'border-[var(--pos-border)] focus:border-[var(--pos-accent)] focus:ring-1 focus:ring-[var(--pos-accent)]'
              )}
            />
            {barcodeInput && (
              <button
                onClick={() => setBarcodeInput('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Barcode error toast */}
          {barcodeError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in" style={{ animationDuration: '0.15s' }}>
              <X className="w-4 h-4 shrink-0" />
              <span>{barcodeError}</span>
            </div>
          )}

          {/* Product Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, generic name, or code (F1)"
              className="w-full h-12 pl-11 pr-10 rounded-xl bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] placeholder:text-gray-500 text-sm focus:outline-none focus:border-[var(--pos-accent)] focus:ring-1 focus:ring-[var(--pos-accent)] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setShowResults(false); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showResults && (
            <div className="absolute left-4 right-4 top-full mt-1 z-50 bg-[#1a2235] border border-[var(--pos-border)] rounded-xl shadow-2xl overflow-hidden animate-fade-in" style={{ animationDuration: '0.1s' }}>
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--pos-accent)]/10 transition-colors text-left border-b border-[var(--pos-border)] last:border-0"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--pos-accent)]/15 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 text-[var(--pos-accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--pos-text)] truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.code} &middot; {product.genericName}{product.barcode ? ` \u00b7 ${product.barcode}` : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[var(--pos-accent)]">{formatRs(product.price)}</p>
                    <p className="text-xs text-gray-500">Stock: {product.stock} {product.unit}</p>
                  </div>
                  <Plus className="w-5 h-5 text-gray-500 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <div className="flex px-4 gap-1">
          <button
            onClick={() => setActiveTab('cart')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
              activeTab === 'cart'
                ? 'bg-[var(--pos-card)] text-[var(--pos-text)] border border-b-0 border-[var(--pos-border)]'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            Cart {cart.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[var(--pos-accent)] text-white text-[10px] font-bold rounded-full">{cart.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('rx')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
              activeTab === 'rx'
                ? 'bg-[var(--pos-card)] text-[var(--pos-text)] border border-b-0 border-[var(--pos-border)]'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <ClipboardList className="w-4 h-4" />
            Rx Queue
            <span className="ml-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full">
              {demoPrescriptions.filter((r) => r.status === 'pending').length}
            </span>
          </button>
        </div>

        {/* Cart / Rx Content */}
        <div className="flex-1 mx-4 mb-4 bg-[var(--pos-card)] border border-[var(--pos-border)] rounded-b-xl rounded-tr-xl overflow-hidden flex flex-col">
          {activeTab === 'cart' ? (
            <>
              {/* Cart Header */}
              <div className="grid grid-cols-[1fr_80px_90px_90px_40px] gap-2 px-4 py-2.5 bg-white/[0.03] border-b border-[var(--pos-border)] text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <span>Product</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Price</span>
                <span className="text-right">Amount</span>
                <span />
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">No items in cart</p>
                    <p className="text-gray-500 text-xs mt-1">Add products using search or barcode scanner</p>
                    <p className="text-gray-700 text-xs mt-3">Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-gray-500 font-mono">F1</kbd> to focus search</p>
                  </div>
                ) : (
                  <div>
                    {cart.map((item, index) => (
                      <div
                        key={item.product.id}
                        className={cn(
                          'grid grid-cols-[1fr_80px_90px_90px_40px] gap-2 items-center px-4 py-3 border-b border-[var(--pos-border)] hover:bg-white/[0.02] transition-colors',
                          index === cart.length - 1 && 'animate-fade-in'
                        )}
                        style={index === cart.length - 1 ? { animationDuration: '0.2s' } : undefined}
                      >
                        {/* Product Info */}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--pos-text)] truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-500 truncate">{item.product.code} &middot; {item.product.genericName}</p>
                          {item.discount > 0 && (
                            <p className="text-xs text-emerald-400 mt-0.5">-{formatRs(item.discount)}/unit discount</p>
                          )}
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateQty(item.product.id, -1)}
                            className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-[var(--pos-text)] tabular-nums">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.product.id, 1)}
                            className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-sm text-gray-300 tabular-nums">{formatRs(item.product.price)}</span>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <span className="text-sm font-semibold text-[var(--pos-text)] tabular-nums">
                            {formatRs(item.product.price * item.qty - item.discount * item.qty)}
                          </span>
                        </div>

                        {/* Remove */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer - Totals */}
              {cart.length > 0 && (
                <div className="border-t border-[var(--pos-border)] bg-white/[0.02] px-4 py-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                    <span className="tabular-nums">{formatRs(subtotal)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-400">
                      <span>Discount</span>
                      <span className="tabular-nums">-{formatRs(totalDiscount)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                      <span className="tabular-nums">{formatRs(taxAmount)}</span>
                    </div>
                  )}
                  {saleComment && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MessageSquare className="w-3 h-3" />
                      <span className="truncate">{saleComment}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-[var(--pos-text)] pt-1 border-t border-[var(--pos-border)]">
                    <span>TOTAL</span>
                    <span className="tabular-nums text-[var(--pos-accent)]">{formatRs(total)}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Prescription Queue */
            <div className="flex-1 overflow-y-auto">
              {demoPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="border-b border-[var(--pos-border)] hover:bg-white/[0.02] transition-colors"
                >
                  <button
                    onClick={() => setSelectedRx(selectedRx === rx.id ? null : rx.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      rx.status === 'pending' && 'bg-amber-400',
                      rx.status === 'partial' && 'bg-blue-400',
                      rx.status === 'ready' && 'bg-emerald-400',
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--pos-text)]">{rx.rxNumber}</span>
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
                          rx.status === 'pending' && 'bg-amber-500/15 text-amber-400',
                          rx.status === 'partial' && 'bg-blue-500/15 text-blue-400',
                          rx.status === 'ready' && 'bg-emerald-500/15 text-emerald-400',
                        )}>
                          {rx.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{rx.patient} &middot; {rx.doctor}</p>
                    </div>
                    <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', selectedRx === rx.id && 'rotate-180')} />
                  </button>

                  {selectedRx === rx.id && (
                    <div className="px-4 pb-3 animate-fade-in" style={{ animationDuration: '0.15s' }}>
                      <div className="bg-white/[0.03] rounded-lg p-3 space-y-2">
                        {rx.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.name} x{item.qty}</span>
                            <span className="text-gray-500 text-xs">{item.dosage}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => loadPrescription(rx)}
                        className="mt-2 w-full py-2 rounded-lg bg-[var(--pos-accent)] text-white text-sm font-medium hover:bg-[var(--pos-accent)]/80 transition-colors"
                      >
                        Load into Cart
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============ RIGHT PANEL ============ */}
      <div className="w-[340px] shrink-0 flex flex-col p-4 space-y-4 overflow-y-auto">
        {/* Customer Badge */}
        {customer && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--pos-accent)]/10 border border-[var(--pos-accent)]/20">
            <User className="w-4 h-4 text-[var(--pos-accent)]" />
            <span className="text-sm text-[var(--pos-accent)] font-medium truncate">{customer}</span>
            <button onClick={() => setCustomer('')} className="ml-auto"><X className="w-3.5 h-3.5 text-gray-500" /></button>
          </div>
        )}

        {/* Payment Methods */}
        <div>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: 'cash' as const, label: 'Cash', icon: Banknote, color: 'emerald' },
              { key: 'easypaisa' as const, label: 'EasyPaisa', icon: Smartphone, color: 'green' },
              { key: 'credit' as const, label: 'Credit Card', icon: CreditCard, color: 'blue' },
              { key: 'cheque' as const, label: 'Cheque', icon: FileText, color: 'purple' },
            ]).map((method) => (
              <button
                key={method.key}
                onClick={() => setPaymentMethod(method.key)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200',
                  paymentMethod === method.key
                    ? 'bg-[var(--pos-accent)]/15 border-[var(--pos-accent)]/40 text-[var(--pos-accent)] shadow-[0_0_20px_rgba(13,148,136,0.1)]'
                    : 'bg-[var(--pos-card)] border-[var(--pos-border)] text-gray-400 hover:bg-white/5 hover:text-gray-200'
                )}
              >
                <method.icon className="w-4.5 h-4.5" />
                <span>{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Total Display */}
        <div className="pos-card rounded-xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-[var(--pos-accent)] tabular-nums">{formatRs(total)}</p>
          {cart.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{cart.reduce((s, i) => s + i.qty, 0)} items in cart</p>
          )}
        </div>

        {/* Pay Button */}
        <button
          onClick={openPayment}
          disabled={cart.length === 0}
          className={cn(
            'w-full py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center justify-center gap-2',
            cart.length > 0
              ? 'bg-[var(--pos-accent)] text-white hover:shadow-[0_4px_25px_rgba(13,148,136,0.4)] hover:-translate-y-0.5 active:scale-[0.98]'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          )}
        >
          <DollarSign className="w-5 h-5" />
          Complete Payment (F10)
        </button>

        {/* Quick Actions */}
        <div>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { label: 'Discount', shortcut: 'F2', icon: Percent, action: () => cart.length > 0 && setDiscountModal(true) },
              { label: 'Comment', shortcut: 'F3', icon: MessageSquare, action: () => setCommentModal(true) },
              { label: 'Customer', shortcut: 'F4', icon: User, action: () => setCustomerModal(true) },
              { label: 'Save Sale', shortcut: 'F9', icon: Save, action: () => { if (cart.length > 0) { toast.success('Sale saved as draft'); } } },
            ]).map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors text-sm"
              >
                <action.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{action.label}</span>
                <kbd className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-500 font-mono">{action.shortcut}</kbd>
              </button>
            ))}
          </div>
        </div>

        {/* Clear Cart */}
        {cart.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm(`Clear all ${cart.length} item(s) from the cart? This cannot be undone.`)) {
                clearCart();
              }
            }}
            className="w-full py-2.5 rounded-lg border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            Clear Cart (Ctrl+Del)
          </button>
        )}

        {/* Keyboard Hints */}
        <div className="mt-auto pt-4 border-t border-[var(--pos-border)]">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Keyboard Shortcuts</p>
          <div className="space-y-1 text-[11px] text-gray-500">
            {[
              ['F1', 'Search products'],
              ['F2', 'Apply discount'],
              ['F3', 'Add comment'],
              ['F4', 'Set customer'],
              ['F10', 'Complete payment'],
              ['Esc', 'Close / Cancel'],
              ['Ctrl+Del', 'Clear cart'],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center gap-2">
                <kbd className="inline-block px-1.5 py-0.5 bg-white/5 rounded font-mono text-gray-500 min-w-[52px] text-center">{key}</kbd>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ PAYMENT MODAL ============ */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setPaymentModal(false); }}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[var(--pos-card)] border border-[var(--pos-border)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in" style={{ animationDuration: '0.2s' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--pos-border)]">
              <h2 className="text-lg font-bold text-[var(--pos-text)]">Complete Payment</h2>
              <button onClick={() => setPaymentModal(false)} className="p-1.5 rounded-lg hover:bg-white/5"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Total */}
              <div className="text-center py-3 bg-white/[0.03] rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Amount Due</p>
                <p className="text-4xl font-bold text-[var(--pos-accent)] mt-1 tabular-nums">{formatRs(total)}</p>
              </div>

              {/* Payment Method */}
              <div className="flex gap-2">
                {(['cash', 'easypaisa', 'credit', 'cheque'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-semibold uppercase transition-all',
                      paymentMethod === m
                        ? 'bg-[var(--pos-accent)] text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    )}
                  >
                    {m === 'easypaisa' ? 'EP' : m === 'credit' ? 'Card' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>

              {/* Amount Received */}
              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Amount Received</label>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder={total.toFixed(0)}
                    className="w-full h-14 px-4 rounded-xl bg-[var(--pos-card)] border border-[var(--pos-border)] text-2xl font-bold text-[var(--pos-text)] text-center tabular-nums focus:outline-none focus:border-[var(--pos-accent)] placeholder:text-gray-500"
                    autoFocus
                  />
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-2">
                    {[Math.ceil(total), Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4).map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setAmountReceived(amount.toString())}
                        className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 hover:bg-white/10 transition-colors tabular-nums"
                      >
                        {amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Change */}
              {paymentMethod === 'cash' && (
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-sm text-emerald-400">Change</span>
                  <span className="text-xl font-bold text-emerald-400 tabular-nums">{formatRs(change)}</span>
                </div>
              )}
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={completeSale}
                disabled={paymentMethod === 'cash' && received < total}
                className={cn(
                  'w-full py-4 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2',
                  paymentMethod === 'cash' && received < total
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-[var(--pos-accent)] text-white hover:shadow-[0_4px_25px_rgba(13,148,136,0.4)]'
                )}
              >
                <CheckCircle className="w-5 h-5" />
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ SALE COMPLETED MODAL ============ */}
      {completedModal && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[var(--pos-card)] border border-[var(--pos-border)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in" style={{ animationDuration: '0.2s' }}>
            <div className="text-center pt-8 pb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-[var(--pos-text)]">Sale Complete!</h2>
              <p className="text-sm text-gray-500 mt-1">{receiptData.saleNumber}</p>
              <p className="text-3xl font-bold text-[var(--pos-accent)] mt-3 tabular-nums">{formatRs(receiptData.total)}</p>
              {receiptData.change > 0 && (
                <p className="text-sm text-emerald-400 mt-1">Change: {formatRs(receiptData.change)}</p>
              )}
            </div>
            <div className="px-5 pb-5 space-y-2">
              <button
                onClick={printReceipt}
                className="w-full py-3 rounded-xl bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={finishSale}
                className="w-full py-3 rounded-xl bg-[var(--pos-accent)] text-white text-sm font-bold hover:shadow-[0_4px_25px_rgba(13,148,136,0.4)] transition-all"
              >
                New Sale
              </button>
            </div>
            {/* Hidden receipt for printing */}
            <div className="hidden">
              <Receipt ref={receiptRef} data={receiptData} />
            </div>
          </div>
        </div>
      )}

      {/* ============ DISCOUNT MODAL ============ */}
      {discountModal && (
        <ModalOverlay onClose={() => setDiscountModal(false)} title="Apply Discount">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Sale Discount (Rs.)</label>
              <input
                type="number"
                value={saleDiscount}
                onChange={(e) => setSaleDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-12 px-4 rounded-xl bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-lg font-semibold text-center focus:outline-none focus:border-[var(--pos-accent)]"
                autoFocus
              />
            </div>
            <div className="border-t border-[var(--pos-border)] pt-3">
              <p className="text-xs text-gray-500 mb-2">Per-Item Discounts</p>
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 py-2">
                  <span className="flex-1 text-sm text-gray-300 truncate">{item.product.name}</span>
                  <input
                    type="number"
                    value={item.discount}
                    onChange={(e) => setItemDiscount(item.product.id, Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-24 h-8 px-2 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm text-center focus:outline-none focus:border-[var(--pos-accent)]"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setDiscountModal(false)}
              className="w-full py-2.5 rounded-xl bg-[var(--pos-accent)] text-white text-sm font-medium"
            >
              Apply
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* ============ COMMENT MODAL ============ */}
      {commentModal && (
        <ModalOverlay onClose={() => setCommentModal(false)} title="Sale Comment">
          <textarea
            value={saleComment}
            onChange={(e) => setSaleComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm focus:outline-none focus:border-[var(--pos-accent)] resize-none"
            placeholder="Add a comment for this sale..."
            autoFocus
          />
          <button
            onClick={() => setCommentModal(false)}
            className="w-full py-2.5 rounded-xl bg-[var(--pos-accent)] text-white text-sm font-medium mt-3"
          >
            Save
          </button>
        </ModalOverlay>
      )}

      {/* ============ CUSTOMER MODAL ============ */}
      {customerModal && (
        <ModalOverlay onClose={() => setCustomerModal(false)} title="Set Customer">
          <input
            type="text"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm focus:outline-none focus:border-[var(--pos-accent)]"
            placeholder="Customer name or MR number..."
            autoFocus
          />
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-500 mb-1.5">Recent Customers</p>
            {['Ahmed Raza (MR-10234)', 'Fatima Bibi (MR-10235)', 'Usman Tariq (MR-10236)'].map((c) => (
              <button
                key={c}
                onClick={() => { setCustomer(c.split(' (')[0]); setCustomerModal(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors text-left"
              >
                <User className="w-3.5 h-3.5 text-gray-500" />
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCustomerModal(false)}
            className="w-full py-2.5 rounded-xl bg-[var(--pos-accent)] text-white text-sm font-medium mt-3"
          >
            Set Customer
          </button>
        </ModalOverlay>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable Modal Overlay                                             */
/* ------------------------------------------------------------------ */

function ModalOverlay({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-[var(--pos-card)] border border-[var(--pos-border)] rounded-2xl shadow-2xl p-5 animate-fade-in" style={{ animationDuration: '0.2s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[var(--pos-text)]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
