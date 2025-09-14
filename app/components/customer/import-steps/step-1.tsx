import Image from "next/image";
import { useRef, useState } from "react";
import AnimatedProgressBar from "../../ui/animated-progress-bar";
import { parseXLSX, ParsedData } from "../../../../lib/xlsx-parser";
import { suggestMapping, AIMappingResult } from "../../../../lib/ai-mapping";
import { CORE_FIELDS, CUSTOM_FIELDS } from "../../../../lib/firebase-service";

interface MappedContact {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  agentUid?: string;
  createdOn?: Date;
  [key: string]: string | Date | undefined; // For custom fields
}

interface Step1Props {
  onMappingComplete?: (mappedContacts: MappedContact[], mapping: AIMappingResult, confidenceScores?: Record<string, { isEmail: boolean; isPhone: boolean; isDate: boolean; isNumber: boolean; confidence: number }>) => void;
}

export default function Step1({ onMappingComplete }: Step1Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [done, setDone] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  const handlePickFile = () => fileInputRef.current?.click();
  const processFile = async (file: File) => {
    try {
      setError(null);
      setDetecting(true);
      setDone(false);
      
      // Parse the XLSX file
      const parsedData: ParsedData = await parseXLSX(file);
      console.log('Parsed data:', parsedData);
      
      // Prepare sample data for AI analysis (first 3 rows)
      const sampleData: Record<string, string[]> = {};
      parsedData.headers.forEach(header => {
        sampleData[header] = parsedData.rows.slice(0, 3).map(row => row[header] || '');
      });
      
      // Get AI mapping suggestions
      const mappingResponse = await suggestMapping(parsedData.headers, sampleData);
      const mapping = mappingResponse.mapping;
      console.log('AI mapping result:', mapping);
      
      // Transform data into mapped contacts
      const mappedContacts: MappedContact[] = parsedData.rows.map(row => {
        const contact: MappedContact = {
          createdOn: new Date(),
        };
        
        // Map each column to its corresponding field
        Object.entries(mapping).forEach(([header, fieldName]) => {
          const value = row[header];
          if (value && value.trim()) {
            if (fieldName === 'custom') {
              // Handle custom fields
              contact[header] = value;
            } else if (fieldName === 'createdOn') {
              // Handle createdOn field specially - convert to Date
              const dateValue = new Date(value);
              if (!isNaN(dateValue.getTime())) {
                contact[fieldName] = dateValue;
              }
            } else if (CORE_FIELDS.includes(fieldName) || CUSTOM_FIELDS.includes(fieldName)) {
              // Handle other system fields
              contact[fieldName] = value;
            }
          }
        });
        
        return contact;
      });
      
      console.log('Mapped contacts:', mappedContacts);
      
      // Call the completion callback if provided
      if (onMappingComplete) {
        onMappingComplete(mappedContacts, mapping, mappingResponse.confidence);
      }
      
      setDone(true);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setDetecting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      processFile(file);
    }
  };
  return (
    <div className="">
      {!detecting && (
        <>
          <h2 className="text-[#0E4259] text-[18px] font-semibold">Import Spreadsheet</h2>
          <p className="text-[#68818C] text-[16px]">Upload a .xlsx or .csv file to begin.</p>
          <div className="mt-[24px] h-[540px] flex items-center justify-center">
            <div className="flex items-center justify-center  flex-col gap-[16px] w-full max-w-[640px]">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={handlePickFile}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    if (fileInputRef.current) fileInputRef.current.files = dt.files;
                    setFileName(file.name);
                    processFile(file);
                  }
                }}
                className="w-full cursor-pointer border-2 border-dashed border-[#0E4259] hover:border-[#0E4259] transition-colors rounded-[16px] bg-white p-[24px] flex flex-col items-center justify-center text-center gap-[12px]"
              >
                <Image src="/file.svg" alt="file" width={40} height={40} className="opacity-60" />
                <div className="text-[#0E4259] text-[16px] font-medium">Drag and drop your .xlsx or .csv file here</div>
                <div className="text-[#6B7280] text-[14px]">or</div>
                <button
                  type="button"
                  className="px-[14px] py-[8px] rounded-[8px] bg-[#0E4259] text-white text-[14px]"
                >
                  Browse file
                </button>
                {fileName && <div className="text-[13px] text-[#596A72] mt-[4px]">Selected: {fileName}</div>}
              </div>
              <div className="text-[12px] text-[#6B7280]">Only .xlsx and .csv files are supported</div>
            </div>
          </div>
        </>
      )}

      {detecting && (
        <>
          <h2 className="text-[#0E4259] text-[18px] font-semibold">AI Column Detection...</h2>
          <p className="text-[#68818C] text-[16px]">Analyzing columns and matching with CRM fields using AI...</p>

          <div className="mt-[24px] h-[540px] flex items-center justify-center">
            <div className="flex items-center justify-center  flex-col ">
              <div className="items-center justify-center flex flex-col">
                <div className="relative ">
                  <div
                    className="w-[300px] md:w-[480px]  h-[178px] bg-cover bg-center bg-no-repeat mb-6 mask-radial-[35%_45%] mask-radial-from-35% mask-radial-at-center"
                    style={{
                      backgroundImage: 'url(/assets/state-illustration.png)',
                    }}
                  ></div>

                  <Image
                    src="/assets/blur.png"
                    alt="blur"
                    width={514}
                    height={148}
                    className=" absolute top-[-60] right-[40] z-10 opacity-25"
                  />
                </div>

                <h1 className="text-[#5883C9] text-[18px] md:text-[20px] font-medium">Auto Detecting Field Mapping...</h1>
                <p className="text-[#7782AD] text-[14px] md:text-[18px]  text-center">Matching spreadsheets columns to CRM fields using intelligent pattern recognition...</p>
              </div>
              <AnimatedProgressBar 
                autoStart 
                durationMs={3000} 
                onComplete={() => {
                  if (!error) {
                    setDone(true);
                  }
                }} 
              />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">Error: {error}</p>
                  <button 
                    onClick={() => {
                      setError(null);
                      setDetecting(false);
                      setFileName(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
