import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getChatDb, type ChatRecord } from "~/db/chat-db";
import { Text } from "~/components/ui/text";
import { RenameChatDialog, DeleteChatDialog } from "~/components/chat-dialogs";
import { SettingsNotConfigured } from "~/components/SettingsNotConfigured";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { useFetcher, useLoaderData, useSearchParams } from "react-router";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";

interface ChatPageProps {
  loaderData: {
    chats: ChatRecord[];
    activeChatId: string | null;
    settingsConfigured: boolean;
  };
}

export function ChatPage() {
  const [isClient, setIsClient] = React.useState(false);
  const loaderData = useLoaderData() as ChatPageProps["loaderData"];
  const settingsConfigured = loaderData.settingsConfigured;
  const [searchParams, setSearchParams] = useSearchParams();
  const newChatFetcher = useFetcher<{ chatId: string }>();
  const deleteChatFetcher = useFetcher<{ ok: boolean }>();
  const activeChatId = searchParams.get("chat") ?? loaderData.activeChatId ?? null;
  const [renameChat, setRenameChat] = React.useState<ChatRecord | null>(null);
  const [deleteChat, setDeleteChat] = React.useState<ChatRecord | null>(null);
  const chats = useLiveQuery(
    () =>
      typeof indexedDB === "undefined"
        ? Promise.resolve([] as ChatRecord[])
        : getChatDb().chats.orderBy("updatedAt").reverse().toArray(),
    [],
    []
  );

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNewChat = React.useCallback(async () => {
    const fd = new FormData();
    fd.append("intent", "new-chat");
    newChatFetcher.submit(fd, { method: "post" });
  }, [newChatFetcher]);



  const selectChat = React.useCallback(
    (id: string) => () => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("chat", id);
          return next;
        },
        { replace: false }
      );
    },
    [setSearchParams]
  );

  const renderContent = () => {
    if (!isClient) {
      return (
        <div className="w-full h-full grid place-items-center">
          <Text variant="h4" className="text-muted-foreground">
            Loading…
          </Text>
        </div>
      );
    }

    if (!settingsConfigured) {
      return <SettingsNotConfigured />;
    }

    if (activeChatId) {
      return (
        <ChatWindow
          chatId={activeChatId}
          chatEnabled={settingsConfigured}
          shouldFocus={newChatFetcher.data?.chatId === activeChatId}
        />
      );
    }

    return (
      <div className="w-full h-full grid place-items-center">
        <Text variant="h3" className="text-muted-foreground">
          Start a new chat
        </Text>
      </div>
    );
  };

  return (
    <SidebarProvider defaultOpen>
      <ChatSidebar
        activeChatId={activeChatId}
        settingsConfigured={settingsConfigured}
        chats={chats}
        onNewChat={handleNewChat}
        onSelectChat={selectChat}
        onRenameChat={setRenameChat}
        onDeleteChat={setDeleteChat}
      />
      <SidebarInset className="relative">
        <SidebarTrigger
          aria-label="Toggle sidebar"
          className="absolute top-4 left-4 z-50"
        />
        <div className="w-full h-[100svh] bg-gradient-blobs flex">
          {renderContent()}
        </div>
      </SidebarInset>
      <RenameChatDialog
        chat={renameChat}
        open={!!renameChat}
        onOpenChange={(open) => !open && setRenameChat(null)}
      />
      <DeleteChatDialog
        chat={deleteChat}
        open={!!deleteChat}
        onOpenChange={(open) => !open && setDeleteChat(null)}
        fetcher={deleteChatFetcher}
        activeChatId={activeChatId}
      />
    </SidebarProvider>
  );
}