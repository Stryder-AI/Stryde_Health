// Pakistani phone validation: 03XX-XXXXXXX or +923XXXXXXXXX or 03XXXXXXXXX
export const validatePhone = (phone: string): string | null => {
  const cleaned = phone.replace(/[\s-]/g, '');
  const pkMobile = /^(0|\+92)(3\d{9})$/;
  const pkLandline = /^(0|\+92)(\d{9,10})$/;
  if (!phone) return 'Phone number is required';
  if (!pkMobile.test(cleaned) && !pkLandline.test(cleaned))
    return 'Enter a valid Pakistani number (e.g. 0321-1234567)';
  return null;
};

export const validateCNIC = (cnic: string): string | null => {
  const cleaned = cnic.replace(/[-\s]/g, '');
  if (!cnic) return 'CNIC is required';
  if (!/^\d{13}$/.test(cleaned)) return 'CNIC must be 13 digits (XXXXX-XXXXXXX-X)';
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || !value.trim()) return `${fieldName} is required`;
  return null;
};

export const validateAge = (age: string): string | null => {
  const n = parseInt(age);
  if (!age) return 'Age is required';
  if (isNaN(n) || n < 0 || n > 150) return 'Enter a valid age (0-150)';
  return null;
};

export const validateBloodPressure = (systolic: string, diastolic: string): string | null => {
  const s = parseInt(systolic), d = parseInt(diastolic);
  if (isNaN(s) || s < 50 || s > 300) return 'Systolic BP must be 50-300 mmHg';
  if (isNaN(d) || d < 30 || d > 200) return 'Diastolic BP must be 30-200 mmHg';
  if (s <= d) return 'Systolic must be greater than diastolic';
  return null;
};

export const validateTemperature = (temp: string): string | null => {
  const t = parseFloat(temp);
  if (!temp) return null; // optional
  if (isNaN(t) || t < 90 || t > 115) return 'Temperature must be 90-115°F';
  return null;
};

export const validateSpO2 = (spo2: string): string | null => {
  const v = parseInt(spo2);
  if (!spo2) return null; // optional
  if (isNaN(v) || v < 50 || v > 100) return 'SpO2 must be 50-100%';
  return null;
};

export const formatCNIC = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

export const validateName = (name: string, fieldName: string): string | null => {
  if (!name || !name.trim()) return `${fieldName} is required`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.trim().length > 80) return `${fieldName} must be at most 80 characters`;
  return null;
};
