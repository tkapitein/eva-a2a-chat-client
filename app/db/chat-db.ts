import Dexie, { type Table } from "dexie";

export type ChatRecord = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  contextId: string; // used for a2a providerOptions.a2a.contextId
};

export type MessageRecord = {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string; // flattened text content for now
  createdAt: number;
  taskId?: string; // A2A task ID for assistant messages
  taskStatus?: "submitted" | "working" | "completed" | "failed" | "canceled";
};

class ChatDatabase extends Dexie {
  chats!: Table<ChatRecord, string>;
  messages!: Table<MessageRecord, string>;

  constructor() {
    super("eva-a2a-chat-db");
    this.version(1).stores({
      chats: "id, updatedAt, createdAt",
      messages: "id, chatId, createdAt, taskId",
    });
  }
}

let _db: ChatDatabase | null = null;
export function getChatDb(): ChatDatabase {
  if (!_db) {
    _db = new ChatDatabase();
  }
  return _db;
}
