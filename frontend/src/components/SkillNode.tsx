import Link from "next/link";
import { Star, Lock, Check } from "lucide-react";

interface SkillNodeProps {
  id: number;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
  index: number;
  completedLessons?: number;
  totalLessons?: number;
}

export function SkillNode({ id, title, isCompleted, isLocked, index, completedLessons = 0, totalLessons = 1 }: SkillNodeProps) {
  // Create a snaking pattern for the path
  const offsets = [0, 40, 80, 40, 0, -40, -80, -40];
  const offset = offsets[index % offsets.length];

  const bgColor = isCompleted ? "bg-[#57cc02]" : isLocked ? "bg-gray-700" : "bg-[#57cc02]";
  const borderColor = isCompleted ? "border-[#46a400]" : isLocked ? "border-gray-800" : "border-[#46a400]";

  const progressRatio = Math.min(1, Math.max(0, completedLessons / totalLessons));
  const activeOffset = 276 - (276 * progressRatio);

  return (
    <div className="w-full flex justify-center my-6 relative">
      <div 
        style={{ transform: `translateX(${offset}px)` }}
        className="relative group flex flex-col items-center"
      >
        {/* Tooltip on hover */}
        {!isLocked && (
          <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-[#202f36] border-2 border-gray-700 px-6 py-3 rounded-2xl text-center shadow-lg font-bold z-10 pointer-events-none">
            <span className="text-green-500 font-black tracking-widest text-lg">START</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#202f36] border-b-2 border-r-2 border-gray-700 rotate-45"></div>
          </div>
        )}

        {/* Circular Progress Ring */}
        {!isLocked && (
          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] -rotate-90 pointer-events-none z-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="transparent" stroke="#37464f" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="44" 
              fill="transparent" 
              stroke={isCompleted ? "#57cc02" : "#57cc02"} 
              strokeWidth="8" 
              strokeDasharray="276" 
              strokeDashoffset={isCompleted ? 0 : activeOffset} 
              strokeLinecap="round" 
            />
          </svg>
        )}

        <Link 
          href={isLocked ? "#" : `/lesson/${id}`}
          className={`
            relative z-10 w-20 h-20 rounded-full flex items-center justify-center 
            border-b-8 transition-all
            ${!isLocked ? "active:border-b-0 active:translate-y-2 cursor-pointer" : "cursor-default"}
            ${bgColor} ${borderColor}
          `}
        >
          {isCompleted ? (
            <Check size={32} className="text-white" />
          ) : isLocked ? (
            <Lock size={32} className="text-gray-400" />
          ) : (
            <Star size={32} className="text-white" />
          )}
        </Link>
      </div>
    </div>
  );
}
