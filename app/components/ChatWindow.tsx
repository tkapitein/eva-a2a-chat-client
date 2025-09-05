import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getChatDb, type ChatRecord, type MessageRecord } from "~/db/chat-db";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import Markdown from "react-markdown";
import { ArrowUpIcon } from "lucide-react";
import { useId } from "react";
import { useFetcher } from "react-router";
import { MarkdownComponents } from "./ui/markdown-components";

interface ChatWindowProps {
  chatId: string;
  chatEnabled?: boolean;
  shouldFocus?: boolean;
}

export function ChatWindow({
  chatId,
  chatEnabled = true,
  shouldFocus = false,
}: ChatWindowProps) {
  const [input, setInput] = React.useState("");
  const textareaId = useId();
  const sendFetcher = useFetcher();
  const { textareaRef, handleInputChange } = useAutoResizeTextarea(
    input,
    setInput
  );

  const chat = useLiveQuery(
    () =>
      typeof indexedDB === "undefined"
        ? Promise.resolve(undefined as ChatRecord | undefined)
        : getChatDb().chats.get(chatId),
    [chatId]
  );
  const messages = useLiveQuery(
    () =>
      typeof indexedDB === "undefined"
        ? Promise.resolve([] as MessageRecord[])
        : getChatDb().messages.where({ chatId }).sortBy("createdAt"),
    [chatId],
    []
  );
  const { messagesEndRef } = useAutoScrollToMessages(messages);

  React.useEffect(() => {
    if (shouldFocus && textareaRef.current && chatEnabled) {
      textareaRef.current.focus();
    }
  }, [shouldFocus, chatEnabled]);

  const sendMessage = React.useCallback(async () => {
    const text = input.trim();
    if (!text || !chat || !chatEnabled) return;
    setInput("");
    const fd = new FormData();
    fd.append("intent", "send-message");
    fd.append("chatId", chatId);
    fd.append("text", text);
    sendFetcher.submit(fd, { method: "post" });
  }, [chatId, input, chat, chatEnabled, sendFetcher]);

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      void sendMessage();
    },
    [sendMessage]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div className="w-full h-[100svh] flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-5">
            {(messages || []).map((m, index) => (
              <div
                key={m.id}
                className={index === messages.length - 1 ? "scroll-mb-8" : ""}
              >
                {m.role === "user" ? (
                  <div className="ml-auto w-fit max-w-[75ch] rounded-2xl px-4 py-2 shadow-sm bg-primary text-primary-foreground">
                    <Markdown components={MarkdownComponents}>
                      {m.content}
                    </Markdown>
                  </div>
                ) : (
                  <div className="mr-auto max-w-[75ch] leading-7 text-[15px]">
                    <Markdown components={MarkdownComponents}>
                      {m.content}
                    </Markdown>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>
      </div>

      <div className="shrink-0 border-t bg-background -mb-1">
        <form onSubmit={handleSubmit} className="relative w-full">
          <textarea
            id={textareaId}
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              chatEnabled
                ? "Send a message..."
                : "Configure settings to enable chat"
            }
            rows={1}
            className="pr-11 min-h-[46px] pl-4 pt-3 text-sm mb-0 resize-none w-full max-w-none border-0"
            disabled={!chatEnabled}
          />
          <div className="absolute right-3 bottom-3 z-10">
            <Button
              type="submit"
              size="icon"
              className="size-8"
              disabled={!input.trim() || !chatEnabled}
              aria-label="Send"
            >
              <ArrowUpIcon className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function useAutoResizeTextarea(
  input: string,
  setInput: (value: string) => void
) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
        const maxPx = 160;
        el.style.height = Math.min(el.scrollHeight, maxPx) + "px";
      }
    },
    [setInput]
  );

  React.useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      const maxPx = 160;
      el.style.height = Math.min(el.scrollHeight, maxPx) + "px";
    }
  }, []);

  return { textareaRef, handleInputChange };
}

function useAutoScrollToMessages(messages: MessageRecord[] | undefined) {
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const lastAgentMessage = messages
      ?.filter((m) => m.role === "assistant")
      .pop();
    if (lastAgentMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);

  return { messagesEndRef };
}
