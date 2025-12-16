import { PeriodSection } from '@/app/components/period-section';
import { Appointment as AppointmentPrisma } from './generated/prisma/client';
import { groupAppointmentsByPeriod } from '@/app/utils';
import { AppointmentForm } from './components/appointment-form';
import { prisma } from '@/lib/prisma';
import { Button } from './components/ui/button';
import { endOfDay, parseISO, startOfDay } from 'date-fns';
import { DatePicker } from './components/date-picker';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const selectedDate = date ? parseISO(date) : new Date();

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: {
        gte: startOfDay(selectedDate),
        lt: endOfDay(selectedDate),
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  });

  const periods = groupAppointmentsByPeriod(
    appointments as AppointmentPrisma[]
  );

  return (
    <div className="bg-background-primary p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-title-size text-content-primary mb-2">
            Sua Agenda
          </h1>
          <p className="text-paragraph-medium text-content-secondary">
            Aqui você pode ver todos os clientes e serviços agendados para hoje
          </p>
        </div>

        <div className="hidden md:flex items-center  gap-4">
          <DatePicker />
        </div>
      </div>

      <div className="mt-3 mb-8 md:hidden">
        <DatePicker />
      </div>

      <div className="pb-24 md:pb-0">
        {periods.map((period, index) => (
          <PeriodSection key={index} period={period} />
        ))}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center bg-background-tertiary py-[18px] px-6
        md:bottom-6
        md:right-6
        md:left-auto
        md:bg-transparent
        md:w-auto
        md:p-0"
      >
        <AppointmentForm>
          <Button variant="brand">Novo Agendamento</Button>
        </AppointmentForm>
      </div>
    </div>
  );
}
