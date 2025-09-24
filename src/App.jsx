import React, { useState, useEffect } from "react";
import apiClient from './lib/apiClient';
import SuggestionButtons from './components/SuggestionButtons';
import "./App.css";

// --- COMPONENTE DA TELA DE CHAT ---
function ChatScreen({ regiao, onVoltar }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages([{
      sender: 'bot',
      text: `Olá! Bem-vindo ao BEPIT Nexus ${regiao.nome}. O que você gostaria de saber hoje? 🤖`
    }]);
  }, [regiao]);

  const sendMessageToApi = async (text) => {
    if (isLoading) return;
    const userMessage = { text, sender: 'user' };

    const loadingMessage = { sender: 'bot', text: 'Só um segundo, estou consultando meus arquivos... 🧠' };
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await apiClient.post(`/api/chat/${regiao.slug}`, { message: text });
      const botMessage = { text: response.data.reply, sender: 'bot' };
      setMessages(prev => [...prev.slice(0, -1), botMessage]);
    } catch (error) {
      console.error("Erro ao contatar o cérebro do robô:", error);
      const errorMessage = { text: "Opa, minha conexão falhou. Tente de novo?", sender: 'bot' };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    sendMessageToApi(inputValue);
    setInputValue('');
  };

  const handleSuggestionClick = (suggestionText) => {
    sendMessageToApi(`Quais as melhores opções de ${suggestionText}?`);
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col max-w-lg mx-auto overflow-hidden">
      <div className="bg-blue-500 p-3 text-white flex items-center justify-between shadow-md">
        <button onClick={onVoltar} className="font-semibold hover:bg-blue-600 p-2 rounded-md">{"< Voltar"}</button>
        <h1 className="text-xl font-semibold">BEPIT Nexus</h1>
        <div className="w-16"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-2">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${message.sender === 'user' ? 'bg-blue-200' : 'bg-gray-300'} text-black p-2 rounded-lg max-w-xs shadow`}>
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SuggestionButtons onSuggestionClick={handleSuggestionClick} isLoading={isLoading} />

      <div className="bg-white p-4 flex items-center shadow-inner border-t border-gray-200">
        <input
          type="text"
          placeholder={isLoading ? "Aguarde..." : "Digite sua pergunta..."}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading} className="bg-blue-500 text-white rounded-full p-2 ml-2 hover:bg-blue-600 disabled:bg-gray-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
        </button>
      </div>
    </div>
  );
}

// --- COMPONENTE DA TELA DE SELEÇÃO DE REGIÃO ---
function RegionSelectionScreen({ onSelectRegion }) {
  const regioesDisponiveis = [
    { nome: 'Região dos Lagos', slug: 'lagos' },
    // { nome: 'Gramado e Canela', slug: 'gramado' }, 
  ];

  return (
    <div className="bg-gray-100 h-screen flex flex-col items-center justify-center p-4">
      <img src="/bepit-logo.png" alt="Logo BEPIT" className="h-24 w-24 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo ao BEPIT Nexus</h1>
      <p className="text-gray-600 mb-8">Qual destino você quer explorar hoje?</p>
      <div className="w-full max-w-sm flex flex-col space-y-3">
        {regioesDisponiveis.map(regiao => (
          <button 
            key={regiao.slug}
            onClick={() => onSelectRegion(regiao)}
            className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105"
          >
            {regiao.nome}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL QUE GERENCIA AS TELAS ---
function App() {
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(null);

  if (regiaoSelecionada) {
    return <ChatScreen regiao={regiaoSelecionada} onVoltar={() => setRegiaoSelecionada(null)} />;
  } else {
    return <RegionSelectionScreen onSelectRegion={setRegiaoSelecionada} />;
  }
}

export default App;