import Image from "next/image";

interface StepIndicatorProps {
  stepNumber: number;
  title: string;
  description: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export default function StepIndicator({ 
  stepNumber, 
  title, 
  description, 
  isActive = false, 
  isCompleted = false 
}: StepIndicatorProps) {
  const getStepStyles = () => {
    if (isCompleted) {
      return "bg-green-500 text-white";
    }
    if (isActive) {
      return "bg-[#0E4259] text-white";
    }
    return "bg-[#EBF0F8] text-[#8C8DB0]";
  };

  return (
    <div className="flex gap-[12px] items-center ">
      <div className={`rounded-[8px] w-[42px] h-[42px] text-[20px] flex items-center justify-center ${getStepStyles()}`}>
        {isCompleted ? (
          <Image
            src="/icons/check.png"
            alt="check"
            width={42}
            height={42}
            className=""
          />
        ) : (
          stepNumber
        )}
      </div>
      <div className="flex flex-col ">
        <h2 className={` font-medium text-[18px] ${isActive ? 'text-[#0E4259]' : 'text-[#666666]'}`}>
          {title}
        </h2>
        <p className="text-[15px] font-medium text-[#68818C] ">{description}</p>
      </div>
    </div>
  );
}
