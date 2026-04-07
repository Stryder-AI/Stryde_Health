# Stryde Health — Hospital Information System (HIS)

## Master Plan Document

**Version:** 1.1
**Date:** March 29, 2026
**Author:** TechGIS / Stryde Health Division
**Status:** Foundation Build — Phase 1 (Decisions Finalized)

---

## 1. Vision & Overview

Stryde Health is a modern, full-stack Hospital Information System (HIS) designed to digitize and streamline the complete patient journey — from reception to consultation, lab diagnostics, prescription, and pharmacy dispensing. The system connects every department through a unified patient record, ensuring zero data loss across the care chain.

**Phase 1 (Current Scope):** Fully functional foundation with real database persistence, role-based portals, and a complete pharmacy ePOS. AI modules will use synthetic/demo data as placeholders for future integration with Stryder AI.

**Core Philosophy:**
- Every interaction is saved to a central patient record — visits, vitals, prescriptions, lab results, payments
- Every portal is purpose-built for its user — minimal clicks, maximum clarity
- The system feels like a premium product — not a hospital legacy system from 2005

**Branding:** Stryde Health is the product brand. All portals carry Stryde Health branding — this is not white-labeled for a specific hospital.

**Scope:** Single-branch hospital deployment. No multi-branch schema complexity in Phase 1.

---

## 1.1 Confirmed Design Decisions

These decisions were finalized during planning and are **non-negotiable** for Phase 1:

| Decision | Answer | Impact |
|---|---|---|
| **Deployment** | Cloud server (VPS/AWS/DO) with option for on-premises deployment | Dockerized architecture required — app must be portable between cloud and on-prem |
| **Billing Model** | Consultation fee collected at reception upfront. Lab tests and pharmacy medicines paid at reception BEFORE the service/product is provided. | Reception needs a billing/cashier module. Lab and Pharmacy must check payment status before processing. Payment receipts generated per service. |
| **Pharmacy ↔ Prescriptions** | Auto-populate cart from Rx queue, BUT pharmacist can substitute medicines when stock is unavailable | Rx queue shows prescribed items. Pharmacist can swap individual line items with substitutes, with a reason field. Original Rx + actual dispensed items both saved. |
| **Token Numbering** | Resets daily, globally across the whole hospital | Single daily counter. Token #1 is first patient of the day regardless of department. |
| **Lab Report Verification** | Technician finalizes directly — no pathologist verification gate | Simpler workflow. Tech enters results → submits → report is immediately available to doctor/patient record. |
| **Pharmacy Stock (Phase 1)** | Manual stock adjustments only | No supplier management, no purchase orders. Stock in/out via manual adjustment with reason codes (Purchase, Return, Damaged, Expired, Adjustment). PO system deferred to Phase 2. |
| **Multi-Branch** | Single branch only | No `branch_id` foreign keys. No branch selector. Clean, simple schema. |
| **Product Branding** | Stryde Health (own brand) | Stryde Health logo, favicon, and branding across all portals. Not configurable per hospital in Phase 1. |

---

## 1.2 Billing Flow (Detailed)

This is a critical workflow that touches Reception, Lab, and Pharmacy.

```
PATIENT JOURNEY WITH PAYMENTS
═══════════════════════════════

Step 1: ARRIVAL & REGISTRATION
  Patient → Reception
  ├── Register (if new) or Find (if returning)
  ├── Create appointment → Assign doctor
  ├── 💰 COLLECT CONSULTATION FEE
  │   └── Generate receipt (Invoice item: "Consultation — Dr. Tariq Ahmed — Rs. 1,500")
  ├── Token issued
  └── Patient proceeds to waiting area

Step 2: CONSULTATION
  Patient → Doctor (OPD)
  ├── Doctor examines, records notes, vitals, diagnosis
  ├── Writes prescription (medicines)
  ├── Orders lab tests (CBC, Lipid Profile, etc.)
  └── Marks consultation complete

Step 3A: LAB TESTS (if ordered)
  Patient → Reception (payment desk)
  ├── 💰 COLLECT LAB TEST FEES
  │   └── Generate receipt (Invoice items: "CBC — Rs. 800", "Lipid Profile — Rs. 1,200")
  ├── Payment status updated on lab order → "Paid"
  └── Patient proceeds to lab

  Patient → Lab
  ├── Lab tech sees order (only processes PAID orders)
  ├── Collects sample → enters results
  ├── Finalizes report → available in patient record
  └── Doctor can view results

Step 3B: PHARMACY (if medicines prescribed)
  Patient → Reception (payment desk)
  ├── 💰 COLLECT MEDICINE FEES
  │   └── Generate receipt (Invoice items per medicine)
  ├── Payment receipt/token issued
  └── Patient proceeds to pharmacy counter

  Patient → Pharmacy
  ├── Pharmacist sees Rx in queue (only processes PAID prescriptions)
  ├── Auto-populates cart from Rx
  ├── If medicine unavailable → substitute with reason
  │   ├── Original: "Amlodipine 5mg (Norvasc)" 
  │   ├── Substitute: "Amlodipine 5mg (Amlong)"
  │   └── Reason: "Original brand out of stock"
  ├── Dispenses medicines
  ├── Stock auto-decremented
  └── Dispensing record saved (original Rx + actual dispensed)
```

**Key Implications for the System:**

1. **Reception gets a Billing/Cashier module** — not just registration. They collect payments for consultations, lab tests, and medicines.
2. **Lab orders have a `payment_status` field** — Lab portal only shows "Ready to Process" for paid orders. Unpaid orders show as "Awaiting Payment."
3. **Prescriptions have a `payment_status` field** — Pharmacy queue only shows paid prescriptions as actionable.
4. **Every payment generates an invoice/receipt** — linked to patient, visit, and the specific service.
5. **Reception dashboard needs a billing summary** — total collections today, pending payments, breakdown by type (consultation / lab / pharmacy).

---

## 1.3 Pharmacy Substitution Logic (Detailed)

When a prescription auto-populates the pharmacy cart:

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESCRIPTION → CART AUTO-POPULATE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Prescribed Item         Stock    Status         Action          │
│  ──────────────────────  ──────   ──────────     ──────────     │
│  Amlodipine 5mg          45       ✅ In Stock    [Added ✓]     │
│  (Norvasc)                                                      │
│                                                                 │
│  Metformin 500mg          0       ❌ Out of      [Substitute]  │
│  (Glucophage)                        Stock                      │
│                                                                 │
│  Atorvastatin 20mg       12       ⚠️ Low Stock   [Added ✓]     │
│  (Lipitor)                          (< reorder)                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

SUBSTITUTE FLOW (when pharmacist clicks [Substitute]):
┌─────────────────────────────────────────────────────────────────┐
│  SUBSTITUTE MEDICINE                                             │
│                                                                 │
│  Original: Metformin 500mg (Glucophage) — Prescribed by Dr. X  │
│                                                                 │
│  Search substitute: [metformin___________] 🔍                   │
│                                                                 │
│  Available matches:                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ○ Metformin 500mg (Daonil)      Rs. 280   Stock: 120      │ │
│  │ ○ Metformin 500mg (Glucomet)    Rs. 310   Stock: 45       │ │
│  │ ○ Metformin 500mg (Generic)     Rs. 150   Stock: 200      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Reason for substitution:                                       │
│  [Original brand out of stock_________________] ▼               │
│  (Dropdown: Out of stock, Patient preference,                   │
│   Price concern, Doctor approved alternative)                   │
│                                                                 │
│                    [ Cancel ]  [ Confirm Substitute ]            │
└─────────────────────────────────────────────────────────────────┘
```

**Data Saved:**
- `dispensed_items` table tracks: `prescribed_medicine`, `dispensed_medicine`, `is_substitute` (boolean), `substitution_reason`
- Doctor can later review what was actually dispensed vs. what was prescribed

---

## 2. Design Language & Visual Identity

### 2.1 Design Inspiration

The primary design inspiration is the **CoachPro dashboard** (Image 1 reference) — a glassmorphic, card-based UI with soft gradients, generous white space, and a calm teal/mint color palette. This is the north star for all portal designs.

### 2.2 Design System Tokens

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#0D9488` (Teal 600) | Primary actions, active nav, key metrics |
| `--primary-light` | `#CCFBF1` (Teal 50) | Card backgrounds, subtle highlights |
| `--primary-dark` | `#134E4A` (Teal 900) | Headers, dark text on light surfaces |
| `--accent` | `#D4A017` (Gold) | Badges, priority indicators, premium touches |
| `--surface` | `#F0FDFA` | Main content background |
| `--surface-glass` | `rgba(255, 255, 255, 0.6)` | Glassmorphic card surfaces |
| `--surface-card` | `rgba(255, 255, 255, 0.75)` | Elevated card surfaces |
| `--danger` | `#EF4444` | Destructive actions, critical alerts |
| `--warning` | `#F59E0B` | Warnings, pending states |
| `--success` | `#10B981` | Success states, completed items |
| `--text-primary` | `#0F172A` | Primary text |
| `--text-secondary` | `#64748B` | Secondary/muted text |
| `--radius-sm` | `8px` | Small elements (buttons, inputs) |
| `--radius-md` | `14px` | Cards, modals |
| `--radius-lg` | `20px` | Large containers, nav panels |

