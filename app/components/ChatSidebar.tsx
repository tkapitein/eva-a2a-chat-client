import { type ChatRecord } from "~/db/chat-db";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontalIcon, EditIcon, TrashIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "~/components/ui/sidebar";
import { SettingsDialog } from "~/components/settings-dialog";

interface ChatSidebarProps {
  activeChatId: string | null;
  settingsConfigured: boolean;
  chats: ChatRecord[] | undefined;
  onNewChat: () => void;
  onSelectChat: (id: string) => () => void;
  onRenameChat: (chat: ChatRecord) => void;
  onDeleteChat: (chat: ChatRecord) => void;
}

export function ChatSidebar({
  activeChatId,
  settingsConfigured,
  chats,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col h-full">
        <div className="flex-1">
          <SidebarGroup>
            <Button
              variant="secondary"
              onClick={onNewChat}
              disabled={!settingsConfigured}
              title={
                !settingsConfigured
                  ? "Please configure settings first"
                  : undefined
              }
            >
              New chat
            </Button>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {chats?.map((c) => (
                  <SidebarMenuItem key={c.id}>
                    <div className="flex items-center w-full relative group/item">
                      <SidebarMenuButton
                        isActive={activeChatId === c.id}
                        onClick={() => {
                          onSelectChat(c.id)();
                          if (isMobile) setOpenMobile(false);
                        }}
                        className="flex-1 min-w-0"
                      >
                        <span className="truncate">{c.title}</span>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-1"
                          >
                            <MoreHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Chat options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onRenameChat(c);
                            }}
                          >
                            <EditIcon className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(c);
                            }}
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
        <div className="mt-auto">
          <SidebarSeparator />
          <SidebarGroup>
            <SettingsDialog />
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
