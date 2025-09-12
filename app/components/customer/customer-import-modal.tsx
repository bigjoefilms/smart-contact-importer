"use client";

import { useState } from "react";
import StepIndicator from "../ui/step-indicator";
import Image from "next/image";
import Step3 from "./import-steps/step-3";
import Step2 from "./import-steps/step-2";
import Step1 from "./import-steps/step-1";
import { ParsedData } from "@/lib/xlsx-parser";
import { AIMappingResult } from "@/lib/ai-mapping";
import Checking from "./import-steps/checking";
import FinalCheck from "./import-steps/final-check";
import LoadingSpinner from "../ui/loading-spinner";

interface MappedContact {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  agentUid?: string;
  createdOn?: Date;
  [key: string]: string | Date | undefined; // For custom fields
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CustomerImportModalProps {
  // No props needed for this component
}

const CustomerImportModal: React.FC<CustomerImportModalProps> = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isFinalProcessing, setIsFinalProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [aiMapping, setAiMapping] = useState<AIMappingResult | null>(null);
  const [mappedContacts, setMappedContacts] = useState<MappedContact[]>([]);
  const [importResults, setImportResults] = useState<{
    totalContacts: number;
    importedContacts: number;
    mergedContacts: number;
    errors: number;
  } | null>(null);
  const [isMovingToContacts, setIsMovingToContacts] = useState(false);

  const handleMappingComplete = (contacts: MappedContact[], mapping: AIMappingResult) => {
    setMappedContacts(contacts);
    setAiMapping(mapping);
    
    // Convert mapped contacts back to ParsedData format for compatibility with existing steps
    if (contacts.length > 0) {
      const headers = Object.keys(contacts[0]);
      const rows = contacts.map(contact => {
        const row: Record<string, string> = {};
        Object.entries(contact).forEach(([key, value]) => {
          row[key] = String(value || '');
        });
        return row;
      });
      setParsedData({ headers, rows });
    }
    
    // Auto-advance to step 2 after mapping is complete
    setTimeout(() => {
      setCurrentStep(2);
    }, 1000);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // This is now handled by handleMappingComplete
      return;
    } else if (currentStep === 3) {
      // Start final checks processing simulation
      setIsFinalProcessing(true);
      // Simulate final checks delay (3 seconds)
      setTimeout(() => {
        setIsFinalProcessing(false);
        setCurrentStep(4);
      }, 3000);
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
  };

