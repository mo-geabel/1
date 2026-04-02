import { db } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import EventForm from '@/components/EventForm';
import { updateEventAction } from '@/actions/event';

export default async function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);

  if (!event) {
    notFound();
  }

  // Wrap the action to pass eventId as a closure
  const handleUpdate = async (formData: FormData) => {
    'use server';
    return updateEventAction(eventId, formData);
  };

  return (
    <EventForm 
      initialData={event}
      onSubmit={handleUpdate}
      title="Adjust Session Details"
      subtitle="Modify existing session parameters and location."
    />
  );
}
