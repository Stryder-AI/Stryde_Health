export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  RECEPTIONIST: 'receptionist',
  DOCTOR: 'doctor',
  LAB_TECHNICIAN: 'lab_technician',
  PHARMACIST: 'pharmacist',
} as const;

export const ROLE_HOME_ROUTES: Record<string, string> = {
  super_admin: '/admin',
  receptionist: '/reception',
  doctor: '/doctor',
  lab_technician: '/lab',
  pharmacist: '/pharmacy',
};

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  receptionist: 'Receptionist',
  doctor: 'Doctor',
  lab_technician: 'Lab Technician',
  pharmacist: 'Pharmacist',
};
