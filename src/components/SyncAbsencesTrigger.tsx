'use client';

import { useEffect, useState } from 'react';
import { syncAbsencesAction } from '@/actions/attendance';
import { toast } from 'react-hot-toast';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function SyncAbsencesTrigger({ eventId, eventDate }: { eventId: string, eventDate: string | Date }) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    async function runSync() {
      const eventBegin = new Date(eventDate);
      const twentyFourHoursAfter = new Date(eventBegin.getTime() + 24 * 60 * 60 * 1000);
      
      // Only sync if 24 hours have passed
      if (new Date() < twentyFourHoursAfter) return;

      setSyncing(true);
      try {
        const result = await syncAbsencesAction(eventId);
        if (result.success) {
          if (result.count && result.count > 0) {
            toast.success(`${result.count} participants marked as absent.`);
          }
          setSynced(true);
        }
      } catch (err) {
        console.error('Sync failed:', err);
      } finally {
        setSyncing(false);
      }
    }

    runSync();
  }, [eventId, eventDate]);

  if (syncing) {
    return (
      <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 bg-blue-500/5 px-3 py-1.5 rounded-full border border-blue-500/10 uppercase tracking-widest animate-pulse">
        <Loader2 className="w-3 h-3 animate-spin" />
        Syncing Absences...
      </div>
    );
  }

  if (synced) {
    return (
      <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 bg-green-500/5 px-3 py-1.5 rounded-full border border-green-500/10 uppercase tracking-widest">
        <CheckCircle2 className="w-3 h-3" />
        Absences Synchronized
      </div>
    );
  }

  return null;
}
