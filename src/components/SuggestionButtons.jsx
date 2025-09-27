import React from "react";

/**
 * Botões de sugestão simples. Agora respeitam o estado "isLoading"
 * para evitar múltiplos disparos enquanto a IA está respondendo.
 */
function SuggestionButtons({ onSuggestionClick, isLoading }) {
  const suggestions = ["Restaurantes", "Passeios", "Praias", "Dicas"];

  return (
    <div className="px-2 py-2 flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSuggestionClick(suggestion)}
          disabled={isLoading}
          className="bg-gray-200 text-blue-800 text-sm font-semibold py-1 px-3 rounded-full hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

export default SuggestionButtons;
