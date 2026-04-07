import { useState, useMemo } from 'react';
import {
  Search, Plus, RefreshCw, Download, X, Edit2, ToggleLeft, ToggleRight, Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductGroupTree, defaultProductGroups } from './ProductGroupTree';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Product {
  id: string;
  code: string;
  name: string;
  genericName: string;
  group: string;
  groupId: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  unit: string;
  active: boolean;
  reorderLevel: number;
  barcode?: string;
  manufacturer?: string;
  expiryDate?: string;
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const demoProducts: Product[] = [
  { id: '1', code: 'TAB-001', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', group: 'Cardiovascular', groupId: 'cardio', costPrice: 7.80, salePrice: 12.50, stock: 450, unit: 'Tab', active: true, reorderLevel: 50, manufacturer: 'Getz Pharma', expiryDate: '2027-06-15' },
  { id: '2', code: 'TAB-002', name: 'Metformin 500mg', genericName: 'Metformin HCl', group: 'Anti-Diabetic', groupId: 'antidiabetic', costPrice: 4.50, salePrice: 8.00, stock: 800, unit: 'Tab', active: true, reorderLevel: 100, manufacturer: 'Sami Pharma', expiryDate: '2027-09-30' },
  { id: '3', code: 'TAB-003', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', group: 'Antibiotics', groupId: 'antibiotics', costPrice: 9.20, salePrice: 15.00, stock: 320, unit: 'Cap', active: true, reorderLevel: 50, manufacturer: 'GSK Pakistan', expiryDate: '2025-12-31' },
  { id: '4', code: 'TAB-004', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', group: 'Analgesics', groupId: 'analgesics', costPrice: 1.80, salePrice: 3.50, stock: 1500, unit: 'Tab', active: true, reorderLevel: 200, manufacturer: 'AGP Limited', expiryDate: '2028-03-31' },
  { id: '5', code: 'TAB-005', name: 'Omeprazole 20mg', genericName: 'Omeprazole', group: 'GI / Antacids', groupId: 'gi', costPrice: 5.60, salePrice: 10.00, stock: 600, unit: 'Cap', active: true, reorderLevel: 80, manufacturer: 'Hilton Pharma', expiryDate: '2027-12-31' },
  { id: '6', code: 'TAB-006', name: 'Atorvastatin 20mg', genericName: 'Atorvastatin Calcium', group: 'Cardiovascular', groupId: 'cardio', costPrice: 11.00, salePrice: 18.00, stock: 280, unit: 'Tab', active: true, reorderLevel: 50, manufacturer: 'Sami Pharma', expiryDate: '2026-02-28' },
  { id: '7', code: 'SYR-001', name: 'Calpol Syrup 120ml', genericName: 'Paracetamol', group: 'Pediatric', groupId: 'pediatric-syrups', costPrice: 55.00, salePrice: 85.00, stock: 95, unit: 'Btl', active: true, reorderLevel: 20, manufacturer: 'GSK Pakistan', expiryDate: '2026-04-25' },
  { id: '8', code: 'TAB-007', name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin HCl', group: 'Antibiotics', groupId: 'antibiotics', costPrice: 6.80, salePrice: 12.00, stock: 400, unit: 'Tab', active: true, reorderLevel: 50, manufacturer: 'Highnoon Labs' },
  { id: '9', code: 'INJ-001', name: 'Normal Saline 1000ml', genericName: 'Sodium Chloride 0.9%', group: 'IV Fluids', groupId: 'iv-fluids', costPrice: 75.00, salePrice: 120.00, stock: 200, unit: 'Bag', active: true, reorderLevel: 30, manufacturer: 'Otsuka Pakistan' },
  { id: '10', code: 'TAB-008', name: 'Losartan 50mg', genericName: 'Losartan Potassium', group: 'Cardiovascular', groupId: 'cardio', costPrice: 8.50, salePrice: 14.00, stock: 350, unit: 'Tab', active: true, reorderLevel: 50, manufacturer: 'Getz Pharma' },
  { id: '11', code: 'CRM-001', name: 'Betnovate Cream 20g', genericName: 'Betamethasone', group: 'Topical', groupId: 'creams', costPrice: 62.00, salePrice: 95.00, stock: 80, unit: 'Tube', active: true, reorderLevel: 15, manufacturer: 'GSK Pakistan' },
  { id: '12', code: 'DRP-001', name: 'Ciprofloxacin Eye Drops', genericName: 'Ciprofloxacin 0.3%', group: 'Eye / Ear Drops', groupId: 'drops', costPrice: 38.00, salePrice: 65.00, stock: 120, unit: 'Btl', active: true, reorderLevel: 20, manufacturer: 'Remington Pharma' },
  { id: '13', code: 'TAB-009', name: 'Diclofenac 50mg', genericName: 'Diclofenac Sodium', group: 'Analgesics', groupId: 'analgesics', costPrice: 2.80, salePrice: 5.00, stock: 900, unit: 'Tab', active: true, reorderLevel: 100, manufacturer: 'Searle Pakistan' },
  { id: '14', code: 'SYR-002', name: 'Ambroxol Syrup 100ml', genericName: 'Ambroxol HCl', group: 'Respiratory', groupId: 'respiratory', costPrice: 45.00, salePrice: 75.00, stock: 110, unit: 'Btl', active: true, reorderLevel: 20, manufacturer: 'Martin Dow' },
  { id: '15', code: 'TAB-010', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', group: 'OTC / General', groupId: 'otc', costPrice: 2.00, salePrice: 4.00, stock: 700, unit: 'Tab', active: true, reorderLevel: 100, manufacturer: 'Pharmevo' },
  { id: '16', code: 'INJ-002', name: 'Ceftriaxone 1g Inj', genericName: 'Ceftriaxone Sodium', group: 'Injectables', groupId: 'injections', costPrice: 120.00, salePrice: 180.00, stock: 75, unit: 'Vial', active: true, reorderLevel: 20, manufacturer: 'Getz Pharma' },
  { id: '17', code: 'TAB-011', name: 'Metoprolol 50mg', genericName: 'Metoprolol Tartrate', group: 'Cardiovascular', groupId: 'cardio', costPrice: 5.00, salePrice: 9.00, stock: 420, unit: 'Tab', active: true, reorderLevel: 50, manufacturer: 'Highnoon Labs' },
  { id: '18', code: 'TAB-012', name: 'Gabapentin 300mg', genericName: 'Gabapentin', group: 'Neurological', groupId: 'neuro', costPrice: 10.00, salePrice: 16.00, stock: 260, unit: 'Cap', active: true, reorderLevel: 30, manufacturer: 'Martin Dow' },
  { id: '19', code: 'BND-001', name: 'Crepe Bandage 6inch', genericName: 'N/A', group: 'Surgical', groupId: 'bandages', costPrice: 28.00, salePrice: 45.00, stock: 150, unit: 'Pc', active: true, reorderLevel: 25, manufacturer: 'Local' },
  { id: '20', code: 'TAB-013', name: 'Montelukast 10mg', genericName: 'Montelukast Sodium', group: 'Respiratory', groupId: 'respiratory', costPrice: 14.00, salePrice: 22.00, stock: 310, unit: 'Tab', active: true, reorderLevel: 40, manufacturer: 'Sami Pharma' },
  { id: '21', code: 'TAB-014', name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', group: 'Cardiovascular', groupId: 'cardio', costPrice: 1.50, salePrice: 3.00, stock: 1200, unit: 'Tab', active: true, reorderLevel: 200, manufacturer: 'Searle Pakistan' },
  { id: '22', code: 'TAB-015', name: 'Azithromycin 500mg', genericName: 'Azithromycin', group: 'Antibiotics', groupId: 'antibiotics', costPrice: 25.00, salePrice: 40.00, stock: 180, unit: 'Tab', active: true, reorderLevel: 30, manufacturer: 'Getz Pharma' },
  { id: '23', code: 'TAB-016', name: 'Levofloxacin 500mg', genericName: 'Levofloxacin', group: 'Antibiotics', groupId: 'antibiotics', costPrice: 18.00, salePrice: 28.00, stock: 250, unit: 'Tab', active: true, reorderLevel: 40, manufacturer: 'Highnoon Labs' },
  { id: '24', code: 'SYR-003', name: 'Ventolin Syrup 100ml', genericName: 'Salbutamol', group: 'Respiratory', groupId: 'respiratory', costPrice: 42.00, salePrice: 70.00, stock: 85, unit: 'Btl', active: true, reorderLevel: 15, manufacturer: 'GSK Pakistan' },
  { id: '25', code: 'TAB-017', name: 'Ranitidine 150mg', genericName: 'Ranitidine HCl', group: 'GI / Antacids', groupId: 'gi', costPrice: 3.50, salePrice: 6.00, stock: 0, unit: 'Tab', active: false, reorderLevel: 100, manufacturer: 'Pharmevo' },
  { id: '26', code: 'INJ-003', name: 'Insulin Glargine 100IU', genericName: 'Insulin Glargine', group: 'Injectables', groupId: 'injections', costPrice: 850.00, salePrice: 1200.00, stock: 25, unit: 'Pen', active: true, reorderLevel: 10, manufacturer: 'Sanofi' },
  { id: '27', code: 'TAB-018', name: 'Clopidogrel 75mg', genericName: 'Clopidogrel', group: 'Cardiovascular', groupId: 'cardio', costPrice: 12.00, salePrice: 20.00, stock: 380, unit: 'Tab', active: true, reorderLevel: 50, manufacturer: 'Sami Pharma' },
  { id: '28', code: 'CRM-002', name: 'Fucidin Cream 15g', genericName: 'Fusidic Acid', group: 'Topical', groupId: 'creams', costPrice: 120.00, salePrice: 185.00, stock: 60, unit: 'Tube', active: true, reorderLevel: 10, manufacturer: 'Abbott' },
  { id: '29', code: 'TAB-019', name: 'Pregabalin 75mg', genericName: 'Pregabalin', group: 'Neurological', groupId: 'neuro', costPrice: 8.00, salePrice: 14.00, stock: 290, unit: 'Cap', active: true, reorderLevel: 40, manufacturer: 'Hilton Pharma' },
  { id: '30', code: 'INJ-004', name: 'D/W 5% 1000ml', genericName: 'Dextrose 5%', group: 'IV Fluids', groupId: 'iv-fluids', costPrice: 65.00, salePrice: 110.00, stock: 180, unit: 'Bag', active: true, reorderLevel: 30, manufacturer: 'Otsuka Pakistan' },
  { id: '31', code: 'TAB-020', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', group: 'GI / Antacids', groupId: 'gi', costPrice: 8.00, salePrice: 14.00, stock: 520, unit: 'Tab', active: true, reorderLevel: 80, manufacturer: 'Highnoon Labs' },
  { id: '32', code: 'DRP-002', name: 'Timolol Eye Drops 5ml', genericName: 'Timolol Maleate 0.5%', group: 'Eye / Ear Drops', groupId: 'drops', costPrice: 55.00, salePrice: 90.00, stock: 45, unit: 'Btl', active: true, reorderLevel: 10, manufacturer: 'Remington Pharma' },
  { id: '33', code: 'SUT-001', name: 'Silk Suture 3-0', genericName: 'N/A', group: 'Surgical', groupId: 'sutures', costPrice: 35.00, salePrice: 55.00, stock: 200, unit: 'Pc', active: true, reorderLevel: 50, manufacturer: 'Steripack' },
  { id: '34', code: 'TAB-021', name: 'Glimepiride 2mg', genericName: 'Glimepiride', group: 'Anti-Diabetic', groupId: 'antidiabetic', costPrice: 6.00, salePrice: 10.00, stock: 340, unit: 'Tab', active: true, reorderLevel: 50, manufacturer: 'Sami Pharma' },
  { id: '35', code: 'TAB-022', name: 'Tramadol 50mg', genericName: 'Tramadol HCl', group: 'Analgesics', groupId: 'analgesics', costPrice: 4.00, salePrice: 7.50, stock: 400, unit: 'Tab', active: true, reorderLevel: 50, manufacturer: 'Searle Pakistan' },
  { id: '36', code: 'SYR-004', name: 'Flagyl Susp 120ml', genericName: 'Metronidazole', group: 'Pediatric', groupId: 'pediatric-syrups', costPrice: 48.00, salePrice: 78.00, stock: 70, unit: 'Btl', active: true, reorderLevel: 15, manufacturer: 'Sanofi' },
  { id: '37', code: 'TAB-023', name: 'Doxycycline 100mg', genericName: 'Doxycycline', group: 'Antibiotics', groupId: 'antibiotics', costPrice: 5.50, salePrice: 9.00, stock: 500, unit: 'Cap', active: true, reorderLevel: 60, manufacturer: 'Pharmevo' },
  { id: '38', code: 'INJ-005', name: 'Ketorolac 30mg Inj', genericName: 'Ketorolac Tromethamine', group: 'Injectables', groupId: 'injections', costPrice: 45.00, salePrice: 70.00, stock: 90, unit: 'Amp', active: true, reorderLevel: 15, manufacturer: 'AGP Limited' },
  { id: '39', code: 'TAB-024', name: 'Sitagliptin 50mg', genericName: 'Sitagliptin', group: 'Anti-Diabetic', groupId: 'antidiabetic', costPrice: 22.00, salePrice: 35.00, stock: 160, unit: 'Tab', active: true, reorderLevel: 25, manufacturer: 'MSD' },
  { id: '40', code: 'TAB-025', name: 'Bisoprolol 5mg', genericName: 'Bisoprolol Fumarate', group: 'Cardiovascular', groupId: 'cardio', costPrice: 7.00, salePrice: 12.00, stock: 360, unit: 'Tab', active: true, reorderLevel: 50, manufacturer: 'Martin Dow' },
  { id: '41', code: 'CRM-003', name: 'Dermovate Cream 25g', genericName: 'Clobetasol Propionate', group: 'Topical', groupId: 'creams', costPrice: 95.00, salePrice: 150.00, stock: 40, unit: 'Tube', active: true, reorderLevel: 8, manufacturer: 'GSK Pakistan' },
  { id: '42', code: 'TAB-026', name: 'Rosuvastatin 10mg', genericName: 'Rosuvastatin Calcium', group: 'Cardiovascular', groupId: 'cardio', costPrice: 13.00, salePrice: 22.00, stock: 270, unit: 'Tab', active: true, reorderLevel: 40, manufacturer: 'Getz Pharma' },
  { id: '43', code: 'SYR-005', name: 'Augmentin Susp 90ml', genericName: 'Amoxicillin + Clavulanate', group: 'Pediatric', groupId: 'pediatric-syrups', costPrice: 180.00, salePrice: 280.00, stock: 55, unit: 'Btl', active: true, reorderLevel: 10, manufacturer: 'GSK Pakistan' },
  { id: '44', code: 'TAB-027', name: 'Alprazolam 0.5mg', genericName: 'Alprazolam', group: 'Neurological', groupId: 'neuro', costPrice: 3.00, salePrice: 5.50, stock: 350, unit: 'Tab', active: true, reorderLevel: 40, manufacturer: 'Hilton Pharma' },
  { id: '45', code: 'INJ-006', name: 'Ringer Lactate 1000ml', genericName: "Ringer's Lactate", group: 'IV Fluids', groupId: 'iv-fluids', costPrice: 70.00, salePrice: 115.00, stock: 150, unit: 'Bag', active: true, reorderLevel: 25, manufacturer: 'Otsuka Pakistan' },
  { id: '46', code: 'TAB-028', name: 'Esomeprazole 40mg', genericName: 'Esomeprazole Magnesium', group: 'GI / Antacids', groupId: 'gi', costPrice: 10.00, salePrice: 18.00, stock: 440, unit: 'Cap', active: true, reorderLevel: 60, manufacturer: 'Getz Pharma' },
  { id: '47', code: 'DRP-003', name: 'Tobramycin Eye Drops', genericName: 'Tobramycin 0.3%', group: 'Eye / Ear Drops', groupId: 'drops', costPrice: 48.00, salePrice: 80.00, stock: 65, unit: 'Btl', active: true, reorderLevel: 12, manufacturer: 'Remington Pharma' },
  { id: '48', code: 'BND-002', name: 'Gauze Roll 6inch', genericName: 'N/A', group: 'Surgical', groupId: 'bandages', costPrice: 15.00, salePrice: 25.00, stock: 300, unit: 'Pc', active: true, reorderLevel: 50, manufacturer: 'Local' },
  { id: '49', code: 'TAB-029', name: 'Domperidone 10mg', genericName: 'Domperidone', group: 'GI / Antacids', groupId: 'gi', costPrice: 2.50, salePrice: 4.50, stock: 650, unit: 'Tab', active: true, reorderLevel: 80, manufacturer: 'Searle Pakistan' },
  { id: '50', code: 'INJ-007', name: 'Enoxaparin 40mg', genericName: 'Enoxaparin Sodium', group: 'Injectables', groupId: 'injections', costPrice: 350.00, salePrice: 500.00, stock: 30, unit: 'Syringe', active: true, reorderLevel: 8, manufacturer: 'Sanofi' },
  { id: '51', code: 'TAB-030', name: 'Warfarin 5mg', genericName: 'Warfarin Sodium', group: 'Cardiovascular', groupId: 'cardio', costPrice: 5.00, salePrice: 8.00, stock: 240, unit: 'Tab', active: true, reorderLevel: 30, manufacturer: 'AGP Limited' },
  { id: '52', code: 'SYR-006', name: 'Brufen Syrup 120ml', genericName: 'Ibuprofen', group: 'Pediatric', groupId: 'pediatric-syrups', costPrice: 50.00, salePrice: 82.00, stock: 90, unit: 'Btl', active: true, reorderLevel: 18, manufacturer: 'Abbott' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [products, setProducts] = useState(demoProducts);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedGroup) {
      result = result.filter((p) => p.groupId === selectedGroup);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.genericName.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, selectedGroup, searchTerm]);

  const toggleActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Group Tree */}
      <aside className="w-60 shrink-0 border-r border-[var(--pos-border)] flex flex-col">
        <div className="px-4 py-3 border-b border-[var(--pos-border)]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Groups</h3>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <ProductGroupTree
            groups={defaultProductGroups}
            selectedId={selectedGroup}
            onSelect={setSelectedGroup}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--pos-border)]">
          <h2 className="text-lg font-bold text-[var(--pos-text)]">Products</h2>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full tabular-nums">{filteredProducts.length} items</span>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm placeholder:text-gray-500 focus:outline-none focus:border-[var(--pos-accent)]"
            />
          </div>

          <button className="p-2 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors" title="Export">
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--pos-accent)] text-white text-sm font-medium hover:shadow-[0_2px_15px_rgba(13,148,136,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            New Product
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#0d1527] border-b border-[var(--pos-border)]">
                {['Code', 'Product Name', 'Generic Name', 'Group', 'Cost', 'Sale Price', 'Stock', 'Unit', 'Expiry', 'Active', ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={cn(
                    'border-b border-[var(--pos-border)] hover:bg-white/[0.02] transition-colors',
                    !product.active && 'opacity-50'
                  )}
                >
                  <td className="px-4 py-2.5 text-sm text-gray-400 font-mono">{product.code}</td>
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-medium text-[var(--pos-text)]">{product.name}</p>
                    {product.manufacturer && <p className="text-xs text-gray-600">{product.manufacturer}</p>}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-400">{product.genericName}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-xs text-gray-400">{product.group}</span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-400 tabular-nums text-right">{product.costPrice.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-sm text-[var(--pos-text)] font-semibold tabular-nums text-right">{product.salePrice.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-sm tabular-nums text-right">
                    <span className={cn(
                      'font-semibold',
                      product.stock === 0 && 'text-red-400',
                      product.stock > 0 && product.stock <= product.reorderLevel && 'text-amber-400',
                      product.stock > product.reorderLevel && 'text-emerald-400',
                    )}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">{product.unit}</td>
                  <td className="px-4 py-2.5">
                    {product.expiryDate ? (() => {
                      const today = new Date('2026-04-07');
                      const exp = new Date(product.expiryDate);
                      const days = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      const fmt = exp.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
                      if (days <= 0) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">EXPIRED</span>;
                      if (days <= 30) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">{fmt}</span>;
                      if (days <= 60) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400">{fmt}</span>;
                      return <span className="text-xs text-gray-500">{fmt}</span>;
                    })() : <span className="text-xs text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => toggleActive(product.id)} className="text-gray-400 hover:text-[var(--pos-accent)] transition-colors">
                      {product.active ? (
                        <ToggleRight className="w-6 h-6 text-[var(--pos-accent)]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => setEditProduct(product)}
                      className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <Package className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ NEW/EDIT PRODUCT MODAL ============ */}
      {(showNewModal || editProduct) && (
        <ProductFormModal
          product={editProduct}
          onClose={() => { setShowNewModal(false); setEditProduct(null); }}
          onSave={(p) => {
            if (editProduct) {
              setProducts((prev) => prev.map((item) => (item.id === editProduct.id ? { ...item, ...p } : item)));
            } else {
              setProducts((prev) => [...prev, { ...p, id: `new-${Date.now()}` } as Product]);
            }
            setShowNewModal(false);
            setEditProduct(null);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Form Modal                                                 */
/* ------------------------------------------------------------------ */

function ProductFormModal({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}) {
  const [form, setForm] = useState({
    code: product?.code || '',
    name: product?.name || '',
    genericName: product?.genericName || '',
    group: product?.group || '',
    groupId: product?.groupId || '',
    costPrice: product?.costPrice?.toString() || '',
    salePrice: product?.salePrice?.toString() || '',
    stock: product?.stock?.toString() || '0',
    unit: product?.unit || 'Tab',
    reorderLevel: product?.reorderLevel?.toString() || '50',
    manufacturer: product?.manufacturer || '',
    barcode: product?.barcode || '',
    active: product?.active ?? true,
  });

  const handleSubmit = () => {
    onSave({
      code: form.code,
      name: form.name,
      genericName: form.genericName,
      group: form.group,
      groupId: form.groupId,
      costPrice: parseFloat(form.costPrice) || 0,
      salePrice: parseFloat(form.salePrice) || 0,
      stock: parseInt(form.stock) || 0,
      unit: form.unit,
      reorderLevel: parseInt(form.reorderLevel) || 50,
      manufacturer: form.manufacturer,
      barcode: form.barcode,
      active: form.active,
    });
  };

  const inputClass = 'w-full h-10 px-3 rounded-lg bg-[var(--pos-card)] border border-[var(--pos-border)] text-[var(--pos-text)] text-sm focus:outline-none focus:border-[var(--pos-accent)] transition-colors';
  const labelClass = 'block text-xs text-gray-500 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-[#141c2e] border border-[var(--pos-border)] rounded-2xl shadow-2xl animate-fade-in overflow-hidden" style={{ animationDuration: '0.2s' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--pos-border)]">
          <h2 className="text-lg font-bold text-[var(--pos-text)]">{product ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Product Code *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className={inputClass} placeholder="TAB-001" />
            </div>
            <div>
              <label className={labelClass}>Barcode</label>
              <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className={inputClass} placeholder="Optional" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Product Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Amlodipine 5mg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Generic Name</label>
              <input value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} className={inputClass} placeholder="Amlodipine Besylate" />
            </div>
            <div>
              <label className={labelClass}>Manufacturer</label>
              <input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} className={inputClass} placeholder="Getz Pharma" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Group</label>
              <select
                value={form.groupId}
                onChange={(e) => setForm({ ...form, groupId: e.target.value, group: e.target.options[e.target.selectedIndex].text })}
                className={inputClass}
              >
                <option value="">Select...</option>
                <option value="cardio">Cardiovascular</option>
                <option value="antibiotics">Antibiotics</option>
                <option value="analgesics">Analgesics / Pain</option>
                <option value="antidiabetic">Anti-Diabetic</option>
                <option value="gi">GI / Antacids</option>
                <option value="respiratory">Respiratory</option>
                <option value="neuro">Neurological</option>
                <option value="iv-fluids">IV Fluids</option>
                <option value="injections">General Injections</option>
                <option value="pediatric-syrups">Pediatric Syrups</option>
                <option value="creams">Creams & Ointments</option>
                <option value="drops">Eye / Ear Drops</option>
                <option value="bandages">Bandages</option>
                <option value="sutures">Sutures</option>
                <option value="otc">OTC / General</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputClass}>
                {['Tab', 'Cap', 'Btl', 'Bag', 'Vial', 'Amp', 'Tube', 'Pc', 'Syringe', 'Pen'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Reorder Level</label>
              <input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Cost Price (Rs.)</label>
              <input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sale Price (Rs.)</label>
              <input type="number" step="0.01" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Opening Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--pos-border)]">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-5 py-2 rounded-lg bg-[var(--pos-accent)] text-white text-sm font-medium hover:shadow-[0_2px_15px_rgba(13,148,136,0.3)] transition-all">
            {product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
