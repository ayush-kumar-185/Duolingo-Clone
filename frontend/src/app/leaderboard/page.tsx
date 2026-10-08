"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { User } from "@/store/useStore";

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${API_URL}/api/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col items-center pt-8">
        <h1 className="text-4xl font-extrabold text-white mb-4 mt-10">Leaderboard</h1>
        <p className="text-xl font-bold text-gray-500 text-center max-w-md mb-8">
          See where you stand against other learners!
        </p>
        
        <div className="w-full max-w-2xl bg-[#202f36] border-2 border-gray-700 rounded-3xl p-8 mb-8">
          {loading ? (
            <p className="text-gray-500 font-bold text-center">Loading leaderboard...</p>
          ) : (
            <div className="flex flex-col gap-4">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-background border-2 border-gray-700"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 text-2xl font-extrabold text-center text-gray-500">
                      {index + 1}
                    </div>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl text-white ${
                      index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-700" : "bg-green-500"
                    }`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-xl text-white">{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-extrabold text-xl text-white">{user.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
