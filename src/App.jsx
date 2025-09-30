import React, { useEffect, useRef, useState } from "react";
import SuggestionButtons from "./components/SuggestionButtons.jsx";
// Caso tenha um apiClient centralizado, você pode trocar os fetch diretos por ele.

export default function App() {
  const [regiaoSlug, setRegiaoSlug] = useState("regiao-dos-lagos"); // ajuste se você já tiver seleção de região em outro fluxo
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]); // { role: "user"|"assistant", text: string }
  const [photos, setPhotos] = useState([]);     // array de URLs vindas do backend
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, photos]);

  async function enviarMensagem(textoManual) {
    const texto = (textoManual ?? input).trim();
    if (!texto || loading) return;

    const novaMsgUser = { role: "user", text: texto };
    setMessages(prev => [...prev, novaMsgUser]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`/api/chat/${encodeURIComponent(regiaoSlug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texto, conversationId })
      });

      if (!resp.ok) {
        const erro = await resp.json().catch(() => ({}));
        const msgErro = erro?.error || `Falha HTTP ${resp.status}`;
        setMessages(prev => [...prev, { role: "assistant", text: `Desculpe, ocorreu um erro: ${msgErro}` }]);
        setLoading(false);
        return;
      }

      const data = await resp.json();
      if (!conversationId && data?.conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages(prev => [...prev, { role: "assistant", text: data?.reply || "..." }]);
      setPhotos(Array.isArray(data?.photoLinks) ? data.photoLinks : []);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: `Erro de rede: ${e?.message || e}` }]);
    } finally {
      setLoading(false);
    }
  }

  function onEnterEnviar(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  }

  function onSuggestionClick(texto) {
    // Você pode apenas preencher o input, ou enviar direto:
    setInput(texto);
    enviarMensagem(texto);
  }

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", height: "100vh", overflow: "hidden" }}>
      {/* Header simples e seletor de região (placeholder) */}
      <header style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>BEPIT Nexus</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <label htmlFor="regiao">Região:</label>
          <select
            id="regiao"
            value={regiaoSlug}
            onChange={e => setRegiaoSlug(e.target.value)}
            style={{ padding: 6, borderRadius: 6, border: "1px solid #ddd" }}
          >
            <option value="regiao-dos-lagos">Região dos Lagos</option>
            {/* Adicione outras regiões se já tiver cadastradas */}
          </select>
        </div>
      </header>

      {/* Área do chat */}
      <main style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 8 }}>
        {/* Botões de sugestão (mantidos) */}
        <SuggestionButtons onSuggestionClick={onSuggestionClick} isLoading={loading} />

        <div ref={listRef} style={{ overflowY: "auto", padding: 12 }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#888" }}>{m.role === "user" ? "Você" : "BEPIT"}</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
          ))}

          {photos?.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 8,
                marginTop: 12
              }}
            >
              {photos.map((src, i) => (
                <a
                  key={i}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "block", border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}
                >
                  <img
                    src={src}
                    alt={`foto-${i + 1}`}
                    style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Caixa de entrada — sem PreferenceChips (FIX 4) */}
      <footer style={{ padding: 12, borderTop: "1px solid #eee" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onEnterEnviar}
            placeholder="Pergunte: 'pizzaria barata em Cabo Frio', 'passeio de barco', ou selecione um sugerido acima."
            rows={2}
            style={{ resize: "none", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <button
            onClick={() => enviarMensagem()}
            disabled={loading || !input.trim()}
            style={{
              padding: "0 18px",
              borderRadius: 8,
              border: "1px solid #222",
              background: loading ? "#999" : "#222",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600
            }}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </footer>
    </div>
  );
}