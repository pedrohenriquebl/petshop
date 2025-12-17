import {
  Appointment,
  AppointmentPeriod,
  AppointmentPeriodDay,
} from '../types/appointments';
import { Appointment as AppointmentPrisma } from '@prisma/client';

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
    time: formatDateTime(apt.scheduledAt),
    service: apt.description,
    period: getPeriod(parseInt(formatDateTime(apt.scheduledAt))),
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

export function calculatePeriod(hour: number) {
  const isMorning = hour >= 9 && hour < 12;
  const isAfternoon = hour >= 13 && hour < 18;
  const isEvening = hour >= 19 && hour < 21;

  return {
    isMorning,
    isAfternoon,
    isEvening,
  };
}

export function formatDateTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo',
  });
}
