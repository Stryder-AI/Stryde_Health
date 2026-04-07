import { AppointmentCalendar } from '@/features/shared/AppointmentCalendar';

export default function DoctorSchedule() {
  return (
    <AppointmentCalendar
      title="My Schedule"
      subtitle="Dr. Tariq Ahmed · Cardiologist"
      filterDoctorId="dr_tariq"
    />
  );
}
