'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import z from 'zod';

const appointmentSchema = z.object({
  tutorName: z.string(),
  petName: z.string(),
  phone: z.string(),
  description: z.string(),
  scheduleAt: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof String) {
      const d = new Date(arg as string);
      return isNaN(d.getTime()) ? arg : d;
    }
    return arg;
  }, z.date()),
});

type AppointmentData = z.infer<typeof appointmentSchema>;

export async function createAppointment(data: AppointmentData) {
  try {
    const parsedData = appointmentSchema.parse(data);

    const { scheduleAt } = parsedData;
    const hour = scheduleAt.getHours();

    const isMorning = hour >= 9 && hour < 12;
    const isAfternoon = hour >= 13 && hour < 18;
    const isEvening = hour >= 19 && hour < 21;

    if (!isMorning && !isAfternoon && !isEvening) {
      return {
        error:
          'Agendamentos só podem ser feitos entre 9h-12h, 13h-18h ou 19h-21h.',
      };
    }

    const existingAppointments = await prisma.appointment.findFirst({
      where: {
        scheduledAt: scheduleAt,
      },
    });

    if (existingAppointments) {
      return {
        error: 'Já existe um agendamento para este horário.',
      };
    }

    const created = await prisma.appointment.create({
      data: {
        tutorName: parsedData.tutorName,
        petName: parsedData.petName,
        phone: parsedData.phone,
        description: parsedData.description,
        scheduledAt: scheduleAt,
      },
    });

    revalidatePath('/');

    return { success: true, appointment: created };
  } catch (error) {
    const e: any = error;
    console.error('createAppointment error:', e);

    if (e?.issues) {
      return { error: e.issues.map((i: any) => i.message).join(', ') };
    }

    return { error: 'Erro ao criar agendamento.' };
  }
}

export async function updateAppointment(id: string, data: AppointmentData) {
  try {
    const parsedData = appointmentSchema.parse(data);

    const { scheduleAt } = parsedData;
    const hour = scheduleAt.getHours();

    const isMorning = hour >= 9 && hour < 12;
    const isAfternoon = hour >= 13 && hour < 18;
    const isEvening = hour >= 19 && hour < 21;

    if (!isMorning && !isAfternoon && !isEvening) {
      return {
        error:
          'Agendamentos só podem ser feitos entre 9h-12h, 13h-18h ou 19h-21h.',
      };
    }

    const existingAppointments = await prisma.appointment.findFirst({
      where: {
        scheduledAt: scheduleAt,
        id: {
          not: id,
        },
      },
    });

    if (existingAppointments) {
      return {
        error: 'Já existe um agendamento para este horário.',
      };
    }

    await prisma.appointment.update({
      where: {
        id,
      },
      data: {
        tutorName: parsedData.tutorName,
        petName: parsedData.petName,
        phone: parsedData.phone,
        description: parsedData.description,
        scheduledAt: scheduleAt,
      },
    });

    revalidatePath('/');
  } catch (error) {
    const e: any = error;
    console.error('updateAppointment error:', e);

    if (e?.issues) {
      return { error: e.issues.map((i: any) => i.message).join(', ') };
    }

    return { error: 'Erro ao atualizar agendamento.' };
  }
}

export async function deleteAppointment(id: string) {
  try {
    const existingAppointments = await prisma.appointment.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAppointments) {
      return {
        error:
          'Não foi possível localizar o agendamento. Por favor verifique novamente',
      };
    }

    await prisma.appointment.delete({
      where: {
        id,
      },
    });

    revalidatePath('/');
  } catch (error) {
    const e: any = error;
    console.error('deleteAppointment error:', e);
    return { error: 'Erro ao deletar agendamento. Tente novamente' };
  }
}
