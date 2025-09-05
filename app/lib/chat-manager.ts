import { getChatDb, type ChatRecord } from "~/db/chat-db";

export async function createNewChat(request: Request): Promise<never> {
  const db = getChatDb();
  const id = crypto.randomUUID();
  const now = Date.now();
  const chat: ChatRecord = {
    id,
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    contextId: id,
  };
  await db.chats.add(chat);
  
  const url = new URL(request.url);
  url.searchParams.set("chat", id);
  const { redirect } = await import("react-router");
  throw redirect(url.toString());
}

export async function renameChat(chatId: string, title: string): Promise<{ ok: boolean }> {
  const db = getChatDb();
  if (!chatId || !title.trim()) return { ok: false };

  await db.chats.update(chatId, {
    title: title.trim(),
    updatedAt: Date.now(),
  });
  return { ok: true };
}

export async function deleteChat(chatId: string, request: Request): Promise<{ ok: boolean } | never> {
  const db = getChatDb();
  const url = new URL(request.url);
  const activeChatId = url.searchParams.get("chat");
  
  if (!chatId) return { ok: false };

  await db.messages.where("chatId").equals(chatId).delete();
  await db.chats.delete(chatId);

  if (chatId === activeChatId) {
    const remainingChats = await db.chats.orderBy("updatedAt").reverse().toArray();
    
    if (remainingChats.length > 0) {
      url.searchParams.set("chat", remainingChats[0].id);
    } else {
      url.searchParams.delete("chat");
    }
    
    const { redirect } = await import("react-router");
    throw redirect(url.toString());
  }

  return { ok: true };
}