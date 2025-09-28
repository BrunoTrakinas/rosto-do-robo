// /src/components/PreferenceChips.jsx
// ============================================================================
// Componente de "chips" (botões pill) para preferências rápidas de resposta.
// - Exporta por default (resolve o erro do Netlify).
// - Tolerante a diferentes nomes de callback (onSelect, onChip, onPreferenceChange).
// - Não depende de nenhum estado global; usa apenas props opcionais.
// - Visual com Tailwind, consistente com o restante do app.
// ============================================================================

import React from "react";

/**
 * Resolve o callback disponível entre várias opções:
 * - onSelect
 * - onChip
 * - onPreferenceChange
 * Se nenhuma for passada, usa um NO-OP (função vazia).
 */
function getCallbackFromProps(props) {
  const noop = () => {};
  return props.onSelect || props.onChip || props.onPreferenceChange || noop;
}

/**
 * Opcionalmente, você pode passar `disabled` para desativar os chips durante um loading.
 * Também aceita `className` para customização externa.
 *
 * Exemplo de uso:
 * <PreferenceChips
 *   disabled={isLoading}
 *   onSelect={(action) => {
 *     // action será uma das strings abaixo:
 *     // "prefer_partners", "prefer_generic", "free_mode"
 *   }}
 * />
 */
function PreferenceChips(props) {
  const callback = getCallbackFromProps(props);
  const disabled = Boolean(props.disabled);

  const baseButton =
    "px-3 py-1 rounded-full text-sm font-medium border transition " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={`w-full px-4 py-2 flex flex-wrap gap-2 ${props.className || ""}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => callback("prefer_partners")}
        className={`${baseButton} bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900`}
        title="Dar prioridade às indicações locais cadastradas (sem dizer 'parceiro')."
      >
        Minhas indicações
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => callback("prefer_generic")}
        className={`${baseButton} bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700`}
        title="Responder de forma genérica, com base em informações públicas."
      >
        Genéricas da internet
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => callback("free_mode")}
        className={`${baseButton} bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900`}
        title="Conversar livremente dentro do tema turismo local."
      >
        Só responder livremente
      </button>
    </div>
  );
}

export default PreferenceChips;