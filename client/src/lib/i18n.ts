export type Language = 'en' | 'ur';

interface TranslationMap {
  [key: string]: { en: string; ur: string };
}

const translations: TranslationMap = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ur: 'ڈیش بورڈ' },
  'nav.patients': { en: 'Patients', ur: 'مریض' },
  'nav.appointments': { en: 'Appointments', ur: 'اپائنٹمنٹ' },
  'nav.prescriptions': { en: 'Prescriptions', ur: 'نسخے' },
  'nav.lab_results': { en: 'Lab Results', ur: 'لیب رپورٹ' },
  'nav.opd_queue': { en: 'OPD Queue', ur: 'او پی ڈی قطار' },
  'nav.register_patient': { en: 'Register Patient', ur: 'مریض رجسٹریشن' },
  'nav.billing': { en: 'Billing', ur: 'بلنگ' },
  'nav.pharmacy': { en: 'Pharmacy', ur: 'فارمیسی' },
  'nav.schedule': { en: 'Schedule', ur: 'شیڈول' },
  'nav.messages': { en: 'Messages', ur: 'پیغامات' },
  'nav.patient_search': { en: 'Patient Search', ur: 'مریض تلاش' },
  'nav.billing_cashier': { en: 'Billing / Cashier', ur: 'بلنگ / کیشیر' },
  'nav.payment_history': { en: 'Payment History', ur: 'ادائیگی کی تاریخ' },
  'nav.my_appointments': { en: 'My Appointments', ur: 'میری اپائنٹمنٹ' },
  'nav.patient_records': { en: 'Patient Records', ur: 'مریض کا ریکارڈ' },
  'nav.patient_timeline': { en: 'Patient Timeline', ur: 'مریض کی ٹائم لائن' },
  'nav.sms_notifications': { en: 'SMS Notifications', ur: 'ایس ایم ایس اطلاعات' },
  'nav.today_appointments': { en: "Today's Appointments", ur: 'آج کی اپائنٹمنٹ' },
  // Common actions
  'action.save': { en: 'Save', ur: 'محفوظ کریں' },
  'action.cancel': { en: 'Cancel', ur: 'منسوخ' },
  'action.confirm': { en: 'Confirm', ur: 'تصدیق' },
  'action.search': { en: 'Search', ur: 'تلاش' },
  'action.print': { en: 'Print', ur: 'پرنٹ' },
  'action.add': { en: 'Add', ur: 'شامل کریں' },
  'action.edit': { en: 'Edit', ur: 'ترمیم' },
  'action.delete': { en: 'Delete', ur: 'حذف' },
  'action.close': { en: 'Close', ur: 'بند' },
  'action.submit': { en: 'Submit', ur: 'جمع کروائیں' },
  'action.register': { en: 'Register', ur: 'رجسٹر' },
  'action.view': { en: 'View', ur: 'دیکھیں' },
  'action.download': { en: 'Download', ur: 'ڈاؤنلوڈ' },
  // Patient registration
  'patient.name': { en: 'Full Name', ur: 'پورا نام' },
  'patient.phone': { en: 'Phone Number', ur: 'فون نمبر' },
  'patient.cnic': { en: 'CNIC', ur: 'شناختی کارڈ' },
  'patient.age': { en: 'Age', ur: 'عمر' },
  'patient.gender': { en: 'Gender', ur: 'جنس' },
  'patient.blood_group': { en: 'Blood Group', ur: 'خون کا گروپ' },
  'patient.address': { en: 'Address', ur: 'پتہ' },
  'patient.department': { en: 'Department', ur: 'محکمہ' },
  'patient.doctor': { en: 'Doctor', ur: 'ڈاکٹر' },
  'patient.emergency_contact': { en: 'Emergency Contact', ur: 'ہنگامی رابطہ' },
  'patient.date_of_birth': { en: 'Date of Birth', ur: 'تاریخ پیدائش' },
  'patient.marital_status': { en: 'Marital Status', ur: 'ازدواجی حیثیت' },
  // Status labels
  'status.waiting': { en: 'Waiting', ur: 'انتظار میں' },
  'status.in_progress': { en: 'In Progress', ur: 'جاری' },
  'status.completed': { en: 'Completed', ur: 'مکمل' },
  'status.cancelled': { en: 'Cancelled', ur: 'منسوخ' },
  'status.pending': { en: 'Pending', ur: 'زیر التواء' },
  'status.confirmed': { en: 'Confirmed', ur: 'تصدیق شدہ' },
  // Medical terms
  'medical.diagnosis': { en: 'Diagnosis', ur: 'تشخیص' },
  'medical.prescription': { en: 'Prescription', ur: 'نسخہ' },
  'medical.vitals': { en: 'Vitals', ur: 'جسمانی علامات' },
  'medical.blood_pressure': { en: 'Blood Pressure', ur: 'بلڈ پریشر' },
  'medical.pulse': { en: 'Pulse', ur: 'نبض' },
  'medical.temperature': { en: 'Temperature', ur: 'درجہ حرارت' },
  'medical.weight': { en: 'Weight', ur: 'وزن' },
  'medical.chief_complaint': { en: 'Chief Complaint', ur: 'بنیادی شکایت' },
  'medical.allergies': { en: 'Allergies', ur: 'الرجی' },
  'medical.spo2': { en: 'SpO2', ur: 'آکسیجن سطح' },
  'medical.blood_group': { en: 'Blood Group', ur: 'خون کا گروپ' },
  'medical.conditions': { en: 'Conditions', ur: 'بیماریاں' },
  // OPD Queue
  'opd.queue': { en: 'OPD Queue', ur: 'او پی ڈی قطار' },
  'opd.token': { en: 'Token', ur: 'ٹوکن' },
  'opd.waiting': { en: 'Waiting', ur: 'انتظار' },
  'opd.consult': { en: 'Consult', ur: 'مشاورت' },
  'opd.start_consultation': { en: 'Start Consultation', ur: 'مشاورت شروع کریں' },
  'opd.view_details': { en: 'View Details', ur: 'تفصیل دیکھیں' },
  'opd.urgent': { en: 'Urgent', ur: 'فوری' },
  'opd.arrival_time': { en: 'Arrival Time', ur: 'آمد کا وقت' },
  'opd.wait_time': { en: 'Wait Time', ur: 'انتظار کا وقت' },
  'opd.patient_info': { en: 'Patient Information', ur: 'مریض کی معلومات' },
  // Greetings
  'greeting.morning': { en: 'Good morning', ur: 'سویرے کی خیر' },
  'greeting.afternoon': { en: 'Good afternoon', ur: 'دوپہر کی خیر' },
  'greeting.evening': { en: 'Good evening', ur: 'شام کی خیر' },
  // Numbers / units
  'unit.minutes': { en: 'minutes', ur: 'منٹ' },
  'unit.hours': { en: 'hours', ur: 'گھنٹے' },
  'unit.days': { en: 'days', ur: 'دن' },
  // Pharmacy specific
  'pharmacy.pos': { en: 'Point of Sale', ur: 'فروخت مقام' },
  'pharmacy.stock': { en: 'Stock', ur: 'ذخیرہ' },
  'pharmacy.products': { en: 'Products', ur: 'مصنوعات' },
  'pharmacy.receipt': { en: 'Receipt', ur: 'رسید' },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] ?? key;
}

export { translations };
