"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Flame, Heart, Zap } from "lucide-react";
import { useUserStore } from "../store/useStore";

export function TopBar() {
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!user) return null;

  return (
    <div className="sticky top-0 bg-background z-50 w-full flex items-center justify-between lg:justify-end px-4 py-3 border-b-2 border-gray-800 lg:border-none lg:pt-6 lg:pb-4 lg:bg-transparent lg:px-8 max-w-5xl mx-auto">
      
      <div className="flex items-center gap-4 text-sm font-bold">
        {/* Japanese Flag Placeholder */}
        <div className="flex items-center hover:bg-[#202f36] p-2 rounded-xl cursor-pointer transition-colors">
          <Image src="/assets/Flag_of_Japan.svg.webp" width={32} height={24} alt="Japanese Flag" className="w-8 h-6 rounded border border-gray-700 object-cover" />
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 hover:bg-[#202f36] p-2 rounded-xl cursor-pointer transition-colors text-orange-500">
          <Flame size={24} fill="currentColor" />
          <span>{user.streak}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-2 hover:bg-[#202f36] p-2 rounded-xl cursor-pointer transition-colors text-blue-500">
          <Zap size={24} fill="currentColor" />
          <span>{user.xp}</span>
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-2 hover:bg-[#202f36] p-2 rounded-xl cursor-pointer transition-colors text-red-500">
          <Heart size={24} fill="currentColor" />
          <span>{user.hearts}</span>
        </div>
      </div>
    </div>
  );
}
