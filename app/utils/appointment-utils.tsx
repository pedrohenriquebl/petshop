import {
  Appointment,
  AppointmentPeriod,
  AppointmentPeriodDay,
} from '../types/appointments';
import { Appointment as AppointmentPrisma } from '../generated/prisma/client';

export const getPeriod = (hour: number): AppointmentPeriodDay => {
  if (hour >= 9 && hour < 12) return 'morning';
  if (hour >= 13 && hour < 18) return 'afternoon';
  return 'evening';
};

export function groupAppointmentsByPeriod(
  appointments: AppointmentPrisma[]
): AppointmentPeriod[] {
  const transformAppointments: Appointment[] = appointments?.map((apt) => ({
    ...apt,
    time: apt.scheduledAt.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    service: apt.description,
    period: getPeriod(apt.scheduledAt.getHours()),
  }));

  const morningAppointMents = transformAppointments.filter(
    (apt) => apt.period === 'morning'
  );
  const afternoonAppointMents = transformAppointments.filter(
    (apt) => apt.period === 'afternoon'
  );
  const eveningAppointMents = transformAppointments.filter(
    (apt) => apt.period === 'evening'
  );

  return [
    {
      title: 'Manhã',
      type: 'morning' as const,
      timeRange: '09h-12h',
      appointments: morningAppointMents,
    },
    {
      title: 'Tarde',
      type: 'afternoon' as const,
      timeRange: '13h-18h',
      appointments: afternoonAppointMents,
    },
    {
      title: 'Noite',
      type: 'evening' as const,
      timeRange: '19h-21h',
      appointments: eveningAppointMents,
    },
  ];
}
