import React, { useEffect, useState } from "react";
import applicationProgrammingInterfaceClient from "./lib/apiClient";
import "./App.css";
import bepitLogoImage from "./bepit-logo.png";

function Application() {
  const [userInterfaceMessages, setUserInterfaceMessages] = useState([]);
  const [userInterfaceInputText, setUserInterfaceInputText] = useState("");

  useEffect(() => {
    setUserInterfaceMessages([
      {
        sender: "bot",
        text: '👋 Olá, seja muito bem-vindo(a)! Eu sou o BEPIT Nexus, seu guia sincero da Região dos Lagos. ✨Me diga, como posso te ajudar hoje?'
      }
    ]);
  }, []);

  async function handleSendMessageToRobotBrain() {
    const trimmedText = userInterfaceInputText.trim();
    if (trimmedText.length === 0) {
      return;
    }

    const newUserMessage = {
      sender: "user",
      text: trimmedText
    };

    setUserInterfaceMessages((previousMessages) => [...previousMessages, newUserMessage]);
    setUserInterfaceInputText("");

    try {
      const serverResponse = await applicationProgrammingInterfaceClient.post("/api/chat", {
        message: trimmedText
      });

      const robotReplyText =
        typeof serverResponse?.data?.reply === "string" ? serverResponse.data.reply : "";

      const newRobotMessage = {
        sender: "bot",
        text: robotReplyText || "Sem resposta disponível no momento."
      };

      setUserInterfaceMessages((previousMessages) => [...previousMessages, newRobotMessage]);
    } catch (error) {
      console.error("Erro ao contatar o cérebro do robô:", {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        data: error?.response?.data
      });

      const errorRobotMessage = {
        sender: "bot",
        text:
          "Desculpe, estou com um pouco de dor de cabeça agora. Tente novamente em instantes."
      };

      setUserInterfaceMessages((previousMessages) => [...previousMessages, errorRobotMessage]);
    }
  }

  function handleUserInterfaceInputKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessageToRobotBrain();
    }
  }

  return (
    <div className="bg-gray-100 h-[90vh] flex flex-col max-w-lg mx-auto overflow-hidden">
      <div className="bg-blue-500 p-3 text-white flex items-center justify-center shadow-md">
        <img src={bepitLogoImage} alt="Logomarca BEPIT" className="h-8 w-8 mr-2" />
        <h1 className="text-xl font-semibold">BEPIT Chat</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-2">
          {userInterfaceMessages.map((currentMessage, currentIndex) => (
            <div
              key={`message-${currentIndex}`}
              className={`flex ${
                currentMessage.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`${
                  currentMessage.sender === "user" ? "bg-blue-200" : "bg-gray-300"
                } text-black p-2 rounded-lg max-w-xs shadow`}
              >
                {currentMessage.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 flex items-center shadow-inner">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Digite sua mensagem"
          value={userInterfaceInputText}
          onChange={(event) => setUserInterfaceInputText(event.target.value)}
          onKeyDown={handleUserInterfaceInputKeyDown}
        />
        <button
          className="bg-blue-500 text-white rounded-full p-2 ml-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="button"
          title="Enviar mensagem"
          aria-label="Enviar mensagem"
          onClick={handleSendMessageToRobotBrain}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#ffffff"
            aria-hidden="true"
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

export default Application;
