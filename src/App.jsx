import React, { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]); // Guarda a lista de todas as mensagens
  const [inputValue, setInputValue] = useState(''); // Guarda o que o usuário está digitando

  function handleSendMessage() {
    // 1. Não faz nada se o input estiver vazio
    if (inputValue.trim() === '') return;

    // 2. Cria o objeto da mensagem do usuário
    const userMessage = {
      text: inputValue,
      sender: 'user', // Identifica que a mensagem é do usuário
    };

    // 3. Lógica Falsa do Robô
    let botResponseText = "Não entendi. Para começar, me diga se você é 'local' ou 'turista'.";
    const lowerCaseInput = inputValue.toLowerCase();

    if (lowerCaseInput.includes('turista')) {
      botResponseText = "Que legal! Temos ótimas dicas de restaurantes e passeios. O que você procura?";
    } else if (lowerCaseInput.includes('local') || lowerCaseInput.includes('morador')) {
      botResponseText = "Ótimo! Temos sugestões de bares e serviços na região. O que te interessa hoje?";
    }

    const botMessage = {
      text: botResponseText,
      sender: 'bot', // Identifica que a mensagem é do robô
    };

    // 4. Atualiza a lista de mensagens com a do usuário E a do robô
    setMessages([...messages, userMessage, botMessage]);

    // 5. Limpa o campo de input
    setInputValue('');
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-2">
          
          {/* Mapeia e exibe cada mensagem do nosso estado 'messages' */}
          {messages.map((message, index) => (
            <div 
              key={index} // Uma chave única para o React
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`${message.sender === 'user' ? 'bg-blue-200' : 'bg-gray-300'} text-black p-2 rounded-lg max-w-xs`}
              >
                {message.text}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Input */}
      <div className="bg-white p-4 flex items-center">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
          aria-label="Digite sua mensagem"
          value={inputValue} // O valor do input é controlado pelo nosso estado
          onChange={(e) => setInputValue(e.target.value)} // Atualiza o estado a cada letra digitada
          onKeyDown={(e) => {
            if (e.key === 'Enter') { // Se a tecla for "Enter"
              handleSendMessage(); // Chama nossa função de envio
            }
          }}
        />
        <button
          className="bg-blue-500 text-white rounded-full p-2 ml-2 hover:bg-blue-600 focus:outline-none"
          type="button"
          title="Enviar mensagem"
          aria-label="Enviar mensagem"
          onClick={handleSendMessage} // O botão de clique também chama nossa função
        >
          {/* Ícone de Enviar (SVG) */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" aria-hidden="true">
            <path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default App;