'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Type, AlignLeft, Target, Loader2, Save, Map as MapIcon } from 'lucide-react';
import { createEventAction } from '@/actions/event';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createEventAction(formData);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to create event.');
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-card-bg border border-border-color rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-border-color flex justify-between items-center bg-card-bg/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Create New Event</h2>
                  <p className="text-gray-500 text-sm">Fill in the local session details.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form action={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Title */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Event Title</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Type className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      name="title"
                      required
                      placeholder="e.g. Clinical Medicine Workshop"
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border-color rounded-2xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium text-sm shadow-sm"
                    />
                  </div>
                </div>

                {/* Event Description */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Description (Optional)</label>
                  <div className="relative group">
                    <div className="absolute top-4 left-4 flex items-start pointer-events-none">
                      <AlignLeft className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Session goals and topics..."
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border-color rounded-2xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium text-sm shadow-sm resize-none"
                    />
                  </div>
                </div>

                {/* Event Date */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Session Date & Time</label>
                  <input
                    name="date"
                    type="datetime-local"
                    required
                    className="w-full px-4 py-4 bg-background border border-border-color rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium text-sm shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>

                {/* Radius */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Verification Radius (m)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Target className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      name="radius"
                      type="number"
                      defaultValue={200}
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border-color rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium text-sm shadow-sm"
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Latitude</label>
                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 41.0082"
                    className="w-full px-4 py-4 bg-background border border-border-color rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium text-sm shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Longitude</label>
                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 28.9784"
                    className="w-full px-4 py-4 bg-background border border-border-color rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium text-sm shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed">
                  {error}
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-500 border border-border-color hover:bg-gray-500/5 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-primary hover:bg-primary-hover py-4 rounded-2xl font-bold text-white transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Session</>}
                </button>
              </div>
            </form>

            {/* Helper tip */}
            <div className="p-8 bg-primary/5 border-t border-border-color flex items-start gap-3">
              <MapIcon className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-gray-500 text-[10px] leading-relaxed font-medium uppercase tracking-wider">
                Tip: Use Google Maps to find your exact coordinates. Right-click any location on the map to see its Latitude and Longitude.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
