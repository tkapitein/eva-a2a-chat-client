import { getChatDb, type MessageRecord } from "~/db/chat-db";

export function getStatusIcon(state: string): string {
  switch (state) {
    case "submitted":
      return "📝";
    case "working":
      return "⚙️";
    case "completed":
      return "✅";
    case "failed":
      return "❌";
    case "canceled":
      return "🚫";
    default:
      return "🔄";
  }
}

export async function createUserMessage(chatId: string, text: string): Promise<MessageRecord> {
  const db = getChatDb();
  const now = Date.now();
  const userMessage: MessageRecord = {
    id: crypto.randomUUID(),
    chatId,
    role: "user",
    content: text,
    createdAt: now,
  };
  
  await db.messages.add(userMessage);
  
  const chat = await db.chats.get(chatId);
  if (chat) {
    await db.chats.update(chatId, {
      updatedAt: now,
      title: chat.title === "New chat" ? text.slice(0, 40) : chat.title,
    });
  }
  
  return userMessage;
}

export async function createAssistantPlaceholder(chatId: string): Promise<string> {
  const db = getChatDb();
  const assistantId = crypto.randomUUID();
  const base: MessageRecord = {
    id: assistantId,
    chatId,
    role: "assistant",
    content: "🔄 Starting task...",
    createdAt: Date.now(),
    taskStatus: "submitted",
  };
  await db.messages.add(base);
  return assistantId;
}

export async function updateMessage(messageId: string, updates: Partial<MessageRecord>): Promise<void> {
  const db = getChatDb();
  await db.messages.update(messageId, updates);
}

export async function appendToMessage(messageId: string, chunk: string): Promise<void> {
  const db = getChatDb();
  const current = await db.messages.get(messageId);
  await db.messages.update(messageId, {
    content: (current?.content ?? "") + chunk,
  });
}