### 2.3 Visual Principles

1. **Glassmorphism:** Cards use frosted glass effect with `backdrop-filter: blur(16px)` and semi-transparent white backgrounds. Subtle borders with `rgba(255, 255, 255, 0.3)`.
2. **Soft Gradients:** Background uses a gentle gradient mesh (teal → lavender → soft pink) similar to CoachPro's backdrop. Not flat white, not hard gradients.
3. **Card-Based Layout:** Every data group lives in its own rounded card with soft shadows (`box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06)`). No hard borders between sections.
4. **Typography:** Inter or Plus Jakarta Sans. Large bold headings (28–32px), clean body text (14–15px), generous line height (1.6).
5. **Iconography:** Lucide React icons — consistent stroke width, 20–24px standard size.
6. **Spacing:** 24px grid gap between cards. 16px internal padding minimum. Content breathes.
7. **Animations:** Subtle fade-in on page transitions. Hover lift on cards (`translateY(-2px)`). No jarring animations.
8. **Status Indicators:** Rounded pills with soft background colors — not harsh badges.
9. **Data Tables:** Alternating row tints with soft teal highlight on hover. Rounded corners on table containers.
10. **Navigation:** Vertical sidebar with icon + label, active state uses filled teal background with white text (like CoachPro's "Dashboard" active state).

### 2.4 Pharmacy ePOS Design (Dark Theme Variant)

The Pharmacy ePOS module uses a **dark theme** as seen in reference images 2–5 (Aronium POS system). This is intentional — POS interfaces work better in dark mode for retail/pharmacy environments where screens run all day.

| Token | Value |
|---|---|
| `--pos-bg` | `#1A1A2E` |
| `--pos-surface` | `#16213E` |
| `--pos-card` | `#1E293B` |
| `--pos-text` | `#E2E8F0` |
| `--pos-accent` | `#0D9488` (shared teal) |
| `--pos-danger` | `#EF4444` |
| `--pos-success` | `#10B981` |

---

## 3. System Architecture

### 3.1 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18 + TypeScript | Component-based, type-safe, massive ecosystem |
| **Styling** | Tailwind CSS + custom design tokens | Rapid prototyping with the glassmorphic system |
| **State** | Zustand | Lightweight, no boilerplate, great for role-based state |
| **Routing** | React Router v6 | Role-based route protection, nested layouts |
| **Backend** | Node.js + Express | Fast API layer, easy real-time integration later |
| **Database** | PostgreSQL | Relational, ACID-compliant — critical for medical records |
| **ORM** | Prisma | Type-safe queries, migration management, great DX |
| **Auth** | JWT + bcrypt | Role-based tokens, session management |
| **Real-time** | Socket.io (future) | Live queue updates, appointment notifications |
| **PDF Generation** | React-PDF / Puppeteer | Lab report templates, prescriptions, receipts |
| **Containerization** | Docker + Docker Compose | Portable deployment — cloud or on-premises |
| **Reverse Proxy** | Nginx | SSL termination, static file serving, load balancing |

### 3.2 Database Schema (Core Tables)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CORE ENTITIES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  users                    patients                              │
│  ├── id (UUID, PK)        ├── id (UUID, PK)                    │
│  ├── email                ├── mr_number (auto-increment)        │
│  ├── password_hash        ├── first_name                        │
│  ├── full_name            ├── last_name                         │
│  ├── role (ENUM)          ├── phone                             │
│  ├── department           ├── cnic                              │
│  ├── specialization       ├── date_of_birth                     │
│  ├── is_active            ├── gender (ENUM)                     │
│  ├── avatar_url           ├── blood_group                       │
│  ├── created_at           ├── address                           │
│  └── updated_at           ├── emergency_contact_name            │
│                           ├── emergency_contact_phone           │
│  ROLES:                   ├── ailments (JSONB)                  │
│  - super_admin            │   → cardiac, diabetic,              │
│  - receptionist           │     hypertensive, asthmatic,        │
│  - doctor                 │     thyroid, hepatitis,             │
│  - lab_technician         │     other (text field)              │
│  - pharmacist             ├── allergies (text)                  │
│                           ├── registered_by (FK → users)        │
│                           ├── created_at                        │
│                           └── updated_at                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     APPOINTMENTS & VISITS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  appointments                      visits                       │
│  ├── id (UUID, PK)                 ├── id (UUID, PK)            │
│  ├── patient_id (FK)               ├── patient_id (FK)          │
│  ├── doctor_id (FK → users)        ├── appointment_id (FK)      │
│  ├── date                          ├── doctor_id (FK)            │
│  ├── time_slot                     ├── visit_date               │
│  ├── type (ENUM)                   ├── chief_complaint          │
│  │   → walk_in, scheduled         ├── diagnosis                │
│  ├── status (ENUM)                 ├── notes (text)             │
│  │   → waiting, in_progress,      ├── vitals (JSONB)           │
│  │     completed, cancelled,      │   → bp, pulse, temp,       │
│  │     no_show                     │     weight, spo2           │
│  ├── token_number (daily auto)     ├── status (ENUM)            │
│  ├── department                    │   → in_progress,           │
│  ├── priority (ENUM)              │     completed, referred     │
│  │   → normal, urgent, emergency  ├── created_at               │
│  ├── created_at                    └── updated_at               │
│  └── updated_at                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      PRESCRIPTIONS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  prescriptions                     prescription_items            │
│  ├── id (UUID, PK)                 ├── id (UUID, PK)            │
│  ├── visit_id (FK)                 ├── prescription_id (FK)     │
│  ├── patient_id (FK)               ├── medicine_name            │
│  ├── doctor_id (FK)                ├── dosage                   │
│  ├── date                          ├── frequency                │
│  ├── notes                         │   → e.g. "1+0+1",         │
│  ├── payment_status (ENUM)        │     "BD", "TDS", "OD"     │
│  │   → unpaid, paid               ├── duration                 │
│  ├── status (ENUM)                 ├── route (ENUM)             │
│  │   → active, dispensed,          │   → oral, iv, im, topical  │
│  │     partially_dispensed         ├── instructions             │
│  ├── created_at                    └── quantity                  │
│  └── updated_at                                                  │
│                                                                 │
│  dispensed_items (tracks actual medicines given incl. subs)      │
│  ├── id (UUID, PK)                                              │
│  ├── prescription_id (FK)                                       │
│  ├── prescription_item_id (FK)                                  │
│  ├── prescribed_medicine (text)                                 │
│  ├── dispensed_medicine (text)                                  │
│  ├── dispensed_product_id (FK → products)                       │
│  ├── is_substitute (boolean, default false)                     │
│  ├── substitution_reason (text, nullable)                       │
│  ├── quantity_dispensed                                          │
│  ├── dispensed_by (FK → users)                                  │
│  └── created_at                                                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                        LAB MODULE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  lab_orders                        lab_tests                     │
│  ├── id (UUID, PK)                 ├── id (UUID, PK)            │
│  ├── visit_id (FK)                 ├── lab_order_id (FK)        │
│  ├── patient_id (FK)               ├── test_template_id (FK)   │
│  ├── doctor_id (FK)                ├── status (ENUM)            │
│  ├── payment_status (ENUM)        │   → pending, in_progress,  │
│  │   → unpaid, paid               │     completed               │
│  ├── status (ENUM)                 ├── results (JSONB)          │
│  │   → pending, in_progress,      │   → array of                │
│  │     completed, partial          │     {parameter, value,     │
│  ├── priority (ENUM)              │      unit, ref_range,      │
│  ├── notes                         │      flag}                  │
│  ├── created_at                    ├── performed_by (FK)         │
│  └── updated_at                    ├── completed_at              │
│                                    └── created_at                │
│                                                                 │
│  test_templates                    test_template_params          │
│  ├── id (UUID, PK)                 ├── id (UUID, PK)            │
│  ├── name                          ├── template_id (FK)         │
│  │   → "CBC", "LFTs", "RFTs",    ├── parameter_name           │
│  │     "CRP", "Urine RE",        ├── unit                     │
│  │     "Lipid Profile",          ├── ref_range_male            │
│  │     "Thyroid Profile",        ├── ref_range_female          │
│  │     "HbA1c", "Serology",      ├── ref_range_child           │
│  │     "Coagulation Profile"      ├── sort_order               │
│  ├── category                      └── is_calculated            │
│  ├── department                                                  │
│  ├── sample_type                                                │
│  │   → blood, urine, serum,                                    │
│  │     plasma, stool, swab                                      │
│  ├── turnaround_hours                                           │
│  ├── price                                                      │
│  └── is_active                                                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                   PHARMACY / ePOS MODULE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  product_groups                    products                      │
│  ├── id (UUID, PK)                 ├── id (UUID, PK)            │
│  ├── name                          ├── name                     │
│  │   → Tablets, Capsules,         ├── generic_name              │
│  │     Syrups, Injections,        ├── group_id (FK)             │
│  │     Creams, Drops,             ├── barcode                   │
│  │     Surgical, OTC              ├── code (SKU)                │
│  ├── parent_id (FK, self)         ├── cost_price               │
│  ├── sort_order                    ├── sale_price               │
│  └── is_active                     ├── tax_rate                 │
│                                    ├── quantity_on_hand          │
│  sales                             ├── reorder_level            │
│  ├── id (UUID, PK)                 ├── unit (ENUM)              │
│  ├── sale_number (auto)           │   → piece, strip, bottle,  │
│  ├── patient_id (FK, nullable)    │     box, tube, pack         │
│  ├── prescription_id (FK, null)   ├── manufacturer              │
│  ├── cashier_id (FK → users)      ├── expiry_date              │
│  ├── subtotal                      ├── batch_number             │
│  ├── tax_total                     ├── is_active                │
│  ├── discount_amount               ├── created_at               │
│  ├── discount_type (ENUM)         └── updated_at               │
│  │   → percentage, fixed                                        │
│  ├── total                         sale_items                    │
│  ├── payment_method (ENUM)        ├── id (UUID, PK)             │
│  │   → cash, easypaisa,          ├── sale_id (FK)              │
│  │     credit, check              ├── product_id (FK)           │
│  ├── amount_received               ├── quantity                  │
│  ├── change_given                  ├── unit_price               │
│  ├── status (ENUM)                ├── discount                  │
│  │   → completed, refunded,      ├── tax                       │
│  │     voided, saved              ├── line_total                │
│  ├── notes                         └── created_at               │
│  ├── created_at                                                  │
│  └── updated_at                    stock_movements               │
│                                    ├── id (UUID, PK)            │
│  (purchase_orders — PHASE 2)      ├── product_id (FK)          │
│  (supplier management — PHASE 2)  ├── type (ENUM)               │
│                                   │   → purchase, sale,         │
│                                   │     adjustment, return,     │
│                                   │     expired, damaged         │
│                                   ├── quantity                   │
│                                   ├── reference_id              │
│                                   ├── notes                     │
│                                   ├── performed_by (FK)         │
│                                   └── created_at                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                       BILLING                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  invoices                          invoice_items                 │
│  ├── id (UUID, PK)                 ├── id (UUID, PK)            │
│  ├── invoice_number (auto)        ├── invoice_id (FK)           │
│  ├── patient_id (FK)              ├── item_type (ENUM)          │
│  ├── visit_id (FK)                │   → consultation,           │
│  ├── subtotal                     │     lab_test, medicine,     │
│  ├── tax                          │     procedure               │
│  ├── discount                     ├── description               │
│  ├── total                        ├── quantity                   │
│  ├── paid_amount                  ├── unit_price                │
│  ├── payment_status (ENUM)       ├── total                     │
│  │   → paid, partial, unpaid     └── reference_id              │
│  ├── payment_method                                              │
│  ├── created_at                                                  │
│  └── updated_at                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 API Architecture

All APIs follow RESTful conventions with JWT auth middleware.

**Base URL:** `/api/v1`

```
AUTH
  POST   /auth/login                    → Login, receive JWT + role
  POST   /auth/logout                   → Invalidate session
  GET    /auth/me                       → Current user profile

PATIENTS
  POST   /patients                      → Register new patient
  GET    /patients                      → List/search patients
  GET    /patients/:id                  → Full patient record
  PUT    /patients/:id                  → Update patient info
  GET    /patients/:id/history          → Complete visit history
  GET    /patients/:id/lab-results      → All lab results
  GET    /patients/:id/prescriptions    → All prescriptions

APPOINTMENTS
  POST   /appointments                  → Create appointment (walk-in or scheduled)
  GET    /appointments                  → List by date/doctor/status
  GET    /appointments/today            → Today's queue
  PUT    /appointments/:id              → Update status
  GET    /appointments/doctor/:id       → Doctor's appointments
  POST   /appointments/:id/token       → Generate token number

VISITS
  POST   /visits                        → Start a visit (doctor clicks patient)
  PUT    /visits/:id                    → Update visit (diagnosis, notes, vitals)
  PUT    /visits/:id/complete           → Complete visit

PRESCRIPTIONS
  POST   /prescriptions                 → Create prescription
  GET    /prescriptions/:id             → Get prescription
  PUT    /prescriptions/:id/dispense    → Mark as dispensed (pharmacy)
  GET    /prescriptions/pending         → Pending prescriptions (pharmacy queue)

LAB
  POST   /lab/orders                    → Create lab order
  GET    /lab/orders                    → List lab orders by status
  GET    /lab/orders/:id                → Get order with test details
  PUT    /lab/tests/:id/results         → Enter test results
  PUT    /lab/tests/:id/verify          → Verify/approve results
  GET    /lab/templates                 → List all test templates
  GET    /lab/templates/:id             → Get template with parameters

PHARMACY / POS
  GET    /pharmacy/products             → List products (with search, filter, group)
  POST   /pharmacy/products             → Add product
  PUT    /pharmacy/products/:id         → Edit product
  DELETE /pharmacy/products/:id         → Deactivate product
  GET    /pharmacy/products/groups      → Product group tree
  POST   /pharmacy/products/groups      → Create group
  GET    /pharmacy/stock                → Stock levels (with filters)
  POST   /pharmacy/stock/adjust         → Manual stock adjustment
  POST   /pharmacy/sales                → Complete a sale
  GET    /pharmacy/sales                → Sales history
  GET    /pharmacy/sales/:id            → Sale details + receipt
  POST   /pharmacy/sales/:id/refund    → Process refund
  POST   /pharmacy/sales/:id/void      → Void a sale
  GET    /pharmacy/reports/daily        → Daily sales summary
  GET    /pharmacy/reports/monthly      → Monthly sales data
  GET    /pharmacy/reports/top-products → Top selling products

DASHBOARD / REPORTS
  GET    /dashboard/super-admin         → System-wide metrics
  GET    /dashboard/doctor/:id          → Doctor-specific metrics
  GET    /dashboard/reception           → Today's queue stats
  GET    /reports/revenue               → Revenue breakdown
  GET    /reports/patient-volume        → Patient volume trends
```

---

## 4. Portal Specifications

### 4.1 Super Admin Portal

**Access:** Full visibility into all modules. This is the command center.

**Layout:** Sidebar navigation (CoachPro style) + main content area.

**Sidebar Navigation Items:**
1. Dashboard (home/overview)
2. User Management
3. Patient Registry
4. Appointments
5. Doctors
6. Lab Management
7. Pharmacy (full ePOS access)
8. Billing & Invoices
9. Reports & Analytics
10. Settings

**Dashboard View — Cards:**

| Card | Content |
|---|---|
| **Today's Snapshot** | Total patients today, appointments completed vs remaining, revenue today |
| **Department Pulse** | Mini cards per department — OPD count, Lab orders, Pharmacy sales |
| **Appointment Queue** | Live list of today's appointments with status pills (Waiting / In Progress / Completed) |
| **Revenue Overview** | Weekly/monthly chart (bar or area chart, teal gradient) |
| **Recent Activity Feed** | Scrollable timeline — "Patient #1042 registered", "Dr. Ahmed completed consult", "Lab CBC report ready" |
| **System Alerts** | Low stock pharmacy items, pending lab results, unverified reports |

**User Management Page:**
- CRUD for all system users (doctors, receptionists, lab techs, pharmacists)
- Role assignment via dropdown
- Department/specialization fields for doctors
- Active/inactive toggle
- Password reset capability

**Reports Page:**
- Date range picker (preset: today, this week, this month, custom)
- Revenue by department (pie/donut chart)
- Patient volume trends (line chart)
- Top doctors by consultations
- Top lab tests ordered
- Pharmacy sales breakdown
- Export to PDF / Excel

---

### 4.2 Receptionist Portal

**Access:** Patient registration, appointment management, daily schedule, AND billing/payment collection.

**Primary Workflow:**
1. Patient walks in → Receptionist searches if existing patient → If not, registers new patient
2. Registration creates a patient record in the database
3. Appointment is auto-created with status "Waiting" and a token number
4. Receptionist collects consultation fee → generates receipt
5. Receptionist assigns doctor based on patient preference or ailment
6. Appointment appears on the doctor's portal queue
7. After consultation, patient returns to reception to pay for labs/medicines before proceeding

**Sidebar Navigation:**
1. Dashboard
2. Register Patient
3. Patient Search
4. Today's Appointments
5. Schedule / Calendar
6. Billing / Cashier
7. Payment History

**Register Patient Form:**

```
┌─────────────────────────────────────────────────────────────────┐
│  REGISTER NEW PATIENT                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Personal Information ──────────────────────────────────┐  │
│  │                                                            │  │
│  │  First Name*          Last Name*          Gender*          │  │
│  │  [____________]       [____________]      [Dropdown ▼]    │  │
│  │                                                            │  │
│  │  Date of Birth        CNIC                Blood Group     │  │
│  │  [Date Picker]        [_____________]     [Dropdown ▼]    │  │
│  │                                                            │  │
│  │  Phone Number*        Address                              │  │
│  │  [____________]       [________________________]           │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─── Emergency Contact ─────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Contact Name          Contact Phone                       │  │
│  │  [____________]        [____________]                      │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─── Medical History (Checkboxes) ──────────────────────────┐  │
│  │                                                            │  │
│  │  ☐ Cardiac       ☐ Diabetic       ☐ Hypertensive         │  │
│  │  ☐ Asthmatic     ☐ Thyroid        ☐ Hepatitis            │  │
│  │  ☐ Renal Disease ☐ Epilepsy       ☐ TB                   │  │
│  │  ☐ HIV/AIDS      ☐ Cancer         ☐ Pregnant             │  │
│  │  ☐ Other: [_________________________]                     │  │
│  │                                                            │  │
│  │  Known Allergies:                                          │  │
│  │  [_______________________________________________]         │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─── Appointment Details ───────────────────────────────────┐  │
│  │                                                            │  │
│  │  Department*           Doctor*            Priority         │  │
│  │  [Dropdown ▼]         [Dropdown ▼]       [Normal ▼]       │  │
│  │  (auto-filters         (filtered by                        │  │
│  │   doctors)             department)                         │  │
│  │                                                            │  │
│  │  Appointment Type:  ○ Walk-in  ○ Scheduled                │  │
│  │  If Scheduled:      [Date Picker] [Time Slot Picker]      │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│                    [ Register & Create Appointment ]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**On Submit:**
1. Patient record created → gets auto-generated MR Number (e.g., `MR-2026-00001`)
2. Appointment record created → gets daily token number (e.g., Token #14)
3. Visit record created with status `waiting`
4. Appointment appears in the doctor's queue
5. Success toast notification with MR Number and Token Number
6. Option to print token slip (small receipt-style)

**Today's Appointments View:**
- Table/list with columns: Token #, Patient Name, MR#, Doctor, Department, Status, Time, Actions
- Status pills: `Waiting` (amber), `In Progress` (blue), `Completed` (green), `Cancelled` (red)
- Search by patient name or MR#
- Filter by doctor, department, status
- Click patient name → opens patient profile sidebar

**Schedule / Calendar View:**
- Full calendar view (day/week/month)
- Appointments shown as blocks color-coded by department
- Click on time slot → quick appointment creation modal
- Drag and drop to reschedule (future enhancement)
- Doctor availability indicators

**Billing / Cashier Page:**

This is the receptionist's payment collection interface. After a doctor completes a consultation and orders labs or writes a prescription, the patient returns here to pay before proceeding.

```
┌─────────────────────────────────────────────────────────────────┐
│  BILLING / CASHIER                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔍 Search Patient: [MR# or Name____________] 🔍               │
│                                                                 │
│  ┌─── Patient: Ahmad Khan (MR-2026-00234) ───────────────────┐ │
│  │  Today's Visit: Dr. Tariq Ahmed — Cardiology               │ │
│  │  Token: #12  |  Status: Consultation Complete               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  PENDING PAYMENTS                                               │
│  ──────────────                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ☐  Consultation Fee — Dr. Tariq Ahmed     Rs. 1,500  PAID │ │
│  │ ☐  Lab: CBC                               Rs.   800  DUE  │ │
│  │ ☐  Lab: Lipid Profile                     Rs. 1,200  DUE  │ │
│  │ ☐  Rx: Amlodipine 5mg × 30               Rs.   450  DUE  │ │
│  │ ☐  Rx: Metformin 500mg × 30              Rs.   280  DUE  │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  Selected Total:                          Rs. 2,730        │ │
│  │  Payment Method: [Cash ▼]                                  │ │
│  │  Amount Received: [________]                               │ │
│  │  Change: Rs. 0                                             │ │
│  │                                                            │ │
│  │                    [ Collect Payment & Print Receipt ]      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

- Receptionist can collect payment for individual items or batch-select
- Once lab tests are paid → `lab_orders.payment_status = 'paid'` → appears in Lab queue
- Once medicines are paid → `prescriptions.payment_status = 'paid'` → appears in Pharmacy queue
- Receipt auto-generated with line items, total, payment method
- Payment history searchable by date, patient, payment method

---

### 4.3 Doctor Portal

**Access:** Own appointments, OPD consultations, prescription writing, lab order creation.

**Sidebar Navigation:**
1. Dashboard
2. OPD Queue (Today's Patients)
3. My Appointments
4. Patient Records (search)
5. Prescriptions
6. Lab Results
7. Schedule

**Dashboard — Metric Cards:**

| Card | Metric |
|---|---|
| **Patients Today** | Total assigned, with progress ring showing completed % |
| **In Waiting** | Count of patients in queue with "Next Patient" button |
| **Completed** | Count of seen patients today |
| **Cancelled / No-show** | Today's cancellations |
| **Upcoming** | Next 3 appointments with time + patient name |
| **Weekly Summary** | Bar chart — patients per day this week |

**OPD Queue View:**

This is the doctor's primary working screen.

```
┌─────────────────────────────────────────────────────────────────┐
│  OPD QUEUE — Dr. Tariq Ahmed, Cardiologist                     │
│  Thursday, March 29, 2026                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── WAITING (5) ───────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  #12  Ahmad Khan          MR-2026-00234  ⚡ Urgent        │  │
│  │       Cardiac, Diabetic   Arrived: 9:15 AM                │  │
│  │                                          [ Start Consult ] │  │
│  │                                                            │  │
│  │  #13  Fatima Bibi         MR-2026-00189                   │  │
│  │       Hypertensive        Arrived: 9:30 AM                │  │
│  │                                          [ Start Consult ] │  │
│  │  ...                                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─── IN PROGRESS (1) ──────────────────────────────────────┐  │
│  │                                                            │  │
│  │  #11  Usman Ali           MR-2026-00412                   │  │
│  │       Cardiac             Started: 9:45 AM                │  │
│  │                           Duration: 12 min                │  │
│  │                           [ Continue Consult ]            │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─── COMPLETED (8) ────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  #1   Ali Raza            Seen at 8:05 AM   [View Notes]  │  │
│  │  #2   Saima Noor          Seen at 8:18 AM   [View Notes]  │  │
│  │  ...                                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Consultation View (when doctor clicks "Start Consult"):**

This opens a full-screen consultation workspace. Multi-panel layout:

```
┌─────────────────────────────────────────────────────────────────────┐
│  CONSULTATION — Ahmad Khan (MR-2026-00234) Token #12               │
├────────────────────────┬────────────────────────────────────────────┤
│                        │                                            │
│  PATIENT SUMMARY       │  CONSULTATION NOTES                        │
│  ────────────────      │  ─────────────────                         │
│  Age: 45, Male         │                                            │
│  Blood: B+             │  Chief Complaint:                          │
│  Phone: 0300-1234567   │  [_______________________________________] │
│                        │                                            │
│  CONDITIONS:           │  History of Present Illness:               │
│  🔴 Cardiac            │  [________________________________________│
│  🟡 Diabetic           │  _________________________________________│
│                        │  ________________________________________] │
│  ALLERGIES:            │                                            │
│  Penicillin            │  Examination Findings:                     │
│                        │  [________________________________________│
│  VITALS (today):       │  ________________________________________] │
│  BP: [___/___]         │                                            │
│  Pulse: [____]         │  Diagnosis:                                │
│  Temp: [____]°F        │  [_______________________________________] │
│  SpO2: [____]%         │                                            │
│  Weight: [____] kg     │  Plan:                                     │
│                        │  [________________________________________│
│  LAST VISIT:           │  ________________________________________] │
│  March 15, 2026        │                                            │
│  Dr. Tariq — Follow-up │                                            │
│  Diagnosis: Angina     │                                            │
│                        │                                            │
├────────────────────────┼────────────────────────────────────────────┤
│                        │                                            │
│  PRESCRIPTION          │  LAB ORDERS                                │
│  ────────────          │  ──────────                                │
│                        │                                            │
│  + Add Medicine        │  + Order Lab Test                          │
│                        │                                            │
│  ┌──────────────────┐  │  ☑ CBC                                    │
│  │ Amlodipine 5mg   │  │  ☑ Lipid Profile                         │
│  │ 1+0+1 × 30 days  │  │  ☐ LFTs                                  │
│  │ Oral, After meal  │  │  ☐ RFTs                                  │
│  │         [✕ Remove]│  │  ☐ CRP                                   │
│  └──────────────────┘  │  ☐ HbA1c                                  │
│                        │  ☐ Urine RE                                │
│  ┌──────────────────┐  │  ☐ Thyroid Profile                        │
│  │ Metformin 500mg  │  │  ☐ Serology                               │
│  │ 1+0+1 × 30 days  │  │  ☐ Coagulation Profile                   │
│  │ Oral, After meal  │  │  ☐ ECG                                   │
│  │         [✕ Remove]│  │  ☐ Other: [___________]                  │
│  └──────────────────┘  │                                            │
│                        │  Priority: ○ Normal ○ Urgent               │
│  [ Save Prescription ] │  Notes: [_____________________]            │
│                        │                                            │
│                        │  [ Order Tests ]                            │
│                        │                                            │
├────────────────────────┴────────────────────────────────────────────┤
│                                                                     │
│  [ Save & Stay ]    [ Complete & Next Patient ]    [ Refer Patient ] │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**On "Complete & Next Patient":**
1. Visit record saved with all notes, vitals, diagnosis
2. Prescription record created (linked to visit + patient)
3. Lab order created (linked to visit + patient)
4. Appointment status → `completed`
5. Prescription pushed to Pharmacy queue (if medicines prescribed)
6. Lab order pushed to Lab queue (if tests ordered)
7. Next waiting patient auto-loaded

**Prescription Output:**
- Doctor can print prescription on A5/half-page format
- Header: Hospital name, doctor name, specialization, contact
- Patient info: Name, MR#, Age, Date
- Rx table: Medicine, Dosage, Frequency, Duration, Route, Instructions
- Footer: Doctor's signature placeholder, "Follow-up in X days"

---

### 4.4 Lab Technician Portal

**Access:** Lab orders queue, result entry, report generation.

**Sidebar Navigation:**
1. Dashboard
2. Pending Orders
3. In Progress
4. Completed Reports
5. Test Templates
6. Patient Search

**Dashboard — Metric Cards:**

| Card | Metric |
|---|---|
| **Pending** | Orders waiting to be processed |
| **In Progress** | Currently being worked on |
| **Completed Today** | Reports finalized today |
| **Urgent Orders** | High-priority flagged orders |
| **Average TAT** | Average turnaround time today |

**Pending Orders Queue:**

```
┌─────────────────────────────────────────────────────────────────┐
│  LAB ORDERS — Pending                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚡ URGENT                                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Ahmad Khan (MR-2026-00234)  •  Dr. Tariq Ahmed            │ │
│  │ Ordered: 10:05 AM                                          │ │
│  │ Tests: CBC, Lipid Profile                                  │ │
│  │ Sample: Blood                                              │ │
│  │                                     [ Accept & Process ]   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  NORMAL                                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Fatima Bibi (MR-2026-00189)  •  Dr. Saira Khan            │ │
│  │ Ordered: 10:30 AM                                          │ │
│  │ Tests: Urine RE, RFTs                                      │ │
│  │ Sample: Urine, Blood                                       │ │
│  │                                     [ Accept & Process ]   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Result Entry View (when tech clicks "Accept & Process"):**

Each test type has its own parameter form based on the test template.

**Example — CBC Result Entry:**

```
┌─────────────────────────────────────────────────────────────────┐
│  CBC — Ahmad Khan (MR-2026-00234)                               │
│  Ordered by: Dr. Tariq Ahmed  |  Date: March 29, 2026           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Parameter              Value      Unit       Reference Range   │
│  ─────────────────────  ─────────  ─────────  ────────────────  │
│  Hemoglobin             [_____]    g/dL       13.0 – 17.0 (M)  │
│  RBC Count              [_____]    ×10¹²/L    4.5 – 5.5 (M)    │
│  WBC Count              [_____]    ×10⁹/L     4.0 – 11.0       │
│  Platelet Count         [_____]    ×10⁹/L     150 – 400        │
│  Hematocrit (HCT)       [_____]    %          40 – 54 (M)      │
│  MCV                    [_____]    fL         80 – 100          │
│  MCH                    [_____]    pg         27 – 33           │
│  MCHC                   [_____]    g/dL       31.5 – 34.5      │
│  ESR                    [_____]    mm/hr      0 – 15 (M)       │
│                                                                 │
│  DIFFERENTIAL COUNT                                             │
│  ─────────────────                                              │
│  Neutrophils            [_____]    %          40 – 75           │
│  Lymphocytes            [_____]    %          20 – 45           │
│  Monocytes              [_____]    %          2 – 10            │
│  Eosinophils            [_____]    %          1 – 6             │
│  Basophils              [_____]    %          0 – 1             │
│                                                                 │
│  Technician Notes:                                              │
│  [_______________________________________________]              │
│                                                                 │
│  [ Save Draft ]              [ Submit & Generate Report ]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Out-of-range values** auto-highlight in red with a ⚠ flag. The system compares entered values against the reference ranges stored in the test template.

**Pre-built Test Templates (Phase 1):**

1. **CBC** — Complete Blood Count (15 parameters)
2. **LFTs** — Liver Function Tests (Bilirubin Total/Direct, ALT, AST, ALP, Albumin, Total Protein, GGT)
3. **RFTs** — Renal Function Tests (Urea, Creatinine, Uric Acid, BUN, eGFR)
4. **Lipid Profile** — Total Cholesterol, HDL, LDL, Triglycerides, VLDL, TC/HDL Ratio
5. **CRP** — C-Reactive Protein (quantitative)
6. **Urine RE** — Routine Examination (Color, Appearance, pH, Specific Gravity, Protein, Glucose, Blood, WBC, RBC, Epithelial Cells, Casts, Crystals, Bacteria)
7. **HbA1c** — Glycated Hemoglobin
8. **Thyroid Profile** — TSH, T3, T4, FT3, FT4
9. **Serology** — HBsAg, Anti-HCV, HIV, VDRL
10. **Coagulation Profile** — PT, INR, APTT, Bleeding Time, Clotting Time
11. **Blood Sugar** — Fasting, Random, Post-Prandial
12. **Electrolytes** — Na, K, Cl, Ca, Mg, PO4

**Lab Report Generation:**

On submit, the system generates a formatted lab report (PDF-ready):
- Hospital letterhead
- Patient info block (Name, MR#, Age/Gender, Referring Doctor)
- Date & Time of collection and reporting
- Test results table with parameters, values, units, reference ranges
- Abnormal values marked with H (High) or L (Low) flags
- Technician name and digital signature
- Pathologist verification signature (if applicable)

---

### 4.5 Pharmacy ePOS Portal

**This is a full-featured Point of Sale system for pharmaceutical retail, modeled after the Aronium POS system shown in reference images 2–5.**

**Access:** Pharmacist (full access), Super Admin (full access).

**Design:** Dark theme (see Section 2.4). This is a standalone-feeling POS environment within the HIS.

**Sidebar / Top Navigation:**
1. POS (Point of Sale — main selling screen)
2. Products
3. Stock
4. Sales History
5. Reports / Dashboard
6. Settings

---

#### 4.5.1 POS Screen (Main Selling Interface)

Reference: Image 5 (Aronium POS view)

```
┌─────────────────────────────────────────────┬───────────────────────┐
│  🔍 Search products by name, code, barcode  │  F3 Search   F5 Qty  │
│  [_________________________________________]│                       │
├─────────────────────────────────────────────┤  F12 Cash              │
│                                             │  Easy Paisa            │
│  Name        Qty    Price    Amount          │  Credit                │
│  ──────────  ───    ─────    ──────          │  Check                 │
│                                             │                       │
│                                             ├───────────────────────┤
│                                             │                       │
│        (items appear here as added)         │  ┌─────┐  ┌─────────┐│
│                                             │  │ F2  │  │   F3    ││
│                                             │  │Disc.│  │ Comment ││
│                                             │  └─────┘  └─────────┘│
│                                             │  ┌─────┐  ┌─────────┐│
│                                             │  │ F4  │  │   F8    ││
│                                             │  │Cust.│  │ Customer││
│                                             │  └─────┘  └─────────┘│
│                                             │                       │
│                                             │  ┌──────────────────┐ │
│                                             │  │   F9 Save Sale   │ │
│                                             │  └──────────────────┘ │
│                                             │  ┌──────────────────┐ │
├─────────────────────────────────────────────┤  │  F10 Payment  💳  │ │
│  Subtotal:                         0.00     │  └──────────────────┘ │
│  Tax:                              0.00     │  ┌────┐ ┌────┐ ┌────┐│
│  ──────────────────────────────────────      │  │Lock│ │Xfer│ │Void││
│  Total:                            0.00     │  └────┘ └────┘ └────┘│
│                                             │                       │
└─────────────────────────────────────────────┴───────────────────────┘
```

**POS Features:**
- **Product Search:** Real-time search by name, generic name, barcode, or SKU code. Results appear as a dropdown with product name, current price, and stock quantity.
- **Barcode Scanning:** Input field accepts barcode scanner input (keyboard wedge). Auto-adds product to cart.
- **Cart Management:** Add/remove items, adjust quantity inline, apply per-item discount.
- **Payment Methods:** Cash (with amount received / change calculation), EasyPaisa, Credit, Check.
- **Discount:** Per-item or whole-sale discount. Percentage or fixed amount.
- **Customer/Patient Link:** Optional — link sale to a patient record (for prescription-linked sales). Search by MR# or name.
- **Prescription Queue:** Side panel or tab showing pending prescriptions from doctors. Click to auto-populate cart with prescribed medicines.
- **Save Sale:** Save current cart for later (e.g., patient will return).
- **Refund:** Process full or partial refund with reason. Returns stock.
- **Void:** Cancel entire sale (admin-only for completed sales).
- **Transfer:** Transfer saved sale to another cashier.
- **Lock Screen:** Lock POS with PIN (shift handover).
- **Receipt Generation:** Auto-print or preview receipt on sale completion. Receipt shows: hospital name, date/time, cashier, items, totals, payment method, change.
- **Keyboard Shortcuts:** F2 (Discount), F3 (Search), F4 (Customer), F5 (Quantity), F7 (Transfer), F9 (Save), F10 (Payment), F12 (Cash).

---

#### 4.5.2 Products Management

Reference: Image 2 (Aronium Products view)

**Layout:** Left sidebar = product group tree (collapsible, hierarchical). Main area = product table.

**Product Group Tree:**
```
▼ Products
  ├── Earthshine Series
  ├── Emulsions
  ├── Enamel
  ├── Enamels
  ├── Exterior Emulsions
  ├── ...
```

For Stryde Health, the pharmacy group tree would be:
```
▼ All Products
  ├── Tablets
  │   ├── Cardiovascular
  │   ├── Antibiotics
  │   ├── Analgesics
  │   ├── Antidiabetics
  │   └── ...
  ├── Capsules
  ├── Syrups & Suspensions
  ├── Injections
  ├── Creams & Ointments
  ├── Drops (Eye / Ear / Nasal)
  ├── Inhalers
  ├── Surgical & Dressings
  ├── OTC / General
  └── Medical Devices
```

**Products Table Columns:**
- Code (SKU)
- Name
- Generic Name
- Group
- Barcode
- Cost Price
- Sale Price
- Tax %
- Active (toggle)
- Stock Qty (live from stock table)
- Unit
- Created / Updated timestamps

**Toolbar Actions:**
- Refresh
- New Group / Edit Group / Delete Group
- New Product / Edit Product / Delete Product
- Print
- Save as PDF
- Price Tags (batch print)
- Sorting
- Moving Average Price
- Import (CSV/Excel)
- Export (CSV/Excel)

**New/Edit Product Form:**
- Product Name, Generic Name
- Group (dropdown from tree)
- Barcode (auto-generate or manual)
- Code/SKU
- Cost Price, Sale Price
- Tax Rate
- Unit (dropdown)
- Manufacturer
- Reorder Level
- Expiry Date
- Batch Number
- Active toggle
- Image upload (optional)

---

#### 4.5.3 Stock Management

Reference: Image 3 (Aronium Stock view)

**Layout:** Same left sidebar group tree. Main area = stock table.

**Stock Table Columns:**
- Code
- Product Name
- Quantity on Hand
- Unit
- Cost Price
- Cost (total cost of stock)
- Cost incl. Tax
- Value (sale value of stock)
- Value incl. Tax

**Toolbar:**
- Stock History (movement log)
- Print
- Save as PDF
- Excel Export
- Inventory Count Report
- Quick Inventory (manual count entry)

**Filters:**
- Negative Quantity (checkbox)
- Non-Zero Quantity (checkbox)
- Zero Quantity (checkbox)
- Filter by group
- Search by product name

**Stock Adjustment:**
- Select product → Enter adjustment quantity (+ or -)
- Reason dropdown: Purchase, Return, Damaged, Expired, Manual Adjustment
- Notes field
- Creates a `stock_movements` record

---

#### 4.5.4 Sales History

- Table: Sale #, Date/Time, Customer/Patient, Items Count, Total, Payment Method, Status, Cashier
- Click to expand → shows individual line items
- Filter by date range, payment method, cashier, status
- Refund/Void actions on individual sales

---

#### 4.5.5 Reports / Dashboard

Reference: Image 4 (Aronium Dashboard view)

```
┌─────────────────────────────────────────────────────────────────┐
│  Monthly Sales — 2026                             Total Sales   │
│  ┌─────────────────────────────────────────┐      72.56K       │
│  │                                         │                    │
│  │  [Bar chart - monthly sales]            │  Top performing    │
│  │  Each bar = one month                   │  month: MARCH      │
│  │  Highlighted bar = current/selected     │  72,559.25         │
│  │                                         │                    │
│  └─────────────────────────────────────────┘                    │
├─────────────────────────────────────────────────────────────────┤
│  Periodic Reports (date range picker)                           │
├─────────────────┬──────────────────┬────────────────────────────┤
│  Top Products   │  Hourly Sales    │  Total Sales (Amount)      │
│  ─────────────  │  ────────────    │  ─────────────────────     │
│  1. Panadol     │  [Bar chart]     │                            │
│     29,093.75   │  by hour of day  │  35.54K                    │
│  2. Augmentin   │                  │  (big number display)      │
│     5,168.00    │                  │                            │
│  3. Brufen      │                  │                            │
│     1,282.50    │                  │                            │
├─────────────────┼──────────────────┴────────────────────────────┤
│  Top Product    │  Top Customers                                │
│  Groups         │  ─────────────                                │
│  ────────────   │                                               │
│  [Donut chart]  │  [Horizontal bar chart]                       │
│  Tablets 65%    │  Walk-in: 35,644                              │
│  Syrups 20%     │  Patient #234: 12,500                         │
│  Capsules 15%   │  Patient #189: 8,200                          │
│                 │                                               │
└─────────────────┴───────────────────────────────────────────────┘
```

**Report Features:**
- Date range selector with presets (Today, This Week, This Month, Custom)
- Top 5/10/20 products by revenue
- Hourly sales distribution (bar chart)
- Sales by payment method (pie chart)
- Product group breakdown (donut chart)
- Top customers
- Profit margin report (cost vs. sale)
- Expiring stock alert list
- Low stock alert list
- Export all reports to PDF/Excel

---

## 5. Cross-Portal Data Flow

This section maps how data flows between portals — the heart of the HIS.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │     │              │
│  RECEPTION   │────▶│   DOCTOR     │────▶│     LAB      │     │   PHARMACY   │
│              │     │              │     │              │     │              │
│ • Register   │     │ • See queue  │     │ • Receive    │     │ • Receive    │
│   patient    │     │ • Consult    │     │   lab orders │     │   Rx orders  │
│ • Create     │     │ • Write Rx   │     │ • Enter      │     │ • Dispense   │
│   appointment│     │ • Order labs │     │   results    │     │   medicines  │
│ • Assign     │     │ • Complete   │     │ • Generate   │     │ • Record     │
│   doctor     │     │   visit      │     │   reports    │     │   sale       │
│              │     │              │     │              │     │              │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                        CENTRAL PATIENT RECORD                               │
│                                                                             │
│  Patient: Ahmad Khan (MR-2026-00234)                                        │
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Visit 1 │ │ Visit 2 │ │ Visit 3 │ │ Visit 4 │ │ Visit 5 │ ...          │
│  │ Jan 5   │ │ Feb 12  │ │ Mar 1   │ │ Mar 15  │ │ Mar 29  │              │
│  ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤              │
│  │ Dr. X   │ │ Dr. Y   │ │ Dr. X   │ │ Dr. X   │ │ Dr. X   │              │
│  │ Vitals  │ │ Vitals  │ │ Vitals  │ │ Vitals  │ │ Vitals  │              │
│  │ Notes   │ │ Notes   │ │ Notes   │ │ Notes   │ │ Notes   │              │
│  │ Rx: 3   │ │ Rx: 2   │ │ Rx: 4   │ │ Rx: 2   │ │ Rx: 3   │              │
│  │ Labs: 1 │ │ Labs: 0 │ │ Labs: 2 │ │ Labs: 1 │ │ Labs: 2 │              │
│  │ Bill: ✓ │ │ Bill: ✓ │ │ Bill: ✓ │ │ Bill: ✓ │ │ Bill: … │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Flow Step-by-Step:**

1. **Patient Arrives** → Receptionist registers (or finds existing patient) → Creates appointment → Assigns to doctor → Token issued
2. **Doctor Sees Patient** → Picks from OPD queue → Records vitals, complaint, examination, diagnosis → Writes prescription → Orders lab tests → Marks complete
3. **Lab Processes Tests** → Sees order in queue → Accepts → Enters results against template parameters → Flags abnormals → Generates report → Report linked to patient record
4. **Pharmacy Dispenses** → Sees prescription in queue OR patient walks up with Rx → Adds items to POS cart → Processes payment → Sale linked to patient record → Stock decremented
5. **Everything Saved** → Every visit, every prescription, every lab result, every pharmacy sale — all linked to the patient's MR number. Full audit trail.

---

## 6. Authentication & Role-Based Access

### 6.1 Login Screen

Minimal, elegant login page with the Stryde Health logo, gradient background, glassmorphic login card.

Fields: Email, Password, "Remember Me" checkbox, "Forgot Password" link.

On login: JWT issued with role embedded. Frontend routes protected by role middleware.

### 6.2 Role Permissions Matrix

| Feature | Super Admin | Receptionist | Doctor | Lab Tech | Pharmacist |
|---|:---:|:---:|:---:|:---:|:---:|
| View all modules | ✅ | ❌ | ❌ | ❌ | ❌ |
| Register patients | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage appointments | ✅ | ✅ | View own | ❌ | ❌ |
| OPD consultation | ✅ | ❌ | ✅ | ❌ | ❌ |
| Write prescriptions | ✅ | ❌ | ✅ | ❌ | ❌ |
| Order lab tests | ✅ | ❌ | ✅ | ❌ | ❌ |
| Enter lab results | ✅ | ❌ | ❌ | ✅ | ❌ |
| Verify lab reports | ✅ | ❌ | ❌ | ✅ | ❌ |
| POS / Sell products | ✅ | ❌ | ❌ | ❌ | ✅ |
| Manage products | ✅ | ❌ | ❌ | ❌ | ✅ |
| Manage stock | ✅ | ❌ | ❌ | ❌ | ✅ |
| View reports | ✅ | ❌ | Own stats | Own stats | Pharmacy |
| User management | ✅ | ❌ | ❌ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| View patient history | ✅ | ✅ (basic) | ✅ (full) | ✅ (labs) | ✅ (Rx) |
| Billing | ✅ | View | View | ❌ | Process |

---

## 7. AI Modules (Synthetic Data — Demo Phase)

These modules will display realistic-looking AI insights using hardcoded/synthetic data. They demonstrate the vision for Stryder AI integration in Phase 2.

### 7.1 AI Triage Assistant (Reception Dashboard)
- Synthetic urgency scoring based on patient ailments
- "AI recommends: Cardiology — Urgent" pill on new registrations
- Fake confidence score (e.g., "92% match")

### 7.2 Clinical Decision Support (Doctor Portal)
- "AI Suggestions" card on consultation view
- Synthetic drug interaction warnings ("⚠ Amlodipine + Metformin — monitor renal function")
- Suggested diagnosis based on symptoms (hardcoded mappings)
- "Similar cases" panel with synthetic past patient summaries

### 7.3 Lab Insights (Lab Portal)
- "AI Analysis" section on completed reports
- Synthetic trend analysis ("Hemoglobin trending ↓ over last 3 visits")
- Critical value auto-alerts (synthetic)

### 7.4 Pharmacy Intelligence (ePOS Dashboard)
- Demand forecasting widget (synthetic chart showing predicted sales)
- "Expiring Soon" smart alerts
- Reorder suggestions based on synthetic consumption patterns

### 7.5 Executive Dashboard (Super Admin)
- Hospital health score (synthetic composite metric)
- Patient satisfaction index (synthetic)
- Department efficiency rankings (synthetic)
- Revenue prediction (synthetic trend line)

---

## 8. Key UX Patterns

### 8.1 Global Search
- Accessible from any portal via `Cmd/Ctrl + K`
- Search patients by name, MR#, phone
- Search products by name, barcode
- Search appointments by date, doctor
- Results categorized by type with icons

### 8.2 Notifications System
- Bell icon in top nav bar
- Real-time notifications (future: Socket.io)
- Types: New appointment, Lab result ready, Prescription pending, Low stock alert, System alerts
- Click notification → navigates to relevant item

### 8.3 Toast Notifications
- Success (green), Error (red), Warning (amber), Info (blue)
- Auto-dismiss after 4 seconds
- Stack from top-right

### 8.4 Empty States
- Every list/table has a designed empty state with an illustration and helpful action button
- Example: "No patients waiting. Enjoy the quiet! 🍵" with illustration

### 8.5 Loading States
- Skeleton screens for cards and tables (not spinners)
- Subtle shimmer animation on skeleton placeholders

### 8.6 Confirmation Modals
- All destructive actions require confirmation
- Modal with clear action description, cancel/confirm buttons
- Confirm button uses danger color for destructive actions

### 8.7 Print Layouts
- Dedicated print CSS for: Patient token slip, Prescription, Lab report, Sale receipt, Invoice
- All print layouts use clean black/white formatting for thermal and A4 printers

---

## 9. Seed Data

The system ships with the following seed data for immediate demo readiness:

### 9.1 Users
| Name | Role | Department |
|---|---|---|
| Admin User | super_admin | — |
| Ayesha Khan | receptionist | Front Desk |
| Dr. Tariq Ahmed | doctor | Cardiology |
| Dr. Saira Khan | doctor | General Medicine |
| Dr. Imran Malik | doctor | Orthopedics |
| Hamza Ali | lab_technician | Pathology |
| Bilal Shah | pharmacist | Pharmacy |

### 9.2 Test Templates
All 12 templates listed in Section 4.4 with complete parameter definitions, units, and reference ranges pre-loaded.

### 9.3 Product Groups & Sample Products
Pharmacy group tree with 50+ sample pharmaceutical products covering common medicines (Panadol, Augmentin, Amoxicillin, Metformin, Amlodipine, Omeprazole, etc.) with realistic pricing.

### 9.4 Sample Patients
10 pre-registered patients with varied ailment profiles, visit histories, lab results, and prescriptions for demonstration purposes.

---

## 10. File & Folder Structure

```
stryde-health/
├── PLAN.md                           ← This document
├── client/                           ← React Frontend
│   ├── public/
│   │   ├── logo.svg
│   │   └── favicon.ico
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── Router.tsx            ← Role-based routing
│   │   │   └── providers/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── fonts/
│   │   ├── components/
│   │   │   ├── ui/                   ← Design system components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Checkbox.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   ├── SearchCommand.tsx  ← Cmd+K global search
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx      ← Main layout with sidebar
│   │   │   │   ├── POSLayout.tsx      ← Dark theme POS layout
│   │   │   │   └── AuthLayout.tsx     ← Login page layout
│   │   │   └── shared/
│   │   │       ├── PatientCard.tsx
│   │   │       ├── AppointmentCard.tsx
│   │   │       ├── MetricCard.tsx
│   │   │       └── StatusBadge.tsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── authStore.ts
│   │   │   ├── super-admin/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   ├── Reports.tsx
│   │   │   │   └── Settings.tsx
│   │   │   ├── reception/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── RegisterPatient.tsx
│   │   │   │   ├── PatientSearch.tsx
│   │   │   │   ├── Appointments.tsx
│   │   │   │   ├── Calendar.tsx
│   │   │   │   ├── Billing.tsx            ← Payment collection cashier
│   │   │   │   └── PaymentHistory.tsx
│   │   │   ├── doctor/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── OPDQueue.tsx
│   │   │   │   ├── Consultation.tsx
│   │   │   │   ├── PrescriptionForm.tsx
│   │   │   │   └── LabOrderForm.tsx
│   │   │   ├── lab/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── PendingOrders.tsx
│   │   │   │   ├── ResultEntry.tsx
│   │   │   │   ├── CompletedReports.tsx
│   │   │   │   └── templates/
│   │   │   │       ├── CBCTemplate.tsx
│   │   │   │       ├── LFTTemplate.tsx
│   │   │   │       ├── RFTTemplate.tsx
│   │   │   │       ├── UrineRETemplate.tsx
│   │   │   │       ├── LipidProfileTemplate.tsx
│   │   │   │       └── ...
│   │   │   └── pharmacy/
│   │   │       ├── POS.tsx
│   │   │       ├── Products.tsx
│   │   │       ├── ProductForm.tsx
│   │   │       ├── ProductGroupTree.tsx
│   │   │       ├── Stock.tsx
│   │   │       ├── SalesHistory.tsx
│   │   │       ├── Dashboard.tsx
│   │   │       └── Receipt.tsx
│   │   ├── hooks/
│   │   │   ├── usePatients.ts
│   │   │   ├── useAppointments.ts
│   │   │   ├── useProducts.ts
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api.ts                ← Axios/fetch wrapper
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── patientStore.ts
│   │   │   ├── appointmentStore.ts
│   │   │   ├── cartStore.ts          ← POS cart state
│   │   │   └── notificationStore.ts
│   │   ├── styles/
│   │   │   ├── globals.css           ← Design tokens, gradients
│   │   │   └── print.css             ← Print-specific styles
│   │   ├── types/
│   │   │   ├── patient.ts
│   │   │   ├── appointment.ts
│   │   │   ├── prescription.ts
│   │   │   ├── lab.ts
│   │   │   ├── pharmacy.ts
│   │   │   └── user.ts
│   │   └── main.tsx
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── server/                           ← Node.js Backend
│   ├── src/
│   │   ├── app.ts                    ← Express app setup
│   │   ├── server.ts                 ← Entry point
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts               ← JWT verification
│   │   │   ├── roleGuard.ts          ← Role-based access
│   │   │   ├── errorHandler.ts
│   │   │   └── validate.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── patient.routes.ts
│   │   │   ├── appointment.routes.ts
│   │   │   ├── visit.routes.ts
│   │   │   ├── prescription.routes.ts
│   │   │   ├── lab.routes.ts
│   │   │   ├── pharmacy.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   └── report.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── patient.controller.ts
│   │   │   ├── appointment.controller.ts
│   │   │   ├── visit.controller.ts
│   │   │   ├── prescription.controller.ts
│   │   │   ├── lab.controller.ts
│   │   │   ├── pharmacy.controller.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   └── report.controller.ts
│   │   ├── services/
│   │   │   ├── patient.service.ts
│   │   │   ├── appointment.service.ts
│   │   │   ├── visit.service.ts
│   │   │   ├── prescription.service.ts
│   │   │   ├── lab.service.ts
│   │   │   ├── pharmacy.service.ts
│   │   │   └── report.service.ts
│   │   ├── utils/
│   │   │   ├── tokenGenerator.ts     ← MR# and token# generators
│   │   │   ├── pdfGenerator.ts       ← Lab reports, receipts
│   │   │   └── validators.ts
│   │   └── types/
│   │       └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma             ← Complete schema
│   │   ├── seed.ts                   ← Seed data script
│   │   └── migrations/
│   ├── tsconfig.json
│   └── package.json
│
├── docker/
│   ├── Dockerfile.client             ← Multi-stage build: build React → serve via Nginx
│   ├── Dockerfile.server             ← Node.js production image
│   ├── nginx.conf                    ← Reverse proxy config (SSL, static, API proxy)
│   └── .env.example                  ← Template for environment variables
│
├── docker-compose.yml                ← Dev: PostgreSQL + pgAdmin + API + Client
├── docker-compose.prod.yml           ← Production: full stack with Nginx
└── .github/
    └── workflows/
        └── deploy.yml                ← CI/CD pipeline (build, test, deploy)
```

---

## 11. Build Phases

### Phase 1A — Foundation (Current Sprint)
- [ ] Project scaffolding (Vite + React + Tailwind + Express + Prisma + PostgreSQL)
- [ ] Docker Compose dev environment (PostgreSQL + pgAdmin + hot-reload API + Client)
- [ ] Database schema + migrations (all tables including `dispensed_items`, `payment_status` fields)
- [ ] Seed data (users, test templates, sample products, sample patients)
- [ ] Authentication (login, JWT, role guard, role-based route protection)
- [ ] Design system components (Card, Button, Input, Table, Sidebar, Modal, Toast, Badge, Skeleton)
- [ ] App layout with role-based sidebar (CoachPro glassmorphic style)
- [ ] Login page (gradient background, glassmorphic card)
- [ ] Global daily token counter (resets at midnight, hospital-wide)

### Phase 1B — Reception & Appointments
- [ ] Patient registration form (personal info, emergency contact, ailment checkboxes, allergies)
- [ ] Auto-generated MR Number (format: `MR-YYYY-NNNNN`)
- [ ] Patient search (by name, MR#, phone, CNIC) + profile view
- [ ] Appointment creation (walk-in + scheduled)
- [ ] Doctor assignment (filtered by department, then by doctor)
- [ ] Daily appointment calendar view (day/week/month)
- [ ] Token generation + print token slip
- [ ] **Billing / Cashier module** — collect consultation fee at registration
- [ ] **Post-consultation billing** — collect lab test + medicine fees before patient proceeds
- [ ] Payment receipt generation (line items, total, payment method)
- [ ] Payment history (searchable by date, patient, method)
- [ ] Receptionist dashboard (today's registrations, appointments, collections, pending payments)

### Phase 1C — Doctor & OPD
- [ ] Doctor dashboard with metrics (patients today, waiting, completed, weekly chart)
- [ ] OPD queue (waiting → in progress → completed) — only shows patients assigned to this doctor
- [ ] Consultation workspace (split panel: patient summary + notes + Rx + labs)
- [ ] Vitals entry (BP, pulse, temp, SpO2, weight)
- [ ] Consultation notes (chief complaint, HPI, examination, diagnosis, plan)
- [ ] Prescription builder (medicine name, dosage, frequency, duration, route, instructions)
- [ ] Lab order creation (checkbox list of test templates + priority + notes)
- [ ] "Complete & Next Patient" flow (saves visit, creates Rx record, creates lab order, advances queue)
- [ ] Prescription print layout (A5 format with header, patient info, Rx table, footer)
- [ ] Patient history view (previous visits, labs, prescriptions for this patient)

### Phase 1D — Lab Module
- [ ] Lab dashboard (pending, in progress, completed today, urgent, average TAT)
- [ ] Pending orders queue — **only shows orders with `payment_status = 'paid'`**
- [ ] Unpaid orders shown separately as "Awaiting Payment" (greyed out, non-actionable)
- [ ] "Accept & Process" workflow
- [ ] Result entry forms for all 12 templates:
  - [ ] CBC (15 parameters + differential count)
  - [ ] LFTs (8 parameters)
  - [ ] RFTs (5 parameters)
  - [ ] Lipid Profile (6 parameters)
  - [ ] CRP (quantitative)
  - [ ] Urine RE (13+ parameters)
  - [ ] HbA1c
  - [ ] Thyroid Profile (5 parameters)
  - [ ] Serology (4 tests)
  - [ ] Coagulation Profile (5 parameters)
  - [ ] Blood Sugar (3 types)
  - [ ] Electrolytes (6 parameters)
- [ ] Abnormal value auto-flagging (H/L based on reference ranges, gender-aware)
- [ ] Report generation (PDF template with hospital letterhead, patient info, results table)
- [ ] Completed reports archive (searchable, filterable)
- [ ] Direct finalization by technician (no pathologist verification gate)

### Phase 1E — Pharmacy ePOS
- [ ] POS layout same as main app glassmorphic theme
- [ ] POS main screen (cart, product search, payment panel)
- [ ] Product search (by name, generic name, barcode, SKU — real-time dropdown)
- [ ] Cart management (add/remove, quantity adjust, per-item discount)
- [ ] Payment processing (Cash with change calc, EasyPaisa, Credit, Check)
- [ ] **Prescription queue** — shows paid prescriptions from doctors
- [ ] **Auto-populate cart** from Rx queue with stock status indicators
- [ ] **Substitution flow** — when medicine is out of stock:
  - [ ] Visual indicator (✅ In Stock, ❌ Out of Stock, ⚠️ Low Stock)
  - [ ] "Substitute" button → search modal with available alternatives
  - [ ] Reason dropdown (Out of stock, Patient preference, Price concern, Doctor approved)
  - [ ] `dispensed_items` record saves both original + substituted medicine
- [ ] Product management (CRUD + hierarchical group tree)
- [ ] Stock management (**manual adjustments only** — Phase 1)
  - [ ] Adjustment with reason codes (Purchase, Return, Damaged, Expired, Manual)
  - [ ] Stock movement log
  - [ ] Low stock alerts
- [ ] Sales history (filterable table, click to expand line items)
- [ ] Pharmacy dashboard / reports (monthly sales chart, top products, hourly sales, product group breakdown)
- [ ] Receipt generation (thermal printer format)
- [ ] Keyboard shortcuts (F2 Discount, F3 Search, F5 Qty, F9 Save, F10 Payment, F12 Cash)
- [ ] Save sale / Void sale / Refund capabilities
- [ ] Lock screen with PIN (shift handover)

### Phase 1F — Integration & Polish
- [ ] Super admin dashboard (aggregated metrics from all departments)
- [ ] Cross-portal data flow verification (end-to-end: register → consult → pay → lab → pay → pharmacy)
- [ ] **Billing flow integration testing** — ensure payment gates work (lab/pharmacy block unpaid orders)
- [ ] Patient history timeline (all visits, labs, Rx, bills, dispensed items in chronological order)
- [ ] Global search (Cmd+K) — patients, products, appointments
- [ ] Notification system (in-app bell icon)
- [ ] Print layouts (token slip, Rx, lab report, sale receipt, billing receipt, invoice)
- [ ] Empty states + loading skeletons for all pages
- [ ] Responsive refinements
- [ ] Docker production build (Dockerfile.client, Dockerfile.server, nginx.conf, docker-compose.prod.yml)
- [ ] Environment variable configuration (.env.example for cloud vs on-prem)
- [ ] Bug fixes + QA

### Phase 2 (Future) — AI Integration + Expansion
- [ ] Stryder AI engine integration
- [ ] Real triage scoring
- [ ] Clinical decision support
- [ ] Lab trend analysis
- [ ] Pharmacy demand forecasting
- [ ] Natural language patient search
- [ ] Voice-to-text for doctor notes
- [ ] **Supplier management + Purchase Orders** (deferred from Phase 1)
- [ ] **Multi-branch support** (deferred — add `branch_id` FKs, branch selector)
- [ ] **Configurable hospital branding** (logo, name, colors per deployment)
- [ ] **Pathologist verification workflow** (optional gate before lab report finalization)
- [ ] **Socket.io real-time updates** (live queue, notifications, appointment status)
- [ ] **SMS/WhatsApp notifications** (appointment reminders, lab results ready)
- [ ] **Patient-facing portal** (view reports, upcoming appointments, prescriptions)

---

## 12. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Response Time** | < 200ms for API calls, < 50ms for UI interactions |
| **Concurrent Users** | Support 50+ simultaneous users across portals |
| **Data Integrity** | ACID transactions for all financial and medical records |
| **Uptime** | 99.9% (critical for hospital operations) |
| **Audit Trail** | Every create/update/delete logged with user ID and timestamp |
| **Data Backup** | Automated PostgreSQL backups (daily) |
| **Print Support** | Thermal printers (receipts), A4/A5 (reports, Rx) |
| **Browser Support** | Chrome 90+, Edge 90+, Firefox 90+ |
| **Accessibility** | WCAG 2.1 AA compliant |
| **Security** | HTTPS, password hashing (bcrypt), JWT expiry, rate limiting |

---

## 13. Naming & Branding

| Element | Value |
|---|---|
| **Product Name** | Stryde Health |
| **Tagline** | "Intelligent Hospital Management" |
| **Logo** | Stryde Health wordmark with medical cross + tech gradient |
| **Favicon** | Stylized "S" with teal gradient |
| **Portal Names** | Stryde Admin, Stryde Reception, Stryde OPD, Stryde Lab, Stryde Pharmacy |

---

*End of Plan Document — Stryde Health HIS v1.0*
