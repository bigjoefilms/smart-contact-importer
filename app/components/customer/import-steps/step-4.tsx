import Image from "next/image";
import { DeduplicationResult } from "@/lib/deduplication";

interface Step4Props {
  importResult: DeduplicationResult;
  onComplete?: () => void;
}

export default function Step4({ importResult, onComplete }: Step4Props) {
  return (
    <div className="">
      <h2 className="text-[#0E4259] text-[18px] font-semibold">
        Import Complete
      </h2>
      <p className="text-[#68818C] text-[16px]">
        Your contacts have been successfully processed and imported.
      </p>

      {/* Summary Cards */}
      <div className="my-[24px] grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        <div className="bg-[#E7FFEA] border border-[#B0F0C2] rounded-[12px] p-[20px] text-center">
          <div className="text-[#087025] text-[32px] font-bold">
            {importResult.summary.created}
          </div>
          <div className="text-[#087025] text-[14px] font-medium">
            New Contacts Created
          </div>
        </div>

        <div className="bg-[#FFF2ED] border border-[#FFB299] rounded-[12px] p-[20px] text-center">
          <div className="text-[#FF6B35] text-[32px] font-bold">
            {importResult.summary.merged}
          </div>
          <div className="text-[#FF6B35] text-[14px] font-medium">
            Contacts Merged
          </div>
        </div>

        <div className="bg-[#F4F5F6] border border-[#D1D5DB] rounded-[12px] p-[20px] text-center">
          <div className="text-[#6B7280] text-[32px] font-bold">
            {importResult.summary.skipped}
          </div>
          <div className="text-[#6B7280] text-[14px] font-medium">
            Contacts Skipped
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-[#FDFDFD] border border-[#EEEEEE] rounded-[16px] p-[24px]">
        <h3 className="text-[#0E4259] text-[16px] font-semibold mb-[16px]">
          Import Details
        </h3>
        
        <div className="space-y-[12px]">
          <div className="flex justify-between items-center py-[8px] border-b border-[#F0F0F0]">
            <span className="text-[#596A72]">Total records processed</span>
            <span className="text-[#0E4259] font-medium">{importResult.summary.total}</span>
          </div>
          
          <div className="flex justify-between items-center py-[8px] border-b border-[#F0F0F0]">
            <span className="text-[#596A72]">New contacts created</span>
            <span className="text-[#087025] font-medium">{importResult.summary.created}</span>
          </div>
          
          <div className="flex justify-between items-center py-[8px] border-b border-[#F0F0F0]">
            <span className="text-[#596A72]">Existing contacts updated</span>
            <span className="text-[#FF6B35] font-medium">{importResult.summary.merged}</span>
          </div>
          
          <div className="flex justify-between items-center py-[8px]">
            <span className="text-[#596A72]">Records skipped</span>
            <span className="text-[#6B7280] font-medium">{importResult.summary.skipped}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-[32px] flex justify-center gap-[16px]">
        <button
          onClick={onComplete}
          className="px-[24px] py-[12px] bg-[#0E4259] text-white rounded-[8px] font-medium hover:bg-[#0a2d3a] transition-colors"
        >
          Import More Contacts
        </button>
        
        <button
          onClick={() => window.location.href = '/contacts'}
          className="px-[24px] py-[12px] bg-[#F4F5F6] text-[#0E4259] rounded-[8px] font-medium hover:bg-[#E5E7EB] transition-colors"
        >
          View All Contacts
        </button>
      </div>
    </div>
  );
}
