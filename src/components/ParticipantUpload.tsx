'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Download, Table } from 'lucide-react';
import * as XLSX from 'xlsx';
import { importParticipantsAction } from '@/actions/participants';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';

interface ParticipantUploadProps {
  eventId: string;
}

export default function ParticipantUpload({ eventId }: ParticipantUploadProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];

        console.log('Raw JSON from file:', json);

        if (!json || json.length === 0) {
          toast.error(t('file_empty_error'));
          setLoading(false);
          return;
        }

        // Expected columns: Name, Surname, Email, Phone
        // Normalizing keys to lowercase for flexible matching
        const formattedData = json.map((row, index) => {
          const keys = Object.keys(row);
          const getVal = (possibleKeys: string[]) => {
            const key = keys.find(k => {
              const normalizedKey = k.toLowerCase().replace(/[\s_]/g, '').trim();
              return possibleKeys.some(pk => {
                const normalizedPk = pk.toLowerCase().replace(/[\s_]/g, '').trim();
                return normalizedKey === normalizedPk || normalizedKey.includes(normalizedPk);
              });
            });
            return key ? row[key] : '';
          };

          const p = {
            name: getVal(['name', 'firstname', 'first', 'ad']),
            surname: getVal(['surname', 'lastname', 'last', 'soyad']),
            email: getVal(['email', 'mail', 'e-mail']),
            phone: getVal(['phone', 'tel', 'mobile', 'telefon', 'gsm'])?.toString() || '',
          };

          console.log(`Row ${index + 1} parsed:`, p);
          return p;
        }).filter(p => p.email && p.email.toString().includes('@'));

        console.log('Formatted participants:', formattedData);

        if (formattedData.length === 0) {
          toast.error(t('no_valid_data_error'));
          setLoading(false);
          return;
        }

        const result = await importParticipantsAction(eventId, formattedData);
        
        if (result.success) {
          toast.success(`${result.count} ${t('import_success_msg')}`);
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          router.refresh();
        } else {
          toast.error(result.error || t('failed_save_participant'));
        }
      } catch (err) {
        console.error('File parsing error:', err);
        toast.error(t('file_read_error'));
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Name: 'John', Surname: 'Doe', Email: 'john@example.com', Phone: '1234567890' },
      { Name: 'Jane', Surname: 'Smith', Email: 'jane@example.com', Phone: '0987654321' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'participant_template.xlsx');
  };

  return (
    <div className="bg-card-bg/40 border border-border-color rounded-[2.5rem] p-5 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-4 md:mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/10 text-primary">
            <Table className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold">{t('bulk_upload_title')}</h3>
            <p className="text-gray-500 text-sm font-medium">{t('bulk_upload_desc')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-4">
        <div 
          className={`flex-1 relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 md:p-6 transition-all cursor-pointer ${file ? 'border-primary/50 bg-primary/5' : 'border-border-color hover:border-gray-400'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          {file ? (
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                <p className="text-[10px] text-gray-500 uppercase font-black">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-300" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('drag_drop_text')}</p>
            </div>
          )}
        </div>

        <button
          onClick={processFile}
          disabled={!file || loading}
          className="sm:w-48 bg-primary hover:bg-primary-hover disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-bold rounded-2xl py-4 sm:py-0 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs uppercase tracking-widest">{t('importing_button')}</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              {t('import_button')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
