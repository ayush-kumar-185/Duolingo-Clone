"use client";

import { useEffect, useState } from "react";
import { UnitBanner } from "@/components/UnitBanner";
import { SkillNode } from "@/components/SkillNode";
import { useUserStore } from "@/store/useStore";

interface Skill {
  id: number;
  title: string;
  description: string;
  order: number;
  is_completed: boolean;
  completed_lessons: number;
  total_lessons: number;
}

interface Unit {
  id: number;
  title: string;
  order: number;
  skills: Skill[];
}

export default function Home() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/path", {
      headers: { "x-username": useUserStore.getState().activeUsername }
    })
      .then((res) => res.json())
      .then((data) => {
        setUnits(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="w-full flex justify-center py-20 font-bold text-gray-500">Loading Path...</div>;
  }

  // Calculate locked states
  let previousCompleted = true; // The very first skill is always unlocked

  return (
    <div className="w-full max-w-2xl mx-auto pb-24">
      {units.map((unit, unitIndex) => {
        const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-orange-500"];
        const colorClass = colors[unitIndex % colors.length];

        return (
          <div key={unit.id} className="mb-12">
            <UnitBanner 
              title={unit.title} 
              description={`Learn new concepts and review`} 
              colorClass={colorClass} 
            />
            
            <div className="flex flex-col items-center">
              {unit.skills.map((skill, index) => {
                const isLocked = !previousCompleted;
                previousCompleted = skill.is_completed;
                
                return (
                  <SkillNode
                    key={skill.id}
                    id={skill.id}
                    title={skill.title}
                    isCompleted={skill.is_completed}
                    isLocked={isLocked}
                    index={index}
                    completedLessons={skill.completed_lessons}
                    totalLessons={skill.total_lessons || 1}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
