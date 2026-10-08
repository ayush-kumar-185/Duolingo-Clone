"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldCheck, Trophy, Store, User as UserIcon } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  
  const items = [
    { name: "LEARN", icon: Home, href: "/learn" },
    { name: "LEADERBOARD", icon: ShieldCheck, href: "/leaderboard" },
    { name: "QUESTS", icon: Trophy, href: "/quests" },
    { name: "SHOP", icon: Store, href: "/shop" },
    { name: "PROFILE", icon: UserIcon, href: "/profile" },
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 border-r-2 border-gray-800 h-screen fixed left-0 top-0 bg-background p-4">
      <Link href="/learn" className="px-4 pt-4 pb-8">
        <h1 className="text-green-500 font-extrabold text-3xl tracking-tight">duolingo</h1>
      </Link>
      
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const isActive = pathname ? pathname.startsWith(item.href) : false;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors cursor-pointer font-bold tracking-wider ${
                isActive 
                  ? "bg-blue-500/20 text-blue-400 border-2 border-blue-500" 
                  : "text-gray-400 hover:bg-[#202f36] hover:text-white border-2 border-transparent"
              }`}
            >
              <item.icon size={28} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
