'use server';

import { db } from '@/db';
import { participants } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export async function importParticipantsAction(eventId: string, data: { name: string; surname: string; email: string; phone?: string }[]) {
  try {
    if (!data || data.length === 0) {
      return { error: 'No participant data provided.' };
    }

    // Insert participants. Drizzle's insert().values() can take an array for bulk insertion.
    const values = data.map(p => ({
      eventId,
      name: p.name,
      surname: p.surname,
      email: p.email.toLowerCase().trim(),
      phone: p.phone,
      isRegistered: true, // They are pre-registered by the admin
    }));

    await db.insert(participants).values(values).onConflictDoNothing({
        target: [participants.eventId, participants.email]
    });

    revalidatePath(`/admin/event/${eventId}/attendance`);
    return { success: true, count: data.length };
  } catch (err) {
    console.error('Import participants error:', err);
    return { error: 'Failed to import participants. Please check your data format.' };
  }
}

export async function addParticipantAction(eventId: string, data: { name: string; surname: string; email: string; phone?: string }) {
  try {
    const [newParticipant] = await db.insert(participants).values({
      eventId,
      name: data.name.trim(),
      surname: data.surname.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim(),
      isRegistered: true,
    }).returning();

    revalidatePath(`/admin/event/${eventId}/attendance`);
    return { success: true, participant: newParticipant };
  } catch (err: any) {
    if (err.code === '23505') { // Unique constraint violation
      return { error: 'A participant with this email already exists for this event.' };
    }
    console.error('Add participant error:', err);
    return { error: 'Failed to add participant.' };
  }
}

export async function updateParticipantAction(participantId: string, eventId: string, data: { name: string; surname: string; email: string; phone?: string }) {
  try {
    const [updatedParticipant] = await db.update(participants)
      .set({
        name: data.name.trim(),
        surname: data.surname.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim(),
      })
      .where(eq(participants.id, participantId))
      .returning();

    revalidatePath(`/admin/event/${eventId}/attendance`);
    return { success: true, participant: updatedParticipant };
  } catch (err: any) {
    if (err.code === '23505') {
      return { error: 'Another participant with this email already exists for this event.' };
    }
    console.error('Update participant error:', err);
    return { error: 'Failed to update participant.' };
  }
}

export async function deleteParticipantAction(participantId: string, eventId: string) {
  try {
    await db.delete(participants).where(eq(participants.id, participantId));

    revalidatePath(`/admin/event/${eventId}/attendance`);
    return { success: true };
  } catch (err) {
    console.error('Delete participant error:', err);
    return { error: 'Failed to delete participant.' };
  }
}