  const handleMoveToContacts = async () => {
    setIsMovingToContacts(true);
    
    console.log('=== FINAL CONTACTS OUTPUT ===');
    console.log('Total contacts to be imported:', mappedContacts.length);
    console.log('Import Results:', importResults);
    console.log('');
    
    // Log each contact in a structured format similar to seed.js
    mappedContacts.forEach((contact, index) => {
      console.log(`Contact ${index + 1}:`);
      console.log('{');
      console.log(`  firstName: '${contact.firstName || ''}',`);
      console.log(`  lastName: '${contact.lastName || ''}',`);
      console.log(`  phone: '${contact.phone || ''}',`);
      console.log(`  email: '${contact.email || ''}',`);
      console.log(`  agentUid: '${contact.agentUid || ''}',`);
      console.log(`  createdOn: new Date('${contact.createdOn || new Date().toISOString().split('T')[0]}'),`);
      
      // Log custom fields
      const customFields = Object.entries(contact).filter(([key, value]) => 
        !['firstName', 'lastName', 'phone', 'email', 'agentUid', 'createdOn'].includes(key) && value
      );
      
      if (customFields.length > 0) {
        console.log('  // Custom fields');
        customFields.forEach(([key, value]) => {
          if (typeof value === 'string') {
            console.log(`  ${key}: '${value}',`);
          } else {
            console.log(`  ${key}: ${value},`);
          }
        });
      }
      
      console.log('}');
      console.log('');
    });
    
    console.log('=== END FINAL CONTACTS OUTPUT ===');
    
    // Save contacts to database
    try {
      console.log('🚀 Saving contacts to database...');
      
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts: mappedContacts
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`🎉 Successfully saved ${result.savedCount} out of ${result.totalCount} contacts to database!`);
        alert(`Successfully imported ${result.savedCount} contacts to your contacts section!`);
        handleClose();
      } else {
        console.error('❌ Failed to save contacts:', result.error);
        alert(`Failed to save contacts: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Error saving contacts:', error);
      alert('Failed to save contacts. Please try again.');
    } finally {
      setIsMovingToContacts(false);
    }
  };

  return (
    <div className="md:fixed inset-0 flex items-center justify-center z-50 md:h-[100vh] h-full ">
      <div className="bg-white rounded-[12px] shadow-xl max-w-[1032px] w-full flex items-center p-1 ">
        <div className=" border border-[#EEEEEE] rounded-[12px]  md:max-w-[1027px] w-full  relative h-full md:h-[889px]">
          <div className="flex items-center p-[16px] justify-between ">
            <div className="flex gap-[12px] ">
              <Image
                src="/icons/arrow.png"
                alt="Arrow"
                width={47}
                height={47}
              />
              <div className="flex flex-col">
                <h2 className="text-[16px] md:text-[18px] font-semibold   text-[#0C5271]">
                  Move Entry to Contact Section
                </h2>
                <p className="text-[15px] text-[#89A6B2]">Step {currentStep} of 4</p>
              </div>
            </div>

            <div>
              <Image
                src="/icons/button.png"
                alt="dash"
                width={32}
                height={32}
              />
            </div>
          </div>

          <div className="border-[#EEEEEE] border-y px-[24px] py-[20px]">
            <div className="flex md:gap-[107px] items-start md:items-center flex-col md:flex-row gap-[30px] ">
              <StepIndicator
                stepNumber={1}
                title="Detect Fields"
                description="Review data structure"
                isActive={currentStep === 1}
                isCompleted={currentStep > 1 && !isProcessing}
              />

              <StepIndicator
                stepNumber={2}
                title="Map Fields"
                description="Connect to CRM Fields"
                isActive={currentStep === 2 || currentStep === 3}
                isCompleted={currentStep === 4}
              />

              <StepIndicator
                stepNumber={3}
                title="Final Checks"
                description="For Duplicates or Errors"
                isActive={currentStep === 3 && isFinalProcessing}
                isCompleted={currentStep === 4}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="p-[24px] md:h-full h-[100vh] overflow-y-scroll">
            {currentStep === 1 &&  (
              <>
              <Step1 onMappingComplete={handleMappingComplete} />
              </>
            )}
            
            {currentStep === 2 && (
              <>
               <Step2 parsedData={parsedData || undefined} aiMapping={aiMapping || undefined} />
              </>
            )}

            {currentStep === 3 && !isFinalProcessing && (
              <>
                <Step3 parsedData={parsedData || undefined} aiMapping={aiMapping || undefined} />
              </>
            )}
            {currentStep === 3 && isFinalProcessing && (
              <>
               <Checking 
                 parsedData={parsedData || undefined}
                 aiMapping={aiMapping || undefined}
                 onComplete={(results) => {
                   setImportResults(results);
                   setIsFinalProcessing(false);
                   setCurrentStep(4);
                 }} 
               />
              </>
            )}

            {currentStep === 4 && (
              <>
               <FinalCheck results={importResults || undefined}/>
              </>
            )}

          
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-[#EEEEEE] w-full bg-[#FDFDFD] py-[20px] px-[16px] rounded-b-[12px] bottom-0 absolute ">
            <div className="flex items-center justify-between w-full text-[12px] md:text-[16px]">
              <button
                onClick={handleClose}
                className="px-4 py-2 font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <div className="gap-[8px] flex items-center ">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-[8px] px-4 py-2 font-medium text-[#222222] cursor-pointer bg-white rounded-md hover:bg-gray-50 shadow-sm ${
                    currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Image
                    src="/icons/arrow-left.png"
                    alt="left-arrow"
                    width={16}
                    height={16}
                  />
                  Previous
                </button>
                <button
                  onClick={currentStep === 4 ? handleMoveToContacts : handleNext}
                  disabled={
                    isProcessing || isFinalProcessing || isMovingToContacts
                  }
                  className={`flex items-center gap-[8px] ]  px-4 py-2 font-medium text-white cursor-pointer bg-[#0E4259] border border-gray-300 rounded-md hover:opacity-90 ${
                    isProcessing || isFinalProcessing || isMovingToContacts
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isProcessing
                    ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        Processing...
                      </>
                    )
                    : isFinalProcessing
                      ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          Checking...
                        </>
                      )
                    : isMovingToContacts
                      ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          Moving to Contacts...
                        </>
                      )
                    : currentStep === 4
                      ? "Move to Contacts"
                      : "Next"}
                  {!isProcessing && !isFinalProcessing && !isMovingToContacts && currentStep !== 4 && (
                    <Image
                      src="/icons/arrow-right.png"
                      alt="right-arrow"
                      width={16}
                      height={16}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerImportModal;
