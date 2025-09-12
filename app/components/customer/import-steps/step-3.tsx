import Image from "next/image";
import { useState, useEffect } from "react";
import { ParsedData } from "@/lib/xlsx-parser";
import { AIMappingResult } from "@/lib/ai-mapping";
import { isCoreField } from "@/lib/data-patterns";
import { CORE_FIELDS, CUSTOM_FIELDS, FIELD_LABELS } from "@/lib/firebase-service";

interface Step3Props {
  parsedData?: ParsedData;
  aiMapping?: AIMappingResult;
}

export default function Step3({ parsedData, aiMapping }: Step3Props) {
  const [currentMapping, setCurrentMapping] = useState<AIMappingResult>(aiMapping || {});
  const [originalMapping, setOriginalMapping] = useState<AIMappingResult>(aiMapping || {});
  const [editingField, setEditingField] = useState<string | null>(null);

  // Update original mapping when aiMapping prop changes
  useEffect(() => {
    if (aiMapping) {
      setOriginalMapping({ ...aiMapping });
      setCurrentMapping({ ...aiMapping });
    }
  }, [aiMapping]);

  if (!parsedData || !aiMapping) {
    return (
      <div className="h-full">
        <h2 className="text-[#0E4259] text-[18px] font-semibold">
          Smart Field Mapping
        </h2>
        <p className="text-[#68818C] text-[17px] pt-[12px]">
          No data available for mapping. Please upload a file first.
        </p>
      </div>
    );
  }

  const handleFieldChange = (header: string, newField: string) => {
    setCurrentMapping(prev => ({
      ...prev,
      [header]: newField
    }));
    setEditingField(null);
  };

  const handleResetField = (header: string) => {
    setCurrentMapping(prev => ({
      ...prev,
      [header]: originalMapping[header]
    }));
  };

  const handleResetToDefault = () => {
    setCurrentMapping({ ...originalMapping });
  };

  const getFieldDisplayName = (fieldName: string) => {
    return FIELD_LABELS[fieldName as keyof typeof FIELD_LABELS] || fieldName;
  };

  const getFieldType = (fieldName: string) => {
    if (fieldName === 'custom') return 'Custom Field';
    if (CORE_FIELDS.includes(fieldName)) return 'Core Field';
    return 'Custom Field';
  };

  const getFieldRequirement = (fieldName: string) => {
    if (fieldName === 'custom') return 'Optional';
    if (CORE_FIELDS.includes(fieldName)) return 'Required';
    return 'Optional';
  };

  return (
    <div className="">
      <h2 className="text-[#0E4259] text-[18px] font-semibold">
        Smart Field Mapping
      </h2>
      <p className="text-[#68818C] text-[17px] pt-[12px] max-w-[904px] w-full">
        Review and adjust the AI-powered field mappings below. Click &quot;Edit&quot; next
        to any mapping to change it. You can map to existing CRM fields or
        create custom fields with different data types.
      </p>
      <div className="flex items-center text-[#444444] text-[13px] md:text-[16px] py-[20px] w-full justify-end gap-[12px]">
        <span className="opacity-50 flex items-center gap-[6px] cursor-pointer" onClick={handleResetToDefault}>
          <Image
            src="/icons/restore.png"
            alt="restore"
            width={16}
            height={16}
          />
          Reset to Default
        </span>
        <span className="flex items-center gap-[6px] cursor-pointer">
          <Image
            src="/icons/options.png"
            alt="options"
            width={16}
            height={16}
          />
          More Mapping Options
        </span>
      </div>
      
      <div className="space-y-4 md:h-[483px] overflow-y-scroll md:pb-[50px] pb-[70px]">
        {Object.entries(currentMapping).map(([header, mappedField]) => {
          const sampleValues = parsedData.rows?.slice(0, 3).map(row => row[header]).filter(Boolean) || [];
          const isCore = isCoreField(mappedField);
          const displayField = getFieldDisplayName(mappedField);
          
          return (
            <div key={header} className="flex border-[#EEEEEE] bg-[#FDFDFD] border py-[20px] px-[24px] pr-[42px] rounded-[16px] gap-[32px] justify-between">
              <div className="flex items-start gap-[32px] md:flex-row flex-col">
                <div className="gap-[12px] flex flex-col">
                  <div className="flex items-center gap-[8px]  ">
                    <span className="text-[#920C7A] bg-[#FBEBFF] border border-[#FFB7F4] rounded-[8px] text-[8px] md:text-[12px] font-medium py-[4px] px-[8px]">
                      DATABASE FIELD
                    </span>
                    <span className="text-[#008D0E] bg-[#E8FFE6] border border-[#B0F0C2] rounded-[8px] px-[8px] py-[4px] text-[8px] md:text-[12px] font-medium">
                      90% • High
                    </span>
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <div className="text-[20px] flex items-center gap-[8px] font-medium">
                    {/* <h1>{header}</h1> */}
                    <h1>{displayField}</h1>
                    </div>

                    <div className="text-[11px] md:text-[12px] text-[#596A72] flex items-center gap-[8px] cursor-pointer flex-wrap overflow-x-scroll w-[360px] ">
                      <div className="gap-[8px] flex md:items-center flex-wrap md:flex-row flex-col items-start ">
                        {sampleValues.map((value, index) => (
                          <span key={index} className="bg-[#F4F5F6] px-[8px] py-[4px] rounded-[4px] ">
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Image
                    src="/icons/link.png"
                    alt="link"
                    width={32}
                    height={32}
                    className="opacity-[50%]"
                  />
                </div>

                <div className="flex flex-col relative">
                  <div className="">
                    <span className="text-[#0959D1] bg-[#E7F5FB] border border-[#AACCFF] rounded-[8px] px-[8px] py-[4px] text-[12px] font-medium">
                      CRM FIELD
                    </span>
                  </div>

                  {editingField !== header && (
                    <>
                      <div className="text-[20px] flex items-center gap-[8px] text-[#0051CC] font-semibold pt-[15px] pb-[15px] max-w-[374px] w-full">
                      <h1>{displayField}</h1>
                        {isCore && (
                          <span className="px-[8px] py-[4px] rounded-[12px] bg-[#E8FFE6] text-[#008D0E] border border-[#B0F0C2] text-[12px] font-medium">
                            Core Field
                          </span>
                        )}
                        {!isCore && mappedField !== 'custom' && (
                          <span className="px-[8px] py-[4px] rounded-[12px] bg-[#E7F5FB] text-[#1970F3] border border-[#AACCFF] text-[12px] font-medium">
                            Custom Field
                          </span>
                        )}
                      </div>

                      <div className="text-[13px] text-[#596A72] flex items-center gap-[8px] justify-center">
                        {getFieldType(mappedField)} • Text Data type • {getFieldRequirement(mappedField)}
                      </div>
                    </>
                  )}

                  {editingField === header && (
                    <div className="w-[374px] z-50 absolute mt-[37px]">
                      <div className="bg-white p-[12px] border border-[#EEEEEE] rounded-[8px] shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-[8px] text-[14px] w-full justify-between">
                            <div className="flex items-center border border-[#1970F3] gap-[14px] rounded-[8px] px-[12px] py-[8px] w-full max-w-[279px] justify-between">
                              <div className="flex items-center gap-[14px]">
                                <span className="text-[#0E4259]">
                                  {displayField}
                                </span>
                                <span className="px-[8px] py-[4px] rounded-[12px] bg-[#fff] text-[#A449FF] border border-[#F0E1FF]">
                                  Current
                                </span>
                              </div>
                              <Image
                                src="/icons/down-arrow.png"
                                alt="arrow-icon"
                                width={12}
                                height={12}
                              />
                            </div>

                            <div className="flex items-center gap-[8px]">
                              <Image
                                src="/icons/check.png"
                                alt="confirm-icon"
                                width={36}
                                height={36}
                                className="cursor-pointer"
                                onClick={() => setEditingField(null)}
                              />
                              <Image
                                src="/icons/close-btn.png"
                                alt="close-icon"
                                width={36}
                                height={36}
                                className="cursor-pointer"
                                onClick={() => setEditingField(null)}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-[12px] overflow-y-auto border border-[#EEEEEE] shadow-sm rounded-[8px] bg-white max-h-[300px]">
                          <div className="text-[14px] text-[#484964] py-[12px] gap-[8px] flex flex-col p-[12px]">
                            <p 
                              className="flex items-center gap-[8px] cursor-pointer hover:bg-gray-50 p-2 rounded"
                              onClick={() => handleFieldChange(header, 'skip')}
                            >
                              <Image
                                src="/icons/close.png"
                                alt="close-icon"
                                width={16}
                                height={16}
                                className="opacity-50"
                              />
                              Don&apos;t import this field
                            </p>
                            <p 
                              className="flex items-center gap-[8px] cursor-pointer hover:bg-gray-50 p-2 rounded"
                              onClick={() => handleFieldChange(header, 'custom')}
                            >
                              <Image
                                src="/icons/customs.png"
                                alt="customer-icon"
                                width={16}
                                height={16}
                              />
                              Create Custom Field
                            </p>
                          </div>
                          
                          <div className="flex flex-col border-[#DDDDDD] border-y p-[12px] py-[16px]">
                            <div className="text-[#0959D1] text-[12px] font-semibold mb-[6px]">
                              Core Fields
                            </div>
                            <ul className="text-[14px] text-[#484964] space-y-1">
                              {CORE_FIELDS.map((field) => {
                                const isCurrent = mappedField === field;
                                return (
                                  <li 
                                    key={field}
                                    className={`px-[8px] py-[8px] rounded-[8px] cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                                      isCurrent ? 'bg-[#ECF1F3]' : ''
                                    }`}
                                    onClick={() => handleFieldChange(header, field)}
                                  >
                                    <span className={isCurrent ? "text-[#0E4259] font-semibold" : ""}>
                                      {getFieldDisplayName(field)}
                                    </span>
                                    <div className="flex items-center gap-[8px]">
                                      {isCurrent ? (
                                        <>
                                          <span className="px-[8px] py-[4px] text-[#A449FF] bg-[#FFFFFF] border border-[#F0E1FF] rounded-[12px] text-[14px]">
                                            Current
                                          </span>
                                          <Image
                                            src="/icons/good.png"
                                            alt="good-icon"
                                            width={12}
                                            height={9}
                                          />
                                        </>
                                      ) : (
                                        <span className="px-[8px] py-[4px] text-[#008D0E] bg-[#E8FFE6] border border-[#B0F0C2] rounded-[12px] text-[12px] font-medium">
                                          Core
                                        </span>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          
                          <div className="flex flex-col border-[#DDDDDD] border-t p-[12px] py-[16px]">
                            <div className="text-[#1970F3] text-[12px] font-semibold mb-[6px]">
                              Custom Fields
                            </div>
                            <ul className="text-[14px] text-[#484964] space-y-1">
                              {CUSTOM_FIELDS.map((field) => {
                                const isCurrent = mappedField === field;
                                return (
                                  <li 
                                    key={field}
                                    className={`px-[8px] py-[8px] rounded-[8px] cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                                      isCurrent ? 'bg-[#ECF1F3]' : ''
                                    }`}
                                    onClick={() => handleFieldChange(header, field)}
                                  >
                                    <span className={isCurrent ? "text-[#0E4259] font-semibold" : ""}>
                                      {getFieldDisplayName(field)}
                                    </span>
                                    <div className="flex items-center gap-[8px]">
                                      {isCurrent ? (
                                        <>
                                          <span className="px-[8px] py-[4px] text-[#A449FF] bg-[#FFFFFF] border border-[#F0E1FF] rounded-[12px] text-[14px]">
                                            Current
                                          </span>
                                          <Image
                                            src="/icons/good.png"
                                            alt="good-icon"
                                            width={12}
                                            height={9}
                                          />
                                        </>
                                      ) : (
                                        <span className="px-[8px] py-[4px] text-[#1970F3] bg-[#E7F5FB] border border-[#AACCFF] rounded-[12px] text-[12px] font-medium">
                                          Custom
                                        </span>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {editingField !== header && (
                    <div className="flex items-center gap-[8px] pt-[15px]">
                      <Image
                        src="/icons/edit.png"
                        alt="edit"
                        width={16}
                        height={16}
                        className="cursor-pointer"
                        onClick={() => setEditingField(header)}
                      />
                      <span 
                        className="text-[#1970F3] text-[13px] cursor-pointer"
                        onClick={() => handleResetField(header)}
                      >
                        Reset
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
