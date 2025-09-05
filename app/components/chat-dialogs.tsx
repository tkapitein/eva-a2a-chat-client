import * as React from "react";
import { useFetcher, type FetcherWithComponents } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { ChatRecord } from "~/db/chat-db";

interface RenameChatDialogProps {
  chat: ChatRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameChatDialog({
  chat,
  open,
  onOpenChange,
}: RenameChatDialogProps) {
  const [name, setName] = React.useState("");
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  React.useEffect(() => {
    if (chat && open) {
      setName(chat.title);
    }
  }, [chat, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chat || !name.trim()) return;

    const formData = new FormData();
    formData.append("intent", "rename-chat");
    formData.append("chatId", chat.id);
    formData.append("title", name.trim());
    
    fetcher.submit(formData, { method: "post" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Chat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chat-name">Chat Name</Label>
              <Input
                id="chat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter chat name..."
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteChatDialogProps {
  chat: ChatRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetcher?: FetcherWithComponents<any>;
  activeChatId?: string | null;
}

export function DeleteChatDialog({
  chat,
  open,
  onOpenChange,
  fetcher: propFetcher,
  activeChatId,
}: DeleteChatDialogProps) {
  const defaultFetcher = useFetcher();
  const fetcher = propFetcher || defaultFetcher;
  const isSubmitting = fetcher.state === "submitting";

  const handleDelete = () => {
    if (!chat) return;

    const formData = new FormData();
    formData.append("intent", "delete-chat");
    formData.append("chatId", chat.id);
    if (activeChatId) {
      formData.append("activeChatId", activeChatId);
    }
    
    fetcher.submit(formData, { method: "post" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Chat</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete "{chat?.title}"? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}