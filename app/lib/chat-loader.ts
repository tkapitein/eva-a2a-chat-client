import { getChatDb, type ChatRecord } from "~/db/chat-db";
import { areSettingsConfigured } from "~/components/settings-dialog";

export async function loadChats(): Promise<ChatRecord[]> {
  const db = getChatDb();
  return await db.chats.orderBy("updatedAt").reverse().toArray();
}

export async function getSettingsConfiguration(): Promise<boolean> {
  return areSettingsConfigured();
}

export async function handleChatRedirect(request: Request, chats: ChatRecord[]): Promise<never | null> {
  const url = new URL(request.url);
  const chatParam = url.searchParams.get("chat");
  
  // If no chat param but chats exist, redirect to the most recent chat
  if (!chatParam && chats.length > 0) {
    const { redirect } = await import("react-router");
    url.searchParams.set("chat", chats[0].id);
    throw redirect(url.toString());
  }
  
  return null;
}

export interface LoaderData {
  chats: ChatRecord[];
  activeChatId: string | null;
  settingsConfigured: boolean;
}

export async function loadChatData(request: Request): Promise<LoaderData> {
  const url = new URL(request.url);
  const chatParam = url.searchParams.get("chat");
  const chats = await loadChats();
  const settingsConfigured = await getSettingsConfiguration();
  
  await handleChatRedirect(request, chats);
  
  const activeChatId = chatParam ?? null;
  return { chats, activeChatId, settingsConfigured };
}