"use client";

import { useEffect, useRef, useState } from "react";
import { ExerciseHistoryDTO } from "@/types/stats";

type ExerciseSearchBarProps = {
  exercises: ExerciseHistoryDTO[];
  onSelectExercise: (exerciseId: number, exerciseName: string) => void;
  maxSuggestions?: number;
};

export default function ExerciseSearchBar({
  exercises,
  onSelectExercise,
  maxSuggestions = 5,
}: ExerciseSearchBarProps) {
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input value
  const filteredSuggestions = value.trim()
    ? exercises
        .filter((ex) =>
          ex.exerciseName.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, maxSuggestions)
    : [];

  // Open dropdown when there's input and filtered results
  useEffect(() => {
    if (value.trim() && filteredSuggestions.length > 0) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [value, filteredSuggestions.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSuggestionClick = (exercise: ExerciseHistoryDTO) => {
    setValue(exercise.exerciseName);
    onSelectExercise(exercise.exerciseId, exercise.exerciseName);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key !== "ArrowDown") return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search exercises..."
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (value.trim() && filteredSuggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        className="w-full p-3 rounded-lg bg-[#2f3136] border border-[#72767d] text-[#dcddde] focus:outline-none focus:ring-2 focus:ring-[#5865f2] placeholder-[#72767d]"
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-[#36393f] border border-[#72767d] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {filteredSuggestions.map((exercise, index) => (
            <button
              key={exercise.exerciseId}
              onClick={() => handleSuggestionClick(exercise)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-2 text-[#dcddde] transition-colors ${
                index === selectedIndex
                  ? "bg-[#5865f2] text-white"
                  : "hover:bg-[#2f3136]"
              }`}
              type="button"
            >
              {exercise.exerciseName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
