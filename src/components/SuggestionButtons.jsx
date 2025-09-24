import React from 'react';

// Um componente simples e reutilizável para nossos botões
function SuggestionButtons({ onSuggestionClick }) {
  const suggestions = ['Restaurantes', 'Passeios', 'Praias', 'Dicas'];

  return (
    <div className="px-2 py-2 flex flex-wrap justify-center gap-2">
      {suggestions.map(suggestion => (
        <button
          key={suggestion}
          onClick={() => onSuggestionClick(suggestion)}
          className="bg-gray-200 text-blue-800 text-sm font-semibold py-1 px-3 rounded-full hover:bg-gray-300"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

export default SuggestionButtons;