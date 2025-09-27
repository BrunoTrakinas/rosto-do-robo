import React from "react";

function SuggestionButtons({ onSuggestionClick, isLoading }) {
  const suggestions = ["Restaurantes", "Passeios", "Praias", "Hospedagem", "Roteiro 2 dias"];

  return (
    <div className="px-2 py-2 flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSuggestionClick(suggestion)}
          disabled={isLoading}
          className="bg-gray-200 text-blue-800 text-sm font-semibold py-1 px-3 rounded-full hover:bg-gray-300 disabled:opacity-50"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}