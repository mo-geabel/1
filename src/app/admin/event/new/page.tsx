import EventForm from '@/components/EventForm';
import { createEventAction } from '@/actions/event';

export default function NewEventPage() {
  return (
    <EventForm 
      onSubmit={createEventAction}
      title="Schedule New Session"
      subtitle="Event Configuration Portal"
    />
  );
}
