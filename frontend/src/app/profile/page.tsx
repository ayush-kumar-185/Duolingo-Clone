"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useUserStore, User } from "@/store/useStore";

export default function Profile() {
  const { activeUsername, setActiveUsername, fetchUser } = useUserStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${API_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col items-center pt-8">
        <h1 className="text-4xl font-extrabold text-white mb-8 mt-10">Evaluator Controls</h1>
        
        <div className="w-full max-w-2xl bg-[#202f36] border-2 border-gray-700 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-300 mb-6">Switch Active User</h2>
          
          {loading ? (
            <p className="text-gray-500 font-bold">Loading users...</p>
          ) : (
            <div className="flex flex-col gap-4">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setActiveUsername(user.username);
                  }}
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 border-b-4 transition-all active:border-b-2 active:translate-y-[2px] ${
                    activeUsername === user.username 
                      ? "bg-blue-500/20 border-blue-500 text-blue-400"
                      : "bg-background border-gray-700 hover:bg-gray-800 text-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center font-bold text-xl text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-lg">{user.username}</p>
                      <p className="font-bold text-gray-500 text-sm">XP: {user.xp} • Streak: {user.streak}</p>
                    </div>
                  </div>
                  
                  {activeUsername === user.username && (
                    <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                      ACTIVE
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
