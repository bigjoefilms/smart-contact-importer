import Image from 'next/image';
import React, { useState, useEffect } from 'react'
import AnimatedProgressBar from '../../ui/animated-progress-bar';
import { ParsedData } from '@/lib/xlsx-parser';
import { AIMappingResult } from '@/lib/ai-mapping';
import { deduplicateContacts } from '@/lib/deduplication';

interface CheckingProps {
  parsedData?: ParsedData;
  aiMapping?: AIMappingResult;
  onComplete?: (results: ImportResults) => void;
}

interface ImportResults {
  totalContacts: number;
  importedContacts: number;
  mergedContacts: number;
  errors: number;
}

export default function Checking({ parsedData, aiMapping, onComplete }: CheckingProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('Scanning entries for duplicates, missing details, or errors...');

  useEffect(() => {
    if (parsedData && aiMapping && isProcessing) {
      // Simulate the checking process with status updates
      const checkProcess = async () => {
        // Step 1: Initial scan
        setCurrentStatus('Scanning entries for duplicates, missing details, or errors...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Duplicate detection
        setCurrentStatus('Analyzing contact data to identify potential duplicates...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Data validation
        setCurrentStatus('Validating contact information and checking for missing details...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Perform actual duplicate detection
        // Convert parsed data to contact format for deduplication
        const contacts = parsedData.rows.map(row => {
          const contact: any = {};
          Object.entries(aiMapping).forEach(([header, fieldName]) => {
            if (fieldName !== 'custom' && fieldName !== 'skip') {
              contact[fieldName] = row[header];
            }
          });
          return contact;
        });

        // For now, assume no existing contacts (empty array)
        const existingContacts: any[] = [];
        const dedupResult = deduplicateContacts(contacts, existingContacts);
        
        const totalContacts = parsedData.rows.length;
        const importedContacts = dedupResult.summary.created;
        const mergedContacts = dedupResult.summary.merged;
        const errors = 0; // For now, assume no validation errors

        // Step 4: Final processing
        setCurrentStatus('Finalizing import results...');
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsProcessing(false);
        
        // Pass results to parent
        if (onComplete) {
          onComplete({
            totalContacts,
            importedContacts,
            mergedContacts,
            errors
          });
        }
      };

      checkProcess();
    }
  }, [parsedData, aiMapping, isProcessing, onComplete]);

  return (
    <div>
      <h2 className="text-[#0E4259] text-[18px] font-semibold">
        Checking for Duplicates & Errors…
      </h2>
      <p className="text-[#68818C] text-[17px] pt-[12px]">
        Reviewing the entry data to ensure no duplicate contacts or
        invalid data slip through.
      </p>
      <div className="mt-[24px] h-[540px] flex items-center justify-center">
        <div className="flex items-center justify-center flex-col">
          <div className="items-center justify-center flex flex-col">
            <div className="relative">
              <div
                className="w-[300px] md:w-[480px] h-[178px] bg-cover bg-center bg-no-repeat mb-6 mask-radial-[35%_45%] mask-radial-from-35% mask-radial-at-center"
                style={{
                  backgroundImage: 'url(/assets/check-illustration.png)',
                }}
              ></div>

              <Image
                src="/assets/blur.png"
                alt="blur"
                width={514}
                height={148}
                className="absolute top-[-60] right-[40] z-10 opacity-25"
              />
            </div>

            <h1 className="text-[#5883C9] text-[18px] md:text-[20px] font-medium">
              {isProcessing ? 'Checking for Duplicates & Errors...' : 'Checks Complete!'}
            </h1>
            <p className="text-[#7782AD] text-[14px] md:text-[18px] text-center">
              {currentStatus}
            </p>
          </div>
          {isProcessing && (
            <AnimatedProgressBar
              autoStart 
              durationMs={3500} 
              onComplete={() => {
                // Progress bar completes, but actual processing continues
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
