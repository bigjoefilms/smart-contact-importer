import Image from "next/image";
import { ParsedData } from "@/lib/xlsx-parser";
import { AIMappingResult } from "@/lib/ai-mapping";
import { CORE_FIELDS, CUSTOM_FIELDS } from "@/lib/firebase-service";

interface Step2Props {
  parsedData?: ParsedData;
  aiMapping?: AIMappingResult;
}

export default function Step2({ parsedData, aiMapping }: Step2Props) {
  // Calculate statistics
  const totalFields = parsedData?.headers?.length || 0;
  const coreFields = aiMapping ? Object.values(aiMapping).filter(field => CORE_FIELDS.includes(field)).length : 0;
  const customFields = aiMapping ? Object.values(aiMapping).filter(field => field === 'custom' || !CORE_FIELDS.includes(field)).length : 0;
  const highConfidenceFields = totalFields; // For now, assume all are high confidence
  return (
    <div className="">
       <h2 className="text-[#0E4259] text-[18px] font-semibold ">
                  Column Detection Results
                </h2>
                <p className="text-[#68818C]  text-[17px] ">
                  Our intelligent mapping has mapped {totalFields} fields in this entry
                  with the CRM Contact Fields
                </p>
                <div className="my-[20px] flex items-center gap-[15px] font-medium  lg:flex-row flex-col justify-center">
                  <div className="text-[#087025] bg-[#E7FFEA] border-[#0000000D] border-[2px] px-[24px] py-[12px] rounded-[12px] flex items-center gap-[8px] text-[18px] font-medium lg:max-w-[318px] w-full justify-center">
                    <Image
                      src="/icons/search.png"
                      alt="left-arrow"
                      width={24}
                      height={24}
                    />
                    {totalFields} fields Detected{" "}
                  </div>
                  <div className="text-[#5740DF] bg-[#F6F6FF] border-[#0000000D] border-[2px] px-[24px] py-[12px] rounded-[12px] flex items-center gap-[8px] text-[18px] font-medium lg:max-w-[318px] w-full justify-center">
                    <Image
                      src="/icons/group-circle.png"
                      alt="left-arrow"
                      width={24}
                      height={24}
                    />
                    {highConfidenceFields} High Confidence{" "}
                  </div>
                  <div className="text-[#B71897] bg-[#FFF1FC] border-[#0000000D] border-[2px] px-[24px] py-[12px] rounded-[12px] flex items-center gap-[8px] text-[18px] font-medium lg:max-w-[318px] w-full justify-center">
                    <Image
                      src="/icons/fields.png"
                      alt="field"
                      width={24}
                      height={24}
                    />
                    {customFields} Custom Fields{" "}
                  </div>
                </div>

                <div className="h-[483px] overflow-y-scroll pb-[70px] md:py-[30px] space-y-4">
                  {parsedData?.headers && aiMapping ? (
                    parsedData.headers.map((header) => {
                      const mappedField = aiMapping[header];
                      const sampleValues = parsedData.rows?.slice(0, 3).map(row => row[header]).filter(Boolean) || [];
                      const isCore = CORE_FIELDS.includes(mappedField);
                      
                      // Display logic: show "Contact Name" for firstName or lastName fields
                      const displayField = (mappedField === 'firstName' || mappedField === 'lastName') ? 'Contact Name' : mappedField;
                      
                      return (
                        <div key={header} className="flex items-center gap-[24px] border-[#EEEEEE] bg-[#FDFDFD] border py-[20px] px-[16px] rounded-[16px]">
                          <span className="text-[#008D0E] bg-[#E8FFE6] border border-[#B0F0C2] rounded-[8px] px-[8px] py-[4px] text-[12px] font-medium">
                            90%
                          </span>

                          <div className="flex flex-col gap-[12px] flex-1">
                            <div className="text-[20px] flex md:items-center items-start gap-[8px] font-medium md:flex-row flex-col">
                              <h1>{header}</h1>
                              <div className="flex items-center gap-[8px]">
                                <Image
                                  src="/icons/link.png"
                                  alt="link"
                                  width={24}
                                  height={24}
                                />
                                <h1 className="text-[#1970F3]">{displayField}</h1>
                                {isCore && (
                                  <span className="px-[8px] py-[4px] rounded-[12px] bg-[#E8FFE6] text-[#008D0E] border border-[#B0F0C2] text-[12px] font-medium">
                                    Core Field
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-[11px] md:text-[13px] text-[#596A72] flex items-center gap-[8px]">
                              <div className="gap-[8px] flex flex-wrap items-center">
                                {sampleValues.map((value, index) => (
                                  <span key={index} className="bg-[#F4F5F6] px-[8px] py-[4px] rounded-[4px]">
                                    {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-[#68818C] text-[16px]">No mapping data available</p>
                    </div>
                  )}
                </div>
    </div>
  );
}
