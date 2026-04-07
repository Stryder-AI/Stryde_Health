import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import {
  UserPlus,
  Phone,
  MapPin,
  Heart,
  Stethoscope,
  AlertTriangle,
  CalendarCheck,
  Zap,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  Printer,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { toast } from '@/components/ui/Toast';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { TokenPrint } from './TokenPrint';
import {
  validateName,
  validatePhone,
  validateCNIC,
  validateAge,
  validateRequired,
  formatPhone,
  formatCNIC,
} from '@/lib/validation';

/* ------------------------------------------------------------------ */
/*  Reference data                                                    */
/* ------------------------------------------------------------------ */

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const bloodGroupOptions = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const departments = [
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'general_medicine', label: 'General Medicine' },
  { value: 'gynecology', label: 'Gynecology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'ent', label: 'ENT' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'urology', label: 'Urology' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
];

const doctorsByDept: Record<string, { value: string; label: string }[]> = {
  cardiology: [
    { value: 'dr_farhan', label: 'Dr. Farhan Sheikh' },
    { value: 'dr_hina', label: 'Dr. Hina Rauf' },
  ],
  general_medicine: [
    { value: 'dr_nadia', label: 'Dr. Nadia Qureshi' },
    { value: 'dr_kamran', label: 'Dr. Kamran Yousaf' },
  ],
  gynecology: [
    { value: 'dr_sana', label: 'Dr. Sana Malik' },
    { value: 'dr_rubina', label: 'Dr. Rubina Begum' },
  ],
  orthopedics: [
    { value: 'dr_asif', label: 'Dr. Asif Javed' },
    { value: 'dr_omer', label: 'Dr. Omer Riaz' },
  ],
  ent: [
    { value: 'dr_imran', label: 'Dr. Imran Aslam' },
  ],
  dermatology: [
    { value: 'dr_anam', label: 'Dr. Anam Zahra' },
  ],
  pediatrics: [
    { value: 'dr_bilal', label: 'Dr. Bilal Ahmed' },
    { value: 'dr_saima', label: 'Dr. Saima Nawaz' },
  ],
  neurology: [
    { value: 'dr_waseem', label: 'Dr. Waseem Akram' },
  ],
  urology: [
    { value: 'dr_shahid', label: 'Dr. Shahid Mehmood' },
  ],
  ophthalmology: [
    { value: 'dr_farah', label: 'Dr. Farah Deeba' },
  ],
};

const priorityOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' },
];

