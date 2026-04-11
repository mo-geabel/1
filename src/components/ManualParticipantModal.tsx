'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Loader2, Save, Trash2, AlertCircle } from 'lucide-react';
import { addParticipantAction, updateParticipantAction, deleteParticipantAction } from '@/actions/participants';
import { toast } from 'react-hot-toast';
import { useLanguage } from './LanguageContext';

interface ManualParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  participant?: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone?: string | null;
  };
  mode: 'add' | 'edit' | 'delete';
}

export default function ManualParticipantModal({ isOpen, onClose, eventId, participant, mode }: ManualParticipantModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (participant && mode === 'edit') {
      setFormData({
        name: participant.name,
        surname: participant.surname,
        email: participant.email,
        phone: participant.phone || '',
      });
    } else {
      setFormData({
        name: '',
        surname: '',
        email: '',
        phone: '',
      });
    }
  }, [participant, mode, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (mode === 'add') {
        result = await addParticipantAction(eventId, formData);
      } else if (mode === 'edit' && participant) {
        result = await updateParticipantAction(participant.id, eventId, formData);
      }

      if (result?.success) {
        toast.success(mode === 'add' ? t('participant_added') : t('participant_updated'));
        onClose();
      } else {
        setError(result?.error || t('error_occurred'));
      }
    } catch (err) {
      setError(t('failed_save_participant'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!participant) return;
    setLoading(true);
    setError(null);
    try {
      const result = await deleteParticipantAction(participant.id, eventId);
      if (result.success) {
        toast.success(t('participant_deleted'));
        onClose();
      } else {
        setError(result.error || t('failed_delete'));
      }
    } catch (err) {
      setError(t('failed_delete_participant'));
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'delete') {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card-bg border border-border-color rounded-3xl shadow-2xl overflow-hidden p-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t('delete_participant_q')}</h2>
                <p className="text-gray-500 text-sm">
                  {t('delete_participant_confirm')} <span className="font-bold text-foreground">{participant?.name} {participant?.surname}</span>? {t('delete_associated_data')}
                </p>
                {error && (
                  <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                    {error}
                  </div>
                )}
                <div className="w-full flex gap-4 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 rounded-xl font-bold text-gray-500 border border-border-color hover:bg-gray-500/5 transition-all text-xs uppercase tracking-widest"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold text-white transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('delete_item')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-card-bg border border-border-color rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-border-color flex justify-between items-center bg-card-bg/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {mode === 'add' ? t('add_participant') : t('update_participant')}
                  </h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{t('enter_details')}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] pl-1">{t('first_name')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John"
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border-color rounded-xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-sm shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] pl-1">{t('last_name')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      name="surname"
                      required
                      value={formData.surname}
                      onChange={handleChange}
                      placeholder="e.g. Doe"
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border-color rounded-xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-sm shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] pl-1">{t('email_label')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john@safespeech.com.tr"
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border-color rounded-xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-sm shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">{t('phone_label')} ({t('optional')})</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +90 XXX XXX XX XX"
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border-color rounded-xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-xl font-bold text-gray-500 border border-border-color hover:bg-gray-500/5 transition-all text-xs uppercase tracking-widest"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 bg-primary hover:bg-primary-hover py-4 rounded-xl font-bold text-white transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {mode === 'add' ? t('add_participant') : t('save_details')}</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
