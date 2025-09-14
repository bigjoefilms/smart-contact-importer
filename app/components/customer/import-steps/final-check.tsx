import Image from 'next/image';
import React from 'react'
import { DeduplicationResult } from '@/lib/deduplication';

interface FinalCheckProps {
  results?: DeduplicationResult;
}

export default function FinalCheck({ results }: FinalCheckProps) {
  const defaultResults: DeduplicationResult = {
    contacts: [],
    duplicates: [],
    skipped: [],
    summary: {
      total: 0,
      created: 0,
      merged: 0,
      skipped: 0
    }
  };

  const stats = results || defaultResults;

  return (
    <div>
      <h2 className="text-[#0E4259] text-[18px] font-semibold">
        Final Checks Complete
      </h2>
      <p className="text-[#68818C] text-[17px] pt-[12px]">
        Your data has been processed and is ready for import.
      </p>
      
     

      <div className=" md:h-[541px] flex items-center justify-center ">
        <div className="flex items-center justify-center flex-col">
          <div className="items-center justify-center flex flex-col">
            <div className="relative">
              <div
                className="w-[300px] md:w-[480px] h-[178px] bg-cover bg-center bg-no-repeat mb-6 mask-radial-[35%_45%] mask-radial-from-35% mask-radial-at-center"
                style={{
                  backgroundImage: 'url(/assets/final-check-illustraction.png)',
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

            
            <p className="text-[#0E4259] text-[20px] md:text-[18px] text-center font-medium max-w-[470px] w-full" >
            
              {stats.summary.skipped === 0 
                ? 'No Issue Founds! This Database entres are good to move to contacts section.'
                : `${stats.summary.skipped} contacts had issues and were not imported.`
              }
            </p>
          </div>
          <div className='flex gap-[12px] w-full md:w-[656px] bg-[#FFFFFF] border border-[#EEEEEE] rounded-[12px] py-[7px] px-[8px] mt-[24px] md:flex-row flex-col overflow-y-scroll'>
          <div className="bg-[#F2FFED]  rounded-[12px] py-[12px]  text-center text-[#008D0E] lg:max-w-[208px] w-full">
          <div className=" text-[14px] font-medium">Total Contacts Imported</div>
          <div className=" text-[20px] font-bold">{stats.summary.created}</div>
          
        </div>
        
        <div className="bg-[#FFF7EA]  rounded-[12px] p-4 text-center text-[#B67C0C] lg:max-w-[208px] w-full">
        <div className="text-[14px] font-medium">Contacts Merged</div>
          <div className="text-[20px] font-bold"> {stats.summary.merged}</div>
          
        </div>
        
        <div className="bg-[#FFEDED]  rounded-[12px] p-4 text-center text-[#C4494B] py-[12px] lg:max-w-[208px] w-full">
        <div className=" text-[14px] font-medium">Errors</div>
          <div className="text-[20px] font-bold">{stats.summary.skipped}</div>
         
        </div>
        
          </div>
        </div>
      </div>
    </div>
  )
}