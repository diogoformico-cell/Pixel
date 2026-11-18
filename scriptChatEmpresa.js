// NEXOR - assistente gamer integrado à API da OpenAI (Responses API)

const API_URL = "https://api.openai.com/v1/responses";
const MODEL = "gpt-5.4-nano";

const SYSTEM_INSTRUCTIONS = `
Você é um chatbot da empresa PixelNova. Seu nome é NEXOR.
Sua função é auxiliar com dúvidas referentes ao universo gamer da loja:
games, periféricos (mouse, teclado e headset), roupas e moda gamer,
acessórios, decoração e montagem de setup.
Responda sempre em português, com clareza e completude. Não corte frases nem deixe respostas pela metade. Ajuste o tamanho da resposta à pergunta; explique em detalhes quando necessário.
Aceite perguntas de saudação e responda cordialmente.
Para perguntas que não sejam de saudação nem estejam relacionadas ao universo
gamer, responda exatamente:
"Estou configurado para auxiliar no universo gamer da PixelNova. Esta pergunta foge do meu contexto".
Não invente preços, estoque, promoções ou características específicas de produtos.
Se não houver informação suficiente sobre um produto, oriente a pessoa a consultar
a página de itens da PixelNova.
`;

const apiKeyInput = document.getElementById("api-key");
const messageInput = document.getElementById("user-message");
const chatForm = document.getElementById("chat-form");
const sendButton = document.getElementById("send-button");
const messagesContainer = document.getElementById("chat-messages");
const statusMessage = document.getElementById("status-message");

// O histórico fica apenas na memória desta página e é apagado ao recarregá-la.
const conversationHistory = [];

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `message ${sender === "user" ? "user-message" : "bot-message"}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = sender === "user" ? "U" : "✦";

  const content = document.createElement("div");
  content.className = "message-content";

  const name = document.createElement("span");
  name.className = "sender";
  name.textContent = sender === "user" ? "VOCÊ" : "NEXOR";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  content.append(name, paragraph);
  message.append(avatar, content);
  messagesContainer.appendChild(message);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function extractResponseText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const parts = [];
  for (const item of (data.output || [])) {
    if (item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content.type === "output_text" && content.text) {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

function showApiError(errorData, status) {
  const apiMessage = errorData?.error?.message;
  if (status === 401) return "Chave de API inválida. Confira o token informado.";
  if (status === 429) return "Limite ou créditos da API atingidos. Verifique sua conta OpenAI.";
  if (status === 400) return apiMessage || "A solicitação foi rejeitada. Confira o modelo e os parâmetros.";
  return apiMessage || `Não foi possível concluir a solicitação (HTTP ${status}).`;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const apiKey = apiKeyInput.value.trim();
  const userText = messageInput.value.trim();

  if (!apiKey) {
    statusMessage.textContent = "Digite sua chave de API antes de enviar a mensagem.";
    apiKeyInput.focus();
    return;
  }

  if (!userText) {
    statusMessage.textContent = "Digite uma mensagem para o NEXOR.";
    messageInput.focus();
    return;
  }

  addMessage(userText, "user");
  conversationHistory.push({ role: "user", content: userText });
  messageInput.value = "";
  messageInput.style.height = "auto";
  sendButton.disabled = true;
  sendButton.querySelector("span").textContent = "Conectando...";
  statusMessage.textContent = "O NEXOR está preparando uma resposta...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: SYSTEM_INSTRUCTIONS,
        input: conversationHistory,
        temperature: 0.3,
        max_output_tokens: 1200
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(showApiError(data, response.status));
    }

    const answer = extractResponseText(data);
    if (!answer) {
      throw new Error("A API não retornou uma resposta em texto. Tente novamente.");
    }

    addMessage(answer, "bot");
    conversationHistory.push({ role: "assistant", content: answer });
    statusMessage.textContent = "Resposta recebida com sucesso.";
  } catch (error) {
    // Remove a última pergunta do histórico para permitir uma nova tentativa.
    conversationHistory.pop();
    statusMessage.textContent = error.message || "Erro de conexão com a API.";
    addMessage(`Não consegui responder: ${statusMessage.textContent}`, "bot");
  } finally {
    sendButton.disabled = false;
    sendButton.querySelector("span").textContent = "Enviar mensagem";
    messageInput.focus();
  }
});

// A caixa cresce para mostrar todo o texto; Enter cria uma nova linha.
function resizeMessageInput() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 220)}px`;
}
messageInput.addEventListener("input", resizeMessageInput);
// Ctrl + Enter (ou Cmd + Enter) envia a mensagem.
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});
