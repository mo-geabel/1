import { db } from '@/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import EventForm from '@/components/EventForm';
import { updateEventAction } from '@/actions/event';
import { getTranslations } from '@/lib/translations';
import { cookies } from 'next/headers';

export default async function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  const t = (key: string) => getTranslations(locale as 'en' | 'tr')[key as keyof ReturnType<typeof getTranslations>] || key;

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
      title={t('update_participant') === 'Katılımcıyı Güncelle' ? 'Oturum Detaylarını Düzenle' : 'Adjust Session Details'}
      subtitle={t('update_participant') === 'Katılımcıyı Güncelle' ? 'Mevcut oturum parametrelerini ve konumunu değiştirin.' : 'Modify existing session parameters and location.'}
    />
  );
}
