import * as XLSX from 'xlsx';
import * as fs from 'fs';

const participants = [
  { Name: 'Alice', Surname: 'Smith', Email: 'alice@example.com', Phone: '1112223333' },
  { Name: 'Bob', Surname: 'Jones', Email: 'bob@example.com', Phone: '4445556666' },
  { Name: 'Charlie', Surname: 'Brown', Email: 'charlie@example.com', Phone: '7778889999' },
  { 'First Name': 'Diana', 'Last Name': 'Prince', Email: 'diana@example.com', Phone: '0001112222' },
  { Ad: 'Eve', Soyad: 'Online', Mail: 'eve@example.com', Telefon: '3334445555' },
];

function generateExcel() {
  const ws = XLSX.utils.json_to_sheet(participants);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Participants');
  XLSX.writeFile(wb, 'test_participants.xlsx');
  console.log('Generated test_participants.xlsx');
}

function generateCsv() {
  const ws = XLSX.utils.json_to_sheet(participants);
  const csv = XLSX.utils.sheet_to_csv(ws);
  fs.writeFileSync('test_participants.csv', csv);
  console.log('Generated test_participants.csv');
}

generateExcel();
generateCsv();
