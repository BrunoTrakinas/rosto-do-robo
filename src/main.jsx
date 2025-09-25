import { BrowserRouter, Routes, Route } from "react-router-dom";
import EscolhaRegiao from "./pages/EscolhaRegiao";
import Chat from "./pages/Chat"; // sua página de chat existente

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EscolhaRegiao />} />
        <Route path="/chat/:regiaoSlug" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
