"use client";

import { useEffect, useRef, useState } from "react";

type AutocompleteInputProps = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  availableOptions: string[];
  maxSuggestions?: number;
};

export default function AutocompleteInput({
  placeholder = "Enter text",
  value,
  onChange,
  onSelect,
  availableOptions,
  maxSuggestions = 5,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input value
  const filteredSuggestions = value.trim()
    ? availableOptions
        .filter((option) =>
          option.toLowerCase().includes(value.toLowerCase())
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

  // Close dropdown when there's an exact match
  useEffect(() => {
    if (value.trim() && availableOptions.includes(value.trim())) {
      setIsOpen(false);
    }
  }, [value, availableOptions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSelect(suggestion);
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
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (value.trim() && filteredSuggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        className="w-full p-2 rounded-lg bg-[#2f3136] border border-[#72767d] text-[#dcddde] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-[#36393f] border border-[#72767d] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-2 text-[#dcddde] transition-colors ${
                index === selectedIndex
                  ? "bg-[#5865f2] text-white"
                  : "hover:bg-[#2f3136]"
              }`}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
