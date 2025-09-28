// F:\uber-chat-mvp\rosto-do-robo\src\App.jsx
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import React, { useState, useEffect, useRef } from "react";
import apiClient from "./lib/apiClient";
import SuggestionButtons from "./components/SuggestionButtons";
import PreferenceChips from "./components/PreferenceChips";
import "./App.css";

/**
 * Hook de tema (claro/escuro) com Tailwind (darkMode: "class")
 */
function useTheme() {
  const [temaAtual, definirTemaAtual] = useState(() => {
    const salvo = localStorage.getItem("theme");
    return salvo === "dark" ? "dark" : "light";
  });
  useEffect(() => {
    const raiz = document.documentElement;
    if (temaAtual === "dark") raiz.classList.add("dark");
    else raiz.classList.remove("dark");
    localStorage.setItem("theme", temaAtual);
  }, [temaAtual]);
  return { temaAtual, definirTemaAtual };
}

function BotaoAlternarTema({ temaAtual, definirTemaAtual }) {
  const alternar = () => definirTemaAtual(temaAtual === "dark" ? "light" : "dark");
  return (
    <button
      onClick={alternar}
      className="px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 border border-white/30"
      title={temaAtual === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {temaAtual === "dark" ? "☀️ Claro" : "🌙 Escuro"}
    </button>
  );
}

/**
 * Tela de Chat
 */
function TelaDeChat({ regiaoSelecionada, aoVoltar, temaAtual, definirTemaAtual }) {
  const [listaDeMensagens, definirListaDeMensagens] = useState([]);
  const [valorDoInput, definirValorDoInput] = useState("");
  const [carregandoResposta, definirCarregandoResposta] = useState(false);
  const [idDaConversa, definirIdDaConversa] = useState(null);

  const referenciaFinalDasMensagens = useRef(null);

  useEffect(() => {
    definirListaDeMensagens([
      {
        remetente: "bot",
        texto: `Olá! Eu sou seu concierge local. Posso orientar sobre **roteiros, transporte, passeios, praias e onde comer**. O que você quer saber primeiro?`
      }
    ]);
  }, [regiaoSelecionada]);

  useEffect(() => {
    referenciaFinalDasMensagens.current?.scrollIntoView({ behavior: "smooth" });
  }, [listaDeMensagens]);

  async function enviarMensagemParaApi(texto) {
    if (carregandoResposta) return;

    const mensagemDoUsuario = { texto, remetente: "usuario" };
    const mensagemDeCarregamento = { remetente: "bot", texto: "Pensando..." };

    definirListaDeMensagens((anterior) => [...anterior, mensagemDoUsuario, mensagemDeCarregamento]);
    definirCarregandoResposta(true);

    try {
      const corpo = { message: texto };
      if (idDaConversa) corpo.conversationId = idDaConversa;

      const respostaApi = await apiClient.enviarMensagemParaChat(regiaoSelecionada.slug, corpo);

      const novoIdDaConversa = respostaApi.data.conversationId || idDaConversa || null;
      if (novoIdDaConversa && novoIdDaConversa !== idDaConversa) definirIdDaConversa(novoIdDaConversa);

      const mensagemDoBot = {
        texto: respostaApi.data.reply,
        remetente: "bot",
        interactionId: respostaApi.data.interactionId || null,
        photoLinks: Array.isArray(respostaApi.data.photoLinks) ? respostaApi.data.photoLinks : []
      };

      definirListaDeMensagens((anterior) => [...anterior.slice(0, -1), mensagemDoBot]);
    } catch (erro) {
      console.error("Erro ao contatar o servidor:", {
        message: erro?.message,
        code: erro?.code,
        name: erro?.name,
        url: erro?.config?.url,
        method: erro?.config?.method,
        status: erro?.response?.status,
        statusText: erro?.response?.statusText,
        data: erro?.response?.data
      });
      const mensagemDeErro = { remetente: "bot", texto: "Opa, minha conexão falhou. Pode tentar novamente?" };
      definirListaDeMensagens((anterior) => [...anterior.slice(0, -1), mensagemDeErro]);
    } finally {
      definirCarregandoResposta(false);
    }
  }

  async function enviarFeedbackDeClique(idDaInteracao, feedback) {
    try {
      await apiClient.enviarFeedbackDaInteracao({ interactionId: idDaInteracao, feedback });
      definirListaDeMensagens((anterior) =>
        anterior.map((msg) => (msg.interactionId === idDaInteracao ? { ...msg, feedbackEnviado: true } : msg))
      );
    } catch (erro) {
      console.error("Erro ao enviar feedback:", erro);
    }
  }

  function acionarEnvioDaMensagem() {
    if (valorDoInput.trim() === "") return;
    enviarMensagemParaApi(valorDoInput);
    definirValorDoInput("");
  }

  function aoClicarSugestao(textoSugestao) {
    enviarMensagemParaApi(`Quais são as melhores opções de ${textoSugestao}?`);
  }

  async function aoDefinirPreferencia(preferencia) {
    if (!idDaConversa) {
      definirListaDeMensagens((anterior) => [
        ...anterior,
        { remetente: "bot", texto: "Envie uma primeira mensagem para eu criar a conversa e salvar sua preferência, por favor." }
      ]);
      return;
    }
    try {
      await apiClient.definirPreferenciaDaConversa({ conversationId: idDaConversa, preference: preferencia });
      const textoConfirmacao =
        preferencia === "locais"
          ? "Beleza! Vou priorizar minhas indicações locais quando você pedir sugestões."
          : "Combinado! Quando você pedir sugestões, trago opções genéricas da internet.";
      definirListaDeMensagens((anterior) => [...anterior, { remetente: "bot", texto: textoConfirmacao }]);
    } catch (erro) {
      console.error("Erro ao salvar preferência:", erro);
      definirListaDeMensagens((anterior) => [
        ...anterior,
        { remetente: "bot", texto: "Não consegui salvar sua preferência agora. Pode tentar novamente?" }
      ]);
    }
  }

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Cabeçalho */}
      <div className="bg-blue-500 dark:bg-blue-600 p-3 text-white flex items-center justify-between shadow-md">
        <button onClick={aoVoltar} className="font-semibold hover:bg-blue-600/40 p-2 rounded-md">
          {"< Voltar"}
        </button>
        <h1 className="text-xl font-semibold">BEPIT Nexus</h1>
        <BotaoAlternarTema temaAtual={temaAtual} definirTemaAtual={definirTemaAtual} />
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-3">
          {listaDeMensagens.map((mensagem, indice) => (
            <div key={indice} className="space-y-2">
              <div className={`flex ${mensagem.remetente === "usuario" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`${
                    mensagem.remetente === "usuario"
                      ? "bg-blue-200 dark:bg-blue-700"
                      : "bg-gray-300 dark:bg-gray-700"
                  } text-black dark:text-gray-100 p-2 rounded-lg max-w-xs shadow whitespace-pre-wrap`}
                >
                  {mensagem.texto}
                </div>
              </div>

              {/* Galeria de fotos do backend */}
              {mensagem.remetente === "bot" && Array.isArray(mensagem.photoLinks) && mensagem.photoLinks.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pl-2">
                  {mensagem.photoLinks.slice(0, 6).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={url}
                        alt={`Foto ${i + 1}`}
                        className="w-full h-24 object-cover rounded-md border border-white/20"
                        onError={(evento) => { evento.currentTarget.style.display = "none"; }}
                      />
                    </a>
                  ))}
                </div>
              )}

              {/* Feedback */}
              {mensagem.remetente === "bot" && mensagem.interactionId && !mensagem.feedbackEnviado && (
                <div className="flex justify-start mt-1 space-x-2 pl-2">
                  <button
                    onClick={() => enviarFeedbackDeClique(mensagem.interactionId, "gostei")}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-transform transform hover:scale-125"
                    title="Gostei da resposta"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => enviarFeedbackDeClique(mensagem.interactionId, "nao_gostei")}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-transform transform hover:scale-125"
                    title="Não gostei da resposta"
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
          ))}
          <div ref={referenciaFinalDasMensagens} />
        </div>
      </div>

      {/* Chips de preferência (uma barra simples e direta) */}
      <PreferenceChips
        conversacaoId={idDaConversa}
        onDefinirPreferencia={aoDefinirPreferencia}
        desabilitado={carregandoResposta}
      />

      {/* Sugestões rápidas */}
      <SuggestionButtons onSuggestionClick={aoClicarSugestao} isLoading={carregandoResposta} />

      {/* Campo de entrada */}
      <div className="bg-white dark:bg-gray-800 p-4 flex items-center shadow-inner border-t border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder={carregandoResposta ? "Aguarde..." : "Digite sua pergunta... (ex.: roteiro 2 dias em Arraial, restaurante em Cabo Frio)"}
          className="flex-1 border dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={valorDoInput}
          onChange={(evento) => definirValorDoInput(evento.target.value)}
          onKeyDown={(evento) => { if (evento.key === "Enter") acionarEnvioDaMensagem(); }}
          disabled={carregandoResposta}
        />
        <button
          onClick={acionarEnvioDaMensagem}
          disabled={carregandoResposta}
          className="bg-blue-500 dark:bg-blue-600 text-white rounded-full p-2 ml-2 hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400"
          title="Enviar mensagem"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
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
function TelaDeSelecaoDeRegiao({ aoSelecionarRegiao, temaAtual, definirTemaAtual }) {
  const listaDeRegioesDisponiveis = [
    { nome: "Região dos Lagos", slug: "regiao-dos-lagos" }
  ];
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <img src="/bepit-logo.png" alt="Logo BEPIT" className="h-24 w-24 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Bem-vindo ao BEPIT Nexus</h1>
      <p className="mb-8 opacity-80">Qual destino você quer explorar hoje?</p>
      <div className="flex items-center gap-3 mb-6">
        <BotaoAlternarTema temaAtual={temaAtual} definirTemaAtual={definirTemaAtual} />
      </div>
      <div className="w-full max-w-sm flex flex-col space-y-3">
        {listaDeRegioesDisponiveis.map((regiao) => (
          <button
            key={regiao.slug}
            onClick={() => aoSelecionarRegiao(regiao)}
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
 */
function App() {
  const [regiaoSelecionada, definirRegiaoSelecionada] = useState(null);
  const { temaAtual, definirTemaAtual } = useTheme();

  const caminho = window.location.pathname;
  if (caminho === "/admin" || caminho === "/admin/") return <AdminLogin theme={temaAtual} setTheme={definirTemaAtual} />;
  if (caminho.startsWith("/admin/dashboard")) return <AdminDashboard theme={temaAtual} setTheme={definirTemaAtual} />;

  if (regiaoSelecionada) {
    return (
      <TelaDeChat
        regiaoSelecionada={regiaoSelecionada}
        aoVoltar={() => definirRegiaoSelecionada(null)}
        temaAtual={temaAtual}
        definirTemaAtual={definirTemaAtual}
      />
    );
  } else {
    return (
      <TelaDeSelecaoDeRegiao
        aoSelecionarRegiao={definirRegiaoSelecionada}
        temaAtual={temaAtual}
        definirTemaAtual={definirTemaAtual}
      />
    );
  }
}

export default App;