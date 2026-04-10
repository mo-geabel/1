'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Search, Download, CheckCircle2, XCircle, MapPin, Loader2, Calendar, FileSpreadsheet, Users, AlertCircle, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ManualParticipantModal from './ManualParticipantModal';

export default function AttendanceList({ initialRecords, eventTitle, eventId }: { initialRecords: any[], eventTitle: string, eventId: string }) {
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
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="relative flex-1 max-w-md group font-medium">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search participants by name or email..."
            className="w-full pl-12 pr-4 py-4 bg-card-bg border border-border-color rounded-2xl text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <button 
            onClick={openAddModal}
            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all group active:scale-95 whitespace-nowrap shadow-lg shadow-blue-600/20"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Add Participant
          </button>

          <button 
            onClick={exportToExcel}
            className="flex items-center justify-center gap-3 bg-green-600/10 hover:bg-green-600 text-green-600 hover:text-white border border-green-600/20 px-8 py-4 rounded-2xl font-bold transition-all group active:scale-95 whitespace-nowrap"
          >
            <FileSpreadsheet className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card-bg border border-border-color rounded-[2.5rem] overflow-hidden overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border-color text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold bg-card-bg/20">
              <th className="px-10 py-6">Participant</th>
              <th className="px-8 py-6">Phone</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6">Check-in Time</th>
              <th className="px-8 py-6 text-center">Actions</th>
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
                  className="hover:bg-blue-500/2 transition-colors group"
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-card-bg flex items-center justify-center text-blue-500 font-bold border border-border-color group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all shadow-sm">
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
                          PRESENT
                        </div>
                      ) : record.status === 'EXTRA' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <Users className="w-3.5 h-3.5" />
                          PRESENT
                        </div>
                      ) : record.status === 'ABSENT' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-500/10 text-gray-500 border border-gray-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <XCircle className="w-3.5 h-3.5" />
                          ABSENT
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
                        ABSENT
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {record.timestamp ? (
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
                        className="p-2.5 rounded-xl bg-blue-500/5 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/10 transition-all active:scale-90"
                        title="Edit Participant"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(record.participant)}
                        className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/10 transition-all active:scale-90"
                        title="Delete Participant"
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

        {filteredRecords.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-card-bg/50 border border-border-color rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-500">No records found</h3>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-[250px] mx-auto">Try adjusting your search filters or checking and different event.</p>
          </div>
        )}
      </div>

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
