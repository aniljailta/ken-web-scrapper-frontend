import React, { useState } from "react";

interface SuggestionListProps {
  onSelect: (question: string) => void;
}

const suggestionList = [
  "Is it orderable?",
  "What are the specifications?",
  "When does support end?",
];

const SuggestionList: React.FC<SuggestionListProps> = ({ onSelect }) => {
  const [suggestions, setSuggestions] = useState(suggestionList);

  // Function to remove a suggestion after it's clicked
  const removeSuggestion = (question: string) => {
    setSuggestions((prev) => prev.filter((item) => item !== question));
  };

  return (
    <div className="flex flex-row items-center gap-2 min-w-full overflow-auto scrollbar-hide">
      {suggestions.map((question) => (
        <div
          key={question}
          className="shrink-0 font-light p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-200"
          onClick={() => {
            onSelect(question);
            removeSuggestion(question);
          }}
        >
          {question}
        </div>
      ))}
    </div>
  );
};

export default SuggestionList;
