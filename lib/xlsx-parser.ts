export interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

import * as XLSX from 'xlsx';

export function parseXLSX(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        let workbook: XLSX.WorkBook;
        
        if (typeof data === 'string') {
          // Handle CSV files
          const lines = data.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('No data found in file'));
            return;
          }

          // Parse CSV format (tab or comma separated)
          const delimiter = data.includes('\t') ? '\t' : ',';
          const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
          const rows = lines.slice(1).map(line => {
            const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
            const rowData: Record<string, string> = {};
            headers.forEach((header, index) => {
              rowData[header] = values[index] || '';
            });
            return rowData;
          }).filter(row => Object.values(row).some(value => value.trim() !== ''));

          resolve({ headers, rows });
        } else {
          // Handle XLSX files
          try {
            workbook = XLSX.read(data, { type: 'binary' });
          } catch (xlsxError) {
            console.error('XLSX parsing error:', xlsxError);
            reject(new Error('Failed to parse XLSX file. Please ensure it\'s a valid Excel file.'));
            return;
          }

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          if (!worksheet) {
            reject(new Error('No data found in the first sheet'));
            return;
          }

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            reject(new Error('No data found in spreadsheet'));
            return;
          }

          // First row as headers
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1).map((row: unknown) => {
            const rowArray = row as (string | number | boolean | null)[];
            const rowData: Record<string, string> = {};
            headers.forEach((header, index) => {
              rowData[header] = String(rowArray[index] || '');
            });
            return rowData;
          }).filter(row => Object.values(row).some(value => value.trim() !== ''));

          resolve({ headers, rows });
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    // Check file extension to determine how to read it
    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
}
