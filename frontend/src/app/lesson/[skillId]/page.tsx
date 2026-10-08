"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { X, Heart, CheckCircle, XCircle } from "lucide-react";
import { useUserStore } from "@/store/useStore";

import { Suspense } from "react";


interface Exercise {
  id: number;
  exercise_type: string;
  question: string;
  options: string | null;
  correct_answer: string;
}

function LessonContent() {
  const router = useRouter();
  const params = useParams();
  const skillId = params.skillId;
  const { user, fetchUser } = useUserStore();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(5); // Fallback to 5, will override with user.hearts
  const [loading, setLoading] = useState(true);

  // Interaction states
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<"none" | "correct" | "incorrect">("none");
  const [lastFeedback, setLastFeedback] = useState<"none" | "correct" | "incorrect">("none");
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [isOutOfHearts, setIsOutOfHearts] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  useEffect(() => {
    if (user) {
      setHearts(user.hearts);
    }
  }, [user]);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${API_URL}/api/skills/${skillId}/lesson`, {
      headers: { "x-username": useUserStore.getState().activeUsername }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.exercises) {
          setExercises(data.exercises);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [skillId]);

  if (loading) return <div className="fixed inset-0 bg-background z-[100] flex items-center justify-center font-bold text-gray-500">Loading Lesson...</div>;

  if (isLessonComplete) {
    return (
      <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-extrabold text-yellow-500 mb-6 text-center">Lesson Complete!</h1>
        <p className="text-xl font-bold text-gray-300 mb-8">+10 XP Earned</p>
        <button 
          onClick={() => {
            fetchUser(); // Refresh user state globally
            setIsLessonComplete(false);
            setCurrentIndex(0);
            router.push("/");
          }}
          className="w-full max-w-sm bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
        >
          CONTINUE
        </button>
      </div>
    );
  }

  if (isOutOfHearts) {
    return (
      <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center p-6">
        <Heart size={80} className="text-gray-600 mb-6" />
        <h1 className="text-4xl font-extrabold text-gray-300 mb-4 text-center">Out of Hearts!</h1>
        <p className="text-lg text-gray-500 mb-8 text-center">You made too many mistakes.</p>
        <button 
          onClick={() => {
            setIsOutOfHearts(false);
            setCurrentIndex(0);
            router.push("/");
          }}
          className="w-full max-w-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all"
        >
          GO BACK
        </button>
      </div>
    );
  }

  if (exercises.length === 0) {
    return <div className="fixed inset-0 bg-background z-[100] flex items-center justify-center font-bold text-gray-400">No exercises found.</div>;
  }

  const exercise = exercises[currentIndex];
  const progressPercentage = ((currentIndex + (feedback === "correct" ? 1 : 0)) / exercises.length) * 100;
  let parsedOptions: string[] = [];
  if (exercise.options) {
    try { parsedOptions = JSON.parse(exercise.options); } catch (e) {}
  }

  const normalizeText = (text: string) => {
    // Remove (romaji), spaces, pipes, and punctuation to make robust comparisons
    return text.replace(/\s*\([^)]*\)/g, "").replace(/[\s|。、？！.,?!]/g, "").trim().toLowerCase();
  };

  const checkAnswer = async () => {
    // For tap_words, acceptedAnswers might be present in JSON, but currently we just check exercise.correct_answer
    if (normalizeText(selectedAnswer) === normalizeText(exercise.correct_answer)) {
      setFeedback("correct");
      setLastFeedback("correct");
    } else {
      setFeedback("incorrect");
      setLastFeedback("incorrect");
      const newHearts = hearts - 1;
      setHearts(newHearts);
      
      // We don't save progress immediately here, but we will on completion or failure.
      if (newHearts <= 0) {
        setTimeout(() => setIsOutOfHearts(true), 1500);
      }
    }
  };

  const nextExercise = async () => {
    if (feedback === "incorrect" && hearts > 0) {
      // Duolingo usually pushes incorrect answers to the end. For simplicity, we just move on.
    }
    
    setFeedback("none");
    setSelectedAnswer("");

    if (currentIndex + 1 >= exercises.length && hearts > 0) {
      // Finish lesson
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${API_URL}/api/progress`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-username": useUserStore.getState().activeUsername
        },
        body: JSON.stringify({
          xp_gained: 10,
          hearts_lost: user ? user.hearts - hearts : 0,
          skill_id: parseInt(skillId as string),
          lesson_completed: true
        })
      });
      setIsLessonComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center gap-4 p-4 lg:p-8">
        <button onClick={() => setShowQuitModal(true)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={32} />
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="flex items-center gap-2 text-red-500 font-bold">
          <Heart size={28} fill="currentColor" />
          <span>{hearts}</span>
        </div>
      </div>

      {/* Exercise Content */}
      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col px-4 overflow-y-auto pb-40 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="my-auto w-full flex flex-col gap-8">
          <h2 className="text-3xl font-extrabold text-white">{exercise.question}</h2>

          {(() => {
          const ENGLISH_MEANINGS: Record<string, string> = {
            "りんご": "apple", "みず": "water", "パン": "bread", "ぎゅうにゅう": "milk",
            "これ": "this", "は": "is/topic", "を": "object", "です": "is",
            "わたし": "I/me", "あなた": "you", "たべます": "eat", "のみます": "drink",
            "こんにちは": "hello", "さようなら": "goodbye", "ありがとう": "thank you",
            "おやすみ": "good night", "おはよう": "good morning", "ございます": "(polite)",
            "はい": "yes", "いいえ": "no",
            "たまご": "egg", "おちゃ": "tea", "ごはん": "rice", "さかな": "fish", "コーヒー": "coffee",
            "おかあさん": "mother", "おとうさん": "father", "おとこのこ": "boy",
            "おんなのこ": "girl", "ともだち": "friend",
            "私": "I/me", "水": "water", "飲みます": "drink", "食べます": "eat", "すし": "sushi"
          };

          const parseText = (text: string) => {
            const match = text.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
              return { main: match[1].trim(), sub: match[2].trim() };
            }
            return { main: text, sub: null };
          };

          const renderRubyText = (text: string) => {
            const { main, sub } = parseText(text);
            const meaning = ENGLISH_MEANINGS[main];
            
            return (
              <div className="flex flex-col items-center justify-center leading-tight group relative">
                {sub && <span className="text-[13px] text-gray-400 font-bold mb-2 tracking-wide">{sub}</span>}
                <span>{main}</span>
                {meaning && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#202f36] border-2 border-gray-700 text-white text-sm font-bold px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                    {meaning}
                  </div>
                )}
              </div>
            );
          };

          return (
            <>
              {exercise.exercise_type === "image_choice" && (
                <div className="flex flex-col gap-4">
            {parsedOptions.map((opt: any) => {
              const isObj = typeof opt === "object" && opt !== null;
              const text = isObj ? opt.text : opt;
              const image = isObj ? opt.image : null;
              
              return (
                <button
                  key={text}
                  onClick={() => setFeedback("none") || setSelectedAnswer(text)}
                  disabled={feedback !== "none"}
                  className={`w-full p-6 rounded-2xl border-2 border-b-[6px] flex flex-row items-center justify-start gap-8 transition-all active:border-b-2 active:translate-y-[4px] ${
                    selectedAnswer === text 
                      ? "border-blue-500 bg-[#202f36] text-blue-400" 
                      : "border-gray-700 hover:bg-[#202f36] hover:border-gray-600 text-gray-300"
                  }`}
                >
                  {image && <span className="flex-shrink-0" style={{ fontSize: '60px', lineHeight: '1' }}>{image}</span>}
                  <span className="text-2xl font-bold text-left">{renderRubyText(text)}</span>
                </button>
              );
            })}
          </div>
        )}

        {exercise.exercise_type === "multiple_choice" && (
          <div className="flex flex-col gap-4">
            {parsedOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFeedback("none") || setSelectedAnswer(opt)}
                disabled={feedback !== "none"}
                className={`w-full p-4 rounded-2xl border-2 border-b-[6px] text-lg font-bold text-left transition-all active:border-b-2 active:translate-y-[4px] ${
                  selectedAnswer === opt 
                    ? "border-blue-500 bg-[#202f36] text-blue-400" 
                    : "border-gray-700 hover:bg-[#202f36] hover:border-gray-600 text-gray-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {exercise.exercise_type === "translation" && (
          <textarea
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={feedback !== "none"}
            placeholder="Type in Japanese..."
            className="w-full p-4 rounded-2xl border-2 border-gray-700 text-lg font-bold text-white bg-background outline-none focus:border-blue-400 focus:bg-[#202f36] transition-all min-h-[150px] resize-none"
          />
        )}

        {exercise.exercise_type === "tap_words" && (
          <div className="flex flex-col gap-8">
            <div className="min-h-[60px] p-4 border-b-2 border-gray-700 flex flex-wrap gap-2">
              {selectedAnswer.split("|||").filter(w => w).map((word, i) => (
                <button
                  key={i}
                  disabled={feedback !== "none"}
                  onClick={() => setSelectedAnswer(selectedAnswer.split("|||").filter((_, idx) => idx !== i).join("|||"))}
                  className="px-4 py-2 bg-background border-2 border-b-4 border-gray-700 rounded-xl font-bold text-white shadow-sm active:border-b-2 active:translate-y-[2px] transition-all hover:bg-[#202f36] flex items-center justify-center"
                >
                  {renderRubyText(word)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {parsedOptions.map((opt, i) => {
                const isSelected = selectedAnswer.split("|||").includes(opt);
                return (
                  <button
                    key={i}
                    disabled={isSelected || feedback !== "none"}
                    onClick={() => setSelectedAnswer((selectedAnswer ? selectedAnswer + "|||" : "") + opt)}
                    className={`px-4 py-2 border-2 border-b-4 rounded-xl font-bold transition-all active:border-b-2 active:translate-y-[2px] flex items-center justify-center ${
                      isSelected ? "bg-[#202f36] border-gray-800 text-transparent shadow-none" : "bg-background border-gray-700 text-white shadow-sm hover:bg-[#202f36] hover:border-gray-600"
                    }`}
                  >
                    {renderRubyText(opt)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
        })()}
        </div>
      </div>

      {/* Feedback Bar */}
      <div className={`w-full absolute bottom-0 left-0 transition-transform duration-300 ease-out ${
        feedback === "none" ? "translate-y-full" : "translate-y-0"
      }`}>
        <div className={`w-full p-6 sm:p-8 flex items-center justify-between lg:justify-center lg:gap-32 ${
          lastFeedback === "correct" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full bg-white ${lastFeedback === "correct" ? "text-green-500" : "text-red-500"}`}>
              {lastFeedback === "correct" ? <CheckCircle size={32} /> : <XCircle size={32} />}
            </div>
            <div>
              <h3 className="text-2xl font-extrabold">{lastFeedback === "correct" ? "Excellent!" : "Correct solution:"}</h3>
              {lastFeedback === "incorrect" && <p className="text-lg font-bold">{exercise.correct_answer}</p>}
            </div>
          </div>
          
          <button 
            onClick={nextExercise}
            className={`px-8 py-4 rounded-2xl font-bold text-white uppercase tracking-wider border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
              lastFeedback === "correct" ? "bg-green-500 border-green-700 hover:bg-green-600" : "bg-red-500 border-red-700 hover:bg-red-600"
            }`}
          >
            Continue
          </button>
        </div>
      </div>

      {/* Default Check Button (when no feedback is showing) */}
      <div className={`w-full absolute bottom-0 left-0 bg-background border-t-2 border-gray-800 p-6 flex justify-center transition-transform duration-300 ease-out ${
        feedback !== "none" ? "translate-y-full" : "translate-y-0"
      }`}>
        <button 
          onClick={checkAnswer}
          disabled={!selectedAnswer}
          className={`w-full max-w-sm py-4 rounded-2xl font-bold text-white uppercase tracking-wider border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
            !selectedAnswer ? "bg-[#202f36] border-gray-700 text-gray-500 cursor-not-allowed" : "bg-green-500 border-green-700 hover:bg-green-600"
          }`}
        >
          Check
        </button>
      </div>

    {/* Quit Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-black/75 z-[200] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-[#202f36] border-4 border-gray-700 p-8 sm:p-10 rounded-3xl max-w-sm w-full flex flex-col items-center text-center shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-4 tracking-wide">Wait, don't go!</h3>
            <p className="text-gray-400 font-bold text-base mb-8">All your progress for this lesson will be lost if you quit now.</p>
            
            <button 
              onClick={() => setShowQuitModal(false)}
              className="w-full py-4 bg-blue-500 border-b-4 border-blue-700 rounded-2xl text-white font-extrabold text-base tracking-widest uppercase mb-4 hover:bg-blue-400 active:border-b-0 active:translate-y-1 transition-all"
            >
              Keep Learning
            </button>
            <button 
              onClick={() => {
                setShowQuitModal(false);
                setCurrentIndex(0);
                setFeedback("none");
                setSelectedAnswer("");
                router.push("/");
              }}
              className="w-full py-4 text-red-500 font-extrabold text-base tracking-widest uppercase hover:bg-red-500/10 rounded-2xl transition-all"
            >
              End Session
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-background z-[100] flex items-center justify-center font-bold text-gray-500">Loading Lesson...</div>}>
      <LessonContent />
    </Suspense>
  );
}
