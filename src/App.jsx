import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import React, { useState, useEffect, useRef } from "react";
import apiClient from "./lib/apiClient";
import SuggestionButtons from "./components/SuggestionButtons";
import "./App.css";

/**
 * Hook de tema (claro/escuro) com Tailwind (darkMode: "class")
 * - Salva no localStorage
 * - Aplica a classe "dark" no elemento <html>
 */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}

function ThemeToggle({ theme, setTheme }) {
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  return (
    <button
      onClick={toggle}
      className="px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 border border-white/30"
      title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {theme === "dark" ? "☀️ Claro" : "🌙 Escuro"}
    </button>
  );
}

/**
 * Tela de Chat
 */
function ChatScreen({ regiao, onVoltar, theme, setTheme }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  // Auto-scroll: ancora no final
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: `Olá! Bem-vindo ao BEPIT Nexus ${regiao.nome}. O que você gostaria de saber hoje? 🤖`
      }
    ]);
  }, [regiao]);

  // Sempre que as mensagens mudarem, rola para o final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageToApi = async (text) => {
    if (isLoading) return;

    const userMessage = { text, sender: "user" };
    const loadingMessage = {
      sender: "bot",
      text: "Só um segundo, estou consultando meus arquivos... 🧠"
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const payload = { message: text };
      if (conversationId) {
        payload.conversationId = conversationId;
      }

      const response = await apiClient.post(`/api/chat/${regiao.slug}`, payload);

      // Guarda/atualiza conversationId devolvido pelo backend
      const newConvId = response.data.conversationId || conversationId || null;
      if (newConvId && newConvId !== conversationId) {
        setConversationId(newConvId);
      }

      const botMessage = {
        text: response.data.reply,
        sender: "bot",
        interactionId: response.data.interactionId || null
      };

      // Remove a mensagem de "carregando" e coloca a resposta
      setMessages((prev) => [...prev.slice(0, -1), botMessage]);
    } catch (error) {
      console.error("Erro ao contatar o cérebro do robô:", error);
      const errorMessage = {
        text: "Opa, minha conexão falhou. Tente de novo?",
        sender: "bot"
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Envia feedback 👍 👎
  const handleFeedbackClick = async (interactionId, feedback) => {
    try {
      await apiClient.post("/api/feedback", { interactionId, feedback });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.interactionId === interactionId ? { ...msg, feedback_sent: true } : msg
        )
      );
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    sendMessageToApi(inputValue);
    setInputValue("");
  };

  const handleSuggestionClick = (suggestionText) => {
    sendMessageToApi(`Quais as melhores opções de ${suggestionText}?`);
  };

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-blue-500 dark:bg-blue-600 p-3 text-white flex items-center justify-between shadow-md">
        <button
          onClick={onVoltar}
          className="font-semibold hover:bg-blue-600/40 p-2 rounded-md"
        >
          {"< Voltar"}
        </button>
        <h1 className="text-xl font-semibold">BEPIT Nexus</h1>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      {/* Lista de mensagens */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-2">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`${
                    message.sender === "user"
                      ? "bg-blue-200 dark:bg-blue-700"
                      : "bg-gray-300 dark:bg-gray-700"
                  } text-black dark:text-gray-100 p-2 rounded-lg max-w-xs shadow`}
                >
                  {message.text}
                </div>
              </div>

              {/* Botões de feedback */}
              {message.sender === "bot" &&
                message.interactionId &&
                !message.feedback_sent && (
                  <div className="flex justify-start mt-2 space-x-2 pl-2">
                    <button
                      onClick={() => handleFeedbackClick(message.interactionId, "gostei")}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-transform transform hover:scale-125"
                      title="Gostei da resposta"
                    >
                      👍
                    </button>
                    <button
                      onClick={() =>
                        handleFeedbackClick(message.interactionId, "nao_gostei")
                      }
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-transform transform hover:scale-125"
                      title="Não gostei da resposta"
                    >
                      👎
                    </button>
                  </div>
                )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sugestões */}
      <SuggestionButtons onSuggestionClick={handleSuggestionClick} isLoading={isLoading} />

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 p-4 flex items-center shadow-inner border-t border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder={isLoading ? "Aguarde..." : "Digite sua pergunta..."}
          className="flex-1 border dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          className="bg-blue-500 dark:bg-blue-600 text-white rounded-full p-2 ml-2 hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#ffffff"
          >
            <path
              d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Tela de seleção de Região
 */
function RegionSelectionScreen({ onSelectRegion, theme, setTheme }) {
  const regioesDisponiveis = [
    { nome: "Região dos Lagos", slug: "regiao-dos-lagos" }
    // { nome: "Gramado e Canela", slug: "gramado-canela" },
  ];

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <img src="/bepit-logo.png" alt="Logo BEPIT" className="h-24 w-24 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Bem-vindo ao BEPIT Nexus</h1>
      <p className="mb-8 opacity-80">Qual destino você quer explorar hoje?</p>

      <div className="flex items-center gap-3 mb-6">
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      <div className="w-full max-w-sm flex flex-col space-y-3">
        {regioesDisponiveis.map((regiao) => (
          <button
            key={regiao.slug}
            onClick={() => onSelectRegion(regiao)}
            className="bg-blue-500 dark:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform"
          >
            {regiao.nome}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * App Root
 * - Roteamento simples por pathname para o painel admin
 * - Se não for admin → fluxo normal (seleção de região / chat)
 */
function App() {
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(null);
  const { theme, setTheme } = useTheme();

  // Roteamento simples por URL (sem dependências)
  const path = window.location.pathname;

  // Admin: login
  if (path === "/admin" || path === "/admin/") {
    return <AdminLogin theme={theme} setTheme={setTheme} />;
  }

  // Admin: dashboard
  if (path.startsWith("/admin/dashboard")) {
    return <AdminDashboard theme={theme} setTheme={setTheme} />;
  }

  // Fluxo normal do app (chat)
  if (regiaoSelecionada) {
    return (
      <ChatScreen
        regiao={regiaoSelecionada}
        onVoltar={() => setRegiaoSelecionada(null)}
        theme={theme}
        setTheme={setTheme}
      />
    );
  } else {
    return (
      <RegionSelectionScreen
        onSelectRegion={setRegiaoSelecionada}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }
}

export default App;
