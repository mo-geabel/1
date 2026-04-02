'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Search, Download, CheckCircle2, XCircle, MapPin, Loader2, Calendar, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AttendanceList({ initialRecords, eventTitle }: { initialRecords: any[], eventTitle: string }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = initialRecords.filter((record) => {
    const fullName = `${record.participant.name} ${record.participant.surname}`.toLowerCase();
    const email = record.participant.email?.toLowerCase() || '';
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const exportToExcel = () => {
    const dataToExport = initialRecords.map((record) => ({
      'First Name': record.participant.name,
      'Last Name': record.participant.surname,
      'Email': record.participant.email,
      'Phone': record.participant.phone,
      'Registered': record.participant.isRegistered ? 'Yes' : 'No',
      'Check-in Time': new Date(record.timestamp).toLocaleString(),
      'Status': record.status,
      'Latitude': record.latitude,
      'Longitude': record.longitude,
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

        <button 
          onClick={exportToExcel}
          className="flex items-center justify-center gap-3 bg-green-600/10 hover:bg-green-600 text-green-600 hover:text-white border border-green-600/20 px-8 py-4 rounded-2xl font-bold transition-all group active:scale-95 whitespace-nowrap"
        >
          <FileSpreadsheet className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Export to Excel
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-card-bg border border-border-color rounded-[2.5rem] overflow-hidden overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border-color text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold bg-card-bg/20">
              <th className="px-10 py-6">Participant</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6">Registration</th>
              <th className="px-8 py-6">Check-in Time</th>
              <th className="px-8 py-6">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color/50">
            <AnimatePresence mode="popLayout">
              {filteredRecords.map((record, index) => (
                <motion.tr 
                  key={record.id} 
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
                    {record.status === 'VALID' ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        VALID
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <XCircle className="w-3.5 h-3.5" />
                        INVALID
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {record.participant.isRegistered ? (
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10 uppercase tracking-widest">Pre-Reg</span>
                    ) : (
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-500/5 px-2.5 py-1 rounded-lg border border-orange-500/10 uppercase tracking-widest">Walk-in</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-semibold text-foreground/80">
                      {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-gray-500 text-sm">
                    <div className="flex items-center gap-2 group/loc cursor-pointer hover:text-blue-500 transition-colors font-medium">
                      <MapPin className="w-3.5 h-3.5 group-hover/loc:scale-110 transition-transform" />
                      {record.latitude?.toFixed(4)}, {record.longitude?.toFixed(4)}
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
    </div>
  );
}
