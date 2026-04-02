'use server';

import { db } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function createEventAction(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dateStr = formData.get('date') as string;
    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);
    const radius = parseInt(formData.get('radius') as string) || 200;

    if (!title || !dateStr || isNaN(latitude) || isNaN(longitude)) {
      return { error: 'Please fill in all required fields with valid data.' };
    }

    const eventDate = new Date(dateStr);
    if (isNaN(eventDate.getTime())) {
      return { error: 'Invalid date format.' };
    }

    // Generate a secure random string for QR rotation secret
    const qrSecret = uuidv4();

    await db.insert(events).values({
      title,
      description,
      date: eventDate,
      latitude,
      longitude,
      radius,
      qrSecret,
    });

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Create event error:', err);
    return { error: 'Failed to create event. Please try again.' };
  }
}

export async function updateEventAction(eventId: string, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dateStr = formData.get('date') as string;
    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);
    const radius = parseInt(formData.get('radius') as string) || 200;

    if (!title || !dateStr || isNaN(latitude) || isNaN(longitude)) {
      return { error: 'Please fill in all required fields with valid data.' };
    }

    const eventDate = new Date(dateStr);
    if (isNaN(eventDate.getTime())) {
      return { error: 'Invalid date format.' };
    }

    await db.update(events)
      .set({
        title,
        description,
        date: eventDate,
        latitude,
        longitude,
        radius,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId));

    revalidatePath('/admin/dashboard');
    revalidatePath(`/admin/event/${eventId}/attendance`);
    return { success: true };
  } catch (err) {
    console.error('Update event error:', err);
    return { error: 'Failed to update event.' };
  }
}

export async function deleteEventAction(eventId: string) {
  try {
    await db.delete(events).where(eq(events.id, eventId));
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Delete event error:', err);
    return { error: 'Failed to delete event.' };
  }
}
