import type { Route } from "./+types/home";
import { getChatDb } from "~/db/chat-db";
import { ChatPage } from "~/components/ChatPage";
import { createNewChat, renameChat, deleteChat } from "~/lib/chat-manager";
import {
  createUserMessage,
  createAssistantPlaceholder,
} from "~/lib/message-handler";
import { streamMessage } from "~/lib/a2a-stream-handler";
import { loadChatData } from "~/lib/chat-loader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <ChatPage />;
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return await loadChatData(request);
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const db = getChatDb();

  if (intent === "new-chat") {
    return await createNewChat(request);
  }

  if (intent === "rename-chat") {
    const chatId = String(form.get("chatId"));
    const title = String(form.get("title") ?? "");
    return await renameChat(chatId, title);
  }

  if (intent === "delete-chat") {
    const chatId = String(form.get("chatId"));
    return await deleteChat(chatId, request);
  }

  if (intent === "send-message") {
    const chatId = String(form.get("chatId"));
    const text = String(form.get("text") ?? "").trim();
    if (!chatId || !text) return { ok: false };

    const chat = await db.chats.get(chatId);
    if (!chat) return { ok: false };

    await createUserMessage(chatId, text);
    const assistantId = await createAssistantPlaceholder(chatId);

    return await streamMessage({ text, chat, assistantId, request });
  }

  return null;
}
