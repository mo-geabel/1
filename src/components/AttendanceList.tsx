'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Search, Download, CheckCircle2, XCircle, MapPin, Loader2, Calendar, FileSpreadsheet, Users, AlertCircle, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ManualParticipantModal from './ManualParticipantModal';
import { useLanguage } from './LanguageContext';

export default function AttendanceList({ initialRecords, eventTitle, eventId }: { initialRecords: any[], eventTitle: string, eventId: string }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedParticipant(null);
    setIsModalOpen(true);
  };

  const openEditModal = (participant: any) => {
    setModalMode('edit');
    setSelectedParticipant(participant);
    setIsModalOpen(true);
  };

  const openDeleteModal = (participant: any) => {
    setModalMode('delete');
    setSelectedParticipant(participant);
    setIsModalOpen(true);
  };

  const filteredRecords = initialRecords.filter((record) => {
    const fullName = `${record.participant.name} ${record.participant.surname}`.toLowerCase();
    const email = record.participant.email?.toLowerCase() || '';
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const exportToExcel = () => {
    const dataToExport = initialRecords.map((record) => ({
      'Name': `${record.participant.name} ${record.participant.surname}`,
      'Email': record.participant.email,
      'Phone': record.participant.phone,
      'Status': record.id ? (['VALID', 'EXTRA'].includes(record.status) ? 'PRESENT' : record.status) : 'ABSENT',
      'Check-in Time': record.timestamp ? new Date(record.timestamp).toLocaleString() : '---',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `${eventTitle.replace(/\s+/g, '_')}_Attendance.xlsx`);
  };

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col-reverse md:flex-row gap-6 md:items-center justify-between">
        <div className="relative flex-1 max-w-md group font-medium mt-4 md:mt-0">
          <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder={t('search_placeholder')}
            className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-card-bg border border-border-color rounded-xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium text-[13px] md:text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-row justify-between w-full md:w-auto gap-2 md:gap-4 items-center">
          <button 
            onClick={openAddModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-3 bg-primary hover:bg-primary-hover text-white px-2 md:px-8 py-2 md:py-4 rounded-xl font-bold transition-all group active:scale-95 shadow-lg shadow-primary/20 text-[10px] md:text-base"
          >
            <UserPlus className="w-3.5 h-3.5 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            <span className="truncate">{t('add_participant')}</span>
          </button>
 
          <button 
            onClick={exportToExcel}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-3 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 px-2 md:px-8 py-2 md:py-4 rounded-xl font-bold transition-all group active:scale-95 text-[10px] md:text-base"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            <span className="truncate">{t('export_excel')}</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card-bg border border-border-color rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-color text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold bg-card-bg/20">
                <th className="px-10 py-6">{t('participant_label')}</th>
                <th className="px-8 py-6">{t('phone_label')}</th>
                <th className="px-8 py-6">{t('status_label')}</th>
                <th className="px-8 py-6">{t('checkin_time_label')}</th>
                <th className="px-8 py-6 text-center">{t('actions_label')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/50">
              <AnimatePresence mode="popLayout">
                {filteredRecords.map((record, index) => (
                  <motion.tr 
                    key={record.participant.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-primary/5 transition-colors group"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-card-bg flex items-center justify-center text-primary font-bold border border-border-color group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
                          {record.participant.name[0]}{record.participant.surname[0]}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-base">
                            {record.participant.name} {record.participant.surname}
                          </div>
                          <div className="text-gray-500 text-xs font-medium mt-0.5">{record.participant.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-medium text-foreground/80">
                        {record.participant.phone || <span className="text-gray-400 italic text-xs">No phone</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {record.id ? (
                        record.status === 'VALID' ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t('status_present')}
                          </div>
                        ) : record.status === 'EXTRA' ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <Users className="w-3.5 h-3.5" />
                            {t('status_extra')}
                          </div>
                        ) : record.status === 'ABSENT' ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-500/10 text-gray-500 border border-gray-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <XCircle className="w-3.5 h-3.5" />
                            {t('status_absent')}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {record.status}
                          </div>
                        )
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-500/10 text-gray-500 border border-gray-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <XCircle className="w-3.5 h-3.5" />
                          {t('status_absent')}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {record.timestamp && record.id ? (
                        <>
                          <div className="text-sm font-semibold text-foreground/80">
                            {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Waiting...</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openEditModal(record.participant)}
                          className="p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white border border-primary/10 transition-all active:scale-90"
                          title={t('edit_participant')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(record.participant)}
                          className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/10 transition-all active:scale-90"
                          title={t('delete_participant')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRecords.map((record, index) => (
            <motion.div
              key={record.participant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card-bg border border-border-color rounded-2xl p-4 shadow-sm relative group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                    {record.participant.name[0]}{record.participant.surname[0]}
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">
                      {record.participant.name} {record.participant.surname}
                    </div>
                    <div className="text-gray-500 text-[10px] font-medium">{record.participant.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEditModal(record.participant)}
                    className="p-2 rounded-lg bg-primary/5 text-primary active:scale-90 transition-transform"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(record.participant)}
                    className="p-2 rounded-lg bg-red-500/5 text-red-500 active:scale-90 transition-transform"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border-color/50">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{t('status_label')}</span>
                  {record.id ? (
                    record.status === 'VALID' ? (
                      <span className="text-green-500 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {t('status_present')}
                      </span>
                    ) : record.status === 'EXTRA' ? (
                      <span className="text-primary text-[10px] font-bold flex items-center gap-1">
                        <Users className="w-3 h-3" /> {t('status_extra')}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px] font-bold flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> {t('status_absent')}
                      </span>
                    )
                  ) : (
                    <span className="text-gray-400 text-[10px] font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {t('status_absent')}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 items-end text-right">
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{t('checkin_time_label')}</span>
                  <span className="text-[10px] font-bold text-foreground">
                    {record.timestamp && record.id ? (
                      new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    ) : (
                      <span className="text-gray-400 italic">---</span>
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

        {filteredRecords.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-card-bg/50 border border-border-color rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-500">{t('no_records_found')}</h3>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-[250px] mx-auto">{t('no_records_desc')}</p>
          </div>
        )}
      <ManualParticipantModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={eventId}
        mode={modalMode}
        participant={selectedParticipant}
      />
    </div>
  );
}