const medicalConditions = [
  'Cardiac', 'Diabetic', 'Hypertensive', 'Asthmatic', 'Thyroid',
  'Hepatitis', 'Renal Disease', 'Epilepsy', 'TB', 'HIV/AIDS',
  'Cancer', 'Pregnant',
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getNextToken(): string {
  const stored = sessionStorage.getItem('stryde-token-counter');
  const current = stored ? parseInt(stored, 10) : 0;
  const next = current + 1;
  sessionStorage.setItem('stryde-token-counter', String(next));
  return `T-${String(next).padStart(3, '0')}`;
}

function generateMR(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MR-${year}${rand}`;
}

interface SuccessData {
  mrNumber: string;
  tokenNumber: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
}

/* ------------------------------------------------------------------ */
/*  Form field errors interface                                       */
/* ------------------------------------------------------------------ */

interface FormErrors {
  firstName?: string;
  lastName?: string;
  gender?: string;
  ageDob?: string;
  phone?: string;
  cnic?: string;
  department?: string;
  doctor?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function RegisterPatient() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [ageDob, setAgeDob] = useState('');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState('');
  const [appointmentType, setAppointmentType] = useState<'walk_in' | 'scheduled'>('walk_in');
  const [checkedConditions, setCheckedConditions] = useState<Record<string, boolean>>({});

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Success screen state
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // Token print state
  const [showToken, setShowToken] = useState(false);
  const [tokenData, setTokenData] = useState({
    tokenNumber: '',
    patientName: '',
    doctorName: '',
    department: '',
    date: '',
  });

  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  const filteredDoctors = useMemo(
    () => (department ? doctorsByDept[department] ?? [] : []),
    [department],
  );

  const toggleCondition = (c: string) =>
    setCheckedConditions((prev) => ({ ...prev, [c]: !prev[c] }));

  const getDoctorLabel = (val: string): string => {
    for (const docs of Object.values(doctorsByDept)) {
      const found = docs.find((d) => d.value === val);
      if (found) return found.label;
    }
    return val;
  };

  const getDeptLabel = (val: string): string => {
    return departments.find((d) => d.value === val)?.label || val;
  };

  /* ---- Validation logic ---- */
  const validateAll = (): FormErrors => {
    const errs: FormErrors = {};

    const fnErr = validateName(firstName, 'First name');
    if (fnErr) errs.firstName = fnErr;

    const lnErr = validateName(lastName, 'Last name');
    if (lnErr) errs.lastName = lnErr;

    const gErr = validateRequired(gender, 'Gender');
    if (gErr) errs.gender = gErr;

    if (quickMode) {
      // In quick mode, ageDob can be age number or date string
      const ageErr = validateAge(ageDob);
      if (ageErr) errs.ageDob = ageErr;
    } else {
      const dobErr = validateRequired(ageDob, 'Date of birth');
      if (dobErr) errs.ageDob = dobErr;
    }

    const phErr = validatePhone(phone);
    if (phErr) errs.phone = phErr;

    if (!quickMode && cnic) {
      const cnicErr = validateCNIC(cnic);
      if (cnicErr) errs.cnic = cnicErr;
    }

    const deptErr = validateRequired(department, 'Department');
    if (deptErr) errs.department = deptErr;

    const docErr = validateRequired(doctor, 'Doctor');
    if (docErr) errs.doctor = docErr;

    return errs;
  };

  /* ---- Field-level real-time validation ---- */
  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const validateField = (field: keyof FormErrors, value: string) => {
    let err: string | null = null;
    switch (field) {
      case 'firstName': err = validateName(value, 'First name'); break;
      case 'lastName': err = validateName(value, 'Last name'); break;
      case 'gender': err = validateRequired(value, 'Gender'); break;
      case 'ageDob':
        err = quickMode ? validateAge(value) : validateRequired(value, 'Date of birth');
        break;
      case 'phone': err = validatePhone(value); break;
      case 'cnic': err = value ? validateCNIC(value) : null; break;
      case 'department': err = validateRequired(value, 'Department'); break;
      case 'doctor': err = validateRequired(value, 'Doctor'); break;
    }
    setErrors((prev) => ({ ...prev, [field]: err ?? undefined }));
  };

  /* ---- Form has any user-entered data ---- */
  const hasFormData =
    firstName.trim() || lastName.trim() || phone || cnic || ageDob || department || doctor;

  /* ---- Reset form ---- */
  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setGender('');
    setAgeDob('');
    setPhone('');
    setCnic('');
    setDepartment('');
    setDoctor('');
    setCheckedConditions({});
    setErrors({});
    setTouched({});
    setSuccessData(null);
  };

  /* ---- Clear form with confirmation ---- */
  const handleClearForm = async () => {
    if (!hasFormData) { resetForm(); return; }
    const ok = await confirm({
      title: 'Clear Form?',
      message: 'All entered data will be lost. Are you sure you want to clear the form?',
      confirmText: 'Clear Form',
      cancelText: 'Keep Data',
      variant: 'warning',
    });
    if (ok) resetForm();
  };

  /* ---- Submit ---- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateAll();
    // Mark all fields as touched
    setTouched({
      firstName: true, lastName: true, gender: true,
      ageDob: true, phone: true, cnic: true,
      department: true, doctor: true,
    });
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the errors before submitting.', 'Validation Error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const token = getNextToken();
      const mr = generateMR();
      const patientName = `${firstName} ${lastName}`.trim() || 'Walk-in Patient';
      const doctorName = getDoctorLabel(doctor);
      const deptName = getDeptLabel(department);
      const date = new Date().toLocaleDateString('en-PK', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      setTokenData({ tokenNumber: token, patientName, doctorName, department: deptName, date });

      setSuccessData({
        mrNumber: mr,
        tokenNumber: token,
        patientName,
        doctorName,
        department: deptName,
        date,
      });
    }, quickMode ? 600 : 1200);
  };

  /* ================================================================ */
  /*  SUCCESS SCREEN                                                  */
  /* ================================================================ */
  if (successData) {
    return (
      <>
        <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
          <div className="glass-elevated rounded-[var(--radius-xl)] p-10 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[var(--primary)] opacity-10 rounded-full blur-3xl pointer-events-none" />

            {/* Animated checkmark */}
            <div className="flex justify-center mb-6 relative">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center success-check-ring">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 success-check-icon" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              Patient Registered Successfully
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-8">
              Appointment created and token generated
            </p>

            {/* Details panel */}
            <div className="bg-[var(--surface)] rounded-[var(--radius-sm)] border border-[var(--surface-border)] p-5 text-left space-y-3 mb-8">
              {[
                { label: 'Patient Name', value: successData.patientName },
                { label: 'MR Number', value: successData.mrNumber },
                { label: 'Token Number', value: successData.tokenNumber },
                { label: 'Department', value: successData.department },
                { label: 'Doctor', value: successData.doctorName },
                { label: 'Date', value: successData.date },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{value}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => setShowToken(true)}
              >
                <Printer className="w-4 h-4" />
                Print Token
              </Button>
              <Button
                variant="primary"
                onClick={resetForm}
              >
                <RefreshCw className="w-4 h-4" />
                Register Another Patient
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/reception/patients')}
              >
                <ClipboardList className="w-4 h-4" />
                View Patient Record
              </Button>
            </div>
          </div>
        </div>

        {/* CSS for success animations */}
        <style>{`
          @keyframes successRing {
            0% { transform: scale(0.6); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes successCheck {
            0% { transform: scale(0) rotate(-45deg); opacity: 0; }
            70% { transform: scale(1.15) rotate(5deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          .success-check-ring {
            animation: successRing 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .success-check-icon {
            animation: successCheck 0.45s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }
        `}</style>

        {/* Token Print Modal */}
        <TokenPrint
          open={showToken}
          onClose={() => setShowToken(false)}
          tokenNumber={tokenData.tokenNumber}
          patientName={tokenData.patientName}
          doctorName={tokenData.doctorName}
          department={tokenData.department}
          date={tokenData.date}
        />
      </>
    );
  }

  /* ================================================================ */
  /*  REGISTRATION FORM                                               */
  /* ================================================================ */
  return (
    <>
      <LoadingOverlay
        visible={loading}
        text={quickMode ? 'Registering patient...' : 'Processing registration...'}
        subtitle="Creating patient record and generating token"
      />
      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-5xl mx-auto">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-[var(--primary)]" />
              Register New Patient
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {quickMode
                ? 'Quick registration for walk-in patients. Minimal fields required.'
                : 'Fill in the patient details below. Fields marked with * are required.'}
            </p>
          </div>

          {/* Registration Mode Toggle */}
          <button
            type="button"
            onClick={() => setQuickMode(!quickMode)}
            className="flex items-center gap-3 px-5 py-3 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all duration-300"
          >
            {quickMode ? (
              <ToggleRight className="w-6 h-6 text-[var(--primary)]" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-[var(--text-tertiary)]" />
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {quickMode ? 'Quick Registration' : 'Full Registration'}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {quickMode ? 'Minimal fields for walk-ins' : 'Complete patient details'}
              </p>
            </div>
            {quickMode && <Zap className="w-4 h-4 text-amber-500" />}
          </button>
        </div>

        {/* ---- Quick Mode Info Banner ---- */}
        {quickMode && (
          <div className="flex items-center gap-3 p-4 rounded-[var(--radius-sm)] bg-[rgba(13,148,136,0.08)] border border-[rgba(13,148,136,0.2)]">
            <Zap className="w-5 h-5 text-[var(--primary)] shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Quick Registration Mode</p>
              <p className="text-xs text-[var(--text-secondary)]">
                MR number will be auto-generated. Only essential fields are shown. You can complete the full registration later.
              </p>
            </div>
          </div>
        )}

        {/* ---- Personal Information ---- */}
        <Card hover={false}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              {quickMode ? 'Basic details only' : 'Basic demographic details of the patient'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <AvatarUpload
                initials={`${firstName} ${lastName}`.trim() || 'PT'}
                size="lg"
                onChange={() => {/* stored in component state as base64 preview */}}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                label="First Name *"
                placeholder="e.g. Muhammad"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (touched.firstName) validateField('firstName', e.target.value);
                }}
                onBlur={() => { markTouched('firstName'); validateField('firstName', firstName); }}
                error={touched.firstName ? errors.firstName : undefined}
                success={touched.firstName && !errors.firstName && firstName.trim().length >= 2}
              />
              <Input
                label="Last Name *"
                placeholder="e.g. Ahmed"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (touched.lastName) validateField('lastName', e.target.value);
                }}
                onBlur={() => { markTouched('lastName'); validateField('lastName', lastName); }}
                error={touched.lastName ? errors.lastName : undefined}
                success={touched.lastName && !errors.lastName && lastName.trim().length >= 2}
              />
              <div>
                <Select
                  label={`${t('patient.gender')} *`}
                  options={genderOptions}
                  placeholder="Select gender"
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    markTouched('gender');
                    validateField('gender', e.target.value);
                  }}
                />
                {touched.gender && errors.gender && (
                  <p className="text-xs text-[var(--danger)] flex items-center gap-1 mt-1.5 animate-fade-in">
                    <span className="inline-block w-3.5 h-3.5 rounded-full bg-[var(--danger)] text-white text-[9px] font-bold leading-[14px] text-center shrink-0">!</span>
                    {errors.gender}
                  </p>
                )}
              </div>

              <Input
                label={quickMode ? 'Age or DOB *' : 'Date of Birth *'}
                type={quickMode ? 'text' : 'date'}
                placeholder={quickMode ? 'e.g. 35' : undefined}
                value={ageDob}
                onChange={(e) => {
                  setAgeDob(e.target.value);
                  if (touched.ageDob) validateField('ageDob', e.target.value);
                }}
                onBlur={() => { markTouched('ageDob'); validateField('ageDob', ageDob); }}
                error={touched.ageDob ? errors.ageDob : undefined}
                success={touched.ageDob && !errors.ageDob && ageDob.length > 0}
                hint={quickMode ? 'Enter age (0-150) or date e.g. 1991-05-20' : undefined}
              />
              <Input
                label={`${t('patient.phone')} *`}
                placeholder="03XX-XXXXXXX"
                icon={<Phone className="w-4 h-4" />}
                value={phone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setPhone(formatted);
                  if (touched.phone) validateField('phone', formatted);
                }}
                onBlur={() => { markTouched('phone'); validateField('phone', phone); }}
                error={touched.phone ? errors.phone : undefined}
                success={touched.phone && !errors.phone && phone.length > 0}
                hint="Format: 03XX-XXXXXXX"
              />

              {!quickMode && (
                <>
                  <Input
                    label={t('patient.cnic')}
                    placeholder="XXXXX-XXXXXXX-X"
                    value={cnic}
                    onChange={(e) => {
                      const formatted = formatCNIC(e.target.value);
                      setCnic(formatted);
                      if (touched.cnic) validateField('cnic', formatted);
                    }}
                    onBlur={() => { markTouched('cnic'); validateField('cnic', cnic); }}
                    error={touched.cnic ? errors.cnic : undefined}
                    success={touched.cnic && !errors.cnic && cnic.length > 0}
                    hint="Format: XXXXX-XXXXXXX-X (13 digits)"
                  />
                  <Select label={t('patient.blood_group')} options={bloodGroupOptions} placeholder="Select" />
                  <div className="md:col-span-2 lg:col-span-3">
                    <Input
                      label={t('patient.address')}
                      placeholder="House #, Street, City"
                      icon={<MapPin className="w-4 h-4" />}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ---- Emergency Contact (full mode only) ---- */}
        {!quickMode && (
          <Card hover={false}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <CardTitle>Emergency Contact</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Contact Name" placeholder="e.g. Ali Raza" />
                <Input
                  label="Contact Phone"
                  placeholder="03XX-XXXXXXX"
                  icon={<Phone className="w-4 h-4" />}
                  hint="Format: 03XX-XXXXXXX"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---- Medical History (full mode only) ---- */}
        {!quickMode && (
          <Card hover={false}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <CardTitle>Medical History</CardTitle>
              </div>
              <CardDescription>Select any known medical conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-5">
                {medicalConditions.map((c) => (
                  <Checkbox
                    key={c}
                    label={c}
                    checked={!!checkedConditions[c]}
                    onChange={() => toggleCondition(c)}
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Other Conditions" placeholder="Specify if any..." />
                <Input label="Known Allergies" placeholder="e.g. Penicillin, Sulfa drugs" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---- Appointment Details ---- */}
        <Card hover={false}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[var(--primary)]" />
              <CardTitle>Appointment Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <Select
                  label="Department *"
                  options={departments}
                  placeholder="Select department"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setDoctor('');
                    markTouched('department');
                    validateField('department', e.target.value);
                  }}
                />
                {touched.department && errors.department && (
                  <p className="text-xs text-[var(--danger)] flex items-center gap-1 mt-1.5 animate-fade-in">
                    <span className="inline-block w-3.5 h-3.5 rounded-full bg-[var(--danger)] text-white text-[9px] font-bold leading-[14px] text-center shrink-0">!</span>
                    {errors.department}
                  </p>
                )}
              </div>
              <div>
                <Select
                  label="Doctor *"
                  options={filteredDoctors}
                  placeholder={department ? 'Select doctor' : 'Select department first'}
                  disabled={!department}
                  value={doctor}
                  onChange={(e) => {
                    setDoctor(e.target.value);
                    markTouched('doctor');
                    validateField('doctor', e.target.value);
                  }}
                />
                {touched.doctor && errors.doctor && (
                  <p className="text-xs text-[var(--danger)] flex items-center gap-1 mt-1.5 animate-fade-in">
                    <span className="inline-block w-3.5 h-3.5 rounded-full bg-[var(--danger)] text-white text-[9px] font-bold leading-[14px] text-center shrink-0">!</span>
                    {errors.doctor}
                  </p>
                )}
              </div>
              {!quickMode && (
                <Select
                  label="Priority"
                  options={priorityOptions}
                  placeholder="Select priority"
                />
              )}

              {/* Appointment type radio — full mode only */}
              {!quickMode && (
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Appointment Type</p>
                  <div className="flex items-center gap-6">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="appointmentType"
                        value="walk_in"
                        checked={appointmentType === 'walk_in'}
                        onChange={() => setAppointmentType('walk_in')}
                        className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <span className="text-sm text-[var(--text-primary)]">Walk-in</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="appointmentType"
                        value="scheduled"
                        checked={appointmentType === 'scheduled'}
                        onChange={() => setAppointmentType('scheduled')}
                        className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <span className="text-sm text-[var(--text-primary)]">Scheduled</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit row */}
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClearForm}
          >
            Clear Form
          </Button>

          {quickMode ? (
            <Button type="submit" variant="glow" size="lg" loading={loading}>
              <Zap className="w-5 h-5" />
              Register &amp; Generate Token
            </Button>
          ) : (
            <Button type="submit" variant="glow" size="lg" loading={loading}>
              <CalendarCheck className="w-5 h-5" />
              Register &amp; Create Appointment
            </Button>
          )}
        </div>
      </form>

      {/* Confirm clear dialog */}
      <ConfirmDialog
        open={confirmState.open}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        loading={confirmState.loading}
      />

      {/* Token Print Modal */}
      <TokenPrint
        open={showToken}
        onClose={() => setShowToken(false)}
        tokenNumber={tokenData.tokenNumber}
        patientName={tokenData.patientName}
        doctorName={tokenData.doctorName}
        department={tokenData.department}
        date={tokenData.date}
      />
    </>
  );
}
