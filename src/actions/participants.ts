'use server';

import { db } from '@/db';
import { participants } from '@/db/schema';
import { revalidatePath } from 'next/cache';

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
