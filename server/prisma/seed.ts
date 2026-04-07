import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── USERS ──────────────────────────────────────────────────
  const password = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@strydehealth.com' },
    update: {},
    create: {
      email: 'admin@strydehealth.com',
      passwordHash: password,
      fullName: 'Admin User',
      role: 'super_admin',
      department: 'Administration',
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: 'ayesha@strydehealth.com' },
    update: {},
    create: {
      email: 'ayesha@strydehealth.com',
      passwordHash: password,
      fullName: 'Ayesha Khan',
      role: 'receptionist',
      department: 'Front Desk',
    },
  });

  const drTariq = await prisma.user.upsert({
    where: { email: 'dr.tariq@strydehealth.com' },
    update: {},
    create: {
      email: 'dr.tariq@strydehealth.com',
      passwordHash: password,
      fullName: 'Dr. Tariq Ahmed',
      role: 'doctor',
      department: 'Cardiology',
      specialization: 'Cardiologist',
    },
  });

  const drSaira = await prisma.user.upsert({
    where: { email: 'dr.saira@strydehealth.com' },
    update: {},
    create: {
      email: 'dr.saira@strydehealth.com',
      passwordHash: password,
      fullName: 'Dr. Saira Khan',
      role: 'doctor',
      department: 'General Medicine',
      specialization: 'General Physician',
    },
  });

  const drImran = await prisma.user.upsert({
    where: { email: 'dr.imran@strydehealth.com' },
    update: {},
    create: {
      email: 'dr.imran@strydehealth.com',
      passwordHash: password,
      fullName: 'Dr. Imran Malik',
      role: 'doctor',
      department: 'Orthopedics',
      specialization: 'Orthopedic Surgeon',
    },
  });

  const labTech = await prisma.user.upsert({
    where: { email: 'hamza@strydehealth.com' },
    update: {},
    create: {
      email: 'hamza@strydehealth.com',
      passwordHash: password,
      fullName: 'Hamza Ali',
      role: 'lab_technician',
      department: 'Pathology',
    },
  });

  const pharmacist = await prisma.user.upsert({
    where: { email: 'bilal@strydehealth.com' },
    update: {},
    create: {
      email: 'bilal@strydehealth.com',
      passwordHash: password,
      fullName: 'Bilal Shah',
      role: 'pharmacist',
      department: 'Pharmacy',
    },
  });

  console.log('Users seeded');

  // ─── TEST TEMPLATES ─────────────────────────────────────────

  const templates = [
    {
      name: 'CBC',
      category: 'Hematology',
      sampleType: 'blood' as const,
      turnaroundHours: 2,
      price: 800,
      params: [
        { parameterName: 'Hemoglobin', unit: 'g/dL', refRangeMale: '13.0 - 17.0', refRangeFemale: '12.0 - 15.5', refRangeChild: '11.0 - 14.0', sortOrder: 1 },
        { parameterName: 'RBC Count', unit: '×10¹²/L', refRangeMale: '4.5 - 5.5', refRangeFemale: '3.8 - 4.8', refRangeChild: '4.0 - 5.2', sortOrder: 2 },
        { parameterName: 'WBC Count', unit: '×10⁹/L', refRangeMale: '4.0 - 11.0', refRangeFemale: '4.0 - 11.0', refRangeChild: '5.0 - 13.0', sortOrder: 3 },
        { parameterName: 'Platelet Count', unit: '×10⁹/L', refRangeMale: '150 - 400', refRangeFemale: '150 - 400', refRangeChild: '150 - 400', sortOrder: 4 },
        { parameterName: 'Hematocrit (HCT)', unit: '%', refRangeMale: '40 - 54', refRangeFemale: '36 - 48', refRangeChild: '35 - 45', sortOrder: 5 },
        { parameterName: 'MCV', unit: 'fL', refRangeMale: '80 - 100', refRangeFemale: '80 - 100', refRangeChild: '75 - 95', sortOrder: 6 },
        { parameterName: 'MCH', unit: 'pg', refRangeMale: '27 - 33', refRangeFemale: '27 - 33', refRangeChild: '25 - 33', sortOrder: 7 },
        { parameterName: 'MCHC', unit: 'g/dL', refRangeMale: '31.5 - 34.5', refRangeFemale: '31.5 - 34.5', refRangeChild: '31.0 - 35.0', sortOrder: 8 },
        { parameterName: 'ESR', unit: 'mm/hr', refRangeMale: '0 - 15', refRangeFemale: '0 - 20', refRangeChild: '0 - 10', sortOrder: 9 },
        { parameterName: 'Neutrophils', unit: '%', refRangeMale: '40 - 75', refRangeFemale: '40 - 75', refRangeChild: '30 - 60', sortOrder: 10 },
        { parameterName: 'Lymphocytes', unit: '%', refRangeMale: '20 - 45', refRangeFemale: '20 - 45', refRangeChild: '25 - 50', sortOrder: 11 },
        { parameterName: 'Monocytes', unit: '%', refRangeMale: '2 - 10', refRangeFemale: '2 - 10', refRangeChild: '2 - 10', sortOrder: 12 },
        { parameterName: 'Eosinophils', unit: '%', refRangeMale: '1 - 6', refRangeFemale: '1 - 6', refRangeChild: '1 - 6', sortOrder: 13 },
        { parameterName: 'Basophils', unit: '%', refRangeMale: '0 - 1', refRangeFemale: '0 - 1', refRangeChild: '0 - 1', sortOrder: 14 },
        { parameterName: 'RDW', unit: '%', refRangeMale: '11.5 - 14.5', refRangeFemale: '11.5 - 14.5', refRangeChild: '11.5 - 14.5', sortOrder: 15 },
      ],
    },
    {
      name: 'LFTs',
      category: 'Biochemistry',
      sampleType: 'blood' as const,
      turnaroundHours: 3,
      price: 1200,
      params: [
        { parameterName: 'Bilirubin Total', unit: 'mg/dL', refRangeMale: '0.1 - 1.2', refRangeFemale: '0.1 - 1.2', sortOrder: 1 },
        { parameterName: 'Bilirubin Direct', unit: 'mg/dL', refRangeMale: '0.0 - 0.3', refRangeFemale: '0.0 - 0.3', sortOrder: 2 },
        { parameterName: 'ALT (SGPT)', unit: 'U/L', refRangeMale: '7 - 56', refRangeFemale: '7 - 45', sortOrder: 3 },
        { parameterName: 'AST (SGOT)', unit: 'U/L', refRangeMale: '10 - 40', refRangeFemale: '9 - 32', sortOrder: 4 },
        { parameterName: 'ALP', unit: 'U/L', refRangeMale: '44 - 147', refRangeFemale: '44 - 147', sortOrder: 5 },
        { parameterName: 'Albumin', unit: 'g/dL', refRangeMale: '3.5 - 5.0', refRangeFemale: '3.5 - 5.0', sortOrder: 6 },
        { parameterName: 'Total Protein', unit: 'g/dL', refRangeMale: '6.0 - 8.3', refRangeFemale: '6.0 - 8.3', sortOrder: 7 },
        { parameterName: 'GGT', unit: 'U/L', refRangeMale: '9 - 48', refRangeFemale: '9 - 36', sortOrder: 8 },
      ],
    },
    {
      name: 'RFTs',
      category: 'Biochemistry',
      sampleType: 'blood' as const,
      turnaroundHours: 3,
      price: 1000,
      params: [
        { parameterName: 'Urea', unit: 'mg/dL', refRangeMale: '17 - 43', refRangeFemale: '15 - 40', sortOrder: 1 },
        { parameterName: 'Creatinine', unit: 'mg/dL', refRangeMale: '0.7 - 1.3', refRangeFemale: '0.6 - 1.1', sortOrder: 2 },
        { parameterName: 'Uric Acid', unit: 'mg/dL', refRangeMale: '3.4 - 7.0', refRangeFemale: '2.4 - 6.0', sortOrder: 3 },
        { parameterName: 'BUN', unit: 'mg/dL', refRangeMale: '8 - 20', refRangeFemale: '6 - 18', sortOrder: 4 },
        { parameterName: 'eGFR', unit: 'mL/min/1.73m²', refRangeMale: '> 90', refRangeFemale: '> 90', sortOrder: 5, isCalculated: true },
      ],
    },
    {
      name: 'Lipid Profile',
      category: 'Biochemistry',
      sampleType: 'blood' as const,
      turnaroundHours: 3,
      price: 1200,
      params: [
        { parameterName: 'Total Cholesterol', unit: 'mg/dL', refRangeMale: '< 200', refRangeFemale: '< 200', sortOrder: 1 },
        { parameterName: 'HDL Cholesterol', unit: 'mg/dL', refRangeMale: '> 40', refRangeFemale: '> 50', sortOrder: 2 },
        { parameterName: 'LDL Cholesterol', unit: 'mg/dL', refRangeMale: '< 100', refRangeFemale: '< 100', sortOrder: 3 },
        { parameterName: 'Triglycerides', unit: 'mg/dL', refRangeMale: '< 150', refRangeFemale: '< 150', sortOrder: 4 },
        { parameterName: 'VLDL', unit: 'mg/dL', refRangeMale: '5 - 40', refRangeFemale: '5 - 40', sortOrder: 5, isCalculated: true },
        { parameterName: 'TC/HDL Ratio', unit: '', refRangeMale: '< 5.0', refRangeFemale: '< 4.5', sortOrder: 6, isCalculated: true },
      ],
    },
    {
      name: 'CRP',
      category: 'Immunology',
      sampleType: 'blood' as const,
      turnaroundHours: 2,
      price: 600,
      params: [
        { parameterName: 'C-Reactive Protein', unit: 'mg/L', refRangeMale: '< 5.0', refRangeFemale: '< 5.0', sortOrder: 1 },
      ],
    },
    {
      name: 'Urine RE',
      category: 'Urinalysis',
      sampleType: 'urine' as const,
      turnaroundHours: 1,
      price: 400,
      params: [
        { parameterName: 'Color', unit: '', refRangeMale: 'Pale Yellow - Yellow', refRangeFemale: 'Pale Yellow - Yellow', sortOrder: 1 },
        { parameterName: 'Appearance', unit: '', refRangeMale: 'Clear', refRangeFemale: 'Clear', sortOrder: 2 },
        { parameterName: 'pH', unit: '', refRangeMale: '4.5 - 8.0', refRangeFemale: '4.5 - 8.0', sortOrder: 3 },
        { parameterName: 'Specific Gravity', unit: '', refRangeMale: '1.005 - 1.030', refRangeFemale: '1.005 - 1.030', sortOrder: 4 },
        { parameterName: 'Protein', unit: '', refRangeMale: 'Nil', refRangeFemale: 'Nil', sortOrder: 5 },
        { parameterName: 'Glucose', unit: '', refRangeMale: 'Nil', refRangeFemale: 'Nil', sortOrder: 6 },
        { parameterName: 'Blood', unit: '', refRangeMale: 'Nil', refRangeFemale: 'Nil', sortOrder: 7 },
        { parameterName: 'WBC', unit: '/HPF', refRangeMale: '0 - 5', refRangeFemale: '0 - 5', sortOrder: 8 },
        { parameterName: 'RBC', unit: '/HPF', refRangeMale: '0 - 2', refRangeFemale: '0 - 2', sortOrder: 9 },
        { parameterName: 'Epithelial Cells', unit: '/HPF', refRangeMale: 'Few', refRangeFemale: 'Few', sortOrder: 10 },
        { parameterName: 'Casts', unit: '/LPF', refRangeMale: 'Nil', refRangeFemale: 'Nil', sortOrder: 11 },
        { parameterName: 'Crystals', unit: '', refRangeMale: 'Nil', refRangeFemale: 'Nil', sortOrder: 12 },
        { parameterName: 'Bacteria', unit: '', refRangeMale: 'Nil', refRangeFemale: 'Nil', sortOrder: 13 },
      ],
    },
    {
      name: 'HbA1c',
      category: 'Biochemistry',
      sampleType: 'blood' as const,
      turnaroundHours: 4,
      price: 900,
      params: [
        { parameterName: 'HbA1c', unit: '%', refRangeMale: '< 5.7 (Normal), 5.7-6.4 (Pre-diabetic), ≥ 6.5 (Diabetic)', refRangeFemale: '< 5.7 (Normal), 5.7-6.4 (Pre-diabetic), ≥ 6.5 (Diabetic)', sortOrder: 1 },
      ],
    },
    {
      name: 'Thyroid Profile',
      category: 'Endocrinology',
      sampleType: 'blood' as const,
      turnaroundHours: 6,
      price: 2500,
      params: [
        { parameterName: 'TSH', unit: 'mIU/L', refRangeMale: '0.4 - 4.0', refRangeFemale: '0.4 - 4.0', sortOrder: 1 },
        { parameterName: 'T3', unit: 'ng/dL', refRangeMale: '80 - 200', refRangeFemale: '80 - 200', sortOrder: 2 },
        { parameterName: 'T4', unit: 'μg/dL', refRangeMale: '5.0 - 12.0', refRangeFemale: '5.0 - 12.0', sortOrder: 3 },
        { parameterName: 'FT3', unit: 'pg/mL', refRangeMale: '2.0 - 4.4', refRangeFemale: '2.0 - 4.4', sortOrder: 4 },
        { parameterName: 'FT4', unit: 'ng/dL', refRangeMale: '0.8 - 1.8', refRangeFemale: '0.8 - 1.8', sortOrder: 5 },
      ],
    },
    {
      name: 'Serology',
      category: 'Serology',
      sampleType: 'serum' as const,
      turnaroundHours: 4,
      price: 2000,
      params: [
        { parameterName: 'HBsAg', unit: '', refRangeMale: 'Non-Reactive', refRangeFemale: 'Non-Reactive', sortOrder: 1 },
        { parameterName: 'Anti-HCV', unit: '', refRangeMale: 'Non-Reactive', refRangeFemale: 'Non-Reactive', sortOrder: 2 },
        { parameterName: 'HIV I/II', unit: '', refRangeMale: 'Non-Reactive', refRangeFemale: 'Non-Reactive', sortOrder: 3 },
        { parameterName: 'VDRL', unit: '', refRangeMale: 'Non-Reactive', refRangeFemale: 'Non-Reactive', sortOrder: 4 },
      ],
    },
    {
      name: 'Coagulation Profile',
      category: 'Hematology',
      sampleType: 'blood' as const,
      turnaroundHours: 3,
      price: 1500,
      params: [
        { parameterName: 'PT', unit: 'seconds', refRangeMale: '11 - 13.5', refRangeFemale: '11 - 13.5', sortOrder: 1 },
        { parameterName: 'INR', unit: '', refRangeMale: '0.8 - 1.2', refRangeFemale: '0.8 - 1.2', sortOrder: 2 },
        { parameterName: 'APTT', unit: 'seconds', refRangeMale: '25 - 35', refRangeFemale: '25 - 35', sortOrder: 3 },
        { parameterName: 'Bleeding Time', unit: 'minutes', refRangeMale: '1 - 6', refRangeFemale: '1 - 6', sortOrder: 4 },
        { parameterName: 'Clotting Time', unit: 'minutes', refRangeMale: '4 - 9', refRangeFemale: '4 - 9', sortOrder: 5 },
      ],
    },
    {
      name: 'Blood Sugar',
      category: 'Biochemistry',
      sampleType: 'blood' as const,
      turnaroundHours: 1,
      price: 300,
      params: [
        { parameterName: 'Fasting Blood Sugar', unit: 'mg/dL', refRangeMale: '70 - 100', refRangeFemale: '70 - 100', sortOrder: 1 },
        { parameterName: 'Random Blood Sugar', unit: 'mg/dL', refRangeMale: '< 140', refRangeFemale: '< 140', sortOrder: 2 },
        { parameterName: 'Post-Prandial Blood Sugar', unit: 'mg/dL', refRangeMale: '< 140', refRangeFemale: '< 140', sortOrder: 3 },
      ],
    },
    {
      name: 'Electrolytes',
      category: 'Biochemistry',
      sampleType: 'blood' as const,
      turnaroundHours: 2,
      price: 1500,
      params: [
        { parameterName: 'Sodium (Na)', unit: 'mEq/L', refRangeMale: '136 - 145', refRangeFemale: '136 - 145', sortOrder: 1 },
        { parameterName: 'Potassium (K)', unit: 'mEq/L', refRangeMale: '3.5 - 5.1', refRangeFemale: '3.5 - 5.1', sortOrder: 2 },
        { parameterName: 'Chloride (Cl)', unit: 'mEq/L', refRangeMale: '98 - 106', refRangeFemale: '98 - 106', sortOrder: 3 },
        { parameterName: 'Calcium (Ca)', unit: 'mg/dL', refRangeMale: '8.5 - 10.5', refRangeFemale: '8.5 - 10.5', sortOrder: 4 },
        { parameterName: 'Magnesium (Mg)', unit: 'mg/dL', refRangeMale: '1.7 - 2.2', refRangeFemale: '1.7 - 2.2', sortOrder: 5 },
        { parameterName: 'Phosphate (PO4)', unit: 'mg/dL', refRangeMale: '2.5 - 4.5', refRangeFemale: '2.5 - 4.5', sortOrder: 6 },
      ],
    },
  ];

  for (const t of templates) {
    const existing = await prisma.testTemplate.findFirst({ where: { name: t.name } });
    if (existing) continue;

    await prisma.testTemplate.create({
      data: {
        name: t.name,
        category: t.category,
        sampleType: t.sampleType,
        turnaroundHours: t.turnaroundHours,
        price: t.price,
        parameters: {
          create: t.params.map((p) => ({
            parameterName: p.parameterName,
            unit: p.unit,
            refRangeMale: p.refRangeMale,
            refRangeFemale: p.refRangeFemale,
            refRangeChild: (p as any).refRangeChild || null,
            sortOrder: p.sortOrder,
            isCalculated: (p as any).isCalculated || false,
          })),
        },
      },
    });
  }

  console.log('Test templates seeded');

  // ─── PRODUCT GROUPS ─────────────────────────────────────────

  const groupData = [
    { name: 'Tablets', sort: 1, children: ['Cardiovascular', 'Antibiotics', 'Analgesics', 'Antidiabetics', 'Gastrointestinal', 'Neurological'] },
    { name: 'Capsules', sort: 2, children: [] },
    { name: 'Syrups & Suspensions', sort: 3, children: [] },
    { name: 'Injections', sort: 4, children: [] },
    { name: 'Creams & Ointments', sort: 5, children: [] },
    { name: 'Drops', sort: 6, children: ['Eye Drops', 'Ear Drops', 'Nasal Drops'] },
    { name: 'Inhalers', sort: 7, children: [] },
    { name: 'Surgical & Dressings', sort: 8, children: [] },
    { name: 'OTC / General', sort: 9, children: [] },
    { name: 'Medical Devices', sort: 10, children: [] },
  ];

  const groupMap: Record<string, string> = {};

  for (const g of groupData) {
    const existing = await prisma.productGroup.findFirst({ where: { name: g.name, parentId: null } });
    if (existing) {
      groupMap[g.name] = existing.id;
      continue;
    }
    const parent = await prisma.productGroup.create({
      data: { name: g.name, sortOrder: g.sort },
    });
    groupMap[g.name] = parent.id;

    for (let i = 0; i < g.children.length; i++) {
      const child = await prisma.productGroup.create({
        data: { name: g.children[i], parentId: parent.id, sortOrder: i + 1 },
      });
      groupMap[g.children[i]] = child.id;
    }
  }

  console.log('Product groups seeded');

  // ─── PRODUCTS ───────────────────────────────────────────────

  const products = [
    // Cardiovascular
    { name: 'Amlodipine 5mg (Norvasc)', genericName: 'Amlodipine', group: 'Cardiovascular', code: 'CV001', costPrice: 280, salePrice: 350, qty: 200, unit: 'strip' as const },
    { name: 'Amlodipine 10mg (Norvasc)', genericName: 'Amlodipine', group: 'Cardiovascular', code: 'CV002', costPrice: 350, salePrice: 450, qty: 150, unit: 'strip' as const },
    { name: 'Atenolol 50mg (Tenormin)', genericName: 'Atenolol', group: 'Cardiovascular', code: 'CV003', costPrice: 180, salePrice: 250, qty: 300, unit: 'strip' as const },
    { name: 'Losartan 50mg (Cozaar)', genericName: 'Losartan', group: 'Cardiovascular', code: 'CV004', costPrice: 320, salePrice: 420, qty: 180, unit: 'strip' as const },
    { name: 'Aspirin 75mg (Disprin)', genericName: 'Aspirin', group: 'Cardiovascular', code: 'CV005', costPrice: 80, salePrice: 120, qty: 500, unit: 'strip' as const },
    { name: 'Clopidogrel 75mg (Plavix)', genericName: 'Clopidogrel', group: 'Cardiovascular', code: 'CV006', costPrice: 450, salePrice: 580, qty: 100, unit: 'strip' as const },
    { name: 'Atorvastatin 20mg (Lipitor)', genericName: 'Atorvastatin', group: 'Cardiovascular', code: 'CV007', costPrice: 380, salePrice: 500, qty: 120, unit: 'strip' as const },
    { name: 'Rosuvastatin 10mg (Crestor)', genericName: 'Rosuvastatin', group: 'Cardiovascular', code: 'CV008', costPrice: 420, salePrice: 550, qty: 100, unit: 'strip' as const },

    // Antibiotics
    { name: 'Amoxicillin 500mg (Amoxil)', genericName: 'Amoxicillin', group: 'Antibiotics', code: 'AB001', costPrice: 200, salePrice: 280, qty: 400, unit: 'strip' as const },
    { name: 'Augmentin 625mg', genericName: 'Amoxicillin/Clavulanate', group: 'Antibiotics', code: 'AB002', costPrice: 550, salePrice: 720, qty: 250, unit: 'strip' as const },
    { name: 'Azithromycin 500mg (Zithromax)', genericName: 'Azithromycin', group: 'Antibiotics', code: 'AB003', costPrice: 400, salePrice: 520, qty: 200, unit: 'strip' as const },
    { name: 'Ciprofloxacin 500mg (Cipro)', genericName: 'Ciprofloxacin', group: 'Antibiotics', code: 'AB004', costPrice: 180, salePrice: 250, qty: 300, unit: 'strip' as const },
    { name: 'Levofloxacin 500mg (Tavanic)', genericName: 'Levofloxacin', group: 'Antibiotics', code: 'AB005', costPrice: 350, salePrice: 480, qty: 150, unit: 'strip' as const },
    { name: 'Metronidazole 400mg (Flagyl)', genericName: 'Metronidazole', group: 'Antibiotics', code: 'AB006', costPrice: 100, salePrice: 150, qty: 350, unit: 'strip' as const },
    { name: 'Cefixime 400mg (Suprax)', genericName: 'Cefixime', group: 'Antibiotics', code: 'AB007', costPrice: 380, salePrice: 500, qty: 180, unit: 'strip' as const },

    // Analgesics
    { name: 'Paracetamol 500mg (Panadol)', genericName: 'Paracetamol', group: 'Analgesics', code: 'AN001', costPrice: 50, salePrice: 80, qty: 1000, unit: 'strip' as const },
    { name: 'Ibuprofen 400mg (Brufen)', genericName: 'Ibuprofen', group: 'Analgesics', code: 'AN002', costPrice: 80, salePrice: 120, qty: 500, unit: 'strip' as const },
    { name: 'Diclofenac 50mg (Voltaren)', genericName: 'Diclofenac', group: 'Analgesics', code: 'AN003', costPrice: 100, salePrice: 150, qty: 400, unit: 'strip' as const },
    { name: 'Naproxen 500mg (Naprosyn)', genericName: 'Naproxen', group: 'Analgesics', code: 'AN004', costPrice: 150, salePrice: 220, qty: 200, unit: 'strip' as const },
    { name: 'Tramadol 50mg (Tramal)', genericName: 'Tramadol', group: 'Analgesics', code: 'AN005', costPrice: 200, salePrice: 300, qty: 100, unit: 'strip' as const },

    // Antidiabetics
    { name: 'Metformin 500mg (Glucophage)', genericName: 'Metformin', group: 'Antidiabetics', code: 'DM001', costPrice: 180, salePrice: 280, qty: 350, unit: 'strip' as const },
    { name: 'Metformin 500mg (Daonil)', genericName: 'Metformin', group: 'Antidiabetics', code: 'DM002', costPrice: 150, salePrice: 250, qty: 200, unit: 'strip' as const },
    { name: 'Metformin 500mg (Generic)', genericName: 'Metformin', group: 'Antidiabetics', code: 'DM003', costPrice: 80, salePrice: 150, qty: 500, unit: 'strip' as const },
    { name: 'Glimepiride 2mg (Amaryl)', genericName: 'Glimepiride', group: 'Antidiabetics', code: 'DM004', costPrice: 250, salePrice: 350, qty: 200, unit: 'strip' as const },
    { name: 'Sitagliptin 100mg (Januvia)', genericName: 'Sitagliptin', group: 'Antidiabetics', code: 'DM005', costPrice: 800, salePrice: 1100, qty: 80, unit: 'strip' as const },

    // Gastrointestinal
    { name: 'Omeprazole 20mg (Losec)', genericName: 'Omeprazole', group: 'Gastrointestinal', code: 'GI001', costPrice: 150, salePrice: 220, qty: 400, unit: 'strip' as const },
    { name: 'Esomeprazole 40mg (Nexium)', genericName: 'Esomeprazole', group: 'Gastrointestinal', code: 'GI002', costPrice: 350, salePrice: 480, qty: 200, unit: 'strip' as const },
    { name: 'Domperidone 10mg (Motilium)', genericName: 'Domperidone', group: 'Gastrointestinal', code: 'GI003', costPrice: 100, salePrice: 160, qty: 300, unit: 'strip' as const },
    { name: 'Ranitidine 150mg (Zantac)', genericName: 'Ranitidine', group: 'Gastrointestinal', code: 'GI004', costPrice: 80, salePrice: 130, qty: 250, unit: 'strip' as const },

    // Neurological
    { name: 'Pregabalin 75mg (Lyrica)', genericName: 'Pregabalin', group: 'Neurological', code: 'NR001', costPrice: 400, salePrice: 550, qty: 100, unit: 'strip' as const },
    { name: 'Gabapentin 300mg (Neurontin)', genericName: 'Gabapentin', group: 'Neurological', code: 'NR002', costPrice: 300, salePrice: 420, qty: 120, unit: 'strip' as const },

    // Capsules
    { name: 'Omeprazole 20mg Caps', genericName: 'Omeprazole', group: 'Capsules', code: 'CP001', costPrice: 120, salePrice: 180, qty: 300, unit: 'strip' as const },
    { name: 'Amoxicillin 250mg Caps', genericName: 'Amoxicillin', group: 'Capsules', code: 'CP002', costPrice: 100, salePrice: 150, qty: 400, unit: 'strip' as const },
    { name: 'Vitamin D3 1000IU Caps', genericName: 'Cholecalciferol', group: 'Capsules', code: 'CP003', costPrice: 200, salePrice: 300, qty: 200, unit: 'strip' as const },

    // Syrups
    { name: 'Paracetamol Syrup 120mg/5ml', genericName: 'Paracetamol', group: 'Syrups & Suspensions', code: 'SY001', costPrice: 80, salePrice: 130, qty: 200, unit: 'bottle' as const },
    { name: 'Amoxicillin Syrup 250mg/5ml', genericName: 'Amoxicillin', group: 'Syrups & Suspensions', code: 'SY002', costPrice: 150, salePrice: 220, qty: 150, unit: 'bottle' as const },
    { name: 'Cough Syrup (Benylin)', genericName: 'Dextromethorphan', group: 'Syrups & Suspensions', code: 'SY003', costPrice: 180, salePrice: 280, qty: 100, unit: 'bottle' as const },
    { name: 'Iron Syrup (Ferrous Sulfate)', genericName: 'Ferrous Sulfate', group: 'Syrups & Suspensions', code: 'SY004', costPrice: 120, salePrice: 200, qty: 150, unit: 'bottle' as const },

    // Injections
    { name: 'Diclofenac Injection 75mg', genericName: 'Diclofenac', group: 'Injections', code: 'INJ001', costPrice: 50, salePrice: 100, qty: 200, unit: 'ampoule' as const },
    { name: 'Ceftriaxone 1g Injection', genericName: 'Ceftriaxone', group: 'Injections', code: 'INJ002', costPrice: 180, salePrice: 280, qty: 100, unit: 'vial' as const },
    { name: 'Insulin Mixtard 70/30', genericName: 'Insulin Human', group: 'Injections', code: 'INJ003', costPrice: 800, salePrice: 1100, qty: 50, unit: 'vial' as const },

    // Creams
    { name: 'Fusidic Acid Cream (Fucidin)', genericName: 'Fusidic Acid', group: 'Creams & Ointments', code: 'CR001', costPrice: 200, salePrice: 320, qty: 100, unit: 'tube' as const },
    { name: 'Betamethasone Cream (Betnovate)', genericName: 'Betamethasone', group: 'Creams & Ointments', code: 'CR002', costPrice: 150, salePrice: 250, qty: 120, unit: 'tube' as const },
    { name: 'Clotrimazole Cream (Canesten)', genericName: 'Clotrimazole', group: 'Creams & Ointments', code: 'CR003', costPrice: 100, salePrice: 180, qty: 80, unit: 'tube' as const },

    // Drops
    { name: 'Tobramycin Eye Drops (Tobrex)', genericName: 'Tobramycin', group: 'Eye Drops', code: 'ED001', costPrice: 250, salePrice: 380, qty: 80, unit: 'bottle' as const },
    { name: 'Artificial Tears (Refresh)', genericName: 'CMC', group: 'Eye Drops', code: 'ED002', costPrice: 300, salePrice: 450, qty: 100, unit: 'bottle' as const },
    { name: 'Ofloxacin Ear Drops', genericName: 'Ofloxacin', group: 'Ear Drops', code: 'ED003', costPrice: 150, salePrice: 250, qty: 60, unit: 'bottle' as const },
    { name: 'Xylometazoline Nasal Spray (Otrivin)', genericName: 'Xylometazoline', group: 'Nasal Drops', code: 'ND001', costPrice: 180, salePrice: 280, qty: 100, unit: 'bottle' as const },

    // Inhalers
    { name: 'Salbutamol Inhaler (Ventolin)', genericName: 'Salbutamol', group: 'Inhalers', code: 'IH001', costPrice: 300, salePrice: 450, qty: 80, unit: 'piece' as const },
    { name: 'Budesonide Inhaler (Pulmicort)', genericName: 'Budesonide', group: 'Inhalers', code: 'IH002', costPrice: 600, salePrice: 850, qty: 50, unit: 'piece' as const },

    // OTC
    { name: 'ORS Sachets', genericName: 'ORS', group: 'OTC / General', code: 'OTC001', costPrice: 15, salePrice: 25, qty: 500, unit: 'sachet' as const },
    { name: 'Multivitamin Tablets', genericName: 'Multivitamin', group: 'OTC / General', code: 'OTC002', costPrice: 200, salePrice: 350, qty: 200, unit: 'strip' as const },
    { name: 'Calcium + Vitamin D Tablets', genericName: 'Calcium Carbonate', group: 'OTC / General', code: 'OTC003', costPrice: 250, salePrice: 400, qty: 150, unit: 'strip' as const },
    { name: 'Zinc Tablets 20mg', genericName: 'Zinc Sulfate', group: 'OTC / General', code: 'OTC004', costPrice: 100, salePrice: 180, qty: 200, unit: 'strip' as const },

    // Surgical
    { name: 'Surgical Gloves (Pair)', genericName: 'Latex Gloves', group: 'Surgical & Dressings', code: 'SG001', costPrice: 20, salePrice: 40, qty: 1000, unit: 'piece' as const },
    { name: 'Bandage Roll 4"', genericName: 'Cotton Bandage', group: 'Surgical & Dressings', code: 'SG002', costPrice: 30, salePrice: 60, qty: 300, unit: 'piece' as const },
    { name: 'Surgical Tape 1"', genericName: 'Micropore Tape', group: 'Surgical & Dressings', code: 'SG003', costPrice: 50, salePrice: 90, qty: 200, unit: 'piece' as const },

    // Medical Devices
    { name: 'Digital Thermometer', genericName: 'Thermometer', group: 'Medical Devices', code: 'MD001', costPrice: 200, salePrice: 400, qty: 50, unit: 'piece' as const },
    { name: 'BP Monitor (Digital)', genericName: 'Sphygmomanometer', group: 'Medical Devices', code: 'MD002', costPrice: 2000, salePrice: 3500, qty: 20, unit: 'piece' as const },
    { name: 'Pulse Oximeter', genericName: 'Pulse Oximeter', group: 'Medical Devices', code: 'MD003', costPrice: 1500, salePrice: 2800, qty: 30, unit: 'piece' as const },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { code: p.code } });
    if (existing) continue;

    await prisma.product.create({
      data: {
        name: p.name,
        genericName: p.genericName,
        groupId: groupMap[p.group] || null,
        code: p.code,
        costPrice: p.costPrice,
        salePrice: p.salePrice,
        quantityOnHand: p.qty,
        unit: p.unit,
      },
    });
  }

  console.log('Products seeded');

  // ─── SAMPLE PATIENTS ────────────────────────────────────────

  const patients = [
    { mrNumber: 'MR-2026-00001', firstName: 'Ahmad', lastName: 'Khan', phone: '0300-1234567', gender: 'male' as const, bloodGroup: 'B+', cnic: '42101-1234567-1', dateOfBirth: new Date('1981-03-15'), ailments: ['cardiac', 'diabetic'], allergies: 'Penicillin' },
    { mrNumber: 'MR-2026-00002', firstName: 'Fatima', lastName: 'Bibi', phone: '0321-2345678', gender: 'female' as const, bloodGroup: 'A+', cnic: '42101-2345678-2', dateOfBirth: new Date('1975-07-22'), ailments: ['hypertensive'], allergies: null },
    { mrNumber: 'MR-2026-00003', firstName: 'Usman', lastName: 'Ali', phone: '0333-3456789', gender: 'male' as const, bloodGroup: 'O+', cnic: '42101-3456789-3', dateOfBirth: new Date('1990-11-08'), ailments: ['cardiac'], allergies: 'Sulfa drugs' },
    { mrNumber: 'MR-2026-00004', firstName: 'Saima', lastName: 'Noor', phone: '0345-4567890', gender: 'female' as const, bloodGroup: 'AB+', dateOfBirth: new Date('1988-04-30'), ailments: ['asthmatic', 'thyroid'], allergies: null },
    { mrNumber: 'MR-2026-00005', firstName: 'Ali', lastName: 'Raza', phone: '0311-5678901', gender: 'male' as const, bloodGroup: 'A-', dateOfBirth: new Date('1965-01-12'), ailments: ['diabetic', 'hypertensive', 'cardiac'], allergies: 'NSAIDs' },
    { mrNumber: 'MR-2026-00006', firstName: 'Zainab', lastName: 'Hassan', phone: '0322-6789012', gender: 'female' as const, bloodGroup: 'B-', dateOfBirth: new Date('1995-09-18'), ailments: [], allergies: null },
    { mrNumber: 'MR-2026-00007', firstName: 'Bilal', lastName: 'Ahmed', phone: '0334-7890123', gender: 'male' as const, bloodGroup: 'O-', dateOfBirth: new Date('2000-06-25'), ailments: ['epilepsy'], allergies: 'Aspirin' },
    { mrNumber: 'MR-2026-00008', firstName: 'Nadia', lastName: 'Parveen', phone: '0346-8901234', gender: 'female' as const, bloodGroup: 'A+', dateOfBirth: new Date('1970-12-03'), ailments: ['hepatitis', 'diabetic'], allergies: null },
    { mrNumber: 'MR-2026-00009', firstName: 'Hassan', lastName: 'Mahmood', phone: '0312-9012345', gender: 'male' as const, bloodGroup: 'AB-', dateOfBirth: new Date('1985-08-14'), ailments: ['renal'], allergies: 'Iodine' },
    { mrNumber: 'MR-2026-00010', firstName: 'Ayesha', lastName: 'Siddiqui', phone: '0323-0123456', gender: 'female' as const, bloodGroup: 'O+', dateOfBirth: new Date('1992-02-28'), ailments: ['thyroid'], allergies: null },
  ];

  for (const p of patients) {
    const existing = await prisma.patient.findFirst({ where: { mrNumber: p.mrNumber } });
    if (existing) continue;

    await prisma.patient.create({
      data: {
        mrNumber: p.mrNumber,
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        cnic: p.cnic || null,
        dateOfBirth: p.dateOfBirth,
        ailments: p.ailments,
        allergies: p.allergies,
        registeredBy: receptionist.id,
      },
    });
  }

  console.log('Patients seeded');
  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
